import { createContext, useContext, useState, useCallback } from "react";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // إضافة إشعار جديد
  const addNotification = useCallback((order) => {
    const notif = {
      id: Date.now() + Math.random(),
      orderNumber: order.orderNumber,
      orderId: order._id,
      customerName: order.customerName,
      // message: `طلب جديد من ${order.customerName} (رقم ${order.orderNumber})`,
      message: ` (رقم ${order.orderNumber})  ${order.customerName}  طلب جديد من `,
      read: false,
      timestamp: new Date().toISOString()
    };
    setNotifications((prev) => [notif, ...prev]);
  }, []);

  // تعليم إشعار كمقروء
  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  // تعليم الكل كمقروء
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // عدد غير المقروءة
  const unreadCount = notifications.filter((n) => !n.read).length;

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        unreadCount,
        drawerOpen,
        openDrawer,
        closeDrawer
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => useContext(NotificationContext);
