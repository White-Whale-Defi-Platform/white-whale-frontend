import React from 'react'
import { Box, Button, HStack, Text } from '@chakra-ui/react'

type BalanceProps = {
    balance: number | string;
}

const Balance = ({ balance }: BalanceProps) => {
    return (
        <HStack>
            <Text color="brand.50" fontWeight={400} fontSize="14px">Available:</Text>
            <Text fontWeight={700} fontSize="14px"> {balance}</Text>
        </HStack>
    )
}

type MaxButtonProps = {
    disabled: boolean;
    onClick: () => void;
    hideMax?: boolean;
}
type HalfButtonProps = {
    disabled: boolean;
    onClick: () => void;
    hideHalf?: boolean;
}

const MaxButton = ({ disabled, onClick, hideMax = false }: MaxButtonProps) => {
    if (hideMax) return null;
    return (
        <Button
            disabled={disabled}
            variant="outline"
            size="xs"
            onClick={onClick}
            width="50px"
        >
            max
        </Button>
    )
}
const HalfButton = ({ disabled, onClick, hideHalf = false }: HalfButtonProps) => {
    if (hideHalf) return null;
    return (
        <Button
            disabled={disabled}
            variant="outline"
            size="xs"
            onClick={onClick}
            width="50px"
        >
            half
        </Button>
    )
}

type TokenToPriceProps = {
    numberOfTokens: string;
    dollarValue: number | string;
    hide?: boolean;
}
const TokenToPrice = ({ numberOfTokens, dollarValue, hide = false }: TokenToPriceProps) => {
    if (hide) return <Box flex={1}/>;

    return (
        <HStack spacing={0} gap={0} flex={1}>
            <Text color="brand.50" fontWeight={400} fontSize="14px">{numberOfTokens}=</Text>
            <Text fontWeight={700} fontSize="14px">${dollarValue}</Text>
        </HStack>
    )
}

type BalanceWithMaxProps = {
    balance: number | string;
    maxDisabled?: boolean;
    numberOfTokens: string;
    dollarValue: number | string;
    onMaxClick: () => void;
    onHalfClick: () => void;
    hideMax?: boolean;
    hideDollarValue?: boolean;
}

const BalanceWithMaxNHalf = ({ balance, maxDisabled, numberOfTokens, dollarValue, onMaxClick,onHalfClick, hideMax, hideDollarValue }: BalanceWithMaxProps) => {
    return (
        <HStack width="full" px={5}>
            <TokenToPrice
                numberOfTokens={numberOfTokens}
                dollarValue={dollarValue}
                hide={hideDollarValue} />
            <Balance balance={balance} />
            <HalfButton disabled={maxDisabled} onClick={onHalfClick} hideHalf={hideMax} />
          <MaxButton disabled={maxDisabled} onClick={onMaxClick} hideMax={hideMax} />
        </HStack>
    )
}

export default BalanceWithMaxNHalf
