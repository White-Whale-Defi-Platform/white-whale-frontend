import React, { useState } from 'react'

import { Box, HStack, Text, Tooltip, VStack } from '@chakra-ui/react'

export const Ratio = (number: number) => {
  const expo: string = number.toExponential(2)
  if (Number(number.toFixed(3)) != 0) {
    return (<Text align="right">{`${number.toFixed(3)}`}</Text>)
  }
  const [isLabelOpen, setIsLabelOpen] = useState(false)
  return (

    <Tooltip
      isOpen={isLabelOpen}
      sx={{ boxShadow: 'none' }}
      label={
        <VStack
          minW="100px"
          minH="fit-content"
          borderRadius="10px"
          bg="blackAlpha.900"
          boxShadow={'0px 0px 3px 3px rgba(255, 255, 255, 0.25)'}
          py="4"
          px="4"
          position="relative"
          border="none"
          justifyContent="center"
          alignItems="center">
          <>
            {<> </>}
            <React.Fragment>
              <HStack
                justify="space-between"
                direction="row"
                width="full"
                px={2}
              >
                <Text color="whiteAlpha.600" fontSize={14}>
                  {number}
                </Text>
              </HStack>
            </React.Fragment>
          </>
        </VStack>
      }
      bg="transparent"
    >
      <VStack>
        <Text mb="-0.3rem" color="white">
          {
            <HStack borderBottom={'1px dotted rgba(255, 255, 255, 0.5)'} paddingTop={'2'}>
              <Text align="right" onMouseEnter={() => setIsLabelOpen(true)}
                onMouseLeave={() => setIsLabelOpen(false)}
                onClick={() => setIsLabelOpen(!isLabelOpen)}>{expo}</Text>
            </HStack>
          }
        </Text>
        <Box pb={1}>
          {
            <div
              style={{
                width: '0px',
                height: '1px',
                background: `repeating-linear-gradient(
            to right,
            white,
            white 1px,
            transparent 1px,
            transparent 5px
          )`,
              }}
            />
          }
        </Box>
      </VStack>
    </Tooltip>
  )
}
