import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Footer } from '../../components/footer/footer';
import { MESES } from '../../shared/meses';

interface Predica {
  id: number;
  titulo: string;
  predicador: string;
  youtube_url: string;
  imagen_url: string;
  fecha: string;
  mes: number;
}

@Component({
  selector: 'app-predicas',
  standalone: true,
  imports: [CommonModule, RouterLink, Footer],
  templateUrl: './predicas.html',
  styleUrl: './predicas.css',
})
export class Predicas implements OnInit {

  private route = inject(ActivatedRoute);
  private readonly API = 'https://adv-backend-two.vercel.app/api';

  mesSeleccionado: number | null = null;

  predicas: Predica[] = [];
  loading = true;
  errorMsg = '';

  constructor() {
    this.route.queryParamMap.subscribe(params => {
      const mes = params.get('mes');
      this.mesSeleccionado = mes ? Number(mes) : null;
    });
  }

  ngOnInit() {
    this.cargarPredicas();
  }

  cargarPredicas() {
    this.loading = true;
    this.errorMsg = '';

    fetch(`${this.API}/predicas`)
      .then(r => {
        if (!r.ok) throw new Error('Error al cargar las prédicas.');
        return r.json();
      })
      .then((data: any[]) => {
        this.predicas = (Array.isArray(data) ? data : [])
          .filter(p => p.activo !== false)
          .map(p => ({
            id: p.id,
            titulo: p.titulo,
            predicador: p.predicador,
            youtube_url: p.youtube_url,
            imagen_url: p.imagen_url,
            fecha: p.fecha,
            mes: this.parseFecha(p.fecha).getMonth() + 1
          }));
        this.loading = false;
      })
      .catch(err => {
        this.predicas = [];
        this.loading = false;
        this.errorMsg = err.message || 'No se pudieron cargar las prédicas.';
      });
  }

  get predicasFiltradas(): Predica[] {
    if (!this.mesSeleccionado) return this.predicas;
    return this.predicas.filter(p => p.mes === this.mesSeleccionado);
  }

  get nombreMesSeleccionado(): string | null {
    return MESES.find(m => m.numero === this.mesSeleccionado)?.nombre ?? null;
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
