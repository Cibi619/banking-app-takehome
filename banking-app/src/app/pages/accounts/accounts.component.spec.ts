import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountsComponent } from './accounts.component';
import { AccountService } from '../../services/account.service';
import { AuthService } from '../../services/auth.service';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Account } from '../../models/account.model';

jest.mock('@angular/fire/auth', () => ({
  Auth: jest.fn(),
  authState: jest.fn(() => of(null)),
}));

jest.mock('@angular/fire/firestore', () => ({
  Firestore: jest.fn(),
  collection: jest.fn(),
  collectionData: jest.fn(() => of([])),
}));

describe('AccountsComponent', () => {
  let component: AccountsComponent;
  let fixture: ComponentFixture<AccountsComponent>;
  let accountServiceMock: jest.Mocked<Pick<AccountService, 'getAccounts'>>;
  let authServiceMock: jest.Mocked<Pick<AuthService, 'getCurrentUser'>>;

  const mockAccounts: Account[] = [
    { id: 'acc1', name: 'Chequing', type: 'chequing', balance: 500, createdAt: {} as any },
    { id: 'acc2', name: 'Savings', type: 'savings', balance: 200, createdAt: {} as any },
  ];

  beforeEach(async () => {
    accountServiceMock = { getAccounts: jest.fn().mockReturnValue(of(mockAccounts)) };
    authServiceMock = { getCurrentUser: jest.fn().mockReturnValue(of({ uid: 'user-123' })) };

    await TestBed.configureTestingModule({
      imports: [AccountsComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: AccountService, useValue: accountServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load accounts on init when user is logged in', () => {
    expect(accountServiceMock.getAccounts).toHaveBeenCalled();
    expect(component.accounts).toEqual(mockAccounts);
  });

  it('should set accounts to empty array when user is not logged in', () => {
    authServiceMock.getCurrentUser.mockReturnValue(of(null));
    component.ngOnInit();
    expect(component.accounts).toEqual([]);
  });

  it('ngOnDestroy() should complete the destroy$ subject', () => {
    const nextSpy = jest.spyOn((component as any).destroy$, 'next');
    const completeSpy = jest.spyOn((component as any).destroy$, 'complete');
    component.ngOnDestroy();
    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});
