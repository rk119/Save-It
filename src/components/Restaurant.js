import React, { useState, useRef, useEffect } from "react"
import "./Restaurant.css"
import "../pages/User.css"
import { ethers } from "ethers"
import pickupinfo from "../contractinfo/pickupinfo"
import { ConnectButton } from "web3uikit"
import bg from "../images/pexels-donate.png"

const Restaurant = () => {

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
              <div className="rdashboardText">Total Donations: 3473 kg</div>
              <div className="rdashboardText">Food Companies Registered: 26</div>
            </div>
          </div>

          <div className="col">
            <div className="rmakeAD">
              <div className="rmakeADHeader">Donate Food</div>
              <div className="rmakeADSub">Specify the amount in grams (g)</div>
              <form>
                <div className="mb-3">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0"
                    value="Amount in grams"
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
            <div>
              <div className="rdashboardHeader">Stats</div>
              <div className="rdashboardText">Your donations: 45 kg </div> 
              <div className="rdashboardText">Location: West Bay, Springs </div> 
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Restaurant
