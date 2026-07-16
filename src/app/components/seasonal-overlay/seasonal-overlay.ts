import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

interface Snowflake {
  id: number;
  left: number;
  duration: number;
  delay: number;
  size: number;
}

@Component({
  selector: 'app-seasonal-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seasonal-overlay.html',
  styleUrl: './seasonal-overlay.css'
})
export class SeasonalOverlay {
  private themeService = inject(ThemeService);
  theme = this.themeService.theme;

  snowflakes: Snowflake[] = Array.from({ length: 45 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    duration: 6 + Math.random() * 9,
    delay: Math.random() * 10,
    size: 10 + Math.random() * 14
  }));
}
