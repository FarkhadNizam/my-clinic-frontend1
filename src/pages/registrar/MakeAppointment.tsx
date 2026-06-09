import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Calendar, Clock, User, Stethoscope, AlertCircle, CheckCircle, Users } from "lucide-react";

import { PageWrapper } from "../../components/ui/PageWrapper";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";

import {
  getDoctors,
  getSpecialties,
  getAvailabilityBySpecialty,
} from "../../api/doctorsApi";

import {
  getPatients,
  getDoctorSlots,
  createAppointment,
  addToWaitingList,
} from "../../api/appointmentsApi";

interface Specialty {
  id: string;
  name: string;
}

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialtyId: string;
}

interface DoctorAvailability {
  doctorId: string;
  firstName: string;
  lastName: string;
  availableSlotsCount: number;
  nearestSlot?: string;
  loadPercent?: number;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
}

interface ScheduleSlot {
  id: string;
  date: string;
  timeFrom: string;
  timeTo: string;
}

export function SchedulePatient() {
  const navigate = useNavigate();

  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [doctorAvailability, setDoctorAvailability] = useState<
    DoctorAvailability[]
  >([]);

  const [specialtyId, setSpecialtyId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [patientId, setPatientId] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [showWaitingListConfirm, setShowWaitingListConfirm] = useState(false);

  const [loading, setLoading] = useState({
    specialties: false,
    doctors: false,
    patients: false,
    slots: false,
    submit: false,
    waitingList: false,
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      setLoading((x) => ({
        ...x,
        specialties: true,
        doctors: true,
        patients: true,
      }));

      const [specialtiesData, doctorsData, patientsData] =
        await Promise.all([
          getSpecialties(),
          getDoctors(),
          getPatients(),
        ]);

      setSpecialties(specialtiesData);
      setDoctors(doctorsData);
      setPatients(patientsData);
    } catch {
      toast.error("Ошибка загрузки данных");
    } finally {
      setLoading((x) => ({
        ...x,
        specialties: false,
        doctors: false,
        patients: false,
      }));
    }
  }

  useEffect(() => {
    if (!specialtyId) {
      setDoctorAvailability([]);
      return;
    }

    loadAvailability();
  }, [specialtyId]);

  async function loadAvailability() {
    try {
      const data =
        await getAvailabilityBySpecialty(
          specialtyId
        );

      setDoctorAvailability(data);
    } catch {
      toast.error(
        "Ошибка загрузки доступности"
      );
    }
  }

  useEffect(() => {
    if (!doctorId) {
      setSlots([]);
      setSelectedSlotId("");
      return;
    }

    loadSlots();
  }, [doctorId]);

  async function loadSlots() {
    try {
      setLoading((x) => ({
        ...x,
        slots: true,
      }));

      const data =
        await getDoctorSlots(
          doctorId
        );

      setSlots(data);
    } catch {
      toast.error(
        "Ошибка загрузки слотов"
      );
    } finally {
      setLoading((x) => ({
        ...x,
        slots: false,
      }));
    }
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!selectedSlotId) {
      toast.error("Выберите время для записи");
      return;
    }

    try {
      setLoading((x) => ({
        ...x,
        submit: true,
      }));

      await createAppointment(
        patientId,
        selectedSlotId
      );

      toast.success(
        "Пациент успешно записан на прием"
      );

      navigate(
        "/registrar/appointments"
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Ошибка создания записи"
      );
    } finally {
      setLoading((x) => ({
        ...x,
        submit: false,
      }));
    }
  }

  async function handleWaitingList() {
    if (!showWaitingListConfirm) {
      setShowWaitingListConfirm(true);
      return;
    }

    try {
      setLoading((x) => ({
        ...x,
        waitingList: true,
      }));

      await addToWaitingList(
        patientId,
        specialtyId
      );

      toast.success(
        "Пациент добавлен в лист ожидания"
      );

      navigate(
        "/registrar/appointments"
      );
    } catch {
      toast.error(
        "Ошибка добавления в лист ожидания"
      );
    } finally {
      setLoading((x) => ({
        ...x,
        waitingList: false,
      }));
      setShowWaitingListConfirm(false);
    }
  }

  const filteredDoctors =
    doctors.filter(
      (d) =>
        d.specialtyId ===
        specialtyId
    );

  const alternativeDoctors =
    doctorAvailability.filter(
      (d) =>
        d.doctorId !== doctorId &&
        d.availableSlotsCount > 0
    );

  const specialtyHasFreeSlots =
    doctorAvailability.some(
      (d) =>
        d.availableSlotsCount > 0
    );

  // Определяем, показывать ли предложение о листе ожидания
  const shouldShowWaitingListOffer = () => {
    if (!specialtyId || !patientId) return false;
    
    // Если выбран врач, но нет слотов, ИЛИ не выбран врач, но у всех врачей специальности нет слотов
    if (doctorId && slots.length === 0) return true;
    if (!doctorId && !specialtyHasFreeSlots) return true;
    return false;
  };

  const specialtyOptions =
    specialties.map((s) => ({
      value: s.id,
      label: s.name,
    }));

  const doctorOptions =
    filteredDoctors.map((d) => ({
      value: d.id,
      label:
        `${d.lastName} ${d.firstName}`,
    }));

  const patientOptions =
    patients.map((p) => ({
      value: p.id,
      label:
        `${p.lastName} ${p.firstName}`,
      subLabel: new Date(
        p.birthDate
      ).toLocaleDateString("ru-RU"),
    }));

  // Форматирование времени
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  // Группировка слотов по датам
  const groupedSlots = slots.reduce((groups, slot) => {
    const date = formatDate(slot.date);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(slot);
    return groups;
  }, {} as Record<string, ScheduleSlot[]>);

  const getDoctorLoadColor = (loadPercent?: number) => {
    if (!loadPercent) return "bg-gray-200";
    if (loadPercent < 50) return "bg-green-500";
    if (loadPercent < 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <PageWrapper title="Запись пациента">
      <div className="space-y-6">
        {/* Основная форма */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Пациент */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <User className="w-4 h-4" />
                Пациент
              </label>
              <Select
                value={patientId}
                onChange={(e) =>
                  setPatientId(e.target.value)
                }
                options={patientOptions}
                placeholder="Выберите пациента"
                required
              />
            </div>

            {/* Специальность */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Stethoscope className="w-4 h-4" />
                Специальность
              </label>
              <Select
                value={specialtyId}
                onChange={(e) => {
                  setSpecialtyId(e.target.value);
                  setDoctorId("");
                  setSelectedSlotId("");
                  setSlots([]);
                  setShowWaitingListConfirm(false);
                }}
                options={specialtyOptions}
                placeholder="Выберите специальность"
                required
              />
            </div>

            {/* Врач */}
            {specialtyId && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="w-4 h-4" />
                  Врач
                </label>
                <Select
                  value={doctorId}
                  onChange={(e) => {
                    setDoctorId(e.target.value);
                    setSelectedSlotId("");
                    setShowWaitingListConfirm(false);
                  }}
                  options={doctorOptions}
                  placeholder="Выберите врача"
                  disabled={!specialtyId}
                  required
                />
              </div>
            )}
          </form>
        </Card>

        {/* Доступность врачей */}
        {doctorAvailability.length > 0 && (
          <Card>
            <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <Users className="w-5 h-5" />
              Доступность врачей
            </h3>
            <div className="space-y-3">
              {doctorAvailability.map((doctor) => (
                <div
                  key={doctor.doctorId}
                  className={`p-3 rounded-lg transition-all ${
                    doctor.doctorId === doctorId
                      ? "bg-blue-50 border-2 border-blue-200"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900">
                        {doctor.lastName} {doctor.firstName}
                      </p>
                      {doctor.nearestSlot && (
                        <p className="text-xs text-gray-500 mt-1">
                          Ближайший слот: {new Date(doctor.nearestSlot).toLocaleString("ru-RU")}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">
                        {doctor.availableSlotsCount}
                      </p>
                      <p className="text-xs text-gray-500">слотов</p>
                    </div>
                  </div>
                  {doctor.loadPercent !== undefined && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Загрузка</span>
                        <span>{doctor.loadPercent}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${getDoctorLoadColor(
                            doctor.loadPercent
                          )}`}
                          style={{ width: `${doctor.loadPercent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Слоты для записи */}
        {doctorId && slots.length > 0 && (
          <Card>
            <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <Calendar className="w-5 h-5" />
              Доступные слоты для записи
            </h3>
            
            {loading.slots ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-sm text-gray-500">Загрузка слотов...</p>
              </div>
            ) : (
              <div className="space-y-6 max-h-96 overflow-y-auto">
                {Object.entries(groupedSlots).map(([date, dateSlots]) => (
                  <div key={date} className="space-y-2">
                    <h4 className="font-medium text-gray-700 sticky top-0 bg-white py-2">
                      {date}
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {dateSlots.map((slot) => {
                        const isSelected = selectedSlotId === slot.id;
                        const timeFrom = formatTime(slot.timeFrom);
                        const timeTo = formatTime(slot.timeTo);
                        
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => setSelectedSlotId(slot.id)}
                            className={`
                              p-3 rounded-lg border-2 transition-all duration-200 text-center
                              hover:shadow-md
                              ${
                                isSelected
                                  ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200"
                                  : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                              }
                            `}
                          >
                            <Clock className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                            <div className="font-semibold text-gray-900">
                              {timeFrom}
                            </div>
                            <div className="text-xs text-gray-500">
                              {timeTo}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedSlotId && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-sm text-green-800">
                  Выбран слот: {(() => {
                    const selectedSlot = slots.find(s => s.id === selectedSlotId);
                    if (selectedSlot) {
                      return `${formatDate(selectedSlot.date)} в ${formatTime(selectedSlot.timeFrom)}`;
                    }
                    return "";
                  })()}
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Предложение альтернативных врачей */}
        {doctorId && slots.length === 0 && alternativeDoctors.length > 0 && (
          <Card>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">
                  У выбранного врача нет свободных слотов
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Доступны другие врачи этой специальности:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {alternativeDoctors.map((doctor) => (
                    <Button
                      key={doctor.doctorId}
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setDoctorId(doctor.doctorId);
                        setSelectedSlotId("");
                      }}
                      className="justify-between"
                    >
                      <span>
                        {doctor.lastName} {doctor.firstName}
                      </span>
                      <span className="text-sm text-blue-600">
                        {doctor.availableSlotsCount} слотов
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Предложение листа ожидания - УЛУЧШЕННАЯ ЛОГИКА */}
        {shouldShowWaitingListOffer() && (
          <Card>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Нет свободных слотов
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {!specialtyHasFreeSlots 
                    ? "В настоящее время нет свободных слотов по выбранной специальности."
                    : "У выбранного врача нет свободных слотов."}
                  {" "}Вы можете добавить пациента в лист ожидания. Как только появится свободное место, с вами свяжутся.
                </p>
                {showWaitingListConfirm ? (
                  <div className="space-y-3">
                    <p className="text-sm text-yellow-600">
                      Подтвердите добавление пациента в лист ожидания
                    </p>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        onClick={handleWaitingList}
                        loading={loading.waitingList}
                      >
                        Да, добавить
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowWaitingListConfirm(false)}
                      >
                        Отмена
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleWaitingList}
                  >
                    Добавить в лист ожидания
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Кнопка отправки */}
        {patientId && doctorId && (
          <Card>
            <Button
              type="submit"
              onClick={handleSubmit}
              loading={loading.submit}
              disabled={!selectedSlotId || loading.submit}
              className="w-full"
            >
              {selectedSlotId ? "Записать пациента" : "Выберите время для записи"}
            </Button>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
}