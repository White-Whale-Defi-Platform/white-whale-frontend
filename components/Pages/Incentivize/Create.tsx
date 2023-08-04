import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import {
  Box,
  Input as ChakraInput,
  HStack,
  InputGroup,
  Stack,
  useMediaQuery,
} from '@chakra-ui/react'
import Input from 'components/AssetInput/Input'
import SubmitButton from 'components/SubmitButton'
import { TooltipWithChildren } from 'components/TooltipWithChildren'
import { useRecoilValue } from 'recoil'
import { txAtom } from 'state/atoms/tx'
import { walletState, WalletStatusType } from 'state/atoms/walletAtoms'
import { TxStep } from 'types/common'

import { useOpenFlow } from './hooks/useOpenFlow'

const defaultToken = {
  tokenSymbol: 'WHALE',
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
  const [isMobile] = useMediaQuery('(max-width: 640px)')
  const { status } = useRecoilValue(walletState)
  const isConnected = status === WalletStatusType.connected
  const { txStep } = useRecoilValue(txAtom)
  const { simulate, submit } = useOpenFlow({ poolId, ...formData })

  return (
    <Stack as="form" gap="5" onSubmit={handleSubmit(() => submit())}>
      <Input
        name="token"
        control={control}
        token={token}
        showList={true}
        mobile={isMobile}
        // isDisabled={isInputDisabled || !tokenB?.tokenSymbol}
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
                paddingEnd={'2px'}
                min={new Date().toISOString().slice(0, 16)}
                // max="2017-06-30T16:30"
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
                paddingEnd={'2px'}
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
        isDisabled={!isValid || txStep !== TxStep.Ready || !isConnected}
      />
    </Stack>
  )
}

export default Create
