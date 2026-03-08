import { Component, inject, OnInit } from '@angular/core';
import { Account } from '../../models/account.model';
import { forkJoin, map, Subject, switchMap, takeUntil } from 'rxjs';
import { AccountService } from '../../services/account.service';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction.model';
import { NavbarComponent } from '../../shared';
import { MatIcon } from '@angular/material/icon';
import { DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-history',
  imports: [NavbarComponent, MatIcon, DatePipe, DecimalPipe, TitleCasePipe, RouterLink],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent implements OnInit {
  transactions: Transaction[] = [];
  accounts: Account[] = [];
  private destroy$ = new Subject<void>();
  private accountService = inject(AccountService);
  private transactionService = inject(TransactionService);

  ngOnInit() {
    this.accountService.getAccounts().pipe(
      switchMap(accounts => {
        this.accounts = accounts;
        const requests$ = accounts.map(acc =>
          this.transactionService.getTransactionsByAccount(acc.id!)
        );
        return forkJoin(requests$);
      }),
      map(results => {
        const all = results.flat();
        const unique = all.filter(
          (transaction, index, self) => index === self.findIndex(t => t.id === transaction.id)
        );
        return unique.sort((a, b) => b.date.toMillis() - a.date.toMillis());
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (transactions) => this.transactions = transactions,
      error: (err) => console.error('Error fetching transactions', err)
    });
  }

  getAccountName(accountId: string): string {
    return this.accounts.find(a => a.id === accountId)?.name ?? 'Unknown';
  }

  getAccountType(accountId: string): string {
    return this.accounts.find(a => a.id === accountId)?.type ?? '';
  }

  isSent(transaction: Transaction): boolean {
    return this.accounts.some(a => a.id === transaction.fromAccountId);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
