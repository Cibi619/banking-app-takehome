import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NavbarComponent } from '../../shared';
import { MatIcon } from '@angular/material/icon';
import { Account } from '../../models/account.model';
import { MatCard, MatCardContent } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { AccountService } from '../../services/account.service';
import { AuthService } from '../../services/auth.service';
import { of, Subject, switchMap, takeUntil } from 'rxjs';
import { MatProgressSpinner} from '@angular/material/progress-spinner';
import { LoadingService } from '../../services/loading.service';
import { MatAnchor, MatButton } from '@angular/material/button';

@Component({
  selector: 'app-accounts',
  imports: [NavbarComponent, MatIcon, MatCard, MatCardContent, RouterLink, TitleCasePipe, DecimalPipe, MatProgressSpinner, MatButton],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.scss'
})
export class AccountsComponent implements OnInit, OnDestroy {
  accounts: Account[] = [];
  loadingService = inject(LoadingService);
  // isLoading = true;
  private destroy$ = new Subject<void>();

  private accountService = inject(AccountService);
  private authService = inject(AuthService);

  ngOnInit() {
    this.loadingService.start();
    this.authService.getCurrentUser().pipe(
      switchMap(user => user ? this.accountService.getAccounts() : of([])),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (accounts) => {
        this.accounts = accounts
        this.loadingService.stop();
        // this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching accounts', err)
        this.loadingService.stop();
        // this.isLoading = false;
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}