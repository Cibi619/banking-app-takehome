import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Account } from '../../models/account.model';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  let dialogRefMock: jest.Mocked<Pick<MatDialogRef<ConfirmDialogComponent>, 'close'>>;

  const mockDialogData = {
    fromAccount: { id: 'acc1', name: 'Chequing', type: 'chequing', balance: 500, createdAt: {} } as Account,
    toAccount: { id: 'acc2', name: 'Savings', type: 'savings', balance: 200, createdAt: {} } as Account,
    amount: 100,
  };

  beforeEach(async () => {
    dialogRefMock = { close: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: MatDialogRef, useValue: dialogRefMock },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('confirm() should close dialog with true', () => {
    component.confirm();
    expect(dialogRefMock.close).toHaveBeenCalledWith(true);
  });

  it('cancel() should close dialog with false', () => {
    component.cancel();
    expect(dialogRefMock.close).toHaveBeenCalledWith(false);
  });
});
