import { useState, useEffect } from "react";

export function useOrderPolling(orderId, intervalMs = 5000) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) return;

    let isMounted = true;
    let timerId;

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch order");
        }
        const data = await res.json();
        
        if (isMounted) {
          setOrder(data);
          setError(null);
          
          // Stop polling if order is closed
          if (data.status === "CLOSED") {
             if (timerId) clearInterval(timerId);
          }
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // Initial fetch
    fetchOrder();

    // Start polling if not closed
    if (!order || order.status !== "CLOSED") {
       timerId = setInterval(fetchOrder, intervalMs);
    }

    return () => {
      isMounted = false;
      if (timerId) clearInterval(timerId);
    };
  }, [orderId, intervalMs, order?.status]); // Re-attach effect correctly

  return { order, loading, error };
}
