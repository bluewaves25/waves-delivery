import axios from 'axios';
import { API_BASE_URL } from './config';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export async function login(email: string, password: string) {
  // Nest local strategy expects `username` (email value)
  const res = await api.post('/auth/packageHandler/login', {
    username: email,
    password,
  });
  return res.data;
}

export async function fetchJobsToDeliver() {
  const res = await api.get('/parcels/packagehandler/to-deliver', {
    params: { pickup: true, deliveryArea: true, shop: true },
  });
  return res.data.data || [];
}

export async function fetchJobsToPickup() {
  const res = await api.get('/parcels/packagehandler/to-pickup', {
    params: { pickup: true, shop: true },
  });
  return res.data.data || [];
}

export async function setOnline(isOnline: boolean) {
  const res = await api.patch('/riders/me/online', { isOnline });
  return res.data.data;
}

export async function pingLocation(
  latitude: number,
  longitude: number,
  parcelNumber?: string,
) {
  const res = await api.post('/riders/me/location', {
    latitude,
    longitude,
    parcelNumber,
  });
  return res.data.data;
}

export async function confirmDelivery(
  parcelNumber: string,
  proof?: {
    proofPhotoUrl?: string;
    proofSignature?: string;
    deliveryOtp?: string;
  },
) {
  const res = await api.patch(
    `/parcels/packagehandler/delivered/${parcelNumber}`,
    proof || {},
  );
  return res.data;
}
