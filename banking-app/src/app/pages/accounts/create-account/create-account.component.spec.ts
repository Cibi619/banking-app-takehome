import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateAccountComponent } from './create-account.component';
import { AccountService } from '../../../services/account.service';
import { AuthService } from '../../../services/auth.service';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';


jest.mock('@angular/fire/auth', () => ({
  Auth: class {},
  authState: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('@angular/fire/firestore', () => ({
  Firestore: class {},
  Timestamp: { now: jest.fn().mockReturnValue({}) },
  collection: jest.fn(),
  collectionData: jest.fn(),
  addDoc: jest.fn(),
  getDocs: jest.fn(),
  doc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  updateDoc: jest.fn(),
  DocumentReference: class {},
}));

describe('CreateAccountComponent', () => {
  let component: CreateAccountComponent;
  let fixture: ComponentFixture<CreateAccountComponent>;
  let accountServiceMock: jest.Mocked<Pick<AccountService, 'createAccount'>>;
  let navigateSpy: jest.SpyInstance;

  beforeEach(async () => {
    accountServiceMock = { createAccount: jest.fn().mockResolvedValue({}) };

    await TestBed.configureTestingModule({
      imports: [CreateAccountComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: AccountService, useValue: accountServiceMock },
        { provide: AuthService, useValue: { logout: jest.fn().mockResolvedValue(undefined), getCurrentUser: jest.fn().mockReturnValue(of(null)), authState$: of(null) } },
      ]
    }).compileComponents();

    navigateSpy = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(CreateAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('selectedType getter', () => {
    it('should return chequing when type is chequing', () => {
      component.createAccountForm.patchValue({ type: 'chequing' });
      expect(component.selectedType).toBe('chequing');
    });

    it('should return savings when type is savings', () => {
      component.createAccountForm.patchValue({ type: 'savings' });
      expect(component.selectedType).toBe('savings');
    });
  });

  describe('onSubmit()', () => {
    it('should not create account when form is invalid', async () => {
      component.createAccountForm.patchValue({ name: '', balance: 0 });
      await component.onSubmit();
      expect(accountServiceMock.createAccount).not.toHaveBeenCalled();
    });

    it('should call createAccount with correct data and navigate when valid', async () => {
      component.createAccountForm.patchValue({ name: 'My Account', balance: 500, type: 'savings' });
      await component.onSubmit();

      expect(accountServiceMock.createAccount).toHaveBeenCalled();
      const arg = (accountServiceMock.createAccount as jest.Mock).mock.calls[0][0];
      expect(arg.name).toBe('My Account');
      expect(arg.balance).toBe(500);
      expect(arg.type).toBe('savings');
      expect(navigateSpy).toHaveBeenCalledWith(['/accounts']);
    });
  });
});
