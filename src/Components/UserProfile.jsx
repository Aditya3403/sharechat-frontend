import React, { useState } from 'react';
import '../Styles/UserProfile.css';
import avatar from '../Constants/avatar.jpg';

const UserProfile = () => {

    const [showProfile, setShowProfile] = useState(false);
    const toggleProfile = () => {
        setShowProfile(!showProfile);
    };

    const handleEditProfile = () => {
        // Logic to edit profile
        console.log('Editing profile...');
    };
  return (
    <>
            <div className='userProfile'>
                <div className="profile-icon" onClick={toggleProfile}>
                    <img src={avatar} alt="" />
                </div>
                {showProfile && (
                    <div className="profile-panel">
                        <div className="profile-content">
                            <div className="profile-image">
                                <img src={avatar} alt="Profile" />
                            </div>
                            <div className="profile-details">
                                <div className='about'>
                                    <span>About: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</span>
                                    <i class="fa-solid fa-pen"></i>
                                </div>
                                <div className='phone'>
                                    <span>Phone: 123-456-7890</span>
                                    <i class="fa-solid fa-pen"></i>
                                </div>
                                <div className='joining'>
                                    <span>Date of Joining: January 1, 2022</span>
                                    <i class="fa-solid fa-pen"></i>
                                </div>
                                <div className="handle-Edit-Logout">
                                    <button className="edit-profile" onClick={handleEditProfile}>Edit Profile</button>
                                    <button className="logout">Logout</button>
                                </div>
                                
                            </div>
                        </div>
                    </div>
                )}
            </div>
    
    </>
  )
}

export default UserProfile