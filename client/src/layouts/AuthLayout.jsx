import React from "react";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/finlearn-bg.png')" }}  >
      {/* Optional overlay for better contrast */}
      <div className="fixed inset-0 bg-black/10 pointer-events-none" />

      <div className="
        w-full max-w-md
        bg-white
        rounded-2xl
        shadow-2xl
        p-6 sm:p-8
        border
        border-gray-100
      ">
        {children}
      </div>
    </div>
  );
}

