import { useEffect, useMemo } from 'react'

import { ArrowBackIcon } from '@chakra-ui/icons'
import { Box, HStack, IconButton, Text, VStack } from '@chakra-ui/react'
import { useChain } from '@cosmos-kit/react-lite'
import useVaults, { useVaultDeposit } from 'components/Pages/Flashloan/Vaults/hooks/useVaults'
import DepositForm from 'components/Pages/Flashloan/Vaults/ManagePosition/DepositForm'
import { kBg, kBorderRadius } from 'constants/visualComponentConstants'
import { useChainInfos } from 'hooks/useChainInfo'
import { useTokenBalance } from 'hooks/useTokenBalance'
import { NextRouter, useRouter } from 'next/router'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'

const NewPosition = () => {
  const router: NextRouter = useRouter()
  const { vaults, refetch: vaultsRefetch } = useVaults()
  const params = new URLSearchParams(location.search)
  const chains: Array<any> = useChainInfos()
  const { chainId, walletChainName } = useRecoilValue(chainState)
  const { isWalletConnected } = useChain(walletChainName)
  const vaultId = params.get('vault') || 'JUNOX'

  const vault = useMemo(() => vaults?.vaults.find((v) => v.vault_assets?.symbol === vaultId),
    [vaults, vaultId])

  useEffect(() => {
    if (chainId) {
      const currentChain = chains.find((row) => row.chainId === chainId)
      if (currentChain) {
        if (!vault) {
          router.push(`/${currentChain.label.toLocaleLowerCase()}/vaults`)
        } else {
          router.push(`/${currentChain.label.toLowerCase()}/vaults/new_position?vault=${vaultId}`)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, chains, vault])

  const edgeTokenList = useMemo(() => vaults?.vaults.map(({ vault_assets }) => vault_assets?.symbol),
    [vaults])
  const { refetch: lpRefetch } = useVaultDeposit(
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
          New Position
        </Text>
      </HStack>
      <Box
        background={kBg}
        padding={[6, 12]}
        paddingTop={[10]}
        borderRadius={kBorderRadius}
        width={['full']}
      >
        <Box pt="8" maxW="600px" maxH="fit-content">
          {vault?.vault_assets?.symbol && (
            <DepositForm
              vaultAddress={vault?.vault_address}
              isWalletConnected={isWalletConnected}
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
