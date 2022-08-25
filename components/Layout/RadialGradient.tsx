import React, { FC, useMemo } from "react";
import { Box } from "@chakra-ui/react";
import { useRecoilValue } from 'recoil'
// import { activeChain } from 'state/atoms/activeChain';
import { walletState } from "../../state/atoms/walletAtoms";

const backgrounds = {
  'pisco-1': "linear-gradient(90deg, rgba(60, 205, 100, 0.25) 2.83%, rgba(0, 117, 255, 0.25) 97.47%)",
  'uni-3': "linear-gradient(90deg, rgba(60, 205, 100, 0.25) 2.83%, rgba(255, 77, 0, 0.25) 97.47%)",
  'phoenix-1': "linear-gradient(90deg, rgba(60, 205, 100, 0.25) 2.83%, rgba(0, 117, 255, 0.25) 97.47%)",
  'juno-1': "linear-gradient(90deg, rgba(60, 205, 100, 0.25) 2.83%, rgba(255, 77, 0, 0.25) 97.47%)"
}

const RadialGradient: FC = () => {

  const { chainId } = useRecoilValue(walletState)

  const wallet = useMemo(() => {
    return backgrounds[chainId]
  }, [chainId])

  return (
    <Box
      position="absolute"
      height="718px"
      left="-131px"
      top="-314px"
      background={wallet}
      width="full"
      filter="blur(250px)"
      borderTopRightRadius="20%"
      zIndex="-1"
    />
  );
};

export default RadialGradient;
