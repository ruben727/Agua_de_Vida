import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Sidebar } from '../../components/sidebar/sidebar';

interface BarDato {
  label: string;
  value: number;
}

interface DonutDato {
  label: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule, Sidebar],
  templateUrl: './estadisticas.html',
  styleUrl: './estadisticas.css'
})
export class Estadisticas implements OnInit {
  sidebarCollapsed = false;
  loading = signal(true);

  totalUsuarios = signal(0);
  usuariosActivos = signal(0);
  totalAvisos = signal(0);
  totalPredicas = signal(0);

  private readonly API = 'https://adv-backend-two.vercel.app/api';

  // Datos de ejemplo: vista previa de los reportes que se podran generar a futuro.
  avisosPorMes: BarDato[] = [
    { label: 'Feb', value: 3 },
    { label: 'Mar', value: 5 },
    { label: 'Abr', value: 2 },
    { label: 'May', value: 6 },
    { label: 'Jun', value: 4 },
    { label: 'Jul', value: 7 }
  ];

  predicasPorMes: BarDato[] = [
    { label: 'Feb', value: 4 },
    { label: 'Mar', value: 4 },
    { label: 'Abr', value: 5 },
    { label: 'May', value: 3 },
    { label: 'Jun', value: 6 },
    { label: 'Jul', value: 5 }
  ];

  distribucionContenido: DonutDato[] = [
    { label: 'Predicas', value: 45, color: '#2563eb' },
    { label: 'Avisos', value: 30, color: '#4dc9e6' },
    { label: 'Usuarios', value: 25, color: '#1e3a8a' }
  ];

  constructor(private router: Router) {}

  get token(): string {
    return localStorage.getItem('admin_token') || '';
  }

  ngOnInit() {
    if (!this.token) {
      this.router.navigate(['/login']);
      return;
    }
    this.cargarResumen();
  }

  onSidebarCollapse(collapsed: boolean) {
    this.sidebarCollapsed = collapsed;
  }

  get maxAvisos(): number {
    return Math.max(...this.avisosPorMes.map(d => d.value), 1);
  }

  get maxPredicas(): number {
    return Math.max(...this.predicasPorMes.map(d => d.value), 1);
  }

  altura(valor: number, max: number): string {
    return `${Math.round((valor / max) * 100)}%`;
  }

  get donutGradient(): string {
    let acumulado = 0;
    const total = this.distribucionContenido.reduce((s, d) => s + d.value, 0) || 1;
    const tramos = this.distribucionContenido.map(d => {
      const inicio = (acumulado / total) * 100;
      acumulado += d.value;
      const fin = (acumulado / total) * 100;
      return `${d.color} ${inicio}% ${fin}%`;
    });
    return `conic-gradient(${tramos.join(', ')})`;
  }

  async cargarResumen() {
    this.loading.set(true);
    try {
      const [usuarios, avisos, predicas] = await Promise.all([
        fetch(`${this.API}/usuarios`, { headers: { 'Authorization': `Bearer ${this.token}` } })
          .then(r => (r.ok ? r.json() : [])),
        fetch(`${this.API}/avisos`).then(r => (r.ok ? r.json() : [])),
        fetch(`${this.API}/predicas`).then(r => (r.ok ? r.json() : []))
      ]);

      const usuariosArr = Array.isArray(usuarios) ? usuarios : [];
      this.totalUsuarios.set(usuariosArr.length);
      this.usuariosActivos.set(usuariosArr.filter((u: any) => u.activo !== false).length);
      this.totalAvisos.set(Array.isArray(avisos) ? avisos.length : 0);
      this.totalPredicas.set(Array.isArray(predicas) ? predicas.length : 0);
    } catch {
      // El panel estadistico es una vista previa; si falla la carga solo se dejan los contadores en 0.
    } finally {
      this.loading.set(false);
    }
  }
}
