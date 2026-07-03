import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/authService";
import "./Login.css";
import AnimatedFruitBackground from "./AnimatedFruitBackground";
import { showError, showSuccess } from "../../Component/toast/Toast";

// icons
import { IoPerson } from "react-icons/io5";
import { VscEye, VscEyeClosed } from "react-icons/vsc";
import { MdOutlineEmail } from "react-icons/md";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      showError("يرجى ملء جميع الحقول");
      return;
    }

    try {
      setLoading(true);
      const { data } = await login(email, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      showSuccess("تم تسجيل الدخول بنجاح"); // ✅ نجاح
      navigate("/dashbord");
    } catch (err) {
      showError(err.response?.data?.message || "حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="box-Main-Login">
      <AnimatedFruitBackground />
      <form onSubmit={handleSubmit}>
        <div className="box-Main-icon">
          <div className="box-icon">
            <IoPerson className="Main-icon" />
          </div>
        </div>
        <div className="box-title">
          <h3>تسجيل الدخول</h3>
        </div>

        <div className="box-input">
          <div className="box-input-email">
            <label>Email:</label>
            <div className="box-min-input">
              <input
                type="email"
                placeholder="Enter your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <MdOutlineEmail className="input-icon" />
            </div>
          </div>
          <div className="box-input-password">
            <label>Password:</label>
            <div className="box-min-input">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                {showPassword ? (
                  <VscEyeClosed className="input-icon" />
                ) : (
                  <VscEye className="input-icon" />
                )}
              </span>
            </div>
          </div>
        </div>
        <div className="box-button">
          <button type="submit" disabled={loading}>
            {loading ? "جارٍ الدخول..." : "دخول"}
          </button>
        </div>
      </form>
    </div>
  );
}
