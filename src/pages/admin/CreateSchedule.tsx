import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { PageWrapper } from '../../components/ui/PageWrapper';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

interface GenerateScheduleRequest {
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
}

export function CreateSchedule() {
  const [formData, setFormData] = useState({
    doctorId: '',
    date: '',
    startTime: '09:00',
    endTime: '17:00',
    duration: 60
  });
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const { token } = useAuth();
  const navigate = useNavigate();

  // Загрузка списка врачей
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch('https://localhost:7190/api/doctor', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Ошибка при загрузке врачей');
        }

        const data = await response.json();
        setDoctors(data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toast.error('Не удалось загрузить список врачей');
      } finally {
        setIsLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.doctorId || !formData.date) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedDoctor = doctors.find(d => d.id === formData.doctorId);
      if (!selectedDoctor) {
        throw new Error('Врач не найден');
      }

      const requestData: GenerateScheduleRequest = {
        doctorId: formData.doctorId,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        durationMinutes: formData.duration
      };

      const response = await fetch('https://localhost:7190/api/schedule/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Ошибка при генерации расписания');
      }

      toast.success(
        `Расписание для ${selectedDoctor.lastName} ${selectedDoctor.firstName[0]}. ` +
        `на ${new Date(formData.date).toLocaleDateString()} создано! ` +
        `Сгенерировано ${data.generatedCount} слотов`
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const doctorOptions = doctors.map(doctor => ({
    value: doctor.id,
    label: `${doctor.lastName} ${doctor.firstName[0]}.`,
    subLabel: doctor.specialty
  }));

  const durationOptions = [
    { value: 30, label: '30 минут' },
    { value: 45, label: '45 минут' },
    { value: 60, label: '1 час' },
    { value: 90, label: '1,5 часа' },
    { value: 120, label: '2 часа' }
  ];

  return (
    <PageWrapper title="Генерация расписания">
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="text-sm text-gray-500">Загрузка списка врачей...</div>
          )}
          
          <Input 
            label="Дата приема" 
            type="date" 
            name="date"
            value={formData.date} 
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Начало приема"
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
            />
            
            <Input
              label="Окончание приема"
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required
            />
          </div>
          
          <Select
            label="Длительность приема"
            name="duration"
            value={formData.duration.toString()}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              duration: Number(e.target.value)
            }))}
            options={durationOptions.map(opt => ({
              value: opt.value.toString(),
              label: opt.label
            }))}
            required
          />
          
          <div className="flex justify-end gap-4 pt-4">
            <Button 
              type="button" 
              onClick={() => navigate('/admin/schedules')}
            >
              Отмена
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.doctorId || !formData.date || isLoadingDoctors}
              className="min-w-[200px]"
            >
              {isSubmitting ? 'Генерация...' : 'Сгенерировать расписание'}
            </Button>
          </div>
        </form>
      </Card>
    </PageWrapper>
  );
}