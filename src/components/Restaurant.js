import React, { useState, useRef, useEffect } from "react"
import "./Restaurant.css"
import "../pages/User.css"
import { ethers } from "ethers"
import { ConnectButton } from "web3uikit"
import bg from "../images/pexels-donate.png"
// pickup deployment address and abi 
import pickupinfo from "../contractinfo/pickupinfo"
import contractAddresses from "../contractinfo/addresses"
import donateinfo from "../contractinfo/donateinfo"
import saveitinfo from "../contractinfo/saveitinfo"

const Restaurant = () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const address = contractAddresses.saveit
  const abi = saveitinfo.abi
  const signer = provider.getSigner()
  const contract = new ethers.Contract(address, abi, signer)

  // const donateAbi = donateinfo.abi
  // const donateAddress = contractAddresses.donate
  // const donate = new ethers.Contract(donateAddress, donateAbi, signer)

  // state hooks
  const [users, setUsers] = useState()
  const [status, setStatus] = useState('waiting')
  const [amount, setAmount] = useState('')
  const [amountValue, setAmountValue] = useState(0)

  useEffect(() => {
    const requestAccounts = async () => {
      await provider.send("eth_requestAccounts", []);
    }

    requestAccounts().catch(console.error)
  }, [])

  const handleRequestChange = (e) => {
    setAmountValue(e.target.value)
  }

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    await contract.requestDelivery(amountValue)
    const users = await contract.numOfFoodPlaces()
    // await contract.setAddress(donate.address)
    // await donate.setAddress(contract.address)
    // await contract.fundDelivery()
    setAmount(amountValue)
    setAmountValue('');
    setUsers(users.toNumber())
  }

  return (
    <>
      <div className="bgcontainer">
        <div
          className="imgcontainer"
          style={{ backgroundImage: `url(${bg})` }}
        ></div>
      </div>
      <div className="connectWallet">
        <ConnectButton moralisAuth={false} />
      </div>
      <div className="donationContainer">
        <div className="row mt-5">
          <div className="col">
            <div className="rdashboard">
              <div className="rdashboardHeader">Dashboard</div>
              <div className="rdashboardText">Your Request Status: {status}</div>
              <div className="rdashboardText">Food Companies Registered: {users} </div>
            </div>
          </div>

          <div className="col">
            <div className="rmakeAD">
              <div className="rmakeADHeader">Donate Food</div>
              <div className="rmakeADSub">Specify the amount in kilograms (kg)</div>
              <form onSubmit={handleRequestSubmit}>
                <div className="mb-3">
                  <input
                    type="number"
                    className="form-control"
                    placeholder=""
                    onChange={handleRequestChange}
                    value={amountValue}
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Request Delivery
                </button>
              </form>
            </div>
          </div>

          <div className="space"></div>
          <div className="rstats">
            {/* <div>
              <div className="rdashboardHeader">Stats</div>
              <div className="rdashboardText">Previous donation: {amount} kg </div> 
              <div className="rdashboardText">Location: West Bay, Springs </div> 
            </div> */}
          </div>
        </div>
      </div>
    </>
  )
}

export default Restaurant
