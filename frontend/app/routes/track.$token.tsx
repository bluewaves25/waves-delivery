import type { LoaderArgs, MetaFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import {
    Form,
    Link as RemixLink,
    useLoaderData,
    useSearchParams,
} from '@remix-run/react'
import {
    Alert,
    AlertIcon,
    Box,
    Button,
    Container,
    Flex,
    Heading,
    Input,
    Link,
    Stack,
    Text,
} from '@chakra-ui/react'
import axios from 'axios'
import React from 'react'
import Layout from '~/components/Layout'
import DemoCredentials, { DEMO } from '~/components/common/DemoCredentials'
import ParcelDetailsSidebar from '~/components/tracking/ParcelDetailsSidebar'
import ParcelTimelineView from '~/components/tracking/ParcelTimelineView'
import type { TimelineEntry } from '~/components/tracking/ParcelTimelineView'
import { useParcelRealtime } from '~/hooks/useParcelRealtime'

export const meta: MetaFunction = () => ({
    title: 'Track a parcel — SendGH',
})

function apiBaseUrl() {
    const base = process.env.API_BASE_URL?.replace(/\/$/, '')
    if (base) return base
    if (process.env.NODE_ENV === 'production') {
        throw new Error('API_BASE_URL is not set on the web service')
    }
    return 'http://localhost:8000'
}

export async function loader({ params, request }: LoaderArgs) {
    const url = new URL(request.url)
    const q = url.searchParams.get('q')?.trim() || null
    const param = params.token

    if ((!param || param === 'lookup') && q) {
        return redirect(`/track/${encodeURIComponent(q)}`)
    }

    if (!param || param === 'lookup') {
        return json({ parcel: null, error: null as string | null, token: null })
    }

    const token = param
    try {
        const res = await axios.get(
            `${apiBaseUrl()}/track/${encodeURIComponent(token)}`,
            { timeout: 25000 },
        )
        const parcel = res.data?.data
        if (!parcel) {
            return json({
                parcel: null,
                error: 'Tracking data missing from API response',
                token,
            })
        }
        return json({ parcel, error: null as string | null, token })
    } catch (e: any) {
        const raw = e?.response?.data?.message
        const message = Array.isArray(raw)
            ? raw.join(', ')
            : raw || e?.message || 'Unable to load tracking information'
        return json({ parcel: null, error: String(message), token })
    }
}

export default function TrackParcelPage() {
    const { parcel, error, token } = useLoaderData<typeof loader>()
    const [searchParams] = useSearchParams()

    const initialItems: TimelineEntry[] = React.useMemo(
        () =>
            (parcel?.timeline || []).map((t: any) => ({
                id: t.id,
                message: t.message,
                createdAt: t.createdAt,
            })),
        [parcel],
    )

    const { connected, timelineItems, statusName, rider } = useParcelRealtime({
        parcelNumber: parcel?.parcelNumber || null,
        initialTimeline: initialItems,
        initialStatus: parcel?.status?.name || null,
        initialRider: parcel?.rider || null,
    })

    return (
        <Layout>
            <Box bg="gray.50" minH="70vh">
                <Container maxW="container.xl" py={{ base: 8, md: 12 }}>
                    <Stack spacing={8}>
                        <Stack spacing={2} maxW="2xl">
                            <Text
                                fontSize="sm"
                                fontWeight="bold"
                                color="primary.500"
                                letterSpacing="wider"
                                textTransform="uppercase"
                            >
                                Track
                            </Text>
                            <Heading
                                as="h1"
                                fontSize="3xl"
                                pb="4"
                                borderBottom="4px"
                                borderColor="primary.500"
                                display="inline-block"
                            >
                                Track parcel
                            </Heading>
                            <Text color="gray.600">
                                Enter the parcel number or tracking token. No login
                                required. Need to send something?{' '}
                                <Link
                                    as={RemixLink}
                                    to="/book"
                                    color="primary.500"
                                    fontWeight="semibold"
                                >
                                    Book a delivery
                                </Link>
                                .
                            </Text>
                        </Stack>

                        <Form method="get" action="/track/lookup">
                            <Flex
                                direction={{ base: 'column', sm: 'row' }}
                                gap={0}
                                maxW="xl"
                            >
                                <Input
                                    type="text"
                                    name="q"
                                    defaultValue={
                                        searchParams.get('q') ||
                                        (token && token !== 'lookup'
                                            ? token
                                            : '') ||
                                        ''
                                    }
                                    placeholder={`e.g. ${DEMO.track}`}
                                    bg="white"
                                    size="lg"
                                    roundedRight={{ sm: 'none' }}
                                />
                                <Button
                                    type="submit"
                                    colorScheme="primary"
                                    size="lg"
                                    roundedLeft={{ sm: 'none' }}
                                    px={8}
                                >
                                    Track
                                </Button>
                            </Flex>
                        </Form>

                        {error ? (
                            <Alert status="error" borderRadius="md" maxW="xl">
                                <AlertIcon />
                                {error}
                            </Alert>
                        ) : null}

                        {parcel ? (
                            <Flex
                                direction={{ base: 'column', lg: 'row' }}
                                gap={{ base: 8, lg: 0 }}
                                bg="white"
                                borderWidth="1px"
                                borderColor="gray.100"
                                p={{ base: 4, md: 8 }}
                            >
                                <Box
                                    w={{ base: 'full', lg: '70%' }}
                                    pr={{ lg: 8 }}
                                >
                                    <ParcelTimelineView items={timelineItems} />
                                </Box>
                                <ParcelDetailsSidebar
                                    live={connected}
                                    details={{
                                        parcelNumber: parcel.parcelNumber,
                                        customerName: parcel.customerName,
                                        areaName: parcel.areaName,
                                        customerAddress: parcel.customerAddress,
                                        placedAt: parcel.createdAt,
                                        statusName:
                                            statusName ||
                                            parcel.status?.name ||
                                            undefined,
                                        rider: rider || parcel.rider,
                                    }}
                                />
                            </Flex>
                        ) : (
                            <DemoCredentials variant="all" compact />
                        )}

                        <Text fontSize="sm" color="gray.500">
                            Merchant or staff login:{' '}
                            <Link as={RemixLink} to="/login" color="primary.500">
                                Log in
                            </Link>
                        </Text>
                    </Stack>
                </Container>
            </Box>
        </Layout>
    )
}
