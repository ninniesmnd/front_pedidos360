import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private readonly msalService = inject(MsalService);
  private readonly router = inject(Router);

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

    // TODO: formulario de referencia — el login real es loginConMicrosoft().
    console.log('Login (placeholder):', this.correo(), this.clave());

    setTimeout(() => this.cargando.set(false), 800);
  }

  protected loginConMicrosoft(): void {
    this.msalService.loginRedirect({
      scopes: ['user.read'],
      redirectStartPage: '/dashboard'
    });
  }
}