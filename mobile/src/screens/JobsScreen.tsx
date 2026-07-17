import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import {
  confirmDelivery,
  fetchJobsToDeliver,
  fetchJobsToPickup,
  pingLocation,
  setOnline,
} from '../api/client';
import { useAuth } from '../context/AuthContext';

export function JobsScreen() {
  const { signOut } = useAuth();
  const [online, setOnlineState] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [pickup, deliver] = await Promise.all([
        fetchJobsToPickup(),
        fetchJobsToDeliver(),
      ]);
      setJobs([...(pickup || []), ...(deliver || [])]);
    } catch (e: any) {
      setMessage(e?.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const jobsRef = React.useRef<any[]>([]);
  useEffect(() => {
    jobsRef.current = jobs;
  }, [jobs]);

  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    (async () => {
      if (!online) {
        return;
      }
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setMessage('Location permission denied');
        return;
      }
      sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000,
          distanceInterval: 25,
        },
        async (pos) => {
          try {
            const activeParcel = jobsRef.current[0]?.parcelNumber as
              | string
              | undefined;
            await pingLocation(
              pos.coords.latitude,
              pos.coords.longitude,
              activeParcel,
            );
          } catch {
            // keep UI responsive if ping fails
          }
        },
      );
    })();
    return () => {
      sub?.remove();
    };
  }, [online]);

  const toggleOnline = async () => {
    const next = !online;
    await setOnline(next);
    setOnlineState(next);
    setMessage(next ? 'You are online' : 'You are offline');
  };

  const onDeliver = async (parcelNumber: string) => {
    try {
      await confirmDelivery(parcelNumber, {
        deliveryOtp: '000000',
        proofPhotoUrl: 'https://example.com/pod-placeholder.jpg',
      });
      setMessage(`Delivered ${parcelNumber}`);
      refresh();
    } catch (e: any) {
      setMessage(e?.response?.data?.message || e?.message || 'Deliver failed');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Jobs</Text>
        <Pressable onPress={signOut}>
          <Text style={styles.link}>Sign out</Text>
        </Pressable>
      </View>
      <Pressable
        style={[styles.toggle, online ? styles.online : styles.offline]}
        onPress={toggleOnline}
      >
        <Text style={styles.toggleText}>{online ? 'Online' : 'Go online'}</Text>
      </Pressable>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {loading ? (
        <ActivityIndicator color="#22d3ee" style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => String(item.id || item.parcelNumber)}
          contentContainerStyle={{ paddingVertical: 12 }}
          ListEmptyComponent={
            <Text style={styles.empty}>No assigned parcels</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.parcelNumber}</Text>
              <Text style={styles.cardBody}>{item.customerName}</Text>
              <Text style={styles.cardBody}>{item.customerAddress}</Text>
              <Text style={styles.status}>{item.parcelStatus?.name}</Text>
              {item.parcelStatus?.name === 'in-transit' ? (
                <Pressable
                  style={styles.deliverBtn}
                  onPress={() => onDeliver(item.parcelNumber)}
                >
                  <Text style={styles.deliverText}>Confirm delivery</Text>
                </Pressable>
              ) : null}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
  },
  title: { color: '#f8fafc', fontSize: 28, fontWeight: '700' },
  link: { color: '#22d3ee' },
  toggle: {
    marginTop: 16,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  online: { backgroundColor: '#059669' },
  offline: { backgroundColor: '#334155' },
  toggleText: { color: '#f8fafc', fontWeight: '700' },
  message: { color: '#94a3b8', marginTop: 10 },
  empty: { color: '#64748b', marginTop: 24, textAlign: 'center' },
  card: {
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  cardTitle: { color: '#f8fafc', fontWeight: '700', fontSize: 16 },
  cardBody: { color: '#cbd5e1', marginTop: 4 },
  status: { color: '#22d3ee', marginTop: 8, textTransform: 'capitalize' },
  deliverBtn: {
    marginTop: 12,
    backgroundColor: '#22d3ee',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  deliverText: { color: '#0f172a', fontWeight: '700' },
});
