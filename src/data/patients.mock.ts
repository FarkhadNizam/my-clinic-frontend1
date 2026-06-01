// src/data/patients.mock.ts
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  insuranceNumber: string;
  phone: string;
}

export const MOCK_PATIENTS: Patient[] = [
  {
    id: '1',
    firstName: 'Анна',
    lastName: 'Иванова',
    birthDate: '1985-04-15',
    insuranceNumber: '123456789012',
    phone: '+79001234567',
  },
  {
    id: '2',
    firstName: 'Дмитрий',
    lastName: 'Смирнов',
    birthDate: '1990-11-22',
    insuranceNumber: '987654321098',
    phone: '+79007654321',
  },
  {
    id: '3',
    firstName: 'Елена',
    lastName: 'Петрова',
    birthDate: '1978-07-30',
    insuranceNumber: '456789012345',
    phone: '+79002345678',
  },
  {
    id: '4',
    firstName: 'Сергей',
    lastName: 'Васильев',
    birthDate: '1995-02-10',
    insuranceNumber: '678901234567',
    phone: '+79003456789',
  },
  {
    id: '5',
    firstName: 'Ольга',
    lastName: 'Николаева',
    birthDate: '1982-09-05',
    insuranceNumber: '890123456789',
    phone: '+79004567890',
  },
];

export const getPatientFullName = (patient: Patient) => `${patient.lastName} ${patient.firstName}`;