import { Component, ViewChild, ElementRef } from '@angular/core';
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
  @ViewChild('searchInput') searchInput?: ElementRef;

  showSearch = false;
  showSidebar = false;
  searchQuery = '';

  openSearch() {
    this.showSearch = true;
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      this.searchInput?.nativeElement?.focus();
    }, 100);
  }

  closeSearch() {
    this.showSearch = false;
    this.searchQuery = '';
    document.body.style.overflow = '';
  }

  performSearch() {
    if (this.searchQuery.trim()) {
      console.log('Buscando:', this.searchQuery);
    }
  }

  toggleSidebar() {
    this.showSidebar = !this.showSidebar;
    document.body.style.overflow = this.showSidebar ? 'hidden' : '';
  }

  closeSidebar() {
    this.showSidebar = false;
    document.body.style.overflow = '';
  }
}