import {
    Alert,
    AlertDescription,
    AlertIcon,
    Box,
    Container,
    Flex,
    Heading,
} from '@chakra-ui/react'
import type { LoaderFunction, MetaFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import React from 'react'
import Layout from '~/components/Layout'
import ParcelDetailsSidebar from '~/components/tracking/ParcelDetailsSidebar'
import ParcelTimelineView from '~/components/tracking/ParcelTimelineView'
import type { TimelineEntry } from '~/components/tracking/ParcelTimelineView'
import { useParcelRealtime } from '~/hooks/useParcelRealtime'
import type { ApiErrorResponse, ParcelTimeline } from '~/types'
import { getParcelTimelineByParcelNumber } from '~/utils/merchant/parcels'

export type LoaderData = {
    parcelTimeline: ParcelTimeline | null
    error?: string
}

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url)
    const parcelNumber = url.searchParams.get('parcelNumber')
    const parcelTimeline = await getParcelTimelineByParcelNumber(
        request,
        parcelNumber,
    )
    if (parcelTimeline && (parcelTimeline as ApiErrorResponse).message) {
        return {
            error: (parcelTimeline as ApiErrorResponse).message,
            parcelTimeline: null,
        } as LoaderData
    } else if (!parcelTimeline) {
        return {
            error: 'Something is wrong. Please reload the browser.',
            parcelTimeline: null,
        } as LoaderData
    }
    return { parcelTimeline }
}

export const meta: MetaFunction = ({
    data,
}: {
    data: LoaderData | undefined
}) => {
    if (!data) {
        return { title: 'Track parcel' }
    }
    return {
        title: `Parcel timeline - ${data.parcelTimeline?.parcelNumber || ''}`,
    }
}

function ParcelTracking() {
    const { parcelTimeline, error } = useLoaderData<LoaderData>()
    const parcelNumber = parcelTimeline?.parcelNumber || null

    const initialItems: TimelineEntry[] = React.useMemo(
        () =>
            (parcelTimeline?.ParcelTimeline || []).map((t) => ({
                id: t.id,
                message: t.message,
                createdAt: t.createdAt,
            })),
        [parcelTimeline],
    )

    const { connected, timelineItems, statusName, rider } = useParcelRealtime({
        parcelNumber,
        initialTimeline: initialItems,
        initialStatus: null,
        initialRider: null,
    })

    return (
        <Layout>
            <Container maxW="container.xl" py="8">
                <Heading
                    as="h3"
                    fontSize="3xl"
                    pb="6"
                    borderBottom="4px"
                    borderColor="primary.500"
                    display="inline-block"
                >
                    Track parcel
                </Heading>
                {error ? (
                    <Box mt="12">
                        <Alert status="error">
                            <AlertIcon />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    </Box>
                ) : (
                    <Flex
                        mt="12"
                        direction={{ base: 'column', lg: 'row' }}
                        gap={{ base: 8, lg: 0 }}
                    >
                        <Box w={{ base: 'full', lg: '70%' }} pr={{ lg: 8 }}>
                            <ParcelTimelineView items={timelineItems} />
                        </Box>
                        <ParcelDetailsSidebar
                            live={connected}
                            details={{
                                parcelNumber:
                                    parcelTimeline?.parcelNumber || '',
                                customerName: parcelTimeline?.customerName,
                                areaName:
                                    parcelTimeline?.parcelDeliveryArea?.name,
                                placedAt: parcelTimeline?.createdAt,
                                statusName: statusName || undefined,
                                rider: rider
                                    ? {
                                          name: rider.name,
                                          phone: rider.phone,
                                          latitude: rider.latitude,
                                          longitude: rider.longitude,
                                          updatedAt: rider.updatedAt,
                                      }
                                    : null,
                            }}
                        />
                    </Flex>
                )}
            </Container>
        </Layout>
    )
}

export default ParcelTracking
