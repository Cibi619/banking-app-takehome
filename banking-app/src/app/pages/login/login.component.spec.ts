import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute, provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

jest.mock('@angular/fire/auth', () => ({
  Auth: jest.fn(),
  authState: jest.fn(() => ({ subscribe: jest.fn() })),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('@angular/fire/firestore', () => ({
  Firestore: jest.fn(),
  collection: jest.fn(),
  collectionData: jest.fn(() => ({ subscribe: jest.fn() })),
  doc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
}));

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceMock: jest.Mocked<Pick<AuthService, 'login' | 'signup'>>;
  let navigateSpy: jest.SpyInstance;

  beforeEach(async () => {
    authServiceMock = { login: jest.fn(), signup: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
        { provide: ActivatedRoute, useValue: { snapshot: { url: [{ path: 'login' }] } } },
      ]
    }).compileComponents();

    navigateSpy = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set isLoginMode to true when route is login', () => {
    expect(component.isLoginMode).toBe(true);
  });

  describe('passwordMatchValidator()', () => {
    it('should return null when passwords match', () => {
      component.signupForm.patchValue({ password: 'pass123', confirmPassword: 'pass123' });
      expect(component.passwordMatchValidator(component.signupForm)).toBeNull();
    });

    it('should set passwordMismatch error when passwords differ', () => {
      component.signupForm.patchValue({ password: 'pass123', confirmPassword: 'different' });
      component.passwordMatchValidator(component.signupForm);
      expect(component.signupForm.get('confirmPassword')?.hasError('passwordMismatch')).toBe(true);
    });

    it('should clear errors when passwords match after a mismatch', () => {
      component.signupForm.patchValue({ password: 'pass123', confirmPassword: 'different' });
      component.passwordMatchValidator(component.signupForm);
      component.signupForm.patchValue({ confirmPassword: 'pass123' });
      component.passwordMatchValidator(component.signupForm);
      expect(component.signupForm.get('confirmPassword')?.hasError('passwordMismatch')).toBe(false);
    });
  });

  describe('onSubmit() - login mode', () => {
    beforeEach(() => { component.isLoginMode = true; });

    it('should not call login when form is invalid', async () => {
      component.loginForm.patchValue({ email: '', password: '' });
      await component.onSubmit();
      expect(authServiceMock.login).not.toHaveBeenCalled();
    });

    it('should call login and navigate to /accounts on success', async () => {
      (authServiceMock.login as jest.Mock).mockResolvedValue({});
      component.loginForm.patchValue({ email: 'user@test.com', password: 'password123' });
      await component.onSubmit();
      expect(authServiceMock.login).toHaveBeenCalledWith('user@test.com', 'password123');
      expect(navigateSpy).toHaveBeenCalledWith(['/accounts']);
    });

    it('should set errorMessage on invalid-credential error', async () => {
      (authServiceMock.login as jest.Mock).mockRejectedValue({ code: 'auth/invalid-credential', message: '' });
      component.loginForm.patchValue({ email: 'user@test.com', password: 'wrongpass' });
      await component.onSubmit();
      expect(component.errorMessage).toBe('Incorrect password');
    });

    it('should set errorMessage on invalid-email error', async () => {
      (authServiceMock.login as jest.Mock).mockRejectedValue({ code: 'auth/invalid-email', message: '' });
      component.loginForm.patchValue({ email: 'user@test.com', password: 'pass123' });
      await component.onSubmit();
      expect(component.errorMessage).toBe('Invalid email address');
    });

    it('should set errorMessage on email-already-in-use error', async () => {
      (authServiceMock.login as jest.Mock).mockRejectedValue({ code: 'auth/email-already-in-use', message: '' });
      component.loginForm.patchValue({ email: 'user@test.com', password: 'pass123' });
      await component.onSubmit();
      expect(component.errorMessage).toBe('Email already in use');
    });

    it('should set generic errorMessage for unknown errors', async () => {
      (authServiceMock.login as jest.Mock).mockRejectedValue({ code: 'auth/unknown', message: '' });
      component.loginForm.patchValue({ email: 'user@test.com', password: 'pass123' });
      await component.onSubmit();
      expect(component.errorMessage).toBe('Something went wrong. Please try again');
    });
  });

  describe('onSubmit() - signup mode', () => {
    beforeEach(() => { component.isLoginMode = false; });

    it('should not call signup when form is invalid', async () => {
      component.signupForm.patchValue({ name: '', email: '', password: '', confirmPassword: '' });
      await component.onSubmit();
      expect(authServiceMock.signup).not.toHaveBeenCalled();
    });

    it('should call signup and navigate to /accounts on success', async () => {
      (authServiceMock.signup as jest.Mock).mockResolvedValue({});
      component.signupForm.patchValue({
        name: 'Test User',
        email: 'user@test.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      await component.onSubmit();
      expect(authServiceMock.signup).toHaveBeenCalledWith('user@test.com', 'password123');
      expect(navigateSpy).toHaveBeenCalledWith(['/accounts']);
    });
  });
});
