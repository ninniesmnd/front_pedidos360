import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { SobreNosotrosPagina } from './pages/sobre-nosotros/sobre-nosotros';
import { MsalGuard } from '@azure/msal-angular';
import { rolesLoadedGuard } from './core/auth/roles-loaded.guard';

export const routes: Routes = [
  {
    path: '',
    component: Home,
    title: 'Pedidos 360 | Inicio'
  },
  {
    path: 'sobre-nosotros',
    component: SobreNosotrosPagina,
    title: 'Pedidos 360 | Sobre nosotros'
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
    canActivate: [MsalGuard, rolesLoadedGuard]
  }
];