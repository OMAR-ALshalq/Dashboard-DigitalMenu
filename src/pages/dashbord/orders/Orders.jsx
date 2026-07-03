import { useState, useEffect } from "react";
import "./Orders.css";
import {
  getOrders,
  updateOrderStatus,
  deleteOrder,
  deleteAllOrders
} from "../../../services/ordersService";
import {
  showSuccess,
  showError,
  showConfirm
} from "../../../Component/toast/Toast";
import { FaEye, FaWhatsapp, FaTrash, FaTrashAlt } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoIosCloseCircle } from "react-icons/io";

import { useSidebar } from "../../../context/SidebarContext";
import LoadingSpinner from "../../../Component/LoadingSpinner/LoadingSpinner";

const statusLabels = {
  new: "جديد",
  preparing: "قيد التحضير",
  ready: "جاهز",
  cancelled: "ملغي"
};

const statusColors = {
  new: "#3498db",
  preparing: "#f39c12",
  ready: "#2ecc71",
  cancelled: "#e74c3c"
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusLoading, setStatusLoading] = useState({});
  const { openMobile } = useSidebar();

  // ✅ دالة جلب الطلبات بصمت (للتحديث الدوري)
  const fetchOrdersSilently = async () => {
    try {
      const { data } = await getOrders();
      setOrders(data.data);
    } catch (err) {
      console.error("فشل التحديث الصامت للطلبات", err);
    }
  };

  // التحميل الأولي مع التحقق من وجود طلب مستهدف من الإشعار
  const fetchOrders = async () => {
    try {
      const { data } = await getOrders();
      setOrders(data.data);

      // ✅ فتح تلقائي لطلب محدد من الإشعار
      const orderId = localStorage.getItem("selectedOrderId");
      if (orderId) {
        const order = data.data.find((o) => o._id === orderId);
        if (order) {
          setSelectedOrder(order);
        }
        localStorage.removeItem("selectedOrderId");
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      showError("فشل جلب الطلبات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
  }, []);

  // ✅ تحديث دوري كل 2 ثانية
  useEffect(() => {
    const interval = setInterval(fetchOrdersSilently, 2000);
    return () => clearInterval(interval);
  }, []);

  // ✅ تعديل دالة تغيير الحالة ليشمل تحديث selectedOrder فوراً
  const handleStatusChange = async (id, newStatus) => {
    setStatusLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await updateOrderStatus(id, newStatus);

      // تحديث مصفوفة الطلبات العامة
      setOrders((prev) =>
        prev.map((order) =>
          order._id === id ? { ...order, status: newStatus } : order
        )
      );

      // ✅ تحديث الطلب المعروض في المودال فوراً إذا كان هو نفسه
      setSelectedOrder((prev) => {
        if (prev && prev._id === id) {
          return { ...prev, status: newStatus };
        }
        return prev;
      });

      showSuccess("تم تحديث الحالة");
    } catch (err) {
      showError(err.response?.data?.message || "فشل التحديث");
    } finally {
      setStatusLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleDeleteOrder = (id) => {
    showConfirm(
      "هل أنت متأكد من حذف هذا الطلب؟",
      "تأكيد الحذف",
      async () => {
        try {
          await deleteOrder(id);
          setOrders((prev) => prev.filter((order) => order._id !== id));
          showSuccess("تم حذف الطلب بنجاح");
        } catch (err) {
          showError(err.response?.data?.message || "فشل حذف الطلب");
        }
      },
      () => {}
    );
  };

  const handleDeleteAllOrders = () => {
    showConfirm(
      "هل أنت متأكد من حذف جميع الطلبات؟ لا يمكن التراجع عن هذا الإجراء.",
      "تأكيد حذف الكل",
      async () => {
        try {
          await deleteAllOrders();
          setOrders([]);
          showSuccess("تم حذف جميع الطلبات");
        } catch (err) {
          showError(err.response?.data?.message || "فشل حذف الطلبات");
        }
      },
      () => {}
    );
  };

  const sendWhatsApp = (order) => {
    if (!order.customerPhone) return;
    const message = `مرحباً ${order.customerName}،\nطلبك رقم ${order.orderNumber} أصبح جاهزاً! 🎉\nشكراً لثقتك.`;
    const url = `https://wa.me/${order.customerPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const total = (items) =>
    items
      .reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 1), 0)
      .toLocaleString();

  const getOrderTypeLabel = (type) => {
    switch (type) {
      case "internal":
        return "داخلي";
      case "takeaway":
        return "سفري";
      case "external":
        return "خارجي";
      default:
        return type;
    }
  };

  const formatPhone = (phone) => {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length > 10) {
      const countryCode = cleaned.slice(0, 3);
      let localNumber = cleaned.slice(3);
      if (localNumber.startsWith(countryCode)) {
        localNumber = localNumber.slice(3);
      }
      const formattedLocal = localNumber.replace(/(\d{3})(?=\d)/g, "$1 ");
      return `${countryCode} ${formattedLocal}`.trim();
    }
    return cleaned.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
  };

  return (
    <div>
      <div className="NavBar-Orders">
        <div className="text-NavBar">
          <h3>الطلبات</h3>
          <p>متابعة وإدارة طلبات العملاء</p>
        </div>
        <div className="button-NavBar">
          <button className="mobile-menu-btn" onClick={openMobile}>
            <GiHamburgerMenu />
          </button>
          {orders.length > 0 && (
            <button
              className="delete-all-btn"
              onClick={handleDeleteAllOrders}
              title="حذف جميع الطلبات"
            >
              <FaTrashAlt /> حذف الكل
            </button>
          )}
        </div>
      </div>

      <div className="orders-container">
        {loading ? (
          <LoadingSpinner text="جاري تحميل الطلبات..." />
        ) : orders.length === 0 ? (
          <p className="empty-orders">لا توجد طلبات</p>
        ) : (
          <>
            <table className="orders-table desktop-only">
              <thead>
                <tr>
                  <th>رقم الطلب</th>
                  <th>الزبون</th>
                  <th>النوع</th>
                  <th>الطاولة</th>
                  <th>الإجمالي</th>
                  <th>الحالة</th>
                  <th>التاريخ</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order.orderNumber}</td>
                    <td>{order.customerName}</td>
                    <td>{getOrderTypeLabel(order.type)}</td>
                    <td>{order.tableNumber || "—"}</td>
                    <td>{total(order.items)} ل.س</td>
                    <td>
                      <span
                        style={{
                          color: statusColors[order.status],
                          fontWeight: "bold"
                        }}
                      >
                        {statusLabels[order.status]}
                      </span>
                    </td>
                    <td>
                      {new Date(order.createdAt).toLocaleDateString("ar-SY")}
                    </td>
                    <td className="actions-cell">
                      <button
                        className="view-btn"
                        onClick={() => setSelectedOrder(order)}
                        title="عرض"
                      >
                        <FaEye />
                      </button>
                      {order.type === "external" &&
                        order.status === "ready" && (
                          <button
                            className="whatsapp-btn"
                            onClick={() => sendWhatsApp(order)}
                            title="واتساب"
                          >
                            <FaWhatsapp />
                          </button>
                        )}
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteOrder(order._id)}
                        title="حذف"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mobile-orders-list">
              {orders.map((order) => (
                <div key={order._id} className="order-card">
                  <div className="order-card-header" dir="rtl">
                    <span className="order-number">{order.orderNumber}</span>
                    <span
                      className="order-status"
                      style={{ color: statusColors[order.status] }}
                    >
                      {statusLabels[order.status]}
                    </span>
                  </div>
                  <div className="order-card-body">
                    <p>
                      <strong>:الزبون</strong>
                      {order.customerName}
                    </p>
                    <p>
                      <strong>:النوع</strong> {getOrderTypeLabel(order.type)}
                    </p>
                    {order.tableNumber && (
                      <p>
                        <strong>:الطاولة</strong> {order.tableNumber}
                      </p>
                    )}
                    <p>
                      <strong>:الاجمالي</strong> {total(order.items)} ل.س
                    </p>
                    <p>
                      <strong>:التاريخ</strong>
                      {new Date(order.createdAt).toLocaleDateString("ar-SY")}
                    </p>
                  </div>
                  <div className="order-card-actions">
                    <button
                      className="view-btn"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <FaEye />
                    </button>
                    {order.type === "external" && order.status === "ready" && (
                      <button
                        className="whatsapp-btn"
                        onClick={() => sendWhatsApp(order)}
                      >
                        <FaWhatsapp />
                      </button>
                    )}
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteOrder(order._id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* مودال تفاصيل الطلب */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="header-order-modal">
              <IoIosCloseCircle
                className="close-icon"
                onClick={() => setSelectedOrder(null)}
              />
              <h3>تفاصيل الطلب {selectedOrder.orderNumber}</h3>
            </div>
            <div className="order-info">
              <p>
                <strong>الزبون:</strong> {selectedOrder.customerName}
              </p>
              {selectedOrder.customerPhone && (
                <p>
                  <strong>الهاتف:</strong>{" "}
                  <span dir="ltr" style={{ unicodeBidi: "embed" }}>
                    {formatPhone(selectedOrder.customerPhone)}
                  </span>
                </p>
              )}
              <p>
                <strong>النوع:</strong> {getOrderTypeLabel(selectedOrder.type)}
              </p>
              {selectedOrder.tableNumber && (
                <p>
                  <strong>رقم الطاولة:</strong> {selectedOrder.tableNumber}
                </p>
              )}
            </div>
            <table className="order-items-table">
              <thead>
                <tr>
                  <th>الكمية</th>
                  <th>الصنف</th>
                  <th>السعر</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.quantity || 1}</td>
                    <td>
                      {item.name}
                      {item.removedDescs?.length > 0 && (
                        <span className="removed">
                          {" "}
                          (تم إزالة: {item.removedDescs.join(", ")})
                        </span>
                      )}
                    </td>
                    <td>
                      {(
                        (item.price || 0) * (item.quantity || 1)
                      ).toLocaleString()}{" "}
                      ل.س
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="total-amount">
              <strong>الإجمالي: {total(selectedOrder.items)} ل.س</strong>
            </p>
            <div className="status-checkboxes">
              <label className="status-label">الحالة:</label>
              <div className="status-options">
                {Object.entries(statusLabels).map(([key, label]) => (
                  <label
                    key={key}
                    className={`status-checkbox ${selectedOrder.status === key ? "checked" : ""}`}
                    style={{ borderColor: statusColors[key] }}
                  >
                    <input
                      type="radio"
                      name={`status-${selectedOrder._id}`}
                      value={key}
                      checked={selectedOrder.status === key}
                      onChange={() =>
                        handleStatusChange(selectedOrder._id, key)
                      }
                      disabled={statusLoading[selectedOrder._id]}
                    />
                    <span
                      className="checkmark-circle"
                      style={{ borderColor: statusColors[key] }}
                    ></span>
                    <span className="status-text">{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="order-modal-actions">
              <button
                className="delete-btn"
                onClick={() => {
                  handleDeleteOrder(selectedOrder._id);
                  setSelectedOrder(null);
                }}
              >
                حذف الطلب
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
