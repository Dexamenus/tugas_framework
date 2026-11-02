import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class LoginDto {
    @IsNotEmpty({ message: 'Email tidak boleh kosong' })
    @IsEmail({}, { message: 'Email tidak valid' })
    email: string;


    @IsNotEmpty({ message: 'Password tidak boleh kosong' })
    @MinLength(8, { message: 'Password minimal 8 karakter' })
    password: string;
}