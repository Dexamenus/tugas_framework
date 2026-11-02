import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateAuthorDto {
    @IsNotEmpty({ message: 'Name tidak boleh kosong' })
    @IsString({ message: 'Name harus berupa string' })
    @MaxLength(150)
    readonly name: string;
}
