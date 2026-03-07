import { Timestamp } from "@angular/fire/firestore";

export interface Account {
    id?: string,
    userId: string,
    name: string,
    type: 'chequing' | 'savings',
    balance: number,
    createdAt: Timestamp
}