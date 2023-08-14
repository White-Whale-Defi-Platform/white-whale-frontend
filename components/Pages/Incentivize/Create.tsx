import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import {
  Box,
  Input as ChakraInput,
  HStack,
  InputGroup,
  Stack,
} from '@chakra-ui/react'
import Input from 'components/AssetInput/Input'
import SubmitButton from 'components/SubmitButton'
import { TooltipWithChildren } from 'components/TooltipWithChildren'
import { useRecoilValue } from 'recoil'
import { txAtom } from 'state/atoms/tx'
import { chainState } from 'state/atoms/chainState'
import { TxStep } from 'types/common'

import { useOpenFlow } from './hooks/useOpenFlow'
import { useChain } from '@cosmos-kit/react-lite'
import { WHALE_TOKEN_SYMBOL } from 'constants/index'

const defaultToken = {
  tokenSymbol: WHALE_TOKEN_SYMBOL,
  amount: '',
}

type Props = {
  poolId: string
}

const Create = ({ poolId }: Props) => {
  const [token, setToken] = useState(defaultToken)
  const {
    control,
    handleSubmit,
    formState: { isValid },
    watch,
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      token,
      startDate: '',
      endDate: '',
    },
  })
  const formData = watch()

  const { chainName } = useRecoilValue(chainState)
  const { isWalletConnected } = useChain(chainName)
  const { txStep } = useRecoilValue(txAtom)
  const { simulate, submit } = useOpenFlow({ poolId, ...formData })

  return (
    <Stack as="form" gap="5" onSubmit={handleSubmit(() => submit())}>
      <Input
        name="token"
        control={control}
        token={token}
        showList={true}
        onChange={(value) => {
          setToken({
            ...value,
            amount: String(value.amount),
          })
          return value
        }}
      />

      <HStack w="full" gap="10">
        <Box w="100px">
          <TooltipWithChildren label="Start Date" fontSize="16">
            Start Date
          </TooltipWithChildren>
        </Box>

        <Controller
          name="startDate"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <InputGroup>
              <ChakraInput
                {...field}
                color="white"
                placeholder="Enter amount"
                h="50px"
                type="date"
                min={new Date().toISOString().slice(0, 16)}
                // Max="2017-06-30T16:30"
                focusBorderColor="brand.500"
              />
            </InputGroup>
          )}
        />
      </HStack>

      <HStack w="full" gap="10">
        <Box w="100px">
          <TooltipWithChildren label="End Date" fontSize="16">
            End Date
          </TooltipWithChildren>
        </Box>

        <Controller
          name="endDate"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <InputGroup>
              <ChakraInput
                {...field}
                color="white"
                placeholder="Enter amount"
                h="50px"
                type="date"
                min={new Date().toISOString().slice(0, 16)}
                focusBorderColor="brand.500"
              />
            </InputGroup>
          )}
        />
      </HStack>

      <SubmitButton
        label={simulate.buttonLabel || 'Submit'}
        isConnected={true}
        txStep={TxStep?.Ready}
        isLoading={
          txStep === TxStep.Estimating ||
          txStep === TxStep.Posting ||
          txStep === TxStep.Broadcasting
        }
        isDisabled={!isValid || txStep !== TxStep.Ready || !isWalletConnected}
      />
    </Stack>
  )
}

export default Create
