import { User, ParkingSlot, Reservation, PaymentInfo } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
if (typeof window !== 'undefined') {
  // Helpful during dev to confirm base URL
  console.debug('[API] Base URL:', API_URL);
}

// Helper function for handling API errors and empty/non-JSON bodies
const handleResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type') || '';
  const contentLength = response.headers.get('content-length');
  const hasBody = contentLength === null || contentLength === undefined || contentLength === '' ? true : contentLength !== '0';

  let data: any = null;
  if (hasBody) {
    if (contentType.includes('application/json')) {
      data = await response.json().catch(() => null);
    } else {
      const text = await response.text().catch(() => '');
      try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    }
  }

  if (!response.ok) {
    console.error('API Error:', response.status, data);
    const message = (data && (data.message || (typeof data === 'string' ? data : undefined))) || `HTTP ${response.status}`;
    throw new Error(message);
  }
  return data;
};

// Auth API calls
export const authApi = {
  // Register a new user
  signup: async (name: string, email: string, password: string): Promise<{ token: string; user: User }> => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      return await handleResponse(response);
    } catch (e) {
      throw new Error('Cannot reach server. Please ensure the backend is running and API URL is correct.');
    }
  },

  // Login user
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return await handleResponse(response);
    } catch (e) {
      throw new Error('Cannot reach server. Please ensure the backend is running and API URL is correct.');
    }
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    const token = localStorage.getItem('parkingAppToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to change password' }));
      throw new Error(errorData.message || 'Failed to change password');
    }

    return response.json();
  },
};

// Parking API calls
export const parkingApi = {
  // Get all parking slots
  getAllSlots: async (): Promise<ParkingSlot[]> => {
    console.log('Making API request to get all parking slots');
    const response = await fetch(`${API_URL}/parking`);
    const data = await handleResponse(response);
    console.log('API response for all parking slots:', data);
    return data;
  },

  // Get available parking slots
  getAvailableSlots: async (): Promise<ParkingSlot[]> => {
    console.log('Making API request to get available parking slots');
    const response = await fetch(`${API_URL}/parking/available`);
    const data = await handleResponse(response);
    console.log('API response for available parking slots:', data);
    return data;
  },
};

// Reservation API calls
export const reservationApi = {
  // Get user's reservations
  getUserReservations: async (token: string): Promise<Reservation[]> => {
    const response = await fetch(`${API_URL}/reservations/my-reservations`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  // Create a new reservation
  createReservation: async (
    token: string,
    slotId: string,
    startTime: string,
    endTime: string
  ): Promise<Reservation> => {
    const response = await fetch(`${API_URL}/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ slotId, startTime, endTime }),
    });
    return handleResponse(response);
  },

  // Cancel a reservation
  cancelReservation: async (token: string, reservationId: string): Promise<Reservation> => {
    const response = await fetch(`${API_URL}/reservations/${reservationId}/cancel`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  // Update payment status
  updatePaymentStatus: async (token: string, reservationId: string): Promise<Reservation> => {
    const response = await fetch(`${API_URL}/reservations/${reservationId}/payment`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ paymentStatus: 'completed' }),
    });
    return handleResponse(response);
  },
}; 