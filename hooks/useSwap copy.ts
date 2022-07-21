import { toAsset } from "./asset";
import { useCosmWasmClient } from 'hooks/useCosmWasmClient'
import { useMemo } from "react";
import { useQuery } from 'react-query'
import { minAmountReceive } from "./helpers";
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
// import { createExecuteMessage } from "../util/messages";
// import { Coin , MsgExecuteContract} from '@cosmjs/launchpad'
import { createSwapMsgs, createMsg } from './monoSwap'
import useTransaction from "./useTransaction";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useTokenSwap } from "../features/swap/hooks";
import { useTokenToTokenPrice } from "../components/Pages/Swap";
import { coin, EncodeObject } from "@cosmjs/proto-signing";
import { Coin } from '@cosmjs/launchpad'



export const simulate = ({
    client,
    // swapRoute,
    token,
    amount,
    reverse = false,
    swapAddress
}: GetQueryParams) => {
    // if (swapRoute[0] == null) {
    //   return null;
    // }

    // const { contract_addr } = swapRoute[0];

    // console.log({
    //     token,
    //     amount,
    //     reverse,
    //     swapAddress
    // })

    // const contract_addr = "ujunox"
    // const contract_addr = "juno1xrf2shh0lx93nzd4ug37zd6elj0gvzf6x2ct0xzf0jp3u28yvgssu4anms"
    if (reverse) {
        return client.queryContractSmart<any>(swapAddress, {
            reverse_simulation: {
                ask_asset: toAsset({ token, amount }),
            },
        });
    }

    return client.queryContractSmart<any>(swapAddress, {
        simulation: {
            offer_asset: toAsset({ token, amount }),
        }
    })

    // if (reverse) {
    //     return client.queryContractSmart<any>(contract_addr, {
    //         reverse_simulation: {
    //             ask_asset: toAsset({ token, amount }),
    //         },
    //     });
    // }

    // return client.queryContractSmart<any>(contract_addr, {
    //     simulation : {
    //         offer_asset: toAsset({ token, amount }),
    //     }
    // })
};

const useSimulate = ({
    client,
    token,
    amount,
    reverse = false,
    swapAddress,
    enabled
}) => {

    const { data, isLoading } = useQuery(["simulation", token, amount, reverse], () => {
        if (token == null || amount == '') return

        return simulate({
            client,
            token,
            amount,
            reverse,
            swapAddress
        });
    },
        {
            enabled: !!client && amount.length > 0 && enabled,
            onError: (err) => console.log(err)
        },
    );

    return useMemo(() => {
        if (data == null || amount == '') {
            return null;
        }


        const spread = data.spread_amount;
        const commission = data.commission_amount;

        if (reverse) {
            return {
                amount: data.offer_amount,
                spread,
                commission,
                // price: num(data.offer_amount).div(amount).toFixed(18),
                price: Number(data.offer_amount) / Number(amount)
            };
        }

        return {
            amount: data.return_amount,
            spread,
            commission,
            // price: num(amount).div(data.return_amount).toFixed(18),
            price: Number(amount) / Number(data.return_amount)
        };
    }, [amount, data, isLoading]);


}


const useSwap = ({ swapAssets = [], isReverse, swapAddress }) => {
    // const client = useCosmWasmClient()
    const wallet = useRecoilValue(walletState)
    const { address, key: pubKey, client } = wallet
    const [asset1, asset2] = swapAssets
    const isSameAsset = asset1?.symbol === asset2?.symbol

    const reverse = false
    const amount = Number(asset1?.amount) > 0 ? (1000000 * asset1?.amount).toFixed(0) : ''
    const slippage = '0.1'
    const token = asset1?.token_address
    const denom = asset1?.denom
    // const contract_addr = "juno1xrf2shh0lx93nzd4ug37zd6elj0gvzf6x2ct0xzf0jp3u28yvgssu4anms"
    // const reverse = false
    // const amount = '100'
    // const slippage = '0.1'
    // const token = 'ujunox'
    // const contract_addr = "juno1xrf2shh0lx93nzd4ug37zd6elj0gvzf6x2ct0xzf0jp3u28yvgssu4anms"

   

    const simulated = useSimulate({
        client,
        token,
        amount,
        swapAddress,
        enabled: !isSameAsset
        // reverse
    })


    const minReceive = useMemo(() => {
        if (simulated == null) return null

        return minAmountReceive({
            amount: reverse ? amount : simulated.amount,
            maxSpread: slippage,
        });

    }, [simulated, slippage, amount, reverse]);



    const { msgs, encodedMsgs } = useMemo(() => {
        if (token == null || amount == '' || simulated == null) return {};

        return {
            msgs: createMsg({
                token,
                amount,
                slippage,
                price: simulated.price.toString(),
                swapAddress
            }),
            encodedMsgs: [createSwapMsgs(
                {
                    token,
                    amount,
                    denom,
                    slippage,
                    price: simulated.price.toString(),
                    swapAddress,
                    // funds: [coin(amount, denom)]
                },
                address,
            )]
        }


        // return [createSwapMsgs(
        //     {
        //         token,
        //         // swapRoute: [{ from: token }],
        //         // contract_addr,
        //         amount,
        //         slippage,
        //         price: simulated.price.toString(),
        //         swapAddress: contract_addr,
        //         funds: [coin(amount, 'ujunox')]
        //     },
        //     address,
        // )]
    }, [address, token, amount, simulated, slippage]);

    console.log({msgs, encodedMsgs,swapAssets })

    const tx = useTransaction({
        swapAddress,
        swapAssets,
        pubKey,
        sender: address,
        client,
        msgs,
        encodedMsgs,
        amount,
        price: simulated?.price,
        onSuccess: () => { },
        onError: () => { }
    });

    // console.log({
    //     encodedMsgs,
    //     msgs,
    //     client,
    //     token,
    //     amount,
    //     swapAddress,
    //     enabled: !isSameAsset,
    //     simulated
    // })


    // if(client && msgs){
    //     client.simulate(address,encodedMsgs, '')
    //     .then(data => {
    //         console.log({simulate : data})
    //     })
    //     .catch(error => {
    //         console.log(error)
    //     })
    // }

    // if(client && msgs){ 
    //     client.sign(address, msgs, 'auto', '')
    //     .then(data => {
    //         console.log({sign : data})
    //     }).catch(e => {
    //         console.log({errror : e})
    //     })
    // }

    //  console.log({tx})


    //  const { mutate: handleSwap, isLoading: isExecutingTransaction } =
    //  useTokenSwap({
    //    tokenASymbol: 'ujunox',
    //    tokenBSymbol: 'junotwo',
    //    tokenAmount: 10,
    //    tokenToTokenPrice:  0,
    //  })



    return { tx, simulated, minReceive }


    // console.log({minReceive, msgs})


    return {}

}

export default useSwap