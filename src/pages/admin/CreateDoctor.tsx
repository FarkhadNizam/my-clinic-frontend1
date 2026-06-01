import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { PageWrapper } from '../../components/ui/PageWrapper';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const SPECIALTIES = [
  { value: 'therapist', label: 'Терапевт' },
  { value: 'surgeon', label: 'Хирург' },
  { value: 'pediatrician', label: 'Педиатр' },
  { value: 'neurologist', label: 'Невролог' },
  { value: 'cardiologist', label: 'Кардиолог' },
];

interface DoctorFormData {
  firstName: string;
  lastName: string;
  specialty: string;
}

export function CreateDoctor() {
  const [formData, setFormData] = useState<DoctorFormData>({
    firstName: '',
    lastName: '',
    specialty: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();

  // Проверяем авторизацию и роль пользователя
  if (!isAuthenticated || userRole !== 'admin') {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('https://localhost:7190/api/doctor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          specialty: formData.specialty
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Ошибка при создании врача');
      }

      toast.success(`Врач ${data.firstName} ${data.lastName} успешно создан!`);
      setFormData({ firstName: '', lastName: '', specialty: '' }); // Сбрасываем форму
      navigate('/admin'); // Перенаправляем в админ-панель
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <PageWrapper title="Создание врача">
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Имя"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              minLength={2}
            />
            <Input
              label="Фамилия"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              minLength={2}
            />
          </div>
          
          <Select
  label="Специальность"
  name="specialty" // Добавляем name
  value={formData.specialty}
  onChange={handleChange}
  options={SPECIALTIES}
  required
/>
          
          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              onClick={() => navigate('/admin')}
            >
              Отмена
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="min-w-[150px]"
            >
              {isLoading ? 'Создание...' : 'Создать врача'}
            </Button>
          </div>
        </form>
      </Card>
    </PageWrapper>
  );
}