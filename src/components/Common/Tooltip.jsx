import React from "react";

export const Tooltip = ({ children, text }) => {
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }} title={text}>
      {children}
    </div>
  );
};
