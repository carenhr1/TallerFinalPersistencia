/**
 * Utilidades para manejo de horas y división de turnos en bloques de 30 minutos.
 */

// Convierte una hora en formato "HH:mm" a minutos desde la medianoche
export const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
};

// Convierte minutos desde la medianoche al formato "HH:mm"
export const minutesToTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}`;
};

/**
 * Divide automáticamente el lapso entre hora_inicial y hora_final
 * en turnos de 30 minutos.
 * Ejemplo: "08:00" a "10:00" -> ["08:00 - 08:30", "08:30 - 09:00", "09:00 - 09:30", "09:30 - 10:00"]
 */
export const generarTurnos30Min = (horaInicial, horaFinal) => {
  if (!horaInicial || !horaFinal) return [];

  const startMin = timeToMinutes(horaInicial);
  const endMin = timeToMinutes(horaFinal);

  if (startMin >= endMin) {
    return [];
  }

  const turnos = [];
  let currentMin = startMin;

  while (currentMin + 30 <= endMin) {
    const inicio = minutesToTime(currentMin);
    const fin = minutesToTime(currentMin + 30);
    turnos.push(`${inicio} - ${fin}`);
    currentMin += 30;
  }

  return turnos;
};

// Formateador de fecha legible (YYYY-MM-DD -> DD/MM/YYYY)
export const formatearFecha = (fechaStr) => {
  if (!fechaStr) return '';
  const partes = fechaStr.split('-');
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return fechaStr;
};
