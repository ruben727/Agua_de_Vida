import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ElasticsearchService {
  
  private searchableData = [
    {
      id: 1,
      title: 'La importancia del agua en la vida cristiana',
      route: '/predicas',
      keywords: ['agua', 'vida', 'cristiana', 'purificación', 'importancia']
    },
    {
      id: 2,
      title: 'Sermón sobre la fe: Creer sin ver',
      route: '/predicas',
      keywords: ['fe', 'esperanza', 'creer', 'confianza', 'sermón']
    },
    {
      id: 3,
      title: 'Bautismo en el agua - Próximo evento',
      route: '/avisos',
      keywords: ['bautismo', 'evento', 'agua', 'bautizo', 'domingo']
    },
    {
      id: 4,
      title: 'Cambio de horario de servicios',
      route: '/avisos',
      keywords: ['horario', 'cambio', 'servicio', 'domingo', 'hora']
    },
    {
      id: 5,
      title: 'Devocional diario: El agua de vida',
      route: '/',
      keywords: ['devocional', 'vida eterna', 'agua', 'jesus', 'diario']
    },
    {
      id: 6,
      title: 'Contacto y ubicación de la iglesia',
      route: '/contacto',
      keywords: ['contacto', 'dirección', 'teléfono', 'correo', 'ubicación']
    }
  ];

  constructor() {
    console.log('✅ ElasticsearchService inicializado correctamente');
  }

  async search(query: string) {
    console.log('🔍 Buscando:', query);
    
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (!query || query.length < 2) {
      return [];
    }
    
    const q = query.toLowerCase();
    
    // Algoritmo de búsqueda
    const results = this.searchableData
      .map(item => {
        let score = 0;
        
        // Buscar en título
        if (item.title.toLowerCase().includes(q)) {
          score += 10;
        }
        
        // Buscar en keywords
        const matchingKeywords = item.keywords.filter(k => k.includes(q));
        if (matchingKeywords.length > 0) {
          score += 5 * matchingKeywords.length;
        }
        
        // Bonus por coincidencia exacta
        if (item.title.toLowerCase() === q) {
          score += 20;
        }
        
        return { 
          title: item.title, 
          route: item.route, 
          score
        };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    
    console.log('📊 Resultados encontrados:', results.length);
    return results;
  }
}