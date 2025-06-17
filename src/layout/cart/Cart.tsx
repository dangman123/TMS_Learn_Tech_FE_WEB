import React, { useState, useEffect } from "react";
import "./Cart.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FiShoppingBag, FiTrash2, FiCheck, FiShoppingCart, FiTag, FiGift, FiPackage } from "react-icons/fi";
import { sendActionActivity } from "../../service/WebSocketActions";

interface CourseBundleResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  cost: number | null;
  courses: BundleCourse[];
  discount: number;
  status: string;
  salesCount: number;
  createdAt: string;
  updatedAt: string;
}

interface BundleCourse {
  id: number;
  title: string;
  imageUrl: string;
  price: number;
  author: string;
}

interface CartItem {
  cartId: number;
  cartItemId: number;
  courseId: number | null;
  testId: number | null;
  courseBundleId: number | null;
  price: number;
  cost: number;
  discount: number;
  name: string;
  type: string;
  image: string;
  timestamp: string;
  combos?: ComboRecommendation[]; // Add recommended combos that contain this course
  expanded?: boolean; // Track if combo is expanded to show courses
  comboDetails?: CourseBundleResponse; // Store combo details when expanded
}

interface ComboRecommendation {
  id: number;
  name: string;
  price: number;
  image: string;
  discount: number;
  courseIds: number[];
  description?: string;
  courses?: BundleCourse[];
}

interface AuthData {
  id: number;
  fullname: string;
  email: string;
  roleId: number;
}
interface WalletInfo {
  fullname: string;
  accountId: number;
  balance: number;
  code: string;
  walletId: number;
}
function Cart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [userId, setUserId] = useState<number | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [selectAll, setSelectAll] = useState(false);
  const [expandedCombos, setExpandedCombos] = useState<number[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = getUserData();
    if (userData) {
      setUserId(userData.id);
    }
    fetchCart();
    handleWalletPayment();
  }, []);

  useEffect(() => {
    if (selectAll) {
      const selectableItems = getSelectableItems();
      setSelectedItems(selectableItems);
    } else if (selectedItems.length === getSelectableItems().length && cart.length > 0) {
      setSelectAll(true);
    }
  }, [selectAll, cart]);

  // Check for combo recommendations when cart or selected items change
  useEffect(() => {
    const selectedCourseItems = cart.filter(
      item => item.type === "COURSE" &&
        selectedItems.includes(item.cartItemId) &&
        item.courseId !== null
    );

    // Chỉ fetch recommendations cho những item chưa có
    const itemsNeedingRecs = selectedCourseItems.filter(item => !item.combos);

    if (itemsNeedingRecs.length > 0) {
      fetchComboRecommendations(itemsNeedingRecs);
    }
  }, [selectedItems, cart]);

  // Recalculate total price whenever selected items change
  useEffect(() => {
    const selectedCarts = cart.filter(item => selectedItems.includes(item.cartItemId));
    calculateTotal(selectedCarts);
  }, [selectedItems, cart]);

  const getUserData = (): AuthData | null => {
    const authData = localStorage.getItem("authData");
    if (!authData) return null;

    try {
      return JSON.parse(authData) as AuthData;
    } catch (error) {
      console.error("Lỗi khi lấy authData:", error);
      return null;
    }
  };

  const handleWalletPayment = () => {
    const token = localStorage.getItem("authToken");
    const userData = getUserData();
    const paymentEndpoint = `${process.env.REACT_APP_SERVER_HOST}/api/wallet/info-simple/${userData?.id}`;

    fetch(paymentEndpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setWalletInfo(data.data);
        console.log(data);
        sessionStorage.setItem("walletId", data.data.walletId)
      })
      .catch((error) => {
        console.error("Lỗi thanh toán:", error);
      });
  }

  const getToken = (): string | null => {
    const token = localStorage.getItem("authToken");
    if (!token) return null;

    return token;
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const userData = getUserData();
      const token = getToken();

      if (!userData || !token) {
        setError("Bạn cần đăng nhập để xem giỏ hàng");
        setLoading(false);
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/cart/${userData.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Không thể tải giỏ hàng");
      }

      const responseData = await response.json();

      if (responseData.status === 200 && responseData.data) {
        setCart(responseData.data);
        setSelectedItems([]);
        setSelectAll(false);
        setTotalPrice(0); // Reset total price when cart is loaded
      } else {
        throw new Error("Dữ liệu giỏ hàng không hợp lệ");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải giỏ hàng");
      toast.error("Không thể tải giỏ hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (cartItemId: number) => {
    try {
      const token = getToken();

      if (!token) {
        toast.error("Bạn cần đăng nhập để xóa sản phẩm");
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/cart/${cartItemId}/remove`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Không thể xóa sản phẩm");
      }

      toast.success("Đã xóa sản phẩm khỏi giỏ hàng");

      // Phát sự kiện để cập nhật số lượng giỏ hàng trong header
      window.dispatchEvent(new Event('cart-updated'));

      // Cập nhật UI ngay lập tức
      setCart(prevCart => prevCart.filter(item => item.cartItemId !== cartItemId));

      // Đồng bộ lại với server sau
      fetchCart();
    } catch (err) {
      toast.error("Có lỗi xảy ra khi xóa sản phẩm");
      console.error("Lỗi khi xóa sản phẩm:", err);
    }
  };

  const handleRemoveSelectedItems = async () => {
    if (selectedItems.length === 0) {
      toast.info("Vui lòng chọn sản phẩm để xóa");
      return;
    }

    try {
      const token = getToken();

      if (!token) {
        toast.error("Bạn cần đăng nhập để xóa sản phẩm");
        return;
      }

      const itemsToRemove = [...selectedItems];

      // Cập nhật UI trước
      setCart(prevCart => prevCart.filter(item => !itemsToRemove.includes(item.cartItemId)));
      setSelectedItems([]);

      // Xóa song song trên server
      await Promise.all(
        itemsToRemove.map(cartItemId =>
          fetch(`${process.env.REACT_APP_SERVER_HOST}/api/cart/${cartItemId}/remove`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        )
      );

      toast.success(`Đã xóa ${itemsToRemove.length} sản phẩm khỏi giỏ hàng`);

      window.dispatchEvent(new Event('cart-updated'));

      // Đồng bộ lại state cuối cùng từ server
      fetchCart();
    } catch (err) {
      toast.error("Có lỗi xảy ra khi xóa các sản phẩm đã chọn");
      console.error("Lỗi khi xóa các sản phẩm:", err);
      fetchCart(); // Tải lại giỏ hàng nếu có lỗi
    }
  };

  const toggleSelectItem = (cartItemId: number) => {
    const item = cart.find(item => item.cartItemId === cartItemId);
    
    if (!item) return;
    
    // If trying to select a course that's part of a selected combo
    if (item.type === "COURSE" && item.courseId && 
        !selectedItems.includes(cartItemId) && 
        isCourseInSelectedCombo(item.courseId)) {
      
      toast.info("Khóa học này đã được bao gồm trong combo đã chọn");
      return;
    }
    
    setSelectedItems(prev => {
      if (prev.includes(cartItemId)) {
        const newSelected = prev.filter(id => id !== cartItemId);
        setSelectAll(false);
        return newSelected;
      } else {
        const newSelected = [...prev, cartItemId];
        
        // Check if all selectable items are now selected
        const selectableItems = getSelectableItems();
        if (newSelected.length === selectableItems.length) {
          setSelectAll(true);
        }
        
        return newSelected;
      }
    });
  };

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      const selectableItems = getSelectableItems();
      setSelectedItems(selectableItems);
    } else {
      setSelectedItems([]);
    }
  };

  const calculateTotal = (cartItems: CartItem[]) => {
    const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);
    const discountedTotal = discount > 0 ? subtotal * (1 - discount / 100) : subtotal;
    setTotalPrice(discountedTotal);
  };

  const applyPromoCode = async () => {
    try {
      if (!promoCode.trim()) {
        toast.warning("Vui lòng nhập mã giảm giá");
        return;
      }

      if (selectedItems.length === 0) {
        toast.warning("Vui lòng chọn sản phẩm trước khi áp dụng mã giảm giá");
        return;
      }

      const token = getToken();
      const userData = getUserData();

      if (!token || !userData?.id) {
        toast.error("Bạn cần đăng nhập để áp dụng mã giảm giá");
        return;
      }

      const accountId = userData.id;

      // Gọi API mới để kiểm tra mã giảm giá
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/discounts/payment/validate?accountId=${accountId}&voucherCode=${promoCode}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      const responseData = await response.json();

      if (!response.ok || responseData.status !== 200) {
        toast.error(responseData.message || "Mã giảm giá không hợp lệ hoặc đã hết hạn");
        return;
      }

      if (responseData.status === 200 && responseData.data) {
        const discountPercent = responseData.data.discountValue || 0;
        setDiscount(discountPercent);

        // Tính toán lại tổng tiền với mã giảm giá
        const selectedCarts = cart.filter(item => selectedItems.includes(item.cartItemId));
        const subtotal = selectedCarts.reduce((acc, item) => acc + item.price, 0);
        const discountedTotal = subtotal * (1 - discountPercent / 100);
        setTotalPrice(discountedTotal);

        toast.success(`Áp dụng mã giảm giá thành công: Giảm ${discountPercent}%`);
      } else {
        toast.error(responseData.message || "Mã giảm giá không hợp lệ");
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra khi áp dụng mã giảm giá");
      console.error("Lỗi khi áp dụng mã giảm giá:", err);
    }
  };

  // Function to add a combo to the cart
  const addComboToCart = async (comboId: number, comboPrice: number) => {
    try {
      const token = getToken();

      if (!token) {
        toast.error("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng");
        return;
      }

      // Tạo dữ liệu để gửi lên API
      const cartData = {
        type: "COMBO",
        price: comboPrice,
        courseId: null,
        testId: null,
        courseBundleId: comboId,
        cartItemId: ""
      };

      // Gọi API để thêm combo vào giỏ hàng
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/cart/${userId}/add-item`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(cartData)
        }
      );

      const responseData = await response.json();

      if (responseData.status === 200) {
        toast.success("Đã thêm combo vào giỏ hàng");

        // Phát sự kiện để cập nhật số lượng giỏ hàng trong header
        window.dispatchEvent(new Event('cart-updated'));

        // Cập nhật lại giỏ hàng
        fetchCart();
      } else if (responseData.status === 409) {
        toast.info("Combo này đã có trong giỏ hàng của bạn");
      } else {
        toast.error(responseData.message || "Không thể thêm combo vào giỏ hàng");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi thêm combo vào giỏ hàng");
      console.error("Lỗi khi thêm combo vào giỏ hàng:", error);
    }
  };

  const handleCheckout = async () => {
    try {
      if (walletInfo?.walletId) {

        sessionStorage.setItem("walletId", walletInfo.walletId.toString());
      } else {
        sessionStorage.setItem("walletId", "0");
      }

      const userData = getUserData();
      const accountId = userData?.id;
      if (accountId) {
        const data = { "testId": null, "courseId": null, "lessonId": null, "videoId": null, "action": "Thanh toán" }
        sendActionActivity(accountId?.toString() || "", "/app/purchase_course", data, "Thanh toán khóa học")
      }



      if (selectedItems.length === 0) {
        toast.warning("Vui lòng chọn sản phẩm để thanh toán");
        return;
      }

      const token = getToken();

      if (!token) {
        toast.error("Bạn cần đăng nhập để thanh toán");
        return;
      }

      // Get the selected cart items
      const selectedCartItems = cart.filter(item => selectedItems.includes(item.cartItemId));

      // Save to sessionStorage
      const checkoutData = {
        items: selectedCartItems,
        totalAmount: totalPrice,
        discount: discount
      };

      sessionStorage.setItem("cartcheckout", JSON.stringify(checkoutData));

      navigate("/thanh-toan", {
        state: {
          selectedItems,
          totalAmount: totalPrice,
          discount
        }
      });
    } catch (err) {
      toast.error("Có lỗi xảy ra khi chuyển đến trang thanh toán");
      console.error("Lỗi khi chuyển đến trang thanh toán:", err);
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString() + " ₫";
  };

  // Tính phần trăm giảm giá
  const calculateDiscountPercent = (originalPrice: number, discountedPrice: number) => {
    return Math.round((originalPrice - discountedPrice) / originalPrice * 100);
  };

  // Fetch combo recommendations for selected courses
  const fetchComboRecommendations = async (courseItems: CartItem[]) => {
    try {
      const token = getToken();
      if (!token) return;

      // We'll call the API for each course item to get its bundle recommendations
      const promises = courseItems.map(async (item) => {
        if (!item.courseId) return null;

        const courseId = item.courseId;

        // Use the correct API endpoint as provided
        const apiUrl = `${process.env.REACT_APP_SERVER_HOST}/api/cart/course/${courseId}/bundles`;

        try {
          const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) {
            console.error(`Error fetching recommendations for course ${courseId}:`, response.status);
            return null;
          }

          const data = await response.json();

          if (data.status === 200 && data.data && data.data.length > 0) {
            // Map the API response to match our ComboRecommendation interface
            const combos = data.data.map((bundle: CourseBundleResponse) => ({
              id: bundle.id,
              name: bundle.name,
              price: bundle.price,
              image: bundle.imageUrl,
              discount: bundle.discount || 0,
              description: bundle.description,
              courses: bundle.courses,
              courseIds: bundle.courses ? bundle.courses.map((c: BundleCourse) => c.id) : []
            }));

            return { courseId, combos };
          }
          return null;
        } catch (fetchError) {
          console.error(`Network error fetching recommendations for course ${courseId}:`, fetchError);
          return null;
        }
      });

      const results = await Promise.all(promises);
      const validResults = results.filter(result => result !== null);

      if (validResults.length === 0) {
        return;
      }

      // Update cart items with combo recommendations
      const updatedCart = [...cart];
      validResults.forEach(result => {
        if (!result) return;

        const cartItemIndex = updatedCart.findIndex(
          cartItem => cartItem.courseId === result.courseId
        );

        if (cartItemIndex !== -1) {
          updatedCart[cartItemIndex] = {
            ...updatedCart[cartItemIndex],
            combos: result.combos
          };
        }
      });

      setCart(updatedCart);
    } catch (error) {
      console.error("Error in fetchComboRecommendations:", error);
    }
  };

  // Toggle expansion for combo items
  const toggleComboExpansion = async (cartItem: CartItem) => {
    if (!cartItem.courseBundleId) return;
    
    const comboId = cartItem.courseBundleId;
    
    // If already expanded, collapse it
    if (expandedCombos.includes(cartItem.cartItemId)) {
      setExpandedCombos(prev => prev.filter(id => id !== cartItem.cartItemId));
      return;
    }
    
    try {
      // Fetch combo details
      const token = getToken();
      if (!token) {
        toast.error("Bạn cần đăng nhập để xem chi tiết combo");
        return;
      }
      
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/course-bundle/${comboId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Không thể tải thông tin combo");
      }
      
      const responseData = await response.json();
      
      if (responseData.status === 200 && responseData.data) {
        // Update cart item with combo details
        const updatedCart = cart.map(item => {
          if (item.cartItemId === cartItem.cartItemId) {
            return {
              ...item,
              comboDetails: responseData.data
            };
          }
          return item;
        });
        
        setCart(updatedCart);
        setExpandedCombos(prev => [...prev, cartItem.cartItemId]);
      }
    } catch (err) {
      toast.error("Không thể tải thông tin chi tiết combo");
      console.error("Lỗi khi tải thông tin combo:", err);
    }
  };

  // Helper function to get combo items from cart
  const getComboItems = (): CartItem[] => {
    return cart.filter(item => item.type === "COMBO");
  };

  // Helper function to get all course IDs included in combos
  const getCoursesInCombos = (comboItems: CartItem[]): number[] => {
    const coursesInCombos: number[] = [];
    
    comboItems.forEach(comboItem => {
      if (comboItem.comboDetails && comboItem.comboDetails.courses) {
        comboItem.comboDetails.courses.forEach(course => {
          coursesInCombos.push(course.id);
        });
      }
    });
    
    return coursesInCombos;
  };

  // Helper function to get all selectable cart items
  // (excluding courses that are already part of selected combos)
  const getSelectableItems = (): number[] => {
    // Get all combo items from cart
    const comboItems = getComboItems();
    
    // Get selected combo items
    const selectedCombos = comboItems.filter(combo => 
      selectedItems.includes(combo.cartItemId)
    );
    
    // Get all course IDs that are part of selected combos
    const coursesInSelectedCombos = getCoursesInCombos(selectedCombos);
    
    // Filter cart to exclude courses that are part of selected combos
    return cart.filter(item => {
      if (item.type === "COURSE" && item.courseId && 
          coursesInSelectedCombos.includes(item.courseId)) {
        return false;
      }
      return true;
    }).map(item => item.cartItemId);
  };

  // Helper function to check if a course is in any selected combo
  const isCourseInSelectedCombo = (courseId: number | null): boolean => {
    if (!courseId) return false;
    
    // Get all selected combo items
    const selectedCombos = cart.filter(item => 
      item.type === "COMBO" && 
      selectedItems.includes(item.cartItemId) && 
      item.comboDetails
    );
    
    // Check if course is in any of the selected combos
    for (const combo of selectedCombos) {
      if (combo.comboDetails?.courses.some(course => course.id === courseId)) {
        return true;
      }
    }
    
    return false;
  };

  if (loading) {
    return (
      <div className="cart-container">
        <div className="cart-header">
          <h1>Giỏ hàng của bạn</h1>
        </div>
        <div className="cart-loading">
          <div className="cart-loading-spinner"></div>
          <p>Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  if (error && cart.length === 0) {
    return (
      <div className="cart-container">
        <div className="cart-header">
          <h1>Giỏ hàng của bạn</h1>
        </div>
        <div className="cart-error">
          <p>{error}</p>
          <button onClick={() => navigate("/dang-nhap")} className="btn btn-primary">
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1>Giỏ hàng của bạn</h1>
        <div className="cart-controls">
          {cart.length > 0 && (
            <>
              <div className="select-all-control">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                  />
                  <span className="checkmark"></span>
                  <span className="select-all-text">Chọn tất cả</span>
                </label>
              </div>
              {selectedItems.length > 0 && (
                <button
                  className="btn-delete-selected"
                  onClick={handleRemoveSelectedItems}
                >
                  <FiTrash2 /> Xóa đã chọn ({selectedItems.length})
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="cart-content">
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <FiShoppingBag className="cart-empty-icon" />
              <div className="cart-empty-title">
                Giỏ hàng của bạn đang trống
              </div>
              <div className="cart-empty-desc">
                Hãy chọn khóa học để thêm vào giỏ hàng!
              </div>
              <a href="/khoa-hoc" className="btn-primary cart-empty-btn">
                Khám phá khóa học
              </a>
            </div>
          ) : (
            <>
              {cart.map((item) => (
                <React.Fragment key={item.cartItemId}>
                  <div className={`cart-item ${selectedItems.includes(item.cartItemId) ? 'selected' : ''}`}>
                    <div className="item-checkbox">
                      <label className="checkbox-container">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.cartItemId)}
                          onChange={() => toggleSelectItem(item.cartItemId)}
                        />
                        <span className="checkmark"></span>
                      </label>
                    </div>
                    <div className="item-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="item-content">
                      <div className="item-info">
                        <h3 className="item-title">{item.name}</h3>
                        <div className={`item-type-badge ${item.type.toLowerCase()}-badge`}>
                          {item.type === "COURSE" ? "Khóa học" : item.type === "COMBO" ? "Combo" : "Đề thi"}
                        </div>
                        <div className="item-actions">
                          {item.type === "COMBO" && (
                            <button
                              onClick={() => toggleComboExpansion(item)}
                              className="view-details-btn"
                            >
                              {expandedCombos.includes(item.cartItemId) ? "Ẩn chi tiết" : "Xem chi tiết"}
                            </button>
                          )}
                          <button
                            onClick={() => handleRemoveItem(item.cartItemId)}
                            className="remove-btn"
                          >
                            <FiTrash2 /> Xóa
                          </button>
                        </div>
                      </div>
                      <div className="item-price">
                        {item.discount > 0 && (
                          <div className="item-discount">
                            <FiTag className="discount-icon" />
                            <span>-{calculateDiscountPercent(item.cost, item.price)}%</span>
                          </div>
                        )}
                        <div className="price-wrapper">
                          <div className="current-price">
                            {formatCurrency(item.price)}
                          </div>
                          {item.discount > 0 && (
                            <div className="original-price">
                              {formatCurrency(item.cost)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Combo details when expanded */}
                  {item.type === "COMBO" && 
                   expandedCombos.includes(item.cartItemId) && 
                   item.comboDetails && (
                    <div className="combo-details-wrapper">
                      <div className="combo-details">
                        <div className="combo-details-header">
                          <FiGift className="combo-icon" />
                          <h4>Khóa học trong combo này</h4>
                        </div>
                        <div className="combo-courses-list">
                          {item.comboDetails.courses.map((course) => (
                            <div key={course.id} className="combo-course-item">
                              <div className="combo-course-image">
                                <img src={course.imageUrl} alt={course.title} />
                              </div>
                              <div className="combo-course-info">
                                <h5>{course.title}</h5>
                                <div className="combo-course-author">
                                  <span>Tác giả: {course.author}</span>
                                </div>
                                <div className="combo-course-price">
                                  {formatCurrency(course.price)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Combo Recommendation Section - Now rendered outside cart-item */}
                  {item.type === "COURSE" && selectedItems.includes(item.cartItemId) && item.combos && item.combos.length > 0 && (
                    <div className="combo-recommendation-wrapper">
                      <div className="combo-recommendation">
                        <div className="combo-recommendation-header">
                          <FiPackage className="combo-icon" />
                          <h4>Tiết kiệm hơn với combo</h4>
                        </div>

                        {item.combos.map(combo => {
                          // Get the current course price
                          const currentItemPrice = item.price;

                          // Calculate the savings
                          const combinedPrice = combo.courses ?
                            combo.courses.reduce((sum, course) => sum + course.price, 0) :
                            combo.courseIds.reduce((sum, id) => {
                              const cartItem = cart.find(item => item.courseId === id);
                              return sum + (cartItem ? cartItem.price : 0);
                            }, 0);

                          const savings = combinedPrice - combo.price;
                          const savingsPercent = combinedPrice > 0 ? Math.round((savings / combinedPrice) * 100) : combo.discount;

                          return (
                            <div key={combo.id} className="combo-recommendation-item">
                              <div className="combo-recommendation-container">
                                <div className="combo-recommendation-left">
                                  <div className="combo-recommendation-image">
                                    <img src={combo.image} alt={combo.name} />
                                  </div>
                                  <div className="combo-discount-badge">
                                    <span>-{savingsPercent}%</span>
                                  </div>
                                  <h5 className="combo-title">{combo.name}</h5>
                                  <div className="combo-price-info">
                                    <div className="combo-current-price">{formatCurrency(combo.price)}</div>
                                    <div className="combo-original-price">{formatCurrency(combinedPrice)}</div>
                                  </div>
                                </div>

                                <div className="combo-recommendation-right">
                                  <div className="combo-footer">
                                    <div className="combo-savings">
                                      <div className="savings-label">Tiết kiệm</div>
                                      <div className="savings-value">
                                        <span className="savings-percent">-{savingsPercent}%</span>
                                        <span className="savings-amount">({formatCurrency(savings)})</span>
                                      </div>
                                    </div>

                                    <button
                                      className="combo-view-btn"
                                      onClick={() => navigate(`/combo/${combo.id}`)}
                                    >
                                      Xem combo
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </>
          )}
        </div>

        <div className="cart-summary">
          <div className="summary-header">
            <h2>Tóm tắt đơn hàng</h2>
          </div>

          <div className="summary-content">
            <div className="cart-summary-selection">
              <div className="selection-info">
                <FiShoppingCart className="cart-icon" />
                <div className="selected-count">
                  <span>Đã chọn:</span>
                  <strong>{selectedItems.length}</strong> / {cart.length} sản phẩm
                </div>
              </div>
            </div>

            <div className="summary-row">
              <span>Tổng tiền:</span>
              <span className="summary-amount">
                {selectedItems.length > 0
                  ? formatCurrency(cart
                    .filter(item => selectedItems.includes(item.cartItemId))
                    .reduce((sum, item) => sum + item.price, 0)
                  )
                  : "0 ₫"}
              </span>
            </div>

            <div className="promo-section">
              <h3>Mã giảm giá</h3>
              <div className="promo-input">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Nhập mã giảm giá"
                />
                <button onClick={applyPromoCode} className="promo-apply-btn">Áp dụng</button>
              </div>
            </div>

            {discount > 0 && selectedItems.length > 0 && (
              <div className="summary-row discount">
                <span>Giảm giá:</span>
                <span>-{discount}%</span>
              </div>
            )}

            <div className="summary-row total">
              <span>Tổng thanh toán:</span>
              <span>{selectedItems.length > 0 ? formatCurrency(totalPrice) : "0 ₫"}</span>
            </div>

            <button
              className={`checkout-btn ${selectedItems.length === 0 ? 'disabled' : ''}`}
              onClick={handleCheckout}
              disabled={selectedItems.length === 0}
            >
              Thanh toán ngay
            </button>

            {selectedItems.length === 0 && (
              <div className="checkout-note">Vui lòng chọn ít nhất một sản phẩm để thanh toán</div>
            )}

            <div className="secure-checkout">
              <small>
                <FiCheck className="secure-icon" /> Thanh toán an toàn và bảo mật
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
