import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAddressDto {
    @IsOptional() @IsString() @MaxLength(150)
    readonly recipientName?: string;

    @IsOptional() @IsString() @MaxLength(20)
    readonly phone?: string;

    @IsOptional() @IsString()
    readonly address?: string;

    @IsOptional() @IsString() @MaxLength(100)
    readonly city?: string;

    @IsOptional() @IsString() @MaxLength(10)
    readonly postalCode?: string;
}
