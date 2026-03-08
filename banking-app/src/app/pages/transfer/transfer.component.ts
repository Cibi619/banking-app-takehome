import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccountService } from '../../services/account.service';
import { TransactionService } from '../../services/transaction.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { Account } from '../../models/account.model';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { forkJoin, from, switchMap } from 'rxjs';
import { Timestamp } from '@angular/fire/firestore';
import { NavbarComponent } from '../../shared';
import { MatIcon } from '@angular/material/icon';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { MatSelect, MatOption } from '@angular/material/select'
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-transfer',
  imports: [MatDialogModule,
    NavbarComponent,
    MatIcon,
    ReactiveFormsModule,
    MatLabel,
    TitleCasePipe,
    MatSelect,
    MatError,
    MatFormField,
    DecimalPipe,
    MatOption,
    MatInputModule,
    MatButtonModule,
    RouterLink
  ],
  templateUrl: './transfer.component.html',
  styleUrl: './transfer.component.scss'
})
export class TransferComponent implements OnInit {
  accounts: Account[] = [];

  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private transactionService = inject(TransactionService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);

  transferForm = this.fb.group({
    fromAccountId: ['', Validators.required],
    toAccountId: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(1)]],
    description: ['']
  });
  errorMessage: string | undefined;

  ngOnInit() {
    this.accountService.getAccounts().subscribe(accounts => {
      this.accounts = accounts;
      const accountId = this.route.snapshot.queryParams['accountId'];
      if (accountId) {
        this.transferForm.patchValue({ fromAccountId: accountId });
      }
    })
  }

  get availableBalance() {
    const fromId = this.transferForm.get('fromAccountId')?.value;
    return this.accounts.find(u => u.id === fromId)?.balance ?? 0;
  }

  onSubmit() {
    if (this.transferForm.invalid) return;

    const { fromAccountId, toAccountId, amount } = this.transferForm.value;
    if (fromAccountId === toAccountId) {
      this.errorMessage = 'Cannot transfer to the same account';
      return;
    }
    if (amount! > this.availableBalance) {
      this.errorMessage = 'Amount exceeds available balance';
      return;
    }
    const fromAccount = this.accounts.find(acc => acc.id === fromAccountId);
    const toAccount = this.accounts.find(acc => acc.id === toAccountId);

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { fromAccount, toAccount, amount }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.performTransfer();
      }
    })
  }

  performTransfer() {
    const { fromAccountId, toAccountId, amount, description } = this.transferForm.value;
    const fromAccount = this.accounts.find(acc => acc.id === fromAccountId);
    const toAccount = this.accounts.find(acc => acc.id === toAccountId);

    const updateFromBalance$ = from(this.accountService.updateAccounts(
      fromAccountId!,
      fromAccount!.balance - amount!
    ));
    const updateToBalance$ = from(this.accountService.updateAccounts(
      toAccountId!,
      toAccount!.balance + amount!
    ));

    forkJoin([updateFromBalance$, updateToBalance$]).pipe(
      switchMap(() => from(this.transactionService.createTransaction({
        fromAccountId: fromAccountId!,
        toAccountId: toAccountId!,
        amount: amount!,
        date: Timestamp.now(),
        description: description || ''
      })))
    ).subscribe({
      next: () => this.router.navigate(['/accounts']),
      error: (err) => {
        console.error('Transfer failed', err);
        this.errorMessage = 'Transfer failed, please try again';
      }
    });
  }
}
