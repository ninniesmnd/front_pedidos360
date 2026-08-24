import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';  
import { MsalGuard } from '@azure/msal-angular';

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
  },
  {
      path: 'dashboard',
      component: Dashboard,
      title: 'Pedidos 360 | Panel',
      canActivate: [MsalGuard]

    }
  ];