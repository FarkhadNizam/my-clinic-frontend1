import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageWrapper } from '../../components/ui/PageWrapper';
import { Card } from '../../components/ui/Card';
import { CalendarIcon, ClockIcon, UserCircleIcon } from '@heroicons/react/24/outline';

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
}

export function DoctorDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://localhost:7190/api/doctors/appointments')
      .then(res => res.json())
      .then(data => setAppointments(data))
      .catch(err => console.error('Ошибка загрузки расписания:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageWrapper title="Расписание приёмов">
      {loading ? (
        <Card><div className="p-4 text-center">Загрузка...</div></Card>
      ) : appointments.length > 0 ? (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <Link key={appt.id} to={`/doctor/appointment/${appt.id}/${appt.patientId}`}>
              <Card className="hover:bg-blue-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <UserCircleIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-lg">{appt.patientName}</div>
                      <div className="text-sm text-gray-500 mt-1 flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {new Date(appt.date).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                        <span className="mx-2">•</span>
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {appt.time}
                      </div>
                    </div>
                  </div>
                  <div className="text-blue-600 font-medium flex items-center">
                    Приём <span className="ml-1">→</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-8 text-gray-500">
            На ближайшее время запланированных приёмов нет
          </div>
        </Card>
      )}
    </PageWrapper>
  );
}
