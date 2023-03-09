import {useEffect, useState} from 'react'
import {VStack} from '@chakra-ui/react'
import AssetInput from '../../AssetInput'
import {useRecoilState} from "recoil";
import {bondingState, BondingStatus} from "../../../state/atoms/bondingAtoms";
import {walletState, WalletStatusType} from "../../../state/atoms/walletAtoms";

const Bond = () => {

  const [currentBondingState, setCurrentBondingState] = useRecoilState(bondingState)
  const [currentWalletState, _] = useRecoilState(walletState)

  const isWalletConnected = currentWalletState.status === WalletStatusType.connected

  const [token, setToken] = useState({
    amount: currentBondingState.bondedAmpWhale,
    tokenSymbol: "ampWHALE",
  })
  const [bondedAmpWhale, setBondedAmpWhale] = useState<number>(null)
  const [bondedBWhale, setBondedBWhale] = useState<number>(null)
  const [unbondingAmpWhale, setUnbondingAmpWhale] = useState<number>(null)
  const [unbondingBWhale, setUnbondingBWhale] = useState<number>(null)
  const [withdrawableAmpWhale, setWithdrawableAmpWhale] = useState<number>(null)
  const [withdrawableBWhale, setWithdrawableBWhale] = useState<number>(null)

  useEffect(() => {
    async function fetchLSDInfo() {
      setBondedAmpWhale(345)
      setBondedBWhale(1345)
      setUnbondingAmpWhale(234)
      setUnbondingBWhale(4234)
      setWithdrawableAmpWhale(4637)
      setWithdrawableBWhale(8383)
    }

    if (currentBondingState.status === BondingStatus.uninitialized && isWalletConnected) {
      fetchLSDInfo()
      setCurrentBondingState({
        status: BondingStatus.available,
        edgeTokenList: ["ampWHALE", "bWHALE"],
        bondedAmpWhale: bondedAmpWhale,
        bondedBWhale: bondedBWhale,
        unbondingAmpWhale: unbondingAmpWhale,
        unbondingBWhale: unbondingBWhale,
        withdrawableAmpWhale: withdrawableAmpWhale,
        withdrawableBWhale: withdrawableBWhale,
      })
    } else {
      setBondedAmpWhale(currentBondingState.bondedAmpWhale)
      setBondedBWhale(currentBondingState.bondedBWhale)
      setUnbondingAmpWhale(currentBondingState.unbondingAmpWhale)
      setUnbondingBWhale(currentBondingState.unbondingBWhale)
      setWithdrawableAmpWhale(currentBondingState.withdrawableAmpWhale)
      setWithdrawableBWhale(currentBondingState.withdrawableBWhale)
    }
  }, [isWalletConnected])

  return <VStack
    px={7}
    width="full">
    <AssetInput
      value={token}
      token={token}
      disabled={false}
      minMax={true}
      balance={token.amount}
      showList={true}
      edgeTokenList={currentBondingState.edgeTokenList}
      onChange={(value) => setToken(value)}
    />
  </VStack>
}

export default Bond
