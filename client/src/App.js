import './App.css';
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Signup from './components/Signup';
import Login from './components/Login';
import Home from './components/Home';
import Layout from './components/Layout';
import Navbar from './components/Navbar';

function App() {
  return (
    <>
      <Navbar />
      <BrowserRouter>
        <Routes>
          <Route path="/">
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
