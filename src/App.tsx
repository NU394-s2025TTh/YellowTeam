import './App.css';

import React from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import logo from './assets/PowderPrep-Logo.png';
import skislope from './assets/skislope.png';
import Home from './components/Home/Home';
import ProtectedRoute from './components/ProtectedRoute';
import SearchPage from './components/SearchPage/SearchPage';
import WardrobePage from './components/Wardrobe/WardrobePage';
import Login from './pages/Login';
import { UserContextProvider } from './providers/UserProvider';
import { WardrobeContextProvider } from './providers/WardrobeProvider';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // const [user, setUser] = useState<User | null>(null);

  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
  //     setUser(firebaseUser);
  //   });
  //   return () => unsubscribe();
  // }, []);

  return (
    <UserContextProvider>
      <WardrobeContextProvider>
        <div
          className="App"
          style={{
            backgroundImage: `url(${skislope})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '100vh',
          }}
        >
          {location.pathname !== '/login' && (
            <div className="top-nav-wrapper">
              <nav className="top-nav">
                <div
                  className="logo"
                  onClick={() => navigate('/')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') navigate('/');
                  }}
                  tabIndex={0}
                  role="button"
                >
                  <img src={logo} alt="PowderPrep Logo" className="logo-icon" />
                  <span>PowderPrep</span>
                </div>
                <div className="nav-links">
                  <button
                    className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                    onClick={() => navigate('/')}
                  >
                    Home
                  </button>
                  <button
                    className={`nav-link ${location.pathname === '/search' ? 'active' : ''}`}
                    onClick={() => navigate('/search')}
                  >
                    Search
                  </button>
                  <button
                    className={`nav-link ${location.pathname === '/wardrobe' ? 'active' : ''}`}
                    onClick={() => navigate('/wardrobe')}
                  >
                    Wardrobe
                  </button>
                </div>
              </nav>
            </div>
          )}

          <header className="App-header">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/search"
                element={
                  <ProtectedRoute>
                    <SearchPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wardrobe"
                element={
                  <ProtectedRoute>
                    <WardrobePage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </header>
        </div>
      </WardrobeContextProvider>
    </UserContextProvider>
  );
}
