import React, { useEffect, useState } from "react";
import styles from "../app/page.module.css";

interface CodepoesiaProps {
  code: string;
  onClose: () => void;
}

const Codepoesia: React.FC<CodepoesiaProps> = ({ code, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000); // 5 segundos
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={styles.codepoesiaOverlay}>
      <pre className={styles.codepoesiaBox}>{code}</pre>
    </div>
  );
};

export default Codepoesia;
