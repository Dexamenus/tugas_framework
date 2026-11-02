import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCategoriesDto {
    @IsNotEmpty({ message: 'Name tidak boleh kosong' })
    @IsString({ message: 'Name harus berupa string' })
    @MaxLength(100)
    readonly name: string;
}
