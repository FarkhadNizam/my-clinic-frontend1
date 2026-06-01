// src/data/visits.mock.ts
import { MOCK_DOCTORS } from './doctors.mock';

export interface MedicalVisit {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  complaints: string;
  diagnosis: string;
  treatment: string;
  status: 'completed' | 'cancelled' | 'planned';
}

export const MOCK_VISITS: MedicalVisit[] = [
  {
    id: '1',
    patientId: '1',
    doctorId: '1',
    date: '2023-10-15',
    complaints: 'Головная боль, температура 37.5',
    diagnosis: 'ОРВИ',
    treatment: 'Постельный режим, обильное питье, парацетамол',
    status: 'completed'
  },
  {
    id: '2',
    patientId: '1',
    doctorId: '3',
    date: '2023-08-22',
    complaints: 'Боли в груди при физической нагрузке',
    diagnosis: 'Стенокардия напряжения',
    treatment: 'Нитроглицерин при приступах, обследование',
    status: 'completed'
  },
  {
    id: '3',
    patientId: '2',
    doctorId: '2',
    date: '2023-11-05',
    complaints: 'Острая боль в правом боку',
    diagnosis: 'Аппендицит',
    treatment: 'Срочная операция',
    status: 'completed'
  },
  {
    id: '4',
    patientId: '3',
    doctorId: '4',
    date: '2023-09-18',
    complaints: 'Головокружение, тошнота',
    diagnosis: 'Вегетососудистая дистония',
    treatment: 'Режим дня, витамины',
    status: 'completed'
  },
  {
    id: '5',
    patientId: '1',
    doctorId: '5',
    date: '2025-05-19',
    complaints: '',
    diagnosis: '',
    treatment: '',
    status: 'planned'
  }
];

// Функция для получения истории посещений пациента
export const getPatientVisits = (patientId: string) => {
  return MOCK_VISITS
    .filter(visit => visit.patientId === patientId)
    .map(visit => {
      const doctor = MOCK_DOCTORS.find(d => d.id === visit.doctorId);
      return {
        ...visit,
        doctorName: doctor ? `${doctor.lastName} ${doctor.firstName[0]}.` : 'Неизвестный врач',
        doctorSpecialty: doctor?.specialty || ''
      };
    });
};