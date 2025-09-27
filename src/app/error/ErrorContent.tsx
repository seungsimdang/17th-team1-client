"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function ErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorDetails, setErrorDetails] = useState({
    type: "Unknown",
    status: "Unknown",
    message: "로그인 중 오류가 발생했습니다.",
  });

  useEffect(() => {
    // URL 파라미터에서 에러 정보 추출
    const errorType = searchParams.get("type") || "Unknown";
    const errorStatus = searchParams.get("status") || "Unknown";
    const errorMessage = searchParams.get("message") || "로그인 중 오류가 발생했습니다.";

    setErrorDetails({
      type: errorType,
      status: errorStatus,
      message: errorMessage,
    });
  }, [searchParams]);

  const handleRetry = () => {
    router.push("/login");
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <title>오류 아이콘</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">로그인 오류</h1>
          <p className="text-gray-600 mb-6">{errorDetails.message}</p>
        </div>

        {/* 에러 상세 정보 */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <div className="text-sm text-gray-600 space-y-2">
            <div>
              <span className="font-medium">오류 유형:</span> {errorDetails.type}
            </div>
            <div>
              <span className="font-medium">상태 코드:</span> {errorDetails.status}
            </div>
            <div>
              <span className="font-medium">발생 시간:</span> {new Date().toLocaleString("ko-KR")}
            </div>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleRetry}
            className="w-full bg-black text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            다시 로그인하기
          </button>
          <button
            type="button"
            onClick={handleGoHome}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>

        {/* 도움말 링크 */}
        <div className="mt-6 text-sm text-gray-500">
          <p>
            문제가 지속되면{" "}
            <button
              type="button"
              onClick={() => {
                window.location.href = "mailto:support@globber.store";
              }}
              className="text-blue-600 hover:underline"
            >
              고객지원
            </button>
            으로 문의해주세요.
          </p>
        </div>
      </div>
    </div>
  );
}
