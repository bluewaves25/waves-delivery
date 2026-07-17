import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Payment } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async initiatePaystackPayment(params: {
    userId: number;
    amount: number;
    currency?: string;
    parcelId?: number;
    purpose?: string;
    idempotencyKey: string;
    email: string;
  }): Promise<Payment & { authorizationUrl: string }> {
    const existing = await this.prisma.payment.findUnique({
      where: { idempotencyKey: params.idempotencyKey },
    });
    if (existing) {
      return {
        ...existing,
        authorizationUrl: this.mockAuthUrl(existing.providerRef || existing.id.toString()),
      };
    }

    const providerRef = `psk_${randomUUID().replace(/-/g, '')}`;
    const payment = await this.prisma.payment.create({
      data: {
        userId: params.userId,
        parcelId: params.parcelId,
        amount: params.amount,
        currency: params.currency || 'GHS',
        provider: 'paystack',
        providerRef,
        idempotencyKey: params.idempotencyKey,
        status: 'pending',
        purpose: params.purpose || 'parcel_charge',
        metadata: JSON.stringify({ email: params.email }),
      },
    });

    return {
      ...payment,
      authorizationUrl: this.mockAuthUrl(providerRef),
    };
  }

  async verifyPayment(providerRef: string): Promise<Payment> {
    const payment = await this.prisma.payment.findUnique({
      where: { providerRef },
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    if (payment.status === 'success') {
      return payment;
    }

    const updated = await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'success' },
    });

    await this.prisma.walletLedger.create({
      data: {
        userId: payment.userId,
        paymentId: payment.id,
        entryType: payment.purpose === 'rider_payout' ? 'debit' : 'credit',
        amount: payment.amount,
        description: `Paystack verify ${providerRef}`,
      },
    });

    return updated;
  }

  async createRiderPayout(params: {
    riderUserId: number;
    amount: number;
    idempotencyKey: string;
    description?: string;
  }) {
    const existing = await this.prisma.payment.findUnique({
      where: { idempotencyKey: params.idempotencyKey },
    });
    if (existing) {
      return existing;
    }
    if (params.amount <= 0) {
      throw new BadRequestException('Payout amount must be positive');
    }

    const providerRef = `payout_${randomUUID().replace(/-/g, '')}`;
    const payment = await this.prisma.payment.create({
      data: {
        userId: params.riderUserId,
        amount: params.amount,
        provider: 'paystack',
        providerRef,
        idempotencyKey: params.idempotencyKey,
        status: 'success',
        purpose: 'rider_payout',
        metadata: JSON.stringify({ description: params.description }),
      },
    });

    await this.prisma.walletLedger.create({
      data: {
        userId: params.riderUserId,
        paymentId: payment.id,
        entryType: 'debit',
        amount: params.amount,
        description: params.description || 'Rider payout',
      },
    });

    return payment;
  }

  async ledgerForUser(userId: number) {
    return this.prisma.walletLedger.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { payment: true },
    });
  }

  private mockAuthUrl(ref: string) {
    const base =
      process.env.PAYSTACK_CALLBACK_URL || 'http://localhost:3000/payments/callback';
    return `${base}?reference=${ref}`;
  }
}
