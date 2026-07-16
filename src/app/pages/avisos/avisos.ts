import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Footer } from '../../components/footer/footer';
import { MESES } from '../../shared/meses';

interface Aviso {
  id: number;
  titulo: string;
  descripcion: string;
  imagen_url: string;
  fecha: string;
  mes: number;
  expanded?: boolean;
}

@Component({
  selector: 'app-avisos',
  standalone: true,
  imports: [CommonModule, RouterLink, Footer],
  templateUrl: './avisos.html',
  styleUrl: './avisos.css'
})
export class Avisos implements OnInit {

  private route = inject(ActivatedRoute);
  private readonly API = 'https://adv-backend-two.vercel.app/api';

  mesSeleccionado: number | null = null;

  avisos: Aviso[] = [];
  loading = true;
  errorMsg = '';

  constructor() {
    this.route.queryParamMap.subscribe(params => {
      const mes = params.get('mes');
      this.mesSeleccionado = mes ? Number(mes) : null;
    });
  }

  ngOnInit() {
    this.cargarAvisos();
  }

  cargarAvisos() {
    this.loading = true;
    this.errorMsg = '';

    fetch(`${this.API}/avisos`)
      .then(r => {
        if (!r.ok) throw new Error('Error al cargar los avisos.');
        return r.json();
      })
      .then((data: any[]) => {
        this.avisos = (Array.isArray(data) ? data : [])
          .filter(a => a.activo !== false)
          .map(a => ({
            id: a.id,
            titulo: a.titulo,
            descripcion: a.descripcion,
            imagen_url: a.imagen_url,
            fecha: a.fecha,
            mes: this.parseFecha(a.fecha).getMonth() + 1,
            expanded: false
          }));
        this.loading = false;
      })
      .catch(err => {
        this.avisos = [];
        this.loading = false;
        this.errorMsg = err.message || 'No se pudieron cargar los avisos.';
      });
  }

  get avisosFiltrados(): Aviso[] {
    if (!this.mesSeleccionado) return this.avisos;
    return this.avisos.filter(a => a.mes === this.mesSeleccionado);
  }

  get nombreMesSeleccionado(): string | null {
    return MESES.find(m => m.numero === this.mesSeleccionado)?.nombre ?? null;
  }

  toggleAviso(aviso: Aviso) {
    aviso.expanded = !aviso.expanded;
  }

  resumen(descripcion: string): string {
    if (!descripcion) return '';
    return descripcion.length > 140 ? descripcion.slice(0, 140).trim() + '…' : descripcion;
  }

  formatFecha(fecha: string): string {
    if (!fecha) return '';
    return this.parseFecha(fecha).toLocaleDateString('es-MX', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  }

  private parseFecha(fecha: string): Date {
    const [y, m, d] = fecha.substring(0, 10).split('-').map(Number);
    return new Date(y, m - 1, d);
  }
}
