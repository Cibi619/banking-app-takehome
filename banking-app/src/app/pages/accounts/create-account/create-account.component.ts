import { Component, inject } from '@angular/core';
import { CustomButtonComponent, NavbarComponent } from '../../../shared';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccountService } from '../../../services/account.service';
import { Router, RouterModule } from '@angular/router';
import { Account } from '../../../models/account.model';
import { Timestamp } from '@angular/fire/firestore';
import { MatIcon } from '@angular/material/icon';
import { MatError, MatFormField, MatFormFieldControl, MatLabel } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-create-account',
  imports: [CustomButtonComponent, NavbarComponent, ReactiveFormsModule, MatIcon, MatFormField, MatLabel, MatError, MatRadioModule, MatInputModule, RouterModule],
  templateUrl: './create-account.component.html',
  styleUrl: './create-account.component.scss'
})
export class CreateAccountComponent {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private router = inject(Router);

  createAccountForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    balance: [0, [Validators.required, Validators.min(1)]],
    type: ['chequing', Validators.required]
  });

  async onSubmit(): Promise<void> {
    if (this.createAccountForm.invalid) return;
    const {name, balance, type} = this.createAccountForm.value;
    const account: Account = {
      name: name!,
      balance: balance!,
      type: type as 'chequing' | 'savings',
      createdAt: Timestamp.now()
    };
    await this.accountService.createAccount(account);
    this.router.navigate(['/accounts']);
  }
  get selectedType(): 'chequing' | 'savings' {
    return this.createAccountForm.get('type')?.value as 'chequing' | 'savings';
  }
}
