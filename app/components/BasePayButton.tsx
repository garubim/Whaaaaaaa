"use client";

import React from "react";

export default function BasePayButton({ colorScheme = "light", onClick }: { colorScheme?: string; onClick?: () => void }) {
  const isLight = colorScheme === "light";
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "12px 16px",
        backgroundColor: isLight ? "#ffffff" : "#0000FF",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: "14px",
        fontWeight: 500,
        color: isLight ? "#000000" : "#ffffff",
        minWidth: "180px",
        height: "44px",
      }}
    >
      <div
        style={{
          width: "16px",
          height: "16px",
          backgroundColor: isLight ? "#0000FF" : "#FFFFFF",
          borderRadius: "2px",
          flexShrink: 0,
        }}
      />
      <span>Pay with Base</span>
    </button>
  );
}
