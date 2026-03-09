import { TestBed } from '@angular/core/testing';

jest.mock('@angular/fire/auth', () => ({ Auth: class {} }));

import {
  Firestore,
  addDoc,
  collection,
  getDocs,
  query,
  where,
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { TransactionService } from './transaction.service';

jest.mock('@angular/fire/firestore', () => ({
  Firestore: class {},
  addDoc: jest.fn(),
  collection: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  DocumentReference: class {},
}));

describe('TransactionService', () => {
  let service: TransactionService;
  const mockFirestore = {};
  const mockAuth = { currentUser: { uid: 'test-uid' } };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TransactionService,
        { provide: Firestore, useValue: mockFirestore },
        { provide: Auth, useValue: mockAuth },
      ]
    });
    service = TestBed.inject(TransactionService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createTransaction()', () => {
    it('should call addDoc with transaction data and userId', async () => {
      const mockCollectionRef = {};
      (collection as jest.Mock).mockReturnValue(mockCollectionRef);
      (addDoc as jest.Mock).mockResolvedValue({ id: 'tx-id' });

      const transaction = {
        fromAccountId: 'acc1',
        toAccountId: 'acc2',
        amount: 100,
        date: { toMillis: () => 0 } as any,
        description: 'Test',
      };
      await service.createTransaction(transaction);

      expect(collection).toHaveBeenCalledWith(mockFirestore, 'transactions');
      expect(addDoc).toHaveBeenCalledWith(mockCollectionRef, { ...transaction, userId: 'test-uid' });
    });
  });

  describe('getTransactionsByAccount()', () => {
    it('should return combined sent and received transactions sorted by date desc', (done) => {
      const sentDoc = {
        id: 'tx1',
        data: () => ({ fromAccountId: 'acc1', toAccountId: 'acc2', amount: 100, date: { toMillis: () => 2000 } }),
      };
      const receivedDoc = {
        id: 'tx2',
        data: () => ({ fromAccountId: 'acc2', toAccountId: 'acc1', amount: 50, date: { toMillis: () => 1000 } }),
      };
      (collection as jest.Mock).mockReturnValue({});
      (query as jest.Mock).mockReturnValue({});
      (where as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock)
        .mockResolvedValueOnce({ docs: [sentDoc] })
        .mockResolvedValueOnce({ docs: [receivedDoc] });

      service.getTransactionsByAccount('acc1').subscribe(transactions => {
        expect(transactions).toHaveLength(2);
        expect(transactions[0].id).toBe('tx1'); // most recent first
        expect(transactions[1].id).toBe('tx2');
        done();
      });
    });

    it('should return empty array when no transactions exist', (done) => {
      (collection as jest.Mock).mockReturnValue({});
      (query as jest.Mock).mockReturnValue({});
      (where as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock)
        .mockResolvedValueOnce({ docs: [] })
        .mockResolvedValueOnce({ docs: [] });

      service.getTransactionsByAccount('acc1').subscribe(transactions => {
        expect(transactions).toHaveLength(0);
        done();
      });
    });
  });
});
