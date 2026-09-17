import { Component } from '@angular/core';
import { Hero } from './components/hero/hero';
import { SobreNosotros } from './components/sobre-nosotros/sobre-nosotros';

@Component({
  selector: 'app-home',
  imports: [Hero, SobreNosotros],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {}