import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('isLoading should be false by default', () => {
    expect(service.isLoading()).toBe(false);
  });

  it('start() should set isLoading to true', () => {
    service.start();
    expect(service.isLoading()).toBe(true);
  });

  it('stop() should set isLoading to false', () => {
    service.start();
    service.stop();
    expect(service.isLoading()).toBe(false);
  });
});
