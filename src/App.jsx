import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Components/Home';
import LandingPage from './Components/LandingPage';
import Chat from './Components/Chat';
import LogIn from './Components/LogIn';
import ProtectRoute from './Components/Auth/ProtectRoute';
import PageNotFound from './Components/PageNotFound';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import OnboardingForm from './Components/OnboardingForm';

function App() {
  const [user, setUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const cookieToken = Cookies.get('token');
      const localToken = localStorage.getItem('token');
      
      if (cookieToken || localToken) {
        if (localToken && !cookieToken) {
          Cookies.set('token', localToken, { expires: 30 });
        }
        else if (cookieToken && !localToken) {
          localStorage.setItem('token', cookieToken);
        }
        setUser(true);
      } else {
        setUser(false);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <ProtectRoute user={user}><Home /></ProtectRoute> : <LandingPage />} />
        <Route path="/chat/:chatId" element={<ProtectRoute user={user}><Chat /></ProtectRoute>} />
        <Route path="/login" element={<LogIn setUser={setUser} />} />
        <Route path="/onboarding" element={<ProtectRoute user={user}><OnboardingForm /></ProtectRoute>} />
        <Route path="/*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
