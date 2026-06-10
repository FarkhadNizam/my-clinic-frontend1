import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from '../../components/ui/Button';
import { PageWrapper } from '../../components/ui/PageWrapper';
import { Card } from '../../components/ui/Card';
import {
  getAppointments,
  cancelAppointment,
} from "../../api/appointmentsApi";

// Расширенный интерфейс для Appointment
interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  specialtyName: string;
  date: string;
  timeFrom: string;
  timeTo: string;
  status: number;
}

// Маппинг статусов
const statusMap: { [key: number]: { ru: string; en: string; style: string } } = {
  1: { ru: "Запланирован", en: "Planned", style: "bg-blue-50 text-blue-700 border border-blue-200" },
  5: { ru: "Завершен", en: "Completed", style: "bg-green-50 text-green-700 border border-green-200" },
  2: { ru: "Отменен", en: "Cancelled", style: "bg-red-50 text-red-700 border border-red-200" },
  3: { ru: "Неявка", en: "NoShow", style: "bg-orange-50 text-orange-700 border border-orange-200" },
};

export function AppointmentsPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAppointments();
      setAppointments(data);
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация по поиску и статусу
  const filteredAppointments = appointments.filter(a => {
    const matchesSearch = 
      a.patientName.toLowerCase().includes(search.toLowerCase()) ||
      a.doctorName.toLowerCase().includes(search.toLowerCase()) ||
      a.specialtyName.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || statusMap[a.status]?.en === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Пагинация
  const pagedAppointments = filteredAppointments.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const totalPages = Math.ceil(filteredAppointments.length / pageSize);

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  // Форматирование времени
  const formatTime = (timeString: string) => {
    if (!timeString) return "--:--";
    // Если время приходит в формате "09:00:00" или "09:00"
    const parts = timeString.split(':');
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
  };

  return (
    <PageWrapper title="Журнал записей на прием">
      <Card>
        {/* Панель фильтрации */}
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Поиск */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Поиск
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Пациент, врач или специальность..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                />
              </div>
            </div>

            {/* Фильтр по статусу */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Статус
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
              >
                <option value="all">Все записи</option>
                <option value="Planned">Запланированные</option>
                <option value="Completed">Завершенные</option>
                <option value="Cancelled">Отмененные</option>
                <option value="NoShow">Неявка</option>
              </select>
            </div>
          </div>

          {/* Статистика */}
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-500">
              Найдено: <span className="font-semibold text-gray-900">{filteredAppointments.length}</span> записей
            </div>
            {loading && (
              <div className="text-gray-400">
                Загрузка...
              </div>
            )}
          </div>
        </div>

        {/* Таблица */}
        <div className="overflow-x-auto border border-gray-100 rounded-lg">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Пациент
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Врач
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Специальность
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Дата
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Время
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pagedAppointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="text-gray-400 text-sm">
                      Записи не найдены
                    </div>
                  </td>
                </tr>
              ) : (
                pagedAppointments.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-gray-900">
                        {a.patientName}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-700">
                        {a.doctorName}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-500">
                        {a.specialtyName}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-700 whitespace-nowrap">
                        {formatDate(a.date)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-700 whitespace-nowrap">
                        {formatTime(a.timeFrom)} – {formatTime(a.timeTo)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-md text-xs font-medium ${statusMap[a.status]?.style}`}>
                        {statusMap[a.status]?.ru}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/registrar/appointment/${a.id}`)}
                          className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-50 rounded hover:bg-gray-100 transition border border-gray-200"
                        >
                          Просмотр
                        </button>

                        {a.status === 0 && (
                          <>
                            <button
                              onClick={() => navigate(`/registrar/reschedule/${a.id}`)}
                              className="px-3 py-1 text-xs font-medium text-yellow-600 bg-yellow-50 rounded hover:bg-yellow-100 transition border border-yellow-200"
                            >
                              Перенос
                            </button>

                            <button
                              onClick={async () => {
                                if (window.confirm("Вы уверены, что хотите отменить запись?")) {
                                  await cancelAppointment(a.id);
                                  await load();
                                }
                              }}
                              className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition border border-red-200"
                            >
                              Отмена
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Пагинация */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
            <div className="text-xs text-gray-500">
              {((page - 1) * pageSize) + 1} – {Math.min(page * pageSize, filteredAppointments.length)} из {filteredAppointments.length}
            </div>
            
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Назад
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 text-xs font-medium rounded transition ${
                      pageNum === page
                        ? "bg-blue-600 text-white"
                        : "border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Вперед
              </button>
            </div>
          </div>
        )}
      </Card>
    </PageWrapper>
  );
}