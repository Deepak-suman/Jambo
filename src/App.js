
import React from 'react';
import "./globals.css";
// Agar aap Next.js me hain toh neeche wali line hata dein, normal React me rehne dein
// import './App.css'; 

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center transform transition duration-500 hover:scale-105">
        
        {/* Restaurant Logo / Icon */}
        <div className="text-6xl mb-6">🍽️</div>
        
        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">
          Restaurant System
        </h1>
        <p className="text-gray-500 mb-8 text-sm">
          Scan the QR code on your table to view the menu and place your order instantly!
        </p>
        
        {/* Action Buttons */}
        <div className="space-y-4">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all">
            Go to Admin Dashboard
          </button>
          
          <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all">
            View Customer Menu
          </button>
        </div>

        {/* Footer Text */}
        <div className="mt-8 text-xs text-gray-400 font-semibold">
          Powered by Tailwind CSS 🚀
        </div>
      </div>
    </div>
  );
}

export default App;