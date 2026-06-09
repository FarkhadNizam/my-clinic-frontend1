import { API_URL } from "./client";

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialtyName?: string;
  plannedWeeklyHours: number
}

export interface GenerateScheduleRequest {
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

export interface GenerateScheduleResponse {
  generatedCount: number;
  message?: string;
}

export const scheduleApi = {
  // Получить список всех врачей
  async getDoctors(token: string): Promise<Doctor[]> {
    const response = await fetch(`${API_URL}/doctors`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Не удалось загрузить список врачей');
    }

    return response.json();
  },

  // Сгенерировать расписание
  async generateSchedule(token: string, data: GenerateScheduleRequest): Promise<GenerateScheduleResponse> {
    const response = await fetch(`${API_URL}/schedule/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при генерации расписания');
    }

    return result;
  },
};