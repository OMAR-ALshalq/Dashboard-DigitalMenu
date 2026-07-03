import { useNotifications } from "../../context/NotificationContext";
import { useNavigate } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import "./Notifications.css";

export default function NotificationDrawer() {
  const { notifications, drawerOpen, closeDrawer, markAsRead, markAllAsRead } =
    useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (notif) => {
    markAsRead(notif.id);
    // تخزين orderId للانتقال لاحقاً
    localStorage.setItem("selectedOrderId", notif.orderId);
    closeDrawer();
    navigate("/dashbord/orders");
  };

  if (!drawerOpen) return null;

  return (
    <>
      <div className="drawer-overlay" onClick={closeDrawer}></div>
      <div className="notification-drawer">
        <div className="drawer-header">
          <h3>الإشعارات</h3>
          <div className="drawer-header-actions">
            {notifications.length > 0 && (
              <button onClick={markAllAsRead} className="mark-all-btn">
                تعليم الكل مقروء
              </button>
            )}
            <IoClose className="drawer-close-icon" onClick={closeDrawer} />
          </div>
        </div>
        <div className="drawer-body">
          {notifications.length === 0 ? (
            <p className="empty-notifications">لا توجد إشعارات</p>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`notification-item ${!notif.read ? "unread" : ""}`}
                onClick={() => handleNotificationClick(notif)}
              >
                <div className="notif-content">
                  <span className="notif-message">{notif.message}</span>
                  <span className="notif-time">
                    {new Date(notif.timestamp).toLocaleTimeString("ar-SY", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
