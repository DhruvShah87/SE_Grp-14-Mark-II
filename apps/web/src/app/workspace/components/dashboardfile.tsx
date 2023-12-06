"use client";
import NavComponent from "@/components/Navbar";
import Dashboardfile from "./createws";

export default function Profilepage() {
  return (
    <div className="min-h-screen w-screen bg-[#E5F2FF] flex flex-col relative">
      <NavComponent />
      <div className="flex-grow flex items-center justify-center">
        <div className="my-auto xl:w-1/3 sm:w-4/5 mx-auto bg-white rounded-2xl shadow-xl flex flex-col items-center justify-evenly py-4">
          <Dashboardfile />
        </div>
      </div>
    </div>
  );
}

