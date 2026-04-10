"use client";

import { copyToClipboard } from "@/lib/utils";

const CopyLinkButton = ({
  referralLink,
  text,
}: {
  referralLink: string;
  text: string;
}) => {
  return (
    <button
      onClick={() => copyToClipboard(referralLink)}
      className="px-4 py-2 bg-black text-white text-[10px] font-black uppercase rounded-md shadow hover:bg-black/80"
    >
      {text}
    </button>
  );
};

export default CopyLinkButton;
