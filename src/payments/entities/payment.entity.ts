import {
  Column, CreateDateColumn, Entity, JoinColumn, OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Order } from '../../orders/entities/orders.entity.js';
import { decimalTransformer } from '../../common/transformers/decimal.transformer.js';

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity({ name: 'payments' })
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', type: 'uuid', unique: true })
  orderId: string;

  // One-to-one untuk rancangan sederhana (order_id UNIQUE)
  @OneToOne(() => Order, (order) => order.payment, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: Relation<Order>;

  @Column({ name: 'payment_method', type: 'varchar', length: 50 })
  paymentMethod: string;

  @Column({
    type: 'decimal', precision: 12, scale: 2,
    transformer: decimalTransformer,
  })
  amount: number;

  @Column({ type: 'varchar', length: 30, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
