import React, { FC, useMemo, useState } from 'react'

import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import AllVaultsTable from 'components/Pages/Flashloan/Vaults/AllVaultsTable'
import useVault from 'components/Pages/Flashloan/Vaults/hooks/useVaults'
import { useRouter } from 'next/router'
import { useRecoilValue } from 'recoil'
import { WalletStatusType, walletState } from 'state/atoms/walletAtoms'

const Vaults: FC = () => {
  const [allVaultsInitialized, setAllVaultsInitialized] =
    useState<boolean>(false)
  const { status } = useRecoilValue(walletState)
  const isWalletConnected = status === WalletStatusType.connected
  const { vaults, isLoading } = useVault()
  const router = useRouter()
  const chainIdParam = router.query.chainId as string

  const allVaults = useMemo(() => {
    if (!vaults && isWalletConnected) {
      return []
    }
    setAllVaultsInitialized(true)

    return vaults?.vaults.map((vault) => {
      const ctaLabel = vault?.hasDeposit ? 'Manage Position' : 'New Position'
      const url = `/${chainIdParam}/vaults/${
        vault?.hasDeposit ? 'manage_position' : 'new_position'
      }?vault=${vault.vault_assets?.symbol}`
      return {
        vaultId: vault?.pool_id,
        tokenImage: vault.vault_assets?.logoURI,
        apr: 'coming soon',
        totalDeposits: vault?.totalDeposit
          ? `$${vault?.totalDeposit?.dollarValue}`
          : 'n/a',
        myDeposit: vault?.deposits ? `$${vault?.deposits?.dollarValue}` : 'n/a',
        cta: () => router.push(url),
        ctaLabel,
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vaults, allVaultsInitialized])

  return (
    <VStack
      width={{ base: '100%',
        md: '1160px' }}
      alignItems="center"
      // Margin="auto"
    >
      <Box>
        <HStack justifyContent="space-between" width="full" paddingY={10}>
          <Text as="h2" fontSize="24" fontWeight="700">
            Vaults
          </Text>
        </HStack>
        <AllVaultsTable
          vaults={allVaults}
          isLoading={isLoading || !allVaultsInitialized}
        />
      </Box>
    </VStack>
  )
}

export default Vaults
