import type { LoaderArgs, MetaFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, useLoaderData, useSearchParams } from '@remix-run/react'
import axios from 'axios'

export const meta: MetaFunction = () => ({
    title: 'Track parcel',
})

export async function loader({ params, request }: LoaderArgs) {
    const url = new URL(request.url)
    const q = url.searchParams.get('q')
    const token = params.token || q
    if (!token || token === 'lookup') {
        return json({ parcel: null, error: null as string | null, token: null })
    }

    const baseURL = process.env.API_BASE_URL || 'http://localhost:8000'
    try {
        const res = await axios.get(`${baseURL}/track/${encodeURIComponent(token)}`)
        return json({ parcel: res.data.data, error: null as string | null, token })
    } catch (e: any) {
        const message =
            e?.response?.data?.message ||
            e?.message ||
            'Unable to load tracking information'
        return json({ parcel: null, error: String(message), token })
    }
}

export default function TrackParcelPage() {
    const { parcel, error, token } = useLoaderData<typeof loader>()
    const [searchParams] = useSearchParams()

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-10">
            <div className="mx-auto max-w-xl">
                <p className="text-sm uppercase tracking-[0.2em] text-cyan-400">
                    Delivery tracking
                </p>
                <h1 className="mt-2 text-3xl font-semibold">Track your parcel</h1>
                <p className="mt-2 text-slate-400">
                    Enter the tracking link token or parcel number. No login required.
                </p>

                <Form method="get" action="/track/lookup" className="mt-6 flex gap-2">
                    <input
                        type="text"
                        name="q"
                        defaultValue={searchParams.get('q') || token || ''}
                        placeholder="Tracking token or parcel number"
                        className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2"
                    />
                    <button
                        type="submit"
                        className="rounded-md bg-cyan-500 px-4 py-2 font-medium text-slate-950"
                    >
                        Track
                    </button>
                </Form>

                {error ? (
                    <p className="mt-6 rounded-md border border-rose-500/40 bg-rose-950/40 px-4 py-3 text-rose-200">
                        {error}
                    </p>
                ) : null}

                {parcel ? (
                    <section className="mt-8 space-y-4">
                        <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
                            <p className="text-sm text-slate-400">Parcel</p>
                            <p className="text-xl font-medium">{parcel.parcelNumber}</p>
                            <p className="mt-2 text-cyan-300">
                                Status: {parcel.status?.name || 'unknown'}
                            </p>
                            <p className="mt-1 text-slate-300">{parcel.customerAddress}</p>
                            {parcel.customerLatitude != null &&
                            parcel.customerLongitude != null ? (
                                <p className="mt-1 text-sm text-slate-500">
                                    Drop-off pin: {parcel.customerLatitude},{' '}
                                    {parcel.customerLongitude}
                                </p>
                            ) : null}
                        </div>

                        {parcel.rider ? (
                            <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
                                <p className="text-sm text-slate-400">Rider</p>
                                <p className="font-medium">{parcel.rider.name}</p>
                                <p className="text-slate-400">{parcel.rider.phone}</p>
                                {parcel.rider.latitude != null ? (
                                    <p className="mt-1 text-sm text-emerald-300">
                                        Live: {parcel.rider.latitude}, {parcel.rider.longitude}
                                    </p>
                                ) : (
                                    <p className="mt-1 text-sm text-slate-500">
                                        Location not available yet
                                    </p>
                                )}
                            </div>
                        ) : null}

                        <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
                            <p className="mb-3 text-sm text-slate-400">Timeline</p>
                            <ol className="space-y-3">
                                {(parcel.timeline || []).map((item: any) => (
                                    <li key={item.id} className="border-l border-slate-700 pl-3">
                                        <p className="font-medium">
                                            {item.parcelStatus?.name || 'update'}
                                        </p>
                                        <p className="text-sm text-slate-400">{item.message}</p>
                                        {item.proofPhotoUrl ? (
                                            <p className="text-xs text-cyan-400">
                                                POD photo attached
                                            </p>
                                        ) : null}
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </section>
                ) : null}
            </div>
        </main>
    )
}
