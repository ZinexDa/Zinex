import React, { useState, useEffect, useRef } from 'react';

// ==================== COMPONENTS ====================

// Music Overlay Component
const MusicOverlay = ({ onStart }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100000] cursor-pointer transition-all duration-500"
      onClick={onStart}
    >
      <h1 className="text-white text-4xl font-bold text-center animate-pulse">
        click to play music
      </h1>
    </div>
  );
};

// Logo Component
const Logo = ({ onLogoClick }) => {
  return (
    <div className="perspective-1000 mx-auto mb-4">
      <img 
        src="/zendex.png"
        className="w-64 h-64 max-w-[70%] mx-auto cursor-pointer rounded-full object-cover
                   border-[3px] border-[#73b7ff] p-2 bg-[#1a1a1a]/80
                   shadow-[0_0_20px_rgba(115,183,255,0.4),inset_0_0_20px_rgba(115,183,255,0.2)]
                   transition-all duration-300 hover:scale-110 hover:-translate-y-2
                   hover:shadow-[0_15px_35px_rgba(115,183,255,0.6)]
                   active:scale-95 active:translate-y-0"
        alt="Zinex Logo"
        onClick={onLogoClick}
      />
    </div>
  );
};

const Countdown = ({ onClick }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [winterEmojis] = useState(['❄️', '⛄', '🎄', '🎁', '🔔', '🧤', '🧣', '☃️', '🎅', '🤶']);
  const [currentEmoji, setCurrentEmoji] = useState('🎄');

  useEffect(() => {
    const emojiInterval = setInterval(() => {
      const randomEmoji = winterEmojis[Math.floor(Math.random() * winterEmojis.length)];
      setCurrentEmoji(randomEmoji);
    }, 3000);

    const updateCountdown = () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const newYear = new Date(currentYear + 1, 0, 1);
      const diff = newYear - now;
      
      if (diff <= 0) {
        setTimeLeft('🎉 С НОВЫМ ГОДОМ! 🎉');
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${days}д ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    };

    updateCountdown();
    const timeInterval = setInterval(updateCountdown, 1000);
    
    return () => {
      clearInterval(emojiInterval);
      clearInterval(timeInterval);
    };
  }, [winterEmojis]);

  return (
    <div className="relative inline-block perspective-1000 my-8">
      <div 
        className="text-4xl tracking-wider cursor-pointer relative z-10 px-6 py-4 rounded-2xl
                   bg-black/30 border-2 border-[#ff00cc] text-white font-mono
                   shadow-[0_0_25px_rgba(255,0,204,0.4)]
                   transition-all duration-300
                   hover:scale-105 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(255,0,204,0.6)]
                   active:scale-95 active:translate-y-0"
        style={{
          textShadow: '0 0 20px #ff00cc, 0 0 30px #ff0066, 0 0 50px #ff0000'
        }}
        onClick={onClick}
      >
        {timeLeft}
        <span className="absolute -right-16 -top-1 text-3xl animate-bounce">
          {currentEmoji}
        </span>
      </div>
    </div>
  );
};

// Bio Panel Component
const BioPanel = () => {
  const panelRef = useRef(null);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const handleMouseMove = (e) => {
      const rect = panel.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
      const mouseY = (e.clientY - rect.top) / rect.height - 0.5;
      
      const rotateY = mouseX * 10;
      const rotateX = -mouseY * 5;
      
      panel.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg) translateZ(10px)`;
    };

    const handleMouseLeave = () => {
      panel.style.transform = 'rotateY(0deg) rotateX(0deg) translateZ(0px)';
    };

    const container = panel.parentElement;
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="perspective-1000 max-w-[500px] mx-auto my-8">
      <div 
        ref={panelRef}
        className="bg-[#1a1a1a]/90 border-2 border-[#73b7ff] rounded-xl p-5
                   shadow-[0_0_25px_rgba(115,183,255,0.3)] backdrop-blur-sm
                   transition-all duration-100"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="text-center mb-5">
          <h2 className="text-[#73b7ff] text-2xl m-0" style={{ textShadow: '0 0 10px rgba(115, 183, 255, 0.5)' }}>
            Bio
          </h2>
        </div>
        
        <div className="flex flex-col gap-3">
          <InfoItem label="name??????:" value="Zinex" />
          <InfoItem label="my miiverse" value="idk" />
          <InfoItem label="langugugages:" value="і lua ну забыл етот ещё godotscript" />
          <InfoItem label="Сайт:" value="zinexda.github.io/Zinex" />
        </div>

        <SocialButtons />
      </div>
    </div>
  );
};

// Info Item Component
const InfoItem = ({ label, value }) => {
  return (
    <div className="flex justify-between items-center py-2 border-b border-[#333]
                    transition-all duration-300 hover:translate-x-1">
      <span className="text-[#bbb] font-bold min-w-[100px]">{label}</span>
      <span className="text-white flex-grow text-right px-2 py-1 rounded">{value}</span>
    </div>
  );
};

// Social Buttons Component
const SocialButtons = () => {
  const socials = [
    { 
      name: 'TikTok', 
      url: 'https://www.tiktok.com/@MS4wLjABAAAAFdLXg1ecsx-AwLS4skXMZxpD8ignWqoeMYw5Fh03V1RO62_YDqRYyrM3BtnQIcgi', 
      icon: '/tiktok.png' 
    },
    { 
      name: 'Discord', 
      url: 'https://discord.com/users/1247751784139591701', 
      icon: '/discord.png' 
    },
    { 
      name: 'GitHub', 
      url: 'https://github.com/ZinexDa', 
      icon: '/github.png' 
    }
  ];

  return (
    <div className="flex justify-center gap-5 mt-5 pt-5 border-t border-[#333]">
      {socials.map((social) => (
        <a
          key={social.name}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 rounded-full bg-gradient-to-br from-[#73b7ff] to-[#4a90e2]
                     flex items-center justify-center border-2 border-[#73b7ff]
                     shadow-[0_0_15px_rgba(115,183,255,0.4)]
                     transition-all duration-300
                     hover:scale-110 hover:-translate-y-1 hover:shadow-[0_5px_20px_rgba(115,183,255,0.6)]"
        >
          <img 
            src={social.icon} 
            alt={social.name}
            className="w-6 h-6 filter invert brightness-0"
            style={{ filter: 'invert(1) brightness(2)' }}
          />
        </a>
      ))}
    </div>
  );
};

// Mute Button Component
const MuteButton = ({ isMuted, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="fixed top-2 left-2 bg-gradient-to-br from-[#333] to-[#555]
                 text-white border-2 border-[#73b7ff] px-4 py-3 rounded-lg z-[10000]
                 shadow-[0_0_15px_rgba(115,183,255,0.3)]
                 transition-all duration-300
                 hover:scale-105 hover:-translate-y-1 hover:shadow-[0_5px_20px_rgba(115,183,255,0.5)]
                 hover:bg-gradient-to-br hover:from-[#555] hover:to-[#777]
                 active:scale-95 active:translate-y-0"
    >
      {isMuted ? '🔇' : '🔈'}
    </button>
  );
};

// Usagi Component
const Usagi = ({ isVisible }) => {
  return (
    <img
      src="/zinex.gif"
      alt="Usagi"
      className={`fixed bottom-0 right-5 w-[200px] z-[9999] transition-transform duration-500
                  ${isVisible ? '-translate-y-31' : 'translate-y-full'}`}
    />
  );
};

// Falling Peam Component
const FallingPeam = () => {
  const [peams, setPeams] = useState([]);

  const spawnPeam = () => {
    const id = Date.now() + Math.random();
    const left = Math.random() * (window.innerWidth - 80);
    
    setPeams(prev => [...prev, { id, left }]);
    
    setTimeout(() => {
      setPeams(prev => prev.filter(p => p.id !== id));
    }, 2500);
  };

  useEffect(() => {
    window.spawnPeam = spawnPeam;
    return () => {
      delete window.spawnPeam;
    };
  }, []);

  return (
    <>
      {peams.map((peam) => (
        <img
          key={peam.id}
          src="/peam.png"
          alt="Peam"
          className="fixed w-20 z-[20000] animate-[fall_2.2s_ease-in_forwards]"
          style={{
            left: `${peam.left}px`,
            top: '-120px',
            animation: 'fall 2.2s ease-in forwards'
          }}
        />
      ))}
    </>
  );
};

// ==================== MAIN APP ====================

export default function App() {
  const [musicStarted, setMusicStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showUsagi, setShowUsagi] = useState(false);
  const audioRef = useRef(null);
  const chirpsRef = useRef([]);

  useEffect(() => {
    chirpsRef.current = [
      new Audio('/chirper1.ogg'),
      new Audio('/chirper2.ogg'),
      new Audio('/chirper3.ogg')
    ];

    chirpsRef.current.forEach(chirp => {
      chirp.preload = 'auto';
      chirp.volume = 0.7;
    });
  }, []);

  const handleMusicStart = () => {
    setMusicStarted(true);
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(err => console.error('Audio error:', err));
    }
  };

  const handleLogoClick = () => {
    if (!musicStarted) return;
    
    setShowUsagi(true);
    
    const randomChirp = chirpsRef.current[Math.floor(Math.random() * chirpsRef.current.length)];
    randomChirp.currentTime = 0;
    randomChirp.play().catch(() => {});
    
    setTimeout(() => setShowUsagi(false), 4000);
  };

  const handleCountdownClick = () => {
    if (!musicStarted) return;
    const burst = 6 + Math.floor(Math.random() * 5);
    for (let i = 0; i < burst; i++) {
      setTimeout(() => window.spawnPeam?.(), i * 120);
    }
  };

  const handleMuteToggle = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="min-h-screen bg-[#111] text-white text-center pt-10 px-4 overflow-x-hidden">
      {!musicStarted && <MusicOverlay onStart={handleMusicStart} />}
      
      <audio ref={audioRef} loop>
        <source src="/background-music.mp3" type="audio/mpeg" />
      </audio>

      <div className={`transition-opacity duration-800 ${musicStarted ? 'opacity-100' : 'opacity-10 pointer-events-none'}`}>
        <Logo onLogoClick={handleLogoClick} />
        
        <h1 className="text-5xl my-5 cursor-pointer">woooooooooooooooow</h1>
        
        <Countdown onClick={handleCountdownClick} />
        
        <BioPanel />
      </div>

      <MuteButton isMuted={isMuted} onToggle={handleMuteToggle} />
      <Usagi isVisible={showUsagi} />
      <FallingPeam />

      <style jsx global>{`
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(${typeof window !== 'undefined' ? window.innerHeight + 200 : 1000}px) rotate(${Math.random() * 60 - 30}deg); opacity: 0; }
        }
        
        body {
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          margin: 0;
          overflow-x: hidden;
        }
        
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}