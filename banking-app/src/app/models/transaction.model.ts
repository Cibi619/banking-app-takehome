import { Timestamp } from "@angular/fire/firestore";

export interface Transaction {
    id?: string,
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    date: Timestamp,
    description?: string
}