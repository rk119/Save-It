import React, { useState, useEffect } from "react"
import { ethers } from "ethers"
import "./WinFood.css"
import bg from "../images/pexels-donate.png"
import saveitinfo from "../contractinfo/saveitinfo"
import contractAddresses from "../contractinfo/addresses"
import { useMoralis, useWeb3Contract } from "react-moralis"

const WinFood = () => {
    //
    // test timer functionality to pick a winner
    const [seconds, setSeconds] = useState(5)
    const [isActive, setIsActive] = useState(false)

    function toggle() {
        setIsActive(!isActive);
    }

    function reset() {
        setSeconds(5);
        setIsActive(false);
    }

    useEffect(() => {
        let interval = null
        if (isActive) {
            interval = setInterval(() => {
                setSeconds((seconds) => seconds - 1)
                if (seconds === 0) {
                    winner()
                    reset()
                }
            }, 1000)
        } else if (!isActive && seconds !== 0) {
            clearInterval(interval)
        }
        return () => clearInterval(interval)
    }, [isActive, seconds])
    // end of test timer functionality
    //

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const address = contractAddresses.saveit
    const abi = saveitinfo.abi
    const signer = provider.getSigner()
    const contract = new ethers.Contract(address, abi, signer)

    // state hooks
    const { isWeb3Enabled } = useMoralis()
    const [numberOfPlayers, setNumberOfPlayers] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0x0000000")
    const [foodplace, setFoodplace] = useState("FoodPlace 0")

    // number of donators
    const { runContractFunction: getDonators } = useWeb3Contract({
        abi: abi,
        contractAddress: address,
        functionName: "getDonators",
        params: {},
    })

    async function updateUIValues() {
        const numPlayersFromCall = (await getDonators()).toString()
        setNumberOfPlayers("1")
    }

    async function winner() {
        await contract.pickAWinner()
        const recentWinnerFromCall = await contract.getRecentWinner()
        console.log(recentWinnerFromCall)
        const foodPlace = await contract.getWinnersFoodplace()
        console.log(foodPlace)
        setRecentWinner(recentWinnerFromCall)
        setFoodplace(foodPlace)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUIValues()
            if (seconds === 0) {
                console.log('pick a winner')
            }
        }
    }, [isWeb3Enabled])

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
                random winner will be selected using Chainlink's VRF service.*
            </div>
            <div className="mainHeader">Last month's winner:</div>
            <div className="longBodyText">
                Congratulations to {recentWinner} for winning last month's
                lottery! They win food from {foodplace} !
            </div>
            <div className="mainHeader">Lottery Countdown</div>
            <div className="countdownText">{seconds} s</div>
            {/* testing the manual winner selection */}
            <div className="buttonContainer">
                <button
                    className={`button button-primary button-primary-${
                        isActive ? "active" : "inactive"
                    }`}
                    onClick={toggle}
                >
                    {isActive ? "Pause" : "Start Lottery"}
                </button>
            </div>
            {/* end of testing block */}
            <div className="mainHeader">Number of Donators</div>
            <div className="countdownText">{numberOfPlayers}</div>
            <div className="bottomBox">
                <div className="bottomHeader">How are winners chosen?</div>
                <div className="cardsSub">
                    <p>
                        * To ensure a fair chance for everyone, the lottery uses
                        a verifiable random function (VRF) to select the winner.
                        This service is made by Chainlink and you can find more
                        information about this resource
                        <a
                            href="https://docs.chain.link/docs/chainlink-vrf/"
                            target={"_blank"}
                            rel="noreferrer"
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
