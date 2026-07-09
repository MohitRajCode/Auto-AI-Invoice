import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Footer from "../components/Footer";
import Pricing from "../components/Pricing";

export default function App() {
  return (
    <div className="min-h-screen font-serif bg-white text-gray-800 antialiased">
      <Navbar />
      <main className="">
        <Hero />
        <div className=" ">
          <Features />
        </div>
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
