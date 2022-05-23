import React from "react"
import "./WinFood.css"
import bg from "../images/pexels-donate.png"

const WinFood = () => {
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
        All donators automatically get added to a lottery. Every month a
        random winner will be selected using Chainlink's VRF service. The winner
        will be gifted free food for a day. Scrumptious!*
      </div>
      <div className="mainHeader">Last month's winner:</div>
      <div className="longBodyText">
        Congratulations to Uncle Bobby for winning last month's lottery!
      </div>
      <div className="mainHeader">Lottery Countdown</div>
      <div className="countdownText">17d 3h 38m 53s</div>
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
