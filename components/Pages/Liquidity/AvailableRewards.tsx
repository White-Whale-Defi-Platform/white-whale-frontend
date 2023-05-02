import { VStack, Text, HStack, Spinner } from "@chakra-ui/react";
import { useTokenDollarValue } from "hooks/useTokenDollarValue";
import { num } from "libs/num";
import { useEffect } from "react";

const LineItem = ({ token, isLast }) => {
    // const [value, isLoading] = useTokenDollarValue(token?.symbol)
    // const dollarValue = !value ? 'na' : num(value).times(token?.amount).toFixed(2)

    return (
        <HStack justifyContent="space-between" width="full" borderBottom={!isLast && "1px solid rgba(255, 255, 255, 0.1)"} gap={4} pb={2}>
            <Text>{token?.symbol}</Text>
            <Text> {token?.assetAmount}(${Number(token?.dollarValue)?.toFixed(2)})</Text>
        </HStack>)

}

export const AvailableRewards = ({ data = [] }) => {

    if (!data.length) return null

    return (
        <VStack minWidth="150px" alignItems="flex-start">
            {data.map((token, index) => <LineItem key={token?.denom + index} token={token} isLast={index == data.length - 1} />)}
        </VStack>
    );
}


