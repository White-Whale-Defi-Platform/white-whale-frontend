import { useMemo } from 'react'

import { ArrowBackIcon } from '@chakra-ui/icons'
import { Box, Button, HStack, IconButton, Text, VStack } from '@chakra-ui/react'
import { useChain } from '@cosmos-kit/react-lite'
import Loader from 'components/Loader'
import { Bond, BondingTokenState } from 'components/Pages/Bonding/BondingActions/Bond'
import { bondingAtom } from 'components/Pages/Bonding/BondingActions/bondAtoms'
import { BondingActionTooltip } from 'components/Pages/Bonding/BondingActions/BondingActionTooltip'
import useTransaction from 'components/Pages/Bonding/BondingActions/hooks/useTransaction'
import Unbond from 'components/Pages/Bonding/BondingActions/Unbond'
import Withdraw from 'components/Pages/Bonding/BondingActions/Withdraw'
import { ActionType } from 'components/Pages/Bonding/BondingOverview'
import { WithdrawableInfo } from 'components/Pages/Bonding/hooks/getWithdrawable'
import {
  Config,
  useConfig,
  useDashboardData,
} from 'components/Pages/Bonding/hooks/useDashboardData'
import { kBg, kBorderRadius } from 'constants/visualComponentConstants'
import { useMultipleTokenBalance } from 'hooks/useTokenBalance'
import { useRouter } from 'next/router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'
import { TxStep } from 'types/index'

const BondingActions = ({ globalAction }) => {
  const { chainId, network, chainName, walletChainName } = useRecoilValue(chainState)
  const { address, isWalletConnected, openView } = useChain(walletChainName)

  const router = useRouter()

  const config: Config = useConfig(network, chainId)

  const symbols = useMemo(() => config?.bonding_tokens.map((token) => token.symbol),
    [config])

  const { txStep, submit } = useTransaction()

  const [currentBondState, setCurrentBondState] =
    useRecoilState<BondingTokenState>(bondingAtom)

  const [liquidBalances] = useMultipleTokenBalance(symbols)

  const {
    myBondedAssets,
    withdrawableInfos,
    bondingConfig,
    unbondingRequests,
    isLoading,
  } = useDashboardData(
    address, network, chainId, walletChainName,
  )

  const unbondingPeriodInNano = Number(bondingConfig?.unbonding_period)
  const totalWithdrawable = withdrawableInfos?.reduce((acc, e) => acc + (e?.amount || 0),
    0)

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
      setCurrentBondState({ ...currentBondState,
        amount: 0 })
      await router.push(`/${chainName}/bonding/${actionString}`)
    }

    return (
      <Button
        sx={{
          '&:hover': {
            backgroundColor: 'black',
            color: '#6ACA70',
          },
        }}
        borderRadius={0}
        borderBottomLeftRadius={action === ActionType.bond ? '10px' : 0}
        borderBottomRightRadius={action === ActionType.withdraw ? '10px' : 0}
        borderTopLeftRadius={action === ActionType.bond ? '10px' : 0}
        borderTopRightRadius={action === ActionType.withdraw ? '10px' : 0}
        color={globalAction === action ? 'white' : 'grey'}
        bg={'black'}
        fontSize={20}
        px={3}
        transform="translate(0%, -55%)"
        style={{ textTransform: 'capitalize' }}
        onClick={onClick}
      >
        {actionString}
      </Button>
    )
  }
  const getFirstDenomWithPositiveAmount = (withdrawableInfos: WithdrawableInfo[],
    config: Config) => {
    const foundToken = config?.bonding_tokens?.
      map((tokenConfig) => withdrawableInfos.find((info) => info.denom === tokenConfig.denom)).
      find((info) => info && info.amount > 0)

    return foundToken?.denom
  }

  return (
    <VStack
      width={{ base: '100%',
        md: '650px' }}
      alignItems="flex-start"
      top={{ base: '80px',
        md: '200' }}
      gap={4}
      paddingRight={'5'}
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
            await router.push(`/${chainName}/bonding`)
            setCurrentBondState({ ...currentBondState,
              amount: 0 })
          }}
        />
        <HStack>
          <BondingActionTooltip action={globalAction} />
          <Text
            as="h2"
            fontSize="24"
            fontWeight="900"
            style={{ textTransform: 'capitalize',
              position: 'relative' }}
          >
            {ActionType[globalAction]}
          </Text>
        </HStack>
      </HStack>
      (
      {isLoading && isWalletConnected ? (
        <VStack
          width="full"
          background={kBg}
          borderRadius={kBorderRadius}
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
          background={kBg}
          borderRadius={kBorderRadius}
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
            borderRadius={kBorderRadius}
            minH={160}
            width={'90%'}
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
                    <Bond balances={liquidBalances} tokenSymbols={symbols} />
                  )
                case ActionType.unbond:
                  return <Unbond bondedAssets={myBondedAssets} />
                case ActionType.withdraw:
                  return (
                    <Withdraw
                      withdrawableInfos={withdrawableInfos}
                      unbondingRequests={unbondingRequests}
                      unbondingPeriodInNano={unbondingPeriodInNano}
                    />
                  )
                default:
                  return <></>
              }
            })()}
          </Box>
          <Button
            alignSelf="center"
            bg="#6ACA70"
            borderRadius="full"
            width="100%"
            variant="primary"
            isDisabled={
              txStep === TxStep.Estimating ||
              txStep === TxStep.Posting ||
              txStep === TxStep.Broadcasting ||
              (globalAction === ActionType.bond && currentBondState.amount <= 0 &&
                isWalletConnected) ||
              (currentBondState.amount === 0 &&
                globalAction === ActionType.unbond &&
                isWalletConnected) ||
              (totalWithdrawable === 0 && ActionType.withdraw === globalAction)
            }
            maxWidth={580}
            isLoading={
              txStep === TxStep.Estimating ||
              txStep === TxStep.Posting ||
              txStep === TxStep.Broadcasting
            }
            onClick={ () => {
              if (isWalletConnected) {
                let { denom } = config.bonding_tokens.find((token) => token.symbol === currentBondState.tokenSymbol)
                if (globalAction === ActionType.withdraw) {
                  denom = getFirstDenomWithPositiveAmount(withdrawableInfos,
                    config)
                }
                submit(
                  globalAction, currentBondState.amount, denom,
                )
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
