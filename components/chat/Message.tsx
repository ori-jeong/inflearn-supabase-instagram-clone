"use client";

import { FaTrash } from "react-icons/fa"; // react-icons에서 쓰레기통 아이콘 가져오기

export default function Message({ isFromMe, message, onUpdate, is_deleted }) {
  return (
    <div
      className={`flex items-center space-x-2 ${
        isFromMe ? "justify-end" : "justify-start"
      }`}
    >
      {isFromMe && is_deleted == false && (
        <button
          onClick={onUpdate}
          className="text-gray-500 hover:text-red-500"
          aria-label="Delete message"
        >
          <FaTrash />
        </button>
      )}
      <div
        className={`w-fit p-3 rounded-md ${
          isFromMe
            ? "ml-auto bg-light-blue-600 text-white"
            : "bg-gray-100 text-black"
        }`}
      >
        <p className="i-tabler-exclamation-circle">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M17 3.34A10 10 0 1 1 2 12l.005-.324A10 10 0 0 1 17 3.34M12 15a1 1 0 0 0-1 1v.01a1 1 0 0 0 2 0V16a1 1 0 0 0-1-1m0-7a1 1 0 0 0-1 1v4a1 1 0 0 0 2 0V9a1 1 0 0 0-1-1"
            />
          </svg>
          {message}
        </p>
      </div>
    </div>
  );
}
