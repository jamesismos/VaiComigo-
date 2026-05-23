// Geocodificação usando Nominatim (OpenStreetMap) + ViaCEP (Correios)
// ViaCEP: Dados oficiais dos Correios - mais precisos para Brasil
// Nominatim: Para coordenadas e geocodificação reversa

export interface GeocodingResult {
  lat: number;
  lng: number;
  display_name: string;
  address?: {
    road?: string;
    house_number?: string;
    suburb?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

export interface AddressSuggestion {
  display_name: string;
  lat: number;
  lng: number;
  address: {
    road?: string;
    house_number?: string;
    suburb?: string;
    neighbourhood?: string;
    bairro?: string; // ViaCEP usa "bairro"
    city?: string;
    state?: string;
    postcode?: string;
    cep?: string; // ViaCEP retorna CEP
    country?: string;
  };
  source?: 'viacep' | 'nominatim'; // Origem dos dados
}

// Interface para resposta da ViaCEP
interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

// Geocodificação: endereço → coordenadas
export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          'User-Agent': 'VaiComigo App', // Nominatim requer User-Agent
        },
      }
    );

    if (!response.ok) {
      throw new Error('Erro na requisição de geocodificação');
    }

    const data = await response.json();
    
    if (data.length === 0) {
      return null;
    }

    const result = data[0];
    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      display_name: result.display_name,
      address: result.address,
    };
  } catch (error) {
    console.error('Erro na geocodificação:', error);
    return null;
  }
}

// Geocodificação reversa: coordenadas → endereço
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'VaiComigo App',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Erro na requisição de geocodificação reversa');
    }

    const data = await response.json();
    
    if (!data.display_name) {
      return null;
    }

    return data.display_name;
  } catch (error) {
    console.error('Erro na geocodificação reversa:', error);
    return null;
  }
}

// Buscar CEP na ViaCEP (dados oficiais dos Correios)
export async function searchCEP(cep: string): Promise<AddressSuggestion | null> {
  // Remover formatação do CEP
  const cleanCEP = cep.replace(/\D/g, '');
  
  if (cleanCEP.length !== 8) {
    return null;
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
    
    if (!response.ok) {
      return null;
    }

    const data: ViaCEPResponse = await response.json();
    
    if (data.erro) {
      return null;
    }

    // Buscar coordenadas usando Nominatim
    const addressQuery = `${data.logradouro}, ${data.bairro}, ${data.localidade}, ${data.uf}`;
    const geocodeResult = await geocodeAddress(addressQuery);
    
    return {
      display_name: `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`,
      lat: geocodeResult?.lat || 0,
      lng: geocodeResult?.lng || 0,
      address: {
        road: data.logradouro,
        bairro: data.bairro,
        suburb: data.bairro,
        neighbourhood: data.bairro,
        city: data.localidade,
        state: data.uf,
        cep: data.cep,
        postcode: data.cep,
      },
      source: 'viacep',
    };
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    return null;
  }
}

// Buscar endereços por logradouro (busca melhorada com validação)
export async function searchViaCEP(logradouro: string, city: string, uf: string = 'MG'): Promise<AddressSuggestion[]> {
  if (!logradouro || logradouro.length < 3) {
    return [];
  }

  try {
    // Buscar no Nominatim com filtros mais específicos para Brasil
    const searchQuery = `${logradouro}, ${city}, ${uf}, Brasil`;
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=10&addressdetails=1&countrycodes=br&bounded=1`,
      {
        headers: {
          'User-Agent': 'VaiComigo App',
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    
    // Validar e melhorar resultados
    const suggestions: AddressSuggestion[] = [];
    const normalizedTargetCity = city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    for (const item of data) {
      const itemCity = item.address?.city || item.address?.town || item.address?.municipality || '';
      const normalizedItemCity = itemCity.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      
      // Validação mais rigorosa: deve ser da cidade correta
      const cityMatch = normalizedItemCity.includes(normalizedTargetCity) || 
                       normalizedTargetCity.includes(normalizedItemCity) ||
                       itemCity.toLowerCase() === city.toLowerCase();
      
      // Verificar se é do estado correto
      const stateMatch = (item.address?.state || item.address?.region || '').toUpperCase() === uf.toUpperCase();
      
      if (cityMatch && stateMatch && item.address?.road) {
        // Priorizar bairro/suburb do resultado
        const bairro = item.address?.suburb || 
                      item.address?.neighbourhood || 
                      item.address?.quarter ||
                      item.address?.residential;
        
        suggestions.push({
          display_name: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          address: {
            road: item.address?.road || item.address?.street,
            house_number: item.address?.house_number,
            suburb: bairro,
            neighbourhood: bairro,
            bairro: bairro,
            city: itemCity || city,
            state: item.address?.state || item.address?.region || uf,
            postcode: item.address?.postcode,
            cep: item.address?.postcode,
          },
          source: 'nominatim',
        });
      }
    }
    
    // Ordenar por relevância (resultados com bairro primeiro)
    suggestions.sort((a, b) => {
      const aHasBairro = !!(a.address.bairro || a.address.suburb);
      const bHasBairro = !!(b.address.bairro || b.address.suburb);
      if (aHasBairro && !bHasBairro) return -1;
      if (!aHasBairro && bHasBairro) return 1;
      return 0;
    });
    
    return suggestions.slice(0, 5);
  } catch (error) {
    console.error('Erro na busca de endereços:', error);
    return [];
  }
}

// Autocomplete de endereços (melhorado com ViaCEP e busca mais precisa)
export async function searchAddresses(query: string, limit: number = 5, cityHint?: string): Promise<AddressSuggestion[]> {
  if (!query || query.length < 3) {
    return [];
  }

  try {
    // Detectar se é um CEP (8 dígitos)
    const cleanQuery = query.replace(/\D/g, '');
    if (cleanQuery.length === 8) {
      const cepResult = await searchCEP(query);
      return cepResult ? [cepResult] : [];
    }

    // Detectar cidade ou usar hint fornecido
    let city = cityHint || 'Guanhães';
    let uf = 'MG';
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('padre paraíso') || queryLower.includes('padre paraiso')) {
      city = 'Padre Paraíso';
    } else if (queryLower.includes('guanhães') || queryLower.includes('guanhaes')) {
      city = 'Guanhães';
    }
    
    // Buscar primeiro na ViaCEP/Nominatim (mais preciso para Brasil)
    const viacepResults = await searchViaCEP(query, city, uf);
    
    if (viacepResults.length > 0) {
      return viacepResults.slice(0, limit);
    }
    
    // Busca melhorada no Nominatim com múltiplas tentativas
    const searchQueries = [
      `${query}, ${city}, ${uf}, Brasil`, // Mais específico
      `${query}, ${city}, Minas Gerais, Brasil`, // Com estado completo
      query.includes(city) || query.includes('MG') ? query : `${query}, ${city} MG`, // Fallback
    ];
    
    let bestResults: AddressSuggestion[] = [];
    
    for (const searchQuery of searchQueries) {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=${limit * 2}&addressdetails=1&countrycodes=br&bounded=1`,
        {
          headers: {
            'User-Agent': 'VaiComigo App',
          },
        }
      );

      if (!response.ok) continue;

      const data = await response.json();
      
      const filtered = data
        .filter((item: any) => {
          const itemCity = item.address?.city || item.address?.town || item.address?.municipality || '';
          const normalizedItemCity = itemCity.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          const normalizedTargetCity = city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          
          const cityMatch = normalizedItemCity.includes(normalizedTargetCity) || 
                           normalizedTargetCity.includes(normalizedItemCity) ||
                           itemCity.toLowerCase() === city.toLowerCase();
          
          const stateMatch = (item.address?.state || item.address?.region || '').toUpperCase() === uf.toUpperCase();
          const isBrazil = item.address?.country_code === 'br';
          
          return isBrazil && cityMatch && stateMatch && item.address?.road;
        })
        .map((item: any) => {
          const bairro = item.address?.suburb || 
                        item.address?.neighbourhood || 
                        item.address?.quarter ||
                        item.address?.residential;
          
          return {
            display_name: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            address: {
              road: item.address?.road || item.address?.street,
              house_number: item.address?.house_number,
              suburb: bairro,
              neighbourhood: bairro,
              bairro: bairro,
              city: item.address?.city || item.address?.town || item.address?.municipality || city,
              state: item.address?.state || item.address?.region || uf,
              postcode: item.address?.postcode,
              cep: item.address?.postcode,
            },
            source: 'nominatim',
          } as AddressSuggestion;
        });
      
      if (filtered.length > 0) {
        bestResults = filtered;
        break; // Usar primeiro resultado que tiver matches
      }
    }
    
    // Ordenar por relevância (com bairro primeiro, depois sem bairro)
    bestResults.sort((a, b) => {
      const aHasBairro = !!(a.address.bairro || a.address.suburb);
      const bHasBairro = !!(b.address.bairro || b.address.suburb);
      if (aHasBairro && !bHasBairro) return -1;
      if (!aHasBairro && bHasBairro) return 1;
      return 0;
    });
    
    return bestResults.slice(0, limit);
  } catch (error) {
    console.error('Erro na busca de endereços:', error);
    return [];
  }
}

// Formatar endereço para exibição (prioriza bairro correto)
export function formatAddressSuggestion(suggestion: AddressSuggestion): string {
  const { address, display_name } = suggestion;
  const parts: string[] = [];
  
  // Priorizar bairro da ViaCEP (mais preciso)
  const bairro = address.bairro || address.suburb || address.neighbourhood;
  
  if (address.road) {
    if (address.house_number) {
      parts.push(`${address.road}, ${address.house_number}`);
    } else {
      parts.push(address.road);
    }
  }
  
  // Adicionar bairro (prioridade para dados oficiais)
  if (bairro) {
    parts.push(bairro);
  }
  
  if (address.city) {
    parts.push(address.city);
  }
  
  if (address.state) {
    parts.push(address.state);
  }
  
  // Se tiver CEP, adicionar no final
  if (address.cep || address.postcode) {
    const cep = address.cep || address.postcode || '';
    if (cep.length === 8) {
      parts.push(`CEP: ${cep.substring(0, 5)}-${cep.substring(5)}`);
    }
  }
  
  return parts.length > 0 ? parts.join(', ') : display_name;
}

// Debounce para evitar muitas requisições
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 segundo entre requisições

export async function geocodeWithThrottle(address: string): Promise<GeocodingResult | null> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }
  
  lastRequestTime = Date.now();
  return geocodeAddress(address);
}
