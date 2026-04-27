import { Component } from '@angular/core';

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.css'
})
export class RegisterFormComponent {

  togglePasswordVisibility(inputId: string): void {
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input) {
      input.type = input.type === 'password' ? 'text' : 'password';
    }
  }

  openDatePicker(event: any) {
    const input = event.target as HTMLInputElement;

    if (input.showPicker) {
      input.showPicker();
    }
  }
}
