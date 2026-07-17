# Delivery Rider (Expo)

React Native rider app against the NestJS Delivery Management API.

## Features
- Rider login (JWT)
- Online/offline toggle (`PATCH /riders/me/online`)
- Job list (pickup + delivery assignments)
- GPS watch → `POST /riders/me/location`
- Delivery confirmation with proof-of-delivery fields

## Setup
```bash
cd mobile
npm install
EXPO_PUBLIC_API_BASE_URL=http://YOUR_LAN_IP:8000 npm start
```

Use your machine LAN IP (not localhost) when testing on a physical device.
