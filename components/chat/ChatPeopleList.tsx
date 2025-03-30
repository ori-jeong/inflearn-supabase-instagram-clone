"use client";

import { useQuery } from "@tanstack/react-query";
import Person from "./Person";
import { useRecoilState } from "recoil";
import {
  presenceState,
  selectedUserIdState,
  selectedUserIndexState,
} from "utils/recoil/atoms";
import { getAllUsers } from "actions/chatActions";
import { createBrowserSupabaseClient } from "utils/supabase/client";
import { useEffect } from "react";

export default function ChatPeopleList({ loggedInUser }) {
  const [selectedUserId, setSelectedUserId] =
    useRecoilState(selectedUserIdState);
  const [selectedUserIndex, setSelectedUserIndex] = useRecoilState(
    selectedUserIndexState
  );

  const [presence, setPresence] = useRecoilState(presenceState);

  const getAllUsersQuery = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const allUsers = await getAllUsers();
      console.log(allUsers);
      return allUsers.filter((user) => user.id !== loggedInUser.id);
    },
  });

  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    const channel = supabase.channel("online_users", {
      // 실제 로그인한 유저의 상태를 트래킹
      config: {
        presence: {
          key: loggedInUser.id,
        },
      },
    });

    channel.on("presence", { event: "sync" }, () => {
      const newState = channel.presenceState();
      // newState를 그냥 쓰면 값을 마음대로 바꿔버릴 수 있기 때문에
      // 다시 파싱하여 오브젝트를 깔끔하게 셋팅해줌
      const newStateObj = JSON.parse(JSON.stringify(newState));
      setPresence(newStateObj);
    });

    channel.subscribe(async (status) => {
      // 구독이 완료되지 않았을 때 종료
      if (status !== "SUBSCRIBED") {
        return;
      }
      // 구독 성공시 새로운 presence status가 들어옴
      // channel.track안에 트래킹하고 싶은 오브젝트 넣기
      const newPresenceStatus = await channel.track({
        onlineAt: new Date().toISOString(), // 현재시간
      });
    });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return (
    <div className="h-screen min-w-60 flex flex-col bg-gray-50">
      {getAllUsersQuery.data?.map((user, index) => (
        <Person
          onClick={() => {
            setSelectedUserId(user.id);
            setSelectedUserIndex(index);
          }}
          index={index}
          isActive={selectedUserId === user.id}
          name={user.email.split("@")[0]}
          onChatScreen={false}
          onlineAt={presence?.[user.id]?.[0]?.onlineAt}
          // onlineAt={new Date().toISOString()}
          userId={user.id}
        />
      ))}
      {/* <Person
        onClick={() => setSelectedIndex(0)}
        index={0}
        isActive={selectedIndex === 0}
        name={"Lopun"}
        onChatScreen={false}
        onlineAt={new Date().toISOString()}
        userId={"iasdonfiodasn"}
      />
      <Person
        onClick={() => setSelectedIndex(1)}
        index={1}
        isActive={selectedIndex === 1}
        name={"홍길동"}
        onChatScreen={false}
        onlineAt={new Date().toISOString()}
        userId={"iasdonfiodasn"}
      /> */}
    </div>
  );
}
