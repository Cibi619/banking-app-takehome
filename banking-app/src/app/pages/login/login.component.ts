import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CustomButtonComponent } from '../../shared/custom-button/custom-button.component';
import { MatCardModule } from '@angular/material/card';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [MatIconModule, CustomButtonComponent, MatCardModule, MatFormField, MatLabel, MatError, MatInputModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  isLoginMode: boolean = true;
  errorMessage: string | null = null;
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    this.isLoginMode = this.route.snapshot.url[0].path === 'login';
  }

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  signupForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: this.passwordMatchValidator });

  async onSubmit() {
    try {
      if (this.isLoginMode) {
        if (this.loginForm.invalid) return;
        const { email, password } = this.loginForm.value;
        await this.authService.login(email, password);
        this.router.navigate(['/accounts']);
      } else {
        if (this.signupForm.invalid) return;
        const { email, password } = this.signupForm.value;
        await this.authService.signup(email, password);
        this.router.navigate(['/accounts']);
      }
    } catch (error: any) {
      switch (error.code) {
        case 'auth/invalid-credential':
          this.loginForm.get('password')?.setErrors({ invalidCredential: true });
          this.errorMessage = 'Incorrect password';
          break;
        case 'auth/invalid-email':
          this.loginForm.get('email')?.setErrors({ invalidEmail: true });
          this.errorMessage = 'Invalid email address';
          break;
        case 'auth/email-already-in-use':
          this.loginForm.get('email')?.setErrors({ invalidEmail: true });
          this.errorMessage = 'Email already in use';
          break;
        default:
          this.errorMessage = 'Something went wrong. Please try again';
      }
    }
  }

  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    } else {
      form.get('confirmPassword')?.setErrors(null);
    }
    return null;
  }
}
