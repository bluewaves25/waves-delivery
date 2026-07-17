import React from 'react'
import {
    Alert,
    AlertDescription,
    AlertIcon,
    AlertTitle,
    Box,
    Button,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Input,
    InputGroup,
    InputRightElement,
    Link,
    Select,
    Text,
} from '@chakra-ui/react'
import type {
    ActionFunction,
    LoaderFunction,
    MetaFunction,
} from '@remix-run/node'
import { redirect } from '@remix-run/node'
import {
    Form,
    Link as RemixLink,
    useActionData,
    useTransition,
} from '@remix-run/react'
import SearchableAreaSelect from '~/components/common/SearchableAreaSelect'
import { badRequest, validateEmail, validatePassword } from '~/utils'
import axios from '~/utils/axios.server'
import { getPackageHandlerId } from '~/utils/session.server'

export const meta: MetaFunction = () => ({
    title: 'Rider signup — SendGH',
})

export type ActionData = {
    formError?: string
    fieldErrors?: {
        email?: string
        password?: string
    }
    fields?: Record<string, string>
}

export const loader: LoaderFunction = async ({ request }) => {
    const id = await getPackageHandlerId(request)
    if (id) return redirect('/packagehandler/dashboard')
    return null
}

export const action: ActionFunction = async ({ request }) => {
    const form = await request.formData()
    const fields = {
        name: String(form.get('name') || '').trim(),
        email: String(form.get('email') || '').trim(),
        phone: String(form.get('phone') || '').trim(),
        password: String(form.get('password') || ''),
        address: String(form.get('address') || '').trim(),
        areaId: String(form.get('areaId') || ''),
        roleType: String(form.get('roleType') || 'deliveryman'),
    }

    if (
        !fields.name ||
        !fields.email ||
        !fields.phone ||
        !fields.password ||
        !fields.address ||
        !fields.areaId
    ) {
        return badRequest({
            formError: 'Please fill in all fields.',
            fields,
        } satisfies ActionData)
    }

    const fieldErrors = {
        email: validateEmail(fields.email),
        password: validatePassword(fields.password),
    }
    if (Object.values(fieldErrors).some(Boolean)) {
        return badRequest({ fieldErrors, fields } satisfies ActionData)
    }

    try {
        await axios.post('/auth/packageHandler/register', {
            name: fields.name,
            email: fields.email,
            phone: fields.phone,
            password: fields.password,
            address: fields.address,
            areaId: Number(fields.areaId),
            roleType: fields.roleType,
        })
        return redirect('/packagehandler/login?registered=1')
    } catch (e: any) {
        const message =
            e?.response?.data?.message ||
            e?.message ||
            'Could not create rider account'
        return badRequest({
            formError: String(message),
            fields,
        } satisfies ActionData)
    }
}

export default function RiderRegister() {
    const actionData = useActionData<ActionData>()
    const transition = useTransition()
    const [show, setShow] = React.useState(false)
    const [areaId, setAreaId] = React.useState(actionData?.fields?.areaId || '')
    const submitting = transition.state === 'submitting'

    return (
        <div className="flex items-center min-h-screen p-6 bg-gray-50">
            <div className="flex-1 max-w-lg mx-auto bg-white rounded-lg shadow-xl p-8">
                <h1 className="mb-2 text-xl font-semibold text-gray-800">
                    Join SendGH as a rider
                </h1>
                <Text fontSize="sm" color="gray.600" mb={6}>
                    Sign up to pick up and deliver parcels. SendGH deducts a
                    platform commission from delivery fees automatically; your
                    earnings and rewards show on your dashboard.
                </Text>
                <Form method="post">
                    {actionData?.formError ? (
                        <Alert status="error" mb={4}>
                            <AlertIcon />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>
                                {actionData.formError}
                            </AlertDescription>
                        </Alert>
                    ) : null}
                    <FormControl isRequired mb={3}>
                        <FormLabel>Full name</FormLabel>
                        <Input
                            name="name"
                            defaultValue={actionData?.fields?.name}
                        />
                    </FormControl>
                    <FormControl
                        isRequired
                        mb={3}
                        isInvalid={Boolean(actionData?.fieldErrors?.email)}
                    >
                        <FormLabel>Email</FormLabel>
                        <Input
                            type="email"
                            name="email"
                            defaultValue={actionData?.fields?.email}
                        />
                        <FormErrorMessage>
                            {actionData?.fieldErrors?.email}
                        </FormErrorMessage>
                    </FormControl>
                    <FormControl isRequired mb={3}>
                        <FormLabel>Phone</FormLabel>
                        <Input
                            name="phone"
                            defaultValue={actionData?.fields?.phone}
                            placeholder="024XXXXXXX"
                        />
                    </FormControl>
                    <FormControl
                        isRequired
                        mb={3}
                        isInvalid={Boolean(actionData?.fieldErrors?.password)}
                    >
                        <FormLabel>Password</FormLabel>
                        <InputGroup>
                            <Input
                                type={show ? 'text' : 'password'}
                                name="password"
                            />
                            <InputRightElement width="4.5rem">
                                <Button
                                    h="1.75rem"
                                    size="sm"
                                    onClick={() => setShow(!show)}
                                >
                                    {show ? 'Hide' : 'Show'}
                                </Button>
                            </InputRightElement>
                        </InputGroup>
                        <FormErrorMessage>
                            {actionData?.fieldErrors?.password}
                        </FormErrorMessage>
                    </FormControl>
                    <FormControl isRequired mb={3}>
                        <FormLabel>Role</FormLabel>
                        <Select
                            name="roleType"
                            defaultValue={
                                actionData?.fields?.roleType || 'deliveryman'
                            }
                        >
                            <option value="deliveryman">Delivery rider</option>
                            <option value="pickupman">Pickup rider</option>
                        </Select>
                    </FormControl>
                    <FormControl isRequired mb={3}>
                        <FormLabel>Home / work area</FormLabel>
                        <input type="hidden" name="areaId" value={areaId} required />
                        <SearchableAreaSelect
                            name={undefined}
                            preferredDivision="Greater Accra"
                            onChange={(e) => setAreaId(e?.value || '')}
                        />
                    </FormControl>
                    <FormControl isRequired mb={6}>
                        <FormLabel>Address</FormLabel>
                        <Input
                            name="address"
                            defaultValue={actionData?.fields?.address}
                            placeholder="Where you usually operate from"
                        />
                    </FormControl>
                    <Button
                        type="submit"
                        colorScheme="primary"
                        w="full"
                        isLoading={submitting}
                        isDisabled={!areaId}
                    >
                        Create rider account
                    </Button>
                </Form>
                <Box mt={4} fontSize="sm">
                    Already a rider?{' '}
                    <Link as={RemixLink} to="/packagehandler/login" color="primary.500">
                        Log in
                    </Link>
                </Box>
            </div>
        </div>
    )
}
