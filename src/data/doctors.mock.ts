// src/data/doctors.mock.ts
export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  avatar?: string;
}

export const MOCK_DOCTORS: Doctor[] = [
  {
    id: '1',
    firstName: 'Иван',
    lastName: 'Петров',
    specialty: 'Терапевт',
    avatar: '/avatars/doctor1.jpg',
  },
  {
    id: '2',
    firstName: 'Мария',
    lastName: 'Сидорова',
    specialty: 'Хирург',
    avatar: '/avatars/doctor2.jpg',
  },
  {
    id: '3',
    firstName: 'Алексей',
    lastName: 'Иванов',
    specialty: 'Кардиолог',
    avatar: '/avatars/doctor3.jpg',
  },
  {
    id: '4',
    firstName: 'Елена',
    lastName: 'Смирнова',
    specialty: 'Невролог',
    avatar: '/avatars/doctor4.jpg',
  },
  {
    id: '5',
    firstName: 'Дмитрий',
    lastName: 'Кузнецов',
    specialty: 'Педиатр',
    avatar: '/avatars/doctor5.jpg',
  },
  {
    id: '6',
    firstName: 'Ольга',
    lastName: 'Васильева',
    specialty: 'Офтальмолог',
    avatar: '/avatars/doctor6.jpg',
  },
  {
    id: '7',
    firstName: 'Сергей',
    lastName: 'Николаев',
    specialty: 'Отоларинголог',
    avatar: '/avatars/doctor7.jpg',
  },
];

export const getDoctorFullName = (doctor: Doctor) => `${doctor.lastName} ${doctor.firstName}`;
export const getDoctorShortName = (doctor: Doctor) => `${doctor.lastName} ${doctor.firstName[0]}.`;