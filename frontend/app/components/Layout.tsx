import React from 'react'
import {
    Box,
    Container,
    Flex,
    Link,
    Stack,
    Text,
} from '@chakra-ui/react'
import { Link as RemixLink } from '@remix-run/react'
import { useAuthProvider } from '~/context/AuthProvider'
import MerchantNav from './merchant/Navbar'
import Navbar from './Navbar'

function PublicFooter() {
    return (
        <Box as="footer" borderTop="1px" borderColor="gray.200" bg="white" mt="auto">
            <Container maxW="container.xl" py={8}>
                <Flex
                    direction={{ base: 'column', md: 'row' }}
                    justify="space-between"
                    gap={6}
                >
                    <Stack spacing={1}>
                        <Text fontWeight="extrabold" fontSize="2xl" lineHeight="1">
                            Send
                            <Text as="span" color="primary.500">
                                GH
                            </Text>
                        </Text>
                        <Text color="gray.500" fontSize="sm">
                            Delivery across Ghana
                        </Text>
                    </Stack>
                    <Stack
                        direction={{ base: 'column', sm: 'row' }}
                        spacing={{ base: 3, sm: 6 }}
                        fontSize="sm"
                        fontWeight="medium"
                    >
                        <Link as={RemixLink} to="/track/lookup">
                            Track a parcel
                        </Link>
                        <Link as={RemixLink} to="/book">
                            Book a delivery
                        </Link>
                        <Link as={RemixLink} to="/login">
                            Log in
                        </Link>
                        <Link as={RemixLink} to="/register">
                            Sign up
                        </Link>
                    </Stack>
                </Flex>
            </Container>
        </Box>
    )
}

function Layout({ children }: { children: React.ReactNode }) {
    const { id, roles } = useAuthProvider()
    const isMerchant = Boolean(id && roles?.[0]?.role?.name === 'merchant')

    return (
        <Flex direction="column" minH="100vh">
            {isMerchant ? <MerchantNav /> : <Navbar />}
            <Box as="main" flex="1">
                {children}
            </Box>
            {!isMerchant ? <PublicFooter /> : null}
        </Flex>
    )
}

export default Layout
