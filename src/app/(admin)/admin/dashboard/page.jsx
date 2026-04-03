"use client";
import { useEffect, useState } from "react";
import OrderCard from "@/components/admin/OrderCard";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { LayoutDashboard } from "lucide-react";

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // API se orders fetch karne ka function
  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) fetchOrders(); 
  };

  useEffect(() => {
    fetchOrders(); 
    const interval = setInterval(fetchOrders, 5000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20">
            <LayoutDashboard size={28} />
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Live Dashboard</h1>
        </div>
        <a href="/admin/history" className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 font-bold py-2.5 px-5 rounded-xl shadow-sm transition-all focus:ring-4 focus:ring-indigo-100">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
           Order History
        </a>
      </div>
      
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} onUpdateStatus={updateStatus} onRefresh={fetchOrders} />
          ))}

          {orders.length === 0 && (
            <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-gray-300 text-center shadow-sm">
               <div className="text-gray-300 mb-3 flex justify-center">
                 <LayoutDashboard size={48} />
               </div>
               <h3 className="text-xl font-bold text-gray-500">No Active Orders</h3>
               <p className="text-gray-400 mt-1">Waiting for customers to scan and order...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}