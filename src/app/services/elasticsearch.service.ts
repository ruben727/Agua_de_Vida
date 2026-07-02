import { Injectable } from '@angular/core';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  route: string;
  type: 'predica' | 'aviso' | 'pagina';
  score: number;
  matchedTerms: string[];
  extraInfo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ElasticsearchService {

  private readonly API = 'https://adv-backend-two.vercel.app/api';

  async search(query: string): Promise<SearchResult[]> {
    const q = query.trim();
    if (q.length < 2) return [];

    const res = await fetch(`${this.API}/search?q=${encodeURIComponent(q)}`);
    if (!res.ok) return [];

    return res.json();
  }
}
