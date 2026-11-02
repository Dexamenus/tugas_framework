import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entites/categories.entity.js';
import { CreateCategoriesDto } from './dto/create-categories-dto.js';
import { UpdateCategoriesDto } from './dto/update-categories-dto.js';
import { isUniqueViolation } from '../common/utils/db-errors.js';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
    ) {}

    // menampilkan seluruh data kategori
    async findAll(): Promise<Category[]> {
        return await this.categoryRepository.find({ order: { name: 'ASC' } });
    }

    // menyimpan data ke database
    async create(inputCategory: CreateCategoriesDto): Promise<Category> {
        const newCategory = this.categoryRepository.create(inputCategory);
        try {
            return await this.categoryRepository.save(newCategory);
        } catch (error) {
            if (isUniqueViolation(error)) {
                throw new ConflictException('Nama kategori sudah ada');
            }
            throw error;
        }
    }

    // menampilkan data kategori berdasarkan ID
    async findById(id: string): Promise<Category | null> {
        return await this.categoryRepository.findOne({ where: { id } });
    }

    // mengupdate data kategori berdasarkan ID
    async update(id: string, updatedCategory: UpdateCategoriesDto): Promise<Category | undefined> {
        const category = await this.categoryRepository.findOne({ where: { id } });
        if (!category) {
            return undefined;
        }
        Object.assign(category, updatedCategory);
        return await this.categoryRepository.save(category);
    }

    // menghapus data kategori berdasarkan ID
    async delete(id: string): Promise<boolean> {
        const result = await this.categoryRepository.delete(id);
        return (result.affected ?? 0) > 0;
    }
}
