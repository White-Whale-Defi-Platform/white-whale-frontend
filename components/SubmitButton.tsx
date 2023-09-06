import { useMemo } from 'react'

import { Button } from '@chakra-ui/react'
import { TxStep } from 'types/common'

type Props = {
  label: string
  txStep: TxStep
  isConnected: boolean
  isDisabled?: boolean
  isLoading?: boolean
  onClick?: () => void
}

const SubmitButton = ({
  label,
  txStep,
  isDisabled = false,
  isLoading = false,
  onClick,
}: Props) => {
  const _isLoading = useMemo(() => [TxStep.Estimating, TxStep.Posting, TxStep.Broadcasting].includes(txStep),
    [txStep])
  return (
    <Button
      type="submit"
      width="full"
      variant="primary"
      isLoading={isLoading || _isLoading}
      isDisabled={isDisabled}
      onClick={() => onClick?.()}
    >
      {label}
    </Button>
  )
}

export default SubmitButton
