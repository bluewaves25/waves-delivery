import React from 'react'
import type { LoaderFunction, MetaFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import PackageHandlerLayout from '~/components/packagehandler/PackageHandlerLayout'
import {
    getUserToken,
    requirePackageHandlerUserId,
} from '~/utils/session.server'
import axios from '~/utils/axios.server'

export const meta: MetaFunction = () => ({
    title: 'Rider dashboard — SendGH',
})

type Earnings = {
    balance: number
    deliveredCount: number
    rewards: Array<{
        id: string
        label: string
        threshold: number
        unlocked: boolean
    }>
    nextReward: { label: string; threshold: number } | null
    recentLedger: Array<{
        id: number
        entryType: string
        amount: number
        description?: string | null
        createdAt: string
    }>
}

export const loader: LoaderFunction = async ({ request }) => {
    await requirePackageHandlerUserId(request)
    const token = await getUserToken(request)
    let earnings: Earnings = {
        balance: 0,
        deliveredCount: 0,
        rewards: [],
        nextReward: null,
        recentLedger: [],
    }
    try {
        const res = await axios.get('/payments/rider-earnings', {
            headers: { Authorization: `Bearer ${token}` },
        })
        earnings = res.data.data
    } catch {
        /* keep zeros */
    }
    return json({ earnings })
}

function Home() {
    const { earnings } = useLoaderData<{ earnings: Earnings }>()
    const nextLeft = earnings.nextReward
        ? Math.max(
              0,
              earnings.nextReward.threshold - earnings.deliveredCount,
          )
        : 0

    return (
        <PackageHandlerLayout>
            <main className="h-full overflow-y-auto">
                <div className="container px-5 mx-auto grid">
                    <h2 className="my-6 text-2xl font-semibold text-gray-700 dark:text-gray-200">
                        Rider dashboard
                    </h2>
                    <p className="mb-6 text-sm text-gray-600 dark:text-gray-400 max-w-2xl">
                        You earn from completed deliveries after SendGH takes its
                        platform commission (default 20% of the delivery fee). COD
                        commission (1%) goes to SendGH. Deliver more to unlock
                        rewards.
                    </p>

                    <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-3">
                        <div className="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
                            <div>
                                <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Wallet balance
                                </p>
                                <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                                    GHS {Number(earnings.balance || 0).toFixed(2)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
                            <div>
                                <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Deliveries completed
                                </p>
                                <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                                    {earnings.deliveredCount}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
                            <div>
                                <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Next reward
                                </p>
                                <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                                    {earnings.nextReward
                                        ? `${earnings.nextReward.label} (${nextLeft} more)`
                                        : 'All unlocked'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8 p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
                        <h3 className="mb-3 text-lg font-semibold text-gray-700 dark:text-gray-200">
                            Delivery rewards
                        </h3>
                        <ul className="space-y-2 text-sm">
                            {(earnings.rewards || []).map((r) => (
                                <li
                                    key={r.id}
                                    className={
                                        r.unlocked
                                            ? 'text-green-700 font-medium'
                                            : 'text-gray-500'
                                    }
                                >
                                    {r.unlocked ? '✓' : '○'} {r.label} —{' '}
                                    {r.threshold} deliveries
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mb-8 p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
                        <h3 className="mb-3 text-lg font-semibold text-gray-700 dark:text-gray-200">
                            Recent earnings
                        </h3>
                        {(earnings.recentLedger || []).length === 0 ? (
                            <p className="text-sm text-gray-500">
                                No earnings yet. Complete a delivery to get paid.
                            </p>
                        ) : (
                            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                {earnings.recentLedger.map((row) => (
                                    <li
                                        key={row.id}
                                        className="flex justify-between border-b border-gray-100 pb-2"
                                    >
                                        <span>
                                            {row.description || row.entryType}
                                        </span>
                                        <span
                                            className={
                                                row.entryType === 'credit'
                                                    ? 'text-green-600 font-semibold'
                                                    : 'text-red-600'
                                            }
                                        >
                                            {row.entryType === 'credit'
                                                ? '+'
                                                : '-'}
                                            GHS {Number(row.amount).toFixed(2)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </main>
        </PackageHandlerLayout>
    )
}

export default Home
