import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { PageWrapper } from '../../components/ui/PageWrapper';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { scheduleApi, type Doctor, type GenerateScheduleRequest } from '../../api/scheduleApi';

export function CreateSchedule() {
  const [formData, setFormData] = useState({
    doctorId: '',
    date: '',
    startTime: '09:00',
    endTime: '17:00',
    durationMinutes: 30,
  });

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewSlots, setPreviewSlots] = useState<number | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const { token } = useAuth();
  const navigate = useNavigate();

  // Загрузка врачей
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!token) return;

      try {
        const data = await scheduleApi.getDoctors(token);
        setDoctors(data);
      } catch (error) {
        toast.error('Не удалось загрузить список врачей');
        console.error(error);
      } finally {
        setIsLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, [token]);

  // Обновление выбранного врача
  useEffect(() => {
    const doctor = doctors.find(d => d.id === formData.doctorId);
    setSelectedDoctor(doctor || null);
  }, [formData.doctorId, doctors]);

  // Preview количества слотов
  useEffect(() => {
    const { startTime, endTime, durationMinutes } = formData;

    if (!startTime || !endTime || durationMinutes <= 0) {
      setPreviewSlots(null);
      return;
    }

    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);

    if (end <= start) {
      setPreviewSlots(null);
      return;
    }

    const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    const slots = Math.floor(diffMinutes / durationMinutes);

    setPreviewSlots(slots > 0 ? slots : null);
  }, [formData.startTime, formData.endTime, formData.durationMinutes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.doctorId || !formData.date) {
      toast.error('Выберите врача и дату');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      toast.error('Время окончания должно быть позже времени начала');
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData: GenerateScheduleRequest = {
        doctorId: formData.doctorId,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        durationMinutes: formData.durationMinutes,
      };

      const result = await scheduleApi.generateSchedule(token!, requestData);

      toast.success(
        <div>
          <div className="font-semibold mb-2">✓ Расписание успешно создано!</div>
          <div className="border-t border-green-200 pt-2 mt-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-gray-600">Врач:</span>
              <span className="font-medium">{selectedDoctor?.lastName} {selectedDoctor?.firstName}</span>
              <span className="text-gray-600">Дата:</span>
              <span>{new Date(formData.date).toLocaleDateString('ru-RU')}</span>
              <span className="text-gray-600">Слотов создано:</span>
              <span className="font-semibold text-green-700">{result.generatedCount}</span>
            </div>
          </div>
        </div>,
        { autoClose: 5000 }
      );

      navigate('/admin/schedules');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Неизвестная ошибка');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'durationMinutes' ? Number(value) : value,
    }));
  };

  const doctorOptions = doctors.map(d => ({
    value: d.id,
    label: `${d.lastName} ${d.firstName}`,
    subLabel: d.specialtyName || '',
  }));

  const durationOptions = [
    { value: 15, label: '15 минут' },
    { value: 30, label: '30 минут' },
    { value: 45, label: '45 минут' },
    { value: 60, label: '60 минут' },
    { value: 90, label: '90 минут' },
  ];

  // Валидация времени
  const isTimeValid = formData.startTime && formData.endTime && formData.startTime < formData.endTime;
  
  // Расчет рабочего времени в часах
  const calculateWorkHours = () => {
    if (!isTimeValid) return null;
    const start = new Date(`1970-01-01T${formData.startTime}`);
    const end = new Date(`1970-01-01T${formData.endTime}`);
    const hours = ((end.getTime() - start.getTime()) / (1000 * 60 * 60)).toFixed(1);
    return hours;
  };

  const workHours = calculateWorkHours();

  return (
    <PageWrapper title="Генерация расписания">
      <div className="max-w-3xl mx-auto">
        {/* Кнопка назад */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/admin/schedules')}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2 text-sm transition-colors"
          >
            ← Назад к списку расписаний
          </button>
        </div>

        <Card>
          {/* Заголовок */}
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Создание расписания</h2>
            <p className="text-gray-600 mt-1 text-sm">
              Настройте параметры и сгенерируйте слоты для приёма пациентов
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Выбор врача */}
            <div>
              <Select
                label="Врач"
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                options={doctorOptions}
                required
                disabled={isLoadingDoctors}
              />
              {isLoadingDoctors && (
                <p className="text-sm text-gray-500 mt-1">Загрузка списка врачей...</p>
              )}
            </div>

            {/* Информация о выбранном враче */}
            {selectedDoctor && (
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Специальность:</span>
                  <span className="font-medium text-gray-900">{selectedDoctor.specialtyName || 'Не указана'}</span>
                </div>
                {selectedDoctor.plannedWeeklyHours && (
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-600">Плановая нагрузка:</span>
                    <span className="font-medium text-gray-900">{selectedDoctor.plannedWeeklyHours} ч/неделю</span>
                  </div>
                )}
              </div>
            )}

            {/* Дата */}
            <Input
              label="Дата приёма"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />

            {/* Время работы */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Время работы
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Начало приёма"
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Окончание приёма"
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                />
              </div>
              
              {/* Индикация времени работы */}
              {workHours && (
                <div className={`text-sm ${isTimeValid ? 'text-green-600' : 'text-red-500'}`}>
                  {isTimeValid 
                    ? `✓ Продолжительность рабочего дня: ${workHours} часов`
                    : '✗ Время окончания должно быть позже времени начала'}
                </div>
              )}
            </div>

            {/* Длительность приёма */}
            <Select
              label="Длительность одного приёма"
              name="durationMinutes"
              value={formData.durationMinutes.toString()}
              onChange={handleChange}
              options={durationOptions.map(opt => ({
                value: opt.value.toString(),
                label: opt.label,
              }))}
              required
            />

            {/* Preview количества слотов */}
            {previewSlots !== null && isTimeValid && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-blue-700 mb-1">Примерное количество слотов</div>
                    <div className="text-3xl font-bold text-blue-900">{previewSlots}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">
                      {formData.durationMinutes} мин × {previewSlots} слотов
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      = {previewSlots * formData.durationMinutes} минут
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Предупреждение при отсутствии слотов */}
            {previewSlots === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                ⚠️ Внимание: При текущих настройках не будет создано ни одного слота.
                Увеличьте рабочий день или уменьшите длительность приёма.
              </div>
            )}

            {/* Кнопки действий */}
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/schedules')}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting || 
                  !formData.doctorId || 
                  !formData.date || 
                  !isTimeValid ||
                  previewSlots === 0 ||
                  isLoadingDoctors
                }
                className="min-w-[180px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Генерация...
                  </div>
                ) : (
                  'Сгенерировать расписание'
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* Информационные карточки */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">📅</div>
            <div className="text-xs text-gray-600 font-medium">Выберите дату</div>
            <div className="text-xs text-gray-500 mt-1">Расписание создаётся на один день</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">⏰</div>
            <div className="text-xs text-gray-600 font-medium">Настройте время</div>
            <div className="text-xs text-gray-500 mt-1">Укажите рабочие часы врача</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">⚡</div>
            <div className="text-xs text-gray-600 font-medium">Автоматически</div>
            <div className="text-xs text-gray-500 mt-1">Слоты создадутся автоматически</div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}