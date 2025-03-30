import { atom } from "recoil";

// 선택 후 F2 키를 누르면 명칭 바꾸는 창 뜸
export const selectedUserIdState = atom({
  key: "selectedUserIdState",
  default: null,
});

export const selectedUserIndexState = atom({
  key: "selectedUserIndexState",
  default: null,
});

export const presenceState = atom({
  key: "presenceState",
  default: null,
});
