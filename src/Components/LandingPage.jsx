import React from 'react';
import '../Styles/LandingPage.css';
import Navbar from "../Components/Navbar/Navbar"

const LandingPage = () => {
    return (
    <div className="container">
    <Navbar/>
      <main className="main">
        <div className="message">
          <h1 className="heading">All of your messages<br/> In one Inbox.</h1>
        </div>

        <div className="cta">
          <button className="download-btn">Get Started</button>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;