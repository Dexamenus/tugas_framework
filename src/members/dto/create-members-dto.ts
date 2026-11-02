import { IsInt, IsNotEmpty, IsString } from "class-validator";

export class CreateBooksDto {
    @IsNotEmpty({ message: "Title tidak boleh kosong" })
    @IsString({ message: "Title harus berupa string" })
    readonly title: string;

    @IsNotEmpty({ message: "Author tidak boleh kosong" })
    @IsString({ message: "Author harus berupa string" })
    readonly author: string;

    @IsNotEmpty({ message: "ISBN tidak boleh kosong" })
    @IsString({ message: "ISBN harus berupa string" })
    readonly isbn: string;

    @IsInt({ message: "Published year harus berupa angka" })
    readonly publishedYear: number;
}