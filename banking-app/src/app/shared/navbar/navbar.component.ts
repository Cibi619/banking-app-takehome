import { Component, inject } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIcon } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-navbar',
  imports: [MatToolbar, MatIcon, MatButton],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
