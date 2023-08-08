import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import {
  Config,
  useConfig,
} from 'components/Pages/Dashboard/hooks/useDashboardData'
import { useRecoilState } from 'recoil'
import { WalletStatusType, walletState } from 'state/atoms/walletAtoms'
import {
  calculateDurationString,
  convertMicroDenomToDenom,
  nanoToMilli,
} from 'util/conversion'

import { WhaleTooltip } from '../Dashboard/WhaleTooltip'
import { WhaleTokenType } from './BondingActions'

const Withdraw = ({
  unbondingAmpWhale,
  unbondingBWhale,
  withdrawableAmpWhale,
  withdrawableBWhale,
  filteredUnbondingRequests,
  unbondingPeriodInNano,
  whalePrice,
}) => {
  const [{ status, chainId, network }, _] = useRecoilState(walletState)

  const isWalletConnected = status === WalletStatusType.connected
  const config: Config = useConfig(network, chainId)
  const ProgressBar = ({ percent }) => (
    <Box
      h="3px"
      minW={450}
      bg="whiteAlpha.400"
      borderRadius="10px"
      overflow="hidden"
    >
      <Box h="100%" bg="#7CFB7D" w={`${percent}%`} borderRadius="10px" />
    </Box>
  )

  const TokenBox = ({ label, ampWhale, bWhale }) => {
    const dollarValue = ((ampWhale + bWhale) * whalePrice).toFixed(2)
    return (
      <Box
        border="0.5px solid"
        borderColor="whiteAlpha.400"
        borderRadius="10px"
        p={4}
        minW={240}
      >
        <WhaleTooltip
          label={label}
          data={null}
          withdrawableAmpWhale={ampWhale}
          withdrawableBWhale={bWhale}
          isWalletConnected={isWalletConnected}
          tokenType={null}
        />
        <Text mb="-0.2rem" fontSize={23} fontWeight="bold">
          {isWalletConnected ? `$${dollarValue}` : 'n/a'}
        </Text>
      </Box>
    )
  }

  const BoxComponent = ({
    whaleTokenType,
    value,
    timeUntilUnbondingInMilli,
  }) => {
    const durationString = calculateDurationString(timeUntilUnbondingInMilli)
    return (
      <VStack justifyContent="center" alignItems="center" mb={30}>
        <HStack
          justifyContent="space-between"
          alignItems="flex-start"
          w="100%"
          px={4}
        >
          <Text>
            {value.toLocaleString()} {WhaleTokenType[whaleTokenType]}
          </Text>
          <HStack spacing={4}>
            <Text>~ {durationString}</Text>
          </HStack>
        </HStack>
        <ProgressBar
          percent={
            (1 -
              timeUntilUnbondingInMilli / nanoToMilli(unbondingPeriodInNano)) *
            100
          }
        />
      </VStack>
    )
  }

  return (
    <VStack spacing={5} mb={35}>
      <HStack spacing={7}>
        <TokenBox
          label="Unbonding"
          ampWhale={unbondingAmpWhale}
          bWhale={unbondingBWhale}
        />
        <TokenBox
          label="Withdrawable"
          ampWhale={withdrawableAmpWhale}
          bWhale={withdrawableBWhale}
        />
      </HStack>
      {isWalletConnected &&
        filteredUnbondingRequests !== null &&
        filteredUnbondingRequests?.length > 0 && (
          <Box
            overflowY="scroll"
            maxHeight={340}
            minW={510}
            backgroundColor="black"
            padding="4"
            borderRadius="10px"
            mt={10}
          >
            {filteredUnbondingRequests.map((type, index) => {
              const currentTimeInMilli = Date.now()
              const timeUntilUnbondingInMilli =
                nanoToMilli(Number(type.timestamp) + unbondingPeriodInNano) -
                currentTimeInMilli
              return (
                <BoxComponent
                  key={index}
                  whaleTokenType={
                    type.asset.info.native_token.denom ===
                    config?.lsd_token.ampWHALE.denom
                      ? WhaleTokenType.ampWHALE
                      : WhaleTokenType.bWHALE
                  }
                  value={convertMicroDenomToDenom(Number(type.asset.amount), 6)}
                  timeUntilUnbondingInMilli={timeUntilUnbondingInMilli}
                />
              )
            })}
          </Box>
        )}
    </VStack>
  )
}

export default Withdraw
