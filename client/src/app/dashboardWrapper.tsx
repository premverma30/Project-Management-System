"use client";

import Navbar from "@/components/Navbar";
import { Sidebar } from "lucide-react";

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen w-full bg-gray-50 text-gray-900">
      {/* <Sidebar /> */}
      <Sidebar/>
      sidebar
      <main className="flex w-full flex-col bg-gray-50 dark:bg-dark-bg md:pl-64">
        {/* <Navbar /> */}
        <Navbar/>
        navbar
        {children}
      </main>
    </div>
  );
};

export default DashboardWrapper;