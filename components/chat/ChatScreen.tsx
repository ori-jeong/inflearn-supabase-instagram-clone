"use client";

import { Button, Spinner } from "@material-tailwind/react";
import Person from "./Person";
import Message from "./Message";
import { useRecoilValue } from "recoil";
import {
  presenceState,
  selectedUserIdState,
  selectedUserIndexState,
} from "utils/recoil/atoms";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getAllMessages, getUserById, sendMessage } from "actions/chatActions";
import { createBrowserSupabaseClient } from "utils/supabase/client";

// export async function sendMessage({ message, chatUserId }) {
//   const supabase = await createBrowserSupabaseClient();

//   const {
//     data: { session },
//     error,
//   } = await supabase.auth.getSession();

//   if (error || !session.user) {
//     throw new Error("User is not authenticated");
//   }

//   const { data, error: sendMessageError } = await supabase
//     .from("message")
//     .insert({
//       message,
//       receiver: chatUserId,
//       // sender: session.user.id,
//     });

//   if (sendMessageError) {
//     throw new Error(sendMessageError.message);
//   }

//   return data;
// }

// export async function getAllMessages({ chatUserId }) {
//   // 현재 나와 채팅중인 메시지 모두 가져오기
//   const supabase = await createBrowserSupabaseClient();
//   const {
//     data: { session },
//     error,
//   } = await supabase.auth.getSession();

//   if (error || !session.user) {
//     throw new Error("User is not authenticated");
//   }

//   const { data, error: getMessagesError } = await supabase
//     .from("message")
//     .select("*")
//     .or(`receiver.eq.${chatUserId},receiver.eq.${session.user.id}`) // 상대방 또는 나
//     .or(`sender.eq.${chatUserId},sender.eq.${session.user.id}`)
//     .order("created_at", { ascending: true });

//   if (getMessagesError) {
//     return [];
//   }

//   return data;
// }

// 메시지 삭제
// export async function deleteMessage({ messageId }) {
//   const supabase = await createBrowserSupabaseClient();
//   const {
//     data: { session },
//     error,
//   } = await supabase.auth.getSession();

//   if (error || !session.user) {
//     throw new Error("User is not authenticated");
//   }
//   const { data, error: deleteMessage } = await supabase
//     .from("message")
//     .delete()
//     .eq("id", messageId);

//   if (deleteMessage) {
//     throw new Error(deleteMessage.message);
//   }
//   return data;
// }

export async function updateMessage({ messageId }: { messageId: number }) {
  const supabase = await createBrowserSupabaseClient();

  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession();

  if (authError || !session?.user) {
    throw new Error("User is not authenticated");
  }

  const { data, error: updateError } = await supabase
    .from("message")
    .update({ message: "이 메시지는 삭제되었습니다", is_deleted: true }) // 메시지 내용 변경
    .eq("id", messageId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return data;
}

export default function ChatScreen() {
  const selectedUserId = useRecoilValue(selectedUserIdState);
  const selectedUserIndex = useRecoilValue(selectedUserIndexState);
  const [message, setMessage] = useState("");
  const supabase = createBrowserSupabaseClient();
  const presence = useRecoilValue(presenceState);

  const selectedUserQuery = useQuery({
    queryKey: ["user", selectedUserId],
    queryFn: () => getUserById(selectedUserId),
  });

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      return sendMessage({
        message,
        chatUserId: selectedUserId,
      });
    },
    onSuccess: () => {
      setMessage(""); // 메시지 입력 칸 비우기
      getAllMessagesQuery.refetch(); // 메시지 가져오기
    },
  });

  const getAllMessagesQuery = useQuery({
    queryKey: ["messages", selectedUserId],
    queryFn: () => getAllMessages({ chatUserId: selectedUserId }),
  });

  // const deleteMessageMutation = useMutation({
  //   mutationFn: async ({ messageId }: { messageId: string }) => {
  //     return deleteMessage({ messageId });
  //   },
  //   onSuccess: () => {
  //     getAllMessagesQuery.refetch(); // 메시지 목록 새로고침
  //   },
  // });

  const updateMessageMutation = useMutation({
    mutationFn: async ({ messageId }: { messageId: number }) => {
      return updateMessage({ messageId });
    },
    onSuccess: () => {
      // 성공적으로 메시지를 업데이트한 후 메시지 목록을 다시 가져옵니다.
      getAllMessagesQuery.refetch();
    },
  });

  // 새로고침 없이 대화를 실시간으로 표시
  useEffect(() => {
    const channel = supabase
      .channel("message_postgres_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "message",
        },
        (payload) => {
          if (
            ["INSERT", "UPDATE"].includes(payload.eventType) &&
            !payload.errors
          ) {
            getAllMessagesQuery.refetch();
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return selectedUserQuery.data !== null ? (
    <div className="w-full h-screen flex flex-col">
      {/* Active 유저 영역 */}
      <Person
        index={selectedUserIndex}
        isActive={false}
        name={selectedUserQuery.data?.email?.split("@")?.[0]}
        onChatScreen={true}
        onlineAt={presence?.[selectedUserId]?.[0]?.onlineAt}
        userId={selectedUserQuery.data?.id}
      />

      {/* 채팅 영역 */}
      <div className="w-full overflow-y-scroll flex-1 flex flex-col p-4 gap-3">
        {getAllMessagesQuery.data?.map((message) => (
          <Message
            key={message.id}
            message={message.message}
            isFromMe={message.receiver === selectedUserId}
            is_deleted={message.is_deleted}
            onUpdate={() =>
              updateMessageMutation.mutate({ messageId: message.id })
            }
          />
        ))}
      </div>

      {/* 채팅창 영역 */}
      <div className="flex">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="p-3 w-full border-2 border-light-blue-600"
          placeholder="메시지를 입력하세요."
        />

        <button
          onClick={() => sendMessageMutation.mutate()}
          className="min-w-20 p-3 bg-light-blue-600 text-white"
          color="light-blue"
        >
          {/* 로딩 직접 구현 */}
          {sendMessageMutation.isPending ? <Spinner /> : <span>전송</span>}
        </button>
      </div>
    </div>
  ) : (
    <div className="w-full"></div>
  );
}
