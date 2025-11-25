import React from 'react'
import '../Styles/Home.css';
import AppLayout from '../layout/AppLayout'

function Home() {
  return (
    <div className='home'>
      <h1>ShareChat for Web</h1>
      <p>Select a user to start the chat.</p>
    
    </div>
    
  )
}

export default AppLayout()(Home)
