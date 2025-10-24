import React, { useState,useEffect } from "react";
import './Register.css'
import axios from 'axios';
import { useNavigate } from "react-router-dom";

function Register() {

  useEffect(() => {
    
    fetch('http://localhost:8082/initialize-database')
      .then((response) => response.json())
      .then((data) => console.log('Database initialization:', data))
      .catch((error) => console.error('Error:', error));
  }, []);
    const [isSignIn, setIsSignIn] = useState(true); // State to toggle between SignIn and SignUp
const[user,setUser]= useState();
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: ''
     
    });
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
  
    const toggleForm = () => {
      setIsSignIn(!isSignIn);
      setFormData({
        name: '',
        email: '',
        password: '',
        // confirmPassword: '',
        // phone: '',
      });
      setError('');
      setSuccess('');
    };
  

  
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      
      setFormData({ ...formData, [name]: value });
    
    };
  
    const handleSignup = async (e) => {
      e.preventDefault();
      const { name, email, password} = formData;
  
      // if (password !== confirmPassword) {
      //   setError('Passwords do not match');
      //   return;
      // }
  
      try {
        const response = await axios.post('http://localhost:8082/signup', { name, email, password });
       
       
        setSuccess(response.data.message);
        setError('');
        setIsSignIn(true); // Switch to Sign In view
        setFormData({ name: '', email: '', password: '' }); 
      } catch (err) {
        setError(err.response?.data?.message || 'Error signing up');
        setSuccess('');
      }
    };
  
    const handleSignin = async (e) => {
      e.preventDefault();
    
      const { email, password } = formData;
      console.log(formData);
    
      if (!email || !password) {
        setError('Email and password are required');
        setSuccess('');
        return;
      }
    
      try {
        const response = await axios.post('http://localhost:8082/signin', { email, password });
    
        // Save token in localStorage or context for future use
        sessionStorage.setItem('token', response.data.token);
        console.log(sessionStorage.getItem('token'));
        setUser({ id: response.data.userId, email });
        setSuccess('Signin successful!');
        navigate('/Home');
        setError('');
      } catch (err) {
        console.error('Error signing in:', err);
        setError(err.response?.data?.message || 'Error signing in');
        setSuccess('');
      }
    };


    
    useEffect(() => {
      const token = sessionStorage.getItem("token");

    
      if (token) {
        console.log("Token exists after refresh:", token);
      } else {
        console.log(" new Token is missing after refresh!");
      }
    }, []);
    
  return (
    <div id="container" className={`container ${isSignIn ? "sign-in" : "sign-up"}`}>
      {/* Form Section */}
      <div className="row">

        {/* Sign Up Form */}
        <div className="col align-items-center flex-col sign-up">
        <div className="form-wrapper align-items-center">
          <div className="form sign-up">
            <form onSubmit={handleSignup}>
              <div className="input-group">
                <i className="bx bxs-user"></i>
                <input
                  type="text"
                  name="name"
                  placeholder="Username"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="input-group">
                <i className="bx bx-mail-send"></i>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="input-group">
                <i className="bx bxs-lock-alt"></i>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              {/* <div className="input-group">
                <i className="bx bxs-lock-alt"></i>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="input-group">
                <i className="bx bxs-phone"></i>
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div> */}
              <button type="submit">Sign up</button>
              <p>
                <span>Already have an account?</span>
                <b onClick={toggleForm} className="pointer">
                  Sign in here
                </b>
              </p>
            </form>
          </div>
        </div>
        </div>

        {/* Sign In Form */}
        <div className="col align-items-center flex-col sign-in">
        <div className="form-wrapper align-items-center">
          <div className="form sign-in">
            <form onSubmit={handleSignin}>
              <div className="input-group">
                <i className="bx bxs-user"></i>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="input-group">
                <i className="bx bxs-lock-alt"></i>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button type="submit">Sign in</button>
              <p>
                <b>Forgot password?</b>
              </p>
              <p>
                <span>Don't have an account?</span>
                <b onClick={toggleForm} className="pointer">
                  Sign up here
                </b>
              </p>
            </form>
          </div>
        </div>
        </div>


      </div>

      {/* Content Section */}
      <div className="row content-row">
        {/* Sign In Content */}
        <div className="col align-items-center flex-col">
          <div className="text sign-in">
            <h2>Welcome</h2>
          </div>
          <div className="img sign-in"></div>
        </div>

        {/* Sign Up Content */}
        <div className="col align-items-center flex-col">
          <div className="img sign-up"></div>
          <div className="text sign-up">
            <h2>Join with us</h2>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register