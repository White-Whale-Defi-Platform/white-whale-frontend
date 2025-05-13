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
  Container,
  Flex,
  Icon,
  Divider,
  Badge,
  Card,
  CardBody,
  useColorModeValue,
} from '@chakra-ui/react'
import { useChain } from '@cosmos-kit/react-lite'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'
import { useClients } from '../../hooks/useClients'
import { createGasFee } from '../../services/treasuryService'
import { createExecuteMessage } from '../../util/messages'
import { MsgUndelegate } from 'migaloojs/dist/codegen/alliance/alliance/tx'
import { FiAlertTriangle, FiArrowRight, FiExternalLink, FiHelpCircle } from 'react-icons/fi'

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
  const bgColor = useColorModeValue('whiteAlpha.200', 'whiteAlpha.200')
  const cardBg = useColorModeValue('whiteAlpha.100', 'whiteAlpha.100')
  const borderColor = useColorModeValue('whiteAlpha.300', 'whiteAlpha.300')

  const tmpaddress = address
  useEffect(() => {
    if (chainId !== 'migaloo-1') {
      router.push(`/${chainName}/pools`)
    }
    if (tmpaddress !== address) {
      router.reload()
    }
  }, [chainId, router, address, tmpaddress])

  const requeryData = async () => {
    if (!address) return

    try {
      // Fetch regular delegations
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

      // Fetch Restake delegations
      if (cosmWasmClient) {
        const restakeResponse = await cosmWasmClient.queryContractSmart(RESTAKE_CONTRACT, {
          all_staked_balances: {
            address: address
          }
        })

        if (restakeResponse) {
          const restakeDelegationAmount = restakeResponse
            .filter(delegation => parseInt(delegation.balance) > 0)
            .map(delegation => ({
              asset: delegation.asset.native,
              amount: delegation.balance,
            }))
          setRestakeDelegations(restakeDelegationAmount)
        }
      }

      // Fetch Alliance delegations
      const allianceResponse = await fetch(
        `https://migaloo-api.polkachu.com/terra/alliances/delegations/${address}`
      )
      const allianceData = await allianceResponse.json()
      if (allianceData.delegations) {
        let delegationAmount = allianceData.delegations.map(delegation => {
            return {
              validator: delegation.delegation.validator_address,
              amount: delegation.balance.amount,
              denom: delegation.balance.denom
            }
        })
        delegationAmount = delegationAmount.filter(delegation => delegation !== undefined)
        setAllianceDelegations(delegationAmount)
      }
    } catch (error) {
      console.error('Error requerying data:', error)
    }
  }

  // Initial data fetching when component loads or wallet address changes
  useEffect(() => {
    if (isWalletConnected && address) {
      requeryData()
    }
  }, [address, isWalletConnected, cosmWasmClient])

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

      // Wait 5 seconds before requerying
      setTimeout(requeryData, 2000)
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

      // Wait 5 seconds before requerying
      setTimeout(requeryData, 2000)
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

      // Wait 5 seconds before requerying
      setTimeout(requeryData, 2000)
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
    <Container maxW="container.xl" py={12}>
      <VStack spacing={12} align="stretch">
        <Box textAlign="center" position="relative">
          <Heading
            size="2xl"
            mb={6}
            color="white"
            fontWeight="extrabold"
          >
            Migaloo Migration Guide
          </Heading>
          <Text fontSize="xl" color="whiteAlpha.900" maxW="2xl" mx="auto">
            Important information about migrating your assets from Migaloo chain
          </Text>
        </Box>

        <Alert
          status="warning"
          borderRadius="xl"
          bg={bgColor}
          color="white"
          p={6}
          border="1px solid"
          borderColor={borderColor}
          boxShadow="lg"
        >
          <AlertIcon as={FiAlertTriangle} boxSize="24px" color="yellow.400" />
          <Box ml={4}>
            <AlertTitle fontSize="lg" mb={2}>Important Notice</AlertTitle>
            <AlertDescription fontSize="md">
              The Migaloo chain will be discontinued. Please follow these steps to migrate your assets.
            </AlertDescription>
          </Box>
        </Alert>

        <Card bg={bgColor} borderRadius="xl" border="1px solid" borderColor={borderColor} boxShadow="lg">
          <CardBody p={8}>
            <VStack spacing={8} align="stretch">
              <Heading size="md" color="white" mb={4}>Migration Steps</Heading>

              {[
                {
                  title: "1. Withdraw from Pools",
                  description: "Withdraw your assets from all liquidity pools on Migaloo chain. And WHALE paired Assets on other chains and send these to Migaloo.",
                  action: {
                    text: "Go to Pools",
                    onClick: () => router.push('/migaloo/pools')
                  }
                },
                {
                  title: "2. Unbond bWHALE and ampWHALE",
                  description: "Unstake your bWHALE and ampWHALE tokens from the bonding contracts on all chains and send them to your wallet on the migaloo chain.",
                  action: {
                    text: "Go to Bonding",
                    onClick: () => router.push('/migaloo/bonding')
                  }
                },
                {
                  title: "3. Unstake LST Assets",
                  description: "Use Backbonelabs for bWHALE-LST and Eris for ampWHALE-LST unstaking. This will take 21 days to complete.",
                  externalLinks: [
                    {
                      text: "Go to Backbonelabs",
                      href: "https://app.backbonelabs.io/liquid-staking/gravedigger/migaloo-1"
                    },
                    {
                      text: "Go to Eris",
                      href: "https://www.erisprotocol.com/migaloo/amplifier/WHALE"
                    }
                  ]
                },
                {
                  title: "4. Unstake WHALE from the Chain",
                  description: "Unstake your WHALE tokens from the chain.",
                  customContent: delegations.length > 0 ? (
                    <VStack align="stretch" mt={2}>
                      <Badge colorScheme="green" p={2} borderRadius="md" width="fit-content">
                        {delegations.length} active delegations found
                      </Badge>
                      <Button
                        colorScheme="green"
                        onClick={handleUnstake}
                        isLoading={isLoading}
                        loadingText="Processing..."
                        rightIcon={<FiArrowRight />}
                        width="fit-content"
                        minWidth="200px"
                      >
                        Unstake All WHALE
                      </Button>
                    </VStack>
                  ) : (
                    <Text color="whiteAlpha.800" mt={2}>
                      {!isWalletConnected ? "Please connect your wallet first" : "No active delegations found"}
                    </Text>
                  )
                },
                {
                  title: "5. Unstake Assets from Restake",
                  description: "Unstake your Assets from Restake.",
                  customContent: restakeDelegations.length > 0 ? (
                    <Button
                      colorScheme="green"
                      onClick={handleRestakeUnstake}
                      isLoading={isRestakeLoading}
                      loadingText="Processing..."
                      rightIcon={<FiArrowRight />}
                      width="fit-content"
                      minWidth="200px"
                    >
                      Unstake All from Restake
                    </Button>
                  ) : (
                    <Text color="whiteAlpha.800" mt={2}>
                      {!isWalletConnected ? "Please connect your wallet first" : "No active Restake delegations found"}
                    </Text>
                  )
                },
                {
                  title: "6. Unstake from Alliance",
                  description: "Unstake your assets from alliance delegations.",
                  customContent: allianceDelegations.length > 0 ? (
                    <Button
                      colorScheme="green"
                      onClick={handleAllianceUnstake}
                      isLoading={isAllianceLoading}
                      loadingText="Processing..."
                      rightIcon={<FiArrowRight />}
                      width="fit-content"
                      minWidth="200px"
                    >
                      Unstake All from Alliance
                    </Button>
                  ) : (
                    <Text color="whiteAlpha.800" mt={2}>
                      {!isWalletConnected ? "Please connect your wallet first" : "No active alliance delegations found"}
                    </Text>
                  )
                },
                {
                  title: "7. Move IBC Assets to Native Chain",
                  description: "Transfer any remaining IBC assets (tokens from other chains) back to their native chains. This includes any tokens you've bridged to Migaloo from other chains. You can use TFM.com, go.skip.build or the internal wallet options.",
                  action: {
                    text: "Go to TFM.com Transfer",
                    onClick: () => window.open('https://tfm.com/bridge?chainFrom=migaloo-1&chainTo=', '_blank'),
                    icon: <FiExternalLink />
                  }
                }
              ].map((step, index) => (
                <Box key={index}>
                  <Flex
                    bg={cardBg}
                    p={6}
                    borderRadius="lg"
                    border="1px solid"
                    borderColor={borderColor}
                    direction="column"
                    gap={4}
                  >
                    <Heading size="md" color="white" display="flex" alignItems="center" gap={2}>
                      {step.title}
                    </Heading>
                    <Text color="whiteAlpha.900" fontSize="sm">{step.description}</Text>
                    {step.action && (
                      <Button
                        colorScheme="green"
                        onClick={step.action.onClick}
                        rightIcon={step.action.icon || <FiArrowRight />}
                        width="fit-content"
                        minWidth="200px"
                      >
                        {step.action.text}
                      </Button>
                    )}
                    {step.externalLinks && (
                      <HStack spacing={4}>
                        {step.externalLinks.map((link, idx) => (
                          <Button
                            key={idx}
                            colorScheme="green"
                            onClick={() => window.open(link.href, '_blank')}
                            rightIcon={<FiExternalLink />}
                            as="a"
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            width="fit-content"
                            minWidth="180px"
                          >
                            {link.text}
                          </Button>
                        ))}
                      </HStack>
                    )}
                    {step.customContent}
                  </Flex>
                  {index < 6 && <Divider my={6} borderColor={borderColor} />}
                </Box>
              ))}
            </VStack>
          </CardBody>
        </Card>

        <Card bg={bgColor} borderRadius="xl" border="1px solid" borderColor={borderColor} boxShadow="lg">
          <CardBody p={8}>
            <VStack spacing={6} align="stretch">
              <Heading size="lg" color="white" display="flex" alignItems="center" gap={2}>
                <Icon as={FiHelpCircle} />
                Need Help?
              </Heading>
              <Text color="whiteAlpha.900" fontSize="lg">
                If you need assistance with the migration process, please join our Discord community.
              </Text>
              <Button
                colorScheme="green"
                onClick={() => window.open('https://discord.gg/Kdwx7pWR3s', '_blank')}
                rightIcon={<FiExternalLink />}
                width="fit-content"
                minWidth="200px"
                size="lg"
              >
                Join Discord
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  )
}

export default Migration
