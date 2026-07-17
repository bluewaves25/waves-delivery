import { CheckIcon } from '@chakra-ui/icons'
import { Box, Flex, Text, VStack } from '@chakra-ui/react'
import moment from 'moment'

export type TimelineEntry = {
    id: number | string
    message: string
    createdAt: string
}

type Props = {
    items: TimelineEntry[]
}

/** README-style vertical timeline: green line + check nodes + timestamps */
export default function ParcelTimelineView({ items }: Props) {
    if (!items?.length) {
        return (
            <Text color="gray.500" fontSize="sm">
                No tracking updates yet.
            </Text>
        )
    }

    return (
        <VStack
            pos="relative"
            alignItems="start"
            spacing="12"
            _after={{
                content: '""',
                position: 'absolute',
                insetY: '0',
                left: { base: '20px', md: '2.5%' },
                transform: 'translateX(-50%)',
                width: '1px',
                bgColor: 'green.500',
                zIndex: 0,
            }}
        >
            {items.map((timeline) => (
                <Flex gap="4" key={timeline.id} w="full">
                    <Box flexShrink={0}>
                        <Flex
                            p="4"
                            w="12"
                            h="12"
                            border="1px"
                            borderColor="green.500"
                            rounded="full"
                            alignItems="center"
                            justifyContent="center"
                            bgColor="white"
                            pos="relative"
                            zIndex={10}
                        >
                            <CheckIcon color="green.500" />
                        </Flex>
                    </Box>
                    <Box pt="2">
                        <VStack spacing="2" alignItems="start">
                            <Text fontWeight="bold">{timeline.message}</Text>
                            <Text fontSize="xs" color="gray.600">
                                {moment(timeline.createdAt).format(
                                    'MMMM Do YYYY, h:mm a',
                                )}
                            </Text>
                        </VStack>
                    </Box>
                </Flex>
            ))}
        </VStack>
    )
}
