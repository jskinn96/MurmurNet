import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 lg:p-24 text-white">
      <div className="z-10 w-full max-w-5xl flex flex-col items-center justify-center gap-8 text-center">
        <div className="relative">
          <h1 className="text-6xl lg:text-7xl font-extrabold tracking-tight">
            <span className="inline-block bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 text-transparent bg-clip-text animate-gradient-x">
              Murmur
            </span>
            <span className="inline-block bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-transparent bg-clip-text animate-gradient-x">
              Net
            </span>
          </h1>
          <div className="absolute -z-10 -inset-1 blur-xl opacity-30 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-700 rounded-full"></div>
        </div>
        
        <p className="text-xl lg:text-2xl mt-4 text-gray-300">
          실시간 음성 & 화상 채팅 플랫폼
        </p>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 transition duration-300">
            <h2 className="text-2xl font-bold mb-4">음성 채팅</h2>
            <p className="mb-6 text-gray-300">
              WebRTC 기술을 활용한 고품질 저지연 음성 통신으로 친구들과 실시간으로 대화하세요.
            </p>
            <Link 
              href="/voice-chat" 
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
            >
              음성 채팅 시작하기
            </Link>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 transition duration-300">
            <h2 className="text-2xl font-bold mb-4">화상 채팅</h2>
            <p className="mb-6 text-gray-300">
              얼굴을 보며 대화할 수 있는 화상 채팅 기능으로 더 생생한 소통을 경험하세요.
            </p>
            <Link 
              href="/video-chat" 
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
            >
              화상 채팅 시작하기
            </Link>
          </div>
        </div>
        
        <div className="mt-16 text-center bg-gray-800 p-8 rounded-lg shadow-lg w-full">
          <h2 className="text-2xl font-bold mb-4">시작하는 방법</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="flex flex-col items-center">
              <div className="bg-indigo-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">계정 만들기</h3>
              <p className="text-gray-300">간단한 회원가입으로 시작하세요.</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-indigo-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">채널 만들기</h3>
              <p className="text-gray-300">친구들과 함께할 채널을 만드세요.</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-indigo-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">대화 시작하기</h3>
              <p className="text-gray-300">음성 또는 화상 채팅으로 대화를 시작하세요.</p>
            </div>
          </div>
        </div>
        
        <div className="mt-12">
          <Link 
            href="/signup" 
            className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300"
          >
            지금 시작하기
          </Link>
        </div>
      </div>
      
      <footer className="mt-16 w-full text-center text-gray-400">
        <p>© 2025 MurmurNet. All rights reserved.</p>
      </footer>
    </main>
  );
}