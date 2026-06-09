import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageWrapper } from '../../components/ui/PageWrapper';
import { Card } from '../../components/ui/Card';
import { 
  CalendarIcon, 
  ClockIcon, 
  UserCircleIcon, 
  ChevronRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon as ClockIconSolid,
  UserGroupIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import { getDoctorAppointments } from '../../api/doctorApi';

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  date: string;
  time: string;
  status: string;
}

export function DoctorDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Booked":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Canceled":
        return "bg-red-100 text-red-700 border-red-200";
      case "NoShow":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircleSolid className="h-4 w-4" />;
      case "Booked":
        return <CalendarIcon className="h-4 w-4" />;
      case "Canceled":
        return <XCircleIcon className="h-4 w-4" />;
      case "NoShow":
        return <ClockIconSolid className="h-4 w-4" />;
      default:
        return <UserCircleIcon className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "Completed":
        return "Завершён";
      case "Booked":
        return "Запланирован";
      case "Canceled":
        return "Отменён";
      case "NoShow":
        return "Не явился";
      default:
        return status;
    }
  };

  useEffect(() => {
    getDoctorAppointments()
      .then(setAppointments)
      .catch(() => console.error("Ошибка загрузки расписания"))
      .finally(() => setLoading(false));
  }, []);

  // Получаем уникальные даты для фильтра
  const uniqueDates = Array.from(new Set(appointments.map(a => a.date)));
  
  // Фильтрация записей
  const filteredAppointments = appointments.filter(appt => {
    if (selectedDate !== 'all' && appt.date !== selectedDate) return false;
    if (statusFilter !== 'all' && appt.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    return true;
  });

  // Группировка по датам
  const groupedAppointments = filteredAppointments.reduce((groups, appointment) => {
    const date = appointment.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(appointment);
    return groups;
  }, {} as Record<string, Appointment[]>);

  // Статистика
  const stats = {
    total: appointments.length,
    booked: appointments.filter(a => a.status === "Planned").length,
    completed: appointments.filter(a => a.status === "Completed").length,
    canceled: appointments.filter(a => a.status === "Canceled").length,
  };

  if (loading) {
    return (
      <PageWrapper title="Расписание приёмов">
        <Card>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500">Загрузка расписания...</p>
          </div>
        </Card>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Расписание приёмов">
      <div className="space-y-6">
        {/* Статистика */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Всего приёмов</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">{stats.total}</p>
              </div>
              <div className="bg-blue-200 p-3 rounded-full">
                <CalendarDaysIcon className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600 font-medium">Завершено</p>
                <p className="text-3xl font-bold text-emerald-900 mt-1">{stats.completed}</p>
              </div>
              <div className="bg-emerald-200 p-3 rounded-full">
                <CheckCircleIcon className="h-6 w-6 text-emerald-700" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-600 font-medium">Запланировано</p>
                <p className="text-3xl font-bold text-indigo-900 mt-1">{stats.booked}</p>
              </div>
              <div className="bg-indigo-200 p-3 rounded-full">
                <ClockIcon className="h-6 w-6 text-indigo-700" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600 font-medium">Отменено</p>
                <p className="text-3xl font-bold text-amber-900 mt-1">{stats.canceled}</p>
              </div>
              <div className="bg-amber-200 p-3 rounded-full">
                <XCircleIcon className="h-6 w-6 text-amber-700" />
              </div>
            </div>
          </Card>
        </div>

        {/* Фильтры */}
        <Card>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Фильтр по дате
              </label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Все даты</option>
                {uniqueDates.map(date => (
                  <option key={date} value={date}>
                    {new Date(date).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Фильтр по статусу
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Все статусы</option>
                <option value="Planned">Запланированные</option>
                <option value="completed">Завершённые</option>
                <option value="canceled">Отменённые</option>
                <option value="noshow">Не явились</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Список приёмов */}
        {filteredAppointments.length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedAppointments).map(([date, dateAppointments]) => (
              <div key={date} className="space-y-3">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {new Date(date).toLocaleDateString('ru-RU', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {dateAppointments.length} {dateAppointments.length === 1 ? 'приём' : 'приёма'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  {dateAppointments.map((appt) => (
                    <Link key={appt.id} to={`/doctor/appointment/${appt.id}`}>
                      <Card className="group hover:shadow-lg transition-all duration-300 hover:border-blue-200 cursor-pointer overflow-hidden relative">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 group-hover:w-2 transition-all duration-300"></div>
                        
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pl-4">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-full shadow-lg">
                              <UserCircleIcon className="h-6 w-6 text-white" />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h4 className="font-semibold text-lg text-gray-900">
                                  {appt.patientName}
                                </h4>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                  {appt.patientAge} лет
                                </span>
                                <span className={`text-xs px-3 py-1 rounded-full border flex items-center gap-1 ${getStatusColor(appt.status)}`}>
                                  {getStatusIcon(appt.status)}
                                  {getStatusText(appt.status)}
                                </span>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <CalendarIcon className="h-4 w-4 mr-1 text-blue-500" />
                                  <span>
                                    {new Date(appt.date).toLocaleDateString('ru-RU', {
                                      day: 'numeric',
                                      month: 'long'
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <ClockIcon className="h-4 w-4 mr-1 text-blue-500" />
                                  <span>{appt.time}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 text-blue-600 font-medium group-hover:translate-x-1 transition-transform duration-300">
                            <span className="text-sm">Подробнее</span>
                            <ChevronRightIcon className="h-4 w-4" />
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-gray-100 rounded-full p-4 mb-4">
                <UserGroupIcon className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Нет запланированных приёмов
              </h3>
              <p className="text-gray-500 max-w-sm">
                {selectedDate !== 'all' || statusFilter !== 'all'
                  ? "По выбранным фильтрам приёмов не найдено. Попробуйте изменить параметры фильтрации."
                  : "На ближайшее время запланированных приёмов нет. Отдыхайте!"}
              </p>
              {(selectedDate !== 'all' || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSelectedDate('all');
                    setStatusFilter('all');
                  }}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Сбросить фильтры
                </button>
              )}
            </div>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
}