import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

      </Routes>
    </BrowserRouter>
  );
}
