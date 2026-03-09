import { inject, Injectable, Injector, runInInjectionContext } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore, addDoc, collection, getDocs, query, where, DocumentReference } from '@angular/fire/firestore';
import { forkJoin, from, map, Observable } from 'rxjs';
import { Transaction } from '../models/transaction.model'

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
    private auth = inject(Auth);
    private injector = inject(Injector);
    private fireStore = inject(Firestore);

    createTransaction(transaction: Transaction): Promise<DocumentReference> {
      const userId = this.auth.currentUser?.uid;
      const transactionsRef = collection(this.fireStore, 'transactions');
      return addDoc(transactionsRef, {...transaction, userId})
    }

    getTransactionsByAccount(accountId: string): Observable<Transaction[]> {
      return runInInjectionContext(this.injector, () => {
      const transactionsRef = collection(this.fireStore, 'transactions');
      const sent$ = from(getDocs(query(
        transactionsRef,
        where('fromAccountId', '==', accountId)
      ))); // from wraps promise and converts it into an Observable
      const received$ = from(getDocs(query(
        transactionsRef,
        where('toAccountId', '==', accountId)
      )));
      return forkJoin([sent$, received$]).pipe(
        map(([sentSnapshot, receivedSnapshot]) => {
          const sent = sentSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as unknown as Transaction));

          const received = receivedSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as unknown as Transaction));
          return [...sent, ...received].sort((a,b) => b.date.toMillis() - a.date.toMillis())
        })
      )})
    }
}
