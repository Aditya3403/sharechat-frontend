import './App.css';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Home from './Components/Home';
import Chat from './Components/Chat';
import LogIn from './Components/LogIn';
import ProtectRoute from './Components/Auth/ProtectRoute';
import PageNotFound from './Components/PageNotFound';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

function App() {
  const [user, setUser] = useState(false);

  useEffect(() => {
    // Check if the user is authenticated by looking for the token in cookies
    const token = Cookies.get('token');
    if (token) {
      setUser(true);
    } else {
      setUser(false);
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProtectRoute user={user}><Home /></ProtectRoute>} />
        <Route path="/chat/:chatId" element={<ProtectRoute user={user}><Chat /></ProtectRoute>} />
        <Route path="/login" element={<LogIn setUser={setUser} />} />
        <Route path="/*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
