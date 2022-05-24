import React, { useState, useEffect } from "react"
import "./Donate.css"
import "../pages/User.css"
import { ethers } from "ethers"
import donateinfo from "../contractinfo/donateinfo"
import contractAddresses from "../contractinfo/addresses"
import { ConnectButton } from "web3uikit"
import bg from "../images/pexels-donate.png"
import { useWeb3Contract, useMoralis } from "react-moralis"

const Donate = () => {
  const { isWeb3Enabled } = useMoralis()
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const address = contractAddresses.donate
  const abi = donateinfo.abi
  const signer = provider.getSigner()
  const contract = new ethers.Contract(address, abi, signer)

  // state hooks
  const [balance, setBalance] = useState()
  const [depositValue, setDepositValue] = useState("")
  const [numOfDonators, setNumOfDonators] = useState("0")
  const [donationValue, setDonationValue] = useState("0")

  /* make a donation */
  const {
    runContractFunction: donate,
    data: enterTxResponse,
    isLoading,
    isFetching,
  } = useWeb3Contract({
    abi: abi,
    contractAddress: address,
    functionName: "donate",
    msgValue: donationValue,
    params: {
      secondAgos: [10],
    },
  })

  const { runContractFunction: s_totalDonators } = useWeb3Contract({
    abi: abi,
    contractAddress: address,
    functionName: "s_totalDonators",
    params: {},
  })

  async function updateUIValues() {
    let numOfDonators = (await s_totalDonators()).toString()
    setNumOfDonators(numOfDonators)
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUIValues()
    }

    const connectWallet = async () => {
      await provider.send("eth_requestAccounts", [])
    }

    const getBalance = async () => {
      const balance = await provider.getBalance(address)
      const balanceFormatted = ethers.utils.formatEther(balance)
      setBalance(balanceFormatted)
      ethers.utils.formatEther(balance)
    }

    connectWallet().catch(console.error)
    getBalance().catch(console.error)
  }, [isWeb3Enabled])

  const handleDepositChange = (e) => {
    setDepositValue(e.target.value)
  }

  const handleDepositSubmit = async (e) => {
    e.preventDefault()
    console.log(depositValue)
    const ethValue = await ethers.utils.parseEther(depositValue)
    const depositEth = await contract.donate({ value: ethValue })
    await depositEth.wait()
    const balance = await provider.getBalance(address)
    const balanceFormatted = ethers.utils.formatEther(balance)
    setBalance(balanceFormatted)
    setDepositValue(0)
  }

  const handleSuccess = async (tx) => {
    await tx.wait(1)
    updateUIValues()
  }

  const notifs = [
    {
      notif: "Donation of 0.0051 ETH used by Subway",
    },
    {
      notif: "Donation of 0.0051 ETH used by Baskin Robbins",
    },
    {
      notif: "Donation of 0.0051 ETH used by Wendy's",
    },
    {
      notif: "Donation of 0.0051 ETH used by Papa Murphy",
    },
  ]

  return (
    <>
      <div className="bgcontainer">
        <div
          className="imgcontainer"
          style={{ backgroundImage: `url(${bg})` }}
        ></div>
      </div>
      <div className="connectWallet">
        <ConnectButton
          moralisAuth={false}
          signingMessage="Connect your wallet to make donations!"
        />
      </div>
      <div className="donationContainer">
        <div className="row mt-5">
          <div className="col">
            <div className="dashboard">
              <div className="dashboardHeader">Dashboard</div>
              <div className="dashboardText">
                Total Donations: {balance} ETH
              </div>
              <div className="dashboardText">Number of users: </div>
            </div>
            <div className="space"></div>
            <div className="stats">
              <div>
                <div className="dashboardHeader">Stats</div>
                <div className="dashboardText">Your total donations: </div>
                <div className="dashboardHeader">Notifications</div>
                <div className="dashboardNotifs">
                  {/* {notifs.map((e) => {
                    return (
                      <>
                        <div className="notifText">{e.notif}</div>
                      </>
                    )
                  })} */}
                </div>
              </div>
            </div>
          </div>

          <div className="col">
            <div className="makeAD">
              <div className="makeADHeader">Make a Donation</div>
              <div className="makeADSub">
                (Minimum value: 10USD or 0.0051 ETH)
              </div>
              <form onSubmit={handleDepositSubmit}>
                <div className="mb-3">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0"
                    onChange={handleDepositChange}
                    value={depositValue}
                  />
                </div>
                <button type="submit" className="btn btn-primary"
                  onClick={async () =>
                    await donate({
                      // onComplete:
                      // onError:
                      onSuccess: handleSuccess,
                    })
                  }
                disabled={isLoading || isFetching}>
                  Donate
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Donate
