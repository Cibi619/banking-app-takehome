import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

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
  doc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
}));

describe('authGuard', () => {
  let authServiceMock: jest.Mocked<Pick<AuthService, 'getCurrentUser'>>;
  let routerMock: jest.Mocked<Pick<Router, 'createUrlTree'>>;

  beforeEach(() => {
    authServiceMock = { getCurrentUser: jest.fn() };
    routerMock = { createUrlTree: jest.fn().mockReturnValue('/login') };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ]
    });
  });

  it('should return true when user is logged in', (done) => {
    authServiceMock.getCurrentUser.mockReturnValue(of({ uid: 'user-123' } as any));

    const result$ = TestBed.runInInjectionContext(() =>
      authGuard({} as any, {} as any)
    ) as any;

    result$.subscribe((result: any) => {
      expect(result).toBe(true);
      done();
    });
  });

  it('should redirect to /login when user is not logged in', (done) => {
    authServiceMock.getCurrentUser.mockReturnValue(of(null));

    const result$ = TestBed.runInInjectionContext(() =>
      authGuard({} as any, {} as any)
    ) as any;

    result$.subscribe(() => {
      expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/login']);
      done();
    });
  });
});
