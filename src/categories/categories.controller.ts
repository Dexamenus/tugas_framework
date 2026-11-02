import { Controller, Get, Post, Patch, Delete } from '@nestjs/common';
import { CategoriesService } from './categories.service.js';
import { Param, Body } from '@nestjs/common';
import { CreateCategoriesDto } from './dto/create-categories-dto.js';
import { UpdateCategoriesDto } from './dto/update-categories-dto.js';

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}
        
        @Get()
        findAll() {
            return this.categoriesService.findAll();
        }    
    
        @Get(':id')
        findbyId(@Param('id') id: string) {
            // aksinya via service
            return this.categoriesService.findById(id);
        }
    
        @Post()
        create(@Body() createCategoriesDto: CreateCategoriesDto) {
            // kirim aksi simpan ke service
            return this.categoriesService.create(createCategoriesDto as any);
        }
        @Patch(':id')
        update(@Param('id') id: string, @Body() updateCategoriesDto: UpdateCategoriesDto) {
            // kirim aksi update ke service
            return this.categoriesService.update(id, updateCategoriesDto as any);
        }
        @Delete(':id')
        remove(@Param('id') id: string) {
            // kirim aksi delete ke service
            return this.categoriesService.delete(id);
        }
}
