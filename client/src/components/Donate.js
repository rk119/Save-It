import React, { useState, useEffect } from "react"
import "./Donate.css"
import "../pages/User.css"
import { ethers } from "ethers"
import donateinfo from "../contractinfo/donateinfo"
import { ConnectButton } from "web3uikit"
import { useMoralis } from "react-moralis"

const Donate = () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()
  const address = "0x610178dA211FEF7D417bC0e6FeD39F05609AD788"

  const [balance, setBalance] = useState()
  const [depositValue, setDepositValue] = useState("")

  const [name, setName] = useState("")
  const [nameValue, setNameValue] = useState("")
  const [lat, setLat] = useState("")
  const [latValue, setLatValue] = useState("")
  const [long, setLong] = useState("")
  const [longValue, setLongValue] = useState("")
  const [users, setUsers] = useState("")

  const abi = donateinfo.abi
  const contract = new ethers.Contract(address, abi, signer)

  useEffect(() => {
    const connectWallet = async () => {
      await provider.send("eth_requestAccounts", [])
    }

    const getBalance = async () => {
      const balance = await provider.getBalance(address)
      const balanceFormatted = ethers.utils.formatEther(balance)
      setBalance(balanceFormatted)
      ethers.utils.formatEther(balance)
    }

    const getUsers = async () => {
      const numOfUsers = await contract.getNumOfDonators()
      setUsers(numOfUsers)
    }

    connectWallet().catch(console.error)
    getBalance().catch(console.error)
    getUsers().catch(console.error)
  })

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

  const handleNameChange = (e) => {
    setNameValue(e.target.value)
  }

  const handleLatChange = (e) => {
    setLatValue(e.target.value)
  }

  const handleLongChange = (e) => {
    setLongValue(e.target.value)
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    const registerUpdate = await contract.registerDonator(
      nameValue,
      latValue,
      longValue
    )
    await registerUpdate.wait()
    setName(nameValue)
    setLat(latValue)
    setLong(longValue)
    setNameValue("")
    setLatValue("") 
    setLongValue("") 
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
                <button type="submit" className="btn btn-primary">
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
