import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LocationStoreService } from './location-store.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/realtime',
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private locationStore: LocationStoreService) {}

  handleConnection(client: Socket) {
    client.emit('connected', { clientId: client.id });
  }

  handleDisconnect(client: Socket) {
    this.locationStore.unsubscribeClient(client.id);
  }

  @SubscribeMessage('rider:location')
  handleRiderLocation(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    body: {
      fieldPackageHandlerId: number;
      userId?: number;
      latitude: number;
      longitude: number;
      parcelNumber?: string;
    },
  ) {
    const saved = this.locationStore.setRiderLocation({
      fieldPackageHandlerId: body.fieldPackageHandlerId,
      userId: body.userId,
      latitude: body.latitude,
      longitude: body.longitude,
      updatedAt: new Date().toISOString(),
    });

    this.server.emit('rider:location:update', saved);

    if (body.parcelNumber) {
      this.server
        .to(`parcel:${body.parcelNumber}`)
        .emit('parcel:rider:location', {
          parcelNumber: body.parcelNumber,
          ...saved,
        });
    }

    return { ok: true, data: saved };
  }

  @SubscribeMessage('parcel:subscribe')
  handleParcelSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { parcelNumber: string },
  ) {
    const room = `parcel:${body.parcelNumber}`;
    client.join(room);
    this.locationStore.subscribeClientToParcel(body.parcelNumber, client.id);
    return { ok: true, room };
  }

  @SubscribeMessage('parcel:unsubscribe')
  handleParcelUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { parcelNumber: string },
  ) {
    client.leave(`parcel:${body.parcelNumber}`);
    return { ok: true };
  }

  emitParcelStatus(parcelNumber: string, payload: Record<string, unknown>) {
    this.server
      .to(`parcel:${parcelNumber}`)
      .emit('parcel:status:update', { parcelNumber, ...payload });
    this.server.emit('parcel:status:update', { parcelNumber, ...payload });
  }
}
