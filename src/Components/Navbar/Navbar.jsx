import React from 'react'
import {Link} from 'react-router-dom'
import "../../Styles/nav.css"

const Navbar = () => {
  return (
    <header className="header">
        <div className="logo">Texts</div>
        <nav className="nav">
          <Link to="/login" className="login-btn">Login</Link>
        </nav>
    </header>
  )
}

export default Navbar
