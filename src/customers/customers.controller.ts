import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { CustomersService } from './customers.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';
import { CreateAddressDto } from './dto/create-address.dto.js';
import { UpdateAddressDto } from './dto/update-address.dto.js';

@Controller('customers')
export class CustomersController {
    constructor(private readonly customersService: CustomersService) {}

    @Get()
    findAll() {
        return this.customersService.findAll();
    }

    @Get(':id')
    findById(@Param('id', ParseUUIDPipe) id: string) {
        return this.customersService.findById(id);
    }

    @Post()
    create(@Body() dto: CreateCustomerDto) {
        return this.customersService.create(dto);
    }

    @Patch(':id')
    update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCustomerDto) {
        return this.customersService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.customersService.remove(id);
    }

    // ---------- alamat: /customers/:customerId/addresses ----------
    @Get(':customerId/addresses')
    findAddresses(@Param('customerId', ParseUUIDPipe) customerId: string) {
        return this.customersService.findAddresses(customerId);
    }

    @Post(':customerId/addresses')
    createAddress(
        @Param('customerId', ParseUUIDPipe) customerId: string,
        @Body() dto: CreateAddressDto,
    ) {
        return this.customersService.createAddress(customerId, dto);
    }

    @Patch(':customerId/addresses/:id')
    updateAddress(
        @Param('customerId', ParseUUIDPipe) customerId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateAddressDto,
    ) {
        return this.customersService.updateAddress(customerId, id, dto);
    }

    @Delete(':customerId/addresses/:id')
    removeAddress(
        @Param('customerId', ParseUUIDPipe) customerId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        return this.customersService.removeAddress(customerId, id);
    }
}
