import React from "react";

export default function SignInLoading() {
  return (
    <div className="w-full h-screen min-h-screen bg-[#0c1011] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#c5f52a] text-black font-extrabold text-2xl flex items-center justify-center animate-pulse">
          A
        </div>
        <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="w-1/2 h-full bg-[#c5f52a] animate-pulse" />
        </div>
      </div>
    </div>
  );
}

