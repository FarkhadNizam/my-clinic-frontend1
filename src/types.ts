// Основные типы системы
export type UserRole = 'Registrar' | 'Admin' | 'Doctor';

export interface User {
  id: string;
  login: string;
  passwordHash: string;
  role: UserRole;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dob: string; // Дата рождения в формате 'YYYY-MM-DD'
  phone?: string;
  email?: string;
}

export interface Doctor {
  id: string;
  userId: string; // Связь с User
  firstName: string;
  lastName: string;
  specialty: string;
  phone?: string;
  email?: string;
}

export interface ScheduleSlot {
  id: string;
  doctorId: string;
  date: string; // 'YYYY-MM-DD'
  timeFrom: string; // 'HH:MM'
  timeTo: string;   // 'HH:MM'
  isAvailable: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  scheduleSlotId: string;
  createdAt: string; // Дата создания
}

export interface MedicalCase {
  id: string;
  appointmentId: string;
  complaints: string; // Жалобы
  diagnosis?: string; // Диагноз
  treatment?: string; // Лечение
  isClosed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Specialty {
    id: string;
    name: string;
}

export interface CreateDoctorRequest {
    firstName: string;
    lastName: string;
    specialtyId: string;
    plannedWeeklyHours: number;
    login: string;
}