import React,{useState,useEffect,createContext,useContext,useRef, Children} from "react";
import {BrowserRouter as router,Routes,navigate,useNavigate,useLocation} from "react-router-dom";
//setup//
const AppContext = createContext();
const AppProvider = ({Children}) =>{
  const[user,setUser]=useState(JSON.parse(localStorage.getItem('user'))||null);
  const[restaurants,setRestaurants]=useState(JSON.parse(localStorage.getItem('evalData'))||[]);
  useEffect(()=>{
    localStorage.setItem('evalData',JSON.stringify(restaurants));
  },[restaurants]);
}
const login=(email,password)=>{
  let role=null;
  if (email === 'admin@gmail.com'&& password==='admin1234')role='admin';
  else if (email === 'customer@gmail.com' && password ==='customer1234')role='customer';
  if (role){
    const userData={email,role};
    setUser(userData);
    localStorage.setItem('user',JSON.stringify(userData));
    return role;
  }
  return null;

};
const logout= () =>{
  
}