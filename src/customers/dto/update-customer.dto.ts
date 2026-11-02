import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCustomerDto {
    @IsOptional() @IsString() @MaxLength(150)
    readonly name?: string;

    @IsOptional() @IsEmail({}, { message: 'Format email tidak valid' }) @MaxLength(150)
    readonly email?: string;

    @IsOptional() @IsString() @MaxLength(20)
    readonly phone?: string;
}
