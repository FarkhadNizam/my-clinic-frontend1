// api/medicalVisitsApi.ts

import { API_URL } from "./client";

export async function getAppointmentVisit(
  appointmentId: string
) {
  const response = await fetch(
    `${API_URL}/appointments/${appointmentId}/visit`
  );

  if (!response.ok)
    throw new Error(
      "Не удалось загрузить прием"
    );

  return response.json();
}

export async function createVisit(
  appointmentId: string,
  data: {
    complaints: string;
    diagnosisId?: string;
    treatment: string;
  }
) {
  const response = await fetch(
    `${API_URL}/MedicalVisits/${appointmentId}/visit`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok)
    throw new Error(
      await response.text()
    );

  return response.json();
}

export async function updateVisit(
  appointmentId: string,
  data: {
    complaints: string;
    diagnosisId?: string;
    treatment: string;
  }
) {
  const response = await fetch(
    `${API_URL}/appointments/${appointmentId}/visit`,
    {
      method: "PUT",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok)
    throw new Error(
      await response.text()
    );

  return response.json();
}

export async function searchDiagnoses(
  search: string
) {
  const response = await fetch(
    `${API_URL}/diagnoses?search=${encodeURIComponent(search)}`
  );

  return response.json();
}