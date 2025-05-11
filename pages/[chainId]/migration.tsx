import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import {
  Box,
  Heading,
  Text,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  HStack,
  useToast,
} from '@chakra-ui/react'
import { useChain } from '@cosmos-kit/react-lite'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'
import { useClients } from '../../hooks/useClients'
import { createGasFee } from '../../services/treasuryService'
import { createExecuteMessage } from '../../util/messages'
import { MsgUndelegate } from 'migaloojs/dist/codegen/alliance/alliance/tx'

interface Delegation {
  validator: string
  amount: string
}

interface RestakeDelegation {
  asset: string
  amount: string
}

interface AllianceDelegation {
  validator: string
  amount: string
  denom: string
}

interface DelegationResponse {
  delegation_responses: Array<{
    delegation: {
      delegator_address: string
      validator_address: string
      shares: string
    }
    balance: {
      denom: string
      amount: string
    }
  }>
}

const RESTAKE_CONTRACT = 'migaloo190qz7q5fu4079svf890h4h3f8u46ty6cxnlt78eh486k9qm995hquuv9kd'

const Migration = () => {
  const router = useRouter()
  const { chainId, chainName } = useRecoilValue(chainState)
  const { isWalletConnected, address } = useChain('migaloo')
  const { signingClient, cosmWasmClient } = useClients("migaloo")
  const [delegations, setDelegations] = useState<Delegation[]>([])
  const [restakeDelegations, setRestakeDelegations] = useState<RestakeDelegation[]>([])
  const [allianceDelegations, setAllianceDelegations] = useState<AllianceDelegation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRestakeLoading, setIsRestakeLoading] = useState(false)
  const [isAllianceLoading, setIsAllianceLoading] = useState(false)
  const toast = useToast()

  const tmpaddress = address
  useEffect(() => {
    if (chainId !== 'migaloo-1') {
      router.push(`/${chainName}/pools`)
    }
    if (tmpaddress !== address) {
      router.reload()
    }
  }, [chainId, router, address, tmpaddress])

  useEffect(() => {
    const fetchDelegations = async () => {
      if (!address) return

      try {
        const response = await fetch(
          `https://migaloo-api.polkachu.com/cosmos/staking/v1beta1/delegations/${address}`
        )
        const data: DelegationResponse = await response.json()

        if (data.delegation_responses) {
          const delegationAmount = data.delegation_responses
            .filter(delegation => delegation.balance.denom === 'uwhale')
            .map(delegation => ({
              validator: delegation.delegation.validator_address,
              amount: delegation.balance.amount
            }))

          setDelegations(delegationAmount)
        }
      } catch (error) {
        console.error('Error fetching delegations:', error)
        toast({
          title: 'Error',
          description: 'Failed to fetch delegations',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    }

    if (isWalletConnected && address) {
      fetchDelegations()
    }
  }, [address, isWalletConnected, toast])

  useEffect(() => {
    const fetchRestakeDelegations = async () => {
      if (!address || !cosmWasmClient) return

      try {
        const response = await cosmWasmClient.queryContractSmart(RESTAKE_CONTRACT, {
          all_staked_balances: {
            address: address
          }
        })

        if (response) {
          const restakeDelegationAmount = response
            .filter(delegation => parseInt(delegation.balance) > 0)
            .map(delegation => ({
              asset: delegation.asset.native,
              amount: delegation.balance,
            }))
          setRestakeDelegations(restakeDelegationAmount)
        }
      } catch (error) {
        console.error('Error fetching Restake delegations:', error)
        toast({
          title: 'Error',
          description: 'Failed to fetch Restake delegations',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    }

    if (isWalletConnected && address) {
      fetchRestakeDelegations()
    }
  }, [address, isWalletConnected, cosmWasmClient, toast])

  useEffect(() => {
    const fetchAllianceDelegations = async () => {
      if (!address) return

      try {
        const response = await fetch(
          `https://migaloo-api.polkachu.com/terra/alliances/delegations/${address}`
        )
        const data = await response.json()
        if (data.delegations) {
          let delegationAmount = data.delegations.map(delegation => {
            if (delegation.balance.amount > 10) {
              return {
                validator: delegation.delegation.validator_address,
                amount: delegation.balance.amount,
                denom: delegation.balance.denom
              }
            }
          })
          delegationAmount = delegationAmount.filter(delegation => delegation !== undefined)
          setAllianceDelegations(delegationAmount)
        }
      } catch (error) {
        console.error('Error fetching alliance delegations:', error)
        toast({
          title: 'Error',
          description: 'Failed to fetch alliance delegations',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    }

    if (isWalletConnected && address) {
      fetchAllianceDelegations()
    }
  }, [address, isWalletConnected, toast])

  const handleUnstake = async () => {
    if (!address || !signingClient) return

    setIsLoading(true)
    try {
      const messages = delegations.map(delegation => ({
        typeUrl: '/cosmos.staking.v1beta1.MsgUndelegate',
        value: {
          delegatorAddress: address,
          validatorAddress: delegation.validator,
          amount: {
            denom: 'uwhale',
            amount: delegation.amount
          }
        }
      }))

      const gas = await createGasFee(signingClient, address, messages)

      const result = await signingClient.signAndBroadcast(address, messages, gas)

      toast({
        title: 'Success',
        description: 'Unstaking transaction submitted successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Error unstaking:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit unstaking transaction',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestakeUnstake = async () => {
    if (!address || !signingClient) return

    setIsRestakeLoading(true)
    try {
      const messages = restakeDelegations.map(delegation => ({
        typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
        value: {
          sender: address,
          contract: RESTAKE_CONTRACT,
          msg: {
            "unstake": {
              "info": {
                "native": delegation.asset
              },
              "amount": delegation.amount
            }
          },
          funds: []
        }
      }))

      const messages2 = messages.map(message => createExecuteMessage({senderAddress: address, contractAddress: RESTAKE_CONTRACT, message: message.value.msg}))
      const gas = await createGasFee(signingClient, address, messages2)

      const result = await signingClient.signAndBroadcast(address, messages2, gas)

      toast({
        title: 'Success',
        description: 'Restake unstaking transaction submitted successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Error unstaking from Restake:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit Restake unstaking transaction',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsRestakeLoading(false)
    }
  }

  const handleAllianceUnstake = async () => {
    if (!address || !signingClient) return

    setIsAllianceLoading(true)
    try {

      const allMessages = allianceDelegations.map(delegation => (
        {
          typeUrl: '/alliance.alliance.MsgUndelegate',
          value: MsgUndelegate.fromPartial({
            delegatorAddress: address,
            validatorAddress: delegation.validator,
            amount: {
              denom: delegation.denom,
              amount: delegation.amount
            }
          })
        }
      ))


      const gas = await createGasFee(signingClient, address, allMessages)

      const result = await signingClient.signAndBroadcast(address, allMessages, gas)

      toast({
        title: 'Success',
        description: `Alliance unstaking transaction submitted successfully for ${allMessages.length} delegations`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Error unstaking from alliance:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit alliance unstaking transaction',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsAllianceLoading(false)
    }
  }

  if (chainId !== 'migaloo-1') {
    return null
  }

  return (
    <Box width="full" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="xl" mb={4} color="white">Migaloo Migration Guide</Heading>
          <Text fontSize="lg" color="white">
            Important information about migrating your assets from Migaloo chain
          </Text>
        </Box>

        <Alert status="warning" borderRadius="md" bg="whiteAlpha.200" color="white">
          <AlertIcon color="yellow.400" />
          <Box>
            <AlertTitle>Important Notice</AlertTitle>
            <AlertDescription>
              The Migaloo chain will be discontinued. Please follow these steps to migrate your assets.
            </AlertDescription>
          </Box>
        </Alert>

        <Box bg="whiteAlpha.200" p={6} borderRadius="lg" boxShadow="sm">
          <VStack spacing={6} align="stretch">
            <Heading size="md" color="white">Migration Steps</Heading>

            <Box>
              <Heading size="sm" mb={2} color="white">1. Withdraw from Pools</Heading>
              <Text color="white">Withdraw your assets from all liquidity pools on Migaloo chain. And WHALE paired Assets on other chains and send these to Migaloo.</Text>
              <Button
                mt={2}
                colorScheme="green"
                onClick={() => router.push('/migaloo/pools')}
                width="fit-content"
                minWidth="200px"
              >
                Go to Pools
              </Button>
            </Box>

            <Box>
              <Heading size="sm" mb={2} color="white">2. Unstake bWHALE and ampWHALE</Heading>
              <Text color="white">Unstake your bWHALE and ampWHALE tokens from the bonding contracts on all chains and send them to your wallet on the migaloo chain.</Text>
              <Button
                mt={2}
                colorScheme="green"
                onClick={() => router.push('/migaloo/bonding')}
                width="fit-content"
                minWidth="200px"
              >
                Go to Bonding
              </Button>
            </Box>

            <Box>
              <Heading size="sm" mb={2} color="white">3. Unstake LST Assets</Heading>
              <Text color="white">Use Backbonelabs for bWHALE-LST and Eris for ampWHALE-LST unstaking.</Text>
              <Text color="white">This will take 21 days to complete.</Text>
              <HStack mt={2} spacing={4}>
                <Button
                  colorScheme="green"
                  onClick={() => window.open('https://app.backbonelabs.io/liquid-staking/gravedigger/migaloo-1', '_blank')}
                  as="a"
                  href="https://app.backbonelabs.io/liquid-staking/gravedigger/migaloo-1"
                  target="_blank"
                  rel="noopener noreferrer"
                  width="fit-content"
                  minWidth="180px"
                >
                  Go to Backbonelabs
                </Button>
                <Button
                  colorScheme="green"
                  onClick={() => window.open('https://www.erisprotocol.com/migaloo/amplifier/WHALE', '_blank')}
                  as="a"
                  href="https://www.erisprotocol.com/migaloo/amplifier/WHALE"
                  target="_blank"
                  rel="noopener noreferrer"
                  width="fit-content"
                  minWidth="180px"
                >
                  Go to Eris
                </Button>
              </HStack>
            </Box>

            <Box>
              <Heading size="sm" mb={2} color="white">4. Unstake WHALE from the Chain</Heading>
              <Text color="white">Unstake your WHALE tokens from the chain.</Text>
              {delegations.length > 0 ? (
                <VStack align="stretch" mt={2}>
                  <Text color="white">Found {delegations.length} active delegations:</Text>
                  <Button
                    colorScheme="green"
                    onClick={handleUnstake}
                    isLoading={isLoading}
                    loadingText="Processing..."
                    width="fit-content"
                    minWidth="200px"
                  >
                    Unstake All WHALE
                  </Button>
                </VStack>
              ) : (
                <Text color="white" mt={2}>No active delegations found.</Text>
              )}
            </Box>

            <Box>
              <Heading size="sm" mb={2} color="white">5. Unstake Assets from Restake</Heading>
              <Text color="white">Unstake your Assets from Restake.</Text>
              {restakeDelegations.length > 0 ? (
                <VStack align="stretch" mt={2}>
                  <Button
                    colorScheme="green"
                    onClick={handleRestakeUnstake}
                    isLoading={isRestakeLoading}
                    loadingText="Processing..."
                    width="fit-content"
                    minWidth="200px"
                  >
                    Unstake All from Restake
                  </Button>
                </VStack>
              ) : (
                <Text color="white" mt={2}>No active Restake delegations found.</Text>
              )}
            </Box>

            <Box>
              <Heading size="sm" mb={2} color="white">6. Unstake from Alliance</Heading>
              <Text color="white">Unstake your assets from alliance delegations.</Text>
              {allianceDelegations.length > 0 ? (
                <VStack align="stretch" mt={2}>
                  <Button
                    colorScheme="green"
                    onClick={handleAllianceUnstake}
                    isLoading={isAllianceLoading}
                    loadingText="Processing..."
                    width="fit-content"
                    minWidth="200px"
                  >
                    Unstake All from Alliance
                  </Button>
                </VStack>
              ) : (
                <Text color="white" mt={2}>No active alliance delegations found.</Text>
              )}
            </Box>

            <Box>
              <Heading size="sm" mb={2} color="white">7. Move IBC Assets to Native Chain</Heading>
              <Text color="white">Transfer any remaining IBC assets (tokens from other chains) back to their native chains. This includes any tokens you've bridged to Migaloo from other chains. You can use TFM.com, go.skip.build or the internal wallet options.</Text>
              <Button
                mt={2}
                colorScheme="green"
                onClick={() => window.open('https://tfm.com/bridge?chainFrom=migaloo-1&chainTo=', '_blank')}
                as="a"
                href="https://tfm.com/bridge?chainFrom=migaloo-1&chainTo="
                target="_blank"
                rel="noopener noreferrer"
                width="fit-content"
                minWidth="200px"
              >
                Go to TFM.com Transfer
              </Button>
            </Box>
          </VStack>
        </Box>

        <Box bg="whiteAlpha.200" p={6} borderRadius="lg" boxShadow="sm">
          <VStack spacing={4} align="stretch">
            <Heading size="md" color="white">Need Help?</Heading>
            <Text color="white">
              If you need assistance with the migration process, please join our Discord community.
            </Text>
            <Button
              colorScheme="green"
              onClick={() => window.open('https://discord.gg/Kdwx7pWR3s', '_blank')}
              width="fit-content"
              minWidth="200px"
            >
              Join Discord
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Box>
  )
}

export default Migration
