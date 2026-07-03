import { IoNotifications } from "react-icons/io5";
import { useNotifications } from "../../context/NotificationContext";
import "./Notifications.css";

export default function NotificationIcon() {
  const { unreadCount, openDrawer } = useNotifications();

  return (
    <div className="notification-icon-fixed" onClick={openDrawer}>
      <IoNotifications className="bell-icon" />
      {unreadCount > 0 && (
        <span className="notification-badge">{unreadCount}</span>
      )}
    </div>
  );
}
