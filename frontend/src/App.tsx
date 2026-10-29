import { useState } from "react";
import Checkout from "./pages/Checkout";
import Register from "./pages/Register";

export default function App() {
  const [view, setView] = useState<"checkout" | "register">("checkout");
  return (
    <div className="shell">
      <nav className="nav">
        <strong>Parcel&nbsp;Desk</strong>
        <div>
          <button className={view === "checkout" ? "tab active" : "tab"} onClick={() => setView("checkout")}>
            Checkout
          </button>
          <button className={view === "register" ? "tab active" : "tab"} onClick={() => setView("register")}>
            Register
          </button>
        </div>
      </nav>
      <main>{view === "checkout" ? <Checkout /> : <Register />}</main>
    </div>
  );
}
