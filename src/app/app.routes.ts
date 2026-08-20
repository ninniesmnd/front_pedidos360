import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';

export const routes: Routes = [
  {
    path: '',
    component: Home,
    title: 'Pedidos 360 | Inicio'
  },
  {
    path: 'login',
    component: Login,
    title: 'Pedidos 360 | Iniciar sesión'
  }
];