import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Sidebar } from '../../components/sidebar/sidebar';

interface Usuario {
  id: number;
  nombre: string;
  apellidos: string;
  correo: string;
  activo: boolean;
  creado_en: string;
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Sidebar],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.css']
})
export class Usuarios implements OnInit {
  usuarios = signal<Usuario[]>([]);
  loading = signal(true);
  errorMsg = signal('');
  successMsg = signal('');
  sidebarCollapsed = false;

  // Modal agregar
  modalOpen = signal(false);
  guardando = signal(false);
  formError = signal('');

  form = {
    nombre: '',
    apellidos: '',
    correo: '',
    contrasena: ''
  };

  private API = 'https://adv-backend-two.vercel.app/api';

  constructor(private router: Router) {}

  get token(): string {
    return localStorage.getItem('admin_token') || '';
  }

  ngOnInit() {
    if (!this.token) {
      this.router.navigate(['/login']);
      return;
    }
    this.cargarUsuarios();
  }

  onSidebarCollapse(collapsed: boolean) {
    this.sidebarCollapsed = collapsed;
  }

  cargarUsuarios() {
    this.loading.set(true);
    fetch(`${this.API}/usuarios`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    })
    .then(r => {
      if (!r.ok) throw new Error('No autorizado');
      return r.json();
    })
    .then(data => {
      this.usuarios.set(data.usuarios);
      this.loading.set(false);
    })
    .catch(() => {
      this.loading.set(false);
      this.errorMsg.set('Error al cargar los usuarios.');
    });
  }

  abrirModal() {
    this.form = { nombre: '', apellidos: '', correo: '', contrasena: '' };
    this.formError.set('');
    this.modalOpen.set(true);
  }

  cerrarModal() {
    this.modalOpen.set(false);
  }

  guardarUsuario() {
    if (!this.form.nombre || !this.form.apellidos || !this.form.correo || !this.form.contrasena) {
      this.formError.set('Todos los campos son requeridos.');
      return;
    }
    if (this.form.contrasena.length < 8) {
      this.formError.set('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    this.guardando.set(true);
    this.formError.set('');

    fetch(`${this.API}/usuarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify(this.form)
    })
    .then(r => r.json().then(data => ({ status: r.status, data })))
    .then(({ status, data }) => {
      this.guardando.set(false);
      if (status === 201) {
        this.cerrarModal();
        this.mostrarExito('Usuario creado exitosamente.');
        this.cargarUsuarios();
      } else {
        this.formError.set(data.message || 'Error al crear el usuario.');
      }
    })
    .catch(() => {
      this.guardando.set(false);
      this.formError.set('Error de conexión con el servidor.');
    });
  }

  toggleActivo(usuario: Usuario) {
    const nuevoEstado = !usuario.activo;
    fetch(`${this.API}/usuarios/${usuario.id}/activo`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({ activo: nuevoEstado })
    })
    .then(r => r.json())
    .then(() => {
      this.usuarios.update(list =>
        list.map(u => u.id === usuario.id ? { ...u, activo: nuevoEstado } : u)
      );
      this.mostrarExito(`Usuario ${nuevoEstado ? 'activado' : 'desactivado'}.`);
    })
    .catch(() => this.errorMsg.set('Error al actualizar el usuario.'));
  }

  eliminarUsuario(usuario: Usuario) {
    if (!confirm(`¿Seguro que deseas eliminar a ${usuario.nombre} ${usuario.apellidos}?`)) return;

    fetch(`${this.API}/usuarios/${usuario.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${this.token}` }
    })
    .then(r => r.json().then(data => ({ status: r.status, data })))
    .then(({ status, data }) => {
      if (status === 200) {
        this.usuarios.update(list => list.filter(u => u.id !== usuario.id));
        this.mostrarExito(data.message);
      } else {
        this.errorMsg.set(data.message);
      }
    })
    .catch(() => this.errorMsg.set('Error al eliminar el usuario.'));
  }

  mostrarExito(msg: string) {
    this.successMsg.set(msg);
    this.errorMsg.set('');
    setTimeout(() => this.successMsg.set(''), 3500);
  }

  formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  inicialAvatar(nombre: string): string {
    return nombre?.charAt(0).toUpperCase() || '?';
  }
}