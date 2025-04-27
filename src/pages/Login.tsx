import { useNavigate } from 'react-router-dom';

import { signInWithGoogle } from '../firebase/user';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const userInfo = await signInWithGoogle();
      console.log('Logged in user:', userInfo);
      localStorage.setItem('user', JSON.stringify(userInfo));
      navigate('/'); // redirect to home page after login
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '20vh',
      }}
    >
      <h1>Login to PowderPrep</h1>
      <button onClick={handleLogin} style={{ marginTop: '20px', padding: '10px 20px' }}>
        Sign in with Google
      </button>
    </div>
  );
};

export default Login;
