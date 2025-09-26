"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import LoadingUI from "@/components/login/LoadingUI";

const OauthSuccessContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const firstLogin = searchParams.get("firstLogin");

    if (accessToken) {
      localStorage.setItem("kakao_access_token", accessToken);

      if (firstLogin === "true") {
        router.push("/nation-select");
      } else {
        router.push("/globe");
      }
    } else {
      console.error("URL에서 accessToken을 찾을 수 없습니다.");
      router.push("/login");
    }
  }, [searchParams, router]);

  return <LoadingUI />;
};

const OauthSuccessPage = () => {
  return (
    <Suspense fallback={<LoadingUI />}>
      <OauthSuccessContent />
    </Suspense>
  );
};

export default OauthSuccessPage;
