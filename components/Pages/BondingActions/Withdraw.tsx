import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { WhaleTokenType } from './BondingActions'
import { WhaleTooltip } from '../Bonding/BondingOverview'
import { useEffect, useState } from 'react'

const Withdraw = ({ unbondingAmpWHALE, unbondingbWHALE, withdrawablebWHALE, withdrawableAmpWHALE, isWalletConnected }) => {

    const [formattedDurationString, setDurationString] = useState<string>(null)

    const startTime = new Date("2023-03-04T17:51").getTime();
    const currentTime = new Date().getTime()
    const duration = (currentTime - startTime) / 1000;

    const setDuration = () => {
        if (duration >= 86400) {
            setDurationString(`${Math.floor(duration / 86400)} days`);
        } else if (duration >= 3600) {
            setDurationString(`${Math.floor(duration / 3600)} hours`);
        } else if (duration >= 60) {
            setDurationString(`${Math.floor(duration / 60)} minutes`);
        } else {
            setDurationString(`${Math.floor(duration)} seconds`);
        }
    }

    useEffect(() => {
        setDuration()
    }, [])

    const ProgressBar = ({ percent }) => {
        return (
            <Box
                h="3px"
                minW={430}
                bg="whiteAlpha.400"
                borderRadius="10px"
                overflow="hidden">
                <Box
                    h="100%"
                    bg="#7CFB7D"
                    w={`${percent}%`}
                    borderRadius="10px" />
            </Box>
        );
    }

    const TokenBox = ({ label, amp, b }) => {
        return <Box
            border="0.5px solid"
            borderColor="whiteAlpha.400"
            borderRadius="10px"
            p={4}
            minW={240}>
            <HStack>
                <Text
                    color="whiteAlpha.600">
                    {label}
                </Text>
                <WhaleTooltip WHALE={null} ampWHALE={amp} bWHALE={b} isWalletConnected={isWalletConnected} tokenType={null} />
            </HStack>
            <Text
                fontSize={23}
                fontWeight="bold">
                {isWalletConnected ? `${(amp + b).toLocaleString()}` : "n/a"}
            </Text>
        </Box>
    }

    const BoxComponent = ({ block, whaleTokenType, value, durationString }) => {
        return <VStack
            mb={30}>
            <HStack
                spacing={120}>
                <Text>
                    {value.toLocaleString()} {WhaleTokenType[whaleTokenType]}
                </Text>
                <HStack
                    spacing={4}>
                    <Text>
                        ~ {durationString}
                    </Text>
                    <Text
                        color="grey"
                        fontSize={12}>
                        block {block.toLocaleString()}

                    </Text>
                </HStack>
            </HStack>
            <ProgressBar
                percent={50} />
        </VStack>
    }
    return <VStack
        spacing={5}
        mb={7}>
        <HStack
            spacing={7}>
            <TokenBox label="Unbonding" amp={unbondingAmpWHALE} b={unbondingbWHALE} />
            <TokenBox label="Withdrawable" amp={withdrawableAmpWHALE} b={withdrawablebWHALE} />
        </HStack>
        {isWalletConnected && <Box
            overflowY="scroll"
            maxHeight={340}
            minW={510}
            backgroundColor="black"
            padding="4"
            borderRadius="10px"
            mt={10}>
            {[1, 1, 1, 1, 1, 1, 1, 1, 1].map(_ => {
                return <BoxComponent
                    block={13563224}
                    whaleTokenType={WhaleTokenType.ampWHALE}
                    value={3532}
                    durationString={formattedDurationString} />
            })}
        </Box>}
    </VStack>
}

export default Withdraw
