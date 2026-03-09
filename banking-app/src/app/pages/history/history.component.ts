import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Account } from '../../models/account.model';
import { forkJoin, map, switchMap } from 'rxjs';
import { AccountService } from '../../services/account.service';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction.model';
import { NavbarComponent } from '../../shared';
import { MatIcon } from '@angular/material/icon';
import { DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LoadingService } from '../../services/loading.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-history',
  imports: [NavbarComponent, MatIcon, DatePipe, DecimalPipe, TitleCasePipe, RouterLink, MatProgressSpinner],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent implements OnInit {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  accounts: Account[] = [];
  searchTerm = '';
  private destroyRef = inject(DestroyRef);
  private accountService = inject(AccountService);
  private transactionService = inject(TransactionService);
  loadingService = inject(LoadingService);

  ngOnInit() {
    this.loadingService.start();
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
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (transactions) => {
        this.loadingService.stop();
        this.transactions = transactions;
        this.filteredTransactions = transactions;
      },
      error: (err) => {
        this.loadingService.stop();
        console.error('Error fetching transactions', err)
      }
    });
  }

  onSearch(term: string) {
    this.searchTerm = term;
    const lower = term.toLowerCase().trim();
    if (!lower) {
      this.filteredTransactions = this.transactions;
      return;
    }
    this.filteredTransactions = this.transactions.filter(t =>
      this.getAccountName(t.toAccountId).toLowerCase().includes(lower) ||
      this.getAccountName(t.fromAccountId).toLowerCase().includes(lower) ||
      this.getAccountType(t.fromAccountId).toLowerCase().includes(lower) ||
      t.amount.toString().includes(lower)
    );
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

}
