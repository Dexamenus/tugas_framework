export class Auth {
    id: number;
    name: string;
    email: string;
    password: string;
    reset_token?: string;
    reset_token_expires?: Date;
}