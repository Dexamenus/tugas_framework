import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Auth } from './entites/auth.entity.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';

@Injectable()
export class AuthService {
    private users: Auth[] = [];

    // register user baru
    register(inputUser: RegisterDto): Auth | string {
        if (inputUser.password !== inputUser.password_confirmation) {
            return 'Konfirmasi password tidak cocok';
        }
        const emailExists = this.users.find(user => user.email === inputUser.email);
        if (emailExists) {
            return 'Email sudah terdaftar';
        }
        const newUser: Auth = {
            id: this.users.length + 1,
            name: inputUser.name,
            email: inputUser.email,
            password: inputUser.password
        };
        this.users.push(newUser);
        return newUser;
    }

    // login berdasarkan email dan password
    login(inputLogin: LoginDto): Auth | string {
        const user = this.users.find(
            user => user.email === inputLogin.email && user.password === inputLogin.password
        );
        if (!user) {
            return 'Email atau password salah';
        }
        return user;
    }

    // membuat token reset password
    forgotPassword(inputForgot: ForgotPasswordDto): { token: string } | string {
        const user = this.users.find(user => user.email === inputForgot.email);
        if (!user) {
            return 'Email tidak ditemukan';
        }
        user.reset_token = randomBytes(16).toString('hex');
        user.reset_token_expires = new Date(Date.now() + 15 * 60 * 1000);
        return { token: user.reset_token };
    }

    // reset password memakai token
    resetPassword(inputReset: ResetPasswordDto): string {
        if (inputReset.password !== inputReset.password_confirmation) {
            return 'Konfirmasi password tidak cocok';
        }
        const user = this.users.find(user => user.reset_token === inputReset.token);
        if (!user || !user.reset_token_expires || user.reset_token_expires < new Date()) {
            return 'Token tidak valid atau sudah kedaluwarsa';
        }
        user.password = inputReset.password;
        user.reset_token = undefined;
        user.reset_token_expires = undefined;
        return 'Password berhasil direset';
    }
}