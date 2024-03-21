import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import {
  Box,
  Input as ChakraInput,
  Divider,
  HStack,
  InputGroup,
  Spacer,
  Stack,
  Text,
  useMediaQuery,
} from '@chakra-ui/react'
import { useChain } from '@cosmos-kit/react-lite'
import Input from 'components/AssetInput/Input'
import { useOpenFlow } from 'components/Pages/Trade/Incentivize/hooks/useOpenFlow'
import SubmitButton from 'components/SubmitButton'
import { TooltipWithChildren } from 'components/TooltipWithChildren'
import { WHALE_TOKEN_SYMBOL } from 'constants/index'
import dayjs from 'dayjs'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'
import { txRecoilState } from 'state/txRecoilState'
import { TxStep } from 'types/common'

const defaultToken = {
  tokenSymbol: WHALE_TOKEN_SYMBOL,
  amount: 0,
  decimals: 6,
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

  const { walletChainName } = useRecoilValue(chainState)
  const { isWalletConnected } = useChain(walletChainName)
  const { txStep } = useRecoilValue(txRecoilState)
  const [isMobile] = useMediaQuery('(max-width: 640px)')
  const { simulate, submit } = useOpenFlow({ poolId,
    ...formData })

  const startDate = formData.startDate === '' ? dayjs() : dayjs(formData.startDate)
  const endDateMinimum = startDate.add(1, 'day')
  const startDateInvalid = startDate.isBefore(dayjs(), 'day')

  return (
    <Stack as="form" gap="5" onSubmit={handleSubmit(() => submit())}>
      <Input
        name="token"
        control={control}
        token={token}
        showList={true}
        mobile={isMobile}
        onChange={(value) => {
          setToken({
            ...value,
            amount: value.amount || 0,
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
                min={dayjs().format('YYYY-MM-DD')}
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
                min={endDateMinimum.
                  format('YYYY-MM-DD')}
                focusBorderColor="brand.500"
              />
            </InputGroup>
          )}
        />
      </HStack>

      <Divider opacity="0.2" paddingY={'2'}/>
      <HStack justifyContent="space-between">
        <Text color="whiteAlpha.600">Fee</Text>
        <Spacer />
        <Text>1000</Text>
        <Text fontSize={12}>WHALE</Text>
      </HStack>

      <SubmitButton
        label={(startDateInvalid && 'Start date invalid') || simulate.buttonLabel || 'Submit'}
        isConnected={true}
        txStep={TxStep?.Ready}
        isLoading={
          txStep === TxStep.Estimating ||
          txStep === TxStep.Posting ||
          txStep === TxStep.Broadcasting
        }
        isDisabled={!isValid || txStep !== TxStep.Ready || !isWalletConnected || startDateInvalid}
      />
    </Stack>
  )
}

export default Create
