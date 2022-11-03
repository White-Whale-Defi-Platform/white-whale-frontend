import React from 'react'
import useVolume from 'hooks/useVolume'
import { Spinner, Text, Box } from '@chakra-ui/react'
import { formatPrice } from '../../../libs/num'

type Props = {
    pair: string;
    datetime: string;

}


const Volume = ({ pair, datetime }: Props) => {

    if(!pair || !datetime) return null

    const { volume, isLoading } = useVolume({pair, datetime})

    if (isLoading) return <Spinner color="white" size="xs" float="right"/>


    return <Text align="right">${formatPrice(volume)}</Text>



}

export default Volume