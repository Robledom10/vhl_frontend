export interface CreatePaymentRequest {
    accountId: number;
    packageId: number;
    installments: number;
}