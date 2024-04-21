import './App.css';
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Signup from './components/Signup';
import Login from './components/Login';
import Home from './components/Home';
import Layout from './components/Layout';
import Sidebar from './components/Sidebar';

if (localStorage.getItem('loginID')) {
  
}

function App() {
  return (
    <BrowserRouter>
      <Home />
      <Routes>
        <Route path='/'>
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="sidebar" element={<Sidebar />} />
        </Route>
      </Routes>
    </BrowserRouter >
  );
}

export default App;
