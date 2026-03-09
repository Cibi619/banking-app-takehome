import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TransferComponent } from './transfer.component';
import { AccountService } from '../../services/account.service';
import { TransactionService } from '../../services/transaction.service';
import { Router, ActivatedRoute, provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Account } from '../../models/account.model';
import { AuthService } from '../../services/auth.service';

jest.mock('@angular/fire/auth', () => ({
  Auth: jest.fn(),
  authState: jest.fn(() => of(null)),
}));

jest.mock('@angular/fire/firestore', () => ({
  Firestore: jest.fn(),
  collection: jest.fn(),
  collectionData: jest.fn(() => of([])),
  doc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
}));

const authServiceMock = {
  getCurrentUser: jest.fn().mockReturnValue(of({ uid: '123' })),
  authState$: of({ uid: '123' }),
  logout: jest.fn().mockResolvedValue(undefined)
};

describe('TransferComponent', () => {
  let component: TransferComponent;
  let fixture: ComponentFixture<TransferComponent>;
  let accountServiceMock: jest.Mocked<Pick<AccountService, 'getAccounts' | 'updateAccounts'>>;
  let dialogMock: jest.Mocked<Pick<MatDialog, 'open'>>;

  const mockAccounts: Account[] = [
    { id: 'acc1', name: 'Chequing', type: 'chequing', balance: 500, createdAt: {} as any },
    { id: 'acc2', name: 'Savings', type: 'savings', balance: 200, createdAt: {} as any },
  ];

  beforeEach(async () => {
    accountServiceMock = {
      getAccounts: jest.fn().mockReturnValue(of(mockAccounts)),
      updateAccounts: jest.fn().mockResolvedValue(undefined),
    };
    dialogMock = {
    open: jest.fn().mockReturnValue({
      afterClosed: () => of(true),
      close: jest.fn()
    })
  } as any;

    await TestBed.configureTestingModule({
      imports: [TransferComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),

        { provide: AccountService, useValue: accountServiceMock },
        { provide: TransactionService, useValue: { createTransaction: jest.fn().mockResolvedValue({}) } },
        { provide: AuthService, useValue: authServiceMock },
      ]
    })
    .overrideComponent(TransferComponent, {
      add: { providers: [{ provide: MatDialog, useValue: dialogMock }] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load accounts on init', () => {
    expect(component.accounts).toEqual(mockAccounts);
  });

  describe('availableBalance getter', () => {
    it('should return balance of selected fromAccount', () => {
      component.transferForm.patchValue({ fromAccountId: 'acc1' });
      expect(component.availableBalance).toBe(500);
    });

    it('should return 0 when no account is selected', () => {
      component.transferForm.patchValue({ fromAccountId: '' });
      expect(component.availableBalance).toBe(0);
    });
  });

  describe('onSubmit()', () => {
    it('should not proceed when form is invalid', () => {
      component.transferForm.reset();
      component.onSubmit();
      expect(dialogMock.open).not.toHaveBeenCalled();
    });

    it('should set error when transferring to the same account', () => {
      component.transferForm.patchValue({ fromAccountId: 'acc1', toAccountId: 'acc1', amount: 100 });
      component.onSubmit();
      expect(component.errorMessage).toBe('Cannot transfer to the same account');
    });

    it('should set error when amount exceeds available balance', () => {
      component.transferForm.patchValue({ fromAccountId: 'acc1', toAccountId: 'acc2', amount: 1000 });
      component.onSubmit();
      expect(component.errorMessage).toBe('Amount exceeds available balance');
    });

    it('should open confirm dialog when transfer is valid', () => {
      (dialogMock.open as jest.Mock).mockReturnValue({ afterClosed: () => of(false) });
      component.transferForm.patchValue({ fromAccountId: 'acc1', toAccountId: 'acc2', amount: 100 });
      component.onSubmit();
      expect(dialogMock.open).toHaveBeenCalled();
    });
  });
});
