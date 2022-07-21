import React from 'react'
import Swap from 'components/Pages/Swap'
// import { TokenSwapModule } from '../features/swap'
// import { useTokenToTokenPrice } from 'components/Pages/Swap'

function getInitialTokenPairFromSearchParams() {
  const params = new URLSearchParams(location.search)
  const from = params.get('from')?.toUpperCase()
  const to = params.get('to')?.toUpperCase()
  return from || to ? ([from, to] as const) : undefined
}

const SwapPage = () => {
  // function getInitialTokenPairFromSearchParams() {
  //   const params = new URLSearchParams(location.search)
  //   const from = params.get('from')?.toUpperCase()
  //   const to = params.get('to')?.toUpperCase()
  //   return from || to ? ([from, to] as const) : undefined
  // }

    /* fetch token to token price */
   
  return (
    <>
    <Swap initialTokenPair={getInitialTokenPairFromSearchParams()} />
    {/* <TokenSwapModule initialTokenPair={getInitialTokenPairFromSearchParams()} */}
    </>

  )
}

export default SwapPage

// import React, { useState, useMemo, useCallback } from 'react'
// import { HStack, VStack, Text, Button, IconButton } from '@chakra-ui/react'
// import DoubleArrowsIcon from "components/icons/DoubleArrowsIcon";
// import SwapSettings from 'components/Layout/SwapSettings'
// import { Controller, useForm } from "react-hook-form";
// import Page from 'components/Page';
// import AssetInput from 'components/AssetInput';
// import { NextPage } from 'next';
// import {Asset} from 'types/blockchain'

// export const tokens = [
//     {
//         asset: "JUNOX",
//         icon: "/juno.svg",
//         contract: "3fdss1234",
//         amount: '',
//         balance: 50
//     },
//     {
//         asset: "JUNOONE",
//         icon: "/junoone.svg",
//         contract: "adfa12342242",
//         amount: '',
//         balance: 40
//     }
// ]

// // const useSimulate = (swapTokens) => {

// //     const [asset1, asset2] = swapTokens

// //     if (!asset1?.amount) return

// //     return [asset1, { ...asset2, amount: Number(asset1?.amount) * Number(asset2?.amount) }]
// // }

// interface SwapPage {

// }

// const SwapPage:NextPage<Asset> = () => {


//     const [swapTokens, setSwapTokens] = useState<Asset[]>(tokens)


//     // const simulate = useSimulate(swapTokens)

//     const { control, handleSubmit, formState, setValue, getValues } = useForm({
//         mode: "onChange",
//         defaultValues: {
//             token1: tokens?.[0],
//             token2: tokens?.[1],
//             //   slippage: String(DEFAULT_SLIPPAGE),
//         },
//     });

//     const [token1, token2] = useMemo(() => swapTokens, [swapTokens])


//     const onReverse = useCallback(() => {
//         const { token1: t1, token2: t2 } = getValues()

//         setValue("token1", t2, { shouldValidate: true })
//         setValue("token2", t1, { shouldValidate: true })
//         setSwapTokens([
//             { ...token2, ...t2 },
//             { ...token1, ...t1 }
//         ])
//     }, [])

//     const onInputChange = (value:Asset, index:number) => {
//         const newState = { ...swapTokens }
//         newState[index] = { ...swapTokens[index], ...value }
//         setSwapTokens(newState)
//         console.log({value, newState })
//     }
    
//     const onSubmit = (data) => console.log(data)

//     return (
//         <Page>


//             <VStack width={700} justifyContent="center" className='testing'>
//                 <HStack justifyContent="space-between" width="full" paddingY={10} paddingX={4}>
//                     <Text as="h2" fontSize="24" fontWeight="900">
//                         Swap
//                     </Text>
//                     <SwapSettings />

//                 </HStack>

//                 <VStack padding={10}
//                     width="full"
//                     background="#1C1C1C"
//                     boxShadow="0px 0px 50px rgba(0, 0, 0, 0.25)"
//                     borderRadius="30px"
//                     alignItems="flex-start"
//                     minH={400}
//                     maxWidth={600}
//                     gap={4}
//                     as="form"
//                     onSubmit={handleSubmit(onSubmit)}

//                 >

//                     <VStack width="full" alignItems="flex-start" paddingBottom={8}>
//                         <HStack>
//                             <Text marginLeft={4} color="brand.200" fontSize="14" fontWeight="500">Asset Input</Text>
//                             <Text fontSize="14" fontWeight="700">5.54</Text>
//                         </HStack>
//                         <Controller
//                             name="token1"
//                             control={control}
//                             rules={{ required: true }}
//                             render={({ field }) => (
//                                 <AssetInput {...field} token={token1} onChange={(value) => { onInputChange(value, 0); field.onChange(value) }} />
//                             )}
//                         />
//                     </VStack>

//                     <HStack width="full" justifyContent="center">
//                         <IconButton
//                             aria-label="Reverse"
//                             variant="ghost"
//                             color="brand.500"
//                             _focus={{ boxShadow: "none" }}
//                             _active={{ background: "transparent" }}
//                             _hover={{ background: "transparent", color: "white" }}
//                             icon={<DoubleArrowsIcon width="2rem" height="2rem" />}
//                             onClick={onReverse}
//                         />
//                     </HStack>

//                     <VStack width="full" alignItems="flex-start" paddingBottom={8}>
//                         <HStack>
//                             <Text marginLeft={4} color="brand.200" fontSize="14" fontWeight="500">Asset Input</Text>
//                             <Text fontSize="14" fontWeight="700">5.54</Text>
//                         </HStack>
//                         <Controller
//                             name="token2"
//                             control={control}
//                             rules={{ required: true }}
//                             render={({ field }) => (
//                                 <AssetInput {...field} token={token2} onChange={(value) => { onInputChange(value, 1); field.onChange(value) }} />
//                             )}
//                         />
//                     </VStack>

//                     <Button
//                         type='submit'
//                         width="full"
//                         variant="primary"
//                         disabled={!formState?.isValid}
//                     >
//                         Swap
//                     </Button>

//                 </VStack>
//             </VStack>
//         </Page>
//     )
// }

// export default SwapPage