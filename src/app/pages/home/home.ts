import { Component } from '@angular/core';
import { Hero } from './components/hero/hero';
import { Productos } from './components/productos/productos';
import { SobreNosotros } from './components/sobre-nosotros/sobre-nosotros';

@Component({
  selector: 'app-home',
  imports: [Hero, Productos, SobreNosotros],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {}