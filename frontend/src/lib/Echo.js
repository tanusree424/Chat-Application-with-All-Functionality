import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: "reverb",
  key: "localkey",
  wsHost: "127.0.0.1",
  wsPort: 8080,
  forceTLS: false,
  disableStats: true,
   authEndpoint: "http://localhost:8000/broadcasting/auth",

  auth: {
    
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      Accept: "application/json",
    },
  },
});

export default echo;
