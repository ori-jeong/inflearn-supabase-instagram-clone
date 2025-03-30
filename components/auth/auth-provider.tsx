"use client";

//

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { createBrowserSupabaseClient } from "utils/supabase/client";

// accessToken: 서버 역할
export default function AuthProvider({ accessToken, children }) {
  const supabase = createBrowserSupabaseClient();
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription: authListner },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // accessToken와 실제 auth가 체인지 됐을 때
      if (session?.access_token !== accessToken) {
        router.refresh(); // 변화시 새로고침
      }
    });

    return () => {
      authListner.unsubscribe(); // 종료시 unsubscribe 처리
    };
  }, [accessToken, supabase, router]);

  return children;
}
