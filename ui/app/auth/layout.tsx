// layout for authetincation components, simple and centered using the shadcn example

import { Outlet } from "react-router";

// https://github.com/shadcn/nextjs-auth-example/blob/main/app/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <div className="w-full rounded-xl bg-white p-10 shadow-md md:max-w-md">
        <div className="prose">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
