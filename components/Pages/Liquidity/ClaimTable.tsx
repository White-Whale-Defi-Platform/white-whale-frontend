import { HStack, VStack, Text, Image, Button } from "@chakra-ui/react"
import { TooltipWithChildren } from "components/TooltipWithChildren"
import { useTokenList } from "hooks/useTokenList"
import { useMemo, useState, useEffect } from "react"
import { useTokenDollarValue } from "hooks/useTokenDollarValue"
import { useClaim } from "./hooks/useClaim"
import { num } from "libs/num"

type Props = {
    tokens: any[]
}

const TokenRow = ({ item, isLast }: { item: any, isLast: boolean }) => {
    return (
        <HStack
            width="full"
            justifyContent="space-between"
            borderBottom={!isLast && "1px solid rgba(255, 255, 255, 0.1)"}
            py={1}
        >

            <HStack
                gap={[1]}
                p={2}
            >
                <Image
                    width="auto"
                    minW="1.5rem"
                    maxW="1.5rem"
                    maxH="1.5rem"
                    style={{ margin: 'unset' }}
                    src={item?.logoURI}
                    alt="logo-small"
                />
                <Text fontSize="16px" fontWeight="400">
                    {item?.symbol}
                </Text>
            </HStack>

            <VStack alignItems="flex-end" >
                <Text >{item?.assetAmount}</Text>
                <Text color="brand.50" style={{ margin: 'unset' }}>=${item?.dollarValue}</Text>
            </VStack>

        </HStack>
    )
}

const ClaimTable = ({ tokens = []}: Props) => {

    return (
        <VStack
            width="full"
            background="#151515"
            boxShadow="0px 0px 50px rgba(0, 0, 0, 0.25)"
            borderRadius="15px"
            maxH="250px"
            overflowY="scroll"
            sx={{
                '&::-webkit-scrollbar': {
                    width: '.4rem',
                },
                '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(0,0,0,0.8)',
                },
            }}
            px="5"
            py="4"
        >
            <Text color="red">Note: It's mock data, rewards are not implemented yet. </Text>

            {
                tokens?.map((item, index) => <TokenRow key={item?.denom + index} item={item}  isLast={index === tokens.length - 1} />)
            }
        </VStack>

    )
}

export default ClaimTable