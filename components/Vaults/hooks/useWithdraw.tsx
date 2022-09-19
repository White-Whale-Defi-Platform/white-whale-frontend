import { createWithdrawMsg, createWithdrawExecuteMsgs } from './createWithdrawMsgs'
import { useRecoilValue } from 'recoil';
import { walletState } from 'state/atoms/walletAtoms';
import { useMemo } from 'react';
import { toChainAmount } from 'libs/num';
import useTransaction from './useTransaction';
import { useTokenInfo } from 'hooks/useTokenInfo';

type DepostProps = {
    token: {
        amount: number;
        tokenSymbol: string
    }
    onSuccess: (txHash: string) => void
    vaultAddress: string,
    lpToken: string
}

const useWithdraw = ({ vaultAddress, lpToken,  token , onSuccess}: DepostProps) => {
    const { address, client } = useRecoilValue(walletState)
    const amount = toChainAmount(token?.amount)
    const tokenInfo = useTokenInfo(token?.tokenSymbol)



    const { msgs, encodedMsgs } = useMemo(() => {

        if (!tokenInfo || !Number(amount)) return {}

        return {
            msgs: createWithdrawMsg({
                amount,
                vaultAddress,
            }),
            encodedMsgs: createWithdrawExecuteMsgs({
                amount,
                senderAddress: address,
                vaultAddress,
                lpToken
            })
        }
    }, [amount, tokenInfo])

    const tx = useTransaction({
        isNative : false,
        denom: tokenInfo?.denom,
        contractAddress: lpToken,
        enabled: !!encodedMsgs,
        client,
        senderAddress: address,
        msgs,
        encodedMsgs,
        amount,
        onSuccess
    })


    return { tx }

}

export default useWithdraw