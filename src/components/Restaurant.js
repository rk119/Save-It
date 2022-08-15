import React, { useState, useEffect } from "react"
import "./Restaurant.css"
import "../pages/User.css"
import { ethers } from "ethers"
import { ConnectButton } from "web3uikit"
import bg from "../images/pexels-donate.png"
import contractAddresses from "../contractinfo/addresses"
import saveitinfo from "../contractinfo/saveitinfo"
import { useMoralis, useWeb3Contract } from "react-moralis"

const Restaurant = () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const address = contractAddresses.saveit
  const abi = saveitinfo.abi
  const signer = provider.getSigner()
  const contract = new ethers.Contract(address, abi, signer)

  const { isWeb3Enabled } = useMoralis()
  
  // state hooks
  const [users, setUsers] = useState("0")
  const [status, setStatus] = useState('waiting')
  // const [amount, setAmount] = useState('')
  const [amountValue, setAmountValue] = useState("")
  // const [balance, setBalance] = useState("0")
  const [nameValue, setNameValue] = useState("")
  const [locationValue, setLocationValue] = useState("")

  const { runContractFunction: numOfFoodPlaces } = useWeb3Contract({
      abi: abi,
      contractAddress: address,
      functionName: "numOfFoodPlaces",
      params: {},
  })

  async function updateUIValues() {
    const users = (await numOfFoodPlaces())
    setUsers(users.toNumber())
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
    e.preventDefault();
    await contract.requestDelivery(amountValue)
    // console.log('success')
    setStatus("Donated!")
    // setAmount(amountValue)
    setAmountValue('');
  }

  const handleNameChange = (e) => {
      setNameValue(e.target.value)
  }

  const handleNameSubmit = async (e) => {
    e.preventDefault()
    await contract.setName(nameValue)
    setNameValue("")
  }

  const handleLocationChange = (e) => {
      setLocationValue(e.target.value)
  }

  const handleLocationSubmit = async (e) => {
    e.preventDefault()
    await contract.setLocation(locationValue)
    setLocationValue("")
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

            {/* give food place info */}
            <div className="rdashboard">
              <div className="rdashboardHeader">Settings</div>

              {/* set the food place name */}
              <div className="rdashboardText">Set Name: </div>
              <form onSubmit={handleNameSubmit}>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder=""
                    onChange={handleNameChange}
                    value={nameValue}
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Save Name
                </button>
              </form>

              {/* set the food place location */}
              <div className="rdashboardText">Set Location: </div>
              <form onSubmit={handleLocationSubmit}>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder=""
                    onChange={handleLocationChange}
                    value={locationValue}
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Save Location
                </button>
              </form>
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
                    min="0"
                    max="299"
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Request Delivery
                </button>
              </form>

              <div className="space"></div>

              <div className="rdashboardText">Your Donation Status: {status}</div>
              <div className="rdashboardText">Food Companies Registered: {users} </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

export default Restaurant
