import {
    Box,
    Button,
    Container,
    Flex,
    Heading,
    Input,
    Text,
} from '@chakra-ui/react'
import type { LoaderFunction, MetaFunction } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { Form } from '@remix-run/react'
import Layout from '~/components/Layout'
import { getUserId } from '~/utils/session.server'

export const meta: MetaFunction = () => {
    return {
        title: 'Home',
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
        <>
            <Layout>
                <Box
                    bgImage="url(/img/delivery.jpg)"
                    bgPos="bottom"
                    bgSize="cover"
                    bgRepeat="no-repeat"
                    minH="600px"
                    h="600px"
                    pos="relative"
                >
                    <Box
                        pos="absolute"
                        inset="0"
                        bgColor="blackAlpha.700"
                        zIndex="0"
                    ></Box>
                    <Container
                        maxW="container.xl"
                        pos="relative"
                        zIndex="10"
                        h="100%"
                    >
                        <Flex alignItems="center" h="100%">
                            <Box>
                                <Heading color="white" lineHeight="base">
                                    Nationwide delivery across Ghana, <br /> done faster.
                                    <br /> Deliver with SendGH.
                                </Heading>
                            </Box>
                        </Flex>
                    </Container>
                </Box>
                <Box bgColor="black" py="8">
                    <Container
                        maxW="container.xl"
                        pos="relative"
                        zIndex="10"
                        h="100%"
                    >
                        <Flex
                            alignItems="center"
                            justifyContent="space-between"
                        >
                            <Box>
                                <Text color="white" lineHeight="base">
                                    Track your parcel with our online tracking
                                    service
                                </Text>
                            </Box>
                            <Box>
                                <Form method="get" action="/track/lookup">
                                    <Flex>
                                        <Input
                                            type="text"
                                            name="q"
                                            placeholder="Parcel number or tracking token"
                                            roundedRight="none"
                                            bgColor="white"
                                            size="lg"
                                            required
                                        />
                                        <Button
                                            type="submit"
                                            name="_action"
                                            value="track"
                                            colorScheme="primary"
                                            roundedLeft="none"
                                            size="lg"
                                        >
                                            Track
                                        </Button>
                                    </Flex>
                                </Form>
                            </Box>
                        </Flex>
                    </Container>
                </Box>
            </Layout>
        </>
    )
}

export default Home
