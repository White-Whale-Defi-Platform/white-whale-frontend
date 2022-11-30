import { Box, Text } from '@chakra-ui/react'

type Props = {
  message: string | null
}

const Error = ({ message }: Props) => {
  if (!message) return <></>
  return (
    <Box alignSelf="flex-start">
      <Text color="red">{message}</Text>
    </Box>
  )
}

export default Error
