import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { ShipmentStatus } from '../entities/shipment.entity.js';

export class UpdateShipmentStatusDto {
    @IsIn([ShipmentStatus.SHIPPED, ShipmentStatus.DELIVERED, ShipmentStatus.RETURNED], {
        message: 'status harus "shipped", "delivered", atau "returned"',
    })
    readonly status: ShipmentStatus.SHIPPED | ShipmentStatus.DELIVERED | ShipmentStatus.RETURNED;

    // nomor resi wajib ada saat status menjadi "shipped"
    @IsOptional()
    @IsString()
    @MaxLength(100)
    readonly trackingNumber?: string;
}
