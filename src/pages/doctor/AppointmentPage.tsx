import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { PageWrapper } from "../../components/ui/PageWrapper";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { TextArea } from "../../components/ui/TextArea";
import { Input } from "../../components/ui/Input";

import { API_URL } from "../../api/client";

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
  const { appointmentId } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [appointment, setAppointment] =
    useState<AppointmentVisitResponse | null>(null);

  const [complaints, setComplaints] = useState("");
  const [treatment, setTreatment] = useState("");

  const [diagnosisId, setDiagnosisId] = useState("");
  const [diagnosisSearch, setDiagnosisSearch] = useState("");

  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);

  const [visitExists, setVisitExists] = useState(false);

  // ======================
  // Загрузка приема
  // ======================

  useEffect(() => {
    if (!appointmentId) return;

    loadAppointment();
  }, [appointmentId]);

  const loadAppointment = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/MedicalVisits/${appointmentId}/visit`
      );

      if (!response.ok)
        throw new Error("Не удалось загрузить прием");

      const data: AppointmentVisitResponse =
        await response.json();

      setAppointment(data);

      if (data.visit) {
        setVisitExists(true);

        setComplaints(
          data.visit.complaints ?? ""
        );

        setTreatment(
          data.visit.treatment ?? ""
        );

        setDiagnosisId(
          data.visit.diagnosisId ?? ""
        );

        setDiagnosisSearch(
          data.visit.diagnosisCode
            ? `${data.visit.diagnosisCode} ${data.visit.diagnosisName}`
            : data.visit.diagnosisName ?? ""
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Ошибка загрузки"
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // Поиск диагнозов
  // ======================

  useEffect(() => {
    if (diagnosisSearch.length < 2) {
      setDiagnoses([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(
          `${API_URL}/Diagnoses?search=${encodeURIComponent(
            diagnosisSearch
          )}`
        );

        if (!response.ok) return;

        const data = await response.json();

        setDiagnoses(data);
      } catch {
        // игнорируем
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [diagnosisSearch]);

  // ======================
  // Сохранение
  // ======================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!appointmentId) return;

    try {
      setSaving(true);

      const payload = {
        complaints,
        diagnosisId:
          diagnosisId || null,
        treatment,
      };

      const response = await fetch(
        `${API_URL}/MedicalVisits/${appointmentId}/visit`,
        {
          method: visitExists
            ? "PUT"
            : "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok)
        throw new Error(
          await response.text()
        );

      toast.success(
        visitExists
          ? "Прием обновлен"
          : "Прием завершен"
      );

      await loadAppointment();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Ошибка сохранения"
      );
    } finally {
      setSaving(false);
    }
  };

  // ======================
  // UI
  // ======================

  if (loading) {
    return (
      <PageWrapper title="Приём">
        <Card>
          <div className="p-6 text-center">
            Загрузка...
          </div>
        </Card>
      </PageWrapper>
    );
  }

  if (!appointment) {
    return (
      <PageWrapper title="Ошибка">
        <Card>
          <div className="p-6 text-center">
            Приём не найден
          </div>
        </Card>
      </PageWrapper>
    );
  }

  const patient =
    appointment.patient;

  return (
    <PageWrapper
      title={`Приём пациента`}
    >
      <div className="space-y-6">

        {/* Пациент */}

        <Card>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">
              Данные пациента
            </h2>

            <p>
              <strong>ФИО:</strong>{" "}
              {patient.lastName}{" "}
              {patient.firstName}
            </p>

            <p>
              <strong>
                Дата рождения:
              </strong>{" "}
              {new Date(
                patient.birthDate
              ).toLocaleDateString(
                "ru-RU"
              )}
            </p>

            {patient.phone && (
              <p>
                <strong>
                  Телефон:
                </strong>{" "}
                {patient.phone}
              </p>
            )}

            {patient.insuranceNumber && (
              <p>
                <strong>
                  Полис:
                </strong>{" "}
                {
                  patient.insuranceNumber
                }
              </p>
            )}
          </div>
        </Card>

        {/* Прием */}

        <Card>
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <TextArea
              label="Жалобы"
              value={complaints}
              onChange={(e) =>
                setComplaints(
                  e.target.value
                )
              }
            />

            <div>
              <Input
                label="Диагноз (МКБ)"
                value={
                  diagnosisSearch
                }
                onChange={(e) => {
                  setDiagnosisSearch(
                    e.target.value
                  );

                  setDiagnosisId("");
                }}
              />

              {diagnoses.length >
                0 && (
                <div className="border rounded-md mt-2 max-h-60 overflow-y-auto">
                  {diagnoses.map(
                    (
                      diagnosis
                    ) => (
                      <button
                        key={
                          diagnosis.diagnosisId
                        }
                        type="button"
                        onClick={() => {
                          setDiagnosisId(
                            diagnosis.diagnosisId
                          );

                          setDiagnosisSearch(
                            `${diagnosis.mkbCode} ${diagnosis.name}`
                          );

                          setDiagnoses(
                            []
                          );
                        }}
                        className="w-full text-left p-3 hover:bg-gray-100 border-b"
                      >
                        <div className="font-medium">
                          {
                            diagnosis.mkbCode
                          }
                        </div>

                        <div className="text-sm text-gray-600">
                          {
                            diagnosis.name
                          }
                        </div>
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            <TextArea
              label="Лечение"
              value={treatment}
              onChange={(e) =>
                setTreatment(
                  e.target.value
                )
              }
            />

            <Button
              type="submit"
              loading={saving}
            >
              {visitExists
                ? "Обновить прием"
                : "Завершить прием"}
            </Button>
          </form>
        </Card>

        {/* История */}

        {appointment.history
          ?.length > 0 && (
          <Card>
            <h2 className="text-lg font-semibold mb-4">
              История посещений
            </h2>

            <div className="space-y-4">
              {appointment.history.map(
                (item) => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex justify-between">
                      <div className="font-medium">
                        {
                          item.doctorName
                        }
                      </div>

                      <div className="text-sm text-gray-500">
                        {new Date(
                          item.date
                        ).toLocaleDateString(
                          "ru-RU"
                        )}
                      </div>
                    </div>

                    {item.diagnosisName && (
                      <div className="mt-2">
                        <strong>
                          Диагноз:
                        </strong>{" "}
                        {
                          item.diagnosisName
                        }
                      </div>
                    )}

                    {item.complaints && (
                      <div className="mt-2">
                        <strong>
                          Жалобы:
                        </strong>{" "}
                        {
                          item.complaints
                        }
                      </div>
                    )}

                    {item.treatment && (
                      <div className="mt-2">
                        <strong>
                          Лечение:
                        </strong>{" "}
                        {
                          item.treatment
                        }
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
}