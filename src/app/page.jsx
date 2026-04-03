import Link from "next/link";
import { UtensilsCrossed, Settings, QrCode } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 max-w-lg w-full border border-white/40 text-center relative z-10 transition-transform duration-500 hover:scale-[1.01]">
        
        <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl mx-auto flex items-center justify-center text-white mb-6 shadow-xl shadow-blue-500/30 ring-8 ring-white">
          <UtensilsCrossed size={48} className="drop-shadow-sm" />
        </div>
        
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight mb-2">
          Jambo
        </h1>
        <p className="text-lg text-slate-500 font-medium mb-10 tracking-widest uppercase">
          Smart QR Dining
        </p>

        <div className="grid grid-cols-1 gap-4">
          <Link href="/admin/dashboard" className="group text-left px-6 py-5 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50/50 transition-all flex items-center justify-between shadow-sm hover:shadow-md">
            <div>
               <h3 className="font-bold text-slate-800 text-xl group-hover:text-blue-700 transition-colors">Admin Dashboard</h3>
               <p className="text-slate-500 font-medium mt-1">Manage live orders & settings</p>
            </div>
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-600 group-hover:scale-110 transition-transform">
               <Settings size={24} />
            </div>
          </Link>
          
          <Link href="/admin/qr-generate" className="group text-left px-6 py-5 rounded-2xl border-2 border-slate-100 hover:border-purple-500 hover:bg-purple-50/50 transition-all flex items-center justify-between shadow-sm hover:shadow-md">
             <div>
               <h3 className="font-bold text-slate-800 text-xl group-hover:text-purple-700 transition-colors">Generate QR</h3>
               <p className="text-slate-500 font-medium mt-1">Print table QR codes</p>
             </div>
             <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-purple-600 group-hover:scale-110 transition-transform">
               <QrCode size={24} />
             </div>
          </Link>

          <Link href="/admin/categories" className="group text-left px-6 py-5 rounded-2xl border-2 border-slate-100 hover:border-pink-500 hover:bg-pink-50/50 transition-all flex items-center justify-between shadow-sm hover:shadow-md">
             <div>
               <h3 className="font-bold text-slate-800 text-xl group-hover:text-pink-700 transition-colors">Categories</h3>
               <p className="text-slate-500 font-medium mt-1">Manage food groups & icons</p>
             </div>
             <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-pink-600 group-hover:scale-110 transition-transform">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
             </div>
          </Link>

          <Link href="/admin/menu-manage" className="group text-left px-6 py-5 rounded-2xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all flex items-center justify-between shadow-sm hover:shadow-md">
             <div>
               <h3 className="font-bold text-slate-800 text-xl group-hover:text-emerald-700 transition-colors">Menu Manage</h3>
               <p className="text-slate-500 font-medium mt-1">Add or edit food items</p>
             </div>
             <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-emerald-600 group-hover:scale-110 transition-transform">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
             </div>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 text-slate-400 font-medium text-sm">
           Designed for seamless hospitality.
        </div>
      </div>
    </div>
  );
}
