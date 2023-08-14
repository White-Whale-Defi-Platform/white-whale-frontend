import { Text } from '@chakra-ui/react'

type Props = {
  message: string | null | undefined
  show: boolean
}

const ShowError = ({ message, show }: Props) => {
  if (!show) {
    return null
  }
  return (
    <Text color="red" fontSize={12}>
      {message}
    </Text>
  )
}

export default ShowError
