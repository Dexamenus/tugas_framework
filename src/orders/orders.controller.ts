import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    // GET /orders atau GET /orders?customerId=<uuid>
    @Get()
    findAll(@Query('customerId', new ParseUUIDPipe({ optional: true })) customerId?: string) {
        return this.ordersService.findAll(customerId);
    }

    @Get(':id')
    findById(@Param('id', ParseUUIDPipe) id: string) {
        return this.ordersService.findById(id);
    }

    @Post()
    create(@Body() dto: CreateOrderDto) {
        return this.ordersService.create(dto);
    }

    @Patch(':id/cancel')
    cancel(@Param('id', ParseUUIDPipe) id: string) {
        return this.ordersService.cancel(id);
    }
}
