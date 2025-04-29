import './Login.css';

import { useNavigate } from 'react-router-dom';

import { signInWithGoogle } from '../firebase/user';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const userInfo = await signInWithGoogle();
      localStorage.setItem('user', JSON.stringify(userInfo));
      navigate('/'); // redirect to home page after login
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Welcome to PowderPrep</h1>
        <p>Sign in to start preparing for your ski trips!</p>
        <button className="login-button" onClick={handleLogin}>
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
