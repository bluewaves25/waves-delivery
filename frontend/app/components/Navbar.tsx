import type { ReactNode } from 'react'
import {
    Text,
    Box,
    Flex,
    useDisclosure,
    useColorModeValue,
    Stack,
    Heading,
    Container,
    HStack,
    IconButton,
    Drawer,
    DrawerContent,
    DrawerOverlay,
    DrawerCloseButton,
    DrawerHeader,
    DrawerBody,
    Link,
    Button,
} from '@chakra-ui/react'
import { CloseIcon, HamburgerIcon } from '@chakra-ui/icons'
import { Link as RemixLink } from '@remix-run/react'

const Links = [
    { label: 'Track a parcel', to: '/track/lookup' },
    { label: 'Book a delivery', to: '/book' },
    { label: 'Log in', to: '/login' },
    { label: 'Sign up', to: '/register' },
]

const NavLink = ({ children, to }: { children: ReactNode; to: string }) => (
    <Link
        as={RemixLink}
        to={to}
        px={2}
        py={1}
        rounded="md"
        fontWeight="medium"
        _hover={{
            textDecoration: 'none',
            bg: useColorModeValue('gray.100', 'gray.700'),
        }}
    >
        {children}
    </Link>
)

export default function Navbar() {
    const { isOpen, onOpen, onClose } = useDisclosure()
    return (
        <Box
            as="nav"
            bg={useColorModeValue('white', 'gray.900')}
            py={3}
            borderBottom="1px"
            borderColor="gray.200"
        >
            <Container maxW="container.xl">
                <Flex h={16} alignItems="center" justifyContent="space-between">
                    <Flex align="center" gap={2}>
                        <IconButton
                            variant="outline"
                            size="md"
                            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
                            aria-label="Open Menu"
                            display={{ md: 'none' }}
                            onClick={isOpen ? onClose : onOpen}
                        />
                        <Link
                            as={RemixLink}
                            to="/"
                            fontWeight="extrabold"
                            fontSize={{ base: '3xl', md: '4xl' }}
                            lineHeight="1"
                            _hover={{ textDecoration: 'none' }}
                        >
                            Send
                            <Text as="span" color="primary.500">
                                GH
                            </Text>
                        </Link>
                    </Flex>

                    <HStack
                        as="nav"
                        spacing={1}
                        display={{ base: 'none', md: 'flex' }}
                        align="center"
                    >
                        <Button
                            as={RemixLink}
                            to="/track/lookup"
                            variant="ghost"
                            fontWeight="medium"
                        >
                            Track
                        </Button>
                        <Button
                            as={RemixLink}
                            to="/book"
                            variant="ghost"
                            fontWeight="medium"
                        >
                            Book delivery
                        </Button>
                        <Button
                            as={RemixLink}
                            to="/login"
                            variant="outline"
                            colorScheme="primary"
                            fontWeight="medium"
                        >
                            Log in
                        </Button>
                        <Button
                            as={RemixLink}
                            to="/register"
                            colorScheme="primary"
                            fontWeight="medium"
                        >
                            Sign up
                        </Button>
                    </HStack>
                </Flex>
            </Container>

            <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader>
                        <Heading fontWeight="extrabold" size="lg">
                            Send
                            <Text as="span" color="primary.500">
                                GH
                            </Text>
                        </Heading>
                    </DrawerHeader>
                    <DrawerBody>
                        <Stack as="nav" spacing={4} onClick={onClose}>
                            {Links.map((link) => (
                                <NavLink key={link.to} to={link.to}>
                                    {link.label}
                                </NavLink>
                            ))}
                        </Stack>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </Box>
    )
}
