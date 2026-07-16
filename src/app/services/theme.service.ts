import { Injectable, signal, effect } from '@angular/core';

export type SiteTheme = 'normal' | 'navidad' | 'independencia';

const STORAGE_KEY = 'adv-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {

  readonly theme = signal<SiteTheme>(this.resolveInitialTheme());

  constructor() {
    effect(() => {
      const value = this.theme();
      document.body.classList.remove('theme-normal', 'theme-navidad', 'theme-independencia');
      document.body.classList.add(`theme-${value}`);
    });
  }

  setTheme(theme: SiteTheme) {
    this.theme.set(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  /** Quita la selección manual y vuelve a dejar que el mes calendario decida el tema. */
  useAutoTheme() {
    localStorage.removeItem(STORAGE_KEY);
    this.theme.set(this.themeForMonth(new Date().getMonth() + 1));
  }

  isManualOverride(): boolean {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }

  private resolveInitialTheme(): SiteTheme {
    const saved = localStorage.getItem(STORAGE_KEY) as SiteTheme | null;
    if (saved === 'normal' || saved === 'navidad' || saved === 'independencia') {
      return saved;
    }
    return this.themeForMonth(new Date().getMonth() + 1);
  }

  /** Evento calendarizado: diciembre => Navidad, septiembre => Fiestas Patrias. */
  private themeForMonth(month: number): SiteTheme {
    if (month === 12) return 'navidad';
    if (month === 9) return 'independencia';
    return 'normal';
  }
}
