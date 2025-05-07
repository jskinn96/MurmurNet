'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; // uuid 라이브러리 필요

export default function VoiceChatPage() {
  const router = useRouter();
  
  useEffect(() => {
    // 랜덤 ID 생성
    const roomId = uuidv4();
    // 생성된 ID를 사용하여 채팅방으로 리디렉션
    router.push(`/voice-chat/${roomId}`);
  }, [router]);
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="text-white text-center">
        <h1 className="text-2xl font-bold mb-4">음성 채팅방 생성 중...</h1>
        <div className="animate-pulse">잠시만 기다려주세요</div>
      </div>
    </div>
  );
}