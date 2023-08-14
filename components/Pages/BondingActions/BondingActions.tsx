import React, { useMemo } from 'react'
import { Box, Button, HStack, IconButton, Text, VStack } from '@chakra-ui/react'
import { BondingActionTooltip } from 'components/Pages/BondingActions/BondingAcionTooltip'
import { AMP_WHALE_TOKEN_SYMBOL, B_WHALE_TOKEN_SYMBOL } from 'constants/index'
import { useTokenBalance } from 'hooks/useTokenBalance'
import { useRouter } from 'next/router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'
import { ActionType } from '../Dashboard/BondingOverview'
import {
  Config,
  useConfig,
  useDashboardData,
} from '../Dashboard/hooks/useDashboardData'
import { Bond, LSDTokenItemState } from './Bond'
import { bondingState } from 'state/bondingState'
import Unbond from './Unbond'
import Withdraw from './Withdraw'
import useTransaction, { TxStep } from './hooks/useTransaction'
import usePrices from 'hooks/usePrices'
import { useChain } from '@cosmos-kit/react-lite'
import { ArrowBackIcon } from '@chakra-ui/icons'
import Loader from 'components/Loader'

export enum WhaleTokenType {
  ampWHALE,
  bWHALE,
}

const BondingActions = ({ globalAction }) => {
  const { chainId, network, chainName } = useRecoilValue(chainState)
  const { address, isWalletConnected, openView } = useChain(chainName)

  const router = useRouter()

  const { txStep, submit } = useTransaction()

  const [currentBondState, setCurrentBondState] =
    useRecoilState<LSDTokenItemState>(bondingState)

  const { balance: liquidAmpWhale } = useTokenBalance(AMP_WHALE_TOKEN_SYMBOL)

  const { balance: liquidBWhale } = useTokenBalance(B_WHALE_TOKEN_SYMBOL)

  const prices = usePrices()

  const whalePrice = useMemo(() => {
    // @ts-ignore
    if (prices && prices.WHALE) {
      // @ts-ignore
      return prices.WHALE
    }
    return 0 // Default value
  }, [prices])

  const {
    bondedAmpWhale,
    bondedBWhale,
    unbondingAmpWhale,
    unbondingBWhale,
    withdrawableAmpWhale,
    withdrawableBWhale,
    bondingConfig,
    filteredUnbondingRequests,
    isLoading,
  } = useDashboardData(address, network, chainId, chainName)

  const unbondingPeriodInNano = Number(bondingConfig?.unbonding_period)
  const totalWithdrawable = withdrawableAmpWhale + withdrawableBWhale

  const buttonLabel = useMemo(() => {
    if (!isWalletConnected) {
      return 'Connect Wallet'
    } else if (
      currentBondState?.amount === 0 &&
      globalAction !== ActionType.withdraw
    ) {
      return 'Enter Amount'
    } else if (
      totalWithdrawable === 0 &&
      globalAction === ActionType.withdraw
    ) {
      return 'No Withdrawals'
    }
    return ActionType[globalAction]
  }, [isWalletConnected, currentBondState, globalAction, totalWithdrawable])

  const BondingActionButton = ({ action }) => {
    const actionString = ActionType[action].toString()
    const onClick = async () => {
      setCurrentBondState({ ...currentBondState, amount: 0 })
      await router.push(`/${chainName}/dashboard/${actionString}`)
    }

    return (
      <Button
        sx={{
          '&:hover': {
            backgroundColor: '#1C1C1C',
            color: '#6ACA70',
          },
        }}
        color={globalAction === action ? 'white' : 'grey'}
        bg={'#1C1C1C'}
        fontSize={20}
        px={5}
        transform="translate(0%, -55%)"
        style={{ textTransform: 'capitalize' }}
        onClick={onClick}
      >
        {actionString}
      </Button>
    )
  }
  const config: Config = useConfig(network, chainId)

  return (
    <VStack
      width={{ base: '100%', md: '650px' }}
      alignItems="flex-start"
      top={200}
      gap={4}
      position="absolute"
    >
      <HStack justifyContent="space-between" width="full" paddingY={5}>
        <IconButton
          variant="unstyled"
          color="white"
          fontSize="28px"
          aria-label="go back"
          icon={<ArrowBackIcon />}
          onClick={async () => {
            await router.push(`/${chainName}/dashboard`)
            setCurrentBondState({ ...currentBondState, amount: 0 })
          }}
        />
        <HStack>
          <BondingActionTooltip action={globalAction} />
          <Text
            as="h2"
            fontSize="24"
            fontWeight="900"
            style={{ textTransform: 'capitalize', position: 'relative' }}
          >
            {ActionType[globalAction]}
          </Text>
        </HStack>
      </HStack>
      (
      {isLoading && isWalletConnected ? (
        <VStack
          width="full"
          background={'#1C1C1C'}
          borderRadius={'30px'}
          justifyContent="center"
          top={70}
          minH={280}
          gap={4}
          as="form"
          position="absolute"
          pb={7}
          left="50%"
          transform="translateX(-50%)"
          display="flex"
        >
          <HStack
            minW={100}
            minH={100}
            width="full"
            alignContent="center"
            justifyContent="center"
            alignItems="center"
          >
            <Loader />
          </HStack>
        </VStack>
      ) : (
        <VStack
          width="full"
          background={'#1C1C1C'}
          borderRadius={'30px'}
          alignItems="flex-start"
          verticalAlign="flex-start"
          top={70}
          maxH={660}
          gap={4}
          as="form"
          position="absolute"
          pb={7}
          left="50%"
          transform="translateX(-50%)"
          display="flex"
        >
          <Box
            border="0.5px solid grey"
            borderRadius="30px"
            minH={160}
            minW={570}
            alignSelf="center"
            mt={'50px'}
          >
            <HStack spacing={0} justify="center">
              <BondingActionButton action={ActionType.bond} />
              <BondingActionButton action={ActionType.unbond} />
              <BondingActionButton action={ActionType.withdraw} />
            </HStack>
            {(() => {
              switch (globalAction) {
                case ActionType.bond:
                  return (
                    <Bond
                      liquidAmpWhale={liquidAmpWhale}
                      liquidBWhale={liquidBWhale}
                    />
                  )
                case ActionType.unbond:
                  return (
                    <Unbond
                      bondedAmpWhale={bondedAmpWhale}
                      bondedBWhale={bondedBWhale}
                    />
                  )
                case ActionType.withdraw:
                  return (
                    <Withdraw
                      withdrawableAmpWhale={withdrawableAmpWhale}
                      withdrawableBWhale={withdrawableBWhale}
                      unbondingAmpWhale={unbondingAmpWhale}
                      unbondingBWhale={unbondingBWhale}
                      filteredUnbondingRequests={filteredUnbondingRequests}
                      unbondingPeriodInNano={unbondingPeriodInNano}
                      whalePrice={whalePrice}
                    />
                  )
              }
            })()}
          </Box>
          <Button
            alignSelf="center"
            bg="#6ACA70"
            borderRadius="full"
            width="100%"
            variant="primary"
            disabled={
              txStep == TxStep.Estimating ||
              txStep == TxStep.Posting ||
              txStep == TxStep.Broadcasting ||
              (currentBondState.amount <= 0 &&
                globalAction !== ActionType.withdraw &&
                isWalletConnected) ||
              (withdrawableBWhale + withdrawableAmpWhale === 0 &&
                ActionType.withdraw === globalAction)
            }
            maxWidth={570}
            isLoading={
              txStep == TxStep.Estimating ||
              txStep == TxStep.Posting ||
              txStep == TxStep.Broadcasting
            }
            onClick={async () => {
              if (isWalletConnected) {
                let denom =
                  config.lsd_token[currentBondState.tokenSymbol]?.denom
                if (globalAction === ActionType.withdraw) {
                  denom =
                    withdrawableAmpWhale > 0
                      ? config.lsd_token.ampWHALE.denom
                      : config.lsd_token.bWHALE.denom
                }
                await submit(globalAction, currentBondState.amount, denom)
              } else {
                openView()
              }
            }}
            style={{ textTransform: 'capitalize' }}
          >
            {buttonLabel}
          </Button>
        </VStack>
      )}
      )
    </VStack>
  )
}

export default BondingActions
