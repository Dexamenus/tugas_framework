import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateShipmentDto {
    @IsUUID(undefined, { message: 'orderId harus berupa UUID' })
    readonly orderId: string;

    @IsNotEmpty({ message: 'courier tidak boleh kosong' })
    @IsString()
    @MaxLength(100)
    readonly courier: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    readonly trackingNumber?: string;
}
