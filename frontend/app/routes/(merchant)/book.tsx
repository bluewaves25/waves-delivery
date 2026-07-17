import {
    Alert,
    AlertIcon,
    Box,
    Button,
    Container,
    FormControl,
    FormLabel,
    Heading,
    Input,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    SimpleGrid,
    Stack,
    Text,
    Textarea,
    VStack,
} from '@chakra-ui/react'
import type {
    ActionFunction,
    LoaderFunction,
    MetaFunction,
} from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import {
    Form,
    Link as RemixLink,
    useActionData,
    useLoaderData,
    useTransition,
} from '@remix-run/react'
import React from 'react'
import type { SingleValue } from 'chakra-react-select'
import Layout from '~/components/Layout'
import DemoCredentials from '~/components/common/DemoCredentials'
import SearchableAreaSelect from '~/components/common/SearchableAreaSelect'
import type { SearchableSelectOptionsType } from '~/components/common/SearchableSelectInput'
import type { ParcelPrices } from '~/types'
import { badRequest, calculateDeliveryCharge } from '~/utils'
import axios from '~/utils/axios.server'

export const meta: MetaFunction = () => ({
    title: 'Book a delivery — SendGH',
})

type LoaderData = {
    parcelPrices: ParcelPrices
    preferredDivision: string | null
}

export const loader: LoaderFunction = async () => {
    let parcelPrices: ParcelPrices = { data: [] }
    try {
        const res = await axios.get('/parcels/pricing')
        parcelPrices = res.data
    } catch {
        parcelPrices = { data: [] }
    }

    let preferredDivision: string | null = 'Greater Accra'
    try {
        const geo = await axios.get('/geo/detect')
        preferredDivision = geo.data?.preferredDivision || preferredDivision
    } catch {
        /* keep Accra default */
    }

    return json<LoaderData>({ parcelPrices, preferredDivision })
}

type ActionData = {
    formError?: string
    fields?: Record<string, string>
}

export const action: ActionFunction = async ({ request }) => {
    const form = await request.formData()
    const fields = {
        senderName: String(form.get('senderName') || '').trim(),
        senderPhone: String(form.get('senderPhone') || '').trim(),
        senderAddress: String(form.get('senderAddress') || '').trim(),
        senderAreaId: String(form.get('senderAreaId') || ''),
        customerName: String(form.get('customerName') || '').trim(),
        customerPhone: String(form.get('customerPhone') || '').trim(),
        customerAddress: String(form.get('customerAddress') || '').trim(),
        parcelDeliveryAreaId: String(form.get('parcelDeliveryAreaId') || ''),
        parcelWeight: String(form.get('parcelWeight') || '500'),
        parcelCashCollection: String(form.get('parcelCashCollection') || '0'),
        parcelExtraInformation: String(
            form.get('parcelExtraInformation') || '',
        ).trim(),
    }

    if (
        !fields.senderName ||
        !fields.senderPhone ||
        !fields.senderAddress ||
        !fields.senderAreaId ||
        !fields.customerName ||
        !fields.customerPhone ||
        !fields.customerAddress ||
        !fields.parcelDeliveryAreaId
    ) {
        return badRequest({
            formError: 'Please fill in all required fields.',
            fields,
        } satisfies ActionData)
    }

    try {
        const res = await axios.post('/parcels/guest', {
            senderName: fields.senderName,
            senderPhone: fields.senderPhone,
            senderAddress: fields.senderAddress,
            senderAreaId: Number(fields.senderAreaId),
            customerName: fields.customerName,
            customerPhone: fields.customerPhone,
            customerAddress: fields.customerAddress,
            parcelDeliveryAreaId: Number(fields.parcelDeliveryAreaId),
            parcelWeight: Number(fields.parcelWeight) || 500,
            parcelCashCollection: Number(fields.parcelCashCollection) || 0,
            parcelExtraInformation: fields.parcelExtraInformation || undefined,
        })
        const token = res.data?.data?.trackingToken
        const parcelNumber = res.data?.data?.parcelNumber
        if (!token) {
            return badRequest({
                formError: 'Booking created but tracking link missing. Try Track with your parcel number.',
                fields: { ...fields, parcelNumber: parcelNumber || '' },
            })
        }
        return redirect(`/track/${encodeURIComponent(token)}`)
    } catch (e: any) {
        const message =
            e?.response?.data?.message ||
            (Array.isArray(e?.response?.data?.message)
                ? e.response.data.message.join(', ')
                : null) ||
            e?.message ||
            'Could not create booking. Please try again.'
        return badRequest({
            formError: String(message),
            fields,
        } satisfies ActionData)
    }
}

export default function BookDeliveryPage() {
    const { parcelPrices, preferredDivision } = useLoaderData<LoaderData>()
    const actionData = useActionData<ActionData>()
    const transition = useTransition()
    const submitting = transition.state === 'submitting'

    const [weight, setWeight] = React.useState(500)
    const [cash, setCash] = React.useState(0)
    const [deliveryZoneId, setDeliveryZoneId] = React.useState<number | undefined>()
    const [senderAreaId, setSenderAreaId] = React.useState(
        actionData?.fields?.senderAreaId || '',
    )
    const [deliveryAreaId, setDeliveryAreaId] = React.useState(
        actionData?.fields?.parcelDeliveryAreaId || '',
    )

    const deliveryCharge = React.useMemo(
        () =>
            calculateDeliveryCharge({
                weight,
                zoneId: deliveryZoneId || 0,
                parcelPrices,
            }),
        [weight, deliveryZoneId, parcelPrices],
    )
    const codFee = cash > 0 ? cash / 100 : 0
    const totalCharge = deliveryCharge + codFee

    const onSenderArea = (e: SingleValue<SearchableSelectOptionsType>) => {
        setSenderAreaId(e?.value || '')
    }
    const onDeliveryArea = (e: SingleValue<SearchableSelectOptionsType>) => {
        setDeliveryAreaId(e?.value || '')
        setDeliveryZoneId(e?.zoneId)
    }

    return (
        <Layout>
            <Box bg="gray.50" borderBottom="1px" borderColor="gray.200">
                <Container maxW="container.md" py={{ base: 8, md: 10 }}>
                    <Stack spacing={3}>
                        <Heading size="xl">Book a delivery</Heading>
                        <Text color="gray.600" fontSize="lg">
                            No account needed. Tell us where to pick up and where to
                            deliver — we give you a tracking link instantly.
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                            Shop with many parcels?{' '}
                            <Button
                                as={RemixLink}
                                to="/register"
                                variant="link"
                                colorScheme="primary"
                                size="sm"
                            >
                                Create a merchant account
                            </Button>
                        </Text>
                    </Stack>
                </Container>
            </Box>

            <Container maxW="container.md" py={{ base: 8, md: 12 }}>
                <Form method="post">
                    <VStack align="stretch" spacing={10}>
                        {actionData?.formError ? (
                            <Alert status="error" borderRadius="md">
                                <AlertIcon />
                                {actionData.formError}
                            </Alert>
                        ) : null}

                        <Box>
                            <Heading size="md" mb={4}>
                                From you (pickup)
                            </Heading>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel>Your name</FormLabel>
                                    <Input
                                        name="senderName"
                                        defaultValue={actionData?.fields?.senderName}
                                        placeholder="Kwame Mensah"
                                        bg="white"
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>Your phone</FormLabel>
                                    <Input
                                        name="senderPhone"
                                        defaultValue={actionData?.fields?.senderPhone}
                                        placeholder="024XXXXXXX"
                                        bg="white"
                                    />
                                </FormControl>
                                <FormControl isRequired gridColumn={{ md: 'span 2' }}>
                                    <FormLabel>Pickup area</FormLabel>
                                    <input
                                        type="hidden"
                                        name="senderAreaId"
                                        value={senderAreaId}
                                        required
                                    />
                                    <SearchableAreaSelect
                                        name={undefined}
                                        preferredDivision={preferredDivision}
                                        onChange={onSenderArea}
                                    />
                                </FormControl>
                                <FormControl isRequired gridColumn={{ md: 'span 2' }}>
                                    <FormLabel>Pickup address</FormLabel>
                                    <Input
                                        name="senderAddress"
                                        defaultValue={
                                            actionData?.fields?.senderAddress
                                        }
                                        placeholder="House / street / landmark"
                                        bg="white"
                                    />
                                </FormControl>
                            </SimpleGrid>
                        </Box>

                        <Box>
                            <Heading size="md" mb={4}>
                                To customer (delivery)
                            </Heading>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel>Customer name</FormLabel>
                                    <Input
                                        name="customerName"
                                        defaultValue={
                                            actionData?.fields?.customerName
                                        }
                                        placeholder="Ama Boateng"
                                        bg="white"
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>Customer phone</FormLabel>
                                    <Input
                                        name="customerPhone"
                                        defaultValue={
                                            actionData?.fields?.customerPhone
                                        }
                                        placeholder="020XXXXXXX"
                                        bg="white"
                                    />
                                </FormControl>
                                <FormControl isRequired gridColumn={{ md: 'span 2' }}>
                                    <FormLabel>Delivery area</FormLabel>
                                    <input
                                        type="hidden"
                                        name="parcelDeliveryAreaId"
                                        value={deliveryAreaId}
                                        required
                                    />
                                    <SearchableAreaSelect
                                        name={undefined}
                                        preferredDivision={preferredDivision}
                                        onChange={onDeliveryArea}
                                    />
                                </FormControl>
                                <FormControl isRequired gridColumn={{ md: 'span 2' }}>
                                    <FormLabel>Delivery address</FormLabel>
                                    <Input
                                        name="customerAddress"
                                        defaultValue={
                                            actionData?.fields?.customerAddress
                                        }
                                        placeholder="House / street / landmark"
                                        bg="white"
                                    />
                                </FormControl>
                            </SimpleGrid>
                        </Box>

                        <Box>
                            <Heading size="md" mb={4}>
                                Package
                            </Heading>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel>Weight (grams)</FormLabel>
                                    <input type="hidden" name="parcelWeight" value={weight} />
                                    <NumberInput
                                        value={weight}
                                        min={500}
                                        max={20000}
                                        step={500}
                                        onChange={(_, n) =>
                                            setWeight(Number.isFinite(n) ? n : 500)
                                        }
                                        bg="white"
                                    >
                                        <NumberInputField />
                                        <NumberInputStepper>
                                            <NumberIncrementStepper />
                                            <NumberDecrementStepper />
                                        </NumberInputStepper>
                                    </NumberInput>
                                </FormControl>
                                <FormControl>
                                    <FormLabel>
                                        Cash on delivery (GHS){' '}
                                        <Text as="span" color="gray.500" fontSize="sm">
                                            optional
                                        </Text>
                                    </FormLabel>
                                    <input
                                        type="hidden"
                                        name="parcelCashCollection"
                                        value={cash}
                                    />
                                    <NumberInput
                                        value={cash}
                                        min={0}
                                        onChange={(_, n) =>
                                            setCash(Number.isFinite(n) ? n : 0)
                                        }
                                        bg="white"
                                    >
                                        <NumberInputField placeholder="0" />
                                        <NumberInputStepper>
                                            <NumberIncrementStepper />
                                            <NumberDecrementStepper />
                                        </NumberInputStepper>
                                    </NumberInput>
                                </FormControl>
                                <FormControl gridColumn={{ md: 'span 2' }}>
                                    <FormLabel>
                                        Notes{' '}
                                        <Text as="span" color="gray.500" fontSize="sm">
                                            optional
                                        </Text>
                                    </FormLabel>
                                    <Textarea
                                        name="parcelExtraInformation"
                                        defaultValue={
                                            actionData?.fields
                                                ?.parcelExtraInformation
                                        }
                                        placeholder="Fragile, call on arrival, etc."
                                        bg="white"
                                        rows={3}
                                    />
                                </FormControl>
                            </SimpleGrid>
                        </Box>

                        <Box
                            bg="white"
                            borderWidth="1px"
                            borderColor="gray.200"
                            p={5}
                        >
                            <Text fontWeight="semibold" mb={2}>
                                Estimated charge
                            </Text>
                            <Text color="gray.600" fontSize="sm" mb={3}>
                                Final fee is calculated on the server from delivery
                                area and weight.
                            </Text>
                            <Stack spacing={1} fontSize="sm">
                                <Text>
                                    Delivery:{' '}
                                    <Text as="span" fontWeight="bold">
                                        GHS {deliveryCharge.toFixed(2)}
                                    </Text>
                                </Text>
                                {codFee > 0 ? (
                                    <Text>
                                        COD fee:{' '}
                                        <Text as="span" fontWeight="bold">
                                            GHS {codFee.toFixed(2)}
                                        </Text>
                                    </Text>
                                ) : null}
                                <Text fontSize="lg" pt={2}>
                                    Total:{' '}
                                    <Text as="span" fontWeight="extrabold" color="primary.600">
                                        GHS {totalCharge.toFixed(2)}
                                    </Text>
                                </Text>
                            </Stack>
                        </Box>

                        <Button
                            type="submit"
                            colorScheme="primary"
                            size="lg"
                            isLoading={submitting}
                            isDisabled={!senderAreaId || !deliveryAreaId}
                        >
                            Book delivery
                        </Button>

                        <Text fontSize="sm" color="gray.500" textAlign="center">
                            Already have a parcel number?{' '}
                            <Button
                                as={RemixLink}
                                to="/track/lookup"
                                variant="link"
                                colorScheme="primary"
                                size="sm"
                            >
                                Track it
                            </Button>
                        </Text>

                        <Box bg="white" borderWidth="1px" borderColor="gray.200" p={5}>
                            <Heading size="sm" mb={3}>
                                How money works
                            </Heading>
                            <Stack spacing={2} fontSize="sm" color="gray.600">
                                <Text>
                                    <Text as="span" fontWeight="semibold" color="gray.800">
                                        SendGH
                                    </Text>{' '}
                                    is the courier. The delivery charge shown is your fee to
                                    SendGH for pickup and delivery.
                                </Text>
                                <Text>
                                    <Text as="span" fontWeight="semibold" color="gray.800">
                                        Cash on delivery (optional)
                                    </Text>{' '}
                                    is money the rider collects from the customer (e.g. for goods
                                    you sold). SendGH remits that to you later, minus the delivery
                                    fee.
                                </Text>
                                <Text>
                                    <Text as="span" fontWeight="semibold" color="gray.800">
                                        Merchant account / shops
                                    </Text>{' '}
                                    are for businesses that send often — a “shop” is your store
                                    location, not a payment to that store. Individuals can book
                                    above without signing up.
                                </Text>
                            </Stack>
                        </Box>

                        <DemoCredentials variant="all" compact />
                    </VStack>
                </Form>
            </Container>
        </Layout>
    )
}
