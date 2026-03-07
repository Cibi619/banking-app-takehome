import { inject, Injectable } from '@angular/core';
import { Auth, authState, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  
  signup(email: string, password: string) {
    console.log(this.auth, "--> auth");
    return createUserWithEmailAndPassword(this.auth, email, password);
  }
  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }
  logout() {
    return signOut(this.auth);
  }
  getCurrentUser() {
    return authState(this.auth);
  }
}
