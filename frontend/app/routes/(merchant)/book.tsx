import {
    Box,
    Button,
    Container,
    Flex,
    Heading,
    Stack,
    Text,
    VStack,
} from '@chakra-ui/react'
import type { LoaderFunction, MetaFunction } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { Link as RemixLink } from '@remix-run/react'
import Layout from '~/components/Layout'
import DemoCredentials from '~/components/common/DemoCredentials'
import { getUserId } from '~/utils/session.server'

export const meta: MetaFunction = () => ({
    title: 'Book a delivery — SendGH',
})

export const loader: LoaderFunction = async ({ request }) => {
    const userId = await getUserId(request)
    if (userId) {
        return redirect('/create-parcel')
    }
    return null
}

const steps = [
    {
        title: 'Sign up as a merchant',
        body: 'Create your SendGH account with shop name, contact, and a pickup address in Ghana.',
    },
    {
        title: 'Book the parcel',
        body: 'From your dashboard, open Book delivery — enter the customer, destination area, and package details.',
    },
    {
        title: 'We pick up and deliver',
        body: 'Riders collect from your pickup point and deliver nationwide. You follow status in your dashboard.',
    },
    {
        title: 'Customer tracks live',
        body: 'Share the parcel number or tracking link. Anyone can open Track — no login required.',
    },
]

export default function BookDeliveryPage() {
    return (
        <Layout>
            <Box bg="gray.50" borderBottom="1px" borderColor="gray.200">
                <Container maxW="container.xl" py={{ base: 12, md: 16 }}>
                    <Stack spacing={6} maxW="2xl">
                        <Text
                            fontSize="sm"
                            fontWeight="bold"
                            color="primary.500"
                            letterSpacing="wider"
                            textTransform="uppercase"
                        >
                            Book a delivery
                        </Text>
                        <Heading size="2xl" lineHeight="short">
                            Send with Send
                            <Text as="span" color="primary.500">
                                GH
                            </Text>
                        </Heading>
                        <Text fontSize="lg" color="gray.600">
                            Booking is for shops and senders. If you only need to follow a
                            package someone else sent, use Track instead.
                        </Text>
                        <Flex gap={3} flexWrap="wrap">
                            <Button
                                as={RemixLink}
                                to="/register"
                                colorScheme="primary"
                                size="lg"
                            >
                                Sign up to book
                            </Button>
                            <Button
                                as={RemixLink}
                                to="/login"
                                variant="outline"
                                colorScheme="primary"
                                size="lg"
                            >
                                I already have an account
                            </Button>
                            <Button
                                as={RemixLink}
                                to="/track/lookup"
                                variant="ghost"
                                size="lg"
                            >
                                Track a parcel instead
                            </Button>
                        </Flex>
                    </Stack>
                </Container>
            </Box>

            <Container maxW="container.xl" py={{ base: 12, md: 16 }}>
                <Heading size="lg" mb={10}>
                    How it works
                </Heading>
                <Stack spacing={10} maxW="3xl">
                    {steps.map((step, i) => (
                        <Flex key={step.title} gap={5} align="flex-start">
                            <Text
                                fontSize="2xl"
                                fontWeight="extrabold"
                                color="primary.500"
                                lineHeight="1"
                                minW="2rem"
                            >
                                {i + 1}
                            </Text>
                            <VStack align="start" spacing={1}>
                                <Heading size="md">{step.title}</Heading>
                                <Text color="gray.600">{step.body}</Text>
                            </VStack>
                        </Flex>
                    ))}
                </Stack>

                <Flex mt={14} gap={3} flexWrap="wrap">
                    <Button as={RemixLink} to="/register" colorScheme="primary" size="lg">
                        Create merchant account
                    </Button>
                    <Button as={RemixLink} to="/" variant="ghost" size="lg">
                        Back to home
                    </Button>
                </Flex>
                <DemoCredentials variant="all" />
            </Container>
        </Layout>
    )
}
