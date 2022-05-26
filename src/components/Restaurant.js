import React, { useState, useRef, useEffect } from "react"
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

  const { Moralis, isWeb3Enabled, chainId: chainIdHex } = useMoralis()

  // state hooks
  const [users, setUsers] = useState("0")
  const [status, setStatus] = useState('waiting')
  const [amount, setAmount] = useState('')
  const [amountValue, setAmountValue] = useState("")
  const [foodieValue, setFoodieValue] = useState("")
  const [foodies, setFoodies] = useState("")
  const [balance, setBalance] = useState("0")

  const { runContractFunction: getNumberOfFoodies } = useWeb3Contract({
      abi: abi,
      contractAddress: address,
      functionName: "getNumberOfFoodies",
      params: {},
  })

  const { runContractFunction: numOfFoodPlaces } = useWeb3Contract({
      abi: abi,
      contractAddress: address,
      functionName: "numOfFoodPlaces",
      params: {},
  })

  async function updateUIValues() {
    const foodies = (await getNumberOfFoodies()).toString()
    const users = (await numOfFoodPlaces()).toString()
    setFoodies(foodies)
    setUsers(users)
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
    console.log('success')
    setStatus("Funded!")
    setAmount(amountValue)
    setAmountValue('');
  }

  const handleFoodieChange = (e) => {
    setFoodieValue(e.target.value)
  }

  const handleFoodieSubmit = async (e) => {
    e.preventDefault();
    await contract.addFoodie(foodieValue)
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

              <div className="space"></div>
              <div className="space"></div>

              <div className="rdashboardHeader">Settings</div>
              <div className="rdashboardText">Set Name: </div>
              <div className="rdashboardText">Set Location: </div>
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
            </div>

            <div className="space"></div>
            
            <div className="addFoodie">
            <div>
              <div className="rdashboardHeader">Add Foodie</div>
              <div className="rdashboardText">Number of foodies: { foodies } </div> 
              <form onSubmit={handleFoodieSubmit}>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder=""
                    onChange={handleFoodieChange}
                    value={foodieValue}
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Push Foodie
                </button>
              </form>
              {/* <div className="rdashboardText">Location: West Bay, Springs </div>  */}
            </div>
          </div>
          </div>

          
          
        </div>
      </div>
    </>
  )
}

export default Restaurant
