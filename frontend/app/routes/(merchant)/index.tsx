import {
    Box,
    Button,
    Container,
    Flex,
    Heading,
    Input,
    SimpleGrid,
    Stack,
    Text,
    VStack,
} from '@chakra-ui/react'
import type { LoaderFunction, MetaFunction } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { Form, Link as RemixLink } from '@remix-run/react'
import Layout from '~/components/Layout'
import DemoCredentials, { DEMO } from '~/components/common/DemoCredentials'
import { getUserId } from '~/utils/session.server'

export const meta: MetaFunction = () => {
    return {
        title: 'SendGH — Delivery across Ghana',
    }
}

export const loader: LoaderFunction = async ({ request }) => {
    const userId = await getUserId(request)
    if (userId) {
        return redirect('/dashboard')
    }
    return null
}

function Home() {
    return (
        <Layout>
            {/* Hero — one composition: brand, headline, support, CTAs, image */}
            <Box
                as="section"
                bgImage="url(/img/delivery.jpg)"
                bgPos="center"
                bgSize="cover"
                bgRepeat="no-repeat"
                minH={{ base: '85vh', md: '92vh' }}
                pos="relative"
            >
                <Box pos="absolute" inset="0" bg="blackAlpha.700" />
                <Container
                    maxW="container.xl"
                    pos="relative"
                    zIndex={1}
                    h="100%"
                    minH={{ base: '85vh', md: '92vh' }}
                    display="flex"
                    alignItems="center"
                    py={{ base: 16, md: 20 }}
                >
                    <Stack spacing={6} maxW="2xl" color="white">
                        <Heading
                            as="h1"
                            fontSize={{ base: '5xl', md: '7xl' }}
                            fontWeight="extrabold"
                            lineHeight="0.95"
                            letterSpacing="tight"
                        >
                            Send
                            <Text as="span" color="primary.400">
                                GH
                            </Text>
                        </Heading>
                        <Heading
                            as="h2"
                            size="lg"
                            fontWeight="semibold"
                            lineHeight="short"
                            color="whiteAlpha.900"
                        >
                            Pickup and delivery across Ghana.
                        </Heading>
                        <Text fontSize={{ base: 'md', md: 'lg' }} color="whiteAlpha.800" maxW="lg">
                            Track a parcel in seconds, or book a delivery for your shop.
                        </Text>
                        <Flex gap={3} flexWrap="wrap" pt={2}>
                            <Button
                                as={RemixLink}
                                to="/track/lookup"
                                size="lg"
                                colorScheme="primary"
                                px={8}
                            >
                                Track a parcel
                            </Button>
                            <Button
                                as={RemixLink}
                                to="/book"
                                size="lg"
                                variant="outline"
                                color="white"
                                borderColor="whiteAlpha.700"
                                _hover={{ bg: 'whiteAlpha.200' }}
                                px={8}
                            >
                                Book a delivery
                            </Button>
                        </Flex>
                    </Stack>
                </Container>
            </Box>

            {/* Track */}
            <Box as="section" bg="gray.900" py={{ base: 12, md: 16 }}>
                <Container maxW="container.xl">
                    <Stack spacing={6} maxW="3xl">
                        <Heading size="lg" color="white">
                            Already have a parcel?
                        </Heading>
                        <Text color="whiteAlpha.700">
                            Enter your parcel number or tracking token — no account needed.
                        </Text>
                        <Form method="get" action="/track/lookup">
                            <Flex direction={{ base: 'column', sm: 'row' }} gap={0}>
                                <Input
                                    type="text"
                                    name="q"
                                    placeholder={`e.g. ${DEMO.track}`}
                                    bg="white"
                                    color="gray.800"
                                    size="lg"
                                    rounded={{ base: 'md', sm: 'md' }}
                                    roundedRight={{ sm: 'none' }}
                                    required
                                />
                                <Button
                                    type="submit"
                                    colorScheme="primary"
                                    size="lg"
                                    rounded={{ base: 'md', sm: 'md' }}
                                    roundedLeft={{ sm: 'none' }}
                                    px={10}
                                >
                                    Track
                                </Button>
                            </Flex>
                        </Form>
                    </Stack>
                </Container>
            </Box>

            {/* Book */}
            <Box as="section" bg="white" py={{ base: 14, md: 20 }}>
                <Container maxW="container.xl">
                    <Stack spacing={10}>
                        <Stack spacing={3} maxW="2xl">
                            <Heading size="lg">Need to send something?</Heading>
                            <Text color="gray.600" fontSize="lg">
                                Merchants book pickups and deliveries from a SendGH account.
                                Customers use the tracking link you share.
                            </Text>
                        </Stack>
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
                            {[
                                {
                                    step: '1',
                                    title: 'Create your shop account',
                                    body: 'Sign up with your business details and pickup point in Ghana.',
                                },
                                {
                                    step: '2',
                                    title: 'Book the delivery',
                                    body: 'Add the customer, address, and package — we schedule pickup.',
                                },
                                {
                                    step: '3',
                                    title: 'Share tracking',
                                    body: 'Send the parcel number or tracking link so anyone can follow it.',
                                },
                            ].map((item) => (
                                <VStack key={item.step} align="start" spacing={3}>
                                    <Text
                                        fontSize="sm"
                                        fontWeight="bold"
                                        color="primary.500"
                                        letterSpacing="wider"
                                    >
                                        STEP {item.step}
                                    </Text>
                                    <Heading size="md">{item.title}</Heading>
                                    <Text color="gray.600">{item.body}</Text>
                                </VStack>
                            ))}
                        </SimpleGrid>
                        <Flex gap={3} flexWrap="wrap">
                            <Button
                                as={RemixLink}
                                to="/book"
                                colorScheme="primary"
                                size="lg"
                            >
                                How booking works
                            </Button>
                            <Button
                                as={RemixLink}
                                to="/register"
                                variant="outline"
                                colorScheme="primary"
                                size="lg"
                            >
                                Sign up to send
                            </Button>
                        </Flex>
                        <DemoCredentials variant="all" />
                    </Stack>
                </Container>
            </Box>
        </Layout>
    )
}

export default Home
