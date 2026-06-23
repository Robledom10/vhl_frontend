import { Component } from '@angular/core';
import { PaymentService } from '../../../core/services/payments.service.service';

@Component({
  selector: 'app-payment.component',
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.component.css'
})
export class PaymentComponentComponent {
  accountId = 1;
  installments = 1;
  /* Quitar package id si al conectar genera error*/
  packageId = 1;
  loading = false;

  constructor(private paymentService: PaymentService) { }

  pay(): void {
    this.loading = true;

    this.paymentService.createPaymentLink({
      accountId: this.accountId,
      packageId: this.packageId,
      installments: this.installments
    })
      .subscribe({

        next: (paymentUrl) => {
          window.location.href = paymentUrl;
        },

        error: (error) => {
          console.error(error);

          this.loading = false
        }

      });
  }
}
