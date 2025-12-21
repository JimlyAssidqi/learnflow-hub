// import Echo from "laravel-echo";
// import Pusher from "pusher-js";

// (window as any).Pusher = Pusher;

// const echo = new Echo({
//   broadcaster: "reverb",
//   key: "local",
//   wsHost: "127.0.0.1",
//   wsPort: 8080,
//   wssPort: 8080,
//   forceTLS: false,
//   enabledTransports: ["ws", "wss"],
// });

// export default echo;

import Echo from "laravel-echo";
import Pusher from "pusher-js";

(window as any).Pusher = Pusher;

const echo = new Echo({
  broadcaster: "reverb",
  key: import.meta.env.VITE_REVERB_APP_KEY,
  wsHost: import.meta.env.VITE_REVERB_HOST,
  wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
  wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
  forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? "https") === "https",
  enabledTransports: ["ws", "wss"],
});

export default echo;
