import React from "react";
import "./Rankings.css";
import bg from "../images/pexels-donate.png"

const Rankings = () => {
  return (
    <>
      <div className="bgcontainer">
        <div
          className="imgcontainer"
          style={{ backgroundImage: `url(${bg})` }}
        ></div>
      </div>
      <div className="pageIdentify">Top Food Donator of the Month:</div>
      <div className="bottomHeader">Baskin Robbins!</div>
      <div className="longBodyText">
        Congratulations to Baskin Robbins for leading the
        charge in donating food in last month's donations!
        They managed to donate an impressive 450kg of food!
      </div>
      <table id="customers">
        <tr>
          <th>Rank</th>
          <th>Company</th>
          <th>Food Saved (KG)</th>
        </tr>
        <tr>
          <td>1</td>
          <td>Baskin Robbins</td>
          <td>450</td>
        </tr>
        <tr>
          <td>2</td>
          <td>Papa Murphy</td>
          <td>300</td>
        </tr>
        <tr>
          <td>3</td>
          <td>Wendy's</td>
          <td>289</td>
        </tr>
        <tr>
          <td>4</td>
          <td>Popeyes</td>
          <td>230</td>
        </tr>
        <tr>
          <td>5</td>
          <td>McDonaldees</td>
          <td>220</td>
        </tr>
        <tr>
          <td>6</td>
          <td>Wendy's</td>
          <td>195</td>
        </tr>
        <tr>
          <td>7</td>
          <td>Wendy's Plums</td>
          <td>190</td>
        </tr>
        <tr>
          <td>8</td>
          <td>JackTea</td>
          <td>189</td>
        </tr>
        <tr>
          <td>9</td>
          <td>Pickle Dane</td>
          <td>166</td>
        </tr>
        <tr>
          <td>10</td>
          <td>Mackintech</td>
          <td>144</td>
        </tr>
      </table>
    </>
  )
};

export default Rankings;
