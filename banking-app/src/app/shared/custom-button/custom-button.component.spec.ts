import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomButtonComponent } from './custom-button.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('CustomButtonComponent', () => {
  let component: CustomButtonComponent;
  let fixture: ComponentFixture<CustomButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomButtonComponent, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default type to "submit"', () => {
    expect(component.type).toBe('submit');
  });

  describe('buttonColor', () => {
    it('should return "primary" for chequing', () => {
      component.accountType = 'chequing';
      expect(component.buttonColor).toBe('primary');
    });

    it('should return "accent" for savings', () => {
      component.accountType = 'savings';
      expect(component.buttonColor).toBe('accent');
    });
  });

  describe('icon rendering', () => {
    it('should render mat-icon when icon is provided', () => {
      component.icon = 'add';
      fixture.detectChanges();
      const icon = fixture.nativeElement.querySelector('mat-icon');
      expect(icon).toBeTruthy();
      expect(icon.textContent.trim()).toBe('add');
    });

    it('should not render mat-icon when icon is empty', () => {
      component.icon = '';
      fixture.detectChanges();
      const icon = fixture.nativeElement.querySelector('mat-icon');
      expect(icon).toBeFalsy();
    });
  });
});
