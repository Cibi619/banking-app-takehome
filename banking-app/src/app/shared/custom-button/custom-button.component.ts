import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-custom-button',
  imports: [MatButtonModule, MatIcon],
  templateUrl: './custom-button.component.html',
  styleUrl: './custom-button.component.scss'
})
export class CustomButtonComponent {
    @Input() label: string = '';
    @Input() icon: string = '';
    @Input() type: 'submit' | 'button' = 'submit';
    @Input() accountType: 'chequing' | 'savings' = 'chequing';

    get buttonColor(): string {
      return this.accountType === 'chequing' ? 'primary' : 'accent';
    }
}
