import {
    Box,
    Code,
    Link,
    Stack,
    Text,
    useColorModeValue,
} from '@chakra-ui/react'
import { Link as RemixLink } from '@remix-run/react'

export const DEMO = {
    password: '123456',
    merchant: {
        email: 'maruffamd@gmail.com',
        path: '/login',
        label: 'Merchant',
    },
    admin: {
        email: 'admin@gmail.com',
        path: '/admin/login',
        label: 'Admin',
    },
    pickup: {
        email: 'reyad@gmail.com',
        path: '/packagehandler/login',
        label: 'Pickup rider',
    },
    delivery: {
        email: 'tushar@gmail.com',
        path: '/packagehandler/login',
        label: 'Delivery rider',
    },
    track: 'DEMO-TRACK-001',
} as const

type Variant = 'all' | 'merchant' | 'admin' | 'rider' | 'track'

const accountsByVariant: Record<
    Variant,
    Array<{ label: string; email?: string; path?: string; note?: string }>
> = {
    all: [
        { label: DEMO.merchant.label, email: DEMO.merchant.email, path: DEMO.merchant.path },
        { label: DEMO.admin.label, email: DEMO.admin.email, path: DEMO.admin.path },
        { label: DEMO.pickup.label, email: DEMO.pickup.email, path: DEMO.pickup.path },
        { label: DEMO.delivery.label, email: DEMO.delivery.email, path: DEMO.delivery.path },
        {
            label: 'Public track',
            note: DEMO.track,
            path: `/track/${DEMO.track}`,
        },
    ],
    merchant: [
        { label: DEMO.merchant.label, email: DEMO.merchant.email, path: DEMO.merchant.path },
    ],
    admin: [
        { label: DEMO.admin.label, email: DEMO.admin.email, path: DEMO.admin.path },
    ],
    rider: [
        { label: DEMO.pickup.label, email: DEMO.pickup.email, path: DEMO.pickup.path },
        { label: DEMO.delivery.label, email: DEMO.delivery.email, path: DEMO.delivery.path },
    ],
    track: [
        {
            label: 'Demo parcel',
            note: DEMO.track,
            path: `/track/${DEMO.track}`,
        },
    ],
}

/**
 * Shows seeded demo credentials. Use on public + login pages so testers
 * can try Track / Book / Admin / Rider without hunting the README.
 */
export default function DemoCredentials({
    variant = 'all',
    compact = false,
}: {
    variant?: Variant
    compact?: boolean
}) {
    const bg = useColorModeValue('gray.50', 'gray.800')
    const border = useColorModeValue('gray.200', 'gray.600')
    const accounts = accountsByVariant[variant]

    return (
        <Box
            mt={compact ? 4 : 6}
            p={compact ? 3 : 4}
            bg={bg}
            borderWidth="1px"
            borderColor={border}
            borderRadius="md"
            fontSize="sm"
        >
            <Text fontWeight="bold" mb={2}>
                Demo access
            </Text>
            <Text color="gray.600" mb={3} fontSize="xs">
                Password for all accounts:{' '}
                <Code fontSize="xs">{DEMO.password}</Code>
            </Text>
            <Stack spacing={2}>
                {accounts.map((a) => (
                    <Box key={a.label + (a.email || a.note)}>
                        <Text fontWeight="semibold">{a.label}</Text>
                        {a.email ? (
                            <Text>
                                <Code fontSize="xs">{a.email}</Code>
                                {a.path ? (
                                    <>
                                        {' · '}
                                        <Link
                                            as={RemixLink}
                                            to={a.path}
                                            color="primary.500"
                                            fontWeight="medium"
                                        >
                                            Open login
                                        </Link>
                                    </>
                                ) : null}
                            </Text>
                        ) : null}
                        {a.note ? (
                            <Text>
                                <Code fontSize="xs">{a.note}</Code>
                                {a.path ? (
                                    <>
                                        {' · '}
                                        <Link
                                            as={RemixLink}
                                            to={a.path}
                                            color="primary.500"
                                            fontWeight="medium"
                                        >
                                            Track now
                                        </Link>
                                    </>
                                ) : null}
                            </Text>
                        ) : null}
                    </Box>
                ))}
            </Stack>
        </Box>
    )
}
