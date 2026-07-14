type Props = {
  scale?: number;
  time?: string;
  color?: string;
  children: React.ReactNode;
};

export default function PhoneFrame({ scale = 1, time = "9:41", color = "#1C1A16", children }: Props) {
  const w = 340;
  const h = 720;
  const px = (n: number) => `${n * scale}px`;
  return (
    <div style={{ width: w * scale, height: h * scale, position: "relative" }}>
      <div
        className="absolute inset-0"
        style={{
          background: color,
          borderRadius: 50 * scale,
          padding: 10 * scale,
          boxShadow:
            "0 30px 80px -20px rgba(28,26,22,0.35), 0 10px 30px -10px rgba(28,26,22,0.25)",
        }}
      >
        <div
          className="w-full h-full bg-[#FAFAF7] overflow-hidden relative"
          style={{ borderRadius: 40 * scale }}
        >
          {/* Status bar */}
          <div
            className="absolute top-0 left-0 right-0 flex items-center justify-between font-semibold text-black z-10"
            style={{
              height: 46 * scale,
              padding: `0 ${28 * scale}px`,
              fontSize: 14 * scale,
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
            }}
          >
            <span>{time}</span>
            <span className="flex items-center" style={{ gap: 5 * scale }}>
              <span className="flex items-end" style={{ gap: 1.5 * scale }}>
                {[3, 5, 7, 9].map((sh, i) => (
                  <span
                    key={i}
                    style={{
                      width: 3 * scale,
                      height: sh * scale,
                      background: "#000",
                      borderRadius: 0.5 * scale,
                    }}
                  />
                ))}
              </span>
              <svg width={14 * scale} height={10 * scale} viewBox="0 0 16 12" fill="#000" style={{ display: "block" }}>
                <path d="M8 0C5.06 0 2.34 1.04 0.21 2.78a0.5 0.5 0 0 0 -0.04 0.74l1.06 1.06a0.5 0.5 0 0 0 0.7 0.02A9 9 0 0 1 8 2a9 9 0 0 1 6.07 2.6 0.5 0.5 0 0 0 0.7 -0.02l1.06 -1.06a0.5 0.5 0 0 0 -0.04 -0.74A11.97 11.97 0 0 0 8 0zM8 4.5c-2 0-3.83 0.74-5.23 1.96a0.5 0.5 0 0 0 -0.03 0.74l1.05 1.05a0.5 0.5 0 0 0 0.7 0.03A6 6 0 0 1 8 6.5a6 6 0 0 1 3.51 1.78 0.5 0.5 0 0 0 0.7 -0.03l1.05 -1.05a0.5 0.5 0 0 0 -0.03 -0.74A7.97 7.97 0 0 0 8 4.5zM8 9a3 3 0 0 0 -2.12 0.88 0.5 0.5 0 0 0 -0.02 0.7l1.79 1.93a0.5 0.5 0 0 0 0.7 0l1.79 -1.93a0.5 0.5 0 0 0 -0.02 -0.7A3 3 0 0 0 8 9z" />
              </svg>
              <span
                className="relative inline-block"
                style={{
                  width: 25 * scale,
                  height: 12 * scale,
                  border: `${1 * scale}px solid rgba(0,0,0,0.4)`,
                  borderRadius: 3.5 * scale,
                  padding: 1 * scale,
                }}
              >
                <span className="block" style={{ width: "82%", height: "100%", background: "#000", borderRadius: 2 * scale }} />
                <span
                  className="absolute"
                  style={{
                    left: "100%",
                    top: "30%",
                    width: 1.5 * scale,
                    height: "40%",
                    background: "rgba(0,0,0,0.4)",
                    borderTopRightRadius: 1 * scale,
                    borderBottomRightRadius: 1 * scale,
                  }}
                />
              </span>
            </span>
          </div>
          {/* Dynamic island */}
          <div
            className="absolute bg-black z-20"
            style={{
              top: 11 * scale,
              left: "50%",
              transform: "translateX(-50%)",
              width: 108 * scale,
              height: 28 * scale,
              borderRadius: 20 * scale,
            }}
          />
          {/* Content */}
          <div className="absolute left-0 right-0 bottom-0 overflow-hidden" style={{ top: 52 * scale }}>
            {children}
          </div>
          {/* Home indicator */}
          <div
            className="absolute bg-black opacity-90"
            style={{
              bottom: 8 * scale,
              left: "50%",
              transform: "translateX(-50%)",
              width: 128 * scale,
              height: 4 * scale,
              borderRadius: 2 * scale,
            }}
          />
        </div>
      </div>
    </div>
  );
}
