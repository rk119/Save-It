import React from "react"
import "./Home.css"
import logo from "../images/tootoo.png"
import bg from "../images/pexels-foodie-home.png"

const e = {
  link: ["http://localhost:3000/user"],
}

const Home = () => {
  return (
    <>
      <div className="bgcontainer">
        <div
          className="imgcontainer"
          style={{ backgroundImage: `url(${bg})` }}
        ></div>
      </div>
      <div className="row mt-5">
        <div className="col"></div>
        <div className="col">
          <div className="logo">
            <img className="logoImg" src={logo} alt="logo"></img>
          </div>
          <div className="hmainHeader"> Save It!</div>
          <div className="hheaderSubtext">
            Join us on our quest to end food wastage.
          </div>
          <div className="hheaderSubtext">
            <button
              type="submit"
              className="btn btn-primary"
              onClick={() => window.open(e.link, "_self")}
            >
              Donate
            </button>
          </div>
          <div className="hmainHeader">Our Goal</div>
          <div className="hlongBodyText">
            On a daily basis, food in many restaurants are often thrown out in
            large quantities, which results in immense food wastage. What if
            this food could be used before it expires? That's where Save It
            comes in. Save It allows food companies to donate their unsold food
            before it expires. This food will be transported and distributed to
            people in need and donators can fund these transports with ETH!
          </div>
        </div>
      </div>
      <div className="space"></div>
      <div>{/* <div className="hmainHeader">Our Goal</div> */}</div>
    </>
  )
}

export default Home
