import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCustomerDto {
    @IsNotEmpty({ message: 'Name tidak boleh kosong' })
    @IsString()
    @MaxLength(150)
    readonly name: string;

    @IsEmail({}, { message: 'Format email tidak valid' })
    @MaxLength(150)
    readonly email: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    readonly phone?: string;
}
