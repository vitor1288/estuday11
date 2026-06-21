import { Compromisso } from '@/contexts/StudayContext';

export type OrderOption = 'proximo' | 'novo' | 'antigo' | 'alfabetica';
export type OrderDirection = 'asc' | 'desc';

/**
 * Filtra e ordena uma lista de compromissos com base em múltiplos critérios combinados.
 * Suporta busca textual ("Ctrl + F"), filtros categóricos e inversão dinâmica por setas.
 */
export function filtrarEOrdenarCompromissos(
  lista: Compromisso[],
  buscaTexto: string,
  materiaFiltroId: string | null,
  dataFiltro: string | null, // Formato YYYY-MM-DD
  opcaoOrdenacao: OrderOption,
  direcao: OrderDirection
): Compromisso[] {
  
  // Cria uma cópia rasa da lista para evitar mutação direta no estado do React
  let resultado = [...lista];

  // 1. FILTRO DE TEXTO ("Ctrl + F") - Busca correspondências no título ou no horário
  if (buscaTexto.trim()) {
    const textoUpper = buscaTexto.toUpperCase();
    resultado = resultado.filter(item => 
      (item.titulo && item.titulo.toUpperCase().includes(textoUpper)) || 
      (item.hora && item.hora.includes(textoUpper))
    );
  }

  // 2. FILTRO POR MATÉRIA SPECÍFICA
  if (materiaFiltroId) {
    resultado = resultado.filter(item => item.materiaId === materiaFiltroId);
  }

  // 3. FILTRO POR DATA SELECIONADA
  if (dataFiltro) {
    resultado = resultado.filter(item => item.data === dataFiltro);
  }

  // 4. ALGORITMO DE ORDENAÇÃO AVANÇADA
  resultado.sort((a, b) => {
    let comparacao = 0;

    switch (opcaoOrdenacao) {
      case 'proximo': {
        // Calcula a proximidade absoluta em milissegundos em relação ao dia de hoje
        const hoje = new Date().setHours(0, 0, 0, 0);
        const dataA = new Date(a.data).getTime();
        const dataB = new Date(b.data).getTime();
        
        comparacao = Math.abs(dataA - hoje) - Math.abs(dataB - hoje);
        break;
      }
      case 'novo':
        // Itens com datas mais futuras/recentes primeiro
        comparacao = new Date(b.data).getTime() - new Date(a.data).getTime();
        break;
      case 'antigo':
        // Itens com datas mais passadas primeiro
        comparacao = new Date(a.data).getTime() - new Date(b.data).getTime();
        break;
      case 'alfabetica':
        // Comparação de string segura contra acentuações brasileiras
        comparacao = a.titulo.localeCompare(b.titulo, 'pt-BR');
        break;
    }

    // Se a direção da seta for 'desc' (descendente), inverte o sinal do resultado matemático
    return direcao === 'asc' ? comparacao : -comparacao;
  });

  return resultado;
}