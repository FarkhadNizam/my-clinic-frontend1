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
  const [errors, setErrors] = useState<Partial<Record<keyof PatientFormData, string>>>({});
  const { token } = useAuth();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PatientFormData, string>> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Введите имя';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'Имя должно содержать минимум 2 символа';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Введите фамилию';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Фамилия должна содержать минимум 2 символа';
    }
    
    if (!formData.birthDate) {
      newErrors.birthDate = 'Выберите дату рождения';
    } else {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 0 || age > 120) {
        newErrors.birthDate = 'Некорректная дата рождения';
      }
    }
    
    
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Пожалуйста, исправьте ошибки в форме');
      return;
    }
    
    setIsSubmitting(true);

    try {
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

      toast.success(
        <div>
          <div className="font-semibold mb-2">✓ Пациент успешно зарегистрирован!</div>
          <div className="border-t border-green-200 pt-2 mt-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-gray-600">ФИО:</span>
              <span className="font-medium">{data.lastName} {data.firstName}</span>
              <span className="text-gray-600">Дата рождения:</span>
              <span>{new Date(data.birthDate).toLocaleDateString('ru-RU')}</span>
            </div>
          </div>
        </div>,
        { autoClose: 5000 }
      );
      
      navigate('/registrar/patients');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Неизвестная ошибка');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Очищаем ошибку при изменении поля
    if (errors[name as keyof PatientFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Расчет возраста
  const calculateAge = () => {
    if (!formData.birthDate) return null;
    const birthDate = new Date(formData.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge();

  return (
    <PageWrapper title="Регистрация пациента">
      <div className="max-w-3xl mx-auto">
        {/* Кнопка назад */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/registrar/patients')}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2 text-sm transition-colors"
          >
            ← Назад к списку пациентов
          </button>
        </div>

        <Card>
          {/* Заголовок */}
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Новый пациент</h2>
            <p className="text-gray-600 mt-1 text-sm">
              Заполните информацию о пациенте. Поля со звездочкой обязательны для заполнения.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Имя *"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Введите имя"
                required                
              />
              
              <Input
                label="Фамилия *"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Введите фамилию"
                required                
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Input
                  label="Дата рождения *"
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  required                  
                />
                {age !== null && age >= 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Возраст: {age} {age % 10 === 1 && age % 100 !== 11 ? 'год' : 
                               age % 10 >= 2 && age % 10 <= 4 && (age % 100 < 10 || age % 100 >= 20) ? 'года' : 'лет'}
                  </p>
                )}
              </div>
              
              <Input
                label="Телефон"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+7 (XXX) XXX-XX-XX"                
              />
            </div>

            <Input
              label="Страховой номер"
              name="insuranceNumber"
              value={formData.insuranceNumber}
              onChange={handleChange}
              placeholder="XXX-XXX-XXX XX"              
            />

            {/* Информационный блок */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="text-blue-600 text-lg">ℹ️</div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">
                    Информация о регистрации
                  </h4>
                  <p className="text-xs text-blue-700">
                    После регистрации пациент сможет записываться на приём к врачам.
                    Все данные защищены и хранятся в соответствии с законодательством.
                  </p>
                </div>
              </div>
            </div>

            {/* Кнопки */}
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate('/registrar/patients')}
              >
                Отмена
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="min-w-[220px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Регистрация...
                  </div>
                ) : (
                  'Зарегистрировать пациента'
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* Подсказки */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">📝</div>
            <div className="text-xs text-gray-600">Заполните данные</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">✅</div>
            <div className="text-xs text-gray-600">Проверьте корректность</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">💾</div>
            <div className="text-xs text-gray-600">Сохраните информацию</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">🔒</div>
            <div className="text-xs text-gray-600">Данные защищены</div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}