import { Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  imports: [],
  templateUrl: './card.html',
  styleUrl: './card.css'
})
export class Card {
  readonly icono = input<string>('');
  readonly titulo = input.required<string>();
  readonly descripcion = input.required<string>();
  readonly variante = input<'clara' | 'ticket'>('clara');
}