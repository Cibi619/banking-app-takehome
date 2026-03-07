import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { AccountsComponent } from './pages/accounts/accounts.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent},
    { path: 'signup', component: LoginComponent},
    { path: '', redirectTo: 'login', pathMatch: 'full'},
    { path: 'accounts', component: AccountsComponent}
];
