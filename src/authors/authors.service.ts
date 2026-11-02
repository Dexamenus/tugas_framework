import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Author } from './entities/author.entity.js';
import { CreateAuthorDto } from './dto/create-author.dto.js';
import { UpdateAuthorDto } from './dto/update-author.dto.js';

@Injectable()
export class AuthorsService {
    constructor(
        @InjectRepository(Author)
        private readonly repository: Repository<Author>,
    ) {}

    async findAll(): Promise<Author[]> {
        return await this.repository.find({ order: { name: 'ASC' } });
    }

    async findById(id: string): Promise<Author> {
        const item = await this.repository.findOne({ where: { id } });
        if (!item) {
            throw new NotFoundException(`Penulis dengan ID ${id} tidak ditemukan`);
        }
        return item;
    }

    async create(dto: CreateAuthorDto): Promise<Author> {
        return await this.repository.save(this.repository.create(dto));
    }

    async update(id: string, dto: UpdateAuthorDto): Promise<Author> {
        const item = await this.findById(id);
        Object.assign(item, dto);
        return await this.repository.save(item);
    }

    async remove(id: string): Promise<{ id: string; deleted: boolean }> {
        const item = await this.findById(id);
        await this.repository.remove(item);
        return { id, deleted: true };
    }
}
