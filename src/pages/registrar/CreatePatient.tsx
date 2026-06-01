import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { PageWrapper } from '../../components/ui/PageWrapper';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

interface PatientFormData {
  firstName: string;
  lastName: string;
  birthDate: string;
  phone: string;
  insuranceNumber: string;
}

export function CreatePatient() {
  const [formData, setFormData] = useState<PatientFormData>({
    firstName: '',
    lastName: '',
    birthDate: '',
    phone: '',
    insuranceNumber: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Валидация обязательных полей
      if (!formData.firstName || !formData.lastName || !formData.birthDate) {
        throw new Error('Заполните обязательные поля');
      }

      const response = await fetch('https://localhost:7190/api/patient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          birthDate: formData.birthDate,
          phone: formData.phone,
          insuranceNumber: formData.insuranceNumber
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Ошибка при создании пациента');
      }

      toast.success(`Пациент ${data.firstName} ${data.lastName} успешно зарегистрирован!`);
      navigate('/registrar/patients'); // Перенаправляем на список пациентов
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Неизвестная ошибка');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <PageWrapper title="Регистрация пациента">
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Имя *"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            minLength={2}
          />
          
          <Input
            label="Фамилия *"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            minLength={2}
          />
          
          <Input
            label="Дата рождения *"
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            required
            max={new Date().toISOString().split('T')[0]}
          />
          
          <Input
            label="Телефон"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            pattern="\+?\d{10,15}"
            title="Формат: +71234567890 или 81234567890"
          />
          
          <Input
            label="Страховой номер"
            name="insuranceNumber"
            value={formData.insuranceNumber}
            onChange={handleChange}
          />
          
          <div className="flex justify-end gap-4 pt-4">
            <Button 
              type="button" 
              onClick={() => navigate('/registrar/patients')}
            >
              Отмена
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="min-w-[200px]"
            >
              {isSubmitting ? 'Создание...' : 'Зарегистрировать пациента'}
            </Button>
          </div>
        </form>
      </Card>
    </PageWrapper>
  );
}