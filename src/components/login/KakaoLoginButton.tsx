"use client";

import { useRouter } from "next/navigation";
import { env } from "@/config/env";

const KakaoLoginButton = () => {
  const router = useRouter();

  const handleLogin = () => {
    const redirectOrigin = env.REDIRECT_ORIGIN;

    const url = "https://globber.store/oauth2/authorization/kakao";
    const finalUrl = `${url}?redirect=${encodeURIComponent(redirectOrigin)}`;
    router.push(finalUrl);
  };

  return (
    <button
      onClick={handleLogin}
      type="button"
      className="group w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#FEE500] px-4 py-3 text-sm font-medium text-black shadow-[0_1px_0_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.08)] transition-transform hover:translate-y-[-1px] active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
      aria-label="카카오로 로그인"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path
          fill="#000"
          d="M12 3C6.477 3 2 6.477 2 10.769c0 2.63 1.816 4.94 4.54 6.258-.158.552-.57 1.995-.653 2.309-.103.402.147.395.31.287.128-.083 2.03-1.381 2.846-1.936.329.047.667.072 1.013.072 5.523 0 10-3.477 10-7.759C20.056 6.477 17.523 3 12 3z"
        />
      </svg>
      카카오로 시작하기
    </button>
  );
};

export default KakaoLoginButton;
