import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Shipment, ShipmentStatus } from './entities/shipment.entity.js';
import { Order, OrderStatus } from '../orders/entities/orders.entity.js';
import { CreateShipmentDto } from './dto/create-shipment.dto.js';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto.js';
import { isUniqueViolation } from '../common/utils/db-errors.js';

// transisi status pengiriman yang diizinkan
const ALLOWED_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
    [ShipmentStatus.PENDING]: [ShipmentStatus.SHIPPED],
    [ShipmentStatus.SHIPPED]: [ShipmentStatus.DELIVERED, ShipmentStatus.RETURNED],
    [ShipmentStatus.DELIVERED]: [],
    [ShipmentStatus.RETURNED]: [],
};

@Injectable()
export class ShipmentsService {
    constructor(
        @InjectRepository(Shipment)
        private readonly shipmentRepository: Repository<Shipment>,
        private readonly dataSource: DataSource,
    ) {}

    async findAll(orderId?: string): Promise<Shipment[]> {
        return await this.shipmentRepository.find({
            where: orderId ? { orderId } : {},
        });
    }

    async findById(id: string): Promise<Shipment> {
        const shipment = await this.shipmentRepository.findOne({
            where: { id },
            relations: { order: true },
        });
        if (!shipment) {
            throw new NotFoundException(`Pengiriman dengan ID ${id} tidak ditemukan`);
        }
        return shipment;
    }

    // Membuat pengiriman untuk pesanan yang SUDAH DIBAYAR. Status pesanan -> processing.
    async create(dto: CreateShipmentDto): Promise<Shipment> {
        try {
            return await this.dataSource.transaction(async (manager) => {
                const order = await manager.findOne(Order, {
                    where: { id: dto.orderId },
                    lock: { mode: 'pessimistic_write' },
                });
                if (!order) {
                    throw new NotFoundException('Pesanan tidak ditemukan');
                }
                if (order.status !== OrderStatus.PAID) {
                    throw new BadRequestException(
                        `Hanya pesanan berstatus "paid" yang dapat dikirim (status saat ini: "${order.status}")`,
                    );
                }
                const existing = await manager.findOne(Shipment, { where: { orderId: order.id } });
                if (existing) {
                    throw new ConflictException('Pesanan ini sudah memiliki pengiriman');
                }

                const shipment = manager.create(Shipment, {
                    orderId: order.id,
                    courier: dto.courier,
                    trackingNumber: dto.trackingNumber ?? null,
                    status: ShipmentStatus.PENDING,
                });
                order.status = OrderStatus.PROCESSING;
                await manager.save(order);
                return await manager.save(shipment);
            });
        } catch (error) {
            if (isUniqueViolation(error)) {
                throw new ConflictException('Pesanan ini sudah memiliki pengiriman');
            }
            throw error;
        }
    }

    // pending -> shipped -> delivered / returned. Status pesanan ikut disinkronkan.
    async updateStatus(id: string, dto: UpdateShipmentStatusDto): Promise<Shipment> {
        await this.dataSource.transaction(async (manager) => {
            const shipment = await manager.findOne(Shipment, {
                where: { id },
                lock: { mode: 'pessimistic_write' },
            });
            if (!shipment) {
                throw new NotFoundException(`Pengiriman dengan ID ${id} tidak ditemukan`);
            }
            if (!ALLOWED_TRANSITIONS[shipment.status].includes(dto.status)) {
                throw new BadRequestException(
                    `Status pengiriman tidak dapat diubah dari "${shipment.status}" ke "${dto.status}"`,
                );
            }

            const order = await manager.findOne(Order, {
                where: { id: shipment.orderId },
                lock: { mode: 'pessimistic_write' },
            });
            if (!order) {
                throw new NotFoundException('Pesanan tidak ditemukan');
            }

            if (dto.status === ShipmentStatus.SHIPPED) {
                const trackingNumber = dto.trackingNumber ?? shipment.trackingNumber;
                if (!trackingNumber) {
                    throw new BadRequestException('Nomor resi (trackingNumber) wajib diisi saat dikirim');
                }
                shipment.trackingNumber = trackingNumber;
                shipment.shippedAt = new Date();
                order.status = OrderStatus.SHIPPED;
            } else if (dto.status === ShipmentStatus.DELIVERED) {
                shipment.deliveredAt = new Date();
                order.status = OrderStatus.COMPLETED;
            }
            // "returned": status pesanan dibiarkan (belum ada status khusus untuk retur)

            shipment.status = dto.status;
            await manager.save(order);
            await manager.save(shipment);
        });

        return await this.findById(id);
    }
}
