import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Account } from '../../models/account.model';
import { DecimalPipe, TitleCasePipe } from '@angular/common';

interface DialogData {
  fromAccount: Account;
  toAccount: Account;
  amount: number;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [MatDialogModule, MatButtonModule, DecimalPipe, TitleCasePipe],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent {
  data: DialogData = inject(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);

  confirm() {
    this.dialogRef.close(true);
  }

  cancel() {
    this.dialogRef.close(false);
  }
}