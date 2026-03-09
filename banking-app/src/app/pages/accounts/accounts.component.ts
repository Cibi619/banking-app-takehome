import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavbarComponent } from '../../shared';
import { MatIcon } from '@angular/material/icon';
import { Account } from '../../models/account.model';
import { MatCard, MatCardContent } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { AccountService } from '../../services/account.service';
import { AuthService } from '../../services/auth.service';
import { of, switchMap } from 'rxjs';
import { MatProgressSpinner} from '@angular/material/progress-spinner';
import { LoadingService } from '../../services/loading.service';
import { CustomButtonComponent } from '../../shared/custom-button/custom-button.component';

@Component({
  selector: 'app-accounts',
  imports: [NavbarComponent, MatIcon, MatCard, MatCardContent, RouterLink, TitleCasePipe, DecimalPipe, MatProgressSpinner, CustomButtonComponent],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.scss'
})
export class AccountsComponent implements OnInit {
  accounts: Account[] = [];
  loadingService = inject(LoadingService);

  private destroyRef = inject(DestroyRef);
  private accountService = inject(AccountService);
  private authService = inject(AuthService);

  ngOnInit() {
    this.loadingService.start();
    this.authService.getCurrentUser().pipe(
      switchMap(user => user ? this.accountService.getAccounts() : of([])),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (accounts) => {
        this.accounts = accounts
        this.loadingService.stop();
      },
      error: (err) => {
        console.error('Error fetching accounts', err)
        this.loadingService.stop();
      }
    });
  }
}