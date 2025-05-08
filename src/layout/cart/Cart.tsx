import React, { useState } from "react";
import "./Cart.css";
import { mockCartItems } from "./mockCartItems";

interface CartItem {
  id: number;
  title: string;
  price: number;
  image: string;
  category: string;
  instructor: string;
  quantity: number; // Thêm thuộc tính quantity
}
function Cart() {
  const [cart, setCart] = useState<CartItem[]>(mockCartItems);
  const [totalPrice, setTotalPrice] = useState(
    mockCartItems.reduce((acc, item) => acc + item.price, 0)
  );
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const handleRemoveItem = (id: number) => {
    const updatedCart = cart.filter((item) => item.id !== id);
    setCart(updatedCart);
    const total = updatedCart.reduce((acc, item) => acc + item.price, 0);
    setTotalPrice(total);
  };

  const handleQuantityChange = (id: number, change: number) => {
    const currentItem = cart.find((item) => item.id === id);
    if (!currentItem) return;

    if (currentItem && change === -1 && currentItem.quantity === 1) return;

    const updatedCart = cart.map((item) =>
      item.id === id
        ? { ...item, quantity: (item.quantity || 1) + change }
        : item
    );

    setCart(updatedCart);
    calculateTotal(updatedCart);
  };

  const calculateTotal = (cartItems: CartItem[]) => {
    const subtotal = cartItems.reduce(
      (acc, item) => acc + item.price * (item.quantity || 1),
      0
    );
    const discountAmount = (subtotal * discount) / 100;
    setTotalPrice(subtotal - discountAmount);
  };

  const applyPromoCode = () => {
    // Giả lập mã giảm giá - trong thực tế sẽ gọi API
    if (promoCode === "SUMMER2025") {
      setDiscount(10);
      calculateTotal(cart);
    } else {
      alert("Mã giảm giá không hợp lệ!");
    }
  };

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1>Giỏ hàng của bạn</h1>
      </div>

      <div className="cart-content">
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <svg
                className="cart-empty-img"
                width="120"
                height="120"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="32" cy="32" r="32" fill="#f3f6fb" />
                <rect
                  x="14"
                  y="22"
                  width="36"
                  height="20"
                  rx="4"
                  fill="#e0e7ef"
                />
                <rect x="18" y="26" width="28" height="12" rx="2" fill="#fff" />
                <rect
                  x="22"
                  y="30"
                  width="20"
                  height="4"
                  rx="2"
                  fill="#e0e7ef"
                />
                <circle cx="24" cy="46" r="3" fill="#b0b8c1" />
                <circle cx="40" cy="46" r="3" fill="#b0b8c1" />
                <rect
                  x="28"
                  y="18"
                  width="8"
                  height="8"
                  rx="2"
                  fill="#b0b8c1"
                />
              </svg>
              <div className="cart-empty-title">
                Giỏ hàng của bạn đang trống
              </div>
              <div className="cart-empty-desc">
                Hãy chọn khóa học để thêm vào giỏ hàng!
              </div>
              <a href="/khoa-hoc" className="btn btn-primary cart-empty-btn">
                Khám phá khóa học
              </a>
            </div>
          ) : (
            cart.map((item) => (
              <div className="cart-item-section" key={item.id}>
                <div className="item-checkbox">
                  <input type="checkbox" checked readOnly />
                </div>
                <div className="item-image">
                  <img src={item.image} alt={item.title} />
                </div>
                <div className="item-details">
                  <div className="item-main-info">
                    <h3>{item.title}</h3>
                    <div className="price-info">
                      <span className="original-price">
                        ₫{item.price.toLocaleString()}
                      </span>
                      <span className="current-price">
                        ₫{(item.price * 0.9).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="item-actions">
                    <div className="quantity-controls">
                      <button onClick={() => handleQuantityChange(item.id, -1)}>
                        -
                      </button>
                      <span>{item.quantity || 1}</span>
                      <button onClick={() => handleQuantityChange(item.id, 1)}>
                        +
                      </button>
                    </div>
                    <button
                      className="remove-button"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-summary">
          <div className="promo-code-section">
            <h3>Mã giảm giá</h3>
            <div className="promo-input">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Nhập mã giảm giá"
              />
              <button onClick={applyPromoCode}>Áp dụng</button>
            </div>
          </div>

          <div className="summary-content">
            <div className="summary-row">
              <span>Tạm tính:</span>
              <span>₫{totalPrice.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div className="summary-row discount">
                <span>Giảm giá:</span>
                <span>-{discount}%</span>
              </div>
            )}
            <div className="summary-total">
              <span>Tổng cộng:</span>
              <span>
                ₫{(totalPrice * (1 - discount / 100)).toLocaleString()}
              </span>
            </div>
            <button className="checkout-button">Thanh toán</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
