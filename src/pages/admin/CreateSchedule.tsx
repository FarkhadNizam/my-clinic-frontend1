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

      const doctor = doctors.find(d => d.id === formData.doctorId);

      toast.success(
        `Расписание успешно создано для ${doctor?.lastName} ${doctor?.firstName[0]}. ` +
        `на ${new Date(formData.date).toLocaleDateString('ru-RU')}. ` +
        `Сгенерировано ${result.generatedCount} слотов.`
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

  return (
    <PageWrapper title="Генерация расписания">
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Select
            label="Врач"
            name="doctorId"
            value={formData.doctorId}
            onChange={handleChange}
            options={doctorOptions}
            required
            disabled={isLoadingDoctors}
          />

          {isLoadingDoctors && <p className="text-sm text-gray-500">Загрузка врачей...</p>}

          <Input
            label="Дата"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            required
          />

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
          {previewSlots !== null && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              Примерное количество слотов: <strong>{previewSlots}</strong>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/schedules')}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.doctorId || !formData.date || isLoadingDoctors}
            >
              {isSubmitting ? 'Генерация...' : 'Сгенерировать расписание'}
            </Button>
          </div>
        </form>
      </Card>
    </PageWrapper>
  );
}