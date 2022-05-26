import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import User from "./pages/User";
import Donate from "./components/Donate";
import Restaurant from "./components/Restaurant";
import Rankings from "./pages/Rankings";
import WinFood from "./pages/WinFood";
import Topbar from "./components/Topbar";
import "./App.css";

const App = () => {
  return (
    <>
      <div className="topBanner">
        <Topbar />
      </div>
      <div className="page">
        <div className="mainWindow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/user" element={<User />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/restaurant" element={<Restaurant />} />
            <Route path="/rankings" element={<Rankings />} />
            <Route path="/winfood" element={<WinFood />} />
          </Routes>
        </div>
      </div>
    </>
  );
};

export default App;
