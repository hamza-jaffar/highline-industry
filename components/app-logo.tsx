import Image from "next/image";
import Link from "next/link";
import React from "react";

const AppLogo = ({ size = 18 }: { size?: number }) => {
  return (
    <Link
      href="/"
      className="text-lg font-sora font-bold tracking-tight text-black flex gap-2 items-center"
    >
      <Image src="/logo.png" alt="Logo" width={size} height={size} />
      {/* HIGHLINE */}
    </Link>
  );
};

export default AppLogo;
