"use client";
import React, { useEffect, useState } from "react";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Store, Users, ExternalLink, Activity, ShieldAlert, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

export default function SuperAdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/super-admin/restaurants");
      if (!res.ok) {
        throw new Error("Failed to load dashboard data");
      }
      const parsed = await res.json();
      setData(parsed);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const toggleRestaurantStatus = async (id, currentStatus) => {
    const newStatus = !currentStatus;
    const actionText = newStatus ? "Activating" : "Suspending";
    toast.loading(`${actionText}...`, { id: "status_update" });

    try {
      const res = await fetch(`/api/super-admin/restaurants/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus })
      });

      if (res.ok) {
        toast.success(`Restaurant ${newStatus ? 'Activated' : 'Suspended'}!`, { id: "status_update" });
        setData(prevData => ({
          ...prevData,
          restaurants: prevData.restaurants.map(r => 
            r.id === id ? { ...r, isActive: newStatus } : r
          )
        }));
      } else {
        toast.error("Failed to update status", { id: "status_update" });
      }
    } catch (err) {
      toast.error("Network error. Try again.", { id: "status_update" });
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <div className="text-red-500 font-bold text-center mt-20">{error}</div>;

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <Toaster position="top-right" />
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Platform Overview</h1>
        <p className="text-slate-500 font-medium">Manage and monitor all SaaS tenants.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-xl">
            <Store size={28} />
          </div>
          <div>
            <p className="text-slate-500 font-bold text-sm">Total Tenants</p>
            <h3 className="text-3xl font-black text-slate-800">{data.stats.totalRestaurants}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 flex items-center justify-center rounded-xl">
            <Users size={28} />
          </div>
          <div>
            <p className="text-slate-500 font-bold text-sm">Total Vendors</p>
            <h3 className="text-3xl font-black text-slate-800">{data.stats.totalVendors}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-pink-50 text-pink-500 flex items-center justify-center rounded-xl">
            <Activity size={28} />
          </div>
          <div>
            <p className="text-slate-500 font-bold text-sm">Platform Orders</p>
            <h3 className="text-3xl font-black text-slate-800">{data.stats.platformOrders}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Registered Restaurants</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold text-sm uppercase">
                <th className="p-4 pl-6">Restaurant Name</th>
                <th className="p-4">Owner (Vendor)</th>
                <th className="p-4">Status</th>
                <th className="p-4">Orders</th>
                <th className="p-4 text-right pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {data.restaurants.map(rest => (
                <tr key={rest.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-6">
                    <span className="font-bold text-slate-800 block">{rest.name}</span>
                    <span className="text-xs tracking-wider text-slate-400">/{rest.slug}</span>
                  </td>
                  <td className="p-4">
                    <span className="block">{rest.vendorName}</span>
                    <span className="text-xs text-slate-400">{rest.vendorEmail}</span>
                  </td>
                  <td className="p-4">
                    {rest.isActive ? (
                        <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold bg-green-100 text-green-700">
                            <CheckCircle2 size={14} /> Active
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold bg-red-100 text-red-700">
                            <ShieldAlert size={14} /> Suspended
                        </span>
                    )}
                  </td>
                  <td className="p-4">{rest.totalOrders} <span className="text-xs text-slate-400">({rest.totalItems} items)</span></td>
                  <td className="p-4 text-right pr-6 flex items-center justify-end gap-2">
                     <button
                        onClick={() => toggleRestaurantStatus(rest.id, rest.isActive)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                          rest.isActive 
                           ? "border-red-200 text-red-600 hover:bg-red-50" 
                           : "border-green-200 text-green-600 hover:bg-green-50"
                        }`}
                     >
                       {rest.isActive ? "Suspend" : "Activate"}
                     </button>
                     <Link 
                       href={`/r/${rest.slug}/menu?table=1`} 
                       target="_blank"
                       className="inline-flex items-center justify-center p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
                       title="View Live Menu"
                     >
                       <ExternalLink size={18} />
                     </Link>
                  </td>
                </tr>
              ))}
              {data.restaurants.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">No restaurants onboarded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
