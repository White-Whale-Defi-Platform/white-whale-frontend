import { toChainAmount } from 'libs/num';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { walletState } from 'state/atoms/walletAtoms';
import { TokenItemState } from '../lpAtoms';
import { createWithdrawExecuteMsgs, createWithdrawMsg } from './createWithdrawMsgs';
import { useTransaction } from './useTransaction';

type Props = {
    token: TokenItemState;
    contract: string;
    swapAddress: string
    poolId: string
}

const useWithdraw = ({ token, contract, swapAddress, poolId }: Props) => {
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
        poolId,
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