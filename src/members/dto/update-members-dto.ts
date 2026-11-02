export class UpdateBooksDto {
    readonly title?: string;
    readonly author?: string;
    readonly isbn?: string;
    readonly publishedYear?: number;
    readonly isAvailable?: boolean;
}