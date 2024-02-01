import { FC } from 'react'

import { ChevronDownIcon } from '@chakra-ui/icons'
import {
  HStack,
  IconButton,
  Image,
  Input,
  Stack,
  Text,
  forwardRef,
} from '@chakra-ui/react'
import FallbackImage from 'components/FallbackImage'
import { TokenBalance } from 'components/Pages/Bonding/BondingActions/Bond'
import { kBorderRadius } from 'constants/visualComponentConstants'
import { useTokenInfo } from 'hooks/useTokenInfo'

import AssetSelectModal from './AssetSelectModal'

interface AssetInputProps {
  showLogo?: boolean
  token: any
  value: any
  onChange: (value: any, isTokenChange?: boolean) => void
  showList?: boolean
  onInputFocus?: () => void
  balance?: number
  disabled?: boolean
  isSingleInput?: boolean
  hideToken?: string
  edgeTokenList?: string[]
  isBonding?: boolean
  unbondingBalances?: TokenBalance[]
}

const AssetSelectTrigger = ({ tokenInfo, showIcon, symbol }) => {
  const formatSymbol = symbol?.replace('-', '/')

  if (!tokenInfo?.symbol && !symbol) {
    return (
      <Text
        width="fit-content"
        fontSize="18px"
        fontWeight="400"
        color="brand.50"
      >
        Select Token
      </Text>
    )
  }

  return (
    <HStack gap={[1]} pl={3}>
      {showIcon && (
        <Image
          width="auto"
          minW="1.5rem"
          maxW="1.5rem"
          maxH="1.5rem"
          style={{ margin: 'unset',
            borderRadius: '50%' }}
          src={tokenInfo?.logoURI}
          alt="logo-small"
          fallback={<FallbackImage />}
        />
      )}
      <Text fontSize="16px" fontWeight="400">
        {tokenInfo?.symbol || formatSymbol || 'Select Token'}
      </Text>
    </HStack>
  )
}

const AssetInput: FC<AssetInputProps> = forwardRef(({
  showLogo = true,
  token,
  onChange,
  value,
  showList = true,
  disabled,
  isSingleInput = false,
  hideToken,
  edgeTokenList,
  isBonding = false,
  unbondingBalances = null,
},
ref) => {
  const tokenInfo = useTokenInfo(token?.tokenSymbol)
  return (
    <Stack
      direction={['column-reverse', 'row']}
      width="full"
      spacing={0}
      gap={[3, 0]}
    >
      <HStack
        width="full"
        border="1px solid rgba(255, 255, 255, 0.1)"
        borderLeftRadius={kBorderRadius}
        borderRightRadius={[kBorderRadius, 'unset']}
        height={12}
        paddingLeft={6}
        paddingRight={3}
      >
        <HStack flex={1}>
          <Input
            ref={ref}
            type="number"
            value={value?.amount || ''}
            variant="unstyled"
            color="white"
            placeholder="0.00"
            _placeholder={{ color: 'whiteAlpha.700' }}
            disabled={disabled || (!isSingleInput && !tokenInfo?.symbol)}
            onChange={({ target }) => {
              onChange({ ...token,
                amount: target.value })
            }}
          />
        </HStack>
      </HStack>

      <HStack
        width={['full', '185px']}
        border="1px solid rgba(255, 255, 255, 0.1)"
        borderRightRadius={kBorderRadius}
        borderLeftRadius={[kBorderRadius, 'unset']}
        height={12}
        paddingX={2}
        justifyContent={'flex-end'}
      >
        <HStack flex={1}>
          <AssetSelectModal
            onChange={onChange}
            currentToken={[tokenInfo?.symbol || hideToken]}
            edgeTokenList={edgeTokenList}
            disabled={disabled || !showList}
            amount={token?.amount}
            isBonding={isBonding}
            unbondingBalances={unbondingBalances}
          >
            <AssetSelectTrigger
              tokenInfo={tokenInfo}
              showIcon={showLogo}
              symbol={token?.symbol}
            />
            {showList && (
              <IconButton
                disabled={disabled}
                margin="unset"
                variant="unstyled"
                color="white"
                aria-label="go back"
                icon={<ChevronDownIcon />}
                style={{ margin: 'unset' }}
              />
            )}
          </AssetSelectModal>
        </HStack>
      </HStack>
    </Stack>
  )
})

export default AssetInput
