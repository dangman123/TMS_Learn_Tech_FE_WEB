import React, { useEffect, useState } from "react";
import "./style.css";

interface CartItem {
  id: number;
  title: string;
  price: number;
  image : string;
}

function Cart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);

  // Lấy giỏ hàng từ sessionStorage khi component được render
  useEffect(() => {
    const cartFromSessionStorage = sessionStorage.getItem("cart");

    if (cartFromSessionStorage) {
      const parsedCart = JSON.parse(cartFromSessionStorage);
      setCart(parsedCart);

      // Tính tổng tiền
      const total = parsedCart.reduce(
        (acc: number, item: CartItem) => acc + item.price,
        0
      );
      setTotalPrice(total);
    }
  }, []);

  // Xóa một khóa học khỏi giỏ hàng
  const handleRemoveItem = (id: number) => {
    const updatedCart = cart.filter((item) => item.id !== id);
    setCart(updatedCart);

    // Cập nhật sessionStorage với giỏ hàng đã được cập nhật
    sessionStorage.setItem("cart", JSON.stringify(updatedCart));

    // Tính lại tổng tiền sau khi xóa
    const total = updatedCart.reduce(
      (acc: number, item: CartItem) => acc + item.price,
      0
    );
    setTotalPrice(total);
    window.location.reload();
  };

  return (
    <div className="container">
      <div className="row text-center">
        <h2>Thông tin khóa học</h2>
      </div>
      <div className="row">
        <div className="col-md-8">
          <div>
            <table className="table_cart">
              <thead>
                <tr>
                  <th>Khóa học</th>
                  <th>Giá</th>
                  <th>Xóa</th>
                </tr>
              </thead>
              <tbody>
                {cart.length > 0 ? (
                  cart.map((item, index) => (
                    <tr key={index}>
                      <td>{item.title}</td>
                      <td>
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(item.price)}
                      </td>
                      <td>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3}>Giỏ hàng trống</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="col-md-4">
          <div className="right_cart">
            <span>Tổng tiền:</span>
            <span>
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(totalPrice)}
            </span>
          </div>
          {cart.length > 0 && (
            <div className="submit_cart">
              <button>
                <a
                  href="/khoa-hoc/thanh-toan"
                  className="btn-one"
                  data-wow-delay="600ms"
                  data-wow-duration="1500ms"
                >
                  Xác nhận thanh toán
                  <i className="fa-light fa-arrow-right-long"></i>
                </a>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Cart;
