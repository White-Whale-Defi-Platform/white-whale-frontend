import React, { useMemo } from 'react'
import useVault from './hooks/useVaults'
import { useTokenBalance } from 'hooks/useTokenBalance'
import { Button, Flex, Text, VStack, Box, HStack, Image } from '@chakra-ui/react'
import { useRouter } from "next/router";
import AllVaultsTable from './AllVaultsTable'
import MyVaultsTable from './MyVaultsTable'

type Props = {}

const Vaults = (props: Props) => {

  const { vaults, isLoading } = useVault()
  const router = useRouter()

  const myVaults = useMemo(() => {
    if (!vaults) return []

    return vaults.vaults
      .filter(vault => !!Number(vault?.deposits?.lpBalance))
      .map(vault => ({
        totalDeposts: "comming soon",
        myDeposit: "comming soon",
        vaultId: vault?.pool_id,
        tokenImage: vault.vault_assets?.logoURI,
        apr: "coming soon",
        cta: () => router.push(`/vaults/manage_position?vault=${vault.vault_assets?.symbol}`),
      }))


  }, [vaults])

  const allVaults = useMemo(() => {
    if (!vaults) return []

    return vaults.vaults
      // .filter(vault => !!!Number(vault.deposits.lptoken))
      .map(vault => {
        const ctaLabel = vault?.hasDepost ? 'Manage Position' : 'New Position'
        const url = `/vaults/${vault?.hasDepost ? 'manage' : 'new'}_position?vault=${vault.vault_assets?.symbol}`
        return {
          vaultId: vault?.pool_id,
          tokenImage: vault.vault_assets?.logoURI,
          apr: "coming soon",
          totalDeposts: vault?.totalDepost?.dollarValue,
          myDeposit: vault?.deposits?.dollarValue,
          cta: () => router.push(url),
          ctaLabel,
        }
      })
  }, [vaults])

  return (
    <VStack width={{ base: '100%', md: '1160px' }} alignItems="center" >

      {/* <Box>
        <HStack justifyContent="space-between" width="full" paddingY={10}>
          <Text as="h2" fontSize="24" fontWeight="700">My Vaults</Text>
          <Button variant="primary" size="sm" onClick={() => router.push(`/vaults/new_position?vault=JUNO`)}>New Position</Button>
        </HStack>
        <MyVaultsTable vaults={myVaults}  isLoading={isLoading} />
        <MobilePools pools={myPools} />
      </Box> */}

      <Box>
        <HStack justifyContent="space-between" width="full" paddingY={10}>
          <Text as="h2" fontSize="24" fontWeight="700">Vaults</Text>
        </HStack>
        <AllVaultsTable vaults={allVaults} isLoading={isLoading} />
        {/* <MobilePools pools={allPools} ctaLabel="Add Liquidity" /> */}
      </Box>

    </VStack>
  )
}

export default Vaults