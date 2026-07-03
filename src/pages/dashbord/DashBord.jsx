import { useEffect, useState, useRef } from "react";
import { Outlet } from "react-router-dom";
import "./DashBord.css";
import SidebarContent from "../../Component/SidebarContent/SidebarContent";
import { SidebarProvider, useSidebar } from "../../context/SidebarContext";

// الإشعارات
import {
  NotificationProvider,
  useNotifications
} from "../../context/NotificationContext";
import NotificationIcon from "../../Component/Notifications/NotificationIcon";
import NotificationDrawer from "../../Component/Notifications/NotificationDrawer";
import {
  connectSocket,
  disconnectSocket,
  subscribeToNewOrder
} from "../../services/socketService";

function MobileSidebar() {
  const { isMobileOpen, closeMobile } = useSidebar();
  return (
    <>
      {isMobileOpen && (
        <div className="sidebar-overlay" onClick={closeMobile}></div>
      )}
      <div className={`mobile-sidebar ${isMobileOpen ? "open" : ""}`}>
        <SidebarContent onLinkClick={closeMobile} />
      </div>
    </>
  );
}

// مكون داخلي يدير الإشعارات والتوست والصوت
function DashboardContent() {
  const { addNotification } = useNotifications();
  const [currentToast, setCurrentToast] = useState(null);
  const audioRef = useRef(null); // ✅ مرجع لعنصر الصوت

  useEffect(() => {
    const token = localStorage.getItem("token");
    connectSocket(token);
    subscribeToNewOrder((newOrder) => {
      // إضافة الإشعار للدرج
      addNotification(newOrder);
      // عرض التوست المنبثق في أعلى المنتصف
      setCurrentToast(newOrder);
      setTimeout(() => setCurrentToast(null), 4000);

      // ✅ تشغيل الصوت بشكل فوري وموثوق
      if (audioRef.current) {
        audioRef.current.currentTime = 0; // إعادة ضبط الوقت ليبدأ من البداية
        audioRef.current
          .play()
          .catch((e) => console.warn("تعذر تشغيل الصوت", e));
      }
    });

    return () => {
      disconnectSocket();
    };
  }, [addNotification]);

  return (
    <>
      {/* ✅ عنصر الصوت المخفي - يحمل الملف مرة واحدة فقط */}
      <audio
        ref={audioRef}
        src="/sounds/notification.mp3"
        preload="auto"
        style={{ display: "none" }}
      />

      {/* التوست المنبثق في أعلى المنتصف */}
      {currentToast && (
        <div className="order-toast" dir="rtl">
          طلب جديد من
          {" "}
          {currentToast.customerName}
          {" "}
          (رقم
          {currentToast.orderNumber})
        </div>
      )}

      <div className="dashbord">
        <div className="SidBar-Dashbord">
          <SidebarContent />
        </div>
        <div className="body-Dashbord">
          <Outlet />
        </div>
        <MobileSidebar />
      </div>
      <NotificationIcon />
      <NotificationDrawer />
    </>
  );
}

export default function DashBord() {
  return (
    <NotificationProvider>
      <SidebarProvider>
        <DashboardContent />
      </SidebarProvider>
    </NotificationProvider>
  );
}
