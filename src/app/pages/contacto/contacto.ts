import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, FormsModule, Footer],
  templateUrl: './contacto.html',
  styleUrl: './contacto.css',
})
export class Contacto {

  nombre = '';
  correo = '';
  telefono = '';
  mensaje = '';

  enviarFormulario(){

    console.log({
      nombre: this.nombre,
      correo: this.correo,
      telefono: this.telefono,
      mensaje: this.mensaje
    });

    alert("Mensaje enviado. Nos pondremos en contacto contigo.");

    this.nombre = '';
    this.correo = '';
    this.telefono = '';
    this.mensaje = '';
  }

}