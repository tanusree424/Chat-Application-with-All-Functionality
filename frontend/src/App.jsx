import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './Pages/Login'
import Home from './Pages/Home'
import Register from './Pages/Register'
import { Toaster } from 'react-hot-toast'
import './App.css'

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"))

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route
          path="/"
          element={token ? <Home /> : <Login setToken={setToken} />}
        />

        <Route
          path="/home"
          element={token ? <Home /> : <Login setToken={setToken} />}
        />

        <Route path="/signup" element={<Register />} />
      </Routes>
    </>
  )
}

export default App
