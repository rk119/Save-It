import React from "react"
import "./User.css"
import { ConnectButton } from "web3uikit"
import bg from "../images/pexels-support.png"

const User = () => {
  const cards = [
    {
      type: "Donate ETH",
      text: "This is standard a donation in ETH.",
      link: "http://localhost:3000/donate",
    },
    {
      type: "Donate Food",
      text: "For established food organizations only.*",
      link: "http://localhost:3000/restaurant",
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
        <ConnectButton moralisAuth={false} />
      </div>
      <div className="uspageIdentify">Select User</div>
      <div className="cardContainer">
        <div className="customCard">
          {cards.map((e) => {
            return (
              <>
                <div className="" onClick={() => window.open(e.link, "_self")}>
                  <div className="selectCard">
                    <div className="userCardText">{e.type}</div>
                  </div>
                  <div className="cardsSub">{e.text}</div>
                </div>
              </>
            )
          })}
        </div>
      </div>

      <div>
        <div className="usmainHeader">Support the Cause</div>
        <div className="longBodyText">
          Donators can either donate Ethereum to fund this project. Established
          food organizations can also donate some of their food.
        </div>
      </div>
      <div className="bottomBox">
        <div className="cardsSub">
          * If you are an established food organization, you can offer to donate
          your leftover food. Only food that is not expired can be donated.
        </div>
      </div>
    </>
  )
}

export default User
