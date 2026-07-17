import type { ActionData } from '~/routes/(merchant)/register'
import type { Transition } from '@remix-run/react/dist/transition'
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
    SimpleGrid,
    Spinner,
    Text,
    useToast,
} from '@chakra-ui/react'
import { Form, Link as RemixLink } from '@remix-run/react'
import {
    ShopProductCatSelectProvider,
    ShopProductChildCategoriesSelect,
    ShopProductParentCategoriesSelect,
} from '~/context/ShopProductCatSelect'
import SearchableAreaSelect from '../common/SearchableAreaSelect'
import type { SearchableSelectOptionsType } from '../common/SearchableSelectInput'

function RegisterForm({
    actionData,
    transition,
}: {
    actionData: ActionData | undefined
    transition: Pick<Transition, 'state' | 'submission'>
}) {
    const formRef = React.useRef<HTMLFormElement>(null)
    const [show, setShow] = React.useState(false)
    const handleClick = () => setShow(!show)
    const [geoMessage, setGeoMessage] = React.useState<string | null>(null)
    const [preferredDivision, setPreferredDivision] = React.useState<
        string | null
    >('Greater Accra')
    const [defaultArea, setDefaultArea] =
        React.useState<SearchableSelectOptionsType>()

    const isSubmitting =
        transition.state === 'submitting' &&
        transition.submission?.formData.get('_action') === 'signup'

    const toast = useToast({
        isClosable: true,
    })
    const errorToast = 'error-toast'
    const successToast = 'success-toast'

    React.useEffect(() => {
        let cancelled = false
        const base =
            typeof window !== 'undefined' && window.ENV?.API_BASE_URL
                ? window.ENV.API_BASE_URL
                : 'http://localhost:8000'

        ;(async () => {
            try {
                const res = await fetch(`${base}/geo/detect`)
                const json = await res.json()
                if (cancelled || !json?.data) return
                setGeoMessage(json.data.message)
                setPreferredDivision(json.data.suggestedDivision || 'Greater Accra')
                if (json.data.defaultAreaId) {
                    const match = (json.data.suggestedAreas || []).find(
                        (a: any) => a.id === json.data.defaultAreaId,
                    )
                    if (match) {
                        setDefaultArea({
                            label: `${match.district?.division?.name || ''} - ${
                                match.district?.name || ''
                            } - ${match.name}`.replace(/^ - | - $/g, ''),
                            value: String(match.id),
                            area: match.name,
                            division: match.district?.division?.name,
                        })
                    }
                }
            } catch {
                setGeoMessage(
                    'Using Ghana (Greater Accra) delivery areas by default.',
                )
            }
        })()

        return () => {
            cancelled = true
        }
    }, [])

    React.useEffect(() => {
        if (
            actionData?.formSuccess?.message.length &&
            !toast.isActive(successToast)
        ) {
            toast({
                id: successToast,
                title: actionData.formSuccess.message,
                description: 'Login now',
                status: 'success',
            })
            formRef.current?.reset()
        }
        if (actionData?.formError?.length && !toast.isActive(errorToast)) {
            toast({
                id: errorToast,
                title: actionData.formError,
                status: 'error',
            })
        }
    }, [actionData, toast])

    return (
        <Form
            ref={formRef}
            method="post"
            className="w-3/4 lg:w-3/4 h-full py-10 xl:py-20"
        >
            <Box id="form-error-message" mb="5">
                {actionData?.formError ? (
                    <Alert status="error" variant="left-accent">
                        <AlertIcon />
                        <AlertTitle>Error!</AlertTitle>
                        <AlertDescription>
                            {actionData.formError}
                        </AlertDescription>
                    </Alert>
                ) : null}

                {actionData?.formSuccess?.message ? (
                    <Alert status="success" variant="left-accent">
                        <AlertIcon />
                        <AlertTitle>Success!</AlertTitle>
                        <AlertDescription>
                            {actionData.formSuccess.message}.{' '}
                            <Link
                                as={RemixLink}
                                to="/login"
                                textDecoration="underline"
                            >
                                Login here
                            </Link>
                        </AlertDescription>
                    </Alert>
                ) : null}

                {geoMessage ? (
                    <Alert status="info" variant="left-accent" mt={2}>
                        <AlertIcon />
                        <AlertDescription>{geoMessage}</AlertDescription>
                    </Alert>
                ) : null}
            </Box>
            <Text className="text-gray-700 mt-1 font-bold mb-3">
                Personal information
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4">
                <FormControl isRequired>
                    <FormLabel>Full Name</FormLabel>
                    <Input
                        type="text"
                        name="fullName"
                        placeholder="Ama Mensah"
                        focusBorderColor="primary.500"
                    />
                </FormControl>
                <FormControl
                    isInvalid={
                        actionData?.fieldErrors?.email?.length ? true : false
                    }
                    isRequired
                >
                    <FormLabel>Email</FormLabel>
                    <Input
                        type="email"
                        name="email"
                        placeholder="ama@email.com"
                        focusBorderColor="primary.500"
                        defaultValue={actionData?.fields?.email}
                        aria-errormessage={
                            actionData?.fieldErrors?.email
                                ? 'email-error'
                                : undefined
                        }
                    />
                    <FormErrorMessage>
                        {actionData?.fieldErrors?.email ? (
                            <>{actionData.fieldErrors.email}</>
                        ) : null}
                    </FormErrorMessage>
                </FormControl>
                <FormControl isRequired>
                    <FormLabel>Phone Number</FormLabel>
                    <Input
                        type="tel"
                        name="phone"
                        placeholder="+233241234567"
                        focusBorderColor="primary.500"
                    />
                </FormControl>
            </SimpleGrid>

            <Text className="text-gray-700 font-bold mt-6">
                Shop Information
            </Text>
            <Text as="small" className="text-gray-700 mb-5 block">
                If you have more than one business, you can create multiple
                shops later
            </Text>
            <ShopProductCatSelectProvider>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4">
                    <FormControl isRequired>
                        <FormLabel>Shop Name</FormLabel>
                        <Input
                            type="text"
                            name="shopName"
                            placeholder="Shop Name"
                            focusBorderColor="primary.500"
                        />
                    </FormControl>
                    <FormControl
                        isInvalid={
                            actionData?.fieldErrors?.shopEmail?.length
                                ? true
                                : false
                        }
                        isRequired
                    >
                        <FormLabel>Shop Email</FormLabel>
                        <Input
                            type="email"
                            name="shopEmail"
                            placeholder="shop@email.com"
                            focusBorderColor="primary.500"
                            aria-errormessage={
                                actionData?.fieldErrors?.shopEmail
                                    ? 'email-error'
                                    : undefined
                            }
                        />
                        <FormErrorMessage>
                            {actionData?.fieldErrors?.shopEmail ? (
                                <>{actionData.fieldErrors.shopEmail}</>
                            ) : null}
                        </FormErrorMessage>
                    </FormControl>
                    <FormControl isRequired>
                        <FormLabel>Shop Address</FormLabel>
                        <Input
                            type="text"
                            name="shopAddress"
                            placeholder="East Legon, Accra"
                            focusBorderColor="primary.500"
                        />
                    </FormControl>
                    <FormControl isRequired>
                        <FormLabel>Product Type</FormLabel>
                        <ShopProductParentCategoriesSelect
                            placeholder="Choose product type"
                            name="productType"
                        />
                    </FormControl>
                    <FormControl isRequired>
                        <FormLabel>Product Sub Category Type</FormLabel>
                        <ShopProductChildCategoriesSelect
                            placeholder="Choose sub category"
                            name="subProductType"
                        />
                    </FormControl>
                </SimpleGrid>
            </ShopProductCatSelectProvider>

            <Text className="text-gray-700 font-bold mt-6">
                Pickup Information
            </Text>
            <Text as="small" className="text-gray-700 mb-5 block">
                Extra pickup points can be added later. Areas are sorted for
                your detected Ghana region.
            </Text>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4">
                <FormControl isRequired>
                    <FormLabel>Pickup Address</FormLabel>
                    <Input
                        type="text"
                        name="pickupAddress"
                        placeholder="Street, landmark, Accra"
                        focusBorderColor="primary.500"
                    />
                </FormControl>
                <FormControl isRequired>
                    <FormLabel>Pickup Area</FormLabel>
                    <SearchableAreaSelect
                        name="pickupArea"
                        preferredDivision={preferredDivision}
                        defaultValue={defaultArea}
                    />
                </FormControl>
                <FormControl isRequired>
                    <FormLabel>Pickup Phone Number</FormLabel>
                    <Input
                        type="tel"
                        name="pickupPhone"
                        placeholder="+233241234567"
                        focusBorderColor="primary.500"
                    />
                </FormControl>
            </SimpleGrid>

            <Text className="text-gray-700 font-bold mt-6 mb-3">
                Create Password
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4">
                <FormControl
                    isInvalid={
                        actionData?.fieldErrors?.password?.length ? true : false
                    }
                    isRequired
                >
                    <FormLabel>Password</FormLabel>
                    <InputGroup size="md">
                        <Input
                            type={show ? 'text' : 'password'}
                            name="password"
                            placeholder="Enter password"
                            focusBorderColor="primary.500"
                            aria-invalid={
                                Boolean(actionData?.fieldErrors?.password) ||
                                undefined
                            }
                            aria-errormessage={
                                actionData?.fieldErrors?.password
                                    ? 'password-error'
                                    : undefined
                            }
                        />
                        <InputRightElement width="4.5rem">
                            <Button
                                h="1.75rem"
                                size="sm"
                                onClick={handleClick}
                                variant="outline"
                                fontWeight="normal"
                            >
                                {show ? 'Hide' : 'Show'}
                            </Button>
                        </InputRightElement>
                    </InputGroup>
                    <FormErrorMessage>
                        {actionData?.fieldErrors?.password ? (
                            <>{actionData.fieldErrors.password}</>
                        ) : null}
                    </FormErrorMessage>
                </FormControl>

                <FormControl
                    isInvalid={
                        actionData?.fieldErrors?.confirmPassword?.length
                            ? true
                            : false
                    }
                    isRequired
                >
                    <FormLabel>Confirm Password</FormLabel>
                    <InputGroup size="md">
                        <Input
                            type={show ? 'text' : 'password'}
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            focusBorderColor="primary.500"
                            aria-invalid={
                                Boolean(
                                    actionData?.fieldErrors?.confirmPassword,
                                ) || undefined
                            }
                            aria-errormessage={
                                actionData?.fieldErrors?.confirmPassword
                                    ? 'confirmPassword-error'
                                    : undefined
                            }
                        />
                        <InputRightElement width="4.5rem">
                            <Button
                                h="1.75rem"
                                size="sm"
                                onClick={handleClick}
                                variant="outline"
                                fontWeight="normal"
                            >
                                {show ? 'Hide' : 'Show'}
                            </Button>
                        </InputRightElement>
                    </InputGroup>
                    <FormErrorMessage>
                        {actionData?.fieldErrors?.confirmPassword ? (
                            <>{actionData.fieldErrors.confirmPassword}</>
                        ) : null}
                    </FormErrorMessage>
                </FormControl>
            </SimpleGrid>

            <Button
                type="submit"
                variant="solid"
                colorScheme="primary"
                w="full"
                mt="5"
                name="_action"
                value="signup"
                disabled={isSubmitting}
            >
                {isSubmitting ? <Spinner /> : 'Sign up'}
            </Button>

            <Text mt="5">
                Already have an account?{' '}
                <Link as={RemixLink} to="/login" color="primary.700">
                    Login
                </Link>
            </Text>
        </Form>
    )
}

export default RegisterForm
