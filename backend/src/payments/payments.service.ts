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

  async settleParcelDelivery(params: {
    parcelNumber: string;
    parcelId: number;
    parcelUserId: number;
    riderUserId: number;
    parcelCashCollection: number;
    parcelCharge: number;
  }) {
    const idempotencyKey = `settle_${params.parcelNumber}`;
    const existing = await this.prisma.payment.findUnique({
      where: { idempotencyKey },
    });
    if (existing) {
      return { alreadySettled: true, payment: existing };
    }

    const cash = Number(params.parcelCashCollection) || 0;
    const codFee = cash > 0 ? cash / 100 : 0;
    const deliveryFee = Math.max(
      0,
      Number(params.parcelCharge || 0) - codFee,
    );
    const riderShareRate = Number(process.env.RIDER_DELIVERY_SHARE || 0.8);
    const riderEarn = Math.round(deliveryFee * riderShareRate * 100) / 100;
    const platformDeliveryShare =
      Math.round(deliveryFee * (1 - riderShareRate) * 100) / 100;
    const platformCommission =
      Math.round((platformDeliveryShare + codFee) * 100) / 100;

    const payment = await this.prisma.payment.create({
      data: {
        userId: params.riderUserId,
        parcelId: params.parcelId,
        amount: riderEarn,
        currency: 'GHS',
        provider: 'internal',
        providerRef: `earn_${params.parcelNumber}`,
        idempotencyKey,
        status: 'success',
        purpose: 'rider_delivery_earn',
        metadata: JSON.stringify({
          parcelNumber: params.parcelNumber,
          cashOnDelivery: cash,
          codFeePlatform: codFee,
          deliveryFee,
          riderEarn,
          platformCommission,
          riderShareRate,
        }),
      },
    });

    if (riderEarn > 0) {
      await this.prisma.walletLedger.create({
        data: {
          userId: params.riderUserId,
          paymentId: payment.id,
          entryType: 'credit',
          amount: riderEarn,
          description: `Delivery earn ${params.parcelNumber} (after ${Math.round(
            (1 - riderShareRate) * 100,
          )}% platform commission)`,
        },
      });
    }

    // Platform COD + delivery commission recorded against parcel owner (merchant/walk-in)
    if (platformCommission > 0) {
      await this.prisma.walletLedger.create({
        data: {
          userId: params.parcelUserId,
          paymentId: payment.id,
          entryType: 'debit',
          amount: platformCommission,
          description: `Platform fee ${params.parcelNumber} (delivery share GHS ${platformDeliveryShare.toFixed(
            2,
          )} + COD fee GHS ${codFee.toFixed(2)})`,
        },
      });
    }

    return {
      alreadySettled: false,
      payment,
      riderEarn,
      platformCommission,
      codFee,
      deliveryFee,
    };
  }

  async riderEarningsSummary(userId: number) {
    const ledger = await this.prisma.walletLedger.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    let balance = 0;
    for (const row of ledger) {
      balance +=
        row.entryType === 'credit' ? row.amount : -Math.abs(row.amount);
    }
    const earnPayments = await this.prisma.payment.count({
      where: {
        userId,
        purpose: 'rider_delivery_earn',
        status: 'success',
      },
    });

    const rewards = [
      { id: 'bronze', label: 'Bronze', threshold: 10 },
      { id: 'silver', label: 'Silver', threshold: 50 },
      { id: 'gold', label: 'Gold', threshold: 100 },
    ].map((r) => ({
      ...r,
      unlocked: earnPayments >= r.threshold,
    }));

    const nextReward = rewards.find((r) => !r.unlocked) || null;

    return {
      balance: Math.round(balance * 100) / 100,
      deliveredCount: earnPayments,
      rewards,
      nextReward,
      recentLedger: ledger.slice(0, 10),
    };
  }

  private mockAuthUrl(ref: string) {
    const base =
      process.env.PAYSTACK_CALLBACK_URL || 'http://localhost:3000/payments/callback';
    return `${base}?reference=${ref}`;
  }
}
