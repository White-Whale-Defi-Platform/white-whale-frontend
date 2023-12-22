import { Button, HStack, Text, VStack } from '@chakra-ui/react'
import { kBg, kBorderRadius } from 'constants/visualComponentConstants'
import { useRouter } from 'next/router'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'

import { Vault } from './AllVaultsTable'
import VaultName from './VaultName'

type Props = {
  vaults: Vault[]
  ctaLabel?: string
}

const MobileVaults = ({ vaults, ctaLabel }: Props) => {
  const router = useRouter()
  const { chainName } = useRecoilValue(chainState)
  return (
    <VStack width="full" display={['flex', 'flex', 'flex', 'none']} gap={8}>
      {vaults &&
        vaults.map((vault) => (
          <VStack
            key={vault?.vaultId}
            padding={10}
            width={['full']}
            background={kBg}
            boxShadow="0px 0px 50px rgba(0, 0, 0, 0.25)"
            borderRadius={kBorderRadius}
            justifyContent="center"
          >
            <HStack width="full" justifyContent="space-between">
              <Text color="brand.50">{'Vault'}</Text>
              <Text color="brand.50">{'APR'}</Text>
            </HStack>

            <HStack width="full" justifyContent="space-between">
              <VaultName
                vaultId={vault?.vaultId}
                tokenImage={vault.tokenImage}
              />
              <Text color="brand.50">{`${Number(vault?.apr).toFixed(2)}`}</Text>
            </HStack>

            <HStack height="24px" />

            <HStack width="full" justifyContent="space-between">
              <Text color="brand.50">{'Total Deposits'}</Text>
              <Text color="brand.50">{'My Deposit'}</Text>
            </HStack>

            <HStack width="full" justifyContent="space-between">
              <Text>{`$ ${Number(vault?.totalDeposits).toFixed(2)}`}</Text>
              <Text>{`$ ${Number(vault?.myDeposit).toFixed(2)}`}</Text>
            </HStack>

            <HStack height="24px" />

            <Button
              variant="outline"
              size="sm"
              width="full"
              onClick={() => router.push(`/${chainName}/vaults/new_position?vault=${vault?.vaultId}`)
              }
            >
              {ctaLabel || 'New Position'}
            </Button>
          </VStack>
        ))}
    </VStack>
  )
}

export default MobileVaults
