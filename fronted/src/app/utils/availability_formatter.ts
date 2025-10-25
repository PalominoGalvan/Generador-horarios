const DIAS_ABREV = {
  'Lunes': 'LU',
  'Martes': 'MA',
  'Miércoles': 'MI',
  'Jueves': 'JU',
  'Viernes': 'VI',
  'Sábado': 'SA'
};
const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const HORAS_INICIO = Array.from({ length: 14 }, (_, i) => i + 7);

//convierte (Record<string, boolean[]>) en un string con rangos horarios.
function formatAvailability(
  availability: Record<string, boolean[]>,
  daySeparator: string = ", ",
  blockSeparator: string = ", "
): string {
  const allBlocks: string[] = [];

  for (const dia of DIAS) {
    const hours = availability[dia];
    if (!hours || hours.length === 0) continue;

    const dayAbrev = DIAS_ABREV[dia as keyof typeof DIAS_ABREV] || '??';
    const dayBlocks: string[] = [];
    
    let inBlock = false;
    let blockStart = -1;

    for (let i = 0; i < hours.length; i++) {
      if (hours[i]) {
        if (!inBlock) {
          inBlock = true;
          blockStart = HORAS_INICIO[i];
        }
      } else {
        if (inBlock) {
          const blockEnd = HORAS_INICIO[i - 1] + 1; 
          dayBlocks.push(`${dayAbrev} ${blockStart}-${blockEnd}`);
          inBlock = false;
        }
      }
    }
    if (inBlock) {
      const blockEnd = HORAS_INICIO[hours.length - 1] + 1; 
      dayBlocks.push(`${dayAbrev} ${blockStart}-${blockEnd}`);
    }

    if (dayBlocks.length > 0) {
      allBlocks.push(dayBlocks.join(blockSeparator));
    }
  }

  return allBlocks.join(daySeparator);
}

//formatea la disponibilidad para mostrarla en la tabla HTML
export function formatAvailabilityForDisplay(availability: Record<string, boolean[]>): string {
    return formatAvailability(availability, ", ", ", ");
}


//formatea la disponibilidad para un archivo CSV usando punto y coma
export function formatAvailabilityForCSV(availability: Record<string, boolean[]>): string {
    return formatAvailability(availability, " | ", "; ");
}