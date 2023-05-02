import { useMutation } from "react-query"
import { bondLp } from "./bond"


const useTransaction = ({msgs, client, stakingAddress, senderAddress, amount, lpAddress}) => {

  // console.log({client})


  const stake = useMutation({
    mutationFn : () => {

      return bondLp({msgs, client, stakingAddress, senderAddress, amount, lpAddress})

    }
    // mutationFn :() => client?.execute(senderAddress, "migaloo1r8cddcpud6mxgdaktun7rcexqjyfk3rxadu35y745zt8lustnudqdt5j0n", {
    //   open_position: {
    //     amount : "1",
    //     unbonding_duration: 60
    //   }
    // })
  })

return stake
   


}

export default useTransaction