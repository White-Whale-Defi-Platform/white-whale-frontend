import { TokenItemState } from '../lpAtoms';
import { useMemo } from 'react'
import { createWithdrawMsg, createWithdrawExecuteMsgs } from './createWithdrawMsgs'
import { num, toChainAmount } from 'libs/num';
import { useRecoilValue } from 'recoil';
import { walletState } from 'state/atoms/walletAtoms';
import { useTransaction } from './useTransaction'

type Props = {
    token: TokenItemState;
    contract: string;
    swapAddress: string
}

const useWithdraw = ({ token, contract, swapAddress }: Props) => {
    const { address, client } = useRecoilValue(walletState)

    const amount = toChainAmount(token?.amount)

    const { msgs, encodedMsgs } = useMemo(() => {
        if (parseFloat(amount) === 0 || contract === null) return {};

        return {
            msgs: createWithdrawMsg({
                contract,
                amount,
                swapAddress
            }),
            encodedMsgs: createWithdrawExecuteMsgs({
                swapAddress,
                contract,
                amount
            }, address)
        }
    }, [amount, contract]);

    return useTransaction({
        enabled: !!encodedMsgs,
        msgs,
        encodedMsgs,
        amount,
        swapAddress,
        senderAddress: address,
        lpTokenAddress: contract,
        client,
    })
}

export default useWithdraw