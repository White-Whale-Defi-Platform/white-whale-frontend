import { Controller } from 'react-hook-form'

import { VStack } from '@chakra-ui/react'
import AssetInput from 'components/AssetInput'
import { useTokenBalance } from 'hooks/useTokenBalance'
import { TokenItemState } from 'types'

type Props = {
  name: string
  control: any
  token: any
  isDisabled?: boolean
  balance?: number
  onChange?: (value: TokenItemState) => void
  fetchBalance?: boolean
  ignoreSlack?: boolean
  showList?: boolean
  mobile?: boolean
}

const Input = ({
  name,
  control,
  token,
  isDisabled,
  onChange,
  balance,
  fetchBalance = true,
  ignoreSlack = false,
  showList = false,
  mobile,
}: Props) => {
  const { balance: tokenBalance } = useTokenBalance(token?.tokenSymbol)

  return (
    <VStack width="full" alignItems="flex-start" paddingBottom={8}>
      <Controller
        name={name}
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <AssetInput
            {...field}
            token={token}
            disabled={isDisabled}
            balance={fetchBalance ? tokenBalance : balance}
            ignoreSlack={ignoreSlack}
            showList={showList}
            mobile={mobile}
            onChange={(value) => {
              onChange(value)
              field.onChange(value)
            }}
          />
        )}
      />
    </VStack>
  )
}

export default Input
