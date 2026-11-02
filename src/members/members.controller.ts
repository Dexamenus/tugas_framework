import { Controller, Get } from '@nestjs/common';
import { MembersService } from './members.service.js';
import { Param } from '@nestjs/common';

@Controller('members')
export class MembersController {
    constructor(private readonly membersService: MembersService) {}

    @Get()
    findAll() {
        return this.membersService.findAll();
    }
    @Get(':id')
    findbyId(@Param('id') id: string) {
        // aksinya via service
        return this.membersService.findById(parseInt(id));
    }
    
}
