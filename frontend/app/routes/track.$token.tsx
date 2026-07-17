import type { LoaderArgs, MetaFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { Form, Link as RemixLink, useLoaderData, useSearchParams } from '@remix-run/react'
import {
    Alert,
    AlertIcon,
    Box,
    Button,
    Container,
    Divider,
    Flex,
    Heading,
    Input,
    Link,
    Stack,
    Text,
    VStack,
} from '@chakra-ui/react'
import axios from 'axios'
import Layout from '~/components/Layout'
import DemoCredentials, { DEMO } from '~/components/common/DemoCredentials'

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

    // Home/track forms POST to /track/lookup?q=… — redirect to a real track URL
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

    return (
        <Layout>
            <Box bg="gray.50" minH="70vh">
                <Container maxW="container.md" py={{ base: 10, md: 14 }}>
                    <Stack spacing={6}>
                        <Stack spacing={2}>
                            <Text
                                fontSize="sm"
                                fontWeight="bold"
                                color="primary.500"
                                letterSpacing="wider"
                                textTransform="uppercase"
                            >
                                Track
                            </Text>
                            <Heading size="xl">Track your parcel</Heading>
                            <Text color="gray.600">
                                Enter the parcel number or tracking token. No login required.
                                Need to send something?{' '}
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
                            <Flex direction={{ base: 'column', sm: 'row' }} gap={0}>
                                <Input
                                    type="text"
                                    name="q"
                                    defaultValue={
                                        searchParams.get('q') ||
                                        (token && token !== 'lookup' ? token : '') ||
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

                        {!parcel ? <DemoCredentials variant="all" compact /> : null}

                        {error ? (
                            <Alert status="error" borderRadius="md">
                                <AlertIcon />
                                {error}
                            </Alert>
                        ) : null}

                        {parcel ? (
                            <Stack spacing={5}>
                                <Box bg="white" borderWidth="1px" borderColor="gray.200" p={5}>
                                    <Text fontSize="sm" color="gray.500">
                                        Parcel
                                    </Text>
                                    <Heading size="md" mt={1}>
                                        {parcel.parcelNumber}
                                    </Heading>
                                    <Text mt={3} fontWeight="semibold" color="primary.600">
                                        Status: {parcel.status?.name || 'unknown'}
                                    </Text>
                                    <Text mt={1} color="gray.700">
                                        {parcel.customerAddress}
                                    </Text>
                                    {parcel.customerLatitude != null &&
                                    parcel.customerLongitude != null ? (
                                        <Text mt={1} fontSize="sm" color="gray.500">
                                            Drop-off: {parcel.customerLatitude},{' '}
                                            {parcel.customerLongitude}
                                        </Text>
                                    ) : null}
                                </Box>

                                {parcel.rider ? (
                                    <Box bg="white" borderWidth="1px" borderColor="gray.200" p={5}>
                                        <Text fontSize="sm" color="gray.500">
                                            Rider
                                        </Text>
                                        <Text fontWeight="semibold" mt={1}>
                                            {parcel.rider.name}
                                        </Text>
                                        <Text color="gray.600">{parcel.rider.phone}</Text>
                                        {parcel.rider.latitude != null ? (
                                            <Text mt={1} fontSize="sm" color="green.600">
                                                Live location: {parcel.rider.latitude},{' '}
                                                {parcel.rider.longitude}
                                            </Text>
                                        ) : (
                                            <Text mt={1} fontSize="sm" color="gray.500">
                                                Location not available yet
                                            </Text>
                                        )}
                                    </Box>
                                ) : null}

                                <Box bg="white" borderWidth="1px" borderColor="gray.200" p={5}>
                                    <Text fontSize="sm" color="gray.500" mb={3}>
                                        Timeline
                                    </Text>
                                    <VStack align="stretch" spacing={4} divider={<Divider />}>
                                        {(parcel.timeline || []).map((item: any) => (
                                            <Box key={item.id}>
                                                <Text fontWeight="semibold">
                                                    {item.parcelStatus?.name || 'update'}
                                                </Text>
                                                <Text fontSize="sm" color="gray.600">
                                                    {item.message}
                                                </Text>
                                                {item.proofPhotoUrl ? (
                                                    <Text fontSize="xs" color="primary.500" mt={1}>
                                                        Proof of delivery attached
                                                    </Text>
                                                ) : null}
                                            </Box>
                                        ))}
                                    </VStack>
                                </Box>
                            </Stack>
                        ) : null}

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
