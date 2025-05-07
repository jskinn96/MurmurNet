'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// 참가자 타입 정의
type Participant = {
  id: string;
  audioTrack?: MediaStreamTrack;
  rtcPeerConnection?: RTCPeerConnection;
};

export default function VoiceChat({ roomId }: { roomId: string }) {
  const [isConnecting, setIsConnecting] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Record<string, RTCPeerConnection>>({});

  // 오디오 요소 참조들을 저장할 객체
  const audioElements = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    // 소켓 연결 설정
    const SIGNALING_SERVER = process.env.NEXT_PUBLIC_SIGNALING_SERVER || 'http://localhost:3001';
    socketRef.current = io(SIGNALING_SERVER);

    // 사용자 미디어 장치 접근
    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then(stream => {
        localStreamRef.current = stream;
        setIsConnecting(false);

        // 방 입장
        socketRef.current?.emit('join-room', roomId);
      })
      .catch(err => {
        console.error('마이크 접근에 실패했습니다:', err);
        setError('마이크 접근에 실패했습니다. 브라우저 설정에서 마이크 권한을 허용해주세요.');
        setIsConnecting(false);
      });

    // 소켓 이벤트 리스너 설정
    socketRef.current?.on('user-joined', handleUserJoined);
    socketRef.current?.on('user-left', handleUserLeft);
    socketRef.current?.on('offer', handleReceiveOffer);
    socketRef.current?.on('answer', handleReceiveAnswer);
    socketRef.current?.on('ice-candidate', handleReceiveIceCandidate);

    // 정리 함수
    return () => {
      // 오디오 트랙 중지
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }

      // 연결 정리
      Object.values(peerConnectionsRef.current).forEach(pc => pc.close());

      // 소켓 연결 정리
      socketRef.current?.disconnect();
    };
  }, [roomId]);

  // 새 사용자 입장 처리
  const handleUserJoined = async (userId: string) => {
    console.log(`사용자 입장: ${userId}`);

    // 새 참가자 추가
    setParticipants(prev => [...prev, { id: userId }]);

    // P2P 연결 생성
    const peerConnection = createPeerConnection(userId);
    peerConnectionsRef.current[userId] = peerConnection;

    // 오퍼 생성 및 전송
    try {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          peerConnection.addTrack(track, localStreamRef.current!);
        });
      }

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      socketRef.current?.emit('offer', {
        target: userId,
        offer: peerConnection.localDescription
      });
    } catch (err) {
      console.error('오퍼 생성 실패:', err);
    }
  };

  // 사용자 퇴장 처리
  const handleUserLeft = (userId: string) => {
    console.log(`사용자 퇴장: ${userId}`);

    // 참가자 목록에서 제거
    setParticipants(prev => prev.filter(p => p.id !== userId));

    // 연결 종료
    if (peerConnectionsRef.current[userId]) {
      peerConnectionsRef.current[userId].close();
      delete peerConnectionsRef.current[userId];
    }

    // 오디오 요소 제거
    if (audioElements.current[userId]) {
      audioElements.current[userId].remove();
      delete audioElements.current[userId];
    }
  };

  // 오퍼 수신 처리
  const handleReceiveOffer = async (data: { from: string, offer: RTCSessionDescriptionInit }) => {
    const { from, offer } = data;

    // 아직 참가자 목록에 없다면 추가
    if (!participants.some(p => p.id === from)) {
      setParticipants(prev => [...prev, { id: from }]);
    }

    // P2P 연결 생성
    const peerConnection = createPeerConnection(from);
    peerConnectionsRef.current[from] = peerConnection;

    // 로컬 스트림 추가
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStreamRef.current!);
      });
    }

    // 리모트 설명 설정
    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

      // 응답 생성 및 전송
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      socketRef.current?.emit('answer', {
        target: from,
        answer: peerConnection.localDescription
      });
    } catch (err) {
      console.error('응답 생성 실패:', err);
    }
  };

  // 응답 수신 처리
  const handleReceiveAnswer = async (data: { from: string, answer: RTCSessionDescriptionInit }) => {
    const { from, answer } = data;

    try {
      const peerConnection = peerConnectionsRef.current[from];
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch (err) {
      console.error('응답 설정 실패:', err);
    }
  };

  // ICE candidate 수신 처리
  const handleReceiveIceCandidate = (data: { from: string, candidate: RTCIceCandidateInit }) => {
    const { from, candidate } = data;

    try {
      const peerConnection = peerConnectionsRef.current[from];
      if (peerConnection) {
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (err) {
      console.error('ICE candidate 추가 실패:', err);
    }
  };

  // P2P 연결 생성 함수
  const createPeerConnection = (userId: string) => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    const peerConnection = new RTCPeerConnection(configuration);

    // ICE candidate 생성 시 처리
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit('ice-candidate', {
          target: userId,
          candidate: event.candidate
        });
      }
    };

    // 트랙 수신 시 처리
    peerConnection.ontrack = (event) => {
      const remoteStream = event.streams[0];

      // 참가자 정보 업데이트
      setParticipants(prev => {
        return prev.map(p => {
          if (p.id === userId) {
            return { ...p, audioTrack: event.track };
          }
          return p;
        });
      });

      // 오디오 요소 생성 및 설정
      if (!audioElements.current[userId]) {
        const audio = new Audio();
        audio.srcObject = remoteStream;
        audio.autoplay = true;
        audioElements.current[userId] = audio;
      }
    };

    return peerConnection;
  };

  // 마이크 음소거 토글
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = isMuted;
        setIsMuted(!isMuted);
      }
    }
  };

  // UI 렌더링
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">음성 채팅방 #{roomId.substring(0, 8)}</h2>
        {isConnecting ? (
          <p className="text-gray-400">연결 중...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <p className="text-gray-400">
            {participants.length === 0
              ? '아직 다른 참가자가 없습니다. 채팅방 링크를 공유해 친구를 초대하세요.'
              : `${participants.length}명의 참가자가 있습니다.`}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        <div className="bg-gray-700 p-4 rounded-lg text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-lg font-bold">나</span>
          </div>
          <p className="text-sm font-medium">나 {isMuted ? '(음소거)' : ''}</p>
        </div>

        {participants.map(participant => (
          <div key={participant.id} className="bg-gray-700 p-4 rounded-lg text-center">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-lg font-bold">{participant.id.substring(0, 2)}</span>
            </div>
            <p className="text-sm font-medium">사용자 #{participant.id.substring(0, 5)}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={toggleMute}
          className={`px-6 py-3 rounded-full flex items-center gap-2 transition-colors ${isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
            }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            {isMuted ? (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
            )}
          </svg>
          {isMuted ? '음소거 해제' : '음소거'}
        </button>
      </div>
    </div>
  );
}