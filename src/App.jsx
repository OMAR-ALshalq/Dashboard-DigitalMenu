import "./App.css";
import "./Component/toast/Toast.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login/Login";
import DashBord from "./pages/dashbord/DashBord";
import Products from "./pages/dashbord/products/Products";
import Categories from "./pages/dashbord/categories/Categories";
import Orders from "./pages/dashbord/orders/Orders";
import Stats from "./pages/dashbord/Stats";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />

        {/* المسار الرئيسي للوحة التحكم مع تداخل الصفحات */}
        <Route
          path="/dashbord"
          element={
            <ProtectedRoute>
              <DashBord />
            </ProtectedRoute>
          }
        >
          {/* ✅ جعل الإحصائيات الصفحة الأولى */}
          <Route index element={<Navigate to="stats" />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="orders" element={<Orders />} />
          <Route path="stats" element={<Stats />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

// ٣. ⚡ الإشعارات الفورية (Real-time Notifications)

// استخدام Socket.io لإرسال إشعار صوتي ومنبثق إلى لوحة التحكم فور وصول طلب جديد دون الحاجة لتحديث الصفحة.

// ٤. 📱 تحويل المنيو إلى تطبيق (PWA)

// جعل المنيو قابلاً للتنصيب على هاتف العميل كتطبيق أصلي يعمل بشكل كامل.
