import { API_URL } from "./client";
import type { CreateDoctorRequest } from '../types';

export async function createDoctor(
    data: CreateDoctorRequest
) {
    const response = await fetch(
        `${API_URL}/doctors`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }
    );

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
    }

    return response.json();
}

export async function getDoctors() {
  const response = await fetch(
    `${API_URL}/doctors`
  );

  return response.json();
}

export async function getSpecialties() {
  const response = await fetch(
    `${API_URL}/specialties`
  );

  return response.json();
}

