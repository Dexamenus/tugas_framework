import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ShipmentsService } from './shipments.service.js';
import { CreateShipmentDto } from './dto/create-shipment.dto.js';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto.js';

@Controller('shipments')
export class ShipmentsController {
    constructor(private readonly shipmentsService: ShipmentsService) {}

    // GET /shipments atau GET /shipments?orderId=<uuid>
    @Get()
    findAll(@Query('orderId', new ParseUUIDPipe({ optional: true })) orderId?: string) {
        return this.shipmentsService.findAll(orderId);
    }

    @Get(':id')
    findById(@Param('id', ParseUUIDPipe) id: string) {
        return this.shipmentsService.findById(id);
    }

    @Post()
    create(@Body() dto: CreateShipmentDto) {
        return this.shipmentsService.create(dto);
    }

    @Patch(':id/status')
    updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateShipmentStatusDto) {
        return this.shipmentsService.updateStatus(id, dto);
    }
}
