import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity.js';
import { Order, OrderStatus } from '../orders/entities/orders.entity.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto.js';
import { isUniqueViolation } from '../common/utils/db-errors.js';

@Injectable()
export class PaymentsService {
    constructor(
        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>,
        private readonly dataSource: DataSource,
    ) {}

    async findAll(orderId?: string): Promise<Payment[]> {
        return await this.paymentRepository.find({
            where: orderId ? { orderId } : {},
            order: { createdAt: 'DESC' },
        });
    }

    async findById(id: string): Promise<Payment> {
        const payment = await this.paymentRepository.findOne({
            where: { id },
            relations: { order: true },
        });
        if (!payment) {
            throw new NotFoundException(`Pembayaran dengan ID ${id} tidak ditemukan`);
        }
        return payment;
    }

    // Membuat catatan pembayaran. Jumlah SELALU diambil dari pesanan, bukan dari klien.
    async create(dto: CreatePaymentDto): Promise<Payment> {
        try {
            return await this.dataSource.transaction(async (manager) => {
                const order = await manager.findOne(Order, {
                    where: { id: dto.orderId },
                    lock: { mode: 'pessimistic_write' },
                });
                if (!order) {
                    throw new NotFoundException('Pesanan tidak ditemukan');
                }
                if (order.status !== OrderStatus.PENDING) {
                    throw new BadRequestException(
                        `Pesanan berstatus "${order.status}" tidak dapat dibayar`,
                    );
                }

                const existing = await manager.findOne(Payment, { where: { orderId: order.id } });
                if (existing) {
                    // satu pesanan = satu catatan pembayaran (order_id UNIQUE);
                    // pembayaran yang gagal boleh dicoba ulang pada catatan yang sama
                    if (existing.status !== PaymentStatus.FAILED) {
                        throw new ConflictException(
                            `Pesanan ini sudah memiliki pembayaran berstatus "${existing.status}"`,
                        );
                    }
                    existing.paymentMethod = dto.paymentMethod;
                    existing.amount = order.totalAmount;
                    existing.status = PaymentStatus.PENDING;
                    existing.paidAt = null;
                    return await manager.save(existing);
                }

                const payment = manager.create(Payment, {
                    orderId: order.id,
                    paymentMethod: dto.paymentMethod,
                    amount: order.totalAmount,
                    status: PaymentStatus.PENDING,
                    paidAt: null,
                });
                return await manager.save(payment);
            });
        } catch (error) {
            if (isUniqueViolation(error)) {
                throw new ConflictException('Pesanan ini sudah memiliki pembayaran');
            }
            throw error;
        }
    }

    // Simulasi konfirmasi dari payment gateway: paid / failed
    async updateStatus(id: string, dto: UpdatePaymentStatusDto): Promise<Payment> {
        await this.dataSource.transaction(async (manager) => {
            const payment = await manager.findOne(Payment, {
                where: { id },
                lock: { mode: 'pessimistic_write' },
            });
            if (!payment) {
                throw new NotFoundException(`Pembayaran dengan ID ${id} tidak ditemukan`);
            }
            if (payment.status !== PaymentStatus.PENDING) {
                throw new BadRequestException(
                    `Pembayaran berstatus "${payment.status}" tidak dapat diubah`,
                );
            }

            if (dto.status === PaymentStatus.PAID) {
                const order = await manager.findOne(Order, {
                    where: { id: payment.orderId },
                    lock: { mode: 'pessimistic_write' },
                });
                if (!order || order.status !== OrderStatus.PENDING) {
                    throw new BadRequestException(
                        'Pesanan tidak lagi menunggu pembayaran (mungkin sudah dibatalkan)',
                    );
                }
                payment.status = PaymentStatus.PAID;
                payment.paidAt = new Date();
                order.status = OrderStatus.PAID;
                await manager.save(order);
            } else {
                payment.status = PaymentStatus.FAILED;
            }
            await manager.save(payment);
        });

        return await this.findById(id);
    }
}
