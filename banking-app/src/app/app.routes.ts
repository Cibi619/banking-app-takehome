import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { AccountsComponent } from './pages/accounts/accounts.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: LoginComponent },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    {
        path: 'accounts',
        loadChildren: () => import('./pages/accounts/accounts.routes')
            .then(m => m.ACCOUNT_ROUTES)
    },
    {
        path: 'transfer',
        loadChildren: () => import('./pages/transfer/transfer.routes')
            .then(m => m.TRANSFER_ROUTES)
    },
    // {
    //     path: 'history',
    //     loadChildren: () => import('./pages/history/history.routes')
    //         .then(m => m.HISTORY_ROUTES)
    // }
];
