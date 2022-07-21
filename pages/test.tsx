import React, { useEffect } from 'react'
import { useRecoilValue } from 'recoil'
import { walletState } from '../state/atoms/walletAtoms'
import { toAsset } from '../hooks/asset'

const test = () => {
    const wallet = useRecoilValue(walletState)
    const { client } = wallet
    const contract_addr = "juno1xrf2shh0lx93nzd4ug37zd6elj0gvzf6x2ct0xzf0jp3u28yvgssu4anms"
    const token = "ujunox"
    // const token = "juno1hset4pny4h8xm4s4lek57msq7j4zwfqwjf7zxqjt4npxyv0lrgnsp8qy9j"
    const amount = '1000000'

    useEffect(() => {

        if (!!client) {
            // client.queryContractSmart(contract_addr, {
            //     simulation: {
            //         offer_asset: toAsset({ token, amount })
            //     }
            // })
            console.log({
                ask_asset: toAsset({ token, amount }),
            })
            client.queryContractSmart(contract_addr, {
                reverse_simulation: {
                    ask_asset: toAsset({ token, amount }),
                },
            })
            .then(data => console.log({data}))
            .catch(err => console.log(err))
        }

    }, [client])

    return (
        <div>

        </div>
    )
}

export default test