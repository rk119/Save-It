import React, { useState, useEffect } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import "./WinFood.css"
import bg from "../images/pexels-donate.png"
import addresses from "../contractinfo/addresses"
import abis from "../contractinfo/abis"

const WinFood = () => {
  const donateAddress = addresses.donate
  const donateAbi = abis.donate
  const address = addresses.lottery
  const abi = abis.lottery

  // state hooks
  const { isWeb3Enabled } = useMoralis()
  const [numberOfPlayers, setNumberOfPlayers] = useState("0")
  const [recentWinner, setRecentWinner] = useState("0x000...00")

  // number of donators
  const { runContractFunction: getDonators } = useWeb3Contract({
    abi: donateAbi,
    contractAddress: donateAddress,
    functionName: "getDonators",
    params: {},
  })

  // get winner
  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi: abi,
    contractAddress: address,
    functionName: "getRecentWinner",
    params: {},
  })

  async function updateUIValues() {
    const numPlayersFromCall = await getDonators()
    setNumberOfPlayers(numPlayersFromCall.toNumber())
    const prevWinner = await getRecentWinner()
    setRecentWinner(prevWinner)
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUIValues()
    }
  }, [isWeb3Enabled])

  return (
    <>
      <div className="bgcontainer">
        <div
          className="imgcontainer"
          style={{ backgroundImage: `url(${bg})` }}
        ></div>
      </div>
      <div className="mainHeader">Win Free Food!</div>
      <div className="longBodyText">
        All donators automatically get added to a lottery. Every month a random
        winner will be selected using Chainlink's VRF service.*
      </div>
      <div className="mainHeader">Last month's winner:</div>
      <div className="longBodyText">
        Congratulations to {recentWinner} for winning last month's lottery and
        winning free food!
      </div>

      <div className="mainHeader">Number of Donators</div>
      <div className="countdownText"> {numberOfPlayers} </div>
      <div className="bottomBox">
        <div className="bottomHeader">How are winners chosen?</div>
        <div className="cardsSub">
          <p>
            * To ensure a fair chance for everyone, the lottery uses a
            verifiable random function (VRF) to select the winner. This service
            is made by Chainlink and you can find more information about this
            resource
            <a
              href="https://docs.chain.link/docs/chainlink-vrf/"
              target={"_blank"}
              rel="noreferrer"
            >
              {" "}
              here
            </a>
            .
          </p>
        </div>
      </div>
    </>
  )
}

export default WinFood
