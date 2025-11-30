import React from 'react';
import '../Styles/LandingPage.css';
import Navbar from "../Components/Navbar/Navbar"
import {Link} from 'react-router-dom'
import { RiAccountCircleFill } from "react-icons/ri";
import { IoChatbubbles } from "react-icons/io5";
import { FaSearch } from "react-icons/fa";
import { motion } from "framer-motion";

const LandingPage = () => {
    return (
    <div className="container">
      <Navbar/>
      <motion.main
        className="main"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="message">
          <motion.h1
            className="heading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          >
            Messaging, done right.<br/>
            <motion.span
              className='second-line'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.35 }}
            >
              Smooth. Minimal. Fast.
            </motion.span>
          </motion.h1>
        </div>

        <motion.div
          className="cta"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.55 }}
        >
          <Link to="/login" className="download-btn">Get Started</Link>
        </motion.div>
      </motion.main>

      <div className="chat-preview-layout">
        <div className="preview-top-header">
          <span>ShareChat</span>
        </div>
        <div className="preview">
          <aside className="prev-profile-sidebar">
            <div className="prev-profile-user">
              <img src="https://i.pravatar.cc/100?img=15" />
            </div>
          </aside>

          <section className="prev-chatlist-section">
            <h2>Chats</h2>
            <div className="prev-chat-search">
              <input type="text" placeholder="Search users" />
            </div>

            <div className="prev-chatlist">
              <div className="prev-chatlist-user" style={{
                backgroundColor:"#fafafa",
              }}>
                <img src="https://i.pravatar.cc/100?img=21" />
                <span>Funny Bansal</span>
              </div>
              <div className="prev-chatlist-user">
                <img src="https://i.pravatar.cc/100?img=18" />
                <span>Memer Dude</span>
              </div>
              <div className="prev-chatlist-user">
                <img src="https://i.pravatar.cc/100?img=30" />
                <span>Skill Smasher</span>
              </div>
            </div>
          </section>

          <section className="prev-chat-panel">

            <div className="prev-chat-header">
              <img src="https://i.pravatar.cc/100?img=21" />
              <h3>Funny Bansal</h3>
            </div>

            <div className="prev-chat-body">
              <div className="date-divider">
                <span>Today</span>
              </div>

              <div className="msg right">
                hey bro
                <span className="time">5:08 PM</span>
              </div>

              <div className="msg left">
                whats up 😂
                <span className="time">5:10 PM</span>
              </div>

              <div className="msg right">
                you're gonna be on the landing page
                <span className="time">5:12 PM</span>
              </div>

              <div className="msg left">
                am i not already 😏
                <span className="time">5:14 PM</span>
              </div>
            </div>

            <div className="prev-chat-input">
              <input disabled placeholder="Type your message..." />
              <button disabled>➤</button>
            </div>

          </section>
        </div>
      </div>

      <section className="steps-section">
        <motion.h2
          className="steps-title"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.4 }}
        >
          Chat effortlessly in just 3 steps<br/>
        </motion.h2>

        <div className="steps-grid">

          <motion.div
            className="step-card glow-card"
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              e.currentTarget.style.setProperty('--x', `${x}px`);
              e.currentTarget.style.setProperty('--y', `${y}px`);
            }}
          >
            <div className="step-icon"><RiAccountCircleFill style={{fontSize:"45px"}}/></div>
            <h3>Sign Up</h3>
            <p>Create your account and set up your profile in seconds.</p>
            <div className="step-number">1</div>
          </motion.div>

          <motion.div
            className="step-card glow-card"
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              e.currentTarget.style.setProperty('--x', `${x}px`);
              e.currentTarget.style.setProperty('--y', `${y}px`);
            }}
          >
            <div className="step-icon"><FaSearch style={{fontSize:"45px"}}/></div>
            <h3>Find a user</h3>
            <p>Find your friends, family members etc without saving their contact details</p>
            <div className="step-number">2</div>
          </motion.div>

          <motion.div
            className="step-card glow-card"
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              e.currentTarget.style.setProperty('--x', `${x}px`);
              e.currentTarget.style.setProperty('--y', `${y}px`);
            }}
          >
            <div className="step-icon"><IoChatbubbles style={{fontSize:"45px"}}/></div>
            <h3>Start Chatting</h3>
            <p>Send messages, media and experience real-time conversations.</p>
            <div className="step-number">3</div>
          </motion.div>

        </div>

      </section>


    </div>
  );
};

export default LandingPage;
