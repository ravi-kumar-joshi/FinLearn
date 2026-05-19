import React from "react";

/**
 * Solid-card premium auth layout (Variant B).
 * Use for all /auth/* routes.
 */
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8 sm:py-12">
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

