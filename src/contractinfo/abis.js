import donateinfo from "./donateinfo"
import deliveryinfo from "./deliveryinfo"
import lotteryinfo from "./lotteryinfo"

const abis = {
  donate: donateinfo.abi,
  delivery: deliveryinfo.abi,
  lottery: lotteryinfo.abi,
}

export default abis