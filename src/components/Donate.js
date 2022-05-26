import React, { useState, useEffect } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import "./Donate.css"
import "../pages/User.css"
import { ethers } from "ethers"
import { ConnectButton } from "web3uikit"
import bg from "../images/pexels-donate.png"
import saveitinfo from "../contractinfo/saveitinfo"
import contractAddresses from "../contractinfo/addresses"

const Donate = () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const address = contractAddresses.saveit
  const abi = saveitinfo.abi
  const signer = provider.getSigner()
  const contract = new ethers.Contract(address, abi, signer)

  const { isWeb3Enabled } = useMoralis()

  // state hooks
  const [users, setUsers] = useState("0")
  const [notif, setNotif] = useState()
  const [status, setStatus] = useState("pending")
  const [balance, setBalance] = useState("0")
  const [depositValue, setDepositValue] = useState("")

  const { runContractFunction: getDonators } = useWeb3Contract({
      abi: abi,
      contractAddress: address,
      functionName: "getDonators",
      params: {},
  })

  useEffect(() => {
    const requestAccounts = async () => {
      await provider.send("eth_requestAccounts", []);
    }

    const getBalance = async () => {
      const balance = await provider.getBalance(address);
      setBalance(ethers.utils.formatEther(balance));
    }

    requestAccounts().catch(console.error)
    getBalance().catch(console.error)
  }, [])

  const handleDepositChange = (e) => {
    setDepositValue(e.target.value)
    setStatus("pending")
  }

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    const ethValue = ethers.utils.parseEther(depositValue)
    const deposit = await contract.donate({ value: ethValue });
    await deposit.wait();
    const contractBalance = await provider.getBalance(address);
    setBalance(ethers.utils.formatEther(contractBalance));
    setStatus("Donation success!");
  }

  const handleDepositError = async (e) => {
    e.preventDefault()
    const notification = "You are already a donator"
    setNotif(notification)
  }

  async function updateUIValues() {
      const numPlayersFromCall = (await getDonators()).toString()
      setUsers(numPlayersFromCall)
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
              <div className="dashboardText">Donation Status: {status} </div>
              <div className="dashboardText">Number of users: {users} </div>
            </div>
            <div className="space"></div>
            <div className="stats">
              {/* <div>
                <div className="dashboardHeader">Stats</div>
                <div className="dashboardText">Your total donations: {td} </div>
                <div className="dashboardHeader">Notifications</div>
                <div className="dashboardNotifs">{notif}</div>
              </div> */}
            </div>
          </div>

          <div className="col">
            <div className="makeAD">
              <div className="makeADHeader">Make a Donation</div>
              <div className="makeADSub">
                (Minimum value: 10USD or 0.0051 ETH)
              </div>
              <form onSubmit={handleDepositSubmit}
              onError={handleDepositError}>
                <div className="mb-3">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0"
                    onChange={handleDepositChange}
                    value={depositValue}
                    min="0.0051"
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
