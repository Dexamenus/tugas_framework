import { Controller, Get, Patch, Post, Delete } from '@nestjs/common';
import { BooksService } from './books.service.js';
import { Param, Body } from '@nestjs/common';
import { CreateBooksDto } from './dto/create-books-dto.js';
import { UpdateBooksDto } from './dto/update-books-dto.js';

@Controller('books')
export class BooksController {
    constructor(private readonly booksService: BooksService) {}
    
    @Get()
    findAll() {
        return this.booksService.findAll();
    }    

    @Get(':id')
    findbyId(@Param('id') id: string) {
        // aksinya via service
        return this.booksService.findById(id);
    }

    @Post()
    create(@Body() createBooksDto: CreateBooksDto) {
        // kirim aksi simpan ke service
        return this.booksService.create(createBooksDto as any);
    }
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateBooksDto: UpdateBooksDto) {
        // kirim aksi update ke service
        return this.booksService.update(id, updateBooksDto);
    }
    @Delete(':id')
    remove(@Param('id') id: string) {
        // kirim aksi delete ke service
        return this.booksService.delete(id);
    }
}

