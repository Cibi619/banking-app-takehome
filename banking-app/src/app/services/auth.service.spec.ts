import { TestBed } from '@angular/core/testing';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  authState,
} from '@angular/fire/auth';
import { of } from 'rxjs';
import { AuthService } from './auth.service';

jest.mock('@angular/fire/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  authState: jest.fn(),
  Auth: class {},
}));

describe('AuthService', () => {
  let service: AuthService;
  const mockAuth = { currentUser: { uid: 'test-uid' } };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Auth, useValue: mockAuth },
      ]
    });
    service = TestBed.inject(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('signup() should call createUserWithEmailAndPassword with correct args', () => {
    (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: { uid: '123' } });
    service.signup('test@test.com', 'password123');
    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(mockAuth, 'test@test.com', 'password123');
  });

  it('login() should call signInWithEmailAndPassword with correct args', () => {
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: { uid: '123' } });
    service.login('test@test.com', 'password123');
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(mockAuth, 'test@test.com', 'password123');
  });

  it('logout() should call signOut', () => {
    (signOut as jest.Mock).mockResolvedValue(undefined);
    service.logout();
    expect(signOut).toHaveBeenCalledWith(mockAuth);
  });

  it('getCurrentUser() should return observable from authState', (done) => {
    const mockUser = { uid: 'user-123' };
    (authState as jest.Mock).mockReturnValue(of(mockUser));
    service.getCurrentUser().subscribe(user => {
      expect(user).toEqual(mockUser);
      done();
    });
  });

  it('getCurrentUser() should emit null when no user is signed in', (done) => {
    (authState as jest.Mock).mockReturnValue(of(null));
    service.getCurrentUser().subscribe(user => {
      expect(user).toBeNull();
      done();
    });
  });
});
