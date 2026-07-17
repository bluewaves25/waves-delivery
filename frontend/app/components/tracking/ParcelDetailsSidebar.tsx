import { Box, Heading, Text, VStack } from '@chakra-ui/react'
import moment from 'moment'

export type ParcelDetails = {
    parcelNumber: string
    customerName?: string | null
    areaName?: string | null
    customerAddress?: string | null
    placedAt?: string | null
    statusName?: string | null
    rider?: {
        name?: string | null
        phone?: string | null
        latitude?: number | null
        longitude?: number | null
        updatedAt?: string | null
    } | null
}

type Props = {
    details: ParcelDetails
    live?: boolean
}

export default function ParcelDetailsSidebar({ details, live }: Props) {
    return (
        <Box w={{ base: 'full', lg: '30%' }} bgColor="blackAlpha.50" p={{ base: 5, md: 8 }}>
            <Heading
                as="h4"
                fontSize="lg"
                pb="4"
                borderBottom="4px"
                borderColor="primary.500"
                display="inline-block"
            >
                Customer and order details
            </Heading>
            {live ? (
                <Text mt={3} fontSize="xs" color="green.600" fontWeight="semibold">
                    Live updates on
                </Text>
            ) : null}
            <VStack spacing="6" alignItems="start" mt="6">
                <Box>
                    <Text fontSize="sm" color="gray.600">
                        Parcel ID
                    </Text>
                    <Text fontWeight="bold" wordBreak="break-all">
                        {details.parcelNumber}
                    </Text>
                </Box>
                {details.statusName ? (
                    <Box>
                        <Text fontSize="sm" color="gray.600">
                            Status
                        </Text>
                        <Text fontWeight="bold" color="primary.600">
                            {details.statusName}
                        </Text>
                    </Box>
                ) : null}
                <Box>
                    <Text fontSize="sm" color="gray.600">
                        Customer Name
                    </Text>
                    <Text fontWeight="bold">{details.customerName || '—'}</Text>
                </Box>
                <Box>
                    <Text fontSize="sm" color="gray.600">
                        Area
                    </Text>
                    <Text fontWeight="bold">
                        {details.areaName || details.customerAddress || '—'}
                    </Text>
                </Box>
                {details.customerAddress && details.areaName ? (
                    <Box>
                        <Text fontSize="sm" color="gray.600">
                            Address
                        </Text>
                        <Text fontWeight="bold">{details.customerAddress}</Text>
                    </Box>
                ) : null}
                <Box>
                    <Text fontSize="sm" color="gray.600">
                        Placed At
                    </Text>
                    <Text fontWeight="bold">
                        {details.placedAt
                            ? moment(details.placedAt).format(
                                  'MMMM Do YYYY, h:mm a',
                              )
                            : '—'}
                    </Text>
                </Box>
                {details.rider ? (
                    <Box>
                        <Text fontSize="sm" color="gray.600">
                            Rider
                        </Text>
                        <Text fontWeight="bold">{details.rider.name || '—'}</Text>
                        {details.rider.phone ? (
                            <Text fontSize="sm">{details.rider.phone}</Text>
                        ) : null}
                        {details.rider.latitude != null &&
                        details.rider.longitude != null ? (
                            <Text fontSize="xs" color="green.600" mt={1}>
                                Live: {Number(details.rider.latitude).toFixed(5)},{' '}
                                {Number(details.rider.longitude).toFixed(5)}
                                {details.rider.updatedAt
                                    ? ` · ${moment(details.rider.updatedAt).fromNow()}`
                                    : ''}
                            </Text>
                        ) : null}
                    </Box>
                ) : null}
            </VStack>
        </Box>
    )
}
