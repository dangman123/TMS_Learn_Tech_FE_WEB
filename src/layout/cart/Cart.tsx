import React, { useState } from "react";
import "./Cart.css";
import { mockCartItems } from "./mockCartItems";

interface CartItem {
  id: number;
  title: string;
  price: number;
  originalPrice: number;
  image: string;
  instructor: string;
  quantity: number;
  totalHours?: string;
  totalLessons?: string;
  level?: string;
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
    calculateTotal(updatedCart);
  };

  const calculateTotal = (cartItems: CartItem[]) => {
    const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);
    setTotalPrice(subtotal);
  };

  const applyPromoCode = () => {
    // Giả lập mã giảm giá - trong thực tế sẽ gọi API
    if (promoCode === "SUMMER2025") {
      setDiscount(10);
      const discountedTotal = totalPrice * (1 - discount / 100);
      setTotalPrice(discountedTotal);
    } else {
      alert("Mã giảm giá không hợp lệ!");
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString() + " ₫";
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
              <div className="cart-item" key={item.id}>
                <div className="item-image">
                  <img src={item.image} alt={item.title} />
                </div>
                <div className="item-content">
                  <div className="item-info">
                    <h3 className="item-title">{item.title}</h3>
                    <p className="item-instructor">Bởi {item.instructor}</p>
                    {item.totalHours && (
                      <div className="item-meta">
                        <span>Tổng số {item.totalHours}</span>
                        {item.totalLessons && (
                          <>
                            <span className="dot-separator">•</span>
                            <span>{item.totalLessons}</span>
                          </>
                        )}
                        {item.level && (
                          <>
                            <span className="dot-separator">•</span>
                            <span>{item.level}</span>
                          </>
                        )}
                      </div>
                    )}
                    <div className="item-remove">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="remove-btn"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                  <div className="item-price">
                    <div className="current-price">
                      {formatCurrency(item.price)}
                    </div>
                    <div className="original-price">
                      {formatCurrency(item.originalPrice)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-summary">
          <div className="summary-header">
            <h2>Mã giảm giá</h2>
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
              <span>{formatCurrency(totalPrice)}</span>
            </div>
            <div className="summary-row total">
              <span>Tổng cộng:</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
            <button className="checkout-btn">Thanh toán</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
