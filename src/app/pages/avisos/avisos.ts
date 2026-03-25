import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Footer } from '../../components/footer/footer';

interface Aviso {
  titulo: string;
  fecha: string;
  imagen: string;
  resumen: string;
  descripcion: string;
  expanded?: boolean;
}

@Component({
  selector: 'app-avisos',
  standalone: true,
  imports: [CommonModule, Footer],
  templateUrl: './avisos.html',
  styleUrl: './avisos.css'
})
export class Avisos {

  avisos: Aviso[] = [
    {
      titulo: 'Reunión de jovenes',
      fecha: 'Miércoles 28 de Marzo - 7:30 PM',
      imagen: '/reunionj.jpg',
      resumen: 'Una noche especial de adoración y búsqueda de la presencia de Dios.',
      descripcion: 'Te invitamos a nuestra Noche de Alabanza donde tendremos un tiempo especial de adoración, oración y ministración. Será un momento para renovar nuestras fuerzas y buscar juntos la presencia de Dios. Invita a tu familia y amigos.',
      expanded: false
    },
    {
      titulo: 'Taller Infantil',
      fecha: 'Sábado 10 de Abril',
      imagen: '/niños.png',
      resumen: 'Un tiempo de consagración y oración como iglesia.',
      descripcion: 'Estaremos realizando un ayuno congregacional enfocado en la unidad, dirección espiritual y crecimiento de nuestra iglesia. Tendremos un servicio especial al finalizar el día.',
      expanded: false
    }
  ];

  toggleAviso(aviso: Aviso) {
    aviso.expanded = !aviso.expanded;
  }
}



