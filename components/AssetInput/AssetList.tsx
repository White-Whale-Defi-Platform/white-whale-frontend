import { FC, useMemo } from 'react'

import { Box, Button, HStack, Image, Text } from '@chakra-ui/react'
import FallbackImage from 'components/FallbackImage'
import { TokenBalance } from 'components/Pages/Dashboard/BondingActions/Bond'
import { useConfig } from 'components/Pages/Dashboard/hooks/useDashboardData'
import useFilter from 'hooks/useFilter'
import { useMultipleTokenBalance } from 'hooks/useTokenBalance'
import { useTokenList } from 'hooks/useTokenList'
import { useRecoilValue } from 'recoil'
import { chainState } from '../../state/chainState'

type AssetListProps = {
  onChange: (token: any, isTokenChange?: boolean) => void
  search: string
  currentToken: string[]
  edgeTokenList: string[]
  amount?: number
  isBonding?: boolean
  unbondingBalances?: TokenBalance[]
}

const AssetList: FC<AssetListProps> = ({
  onChange,
  search,
  currentToken = [],
  amount,
  edgeTokenList = [],
  isBonding = false,
  unbondingBalances = null,
}) => {
  const [tokenList] = useTokenList()

  const { network, chainId } = useRecoilValue(chainState)

  const config = useConfig(network, chainId)

  const tokens = isBonding
    ? tokenList?.tokens?.filter((t) => config?.bonding_tokens?.
      map((token) => token.tokenSymbol).
      includes(t.symbol))
    : tokenList?.tokens

  const [tokenBalance = []] =
    unbondingBalances !== null
      ? [
        tokens?.map(({ symbol }) => unbondingBalances.find((b) => b.tokenSymbol === symbol)?.amount),
      ]
      : useMultipleTokenBalance(tokens?.map(({ symbol }) => symbol))

  const tokensWithBalance = useMemo(() => {
    if (tokenBalance.length == 0) {
      return tokens
    }

    return tokens?.
      map((token, index) => ({
        ...token,
        balance: tokenBalance?.[index],
      })).
      filter(({ symbol }) => (edgeTokenList?.length > 0
        ? edgeTokenList.includes(symbol)
        : !currentToken?.includes(symbol)))
  }, [tokenList, tokenBalance])

  const filterAssets = useFilter<any>(
    tokensWithBalance, 'symbol', search,
  )

  return (
    <Box
      borderY="1px solid rgba(0, 0, 0, 0.5)"
      paddingY={2}
      width="full"
      paddingX={6}
      height="full"
      flex={1}
      maxHeight={600}
      minHeight={200}
      overflowY="scroll"
      sx={{
        '&::-webkit-scrollbar': {
          width: '.4rem',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(0,0,0,0.8)',
        },
      }}
    >
      {filterAssets.map((item, index) => (
        <HStack
          key={item?.name}
          as={Button}
          variant="unstyled"
          width="full"
          justifyContent="space-between"
          paddingY={4}
          paddingX={4}
          borderBottom={
            index == filterAssets?.length - 1
              ? 'unset'
              : '1px solid rgba(0, 0, 0, 0.5)'
          }
          onClick={() => onChange({
            tokenSymbol: item?.symbol,
            amount,
          },
          true)
          }
        >
          <HStack>
            <Image
              src={item?.logoURI}
              alt="logo-small"
              width="auto"
              maxW="1.5rem"
              maxH="1.5rem"
              fallback={<FallbackImage />}
            />
            <Text fontSize="18" fontWeight="400">
              {item?.symbol}
            </Text>
          </HStack>
          <Text fontSize="16" fontWeight="400">
            {Number(item?.balance || 0).toFixed(2)}
          </Text>
        </HStack>
      ))}
      {!filterAssets?.length && (
        <HStack
          as={Button}
          variant="unstyled"
          width="full"
          justifyContent="flex-start"
          paddingY={2}
          paddingX={4}
        >
          <Text fontSize="18" fontWeight="400">
            No asset found
          </Text>
        </HStack>
      )}
    </Box>
  )
}

export default AssetList
