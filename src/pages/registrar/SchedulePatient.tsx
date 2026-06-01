/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { PageWrapper } from '../../components/ui/PageWrapper';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
}

export function SchedulePatient() {
  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState({
    doctors: true,
    patients: true,
    dates: false,
    times: false,
    submitting: false
  });
  const { token } = useAuth();
  const navigate = useNavigate();

  // Загрузка врачей
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch('https://localhost:7190/api/doctor', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Ошибка загрузки врачей');
        const data = await response.json();
        setDoctors(data);
      } catch (error) {
        toast.error('Не удалось загрузить список врачей');
      } finally {
        setIsLoading(prev => ({ ...prev, doctors: false }));
      }
    };

    fetchDoctors();
  }, [token]);

  // Загрузка пациентов
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch('https://localhost:7190/api/patient', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Ошибка загрузки пациентов');
        const data = await response.json();
        setPatients(data);
      } catch (error) {
        toast.error('Не удалось загрузить список пациентов');
      } finally {
        setIsLoading(prev => ({ ...prev, patients: false }));
      }
    };

    fetchPatients();
  }, [token]);

  // Загрузка доступных дат при выборе врача
  useEffect(() => {
    if (!doctorId) {
      setAvailableDates([]);
      return;
    }

    setIsLoading(prev => ({ ...prev, dates: true }));
    setDate('');
    setTime('');

    const fetchDates = async () => {
      try {
        const response = await fetch(
          `https://localhost:7190/api/doctor/available-dates/${doctorId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!response.ok) throw new Error('Ошибка загрузки дат');
        const data = await response.json();
        setAvailableDates(data);
      } catch (error) {
        toast.error('Не удалось загрузить доступные даты');
      } finally {
        setIsLoading(prev => ({ ...prev, dates: false }));
      }
    };

    fetchDates();
  }, [doctorId, token]);

  // Загрузка доступного времени при выборе даты
  useEffect(() => {
    if (!doctorId || !date) {
      setAvailableTimes([]);
      return;
    }

    setIsLoading(prev => ({ ...prev, times: true }));
    setTime('');

    const fetchTimes = async () => {
      try {
        const response = await fetch(
          `https://localhost:7190/api/doctor/available-times/${doctorId}/${date}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!response.ok) throw new Error('Ошибка загрузки времени');
        const data = await response.json();
        setAvailableTimes(data);
      } catch (error) {
        toast.error('Не удалось загрузить доступное время');
      } finally {
        setIsLoading(prev => ({ ...prev, times: false }));
      }
    };

    fetchTimes();
  }, [doctorId, date, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(prev => ({ ...prev, submitting: true }));

    try {
      const response = await fetch('https://localhost:7190/api/appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          patientId,
          doctorId,
          date,
          time
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Ошибка при создании записи');
      }

      const patient = patients.find(p => p.id === patientId);
      const doctor = doctors.find(d => d.id === doctorId);

      toast.success(
        `Пациент ${patient?.lastName} ${patient?.firstName} ` +
        `записан к ${doctor?.lastName} ${doctor?.firstName[0]}. ` +
        `на ${new Date(date).toLocaleDateString()} в ${time}`
      );
      
      navigate('/registrar/appointments');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Неизвестная ошибка');
    } finally {
      setIsLoading(prev => ({ ...prev, submitting: false }));
    }
  };

  const doctorOptions = doctors.map(doctor => ({
    value: doctor.id,
    label: `${doctor.lastName} ${doctor.firstName[0]}.`,
    subLabel: doctor.specialty
  }));

  const patientOptions = patients.map(patient => ({
    value: patient.id,
    label: `${patient.lastName} ${patient.firstName}`,
    subLabel: `р. ${new Date(patient.birthDate).toLocaleDateString('ru-RU')}`
  }));

  return (
    <PageWrapper title="Запись пациента">
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Врач"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            options={doctorOptions}
            required
            disabled={isLoading.doctors}
          />
          {isLoading.doctors && <div className="text-sm text-gray-500">Загрузка врачей...</div>}
          
          {doctorId && (
            <Select
              label="Дата приёма"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              options={availableDates.map(date => ({
                value: date,
                label: new Date(date).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  weekday: 'short'
                })
              }))}
              required
              disabled={!doctorId || isLoading.dates}
            />
          )}
          {isLoading.dates && <div className="text-sm text-gray-500">Загрузка дат...</div>}
          
          {date && (
            <Select
              label="Время приёма"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              options={availableTimes.map(time => ({
                value: time,
                label: time
              }))}
              required
              disabled={!date || isLoading.times}
            />
          )}
          {isLoading.times && <div className="text-sm text-gray-500">Загрузка времени...</div>}
          
          <Select
            label="Пациент"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            options={patientOptions}
            required
            disabled={isLoading.patients}
          />
          {isLoading.patients && <div className="text-sm text-gray-500">Загрузка пациентов...</div>}
          
          <Button 
            type="submit" 
            disabled={
              !patientId || 
              !doctorId || 
              !date || 
              !time ||
              isLoading.submitting ||
              isLoading.doctors ||
              isLoading.patients
            }
            className="mt-4 w-full"
            loading={isLoading.submitting}
          >
            Записать пациента
          </Button>
        </form>
      </Card>
    </PageWrapper>
  );
}