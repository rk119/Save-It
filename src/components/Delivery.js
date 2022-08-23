import React, { useState, useEffect } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { ethers } from "ethers"
import { ConnectButton } from "web3uikit"
import "./Delivery.css"
import "../pages/User.css"
import bg from "../images/pexels-donate.png"
import addresses from "../contractinfo/addresses"
import abis from "../contractinfo/abis"

const Delivery = () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const address = addresses.delivery
  const abi = abis.delivery
  const signer = provider.getSigner()
  const contract = new ethers.Contract(address, abi, signer)

  const { isWeb3Enabled } = useMoralis()

  // state hooks
  const [users, setUsers] = useState("0")
  const [status, setStatus] = useState("N/A")
  const [amountValue, setAmountValue] = useState("")

  const { runContractFunction: getFoodonors } = useWeb3Contract({
    abi: abi,
    contractAddress: address,
    functionName: "getFoodonors",
    params: {},
  })

  async function updateUIValues() {
    const donators = await getFoodonors()
    setUsers(donators.toNumber())
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUIValues()
    }
  }, [isWeb3Enabled])

  const handleRequestChange = (e) => {
    setAmountValue(e.target.value)
    setStatus("pending")
  }

  const handleRequestSubmit = async (e) => {
    e.preventDefault()
    await contract.requestDelivery(amountValue)
    setStatus("Donated!")
    setAmountValue("")
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
              <div className="dashboardHeader">Dashboard</div>
              <div className="space"></div>
              <div className="space"></div>

              {/* <div className="dashboardText">Total Donations: {} KG</div> */}
              <div className="dashboardText">Donation Status: {status} </div>
              <div className="dashboardText">Number of users: {users} </div>
            </div>
          </div>

          <div className="col">
            <div className="rmakeAD">
              <div className="rmakeADHeader">Donate Food</div>
              <div className="rmakeADSub">
                Minimum food donation amount: 5 KG
              </div>
              <form onSubmit={handleRequestSubmit}>
                <div className="mb-3">
                  <input
                    type="number"
                    className="form-control"
                    placeholder=""
                    onChange={handleRequestChange}
                    value={amountValue}
                    min="0"
                    max="299"
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Request Delivery
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Delivery
