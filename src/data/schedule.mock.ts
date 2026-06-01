// data/schedule.mock.ts
import { type ScheduleSlot } from '../types';

export const MOCK_SCHEDULE_SLOTS: ScheduleSlot[] = [
  {
    id: '1',
    doctorId: '1', // Петров И.
    date: '2023-10-20',
    timeFrom: '09:00',
    timeTo: '10:00',
    isAvailable: true
  },
  {
    id: '2',
    doctorId: '1',
    date: '2023-10-20',
    timeFrom: '10:00',
    timeTo: '11:00',
    isAvailable: true
  },
  {
    id: '3',
    doctorId: '1',
    date: '2023-10-21',
    timeFrom: '14:00',
    timeTo: '15:00',
    isAvailable: true
  },
  // ... другие слоты
];