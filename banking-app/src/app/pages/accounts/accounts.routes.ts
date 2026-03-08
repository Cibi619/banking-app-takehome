import { Routes } from '@angular/router';
import { AccountsComponent } from './accounts.component';
import { CreateAccountComponent } from './create-account/create-account.component';

export const ACCOUNT_ROUTES: Routes = [
  { path: '', component: AccountsComponent },
  { path: 'create', component: CreateAccountComponent }
];