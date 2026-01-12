import React,{useState} from 'react'
import { useNavigate, Link } from 'react-router-dom';
import { Eye , EyeOff } from 'lucide-react';
import { Api } from '../Api/Api';
import toast from 'react-hot-toast';
const Register = () => {
   const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [form, setform] = useState({
    name:"",
   email:"",
   password:""
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      name:form.name,
        email:form.email,
        password: form.password
    }
   // console.log(formData)
    try {
        const response = await Api.post("/api/signup", formData, {withCredentials: true , headers: {Accept:"application/json"}});
        console.log(response.data)
        if (response.data.success) {
          toast.success(response.data.message);  
        navigate("/");
        }
       
    } catch (error) {
        console.log(error.message)
    }
  }
  return (
      <div className="flex justify-center items-center min-h-screen w-full bg-blue-400">
      <div className="w-[400px]">
        
        <div className="border border-pink-500 p-4 bg-pink-300 text-center">
          <h2 className="text-xl font-semibold text-white">Signup</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4 bg-white border">
             {/* Name */}
            <div className="mb-4">
              <label className="font-semibold text-lg block mb-1">
                Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e)=> setform({...form , name: e.target.value})}
                placeholder="Enter Full Name"
                className="w-full border-gray-400 border-2 p-2"
              />
            </div>
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
              Signup
            </button>
            <p className='py-2'>Already have an Account? <Link className='text-blue-800 font-semibold' to={"/"} >Login</Link></p>

          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
