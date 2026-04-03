import { ShoppingBag, X, Minus, Plus } from "lucide-react";

export default function CartDrawer({ cart, updateQuantity, getCartTotal, onCheckout }) {
  const total = getCartTotal();

  if (cart.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.1)] rounded-t-3xl border-t border-gray-100 p-5 z-40 animate-slide-up">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-xl flex items-center gap-2 text-gray-800">
          <ShoppingBag className="text-blue-600" /> Cart ({cart.reduce((a, b) => a + b.quantity, 0)})
        </h3>
        <span className="font-bold text-2xl text-green-600">₹{total}</span>
      </div>

      <div className="max-h-48 overflow-y-auto mb-4 pr-2 space-y-3 custom-scrollbar">
        {cart.map((item) => (
          <div key={item.cartItemId} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
            <div className="flex-1 pr-2">
              <p className="font-medium text-gray-800 line-clamp-1">{item.name}</p>
              <div className="flex items-center gap-2">
                 <p className="text-sm text-gray-500">₹{item.price} each</p>
                 {item.size && (
                   <span className="text-[10px] font-bold bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded uppercase tracking-wider">{item.size}</span>
                 )}
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-1 px-2 shadow-sm shrink-0">
              <button 
                onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                className="text-gray-500 hover:text-red-500 p-1"
              >
                <Minus size={16} />
              </button>
              <span className="font-bold w-4 text-center">{item.quantity}</span>
              <button 
                onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                className="text-gray-500 hover:text-green-500 p-1"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onCheckout}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform hover:scale-[1.01] flex justify-center items-center gap-2 text-lg"
      >
        Proceed to Checkout
      </button>
    </div>
  );
}
