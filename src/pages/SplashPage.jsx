import React, { useEffect, useState } from "react";
import "../css/splash.css";

const SplashPage = ({ onFinish }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onFinish) onFinish();
    }, 2500); // 2.5s splash
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className={`splash ${visible ? "show" : "hide"}`}>
      <h1 className="splash-title">TREBETTA</h1>
    </div>
  );
};

export default SplashPage;
