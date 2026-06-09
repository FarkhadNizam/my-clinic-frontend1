import { API_URL } from "./client";

export async function getDoctorAppointments() {
  const token =
    localStorage.getItem("token");

  const response =
    await fetch(
      `${API_URL}/doctors/appointments`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  if (!response.ok)
    throw new Error(
      "Ошибка загрузки приемов"
    );

  return response.json();
}