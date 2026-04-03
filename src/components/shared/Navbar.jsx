import { UtensilsCrossed } from "lucide-react";

export default function Navbar({ tableNumber }) {
  return (
    <nav className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md shadow-sm z-30 px-5 py-4 border-b border-gray-100 flex justify-between items-center transition-all duration-300">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg">
          <UtensilsCrossed size={20} />
        </div>
        <div>
          <h1 className="font-primary font-bold text-gray-900 text-xl leading-none">Jambo</h1>
          <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Restaurant</p>
        </div>
      </div>
      
      {tableNumber && (
        <div className="bg-orange-100 text-orange-700 font-bold px-3 py-1.5 rounded-lg border border-orange-200 shadow-sm flex items-center gap-1.5 animate-pulse-slow">
          <span className="text-xs uppercase tracking-wide opacity-80">Table</span>
          <span className="text-lg">{tableNumber}</span>
        </div>
      )}
    </nav>
  );
}
