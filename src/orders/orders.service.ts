import { randomBytes } from 'node:crypto';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/orders.entity.js';
import { OrderItem } from './entities/order-item.entity.js';
import { Customer } from '../customers/entities/customer.entity.js';
import { CustomerAddress } from '../customers/entities/customer-address.entity.js';
import { Book } from '../books/entites/books.entity.js';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity.js';
import { CreateOrderDto } from './dto/create-order.dto.js';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        private readonly dataSource: DataSource,
    ) {}

    // contoh: ORD-20261102-9F3A1C7B
    private generateOrderNumber(): string {
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        return `ORD-${date}-${randomBytes(4).toString('hex').toUpperCase()}`;
    }

    async findAll(customerId?: string): Promise<Order[]> {
        return await this.orderRepository.find({
            where: customerId ? { customerId } : {},
            relations: { customer: true, items: true },
            order: { createdAt: 'DESC' },
        });
    }

    async findById(id: string): Promise<Order> {
        const order = await this.orderRepository.findOne({
            where: { id },
            relations: { customer: true, items: { book: true }, payment: true, shipment: true },
        });
        if (!order) {
            throw new NotFoundException(`Pesanan dengan ID ${id} tidak ditemukan`);
        }
        return order;
    }

    // Checkout: semuanya dalam SATU transaksi. Jika satu langkah gagal, semua dibatalkan.
    async create(dto: CreateOrderDto): Promise<Order> {
        // gabungkan item yang bookId-nya sama
        const quantityByBook = new Map<string, number>();
        for (const item of dto.items) {
            quantityByBook.set(item.bookId, (quantityByBook.get(item.bookId) ?? 0) + item.quantity);
        }

        const orderId = await this.dataSource.transaction(async (manager) => {
            const customer = await manager.findOne(Customer, { where: { id: dto.customerId } });
            if (!customer) {
                throw new NotFoundException('Customer tidak ditemukan');
            }
            const address = await manager.findOne(CustomerAddress, {
                where: { id: dto.addressId, customerId: dto.customerId },
            });
            if (!address) {
                throw new NotFoundException('Alamat tidak ditemukan untuk customer ini');
            }

            // kunci baris buku agar dua checkout bersamaan tidak membuat stok minus
            const bookIds = [...quantityByBook.keys()];
            const books = await manager
                .createQueryBuilder(Book, 'book')
                .setLock('pessimistic_write')
                .where('book.id IN (:...bookIds)', { bookIds })
                .getMany();
            const bookMap = new Map(books.map((book) => [book.id, book]));

            const items: OrderItem[] = [];
            let totalCents = 0; // hitung dalam sen agar bebas error pembulatan desimal

            for (const [bookId, quantity] of quantityByBook) {
                const book = bookMap.get(bookId);
                if (!book) {
                    throw new NotFoundException(`Buku dengan ID ${bookId} tidak ditemukan`);
                }
                if (!book.isAvailable || book.stock < quantity) {
                    throw new BadRequestException(
                        `Stok buku "${book.title}" tidak mencukupi (tersisa ${book.stock})`,
                    );
                }

                const priceCents = Math.round(book.price * 100);
                const subtotalCents = priceCents * quantity;
                totalCents += subtotalCents;

                // kurangi stok; sinkronkan isAvailable dengan stok
                book.stock -= quantity;
                if (book.stock === 0) {
                    book.isAvailable = false;
                }

                items.push(
                    manager.create(OrderItem, {
                        bookId,
                        quantity,
                        price: priceCents / 100, // snapshot harga saat transaksi
                        subtotal: subtotalCents / 100,
                    }),
                );
            }
            await manager.save(books);

            const order = manager.create(Order, {
                customerId: dto.customerId,
                orderNumber: this.generateOrderNumber(),
                status: OrderStatus.PENDING,
                totalAmount: totalCents / 100,
                // snapshot alamat saat checkout
                shippingRecipientName: address.recipientName,
                shippingPhone: address.phone,
                shippingAddress: address.address,
                shippingCity: address.city,
                shippingPostalCode: address.postalCode,
                items,
            });
            const saved = await manager.save(order);
            return saved.id;
        });

        return await this.findById(orderId);
    }

    // Batalkan pesanan yang belum dibayar, lalu kembalikan stok.
    async cancel(id: string): Promise<Order> {
        await this.dataSource.transaction(async (manager) => {
            const order = await manager.findOne(Order, {
                where: { id },
                lock: { mode: 'pessimistic_write' },
            });
            if (!order) {
                throw new NotFoundException(`Pesanan dengan ID ${id} tidak ditemukan`);
            }
            if (order.status !== OrderStatus.PENDING) {
                throw new BadRequestException(
                    `Pesanan berstatus "${order.status}" tidak dapat dibatalkan`,
                );
            }

            const items = await manager.find(OrderItem, { where: { orderId: id } });
            for (const item of items) {
                const book = await manager.findOne(Book, {
                    where: { id: item.bookId },
                    withDeleted: true,
                    lock: { mode: 'pessimistic_write' },
                });
                if (book) {
                    book.stock += item.quantity;
                    book.isAvailable = true;
                    await manager.save(book);
                }
            }

            // pembayaran yang masih menunggu ikut digagalkan
            const payment = await manager.findOne(Payment, { where: { orderId: id } });
            if (payment && payment.status === PaymentStatus.PENDING) {
                payment.status = PaymentStatus.FAILED;
                await manager.save(payment);
            }

            order.status = OrderStatus.CANCELLED;
            await manager.save(order);
        });

        return await this.findById(id);
    }
}
