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
      link: "http://localhost:3000/delivery",
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
      <div className="row mt-5">
        <div className="col">
            <div className="" onClick={() => window.open(cards[0].link, "_self")}>
            <div className="selectCard">
              <div className="userCardText">{cards[0].type}</div>
            </div>
            <div className="cardsSub">{cards[0].text}</div>
          </div>
        </div>

        <div className="col">
          <div className="" onClick={() => window.open(cards[1].link, "_self")}>
            <div className="selectCard">
              <div className="userCardText">{cards[1].type}</div>
            </div>
            <div className="cardsSubContainer">
              <div className="cardsSub">{cards[1].text}</div>
            </div>
          </div>
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
        <div className="bcardsSub">
          * If you are an established food organization, you can offer to donate
          your leftover food. Only food that is not expired can be donated.
        </div>
      </div>
    </>
  )
}

export default User
