import {
  Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, JoinTable,
  ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Category } from '../../categories/entites/categories.entity.js';
import { Publisher } from '../../publishers/entities/publisher.entity.js';
import { Author } from '../../authors/entities/author.entity.js';
import { OrderItem } from '../../orders/entities/order-item.entity.js';
import { decimalTransformer } from '../../common/transformers/decimal.transformer.js';

@Entity({ name: 'books' })
export class Book {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Diperbesar dari 30/50 karena judul buku sering panjang
  @Column({ type: 'varchar', length: 255 })
  title: string;

  // Kolom `author` dihapus: penulis dikelola lewat authors + book_authors
  @Column({ type: 'varchar', length: 45, unique: true })
  isbn: string;

  @Column({ type: 'int', default: 0 })
  publishedYear: number;

  @Column({ type: 'boolean', default: true })
  isAvailable: boolean;

  @Column({
    type: 'decimal', precision: 12, scale: 2, default: 0,
    transformer: decimalTransformer,
  })
  price: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  categoryId: string | null;

  @ManyToOne(() => Category, (category) => category.books, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category: Relation<Category> | null;

  @Column({ name: 'publisher_id', type: 'uuid', nullable: true })
  publisherId: string | null;

  @ManyToOne(() => Publisher, (publisher) => publisher.books, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'publisher_id' })
  publisher: Relation<Publisher> | null;

  // Many-to-many -> tabel book_authors (PK gabungan book_id + author_id)
  @ManyToMany(() => Author, (author) => author.books, { onDelete: 'CASCADE' })
  @JoinTable({
    name: 'book_authors',
    joinColumn: { name: 'book_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'author_id', referencedColumnName: 'id' },
  })
  authors: Relation<Author[]>;

  @OneToMany(() => OrderItem, (item) => item.book)
  orderItems: Relation<OrderItem[]>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
