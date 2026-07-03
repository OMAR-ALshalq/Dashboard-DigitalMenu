import { useState, useEffect } from "react";
import "./Stats.css";
import { getDashboardStats } from "../../services/statsService";
import { showError } from "../../Component/toast/Toast";
import { GiHamburgerMenu } from "react-icons/gi";
import { useSidebar } from "../../context/SidebarContext";

// ✅ استيراد مؤشر التحميل الدائري
import LoadingSpinner from "../../Component/LoadingSpinner/LoadingSpinner";

// مكتبة الرسوم البيانية
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

// أيقونات
import { FaBoxOpen, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export default function Stats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { openMobile } = useSidebar();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await getDashboardStats();
        setStats(data.data);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        showError("فشل جلب الإحصائيات");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // إعداد بيانات الرسم البياني
  const chartData =
    stats?.hourlyOrders?.map((item) => ({
      time: `${item.hour}:00`,
      الطلبات: item.count
    })) || [];

  return (
    <div>
      {/* شريط التنقل يبقى دائماً */}
      <div className="NavBar-Orders">
        <div className="text-NavBar">
          <h3>لوحة الإحصائيات</h3>
          <p>نظرة عامة على أداء الأصناف</p>
        </div>
        <div className="button-NavBar">
          <button className="mobile-menu-btn" onClick={openMobile}>
            <GiHamburgerMenu />
          </button>
        </div>
      </div>

      {/* منطقة المحتوى: تظهر الـ Spinner أثناء التحميل، وإلا المحتوى */}
      {loading ? (
        <LoadingSpinner text="جاري تحميل الإحصائيات..." />
      ) : !stats ? (
        <p className="empty-text">لا توجد بيانات</p>
      ) : (
        <>
          {/* بطاقات إحصائية */}
          <div className="stats-cards">
            <div className="stat-card total">
              <FaBoxOpen className="stat-icon" />
              <h4>إجمالي الأصناف</h4>
              <span>{stats.totalItems}</span>
            </div>
            <div className="stat-card available">
              <FaCheckCircle className="stat-icon" />
              <h4>الأصناف المتاحة</h4>
              <span>{stats.availableItems}</span>
            </div>
            <div className="stat-card unavailable">
              <FaTimesCircle className="stat-icon" />
              <h4>الأصناف غير المتاحة</h4>
              <span>{stats.unavailableItems}</span>
            </div>
          </div>

          {/* الرسم البياني لساعات الذروة */}
          <div className="chart-section">
            <h3>:أوقات الطلبات خلال اليوم</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 0, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="الطلبات" fill="#2e7d32" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.الطلبات > 0 ? "#2e7d32" : "#e0e0e0"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* أكثر الأصناف طلباً */}
          <div className="top-items-section">
            <h3>:أكثر الأصناف طلباً</h3>
            {stats.topItems.length === 0 ? (
              <p className="empty-text">لا توجد طلبات بعد</p>
            ) : (
              <table className="top-items-table">
                <thead>
                  <tr>
                    <th>الرقم</th>
                    <th>اسم الصنف</th>
                    <th>عدد مرات الطلب</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topItems.map((item, idx) => (
                    <tr key={item._id || idx}>
                      <td>{idx + 1}</td>
                      <td>{item.name || "صنف محذوف"}</td>
                      <td>{item.totalOrdered}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
