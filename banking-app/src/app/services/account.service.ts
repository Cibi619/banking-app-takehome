import { inject, Injectable, Injector, runInInjectionContext } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { addDoc, collection, collectionData, Firestore, doc, query, updateDoc, where, getDocs, DocumentReference } from '@angular/fire/firestore';
import { Account } from '../models/account.model';
import { from, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private fireStore = inject(Firestore);
  private auth = inject(Auth);
  private injector = inject(Injector);

  createAccount(account: Account): Promise<DocumentReference> {
    const userId = this.auth.currentUser?.uid;
    const accountsRef = collection(this.fireStore, 'accounts');
    return addDoc(accountsRef, { ...account, userId });
  }

  getAccounts(): Observable<Account[]> {
    return runInInjectionContext(this.injector, () => {
      const uid = this.auth.currentUser?.uid;
      if (!uid) return of([]);

      const accountsRef = collection(this.fireStore, 'accounts');
      const userQuery = query(accountsRef, where('userId', '==', uid));
      return from(getDocs(userQuery)).pipe(
        map(snapshot => snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }) as unknown as Account))
      );
    });
  }
  updateAccounts(id: string, balance: number): Promise<void> {
    const docRef = doc(this.fireStore, 'accounts', id);
    return updateDoc(docRef, { balance });
  }
}
