import { VStack, Text, HStack, Spinner } from "@chakra-ui/react";
import { useTokenDollarValue } from "hooks/useTokenDollarValue";
import { num } from "libs/num";
import { useEffect } from "react";

const LineItem = ({ token }) => {
    const [value, isLoading] = useTokenDollarValue(token?.symbol)
    const dollarValue = !value ? 'na' : num(value).times(token?.amount).toFixed(2)

    return (
        <HStack justifyContent="space-between" width="full" pb={1} borderBottom="1px solid rgba(255, 255, 255, 0.1)" gap={4}>
            <Text>{token?.symbol}</Text>
            {
                isLoading 
                ? <Spinner />
                : <Text> {token?.amount}(${dollarValue})</Text>
            }

        </HStack>)

}

export const AvailableRewards = ({ data = [] }) => {

    if (!data.length) return null

    return (
        <VStack minWidth="150px" alignItems="flex-start">
            {data.map((token, index) => <LineItem key={token?.denom + index} token={token}/>)}
        </VStack>
    );
}


