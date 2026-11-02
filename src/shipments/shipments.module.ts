import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shipment } from './entities/shipment.entity.js';
import { Order } from '../orders/entities/orders.entity.js';
import { ShipmentsController } from './shipments.controller.js';
import { ShipmentsService } from './shipments.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Shipment, Order])],
  controllers: [ShipmentsController],
  providers: [ShipmentsService],
  exports: [TypeOrmModule],
})
export class ShipmentsModule {}
