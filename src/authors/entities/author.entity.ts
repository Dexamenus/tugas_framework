import {
  Column, CreateDateColumn, Entity, ManyToMany,
  PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Book } from '../../books/entites/books.entity.js';

@Entity({ name: 'authors' })
export class Author {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  // Sisi inverse. Tabel penghubung book_authors didefinisikan di entity Book.
  @ManyToMany(() => Book, (book) => book.authors)
  books: Relation<Book[]>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
