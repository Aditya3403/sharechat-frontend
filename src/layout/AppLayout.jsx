import React from 'react'
import Navbar from '../Components/Navbar'
import ChatList from '../Shared/ChatList'
import '../Styles/AppLayout.css';
import UserProfile from '../Components/UserProfile';

const AppLayout = () =>(WrappedComponent)=> {
  return(props)=>{
    return(
        <>
            <Navbar />
            <div className='content'>
                <div className="userProfile">
                    <UserProfile/>
                    
                </div>
                <div className='chatList'>
                    <ChatList chats={[1,2,3,4,5,6,7]} />
                </div>

                <div className="home-chatArea">
                    <WrappedComponent {...props}/>
                </div>
                

            </div>
            
        </>
    )
  }
}

export default AppLayout