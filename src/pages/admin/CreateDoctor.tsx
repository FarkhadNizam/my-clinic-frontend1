import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { PageWrapper } from '../../components/ui/PageWrapper';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import type { Specialty } from '../../types';
import { createDoctor, getSpecialties } from '../../api/doctorsApi';

interface DoctorFormData {
  firstName: string;
  lastName: string;
  specialtyId: string;
  plannedWeeklyHours: number;
}

export function CreateDoctor() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [formData, setFormData] = useState<DoctorFormData>({
    firstName: '',
    lastName: '',
    specialtyId: '',
    plannedWeeklyHours: 40
  });
  const [isLoading, setIsLoading] = useState(false);

  const { isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();

  // Загрузка специальностей
  useEffect(() => {
    const loadSpecialties = async () => {
      try {
        const data = await getSpecialties();
        setSpecialties(data);
      } catch (err) {
        toast.error("Не удалось загрузить специальности");
      }
    };

    loadSpecialties();
  }, []);

  // Проверка авторизации
  useEffect(() => {
    if (!isAuthenticated || userRole !== "admin") {
      navigate("/login");
    }
  }, [isAuthenticated, userRole, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const doctor = await createDoctor({
        firstName: formData.firstName,
        lastName: formData.lastName,
        specialtyId: formData.specialtyId,
        plannedWeeklyHours: formData.plannedWeeklyHours
      });

      toast.success(`Врач ${doctor.firstName} ${doctor.lastName} успешно создан`);
      navigate("/admin");
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Ошибка при создании врача");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "plannedWeeklyHours" ? Number(value) : value
    }));
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
            name="specialtyId"
            value={formData.specialtyId}
            onChange={handleChange}
            options={specialties.map(s => ({
              value: s.id,
              label: s.name
            }))}
            required
          />

          <Input
            label="Плановая недельная нагрузка (часов)"
            name="plannedWeeklyHours"
            type="number"
            min={1}
            max={80}
            value={formData.plannedWeeklyHours}
            onChange={handleChange}
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