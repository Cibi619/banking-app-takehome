import { Component } from '@angular/core';
import { NavbarComponent } from '../../shared';
import { MatIcon } from '@angular/material/icon';
import { Account } from '../../models/account.model';
import { MatCard, MatCardContent } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { DecimalPipe, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-accounts',
  imports: [NavbarComponent, MatIcon, MatCard, MatCardContent, RouterLink, TitleCasePipe, DecimalPipe],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.scss'
})
export class AccountsComponent {
  accounts: Account[] = [];
}
