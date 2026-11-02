import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreatePaymentDto {
    @IsUUID(undefined, { message: 'orderId harus berupa UUID' })
    readonly orderId: string;

    @IsNotEmpty({ message: 'paymentMethod tidak boleh kosong' })
    @IsString()
    @MaxLength(50)
    readonly paymentMethod: string;
}
