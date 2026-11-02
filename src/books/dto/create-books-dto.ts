import { IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class CreateBooksDto {
    @IsNotEmpty({ message: "Title tidak boleh kosong" })
    @IsString({ message: "Title harus berupa string" })
    readonly title: string;

    @IsNotEmpty({ message: "ISBN tidak boleh kosong" })
    @IsString({ message: "ISBN harus berupa string" })
    readonly isbn: string;

    @IsInt({ message: "Published year harus berupa angka" })
    readonly publishedYear: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 }, { message: "Price harus berupa angka" })
    @Min(0, { message: "Price tidak boleh negatif" })
    readonly price?: number;

    @IsOptional()
    @IsInt({ message: "Stock harus berupa angka bulat" })
    @Min(0, { message: "Stock tidak boleh negatif" })
    readonly stock?: number;

    @IsOptional()
    @IsUUID(undefined, { message: "categoryId harus berupa UUID" })
    readonly categoryId?: string;

    @IsOptional()
    @IsUUID(undefined, { message: "publisherId harus berupa UUID" })
    readonly publisherId?: string;

    @IsOptional()
    @IsArray({ message: "authorIds harus berupa array" })
    @IsUUID(undefined, { each: true, message: "Setiap authorId harus berupa UUID" })
    readonly authorIds?: string[];
}
