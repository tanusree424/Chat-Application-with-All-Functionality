import React, { useState } from 'react'
import { EyeOff, Eye } from "lucide-react"
import { Api } from '../Api/Api';
import { Link, useNavigate } from 'react-router-dom';
import {toast} from 'react-hot-toast'
import notificationTone from  "../assets/notification.mp3";
const Login = ({setToken}) => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [form, setform] = useState({
   email:"",
   password:""
  });
  const notificationSound  = new Audio(notificationTone);
  notificationSound.volume = 1;
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
        email:form.email,
        password: form.password
    }
   // console.log(formData)
    try {
        const response = await Api.post("/api/login", formData, {withCredentials: true , headers: {Accept:"application/json"}});
       // console.log(response.data)
        if (response.data.success) {
          toast.success(response.data.message);
          notificationSound.currentTime = 0; // reset
          notificationSound.play().catch(err => {
            console.log("Sound play blocked:", err);
          });
             localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        setToken(response.data.token) // 🔥 triggers re-render
        navigate("/home");
        }
       
    } catch (error) {
        console.log(error.message)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen w-full bg-blue-400">
      <div className="w-[400px]">
        
        <div className="border border-pink-500 p-4 bg-pink-300 text-center">
          <h2 className="text-xl font-semibold text-white">Login</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4 bg-white border">

            {/* Email */}
            <div className="mb-4">
              <label className="font-semibold text-lg block mb-1">
                Email
              </label>
              <input
                type="text"
                value={form.email}
                onChange={(e)=> setform({...form , email: e.target.value})}
                placeholder="Enter Email Address"
                className="w-full border-gray-400 border-2 p-2"
              />
            </div>

            {/* Password */}
            <div className="mb-4 relative">
              <label className="font-semibold text-lg block mb-1">
                Password
              </label>

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                value={form.password}
                onChange={(e)=> setform({...form , password: e.target.value})}
                className="w-full border-gray-400 border-2 p-2 pr-10"
              />

              {showPassword ? (
                <EyeOff
                  className="absolute right-3 top-10 cursor-pointer"
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <Eye
                  className="absolute right-3 top-10 cursor-pointer"
                  onClick={() => setShowPassword(true)}
                />
              )}
            </div>

            {/* Button */}
            <button className="bg-blue-500 font-semibold w-full py-3 text-lg cursor-pointer hover:bg-blue-700 text-white">
              Login
            </button>
            <p className='py-2'>Don't have an Account? <Link className='text-blue-800 font-semibold' to={"/signup"} > Register</Link></p>

          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
