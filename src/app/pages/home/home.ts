import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, Footer],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

}