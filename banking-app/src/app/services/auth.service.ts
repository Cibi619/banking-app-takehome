import { inject, Injectable, Injector, runInInjectionContext } from '@angular/core';
import { Auth, authState, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User, UserCredential } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private injector = inject(Injector);

  signup(email: string, password: string): Promise<UserCredential> {
    console.log(this.auth, "--> auth");
    return createUserWithEmailAndPassword(this.auth, email, password);
  }
  login(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }
  logout() {
    return signOut(this.auth);
  }
  getCurrentUser(): Observable<User | null> {
    return runInInjectionContext(this.injector, () => {
      return authState(this.auth);
    })
  }
}
