import { TestBed } from '@angular/core/testing';

jest.mock('@angular/fire/auth', () => ({ Auth: class {} }));

import {
  Firestore,
  addDoc,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { AccountService } from './account.service';

jest.mock('@angular/fire/firestore', () => ({
  Firestore: class {},
  addDoc: jest.fn(),
  collection: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  updateDoc: jest.fn(),
  doc: jest.fn(),
  DocumentReference: class {},
}));

describe('AccountService', () => {
  let service: AccountService;
  const mockFirestore = {};
  const mockAuth: any = { currentUser: { uid: 'test-uid' } };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AccountService,
        { provide: Firestore, useValue: mockFirestore },
        { provide: Auth, useValue: mockAuth },
      ]
    });
    service = TestBed.inject(AccountService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createAccount()', () => {
    it('should call addDoc with account data and userId', async () => {
      const mockCollectionRef = {};
      (collection as jest.Mock).mockReturnValue(mockCollectionRef);
      (addDoc as jest.Mock).mockResolvedValue({ id: 'new-id' });

      const account = { name: 'Chequing', balance: 500, type: 'chequing' as const, createdAt: {} as any };
      await service.createAccount(account);

      expect(collection).toHaveBeenCalledWith(mockFirestore, 'accounts');
      expect(addDoc).toHaveBeenCalledWith(mockCollectionRef, { ...account, userId: 'test-uid' });
    });
  });

  describe('getAccounts()', () => {
    it('should return empty array when no user is logged in', (done) => {
      mockAuth.currentUser = null;
      service.getAccounts().subscribe(accounts => {
        expect(accounts).toEqual([]);
        mockAuth.currentUser = { uid: 'test-uid' };
        done();
      });
    });

    it('should return mapped accounts for the current user', (done) => {
      mockAuth.currentUser = { uid: 'test-uid' };
      const mockDoc = {
        id: 'acc1',
        data: () => ({ name: 'Chequing', balance: 100, type: 'chequing', createdAt: {} }),
      };
      (collection as jest.Mock).mockReturnValue({});
      (query as jest.Mock).mockReturnValue({});
      (where as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock).mockResolvedValue({ docs: [mockDoc] });

      service.getAccounts().subscribe(accounts => {
        expect(accounts).toHaveLength(1);
        expect(accounts[0].id).toBe('acc1');
        expect(accounts[0].name).toBe('Chequing');
        done();
      });
    });
  });

  describe('updateAccounts()', () => {
    it('should call updateDoc with new balance', async () => {
      const mockDocRef = {};
      (doc as jest.Mock).mockReturnValue(mockDocRef);
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await service.updateAccounts('account-id', 750);

      expect(doc).toHaveBeenCalledWith(mockFirestore, 'accounts', 'account-id');
      expect(updateDoc).toHaveBeenCalledWith(mockDocRef, { balance: 750 });
    });
  });
});
