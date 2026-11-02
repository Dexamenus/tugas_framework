import { IsIn } from 'class-validator';
import { PaymentStatus } from '../entities/payment.entity.js';

export class UpdatePaymentStatusDto {
    @IsIn([PaymentStatus.PAID, PaymentStatus.FAILED], {
        message: 'status harus "paid" atau "failed"',
    })
    readonly status: PaymentStatus.PAID | PaymentStatus.FAILED;
}
