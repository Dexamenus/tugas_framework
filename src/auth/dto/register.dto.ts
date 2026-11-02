import { IsNotEmpty, IsString, MaxLength, MinLength, IsEmail} from "class-validator";

export class RegisterDto {
    @IsNotEmpty({ message: 'Nama tidak boleh kosong' })
    name: string;

    @IsNotEmpty({ message: 'Email tidak boleh kosong' })
    @IsEmail({}, { message: 'Email tidak valid' })
    email: string;

    @IsNotEmpty({ message: 'Password tidak boleh kosong' })
    @MinLength(3, { message: 'Password minimal 3 karakter' })
    @MaxLength(10, { message: 'Password maksimal 10 karakter' })
    password: string;

    @IsNotEmpty({ message: 'Konfirmasi password tidak boleh kosong' })
    @MinLength(3, { message: 'Konfirmasi password minimal 3 karakter' })
    @MaxLength(10, { message: 'Konfirmasi password maksimal 10 karakter' })
    password_confirmation: string;
}