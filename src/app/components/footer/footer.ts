import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService, SiteTheme } from '../../services/theme.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {
  private themeService = inject(ThemeService);
  theme = this.themeService.theme;

  setTheme(theme: SiteTheme) {
    this.themeService.setTheme(theme);
  }
}