import { Button, HStack, Text, VStack } from '@chakra-ui/react'
import { useChains } from 'hooks/useChainInfo'
import { useRouter } from 'next/router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { walletState, WalletStatusType } from 'state/atoms/walletAtoms'

import { Vault } from './AllVaultsTable'
import VaultName from './VaultName'

type Props = {
  vaults: Vault[]
  ctaLabel?: string
}

const MobileVaults = ({ vaults, ctaLabel }: Props) => {
  const router = useRouter()
  const { chainId, status} =
    useRecoilValue(walletState)
  const chains: Array<any> = useChains()
  const currentChain = chains.find(
    (row: { chainId: string }) => row.chainId === chainId
  )
  const currentChainName = currentChain?.label.toLowerCase()
  console.log(vaults)
  return (
    <VStack width="full" display={['flex', 'flex', 'flex','none']} gap={8}>
      {vaults &&
        vaults.map((vault) => (
          <VStack
            key={vault?.vaultId}
            padding={10}
            width={['full']}
            background="#1C1C1C"
            boxShadow="0px 0px 50px rgba(0, 0, 0, 0.25)"
            borderRadius="30px"
            justifyContent="center"
          >
            <HStack width="full" justifyContent="space-between">
              <Text color="brand.50">{`Vault`}</Text>
              <Text color="brand.50">{`APR`}</Text>
            </HStack>

            <HStack width="full" justifyContent="space-between">
              <VaultName
                vaultId={vault?.vaultId}
                tokenImage={vault.tokenImage}
              />
              <Text color="brand.50">{` ${Number(vault?.apr).toFixed()}`}</Text>
            </HStack>

            <HStack height="24px" />

            <HStack width="full" justifyContent="space-between">
              <Text color="brand.50">{`Total Deposits`}</Text>
              <Text color="brand.50">{`My Deposit`}</Text>
            </HStack>

            <HStack width="full" justifyContent="space-between">
              {console.log(vault)}
              <Text>{`$ ${Number(vault?.totalDeposits).toFixed()}`}</Text>
              <Text>{`$ ${Number(vault?.myDeposit).toFixed(2)}`}</Text>
            </HStack>

            <HStack height="24px" />

            <Button
              variant="outline"
              size="sm"
              width="full"
              onClick={() => router.push(`/${currentChainName}/vaults/new_position?vault=${vault?.vaultId}`)}
            >
              {ctaLabel || 'New Position'}
            </Button>
          </VStack>
        ))}
    </VStack>
  )
}

export default MobileVaults
