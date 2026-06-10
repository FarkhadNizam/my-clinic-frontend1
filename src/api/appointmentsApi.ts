import { API_URL } from "./client";

export async function createAppointment(
    patientId: string,
    scheduleSlotId: string
) {
    const response =
        await fetch(
            `${API_URL}/appointment`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    patientId,
                    scheduleSlotId
                })
            });

    if (!response.ok) {
        throw new Error(
            await response.text()
        );
    }

    return response.json();
}

export async function getDoctorSlots(
    doctorId: string
) {
    const response =
        await fetch(
            `${API_URL}/doctors/${doctorId}/slots`
        );

    if (!response.ok) {
        throw new Error(
            "Ошибка загрузки слотов"
        );
    }

    return response.json();
}

export async function getPatients() {
    const response =
        await fetch(
            `${API_URL}/patient`
        );

    return response.json();
}

export async function addToWaitingList(
  patientId: string,
  specialtyId: string
) {
  const response =
    await fetch(
      `${API_URL}/waitinglist`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json"
        },
        body: JSON.stringify({
          patientId,
          specialtyId
        })
      }
    );

  if (!response.ok) {
    throw new Error(
      await response.text()
    );
  }

  return response.json();
}

export async function getAppointments() {
  const response = await fetch(
    `${API_URL}/appointment`
  );

  return response.json();
}

export async function cancelAppointment(
  id: string
) {
  const response = await fetch(
    `${API_URL}/appointment/${id}/cancel`,
    {
      method: "PUT"
    }
  );

  if (!response.ok)
    throw new Error(
      await response.text()
    );
}

export async function markNoShowAppointment(
  appointmentId: string
) {
  const response = await fetch(
    `${API_URL}/appointment/${appointmentId}/no-show`,
    {
      method: "PUT",
    }
  );

  if (!response.ok) {
    throw new Error(
      await response.text()
    );
  }
}