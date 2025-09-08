import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Upload from "./pages/Upload";
import Gallery from "./pages/Gallery";
import "./styles/App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* ✅ Default route redirects to upload */}
        <Route path="/" element={<Navigate to="/upload" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/gallery" element={<Gallery />} />
      </Routes>
    </BrowserRouter>
  );
}
