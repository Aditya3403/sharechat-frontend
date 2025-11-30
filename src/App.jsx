import './App.css';
import { Routes, Route, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(false);
      setLoading(false);
      // navigate("/login");
      return;
    }

    setUser(true);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={user ? <ProtectRoute user={user}><Home /></ProtectRoute> : <LandingPage />} />
      <Route path="/chat/:chatId" element={<ProtectRoute user={user}><Chat /></ProtectRoute>} />
      <Route path="/login" element={<LogIn setUser={setUser} />} />
      <Route path="/onboarding" element={<ProtectRoute user={user}><OnboardingForm setUser={setUser}/></ProtectRoute>} />
      <Route path="/*" element={<PageNotFound />} />
    </Routes>
  );
}

export default App;
