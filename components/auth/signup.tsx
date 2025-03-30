"use client";

import { Button, Input } from "@material-tailwind/react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { createBrowserSupabaseClient } from "utils/supabase/client";

// 회원가입 창 안에서 로그인 창으로 넘어가고, 로그인 창에서 회원가입 창으로 넘어갈 수 있어야 하기 때문에 setview를 받아야함
export default function SignUp({ setView }) {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 가입하기 완료 확인 체크
  const [confirmaitonRequired, setConfirmationRequired] = useState(false);

  const supabase = createBrowserSupabaseClient();

  const signupMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // 유저가 회원가입 끝나고 이메일 링크 클릭 => 서버처리 완료 => 해당 url로 다시 이동
          emailRedirectTo: "http://loacalhost:3000/signup/confirm",
        },
      });
      if (data) {
        setConfirmationRequired(true);
      }
      if (error) {
        alert(error.message);
      }
    },
  });

  const verityOtpMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.auth.verifyOtp({
        type: "signup",
        email,
        token: otp,
      });
      if (data) {
        setConfirmationRequired(true);
      }
      if (error) {
        alert(error.message);
      }
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="pt-10 pb-6 px-10 w-full flex flex-col items-center justify-center max-w-lg border border-gray-400 bg-white gap-2">
        <img src={"/images/inflearngram.png"} className="w-60 mb-6" />
        {confirmaitonRequired ? (
          <Input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            label="OTP"
            type="text"
            className="w-full rounded-sm"
            placeholder="6자리 OTP를 입력하세요."
          />
        ) : (
          // 이메일 인증
          <>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label="email"
              type="email"
              className="w-full rounded-sm"
            />
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label="password"
              type="password"
              className="w-full rounded-sm"
            />
          </>
        )}
        <Button
          onClick={() => {
            if (confirmaitonRequired) {
              verityOtpMutation.mutate();
            } else {
              signupMutation.mutate();
            }
          }}
          loading={
            confirmaitonRequired
              ? verityOtpMutation.isPending
              : signupMutation.isPending
          }
          disabled={
            confirmaitonRequired
              ? verityOtpMutation.isPending
              : signupMutation.isPending
          }
          color="light-blue"
          className="w-full text-md py-1"
        >
          {confirmaitonRequired ? "인증하기" : "가입하기"}
        </Button>
        {/* 이메일 인증할 때 
        <Button
          onClick={() => {
            if (confirmaitonRequired) signupMutation.mutate();
          }}
          loading={signupMutation.isPending}
          disabled={confirmaitonRequired}
          color="light-blue"
          className="w-full text-md py-1"
        >
          {confirmaitonRequired ? "메일함을 확인해주세요." : "가입하기"}
        </Button>
        */}
      </div>

      <div className="py-4 w-full text-center max-w-lg border border-gray-400 bg-white">
        이미 계정이 있으신가요?{" "}
        <button
          className="text-light-blue-600 font-bold"
          onClick={() => setView("SIGNIN")}
        >
          로그인하기
        </button>
      </div>
    </div>
  );
}
