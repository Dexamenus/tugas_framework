import {
  Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne,
  PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity.js';
import { OrderItem } from './order-item.entity.js';
import { Payment } from '../../payments/entities/payment.entity.js';
import { Shipment } from '../../shipments/entities/shipment.entity.js';
import { decimalTransformer } from '../../common/transformers/decimal.transformer.js';

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @ManyToOne(() => Customer, (customer) => customer.orders, {
    nullable: false,
    onDelete: 'RESTRICT', // riwayat pesanan tidak boleh hilang
  })
  @JoinColumn({ name: 'customer_id' })
  customer: Relation<Customer>;

  @Column({ name: 'order_number', type: 'varchar', length: 50, unique: true })
  orderNumber: string;

  @Column({ type: 'varchar', length: 30, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({
    name: 'total_amount', type: 'decimal', precision: 12, scale: 2, default: 0,
    transformer: decimalTransformer,
  })
  totalAmount: number;

  // Snapshot alamat pengiriman saat checkout
  @Column({ name: 'shipping_recipient_name', type: 'varchar', length: 150 })
  shippingRecipientName: string;

  @Column({ name: 'shipping_phone', type: 'varchar', length: 20 })
  shippingPhone: string;

  @Column({ name: 'shipping_address', type: 'text' })
  shippingAddress: string;

  @Column({ name: 'shipping_city', type: 'varchar', length: 100 })
  shippingCity: string;

  @Column({ name: 'shipping_postal_code', type: 'varchar', length: 10 })
  shippingPostalCode: string;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: ['insert'] })
  items: Relation<OrderItem[]>;

  @OneToOne(() => Payment, (payment) => payment.order)
  payment: Relation<Payment>;

  @OneToOne(() => Shipment, (shipment) => shipment.order)
  shipment: Relation<Shipment>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
