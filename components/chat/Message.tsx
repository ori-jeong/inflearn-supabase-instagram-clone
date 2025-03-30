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
        <p className="i-tabler-exclamation-circle">{message}</p>
      </div>
    </div>
  );
}
