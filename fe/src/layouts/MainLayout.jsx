import React from "react";

export default function MainLayout({ children }) {
  return (
    <div className="relative flex flex-col min-h-screen bg-[var(--dark4)] pt-2 px-2">
      <main className="flex-1 z-10 mb-2 bg-[var(--mainBg2)]">{children}</main>
    </div>
  );
}