import React from "react"
import { Icon } from "web3uikit"
import { Link } from "react-router-dom"
import "./Topbar.css"
import logo from "../images/tootoo.png"

const Topbar = () => {
  return (
    <>
      <div className="topbarContent">
        <Link to="/" className="link">
          <div className="menuItems">
            {/* <Icon fill="#656565" size={20} svg="list"></Icon> */}
            <div className="logoNav">
              <img className="logoNavi" src={logo}></img>
              Home
            </div>
          </div>
        </Link>
      </div>
      <div className="topbarContent">
        <Link to="/user" className="link">
          <div className="menuItems">
            <Icon fill="#C91B10" size={20} svg="eth"></Icon>
            Donate
          </div>
        </Link>
      </div>
      {/* <div className="topbarContent">
        <Link to="/rankings" className="link">
          <div className="menuItems">
            <Icon fill="#C91B10" size={20} svg="chart"></Icon>
            Top Fooders
          </div>
        </Link>
      </div> */}
      <div className="topbarContent">
        <Link to="/winfood" className="link">
          <div className="menuItems">
            <Icon fill="#C91B10" size={20} svg="ada"></Icon>
            Win Food
          </div>
        </Link>
      </div>
    </>
  )
}

export default Topbar
