import { IsArray, IsBoolean, IsInt, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class UpdateBooksDto {
    @IsOptional() @IsString() @MaxLength(255)
    readonly title?: string;

    @IsOptional() @IsString() @MaxLength(45)
    readonly isbn?: string;

    @IsOptional() @IsInt()
    readonly publishedYear?: number;

    @IsOptional() @IsBoolean()
    readonly isAvailable?: boolean;

    @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0)
    readonly price?: number;

    @IsOptional() @IsInt() @Min(0)
    readonly stock?: number;

    @IsOptional() @IsUUID()
    readonly categoryId?: string;

    @IsOptional() @IsUUID()
    readonly publisherId?: string;

    @IsOptional() @IsArray() @IsUUID(undefined, { each: true })
    readonly authorIds?: string[];
}
