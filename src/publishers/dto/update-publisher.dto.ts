import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePublisherDto {
    @IsOptional()
    @IsString({ message: 'Name harus berupa string' })
    @MaxLength(150)
    readonly name?: string;
}
