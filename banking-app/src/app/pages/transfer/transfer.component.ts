import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccountService } from '../../services/account.service';
import { TransactionService } from '../../services/transaction.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { Account } from '../../models/account.model';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { forkJoin, from, switchMap, takeUntil } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Timestamp } from '@angular/fire/firestore';
import { NavbarComponent } from '../../shared';
import { NotificationService } from '../../services/notification.service';
import { MatIcon } from '@angular/material/icon';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { MatSelect, MatOption } from '@angular/material/select'
import { MatInputModule } from '@angular/material/input';
import { CustomButtonComponent } from '../../shared/custom-button/custom-button.component';
import { LoadingService } from '../../services/loading.service';
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
    CustomButtonComponent,
    RouterLink
  ],
  templateUrl: './transfer.component.html',
  styleUrl: './transfer.component.scss'
})
export class TransferComponent implements OnInit {
  accounts: Account[] = [];
  totalBalance: number = 0;

  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private transactionService = inject(TransactionService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);
  private destroyRef = inject(DestroyRef);
  loadingService = inject(LoadingService);

  transferForm = this.fb.group({
    fromAccountId: ['', Validators.required],
    toAccountId: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(1)]],
    description: ['']
  });
  errorMessage: string | undefined;

  ngOnInit() {
    // this.loadingService.start();
    this.accountService.getAccounts().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(accounts => {
      // this.loadingService.stop();
      this.accounts = accounts;
      const accountId = this.route.snapshot.queryParams['accountId'];
      if (accountId) {
        this.transferForm.patchValue({ fromAccountId: accountId });
      }
    })
    this.accountService.getTotalBalance().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(totalBalance => {
      this.totalBalance = totalBalance;
    });
  }

  get availableBalance(): number {
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
    dialogRef.afterClosed().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(confirmed => {
      if (confirmed) {
        this.performTransfer();
      }
    })
  }

  performTransfer(): void {
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
      }))),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        const fromAccount = this.accounts.find(acc => acc.id === fromAccountId);
        const toAccount = this.accounts.find(acc => acc.id === toAccountId);
        this.notificationService.add(`Transfer of $${amount} from ${fromAccount?.name} to ${toAccount?.name} was successful`);
        this.router.navigate(['/accounts']);
      },
      error: (err) => {
        console.error('Transfer failed', err);
        this.errorMessage = 'Transfer failed, please try again';
      }
    });
  }
}
