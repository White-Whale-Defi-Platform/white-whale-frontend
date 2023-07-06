import React from 'react'
import { Box, Button, HStack, Text } from '@chakra-ui/react'

type BalanceProps = {
  balance: number | string
  mobile?: boolean
}

const Balance = ({ balance, mobile }: BalanceProps) => {
  let tmpbalance = balance
  if (mobile){
    tmpbalance = String(Number(balance).toFixed(2))
  }
  return (
    <HStack>
      <Text color="brand.50" fontWeight={400} fontSize="14px">
        Available:
      </Text>
      <Text fontWeight={700} fontSize="14px">
        {' '}
        {tmpbalance}
      </Text>
    </HStack>
  )
}

type MaxButtonProps = {
  disabled: boolean
  onClick: () => void
  hideMax?: boolean
  maxwidth?:string
  size:string
  minwidth?:string
}
type HalfButtonProps = {
  disabled: boolean
  onClick: () => void
  hideHalf?: boolean
  maxwidth?:string
  size:string
  minwidth?:string
}

const MaxButton = ({ disabled, onClick, hideMax, maxwidth,
  size,minwidth }: MaxButtonProps) => {
  if (hideMax) return null
  return (
    <Button
      disabled={disabled}
      variant="outline"
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
  if (hideHalf) return null
  return (
    <Button 
      disabled={disabled}
      variant="outline"
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
  numberOfTokens: string
  dollarValue: number | string
  hide?: boolean
  mobile?:boolean
}
const TokenToPrice = ({
  numberOfTokens,
  dollarValue,
  hide,
  mobile
}: TokenToPriceProps) => {
  if (hide) return <Box flex={1} />
  let no = isNaN(Number(numberOfTokens)) ? numberOfTokens : 0
  console.log(numberOfTokens)
  if (mobile){
    no = "Value:"
  }
  return (
    <HStack spacing={0} gap={0} flex={1}>
      <Text color="brand.50" fontWeight={400} fontSize="14px">
        {no}
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
  numberOfTokens: string
  dollarValue: number | string
  onMaxClick: () => void
  onHalfClick: () => void
  hideMax?: boolean
  hideDollarValue?: boolean
  mobile?:boolean
}

const BalanceWithMaxNHalf = ({
  balance,
  maxDisabled,
  numberOfTokens,
  dollarValue,
  onMaxClick,
  onHalfClick,
  hideMax,
  hideDollarValue,
  mobile
}: BalanceWithMaxProps) => {
  if (!mobile){
  return (
    <HStack width="full" px={5}>
      <TokenToPrice
        numberOfTokens={numberOfTokens}
        dollarValue={dollarValue}
        hide={hideDollarValue}
      />
      <Balance balance={balance} mobile={mobile} />
      <HalfButton
        disabled={maxDisabled}
        onClick={onHalfClick}
        hideHalf={hideMax}
        maxwidth={"50"}
        size={"xs"}
      />
      <MaxButton
        disabled={maxDisabled}
        onClick={onMaxClick}
        hideMax={hideMax}
        maxwidth={"50"}
        size={"xs"}
      />
    </HStack>
  )}else {
    return (
    <>
    <HStack width="full" px={5}>
        <TokenToPrice
          numberOfTokens={numberOfTokens}
          dollarValue={dollarValue}
          hide={hideDollarValue}
          mobile={mobile} />
        <Balance balance={balance} mobile={mobile}/>
      </HStack>
      <HStack justifyContent="center" spacing={2} width={"full"}>   
      <HalfButton
        disabled={hideMax}
        onClick={onHalfClick}
        hideHalf={hideMax}
        size={"md"}
      />
      <MaxButton
        disabled={hideMax}
        onClick={onMaxClick}
        hideMax={hideMax}
        

        size={"md"}
      />
          
        </HStack>
        </>)
  }
}

export default BalanceWithMaxNHalf
