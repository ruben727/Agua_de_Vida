import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { Contacto } from './pages/contacto/contacto';
import { Predicas } from './pages/predicas/predicas';
import { Avisos } from './pages/avisos/avisos';
import { Privacidad } from './pages/privacidad/aviso/aviso';
import { Login } from './auth/login/login';
import { FaceCapture } from './auth/face-capture/face-capture';
import { Panel } from './admi/panel/panel';



export const routes: Routes = [
  { path: '', component: Home },
  { path: 'contacto', component: Contacto },
  { path: 'predicas', component: Predicas },
  { path: 'avisos', component: Avisos },
  { path: 'privacidad', component: Privacidad},
  { path: 'login', component: Login},
  { path: 'registro', component: FaceCapture},
  { path: 'panel', component: Panel},

];