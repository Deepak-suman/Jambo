"use client";
import React, { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOrderPolling } from "@/hooks/useOrderPolling";
import Navbar from "@/components/shared/Navbar";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { CheckCircle2, Clock, ChefHat, ArrowLeft, Trash2, Edit2, X, Check, Star } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

function RatingModal({ orderId, onClose }) {
  const [ratings, setRatings] = React.useState({
    foodTaste: 0, service: 0, cleanliness: 0, chef: 0, staff: 0, seatingComfort: 0
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const submitRating = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ratings)
      });
      if (res.ok) {
        toast.success("Thank you for your feedback!");
      }
      onClose(); 
    } catch {
      toast.error("Something went wrong.");
      onClose();
    }
  };

  const StarRow = ({ label, field }) => (
    <div className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0">
      <span className="font-semibold text-gray-700">{label}</span>
      <div className="flex gap-1">
        {[1,2,3,4,5].map(star => (
           <Star 
             key={star} 
             size={24} 
             className={`cursor-pointer transition-all hover:scale-110 active:scale-95 ${ratings[field] >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
             onClick={() => setRatings(prev => ({...prev, [field]: star}))}
           />
        ))}
      </div>
    </div>
  );

  return (
     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
       <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 animate-slide-up relative">
         <button onClick={onClose} className="absolute right-4 top-4 p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
         </button>
         <h2 className="text-2xl font-black text-slate-800 mb-1">Rate Your Experience 🌟</h2>
         <p className="text-sm text-gray-500 font-medium mb-6">Tap the stars to leave feedback.</p>
         
         <div className="flex flex-col mb-6 bg-slate-50/50 rounded-2xl p-4 border border-slate-100 shadow-sm">
           <StarRow label="Food Taste" field="foodTaste" />
           <StarRow label="Service" field="service" />
           <StarRow label="Cleanliness" field="cleanliness" />
           <StarRow label="Chef" field="chef" />
           <StarRow label="Staff" field="staff" />
           <StarRow label="Comfort" field="seatingComfort" />
         </div>

         <button 
           onClick={submitRating}
           disabled={isSubmitting}
           className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-600/20 transition-transform active:scale-95 disabled:opacity-50"
         >
           {isSubmitting ? "Submitting..." : "Submit Feedback"}
         </button>
       </div>
     </div>
  );
}

function OrderItemRow({ item, orderId, now }) {
  const addedTime = new Date(item.addedAt).getTime();
  const isEditable = (now - addedTime) <= 30000;
  const [isEditing, setIsEditing] = React.useState(false);
  const [editQty, setEditQty] = React.useState(item.quantity);

  const handleDelete = async () => {
    toast.loading("Removing...", { id: "del" });
    const res = await fetch(`/api/orders/${orderId}/items/${item.id}`, { method: "DELETE" });
    if (res.ok) toast.success("Item removed", { id: "del" });
    else toast.error("Too late to remove", { id: "del" });
  };

  const handleSaveEdit = async () => {
    toast.loading("Updating...", { id: "upd" });
    const res = await fetch(`/api/orders/${orderId}/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: editQty })
    });
    if (res.ok) {
      toast.success("Updated", { id: "upd" });
      setIsEditing(false);
    } else {
      toast.error("Update failed", { id: "upd" });
    }
  };

  return (
    <li className="flex justify-between items-start text-gray-700 font-medium bg-gray-50/50 p-2 rounded-lg relative overflow-hidden group">
      <div className="flex items-start gap-3 flex-1 relative z-10">
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 bg-white rounded-lg border border-indigo-200 p-1 shadow-sm">
              <button className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded text-gray-600 font-bold" onClick={() => setEditQty(Math.max(1, editQty - 1))}>-</button>
              <span className="w-4 text-center text-sm font-bold">{editQty}</span>
              <button className="w-6 h-6 flex items-center justify-center bg-indigo-100 text-indigo-700 rounded font-bold" onClick={() => setEditQty(editQty + 1)}>+</button>
            </div>
            <div className="flex gap-1">
              <button onClick={handleSaveEdit} className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200"><Check size={14}/></button>
              <button onClick={() => setIsEditing(false)} className="p-1 bg-red-100 text-red-700 rounded hover:bg-red-200"><X size={14}/></button>
            </div>
          </div>
        ) : (
          <span className="bg-white text-gray-600 border border-gray-200 shadow-sm w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold shrink-0 mt-0.5">
            {item.quantity}
          </span>
        )}
        <div className="flex flex-col pr-8">
           <span className="text-gray-900 leading-tight">{item.menuItem.name}</span>
           {item.size && (
             <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
               {item.size}
             </span>
           )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 relative z-10 shrink-0 pl-2">
        <span className="text-gray-900 font-bold">
          ₹{(item.size === 'Half' && item.menuItem.halfPrice ? item.menuItem.halfPrice : item.menuItem.price) * item.quantity}
        </span>
        {isEditable && !isEditing && (
          <div className="flex gap-1 mt-1">
            <button onClick={() => setIsEditing(true)} className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-blue-100/50">
              <Edit2 size={13} />
            </button>
            <button onClick={handleDelete} className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-red-100/50">
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>
      {isEditable && (
         <div className="absolute inset-x-0 bottom-0 h-0.5 bg-indigo-100 overflow-hidden">
           <div className="h-full bg-indigo-500 animate-[shrink_30s_linear]" style={{animationPlayState: isEditing ? 'paused' : 'running', width: '100%', transformOrigin: 'left'}} />
         </div>
      )}
    </li>
  );
}

export default function OrderStatusPage({ params }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  
  const [now, setNow] = React.useState(Date.now());
  const [hasRated, setHasRated] = React.useState(false);
  const [isPaidLocally, setIsPaidLocally] = React.useState(false);
  const [isCashLocally, setIsCashLocally] = React.useState(false);
  const { order, loading, error } = useOrderPolling(unwrappedParams.orderId, 3000); // 3 sec poll

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (order?.status === "CLOSED") {
      toast.success("Table Reset! Session Complete.", { duration: 3000 });
      router.push(`/thank-you`);
    }
  }, [order?.status, router]);

  if (loading) return <LoadingSpinner fullScreen />;

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-100 text-red-600 p-4 rounded-xl mb-4 font-semibold shadow-sm w-full max-w-sm">
          Failed to load order.
        </div>
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 font-bold text-gray-700 bg-white border px-6 py-3 rounded-full shadow hover:bg-gray-50"
        >
          <ArrowLeft size={20} /> Go Back
        </button>
      </div>
    );
  }

  const steps = [
    { key: "ACTIVE", label: "Order Placed", icon: Clock },
    { key: "PREPARING", label: "Preparing", icon: ChefHat },
    { key: "COMPLETED", label: "Ready / Served", icon: CheckCircle2 }
  ];

  const currentStepIndex = steps.findIndex(s => s.key === order.status);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar tableNumber={order.tableNumber} />
      <Toaster position="top-center" />
      
      <div className="pt-24 px-4 max-w-lg mx-auto pb-20">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-6 text-center animate-slide-up">
          <div className="flex justify-between items-start mb-8 border-b pb-6">
            <div className="text-left">
              <h2 className="text-3xl font-black text-gray-900 mb-1">Order Tracking</h2>
              <p className="font-semibold text-gray-500 text-sm">
                Order ID: #{order.id} &bull; Name: {order.customerName || "Guest"}
              </p>
            </div>
            {order.status !== "CLOSED" && !order.isPaid && !order.isBillRequested && (
              <button 
                onClick={() => router.push(`/menu?table=${order.tableNumber}`)} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm shadow-indigo-600/20 transition-all active:scale-95 whitespace-nowrap"
              >
                + Order More
              </button>
            )}
          </div>
          
          <div className="flex flex-col gap-6 relative before:absolute before:inset-0 before:ml-[1.4rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
            {steps.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const Icon = step.icon;

              return (
                <div key={step.key} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-4 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-colors duration-500 z-10 
                    ${isPast || isCurrent 
                      ? "bg-blue-600 border-blue-200 text-white" 
                      : "bg-gray-100 border-white text-gray-400"}`}>
                    <Icon size={20} className={isCurrent ? "animate-pulse" : ""} />
                  </div>
                  
                  <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] ml-4 md:ml-0 p-4 rounded-xl shadow-sm border font-bold transition-all
                    ${isCurrent ? "bg-blue-50 border-blue-200 text-blue-800 scale-[1.02]" : 
                      isPast ? "bg-white border-gray-100 text-gray-800" : 
                      "bg-gray-50/50 border-gray-100 text-gray-400 opacity-70"}
                  `}>
                    {step.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-fade-in delay-150">
          <h3 className="font-bold text-lg mb-4 text-gray-800">Order Summary</h3>
          <div className="space-y-6 mb-4">
            {Object.entries(
              order.items.reduce((acc, item) => {
                const round = item.roundNumber || 1;
                if (!acc[round]) acc[round] = [];
                acc[round].push(item);
                return acc;
              }, {})
            ).map(([round, itemsInRound]) => {
              const addedAtTime = new Date(itemsInRound[0].addedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return (
                <div key={round}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs uppercase font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {round == 1 ? "1st" : round == 2 ? "2nd" : round == 3 ? "3rd" : `${round}th`} Order &bull; {addedAtTime}
                    </span>
                    <div className="h-px bg-gray-200 flex-1"></div>
                  </div>
                  <ul className="space-y-3">
                    {itemsInRound.map((item, idx) => (
                      <OrderItemRow key={item.id || idx} item={item} orderId={order.id} now={now} />
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between items-center font-bold text-xl pt-4 border-t border-gray-100 text-gray-900">
            <span>Total</span>
            <span className="text-green-600 bg-green-50 px-3 py-1 rounded-lg">₹{order.totalAmount}</span>
          </div>
        </div>

        {order.status === "COMPLETED" && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-slide-up">
            {!order.isBillRequested ? (
               <div className="text-center">
                 <h3 className="font-black text-xl mb-2 text-slate-800">Enjoy your meal!</h3>
                 <p className="text-slate-500 text-sm font-medium">
                   Your order is fully served. 
                   Wait for the admin to send the final bill.
                 </p>
               </div>
            ) : (!order.isBillApproved && !isCashLocally) ? (
               <div className="text-center animate-fade-in">
                 <div className="bg-blue-50 text-blue-700 py-2 px-4 rounded-xl font-bold mb-4 inline-block border border-blue-100">
                   Total Bill: ₹{order.totalAmount}
                 </div>
                 <h3 className="font-black text-xl mb-2 text-slate-800">Please Confirm Bill & Choose Payment</h3>
                 <p className="text-slate-500 text-sm font-medium mb-6">
                   How would you like to pay?
                 </p>
                 <div className="flex gap-3">
                   <button 
                     onClick={async () => {
                       toast.loading("Approving...", { id: "bill" });
                       await fetch(`/api/orders/${order.id}`, { 
                         method: "PATCH",
                         headers: {'Content-Type': 'application/json'},
                         body: JSON.stringify({ isBillApproved: true, paymentMode: "ONLINE" })
                       });
                       toast.success("Bill Approved!", { id: "bill" });
                     }}
                     className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-600/30 transition-transform active:scale-95"
                   >
                     Pay Online
                   </button>
                   <button 
                     onClick={async () => {
                       toast.loading("Approving...", { id: "bill" });
                       await fetch(`/api/orders/${order.id}`, { 
                         method: "PATCH",
                         headers: {'Content-Type': 'application/json'},
                         body: JSON.stringify({ isBillApproved: true, paymentMode: "CASH" })
                       });
                       toast.success("Cash Selected!", { id: "bill" });
                       setIsCashLocally(true);
                     }}
                     className="flex-1 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 font-bold py-4 rounded-xl transition-transform active:scale-95"
                   >
                     Pay Cash
                   </button>
                 </div>
               </div>
            ) : (!order.isPaid && !isPaidLocally) ? (
               <div className="text-center">
                 {order.paymentMode === "ONLINE" ? (
                   <>
                     <h3 className="font-black text-xl mb-4 text-slate-800">Online Checkout</h3>
                     <button 
                       onClick={async () => {
                         toast.loading("Initiating UPI...", { id: "upi" });
                         setTimeout(async () => {
                           await fetch(`/api/orders/${order.id}`, { 
                             method: "PATCH",
                             headers: {'Content-Type': 'application/json'},
                             body: JSON.stringify({ isPaid: true })
                           });
                           toast.success("Payment Successful!", { id: "upi" });
                           setIsPaidLocally(true);
                         }, 1500);
                       }}
                       className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-transform active:scale-95"
                     >
                       Pay ₹{order.totalAmount} via UPI Mock
                     </button>
                   </>
                 ) : (
                   <>
                     <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                       <Clock size={32} />
                     </div>
                     <h3 className="font-black text-xl text-slate-800">Cash Payment Requested</h3>
                     <p className="text-slate-500 text-sm font-medium mt-1">Please pay ₹{order.totalAmount} to the waiter/counter.</p>
                   </>
                 )}
               </div>
            ) : (
               <div className="text-center py-4">
                 <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                   <CheckCircle2 size={32} />
                 </div>
                 <h3 className="font-black text-xl text-slate-800">Payment Complete</h3>
                 <p className="text-slate-500 text-sm font-medium mt-1">Waiting for admin to clear the table...</p>
               </div>
            )}
          </div>
        )}

      </div>

      {order.status === "COMPLETED" && (order.isPaid || isPaidLocally || order.paymentMode === "CASH" || isCashLocally) && !hasRated && (
         <RatingModal orderId={order.id} onClose={() => setHasRated(true)} />
      )}
    </div>
  );
}