// Base de efemérides argentinas y globales relevantes para marketing
import { Ephemeris } from './types'

export const EPHEMERIS_2026: Ephemeris[] = [
  // ENERO
  { id: 'e001', date: '2026-01-01', title: 'Año Nuevo', type: 'mundial', recurring: true },
  { id: 'e002', date: '2026-01-06', title: 'Día de Reyes', type: 'comercial', recurring: true },

  // FEBRERO
  { id: 'e010', date: '2026-02-14', title: 'Día de San Valentín', type: 'comercial', recurring: true },
  { id: 'e011', date: '2026-02-16', title: 'Carnaval (lunes)', type: 'nacional', recurring: false },
  { id: 'e012', date: '2026-02-17', title: 'Carnaval (martes)', type: 'nacional', recurring: false },

  // MARZO
  { id: 'e020', date: '2026-03-08', title: 'Día Internacional de la Mujer', type: 'mundial', recurring: true },
  { id: 'e021', date: '2026-03-22', title: 'Día Mundial del Agua', type: 'mundial', recurring: true },
  { id: 'e022', date: '2026-03-24', title: 'Día Nacional de la Memoria', type: 'nacional', recurring: true },
  { id: 'e023', date: '2026-03-29', title: 'Viernes Santo', type: 'nacional', recurring: false },

  // ABRIL
  { id: 'e030', date: '2026-04-02', title: 'Día del Veterano de Malvinas', type: 'nacional', recurring: true },
  { id: 'e031', date: '2026-04-01', title: 'Día de los Inocentes / April Fools', type: 'comercial', recurring: true },
  { id: 'e032', date: '2026-04-22', title: 'Día de la Tierra', type: 'mundial', recurring: true },

  // MAYO
  { id: 'e040', date: '2026-05-01', title: 'Día del Trabajador', type: 'nacional', recurring: true },
  { id: 'e041', date: '2026-05-10', title: 'Día de la Madre (AR)', type: 'comercial', recurring: false },
  { id: 'e042', date: '2026-05-25', title: 'Feriado Nacional - Revolución de Mayo', type: 'nacional', recurring: true },

  // JUNIO
  { id: 'e050', date: '2026-06-17', title: 'Paso a la Inmortalidad del Gral. Güemes', type: 'nacional', recurring: true },
  { id: 'e051', date: '2026-06-20', title: 'Día de la Bandera Argentina', type: 'nacional', recurring: true },
  { id: 'e052', date: '2026-06-21', title: 'Solsticio de Invierno', type: 'mundial', recurring: true },
  { id: 'e053', date: '2026-06-30', title: 'Día del Padre (AR)', type: 'comercial', recurring: false },

  // JULIO
  { id: 'e060', date: '2026-07-09', title: 'Día de la Independencia Argentina', type: 'nacional', recurring: true },
  { id: 'e061', date: '2026-07-17', title: 'Día del Amigo (AR)', type: 'comercial', recurring: true },

  // AGOSTO
  { id: 'e070', date: '2026-08-17', title: 'Paso a la Inmortalidad del Gral. San Martín', type: 'nacional', recurring: true },

  // SEPTIEMBRE
  { id: 'e080', date: '2026-09-21', title: 'Día de la Primavera / Día del Estudiante', type: 'comercial', recurring: true },

  // OCTUBRE
  { id: 'e090', date: '2026-10-12', title: 'Día del Respeto a la Diversidad Cultural', type: 'nacional', recurring: true },
  { id: 'e091', date: '2026-10-31', title: 'Halloween', type: 'comercial', recurring: true },

  // NOVIEMBRE
  { id: 'e100', date: '2026-11-06', title: 'Black Friday (aprox)', type: 'comercial', recurring: false },
  { id: 'e101', date: '2026-11-09', title: 'Cyber Monday (aprox)', type: 'comercial', recurring: false },

  // DICIEMBRE
  { id: 'e110', date: '2026-12-08', title: 'Inmaculada Concepción', type: 'nacional', recurring: true },
  { id: 'e111', date: '2026-12-24', title: 'Nochebuena', type: 'comercial', recurring: true },
  { id: 'e112', date: '2026-12-25', title: 'Navidad', type: 'nacional', recurring: true },
  { id: 'e113', date: '2026-12-31', title: 'Fin de Año', type: 'comercial', recurring: true },
]

export function getEphemerisForMonth(year: number, month: number): Ephemeris[] {
  const monthStr = String(month).padStart(2, '0')
  return EPHEMERIS_2026.filter(e => e.date.startsWith(`${year}-${monthStr}`))
}

export function getEphemerisForDay(date: string): Ephemeris[] {
  return EPHEMERIS_2026.filter(e => e.date === date)
}

export const EPHEMERIS_TYPE_COLORS: Record<string, string> = {
  nacional: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  mundial: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  comercial: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  sectorial: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  custom: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
}
