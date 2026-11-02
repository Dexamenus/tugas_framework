import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Publisher } from './entities/publisher.entity.js';
import { CreatePublisherDto } from './dto/create-publisher.dto.js';
import { UpdatePublisherDto } from './dto/update-publisher.dto.js';

@Injectable()
export class PublishersService {
    constructor(
        @InjectRepository(Publisher)
        private readonly repository: Repository<Publisher>,
    ) {}

    async findAll(): Promise<Publisher[]> {
        return await this.repository.find({ order: { name: 'ASC' } });
    }

    async findById(id: string): Promise<Publisher> {
        const item = await this.repository.findOne({ where: { id } });
        if (!item) {
            throw new NotFoundException(`Penerbit dengan ID ${id} tidak ditemukan`);
        }
        return item;
    }

    async create(dto: CreatePublisherDto): Promise<Publisher> {
        return await this.repository.save(this.repository.create(dto));
    }

    async update(id: string, dto: UpdatePublisherDto): Promise<Publisher> {
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
