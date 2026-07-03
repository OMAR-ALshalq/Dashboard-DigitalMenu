import "./AnimatedFruitBackground.css";

// فواكه SVG بسيطة (تفاح، برتقال، ليمون)
const fruits = [
  {
    id: 1,
    svg: (
      <svg viewBox="0 0 64 64" width="60" height="60">
        <circle cx="32" cy="36" r="22" fill="#FF3B30" />
        <path
          d="M26 14 Q32 4 38 14"
          stroke="#4A7C2E"
          strokeWidth="3"
          fill="none"
        />
        <ellipse cx="27" cy="28" rx="5" ry="7" fill="#FFFFFF" opacity="0.4" />
        <line x1="32" y1="10" x2="32" y2="4" stroke="#4A7C2E" strokeWidth="3" />
      </svg>
    ),
    className: "fruit-apple"
  },
  {
    id: 2,
    svg: (
      <svg viewBox="0 0 64 64" width="60" height="60">
        <circle cx="32" cy="32" r="22" fill="#FF9500" />
        <circle cx="24" cy="28" r="5" fill="#FFFFFF" opacity="0.3" />
        <path
          d="M32 10 Q32 4 36 6"
          stroke="#4A7C2E"
          strokeWidth="3"
          fill="none"
        />
      </svg>
    ),
    className: "fruit-orange"
  },
  {
    id: 3,
    svg: (
      <svg viewBox="0 0 64 64" width="60" height="60">
        <ellipse cx="28" cy="32" rx="18" ry="14" fill="#FFCC00" />
        <ellipse cx="38" cy="32" rx="18" ry="14" fill="#FFD426" />
        <path
          d="M24 14 Q28 6 34 14"
          stroke="#4A7C2E"
          strokeWidth="3"
          fill="none"
        />
        <line x1="30" y1="8" x2="30" y2="2" stroke="#4A7C2E" strokeWidth="2" />
      </svg>
    ),
    className: "fruit-lemon"
  }
];

export default function AnimatedFruitBackground() {
  // توليد عدة نسخ من الفواكه لتملأ الخلفية
  const items = Array.from({ length: 12 }, (_, i) => {
    const fruit = fruits[i % fruits.length];
    return { ...fruit, id: i, style: randomPosition(i) };
  });

  return (
    <div className="fruit-background">
      {items.map((item) => (
        <div
          key={item.id}
          className={`fruit ${item.className}`}
          style={item.style}
        >
          {item.svg}
        </div>
      ))}
    </div>
  );
}

function randomPosition(seed) {
  // توزيع عشوائي معتمد على seed ليكون ثابتًا
  const left = (seed * 13 + 7) % 100;
  const top = (seed * 17 + 3) % 100;
  const delay = (seed % 5) * 2;
  const duration = 8 + (seed % 5);
  return {
    left: `${left}%`,
    top: `${top}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  };
}
