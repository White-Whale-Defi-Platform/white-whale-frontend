import { CalendarIcon } from '@chakra-ui/icons'
import { Box, HStack, Input as ChakraInput, InputGroup, InputRightElement, Stack, Text } from '@chakra-ui/react'
import Input from 'components/AssetInput/Input'
import SubmitButton from 'components/SubmitButton'
import { TooltipWithChildren } from 'components/TooltipWithChildren'
import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useRecoilValue } from 'recoil'
import { txAtom } from 'state/atoms/tx'
import { TxStep } from 'types/common'
import { walletState, WalletStatusType } from '../../../state/atoms/walletAtoms'
import useEpoch from './hooks/useEpoch'
import { useOpenFlow } from './hooks/useOpenFlow'

const defaultToken = {
  tokenSymbol: "WHALE",
  amount: ""
}

type Props = {
  poolId: string
}

const Create = ({ poolId }: Props) => {

  const [token, setToken] = useState(defaultToken)
  const { control, handleSubmit, setValue, getValues, formState: { isValid }, watch } = useForm({
    mode: 'onChange',
    defaultValues: {
      token,
      startDate: "",
      endDate: ""
    },
  })
  const formData = watch()

  const { status } = useRecoilValue(walletState)
  const isConnected = status === WalletStatusType.connected
  const { txStep } = useRecoilValue(txAtom)
  const { simulate, submit, tx } = useOpenFlow({ poolId, ...formData })

  const { dateToEpoch, currentEpoch } = useEpoch(poolId)

  return (
    <Stack
      as="form"
      gap="5"
      onSubmit={handleSubmit(() => submit())}
    >

      <Input
        name="token"
        control={control}
        token={token}
        showList={true}
        // isDisabled={isInputDisabled || !tokenB?.tokenSymbol}
        onChange={(value) => {
          setToken({
            ...value,
            amount: String(value.amount)
          })
          return value
        }}
      />

      <HStack w="full" gap="10">

        <Box w="100px" >
          <TooltipWithChildren
            label="Start Date"
            fontSize="16"
          >
            Start Date
          </TooltipWithChildren>
        </Box>

        <Controller
          name="startDate"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <InputGroup >
              <ChakraInput
                {...field}
                color="white"
                placeholder='Enter amount'
                h="50px"
                type="datetime-local"
                min={new Date().toISOString().slice(0, 16)}
              // max="2017-06-30T16:30"
              />
            </InputGroup>
          )}
        />

      </HStack>

      <HStack w="full" gap="10">

        <Box w="100px" >
          <TooltipWithChildren
            label="End Date"
            fontSize="16"
          >
            End Date
          </TooltipWithChildren>
        </Box>


        <Controller
          name="endDate"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <InputGroup >
              <ChakraInput
                {...field}
                color="white"
                placeholder='Enter amount'
                h="50px"
                type="datetime-local"
                min={new Date().toISOString().slice(0, 16)}
              />
            </InputGroup>
          )}
        />
      </HStack>

      {/* <HStack justifyContent="space-between" w="full">
        <Text>Current epoch : { currentEpoch }</Text>
        <Text>Start epoch : {dateToEpoch(formData.startDate) }</Text>
        <Text>End epoch : { dateToEpoch(formData.endDate)  }</Text>
      </HStack> */}

      <SubmitButton
        label={simulate.buttonLabel || "Submit"}
        isConnected={true}
        txStep={TxStep?.Ready}
        isLoading={txStep === TxStep.Estimating || txStep === TxStep.Posting || txStep === TxStep.Broadcasting}
        isDisabled={!isValid || txStep !== TxStep.Ready || !isConnected}
      />

    </Stack>
  )
}

export default Create