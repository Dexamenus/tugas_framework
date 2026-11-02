import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, IsUUID, Min, ValidateNested } from 'class-validator';

export class OrderItemInputDto {
    @IsUUID(undefined, { message: 'bookId harus berupa UUID' })
    readonly bookId: string;

    @IsInt({ message: 'quantity harus berupa angka bulat' })
    @Min(1, { message: 'quantity minimal 1' })
    readonly quantity: number;
}

export class CreateOrderDto {
    @IsUUID(undefined, { message: 'customerId harus berupa UUID' })
    readonly customerId: string;

    // alamat yang dipilih dari customer_addresses (disalin sebagai snapshot)
    @IsUUID(undefined, { message: 'addressId harus berupa UUID' })
    readonly addressId: string;

    @IsArray()
    @ArrayMinSize(1, { message: 'Pesanan minimal berisi 1 buku' })
    @ValidateNested({ each: true })
    @Type(() => OrderItemInputDto)
    readonly items: OrderItemInputDto[];
}
