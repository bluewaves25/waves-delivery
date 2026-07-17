import { Module } from '@nestjs/common';
import { LocationStoreService } from './location-store.service';
import { RealtimeGateway } from './realtime.gateway';

@Module({
  providers: [LocationStoreService, RealtimeGateway],
  exports: [LocationStoreService, RealtimeGateway],
})
export class RealtimeModule {}
