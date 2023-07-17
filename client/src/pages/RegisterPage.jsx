import { useContext, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../UserContext';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [redirect, setRedirect] = useState(false);
  const { setUserInfo } = useContext(UserContext);

  const handleRegister = async (e) => {
    e.preventDefault();
    const response = await fetch('http://localhost:3000/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      alert('registration failed, try again later');
    } else {
      response.json().then((userInfo) => {
        alert('registration successful');
        console.log(userInfo);
        setUserInfo(userInfo);
        setRedirect(true);
      });
    }
  };

  if (redirect) return <Navigate to={'/'} />;

  return (
    <form action="" className="register" onSubmit={handleRegister}>
      <h1>Register</h1>
      <input
        type="text"
        placeholder="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Register</button>
    </form>
  );
};
export default RegisterPage;
