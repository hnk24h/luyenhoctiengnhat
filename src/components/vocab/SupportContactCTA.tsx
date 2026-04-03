import React from "react";
import Link from 'next/link';
import { FaQuestionCircle } from "react-icons/fa";

export default function SupportContactCTA() {
  return (
    <div className="flex flex-col items-center bg-blue-50 border border-blue-100 rounded-xl p-4 mt-6">
      <div className="flex items-center gap-2 mb-2">
        <FaQuestionCircle className="text-blue-400" />
        <span className="font-semibold text-blue-700">Cần hỗ trợ?</span>
      </div>
      <Link href="/support" className="text-sm text-blue-600 underline hover:text-blue-800">Liên hệ tư vấn hoặc xem FAQ</Link>
    </div>
  );
}
