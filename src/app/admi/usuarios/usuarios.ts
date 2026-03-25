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
  activo?: boolean;  // Opcional si no existe en la BD
  created_at?: string;
  creado_en?: string;
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
    this.errorMsg.set('');
    
    fetch(`${this.API}/usuarios`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    })
    .then(r => {
      if (r.status === 401) {
        localStorage.removeItem('admin_token');
        this.router.navigate(['/login']);
        throw new Error('Sesión expirada');
      }
      if (!r.ok) throw new Error('Error al cargar usuarios');
      return r.json();
    })
    .then(data => {
      // El backend devuelve directamente el array de usuarios
      const usuariosData = Array.isArray(data) ? data : data.usuarios || [];
      
      // Mapear los datos para asegurar que tienen la estructura correcta
      const usuariosFormateados = usuariosData.map((u: any) => ({
        id: u.id,
        nombre: u.nombre,
        apellidos: u.apellidos || '',
        correo: u.correo,
        activo: u.activo !== undefined ? u.activo : true,
        creado_en: u.created_at || u.creado_en || new Date().toISOString()
      }));
      
      this.usuarios.set(usuariosFormateados);
      this.loading.set(false);
    })
    .catch((error) => {
      console.error('Error cargando usuarios:', error);
      this.loading.set(false);
      this.errorMsg.set(error.message || 'Error al cargar los usuarios.');
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
    if (!this.form.nombre || !this.form.correo || !this.form.contrasena) {
      this.formError.set('Nombre, correo y contraseña son obligatorios.');
      return;
    }
    
    if (this.form.contrasena.length < 6) {
      this.formError.set('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (!this.form.correo.includes('@')) {
      this.formError.set('Ingresa un correo electrónico válido.');
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
    .then(async r => {
      const data = await r.json();
      if (!r.ok) throw new Error(data.message || 'Error al crear usuario');
      return data;
    })
    .then(() => {
      this.guardando.set(false);
      this.cerrarModal();
      this.mostrarExito('Usuario creado exitosamente.');
      this.cargarUsuarios(); // Recargar la lista
    })
    .catch((error) => {
      this.guardando.set(false);
      this.formError.set(error.message || 'Error de conexión con el servidor.');
    });
  }

  // Método para eliminar usuario
  eliminarUsuario(usuario: Usuario) {
    if (!confirm(`¿Seguro que deseas eliminar a ${usuario.nombre} ${usuario.apellidos || ''}?`)) return;

    fetch(`${this.API}/usuarios/${usuario.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${this.token}` }
    })
    .then(async r => {
      const data = await r.json();
      if (!r.ok) throw new Error(data.message || 'Error al eliminar');
      return data;
    })
    .then(() => {
      this.usuarios.update(list => list.filter(u => u.id !== usuario.id));
      this.mostrarExito('Usuario eliminado correctamente.');
    })
    .catch((error) => {
      this.errorMsg.set(error.message || 'Error al eliminar el usuario.');
      setTimeout(() => this.errorMsg.set(''), 3000);
    });
  }

  // MÉTODO TOGGLE ACTIVO AGREGADO
  toggleActivo(usuario: Usuario) {
    const nuevoEstado = !usuario.activo;
    
    // Actualizar localmente primero para mejor experiencia de usuario
    this.usuarios.update(list =>
      list.map(u => u.id === usuario.id ? { ...u, activo: nuevoEstado } : u)
    );
    
    // Mostrar mensaje de éxito temporal
    this.mostrarExito(`Usuario ${nuevoEstado ? 'activado' : 'desactivado'} correctamente.`);
    
    // Aquí deberías llamar a tu API si tienes el endpoint
    // Por ahora solo actualiza localmente porque tu backend no tiene el campo activo
    /*
    fetch(`${this.API}/usuarios/${usuario.id}/activo`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({ activo: nuevoEstado })
    })
    .then(r => {
      if (!r.ok) throw new Error('Error al actualizar');
      return r.json();
    })
    .catch(() => {
      // Revertir si hay error
      this.usuarios.update(list =>
        list.map(u => u.id === usuario.id ? { ...u, activo: !nuevoEstado } : u)
      );
      this.errorMsg.set('Error al actualizar el usuario.');
      setTimeout(() => this.errorMsg.set(''), 3000);
    });
    */
  }

  mostrarExito(msg: string) {
    this.successMsg.set(msg);
    this.errorMsg.set('');
    setTimeout(() => this.successMsg.set(''), 3500);
  }

  formatFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    try {
      return new Date(fecha).toLocaleDateString('es-MX', {
        day: '2-digit', 
        month: 'short', 
        year: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  }

  inicialAvatar(nombre: string): string {
    return nombre?.charAt(0).toUpperCase() || '?';
  }
}