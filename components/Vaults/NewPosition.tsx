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
import { useChains } from 'hooks/useChainInfo'
import { useTokenBalance } from 'hooks/useTokenBalance'
import { NextRouter, useRouter } from 'next/router'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'

import useVault, { useVaultDepost } from './hooks/useVaults'
import DepositForm from './ManagePoistion/DepositForm'

const NewPosition = () => {
  const router: NextRouter = useRouter()
  const { vaults, isLoading, refetch: vaultsRefetch } = useVault()
  const params = new URLSearchParams(location.search)
  const chains = useChains()
  const { chainId, key, address, status } = useRecoilValue(walletState)
  const vaultId = params.get('vault') || 'JUNOX'

  const vault = useMemo(
    () => vaults?.vaults.find((v) => v.vault_assets?.symbol === vaultId),
    [vaults, vaultId]
  )

  useEffect(() => {
    if (chainId) {
      const currenChain = chains.find((row) => row.chainId === chainId)
      if (currenChain) {
        if (!vault) {
          router.push(`/${currenChain.label.toLocaleLowerCase()}/vaults`)
        } else {
          router.push(
            `/${currenChain.label.toLowerCase()}/vaults/new_position?vault=${vaultId}`
          )
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, address, chains, vault])

  const edgeTokenList = useMemo(
    () => vaults?.vaults.map(({ vault_assets }) => vault_assets?.symbol),
    [vaults]
  )
  const {
    balance: lpTokenBalance,
    isLoading: lpTokenBalanceLoading,
    refetch: lpRefetch,
  } = useVaultDepost(vault?.lp_token, vault?.vault_address, vault?.vault_assets)
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
      width={{ base: '100%', md: '700px' }}
      alignItems="center"
      padding={5}
      margin="auto"
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
          New Position
        </Text>
      </HStack>
      <Box
        background="#1C1C1C"
        padding={[6, 12]}
        paddingTop={[10]}
        borderRadius="30px"
        width={['full']}
      >
        <Box pt="8" maxW="600px" maxH="fit-content">
          {vault?.vault_assets?.symbol && (
            <DepositForm
              vaultAddress={vault?.vault_address}
              connected={status}
              isLoading={tokenBalanceLoading}
              balance={tokenBalance}
              defaultToken={vault?.vault_assets?.symbol}
              edgeTokenList={edgeTokenList}
              showList={true}
              refetch={refetch}
            />
          )}
        </Box>
      </Box>
    </VStack>
  )
}

export default NewPosition
