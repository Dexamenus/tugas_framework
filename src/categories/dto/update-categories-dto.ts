import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCategoriesDto {
    @IsOptional()
    @IsString({ message: 'Name harus berupa string' })
    @MaxLength(100)
    readonly name?: string;
}
