import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-custom-button',
  imports: [MatButtonModule],
  templateUrl: './custom-button.component.html',
  styleUrl: './custom-button.component.scss'
})
export class CustomButtonComponent {
    @Input() label: string = '';
    @Input() accountType: 'chequing' | 'savings' = 'chequing';

    get buttonColor(): string {
      return this.accountType === 'chequing' ? 'primary' : 'accent';
    }
}
