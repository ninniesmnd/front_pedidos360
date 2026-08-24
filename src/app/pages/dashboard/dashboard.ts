import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  // TODO: reemplazar por el nombre real que entrega MSAL una vez conectado.
  protected readonly nombreUsuario = signal('Usuario');
}