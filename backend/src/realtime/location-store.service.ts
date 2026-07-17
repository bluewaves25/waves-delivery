import { Injectable } from '@nestjs/common';

export type LiveRiderLocation = {
  fieldPackageHandlerId: number;
  userId?: number;
  latitude: number;
  longitude: number;
  updatedAt: string;
};

@Injectable()
export class LocationStoreService {
  private riderLocations = new Map<number, LiveRiderLocation>();
  private parcelSubscriptions = new Map<string, Set<string>>();

  setRiderLocation(loc: LiveRiderLocation) {
    this.riderLocations.set(loc.fieldPackageHandlerId, loc);
    return loc;
  }

  getRiderLocation(fieldPackageHandlerId: number) {
    return this.riderLocations.get(fieldPackageHandlerId) ?? null;
  }

  getAllRiderLocations() {
    return Array.from(this.riderLocations.values());
  }

  subscribeClientToParcel(parcelNumber: string, clientId: string) {
    const set = this.parcelSubscriptions.get(parcelNumber) ?? new Set();
    set.add(clientId);
    this.parcelSubscriptions.set(parcelNumber, set);
  }

  unsubscribeClient(clientId: string) {
    for (const [parcelNumber, clients] of this.parcelSubscriptions.entries()) {
      clients.delete(clientId);
      if (clients.size === 0) {
        this.parcelSubscriptions.delete(parcelNumber);
      }
    }
  }
}
