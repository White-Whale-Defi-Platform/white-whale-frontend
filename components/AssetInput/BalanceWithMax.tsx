import React from 'react'

import { Box, Button, HStack, Text } from '@chakra-ui/react'

type BalanceProps = {
  balance: number | string
  mobile?: boolean
}

const Balance = ({ balance, mobile }: BalanceProps) => {
  let shortBalance = Number(balance).toFixed(5)
  if (mobile) {
    shortBalance = Number(balance).toFixed(2)
  } else if (balance === '0') {
    shortBalance = '0'
  }
  return (
    <HStack>
      <Text color="brand.50" fontWeight={400} fontSize="14px">
        Available:
      </Text>
      <Text fontWeight={700} fontSize="14px">
        {' '}
        {shortBalance}
      </Text>
    </HStack>
  )
}

type MaxButtonProps = {
  disabled: boolean
  onClick: () => void
  hideMax?: boolean
  maxwidth?: string
  size: string
  minwidth?: string
}
type HalfButtonProps = {
  disabled: boolean
  onClick: () => void
  hideHalf?: boolean
  maxwidth?: string
  size: string
  minwidth?: string
}

const MaxButton = ({
  disabled,
  onClick,
  hideMax,
  maxwidth,
  size,
  minwidth,
}: MaxButtonProps) => {
  if (hideMax) {
    return null
  }
  return (
    <Button
      isDisabled={disabled}
      variant="outline"
      borderColor="whiteAlpha.700"
      size={size}
      onClick={onClick}
      maxW={maxwidth}
      minWidth={minwidth}
    >
      max
    </Button>
  )
}
const HalfButton = ({
  disabled,
  onClick,
  hideHalf,
  maxwidth,
  minwidth,
  size,
}: HalfButtonProps) => {
  if (hideHalf) {
    return null
  }
  return (
    <Button
      isDisabled={disabled}
      variant="outline"
      borderColor="whiteAlpha.700"
      size={size}
      onClick={onClick}
      maxW={maxwidth}
      minWidth={minwidth}
    >
      half
    </Button>
  )
}

type TokenToPriceProps = {
  tokenNumberString: string
  dollarValue: number | string
  hide?: boolean
  mobile?: boolean
}
const TokenToPrice = ({
  tokenNumberString,
  dollarValue,
  hide,
  mobile,
}: TokenToPriceProps) => {
  if (hide) {
    return <Box flex={1} />
  }

  return (
    <HStack spacing={0} gap={0} flex={1}>
      <Text color="brand.50" fontWeight={400} fontSize="14px">
        {mobile ? 'Value:' : tokenNumberString}≈
      </Text>
      <Text fontWeight={700} fontSize="14px">
        ${isNaN(Number(dollarValue)) ? 0 : dollarValue}
      </Text>
    </HStack>
  )
}

type BalanceWithMaxProps = {
  balance: number | string
  maxDisabled?: boolean
  tokenNumberString: string
  dollarValue: number | string
  onMaxClick: () => void
  onHalfClick: () => void
  hideHalfMax?: boolean
  hideDollarValue?: boolean
  mobile?: boolean
}

const BalanceWithMaxNHalf = ({
  balance,
  maxDisabled,
  tokenNumberString,
  dollarValue,
  onMaxClick,
  onHalfClick,
  hideHalfMax,
  hideDollarValue,
  mobile,
}: BalanceWithMaxProps) => (
  <>
    <HStack width="full" px={5}>
      <TokenToPrice
        tokenNumberString={tokenNumberString}
        dollarValue={dollarValue}
        hide={hideDollarValue}
        mobile={mobile}
      />
      <Balance balance={balance} mobile={mobile} />
      {!mobile ? (
        <>
          <HalfButton
            disabled={maxDisabled}
            onClick={onHalfClick}
            hideHalf={hideHalfMax}
            maxwidth={'50'}
            size={'xs'}
          />
          <MaxButton
            disabled={maxDisabled}
            onClick={onMaxClick}
            hideMax={hideHalfMax}
            maxwidth={'50'}
            size={'xs'}
          />
        </>) : null}
    </HStack>
    {mobile ? (
      <>
        <HStack justifyContent="center" spacing={2} width={'full'} paddingTop={1} paddingBottom={4}>
          <HalfButton
            disabled={hideHalfMax}
            onClick={onHalfClick}
            hideHalf={hideHalfMax}
            size={'md'}
          />
          <MaxButton
            disabled={hideHalfMax}
            onClick={onMaxClick}
            hideMax={hideHalfMax}
            size={'md'}
          />
        </HStack>
      </>) : null}
  </>)

export default BalanceWithMaxNHalf
