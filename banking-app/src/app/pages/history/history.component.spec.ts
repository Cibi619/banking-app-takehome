import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistoryComponent } from './history.component';
import { AccountService } from '../../services/account.service';
import { TransactionService } from '../../services/transaction.service';
import { AuthService } from '../../services/auth.service';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Account } from '../../models/account.model';
import { Transaction } from '../../models/transaction.model';

jest.mock('@angular/fire/auth', () => ({
  Auth: class {},
  authState: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('@angular/fire/firestore', () => ({
  Firestore: class {},
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

describe('HistoryComponent', () => {
  let component: HistoryComponent;
  let fixture: ComponentFixture<HistoryComponent>;

  const mockAccounts: Account[] = [
    { id: 'acc1', name: 'Chequing', type: 'chequing', balance: 500, createdAt: {} as any },
    { id: 'acc2', name: 'Savings', type: 'savings', balance: 200, createdAt: {} as any },
  ];

  const mockTransactions: Transaction[] = [
    { id: 'tx1', fromAccountId: 'acc1', toAccountId: 'acc2', amount: 50, date: { toMillis: () => 2000, toDate: () => new Date(2000) } as any },
    { id: 'tx2', fromAccountId: 'acc2', toAccountId: 'acc1', amount: 30, date: { toMillis: () => 1000, toDate: () => new Date(1000) } as any },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: AccountService, useValue: { getAccounts: jest.fn().mockReturnValue(of(mockAccounts)) } },
        { provide: TransactionService, useValue: { getTransactionsByAccount: jest.fn().mockReturnValue(of(mockTransactions)) } },
        { provide: AuthService, useValue: { logout: jest.fn().mockResolvedValue(undefined), getCurrentUser: jest.fn().mockReturnValue(of(null)), authState$: of(null) } },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load and deduplicate transactions on init', () => {
    expect(component.transactions.length).toBeGreaterThan(0);
    const ids = component.transactions.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  describe('getAccountName()', () => {
    beforeEach(() => { component.accounts = mockAccounts; });

    it('should return account name when found', () => {
      expect(component.getAccountName('acc1')).toBe('Chequing');
    });

    it('should return "Unknown" when account not found', () => {
      expect(component.getAccountName('nonexistent')).toBe('Unknown');
    });
  });

  describe('getAccountType()', () => {
    beforeEach(() => { component.accounts = mockAccounts; });

    it('should return account type when found', () => {
      expect(component.getAccountType('acc2')).toBe('savings');
    });

    it('should return empty string when account not found', () => {
      expect(component.getAccountType('nonexistent')).toBe('');
    });
  });

  describe('isSent()', () => {
    beforeEach(() => { component.accounts = mockAccounts; });

    it('should return true when fromAccountId belongs to user', () => {
      expect(component.isSent(mockTransactions[0])).toBe(true);
    });

    it('should return false when fromAccountId is external', () => {
      const externalTx: Transaction = {
        fromAccountId: 'external-acc',
        toAccountId: 'acc1',
        amount: 100,
        date: {} as any,
      };
      expect(component.isSent(externalTx)).toBe(false);
    });
  });

  describe('onSearch()', () => {
    beforeEach(() => {
      component.accounts = mockAccounts;
      component.transactions = mockTransactions;
      component.filteredTransactions = [...mockTransactions];
    });

    it('should reset to all transactions when search term is empty', () => {
      component.onSearch('');
      expect(component.filteredTransactions).toEqual(mockTransactions);
    });

    it('should filter transactions by account name', () => {
      component.onSearch('Chequing');
      expect(component.filteredTransactions.length).toBeGreaterThan(0);
      component.filteredTransactions.forEach(t => {
        const names = [component.getAccountName(t.fromAccountId), component.getAccountName(t.toAccountId)];
        expect(names.some(n => n.toLowerCase().includes('chequing'))).toBe(true);
      });
    });

    it('should filter by amount', () => {
      component.onSearch('50');
      expect(component.filteredTransactions).toHaveLength(1);
      expect(component.filteredTransactions[0].amount).toBe(50);
    });

    it('should return empty array when no match found', () => {
      component.onSearch('zzznomatch');
      expect(component.filteredTransactions).toHaveLength(0);
    });
  });
});
