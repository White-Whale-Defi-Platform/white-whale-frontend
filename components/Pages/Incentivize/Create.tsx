import { HStack, Stack, Text, InputGroup, Button, Input as ChakraInput, InputRightElement, Box } from '@chakra-ui/react'
import React, { useState } from 'react'
import Input from 'components/AssetInput/Input'
import { Controller, useForm } from 'react-hook-form'
import { TooltipWithChildren } from 'components/TooltipWithChildren'
import SubmitButton from 'components/SubmitButton'
import { TokenItemState, TxStep } from 'types/common'
import { createAsset, isNativeAsset } from 'services/asset'
import { useOpenFlow } from './hooks/useOpenFlow'
import { useRecoilValue } from 'recoil'
import { walletState, WalletStatusType } from '../../../state/atoms/walletAtoms'


type Props = {}

const defaultToken = {
  tokenSymbol: "WHALE",
  amount: ""
}

const Create = (props: Props) => {



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

  const {simulate, submit, tx, isLoading} = useOpenFlow({ poolId: "WILLyz-WHALE", ...formData })

  console.log({ tx, simulate, submit })

  const onSubmit = (data) => {
    console.log({ data })
  }


  return (
    <Stack
      as="form"
      gap="5"
      onSubmit={handleSubmit(submit)}
    >

      <Input
        name="token"
        control={control}
        token={token}
        showList={true}
        // isDisabled={isInputDisabled || !tokenB?.tokenSymbol}
        onChange={(value) => {
          // setReverse(true)
          // onInputChange(value, 1)
          console.log({ value })
          setToken({
            ...value,
            amount: Number(value.amount)
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

        {/* <InputGroup >
          <ChakraInput placeholder='Enter amount' h="50px" type="datetime-local" />
          <InputRightElement w="fit-content" h="full" pr="3">
            <Button variant="outline" size="sm">
              Current time
            </Button>
          </InputRightElement>
        </InputGroup> */}

        <Controller
          name="startDate"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <InputGroup >
              <ChakraInput
                {...field}
                placeholder='Enter amount'
                h="50px"
                type="datetime-local"
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
                placeholder='Enter amount'
                h="50px"
                type="datetime-local"
              />
            </InputGroup>
          )}
        />
        {/* <ChakraInput placeholder='Enter amount' h="50px" type="datetime-local" /> */}

      </HStack>

      <SubmitButton
        label="Submit"
        isConnected={true}
        txStep={TxStep?.Ready}
        isLoading={isLoading}
        isDisabled={!isValid || simulate.data == null || !isConnected}
      // isDisabled={!isValid}
      />

    </Stack>
  )
}

export default Create