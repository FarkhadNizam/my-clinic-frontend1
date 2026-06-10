import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { PageWrapper } from "../../components/ui/PageWrapper";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { TextArea } from "../../components/ui/TextArea";
import { Input } from "../../components/ui/Input";

import { 
  getAppointmentVisit, 
  createVisit, 
  updateVisit, 
  searchDiagnoses 
} from "../../api/medicalVisitsApi";

interface Diagnosis {
  diagnosisId: string;
  mkbCode: string;
  name: string;
  category: string;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  phone?: string;
  insuranceNumber?: string;
}

interface MedicalVisit {
  id: string;
  date: string;
  complaints: string;
  diagnosisId?: string;
  diagnosisName?: string;
  diagnosisCode?: string;
  treatment: string;
}

interface VisitHistory {
  id: string;
  date: string;
  complaints: string;
  treatment: string;
  diagnosisName?: string;
  doctorName: string;
}

interface AppointmentVisitResponse {
  appointmentId: string;
  patient: Patient;
  visit: MedicalVisit | null;
  history: VisitHistory[];
}

export function AppointmentPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [appointment, setAppointment] = useState<AppointmentVisitResponse | null>(null);

  const [complaints, setComplaints] = useState("");
  const [treatment, setTreatment] = useState("");
  const [diagnosisId, setDiagnosisId] = useState("");
  const [diagnosisSearch, setDiagnosisSearch] = useState("");

  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [visitExists, setVisitExists] = useState(false);
  const [showHistory, setShowHistory] = useState(true);

  useEffect(() => {
    if (!appointmentId) return;
    loadAppointment();
  }, [appointmentId]);

  const loadAppointment = async () => {
    try {
      setLoading(true);
      const data: AppointmentVisitResponse = await getAppointmentVisit(appointmentId!);
      
      setAppointment(data);

      if (data.visit) {
        setVisitExists(true);
        setComplaints(data.visit.complaints ?? "");
        setTreatment(data.visit.treatment ?? "");
        setDiagnosisId(data.visit.diagnosisId ?? "");
        setDiagnosisSearch(
          data.visit.diagnosisCode 
            ? `${data.visit.diagnosisCode} ${data.visit.diagnosisName ?? ""}` 
            : data.visit.diagnosisName ?? ""
        );
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка загрузки приёма");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (diagnosisSearch.length < 2) {
      setDiagnoses([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const data = await searchDiagnoses(diagnosisSearch);
        setDiagnoses(data);
      } catch (err) {
        console.error("Ошибка поиска диагнозов", err);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [diagnosisSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentId) return;

    try {
      setSaving(true);

      const payload = {
        complaints,
        diagnosisId: diagnosisId || undefined,
        treatment,
      };

      if (visitExists) {
        await updateVisit(appointmentId, payload);
        toast.success("Приём успешно обновлён");
      } else {
        await createVisit(appointmentId, payload);
        toast.success("Приём успешно завершён");
      }

      await loadAppointment();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка при сохранении");
    } finally {
      setSaving(false);
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <PageWrapper title="Приём">
        <Card>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500">Загрузка данных приёма...</p>
          </div>
        </Card>
      </PageWrapper>
    );
  }

  if (!appointment) {
    return (
      <PageWrapper title="Ошибка">
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">😕</div>
            <p className="text-gray-500">Приём не найден</p>
          </div>
        </Card>
      </PageWrapper>
    );
  }

  const patient = appointment.patient;
  const age = calculateAge(patient.birthDate);

  return (
    <PageWrapper title={`Приём пациента ${patient.lastName} ${patient.firstName}`}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Карточка пациента */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Информация о пациенте</h2>
                  <p className="text-blue-100 text-sm">{patient.lastName} {patient.firstName}</p>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="text-2xl font-bold text-white">{age}</div>
                <div className="text-xs text-blue-100">лет</div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <div className="text-xs text-gray-500">Дата рождения</div>
                  <div className="text-sm font-medium">{new Date(patient.birthDate).toLocaleDateString("ru-RU")}</div>
                </div>
              </div>
              
              {patient.phone && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <div className="text-xs text-gray-500">Телефон</div>
                    <div className="text-sm font-medium">{patient.phone}</div>
                  </div>
                </div>
              )}
              
              {patient.insuranceNumber && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <div>
                    <div className="text-xs text-gray-500">Страховой полис</div>
                    <div className="text-sm font-medium">{patient.insuranceNumber}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Форма приёма */}
        <Card>
          <div className="border-b border-gray-200 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="bg-green-100 p-2 rounded-lg">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {visitExists ? "Редактирование приёма" : "Завершение приёма"}
              </h2>
            </div>
            <p className="text-gray-600 text-sm mt-2 ml-9">
              Заполните информацию о жалобах, диагнозе и назначенном лечении
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <TextArea
              label="Жалобы пациента"
              value={complaints}
              onChange={(e) => setComplaints(e.target.value)}
              placeholder="Опишите основные жалобы пациента..."
              rows={4}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Диагноз (МКБ-10)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <Input
                  value={diagnosisSearch}
                  onChange={(e) => {
                    setDiagnosisSearch(e.target.value);
                    setDiagnosisId("");
                  }}
                  placeholder="Начните вводить код или название диагноза..."
                  className="pl-10"
                />
              </div>

              {diagnoses.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {diagnoses.map((diagnosis) => (
                    <button
                      key={diagnosis.diagnosisId}
                      type="button"
                      onClick={() => {
                        setDiagnosisId(diagnosis.diagnosisId);
                        setDiagnosisSearch(`${diagnosis.mkbCode} ${diagnosis.name}`);
                        setDiagnoses([]);
                      }}
                      className="w-full text-left p-3 hover:bg-blue-50 transition-colors border-b last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-medium text-blue-600">{diagnosis.mkbCode}</span>
                        <span className="text-xs text-gray-500">{diagnosis.category}</span>
                      </div>
                      <div className="text-sm text-gray-700 mt-1">{diagnosis.name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <TextArea
              label="Назначенное лечение"
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              placeholder="Опишите назначенное лечение, рекомендации, рецепты..."
              rows={4}
            />

            <Button 
              type="submit" 
              loading={saving} 
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {saving ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  {visitExists ? "Обновление..." : "Завершение..."}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {visitExists ? "Обновить приём" : "Завершить приём"}
                </div>
              )}
            </Button>
          </form>
        </Card>

        {/* История посещений */}
        {appointment.history?.length > 0 && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">История посещений</h2>
                <span className="bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-600">
                  {appointment.history.length} {appointment.history.length === 1 ? 'визит' : 'визитов'}
                </span>
              </div>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                {showHistory ? 'Свернуть ↑' : 'Развернуть ↓'}
              </button>
            </div>

            {showHistory && (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {appointment.history.map((item, index) => (
                  <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{item.doctorName}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(item.date).toLocaleDateString("ru-RU", {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                      {item.diagnosisName && (
                        <div className="bg-blue-50 px-3 py-1 rounded-full">
                          <span className="text-xs text-blue-700">{item.diagnosisName}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 ml-10">
                      {item.complaints && (
                        <div>
                          <div className="text-xs font-medium text-gray-500 mb-1">Жалобы:</div>
                          <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                            {item.complaints}
                          </div>
                        </div>
                      )}
                      {item.treatment && (
                        <div>
                          <div className="text-xs font-medium text-gray-500 mb-1">Лечение:</div>
                          <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                            {item.treatment}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Кнопка возврата */}
        <div className="flex justify-center">
          <button
            onClick={() => window.history.back()}
            className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-2"
          >
            ← Вернуться к списку приёмов
          </button>
        </div>
      </div>
    </PageWrapper>
  );
}