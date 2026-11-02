import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto.js';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    // GET /payments atau GET /payments?orderId=<uuid>
    @Get()
    findAll(@Query('orderId', new ParseUUIDPipe({ optional: true })) orderId?: string) {
        return this.paymentsService.findAll(orderId);
    }

    @Get(':id')
    findById(@Param('id', ParseUUIDPipe) id: string) {
        return this.paymentsService.findById(id);
    }

    @Post()
    create(@Body() dto: CreatePaymentDto) {
        return this.paymentsService.create(dto);
    }

    @Patch(':id/status')
    updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePaymentStatusDto) {
        return this.paymentsService.updateStatus(id, dto);
    }
}
