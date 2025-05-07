'use client';

import { Usable, useState } from 'react';
import { use } from 'react';
import VoiceChat from '@/components/VoiceChat';

export default function VoiceChatRoom({ params }: { params: Usable<{ id: string }>; }) {

    const [isCopied, setIsCopied] = useState(false);
    const props = use(params);
    const roomId = props.id;

    const copyRoomLink = () => {
        const url = `${window.location.origin}/voice-chat/${roomId}`;
        navigator.clipboard.writeText(url);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold">음성 채팅</h1>
                    <div className="flex gap-4">
                        <button
                            onClick={copyRoomLink}
                            className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            {isCopied ? '링크 복사됨!' : '채팅방 링크 복사'}
                        </button>
                        <button
                            onClick={() => window.history.back()}
                            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            나가기
                        </button>
                    </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
                    <VoiceChat roomId={roomId} />
                </div>
            </div>
        </div>
    );
}