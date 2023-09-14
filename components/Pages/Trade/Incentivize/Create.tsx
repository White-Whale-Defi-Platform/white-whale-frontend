import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import {
  Box,
  Input as ChakraInput,
  HStack,
  InputGroup,
  Stack,
  useMediaQuery,
} from '@chakra-ui/react'
import { useChain } from '@cosmos-kit/react-lite'
import Input from 'components/AssetInput/Input'
import { useOpenFlow } from 'components/Pages/Trade/Incentivize/hooks/useOpenFlow'
import SubmitButton from 'components/SubmitButton'
import { TooltipWithChildren } from 'components/TooltipWithChildren'
import { WHALE_TOKEN_SYMBOL } from 'constants/index'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'
import { txRecoilState } from 'state/txRecoilState'
import { TxStep } from 'types/common'

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
  const { txStep } = useRecoilValue(txRecoilState)
  const [isMobile] = useMediaQuery('(max-width: 640px)')
  const { simulate, submit } = useOpenFlow({ poolId,
    ...formData })

  return (
    <Stack as="form" gap="5" onSubmit={handleSubmit(() => submit())}>
      <Input
        name="token"
        control={control}
        token={token}
        showList={true}
        mobile={isMobile}
        // IsDisabled={isInputDisabled || !tokenB?.tokenSymbol}
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
                min={new Date().toISOString().
                  slice(0, 16)}
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
                min={new Date().toISOString().
                  slice(0, 16)}
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
