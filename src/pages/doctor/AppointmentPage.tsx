import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { TextArea } from '../../components/ui/TextArea';
import { Button } from '../../components/ui/Button';
import { PageWrapper } from '../../components/ui/PageWrapper';
import { Card } from '../../components/ui/Card';
import { CalendarIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

type Doctor = {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
};

type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  insuranceNumber: string;
  phone: string;
};

type Visit = {
  id: string;
  date: string;
  complaints: string;
  diagnosis: string;
  treatment: string;
  status: string;
  doctor: Doctor;
};

type FullVisit = Visit & {
  patient: Patient;
  history: Visit[];
};

export function AppointmentPage() {
  const { visitId, patientId } = useParams();
  const [visit, setVisit] = useState<FullVisit | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClosed, setIsClosed] = useState(false);
  const [isNewVisit, setIsNewVisit] = useState(false);

  const [complaints, setComplaints] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');

  useEffect(() => {
    const fetchVisit = async () => {
      try {
        if (!visitId || !patientId) return;

        const response = await fetch(`https://localhost:7190/api/MedicalVisits/${visitId}/${patientId}`);
        
        if (!response.ok && response.status === 404) {
          // Визит не найден, создаем новый
          setIsNewVisit(true);
          
          // Загружаем данные пациента
          const patientResponse = await fetch(`https://localhost:7190/api/Patient/${patientId}`);
          if (!patientResponse.ok) {
            throw new Error('Не удалось загрузить данные пациента');
          }
          const patientData = await patientResponse.json();

          // TODO: Заменить на текущего доктора из системы аутентификации
          const doctorId = "71b501ff-49ae-4601-8c44-c77fcffb047a";
          const doctorResponse = await fetch(`https://localhost:7190/api/Doctor/${doctorId}`);
          if (!doctorResponse.ok) {
            throw new Error('Не удалось загрузить данные доктора');
          }
          const doctorData = await doctorResponse.json();

          setVisit({
            id: visitId,
            date: new Date().toISOString(),
            complaints: '',
            diagnosis: '',
            treatment: '',
            status: 'planned',
            doctor: {
              id: doctorId,
              firstName: doctorData.firstName,
              lastName: doctorData.lastName,
              specialty: doctorData.specialty
            },
            patient: {
              id: patientId,
              firstName: patientData.firstName,
              lastName: patientData.lastName,
              birthDate: patientData.birthDate,
              insuranceNumber: patientData.insuranceNumber,
              phone: patientData.phone
            },
            history: []
          });
          return;
        }

        const data: FullVisit = await response.json();
        setVisit(data);
        setComplaints(data.complaints || '');
        setDiagnosis(data.diagnosis || '');
        setTreatment(data.treatment || '');
        setIsClosed(data.status === 'completed');
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVisit();
  }, [visitId, patientId]);

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!visit || !patientId) return;

  try {
    const doctorId = "71b501ff-49ae-4601-8c44-c77fcffb047a"; // TODO: Заменить на текущего доктора

    if (isNewVisit) {
      // Создаем новый визит
      const response = await fetch(`https://localhost:7190/api/MedicalVisits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          doctorId,
          complaints,
          diagnosis,
          treatment,
          status: 'completed'
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        // Если ответ содержит сообщение об ошибке
        throw new Error(data.message || 'Ошибка при создании визита');
      }

      setVisit(prev => prev ? { 
        ...prev, 
        id: data.id,
        complaints,
        diagnosis,
        treatment,
        status: 'completed'
      } : null);
    } else {
      // Обновляем существующий визит
      const response = await fetch(`https://localhost:7190/api/MedicalVisits/${visit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaints,
          diagnosis,
          treatment,
          status: 'completed'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при обновлении визита');
      }
    }

    alert('Данные приёма успешно сохранены');
    setIsClosed(true);
    setIsNewVisit(false);
    
  } catch (err) {
    console.error('Ошибка при сохранении:', err);
    alert('Данные сохранены, но возникла ошибка при ответе сервера. Обновите страницу.');
  }
};

  if (loading) {
    return <PageWrapper title="Загрузка..."><p className="p-4">Загрузка данных приёма...</p></PageWrapper>;
  }

  if (!visit || !patientId) {
    return <PageWrapper title="Ошибка"><p className="p-4">Не удалось загрузить данные приёма.</p></PageWrapper>;
  }

  const patient = visit.patient;
  const patientName = `${patient.lastName} ${patient.firstName}`;

  return (
    <PageWrapper title={`Приём пациента — ${patientName}`}>
      <Card>
        {/* Данные пациента */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900">Данные пациента:</h3>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">ФИО: {patientName}</p>
              <p className="text-sm text-gray-600">Дата рождения: {patient.birthDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Полис: {patient.insuranceNumber}</p>
              <p className="text-sm text-gray-600">Телефон: {patient.phone}</p>
            </div>
          </div>
        </div>

        {/* Форма заполнения приёма */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <TextArea
            label="Жалобы"
            value={complaints}
            onChange={(e) => setComplaints(e.target.value)}
            disabled={isClosed}
          />
          <TextArea
            label="Диагноз"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            disabled={isClosed}
          />
          <TextArea
            label="Лечение"
            value={treatment}
            onChange={(e) => setTreatment(e.target.value)}
            disabled={isClosed}
          />
          <Button type="submit" disabled={isClosed}>
            {isClosed ? 'Случай закрыт' : 'Сохранить'}
          </Button>
        </form>

        {/* История приёмов */}
        {visit.history.length > 0 && (
          <div className="border-t pt-6">
            <div className="flex items-center mb-4">
              <ClipboardDocumentListIcon className="h-5 w-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">История приёмов</h3>
            </div>

            <div className="space-y-4">
              {visit.history.map((v) => (
                <div key={v.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {v.doctor.lastName} {v.doctor.firstName} ({v.doctor.specialty})
                      </p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {new Date(v.date).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      v.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {v.status === 'completed' ? 'Завершён' : 'Отменён'}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Жалобы:</p>
                      <p className="text-gray-800">{v.complaints}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Диагноз:</p>
                      <p className="text-gray-800">{v.diagnosis}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Лечение:</p>
                      <p className="text-gray-800">{v.treatment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </PageWrapper>
  );
}