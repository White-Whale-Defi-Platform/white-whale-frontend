// import { useMemo } from "react";
// // import useAsset, { Asset } from './useAsset'

// type RewardAsset = {
//     token_address: string;
//     symbol: string;
//     name: string;
//     decimals: number;
//     logoURI: string;
//     native: boolean;
//     denom: string;
//     rewards_address?: string;
//     swap_address?: string;
// }

// export interface Pool {
//     poolId: string,
//     poolSssets?: Asset[],
//     lpToken: string,
//     swapAddress: string,
//     stakingAddress: string,
// }

// export const pools: Pool[] = [ 
//     {
//         "poolId": "JUNOX-JUNOONE",
//         "lpToken": "juno1nrw7gxaq4ag698dumm9zvmur8azj58gsls7ngn8pqwaxtlmz8shsecu6lt",
//         "swapAddress": "juno1xrf2shh0lx93nzd4ug37zd6elj0gvzf6x2ct0xzf0jp3u28yvgssu4anms",
//         "stakingAddress": "",
//     },
//     {
//         "poolId": "JUNOX-JUNOTWO",
//         "lpToken": "juno1qg0z0eaj5mjlrxg8wunjg6wqrcgu69xfjwdsusmaxcheyr856t7qlq7p60",
//         "swapAddress": "juno1kkwtx57qq8dg2nfm6ctw94gp93p3ee92srygrsr058kadn6cpums30wvkk",
//         "stakingAddress": "juno19wmsdhmn9wgckn64xfp0sl55ntgnzj3lly20e7wjk8z597meh3xsw2zeus",
//     },
//     {
//         "poolId": "JUNOONE-JUNOTWO",
//         "lpToken": "juno1sn62twavppppwsu5af2w3qthe20r9vw2mjujdc3vld254glzqdesm8ecz6",
//         "swapAddress": "juno1phget2lq2nmmnfk0qcjrnuahau4cxe3z6jw9zekxuda3zxezxeqq2mzx0s",
//         "stakingAddress": "juno189wqvuj8amqsag8ehn3vmz6cq26c44ffeltvljkcxx9lsfsew8mq9y7z4h",
//     }
// ]



// const usePool = (poolById: string[] | null) => {

//     const assets = useAsset()
//     const poolsWithAssets = useMemo(() => {
//         return pools.map((pool:Pool) => {
//              const pool_assets = assets.filter(({ symbol }: Asset) => pool?.poolId?.split("-").includes(symbol))
//             return {...pool, pool_assets}
//         })
//     }, [assets])

//     if (!poolById) return null

//     return poolsWithAssets.find(({ poolId }: Pool) => poolById.includes(poolId))
// }

// export default usePool