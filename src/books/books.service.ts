import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entites/books.entity.js';
import { Author } from '../authors/entities/author.entity.js';
import { UpdateBooksDto } from './dto/update-books-dto.js';
import { CreateBooksDto } from './dto/create-books-dto.js';
import { isUniqueViolation } from '../common/utils/db-errors.js';

@Injectable()
export class BooksService {
    constructor(
        @InjectRepository(Book)
        private readonly bookRepository: Repository<Book>,
    ) {}

    // menampilkan seluruh data buku
    async findAll(): Promise<Book[]> {
        return await this.bookRepository.find({
            relations: { category: true, publisher: true, authors: true },
            order: {
                title: 'ASC',
            },
        });
    }

    // menyimpan data ke database
    async create(inputbook: CreateBooksDto): Promise<Book> {
        const { authorIds, ...data } = inputbook;
        const newBook: Book = this.bookRepository.create({
            ...data,
            ...(authorIds && { authors: authorIds.map((id) => ({ id })) }),
        });
        // menyimpan data buku baru ke database
        try {
            return await this.bookRepository.save(newBook);
        } catch (error) {
            if (isUniqueViolation(error)) {
                throw new ConflictException('ISBN sudah terdaftar');
            }
            throw error;
        }
    }

    // menampilkan data buku berdasarkan ID
    async findById(id: string): Promise<Book> {
        const book = await this.bookRepository.findOne({
            where: { id },
            relations: { category: true, publisher: true, authors: true },
        });
        if (!book) {
            throw new NotFoundException(`Buku dengan ID ${id} tidak ditemukan`);
        }
        return book;
    }

    // mengupdate data buku berdasarkan ID
    async update(id: string, updatedBook: UpdateBooksDto): Promise<Book | undefined> {
        const book = await this.bookRepository.findOne({
            where: { id }
        });
        if (!book) {
            return undefined;
        }
        const { authorIds, ...data } = updatedBook;
        Object.assign(book, data);
        // sinkronkan ketersediaan dengan stok bila isAvailable tidak diisi manual
        if (data.stock !== undefined && data.isAvailable === undefined) {
            book.isAvailable = data.stock > 0;
        }
        if (authorIds) {
            book.authors = authorIds.map((authorId) => ({ id: authorId }) as Author);
        }
        try {
            return await this.bookRepository.save(book);
        } catch (error) {
            if (isUniqueViolation(error)) {
                throw new ConflictException('ISBN sudah terdaftar');
            }
            throw error;
        }
    }

    // menghapus data buku berdasarkan ID
    async delete(id: string): Promise<boolean> {
        const book = await this.bookRepository.findOne({
            where: { id }
        });
        if (!book) {
            return false;
        }
        // soft delete: riwayat order_items tetap utuh
        await this.bookRepository.softRemove(book);
        return true;
    }
}

           