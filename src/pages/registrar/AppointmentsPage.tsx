import { useEffect, useMemo, useState } from "react";
import { Button } from "../../components/ui/Button";
import { PageWrapper } from "../../components/ui/PageWrapper";
import { Card } from "../../components/ui/Card";
import { toast } from "react-toastify";

import {
  getAppointments,
  cancelAppointment,
  markNoShowAppointment
} from "../../api/appointmentsApi";

interface Appointment {
  id: string;
  patientName: string;
  patientPhone?: string; // Добавляем телефон пациента
  doctorName: string;
  specialtyName: string;
  date: string;
  timeFrom: string;
  timeTo: string;
  status: string | number;
}

type FilterType = "today" | "tomorrow" | "week" | "all";

// Функция для извлечения времени
const extractTime = (dateTimeString: string) => {
  if (!dateTimeString) return "";
  
  try {
    const date = new Date(dateTimeString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });
    }
  } catch {
    // Игнорируем ошибки парсинга
  }
  
  if (dateTimeString.includes("T")) {
    const timePart = dateTimeString.split("T")[1];
    return timePart.substring(0, 5);
  }
  
  if (dateTimeString.includes(" ")) {
    const timePart = dateTimeString.split(" ")[1];
    return timePart.substring(0, 5);
  }
  
  return dateTimeString;
};

// Форматирование номера телефона для удобного отображения
const formatPhoneNumber = (phone: string | undefined) => {
  if (!phone) return "—";
  
  // Удаляем все нецифровые символы
  const cleaned = phone.replace(/\D/g, '');
  
  // Форматируем в зависимости от длины
  if (cleaned.length === 11) {
    // +7 XXX XXX XX XX
    return `+7 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9, 11)}`;
  } else if (cleaned.length === 10) {
    // XXX XXX XX XX
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
  }
  
  return phone;
};

// Маппинг статусов из чисел в строки
const mapStatusToString = (status: string | number): string => {
  if (typeof status === 'string') {
    const statusLower = status.toLowerCase();
    if (statusLower === 'planned') return 'Planned';
    if (statusLower === 'completed') return 'Completed';
    if (statusLower === 'cancelled') return 'Cancelled';
    if (statusLower === 'noshow') return 'NoShow';
    return status;
  }
  
  const statusMap: Record<number, string> = {
    0: 'Planned',
    1: 'Completed', 
    2: 'Cancelled',
    3: 'NoShow',
  };
  
  return statusMap[status] || 'Unknown';
};

const getStatusText = (status: string | number) => {
  const mappedStatus = mapStatusToString(status);
  
  switch (mappedStatus) {
    case "Planned":
      return "Запланирован";
    case "Completed":
      return "Завершён";
    case "Cancelled":
      return "Отменён";
    case "NoShow":
      return "Не явился";
    default:
      return String(status);
  }
};

const getStatusClass = (status: string | number) => {
  const mappedStatus = mapStatusToString(status);
  
  switch (mappedStatus) {
    case "Planned":
      return "bg-blue-100 text-blue-800";
    case "Completed":
      return "bg-green-100 text-green-800";
    case "Cancelled":
      return "bg-red-100 text-red-800";
    case "NoShow":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const canPerformActions = (status: string | number) => {
  const mappedStatus = mapStatusToString(status);
  return mappedStatus === "Planned";
};

export function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("today");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getAppointments();
      setAppointments(data);
    } catch (error) {
      toast.error("Ошибка загрузки записей");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Вы уверены, что хотите отменить эту запись?")) return;
    
    try {
      setActionLoading(id);
      await cancelAppointment(id);
      toast.success("Запись отменена");
      await load();
    } catch (error) {
      toast.error("Ошибка при отмене записи");
    } finally {
      setActionLoading(null);
    }
  };

  const handleNoShow = async (id: string) => {
    if (!confirm("Отметить пациента как не явившегося?")) return;
    
    try {
      setActionLoading(id);
      await markNoShowAppointment(id);
      toast.success("Пациент отмечен как не явившийся");
      await load();
    } catch (error) {
      toast.error("Ошибка при отметке");
    } finally {
      setActionLoading(null);
    }
  };

  // Функция для звонка по телефону
  const handleCall = (phone: string | undefined) => {
    if (!phone) {
      toast.warning("Номер телефона не указан");
      return;
    }
    
    // Очищаем номер от лишних символов
    const cleaned = phone.replace(/\D/g, '');
    const telLink = cleaned.length === 11 ? `+${cleaned}` : cleaned;
    
    // Создаем ссылку для звонка
    window.location.href = `tel:${telLink}`;
  };

  const filteredAppointments = useMemo(() => {
    let result = [...appointments];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filter === "today") {
      result = result.filter(a => {
        const d = new Date(a.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      });
    }

    if (filter === "tomorrow") {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      result = result.filter(a => {
        const d = new Date(a.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === tomorrow.getTime();
      });
    }

    if (filter === "week") {
      const end = new Date(today);
      end.setDate(end.getDate() + 7);
      result = result.filter(a => {
        const d = new Date(a.date);
        return d >= today && d <= end;
      });
    }

    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(
        a =>
          a.patientName.toLowerCase().includes(s) ||
          a.doctorName.toLowerCase().includes(s) ||
          a.specialtyName.toLowerCase().includes(s) ||
          (a.patientPhone && a.patientPhone.includes(s))
      );
    }

    return result;
  }, [appointments, filter, search]);

  const stats = {
    total: filteredAppointments.length,
    planned: filteredAppointments.filter(a => mapStatusToString(a.status) === "Planned").length,
    completed: filteredAppointments.filter(a => mapStatusToString(a.status) === "Completed").length,
    cancelled: filteredAppointments.filter(a => mapStatusToString(a.status) === "Cancelled").length,
  };

  return (
    <PageWrapper title="Записи на приём">
      <div className="space-y-6">
        {/* Статистика */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Всего записей</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <div className="bg-blue-200 p-3 rounded-full">
                <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-600 font-medium">Запланировано</p>
                <p className="text-2xl font-bold text-indigo-900">{stats.planned}</p>
              </div>
              <div className="bg-indigo-200 p-3 rounded-full">
                <svg className="w-6 h-6 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Завершено</p>
                <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
              </div>
              <div className="bg-green-200 p-3 rounded-full">
                <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Отменено</p>
                <p className="text-2xl font-bold text-red-900">{stats.cancelled}</p>
              </div>
              <div className="bg-red-200 p-3 rounded-full">
                <svg className="w-6 h-6 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Фильтры и поиск */}
        <Card>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filter === "today" ? "default" : "outline"}
                onClick={() => setFilter("today")}
              >
                Сегодня
              </Button>
              <Button
                variant={filter === "tomorrow" ? "default" : "outline"}
                onClick={() => setFilter("tomorrow")}
              >
                Завтра
              </Button>
              <Button
                variant={filter === "week" ? "default" : "outline"}
                onClick={() => setFilter("week")}
              >
                Неделя
              </Button>
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
              >
                Все
              </Button>
            </div>

            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                className="w-full border rounded-lg px-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Поиск по пациенту, врачу, специальности или телефону..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </Card>

        {/* Таблица записей */}
        <Card>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-500">Загрузка записей...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <p className="text-gray-500">Нет записей на приём</p>
              <p className="text-sm text-gray-400 mt-1">
                {search || filter !== "all" 
                  ? "Попробуйте изменить параметры фильтрации"
                  : "Записи появятся после регистрации пациентов"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gray-50">
                    <th className="text-left p-3 font-semibold text-gray-700">Пациент</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Телефон</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Врач</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Специальность</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Дата и время</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Статус</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((appointment) => {
                    const canAct = canPerformActions(appointment.status);
                    const formattedPhone = formatPhoneNumber(appointment.patientPhone);
                    const hasPhone = !!appointment.patientPhone;
                    
                    return (
                      <tr key={appointment.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center">
                              <span className="text-blue-600 text-sm">👤</span>
                            </div>
                            <span className="font-medium text-gray-900">{appointment.patientName}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          {hasPhone ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-700 font-mono">
                                {formattedPhone}
                              </span>
                              <button
                                onClick={() => handleCall(appointment.patientPhone)}
                                className="text-green-600 hover:text-green-700 transition-colors"
                                title="Позвонить пациенту"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="text-gray-900">{appointment.doctorName}</div>
                        </td>
                        <td className="p-3">
                          <span className="text-sm text-gray-600">{appointment.specialtyName}</span>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1 text-gray-900">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-sm">{new Date(appointment.date).toLocaleDateString("ru-RU")}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600 mt-1">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-sm">
                                {extractTime(appointment.timeFrom)} - {extractTime(appointment.timeTo)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(appointment.status)}`}>
                            {getStatusText(appointment.status)}
                          </span>
                        </td>
                        <td className="p-3">
                          {canAct ? (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancel(appointment.id)}
                                disabled={actionLoading === appointment.id}
                                className="text-red-600 hover:bg-red-50 border-red-300"
                              >
                                {actionLoading === appointment.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent"></div>
                                ) : (
                                  "Отменить"
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleNoShow(appointment.id)}
                                disabled={actionLoading === appointment.id}
                                className="text-yellow-600 hover:bg-yellow-50 border-yellow-300"
                              >
                                {actionLoading === appointment.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-600 border-t-transparent"></div>
                                ) : (
                                  "Не явился"
                                )}
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </PageWrapper>
  );
}