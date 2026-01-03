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
const 