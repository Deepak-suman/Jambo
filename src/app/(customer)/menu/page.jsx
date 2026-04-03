"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import toast, { Toaster } from "react-hot-toast";
import { CheckCircle2 } from "lucide-react";

import Navbar from "@/components/shared/Navbar";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import MenuCard from "@/components/customer/MenuCard";
import CategoryTabs from "@/components/customer/CategoryTabs";
import CartDrawer from "@/components/customer/CartDrawer";
import OrderForm from "@/components/customer/OrderForm";

function MenuContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tableNumber = searchParams.get("table"); 
  
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const { cart, addToCart, updateQuantity, getCartTotal, clearCart } = useCart();

  useEffect(() => {
    // If no table is specified in the URL, block the flow
    if (!tableNumber) {
      toast.error("Invalid Table! Please scan the QR code again.", { duration: Infinity });
      setLoading(false);
      return;
    }

    const fetchMenu = async () => {
      try {
        const [menuRes, catsRes, statusRes] = await Promise.all([
          fetch("/api/menu"),
          fetch("/api/categories"),
          fetch(`/api/table/${tableNumber}/status`)
        ]);

        if (statusRes.ok) {
           const statusData = await statusRes.json();
           if (statusData.isBlocked) {
             setIsBlocked(true);
             setLoading(false);
             return;
           }
        }

        if (menuRes.ok && catsRes.ok) {
          const menuData = await menuRes.json();
          const catsData = await catsRes.json();
          setMenuItems(menuData);
          setCategories(catsData);
        } else {
          toast.error("Failed to load menu data");
        }
      } catch (error) {
        toast.error("Network error while connecting to server");
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [tableNumber]);

  const handleAddToCart = (item) => {
    addToCart(item);
    toast.success(`Added ${item.name} to cart`);
  };

  const submitOrder = async (customerName) => {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          tableNumber: parseInt(tableNumber), 
          customerName, 
          cartItems: cart 
        }),
      });

      if (res.ok) {
        const data = await res.json();
        clearCart();
        setShowOrderForm(false);
        // Redirect to order status page with the order ID safely
        router.push(`/order-status/${data.orderId}`);
      } else {
        toast.error("Failed to place order. Try again.");
      }
    } catch (error) {
      toast.error("Network error. Try again.");
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!tableNumber) return <div className="h-screen flex items-center justify-center font-bold text-red-500">Missing Table Information in URL</div>;
  if (isBlocked) return (
    <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50 animate-fade-in">
       <div className="text-orange-500 mb-4 bg-orange-100 p-4 rounded-full"><CheckCircle2 size={48} /></div>
       <h2 className="text-2xl font-black text-slate-800">Checkout in Progress</h2>
       <p className="text-slate-500 font-medium mt-2 max-w-xs">New orders cannot be placed at this time. Please wait for the admin to clear your table.</p>
    </div>
  );

  // Filter items based on category selection
  const filteredItems = selectedCategory === "All" 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const handleCheckout = async () => {
    try {
      const res = await fetch(`/api/table/${tableNumber}/status`);
      if (res.ok) {
        const data = await res.json();
        if (data.hasActiveOrder) {
          // Skip modal, place order directly on existing customer name
          await submitOrder(data.customerName);
        } else {
          // Show form for new order entry
          setShowOrderForm(true);
        }
      } else {
        setShowOrderForm(true);
      }
    } catch {
      setShowOrderForm(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <Navbar tableNumber={tableNumber} />
      <Toaster position="top-center" />
      
      <div className="pt-24 px-4 max-w-xl mx-auto">
        <CategoryTabs 
          categories={categories} 
          selected={selectedCategory} 
          onSelect={setSelectedCategory} 
        />
        
        <div className="grid grid-cols-1 gap-4 mt-6">
          {filteredItems.map(item => (
            <MenuCard key={item.id} item={item} onAdd={handleAddToCart} />
          ))}
          {filteredItems.length === 0 && (
             <div className="text-center py-10 text-gray-400 font-medium">No items found in this category.</div>
          )}
        </div>
      </div>

      <CartDrawer 
        cart={cart}
        updateQuantity={updateQuantity}
        getCartTotal={getCartTotal}
        onCheckout={handleCheckout}
      />

      {showOrderForm && (
        <OrderForm 
          tableNumber={tableNumber}
          totalAmount={getCartTotal()}
          onCancel={() => setShowOrderForm(false)}
          onSubmit={submitOrder}
        />
      )}
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <MenuContent />
    </Suspense>
  );
}