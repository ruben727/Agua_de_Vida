import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    CommonModule,
    FormsModule
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {

  constructor(private router: Router){}

  @ViewChild('searchInput') searchInput?: ElementRef;

  showSearch = false;
  showSidebar = false;
  searchQuery = '';
  results:any[] = [];

  pages = [
    { title:'Inicio', route:'/', keywords:['inicio','iglesia'] },
    { title:'Predicas', route:'/predicas', keywords:['predicas','sermon'] },
    { title:'Avisos', route:'/avisos', keywords:['avisos','eventos'] },
    { title:'Contacto', route:'/contacto', keywords:['contacto','telefono','correo'] }
  ];

  openSearch(){

    this.showSearch = true;

    setTimeout(()=>{
      this.searchInput?.nativeElement?.focus();
    },200);

  }

  closeSearch(){

    this.showSearch = false;
    this.searchQuery = '';
    this.results = [];

  }

  performSearch(){

    const q = this.searchQuery.toLowerCase();

    if(q.length < 2){
      this.results = [];
      return;
    }

    this.results = this.pages.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.keywords.some(k => k.includes(q))
    );

  }

  goTo(route:string){

    this.router.navigate([route]);
    this.closeSearch();

  }

  toggleSidebar(){

    this.showSidebar = !this.showSidebar;

  }

  closeSidebar(){

    this.showSidebar = false;

  }

}