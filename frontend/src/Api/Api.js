import axios from "axios";

export const Api = axios.create({
    baseURL:"http://localhost:8000",
    withCredentials:true,
    headers:{
        Accept:"application/json",
        
    }
});
