import React from "react"
import "./Restaurant.css"
import "../pages/User.css"
// import { useState, useRef, useEffect } from "react"
import RegisterMap from "./RegisterMap"

const Register = () => {

  const deets = [
    {
      attributes: {
        lat: "25.204849",
        lng: "55.270782",
      },
    },
  ]

  let coords = []
  deets.forEach(e => {
    coords.push({ lat: e.attributes.lat, lng: e.attributes.lng })
  })

  return (
    <>
      <div className="userContent">
        <div className="userContentPage">
          <div>
            <div className="pageIdentify">Register</div>
            <div>Name</div>
            <div>Lat</div>
            <div>Long</div>
          </div>
        </div>
        <div className="line2"></div>
        <RegisterMap locations={coords} />
      </div>
    </>
  )
}

export default Register
