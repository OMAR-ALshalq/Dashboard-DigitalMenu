import "./LoadingSpinner.css";

export default function LoadingSpinner({ text = "جاري التحميل..." }) {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner-circle"></div>
      {text && <p className="loading-spinner-text">{text}</p>}
    </div>
  );
}
