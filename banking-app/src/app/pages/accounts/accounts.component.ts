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

@Component({
  selector: 'app-accounts',
  imports: [NavbarComponent, MatIcon, MatCard, MatCardContent, RouterLink, TitleCasePipe, DecimalPipe],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.scss'
})
export class AccountsComponent implements OnInit, OnDestroy {
  accounts: Account[] = [];
  private destroy$ = new Subject<void>();

  private accountService = inject(AccountService);
  private authService = inject(AuthService);

  ngOnInit() {
    this.authService.getCurrentUser().pipe(
      switchMap(user => user ? this.accountService.getAccounts() : of([])),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (accounts) => this.accounts = accounts,
      error: (err) => console.error('Error fetching accounts', err)
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}