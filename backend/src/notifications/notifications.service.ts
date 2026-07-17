import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  async sendSms(recipient: string, body: string, meta?: Record<string, unknown>) {
    this.logger.log(`[SMS] to=${recipient} body=${body}`);
    return this.prisma.notificationLog.create({
      data: {
        channel: 'sms',
        recipient,
        body,
        status: process.env.SMS_PROVIDER_KEY ? 'sent' : 'queued',
        meta: meta ? JSON.stringify(meta) : null,
      },
    });
  }

  async sendPush(
    userId: number,
    title: string,
    body: string,
    meta?: Record<string, unknown>,
  ) {
    const tokens = await this.prisma.deviceToken.findMany({ where: { userId } });
    this.logger.log(
      `[PUSH] userId=${userId} title=${title} tokens=${tokens.length}`,
    );

    if (!tokens.length) {
      return this.prisma.notificationLog.create({
        data: {
          channel: 'push',
          recipient: String(userId),
          subject: title,
          body,
          status: 'no_device',
          meta: meta ? JSON.stringify(meta) : null,
        },
      });
    }

    const logs = [];
    for (const device of tokens) {
      logs.push(
        await this.prisma.notificationLog.create({
          data: {
            channel: 'push',
            recipient: device.token,
            subject: title,
            body,
            status: process.env.FCM_SERVER_KEY ? 'sent' : 'queued',
            meta: meta ? JSON.stringify({ ...meta, platform: device.platform }) : null,
          },
        }),
      );
    }
    return logs;
  }

  async notifyParcelStatusChange(params: {
    customerPhone: string;
    merchantUserId: number;
    parcelNumber: string;
    statusName: string;
    message: string;
  }) {
    await this.sendSms(
      params.customerPhone,
      `Parcel ${params.parcelNumber}: ${params.statusName}. ${params.message}`,
      { parcelNumber: params.parcelNumber },
    );
    await this.sendPush(
      params.merchantUserId,
      `Parcel ${params.parcelNumber}`,
      params.message,
      { status: params.statusName },
    );
  }

  async registerDeviceToken(userId: number, token: string, platform = 'android') {
    return this.prisma.deviceToken.upsert({
      where: { token },
      create: { userId, token, platform },
      update: { userId, platform },
    });
  }
}
