import { useEffect, useMemo } from 'react'

import { ArrowBackIcon } from '@chakra-ui/icons'
import {
  Box,
  HStack,
  IconButton,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useChain } from '@cosmos-kit/react-lite'
import useVault, { useVaultDeposit } from 'components/Pages/Flashloan/Vaults/hooks/useVaults'
import DepositForm from 'components/Pages/Flashloan/Vaults/ManagePosition/DepositForm'
import WithdrawForm from 'components/Pages/Flashloan/Vaults/ManagePosition/WithdrawForm'
import { useChains2 } from 'hooks/useChainInfo'
import { useTokenBalance } from 'hooks/useTokenBalance'
import { NextRouter, useRouter } from 'next/router'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'

const ManagePosition = () => {
  const router: NextRouter = useRouter()
  const { vaults, refetch: vaultsRefetch } = useVault()
  const chains: Array<any> = useChains2()
  const params = new URLSearchParams(location.search)
  const { chainId, address, walletChainName } = useRecoilValue(chainState)
  const { isWalletConnected } = useChain(walletChainName)
  const vaultId = params.get('vault') || 'JUNO'

  const vault = useMemo(() => vaults?.vaults.find((v) => v.vault_assets?.symbol === vaultId),
    [vaults, vaultId])

  useEffect(() => {
    if (chainId) {
      const currenChain = chains.find((row) => row.chainId === chainId)
      if (currenChain) {
        if (!vault) {
          router.push(`/${currenChain.label.toLocaleLowerCase()}/vaults`)
        } else {
          router.push(`/${currenChain.label.toLowerCase()}/vaults/manage_position?vault=${vaultId}`)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, address, chains, vault])

  const {
    balance: lpTokenBalance,
    isLoading: lpTokenBalanceLoading,
    refetch: lpRefetch,
  } = useVaultDeposit(
    vault?.lp_token,
    vault?.vault_address,
    vault?.vault_assets,
  )
  const {
    balance: tokenBalance,
    isLoading: tokenBalanceLoading,
    refetch: tokenRefetch,
  } = useTokenBalance(vault?.vault_assets?.symbol)
  const refetch = () => {
    vaultsRefetch()
    lpRefetch()
    tokenRefetch()
  }

  return (
    <VStack
      width={{ base: '100%',
        md: '700px' }}
      alignItems="center"
      padding={5}
      // Margin="auto"
    >
      <HStack
        justifyContent="space-between"
        width="full"
        paddingY={5}
        paddingX={{ base: 4 }}
      >
        <IconButton
          variant="unstyled"
          color="white"
          fontSize="28px"
          aria-label="go back"
          icon={<ArrowBackIcon />}
          onClick={() => router.back()}
        />
        <Text as="h2" fontSize="24" fontWeight="900">
          Manage Position
        </Text>
      </HStack>

      <Box
        background={'#1C1C1C'}
        padding={[6, 12]}
        paddingTop={[10]}
        borderRadius="30px"
        width={['full']}
      >
        <Box
          border="2px"
          borderColor="whiteAlpha.200"
          borderRadius="3xl"
          pt="8"
          maxW="600px"
          maxH="fit-content"
        >
          <Tabs variant="brand">
            <TabList justifyContent="center" background={'#1C1C1C'}>
              <Tab>Deposit</Tab>
              <Tab>Withdraw</Tab>
            </TabList>
            <TabPanels>
              <TabPanel padding={4}>
                {vault?.vault_assets?.symbol && (
                  <DepositForm
                    vaultAddress={vault?.vault_address}
                    isWalletConnected={isWalletConnected}
                    isLoading={tokenBalanceLoading}
                    balance={tokenBalance}
                    defaultToken={vault?.vault_assets?.symbol}
                    refetch={refetch}
                  />
                )}
              </TabPanel>
              <TabPanel padding={4}>
                {vault?.vault_assets?.symbol && (
                  <WithdrawForm
                    vaultAddress={vault?.vault_address}
                    lpToken={vault?.lp_token}
                    isWalletConnected={isWalletConnected}
                    isLoading={lpTokenBalanceLoading}
                    balance={lpTokenBalance?.lpBalance}
                    assetBalance={lpTokenBalance?.underlyingAsset}
                    defaultToken={vault?.vault_assets?.symbol}
                    refetch={refetch}
                  />
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Box>
    </VStack>
  )
}

export default ManagePosition
