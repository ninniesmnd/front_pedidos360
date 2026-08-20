import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  protected readonly correo = signal('');
  protected readonly clave = signal('');
  protected readonly cargando = signal(false);

  protected onCorreoChange(valor: string): void {
    this.correo.set(valor);
  }

  protected onClaveChange(valor: string): void {
    this.clave.set(valor);
  }

  protected enviar(): void {
    this.cargando.set(true);

    // TODO: reemplazar por la autenticación real con Azure AD (MSAL) en la próxima clase.
    console.log('Login (placeholder):', this.correo(), this.clave());

    setTimeout(() => this.cargando.set(false), 800);
  }
}