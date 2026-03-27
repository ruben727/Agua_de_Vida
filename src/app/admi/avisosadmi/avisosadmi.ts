import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Sidebar } from '../../components/sidebar/sidebar';

interface Aviso {
  id: number;
  titulo: string;
  descripcion: string;
  imagen_url: string;
  fecha: string;
  activo: boolean;
  creado_en: string;
}

@Component({
  selector: 'app-avisosadmi',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Sidebar],
  templateUrl: './avisosadmi.html',
  styleUrls: ['./avisosadmi.css']
})
export class Avisosadmi implements OnInit {
  avisos = signal<Aviso[]>([]);
  loading = signal(true);
  errorMsg = signal('');
  successMsg = signal('');
  sidebarCollapsed = false;

  modalOpen = signal(false);
  guardando = signal(false);
  formError = signal('');
  imagenPreview = signal('');
  imagenFile: File | null = null;
  subiendoImagen = signal(false);

  form = {
    titulo: '',
    descripcion: '',
    imagen_url: '',
    fecha: ''
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
    this.cargarAvisos();
  }

  onSidebarCollapse(collapsed: boolean) {
    this.sidebarCollapsed = collapsed;
  }

  cargarAvisos() {
    this.loading.set(true);
    this.errorMsg.set('');

    fetch(`${this.API}/avisos`)
      .then(r => {
        if (!r.ok) throw new Error('Error al cargar avisos');
        return r.json();
      })
      .then(data => {
        this.avisos.set(Array.isArray(data) ? data : []);
        this.loading.set(false);
      })
      .catch(err => {
        this.avisos.set([]);
        this.loading.set(false);
        this.errorMsg.set(err.message || 'Error al cargar los avisos.');
      });
  }

  abrirModal() {
    this.form = { titulo: '', descripcion: '', imagen_url: '', fecha: '' };
    this.imagenPreview.set('');
    this.imagenFile = null;
    this.formError.set('');
    this.modalOpen.set(true);
  }

  cerrarModal() {
    this.modalOpen.set(false);
  }

  onImagenSeleccionada(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    this.imagenFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagenPreview.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  async subirImagen(): Promise<string> {
    if (!this.imagenFile) throw new Error('No hay imagen seleccionada.');

    this.subiendoImagen.set(true);
    const formData = new FormData();
    formData.append('imagen', this.imagenFile);

    const response = await fetch(`${this.API}/avisos/imagen`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    this.subiendoImagen.set(false);

    if (!response.ok) throw new Error(data.message || 'Error al subir imagen.');
    return data.url;
  }

  async guardarAviso() {
    if (!this.form.titulo || !this.form.descripcion || !this.form.fecha) {
      this.formError.set('Todos los campos son obligatorios.');
      return;
    }

    if (!this.imagenFile) {
      this.formError.set('Debes seleccionar una imagen.');
      return;
    }

    this.guardando.set(true);
    this.formError.set('');

    try {
      const imagen_url = await this.subirImagen();

      const response = await fetch(`${this.API}/avisos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...this.form, imagen_url })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al crear aviso.');

      this.guardando.set(false);
      this.cerrarModal();
      this.mostrarExito('Aviso creado exitosamente.');
      this.cargarAvisos();
    } catch (err: any) {
      this.guardando.set(false);
      this.formError.set(err.message || 'Error de conexión.');
    }
  }

  eliminarAviso(aviso: Aviso) {
    if (!confirm(`¿Seguro que deseas eliminar "${aviso.titulo}"?`)) return;

    fetch(`${this.API}/avisos/${aviso.id}`, {
      method: 'DELETE'
    })
      .then(async r => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.message || 'Error al eliminar');
        return data;
      })
      .then(() => {
        this.avisos.update(list => list.filter(a => a.id !== aviso.id));
        this.mostrarExito('Aviso eliminado correctamente.');
      })
      .catch(err => {
        this.errorMsg.set(err.message || 'Error al eliminar.');
        setTimeout(() => this.errorMsg.set(''), 3000);
      });
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
        day: '2-digit', month: 'short', year: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  }
}