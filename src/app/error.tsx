"use client";

import Link from "next/link";
import { FaExclamationTriangle, FaArrowLeft } from "react-icons/fa";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4">
      <div className="flex flex-col items-center bg-white rounded-2xl shadow-lg p-8 max-w-md w-full border border-gray-200">
        <FaExclamationTriangle className="text-yellow-500 mb-3" size={48} />
        <h1 className="text-2xl font-bold mb-2 text-gray-800">Đã xảy ra lỗi!</h1>
        <p className="text-gray-600 mb-4 text-center">
          Rất tiếc, có lỗi bất ngờ xảy ra trong quá trình xử lý.<br />
          Nếu đây là lỗi đồng bộ, hãy thử tải lại trang hoặc quay về trang chủ.
        </p>
        <div className="flex gap-3 w-full">
          <button
            onClick={() => reset()}
            className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Thử lại
          </button>
          <Link href="/" className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold flex items-center justify-center gap-2 hover:bg-gray-200 transition">
            <FaArrowLeft /> Trang chủ
          </Link>
        </div>
        <div className="mt-4 text-xs text-gray-400 break-all text-center">
          {error?.message || "Không rõ nguyên nhân."}
        </div>
      </div>
    </div>
  );
}
