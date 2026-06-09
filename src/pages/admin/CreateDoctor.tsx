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
  login: string;
}

export function CreateDoctor() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [formData, setFormData] = useState<DoctorFormData>({
    firstName: '',
    lastName: '',
    specialtyId: '',
    plannedWeeklyHours: 40,
    login: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const { isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadSpecialties = async () => {
      try {
        const data = await getSpecialties();
        setSpecialties(data);
      } catch (err) {
        toast.error("Не удалось загрузить специальности");
        console.log(err);
      }
    };

    loadSpecialties();
  }, []);

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
        plannedWeeklyHours: formData.plannedWeeklyHours,
        login: formData.login
      });

      toast.success(
        <div>
          <div className="font-semibold mb-2">✓ Врач успешно создан!</div>
          <div className="border-t border-green-200 pt-2 mt-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-gray-600">Логин:</span>
              <span className="font-mono text-green-800">{doctor.login}</span>
              <span className="text-gray-600">Пароль:</span>
              <span className="font-mono text-green-800">{doctor.temporaryPassword}</span>
            </div>
          </div>
          <div className="text-xs text-amber-600 mt-2 pt-2 border-t border-green-200">
            ⚠️ Сохраните эти данные для передачи врачу
          </div>
        </div>,
        {
          autoClose: 8000,
          position: "top-right"
        }
      );
      
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
      <div className="max-w-3xl mx-auto">
        {/* Кнопка назад */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/admin')}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2 text-sm transition-colors"
          >
            ← Назад к панели администратора
          </button>
        </div>

        <Card>
          {/* Заголовок */}
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Добавление нового врача</h2>
            <p className="text-gray-600 mt-1 text-sm">
              Заполните информацию о враче. Пароль будет сгенерирован автоматически.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Имя"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Введите имя"
                required
                minLength={2}
              />
              <Input
                label="Фамилия"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Введите фамилию"
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

            <Input
              label="Логин"
              name="login"
              value={formData.login}
              onChange={handleChange}
              placeholder="Введите логин для входа"
              required              
            />

            {/* Информационный блок */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="text-blue-600 text-lg">🔐</div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">
                    О пароле
                  </h4>
                  <p className="text-xs text-blue-700">
                    Пароль будет сгенерирован автоматически и показан в уведомлении после создания.
                    Обязательно сохраните его и передайте врачу.
                  </p>
                </div>
              </div>
            </div>

            {/* Кнопки */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate('/admin')}
              >
                Отмена
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="min-w-[160px]"
              >
                {isLoading ? 'Создание...' : 'Создать врача'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Подсказки */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-2xl mb-1">👨‍⚕️</div>
            <div className="text-xs text-gray-600">Данные врача</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-2xl mb-1">📅</div>
            <div className="text-xs text-gray-600">Расписание составится автоматически</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-2xl mb-1">🔑</div>
            <div className="text-xs text-gray-600">Пароль генерируется автоматически</div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}