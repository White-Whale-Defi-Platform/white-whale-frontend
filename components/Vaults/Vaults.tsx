import React, { FC, useMemo, useState } from 'react'

import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { useRouter } from 'next/router'

import AllVaultsTable from './AllVaultsTable'
import useVault from './hooks/useVaults'

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {}

const Vaults: FC<Props> = () => {
  const [isAllVaultsInited, setAllVaultsInited] = useState<boolean>(true)
  const [isMyVaultsInited, setMyVaultsInited] = useState<boolean>(true)
  const { vaults, isLoading } = useVault()
  const router = useRouter()
  const chainIdParam = router.query.chainId as string

  const myVaults = useMemo(() => {
    if (!vaults) return []
    setMyVaultsInited(false)

    return vaults.vaults
      .filter((vault) => !!Number(vault?.deposits?.lpBalance))
      .map((vault) => ({
        totalDeposts: 'comming soon',
        myDeposit: 'comming soon',
        vaultId: vault?.pool_id,
        tokenImage: vault.vault_assets?.logoURI,
        apr: 'coming soon',
        cta: () =>
          router.push(
            `/${chainIdParam}/vaults/manage_position?vault=${vault.vault_assets?.symbol}`
          ),
      }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vaults, isMyVaultsInited])

  const allVaults = useMemo(() => {
    if (!vaults) return []
    setAllVaultsInited(false)

    return (
      vaults.vaults
        // .filter(vault => !!!Number(vault.deposits.lptoken))
        .map((vault) => {
          const ctaLabel = vault?.hasDepost ? 'Manage Position' : 'New Position'
          const url = `/${chainIdParam}/vaults/${
            vault?.hasDepost ? 'manage_position' : 'new_position'
          }?vault=${vault.vault_assets?.symbol}`
          return {
            vaultId: vault?.pool_id,
            tokenImage: vault.vault_assets?.logoURI,
            apr: 'coming soon',
            totalDeposts: vault?.totalDepost?.dollarValue,
            myDeposit: vault?.deposits?.dollarValue,
            cta: () => router.push(url),
            ctaLabel,
          }
        })
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vaults, isAllVaultsInited])

  return (
    <VStack
      width={{ base: '100%', md: '1160px' }}
      alignItems="center"
      // margin="auto"
    >
      <Box>
        <HStack justifyContent="space-between" width="full" paddingY={10}>
          <Text as="h2" fontSize="24" fontWeight="700">
            Vaults
          </Text>
        </HStack>
        <AllVaultsTable
          vaults={allVaults}
          isLoading={isLoading || isAllVaultsInited}
        />
      </Box>
    </VStack>
  )
}

export default Vaults
