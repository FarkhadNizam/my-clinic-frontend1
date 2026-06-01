// services/scheduleService.ts
import {MOCK_SCHEDULE_SLOTS } from '../data/schedule.mock';

export function getAvailableDates(doctorId: string): string[] {
  // Здесь должна быть логика получения доступных дат для врача
  // Для примера используем моковые данные
  const uniqueDates = [...new Set(
    MOCK_SCHEDULE_SLOTS
      .filter(slot => slot.doctorId === doctorId && slot.isAvailable)
      .map(slot => slot.date)
  )];
  
  return uniqueDates.sort();
}

export function getAvailableTimes(doctorId: string, date: string): string[] {
  // Здесь должна быть логика получения доступного времени для выбранной даты
  return MOCK_SCHEDULE_SLOTS
    .filter(slot => slot.doctorId === doctorId && slot.date === date && slot.isAvailable)
    .map(slot => slot.timeFrom)
    .sort();
}