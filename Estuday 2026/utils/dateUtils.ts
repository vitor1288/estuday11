export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateBR = (dateString: string): string => {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('pt-BR');
};

export const formatDateToBR = (dateString: string): string => {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

export const formatDateFromBR = (dateString: string): string => {
  const [day, month, year] = dateString.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

export const formatTime = (timeString: string): string => {
  return timeString;
};

export const formatTimeFromDate = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const isToday = (dateString: string): boolean => {
  const today = formatDate(new Date());
  return dateString === today;
};

export const isFutureDate = (dateString: string): boolean => {
  const today = formatDate(new Date());
  return dateString >= today;
};

export const isExpired = (dateString: string, timeString: string): boolean => {
  const now = new Date();
  
  // Verificar se timeString é válido
  if (!timeString || !timeString.includes(':')) {
    return false;
  }
  
  // Parse da data e hora de forma mais robusta
  const [year, month, day] = dateString.split('-').map(Number);
  const [hour, minute] = timeString.split(':').map(Number);
  
  // Verificar se todos os valores são números válidos
  if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute)) {
    return false;
  }
  
  // Criar data do compromisso usando fuso horário local
  const compromissoDateTime = new Date(year, month - 1, day, hour, minute);
  
  // Verificar se a data foi criada corretamente
  if (isNaN(compromissoDateTime.getTime())) {
    return false;
  }
  
  return compromissoDateTime < now;
};

export const getMonthName = (monthIndex: number): string => {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return months[monthIndex];
};

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

export const createDateString = (year: number, month: number, day: number): string => {
  const date = new Date(year, month, day);
  return formatDate(date);
};

export const getWeekDays = (): string[] => {
  return ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
};

export const applyDateMask = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 4) {
    return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
  } else {
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
  }
};

export const isValidDate = (dateString: string): boolean => {
  if (dateString.length !== 10) return false;
  const [day, month, year] = dateString.split('/');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return date.getDate() === parseInt(day) &&
         date.getMonth() === parseInt(month) - 1 &&
         date.getFullYear() === parseInt(year);
};