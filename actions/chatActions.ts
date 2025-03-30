"use server";

import {
  createServerSupabaseAdminClient,
  createServerSupabaseClient,
} from "utils/supabase/server";

export async function getAllUsers() {
  // create server client를 사용했을 때는 현재 로그인되어 있는 유저에 대한 데이터만 접근 가능
  // createServerSupabaseAdminClient: 모든 유저 데이터를 가져올 수 있음
  const supabase = await createServerSupabaseAdminClient();
  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    return [];
  }
  // 유저 리스트
  return data.users;
}

export async function getUserById(userId) {
  const supabase = await createServerSupabaseAdminClient();

  const { data, error } = await supabase.auth.admin.getUserById(userId);

  if (error) {
    return null;
  }

  return data.user;
}

export async function sendMessage({ message, chatUserId }) {
  const supabase = await createServerSupabaseClient(); // 현재 로그인한 유저

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session.user) {
    throw new Error("User is not authenticated");
  }

  const { data, error: sendMessageError } = await supabase
    .from("message")
    .insert({
      message,
      receiver: chatUserId,
      sender: session.user.id,
    });

  if (sendMessageError) {
    throw new Error(sendMessageError.message);
  }

  return data;
}

export async function getAllMessages({ chatUserId }) {
  // 현재 나와 채팅중인 메시지 모두 가져오기
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session.user) {
    throw new Error("User is not authenticated");
  }

  const { data, error: getMessagesError } = await supabase
    .from("message")
    .select("*")
    .or(`receiver.eq.${chatUserId},receiver.eq.${session.user.id}`) // 상대방 또는 나
    .or(`sender.eq.${chatUserId},sender.eq.${session.user.id}`)
    .order("created_at", { ascending: true });

  if (getMessagesError) {
    return [];
  }

  return data;
}

// 메시지 삭제
// export async function deleteMessage({ messageId }) {
//   const supabase = await createServerSupabaseClient();
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

// 메시지 내용은 삭제하고 알림 표시로 변경
// export async function updateMessage({ messageId }: { messageId: string }) {
//     const supabase = await createServerSupabaseClient();

//     const {
//       data: { session },
//       error: authError,
//     } = await supabase.auth.getSession();

//     if (authError || !session?.user) {
//       throw new Error("User is not authenticated");
//     }

//     const { data, error: updateError } = await supabase
//       .from("message")
//       .update({ message: "이 메시지는 삭제되었습니다" }) // 메시지 내용 변경
//       .eq("id", messageId);

//     if (updateError) {
//       console.error("Supabase Update Error:", updateError);
//       throw new Error(updateError.message);
//     }

//     return data;
//   }
