'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaXmark, FaArrowRight, FaBookOpen, FaChartLine, FaRegLightbulb, FaGraduationCap } from 'react-icons/fa6';
import { LogoMark } from './Logo';

const VALID_LANGS = ['ja', 'zh', 'ko'];

interface Message {
  id: number;
  role: 'bot' | 'user';
  text: string;
  links?: { label: string; href: string }[];
}

const LANG_META: Record<string, { greeting: string; subgreeting: string; suggestions: { icon: typeof FaBookOpen; text: string; href: string }[] }> = {
  ja: {
    greeting: 'Xin chào! Mình là Ikagi — trợ lý học tiếng Nhật của bạn 🎌',
    subgreeting: 'Mình có thể giúp bạn tìm bài học, đề thi thử hoặc ôn flashcard nhanh.',
    suggestions: [
      { icon: FaBookOpen,      text: 'Bắt đầu học từ N5',     href: '/ja/learn/N5'  },
      { icon: FaChartLine,     text: 'Làm đề thi thử JLPT',   href: '/ja/levels'    },
      { icon: FaRegLightbulb,  text: 'Ôn flashcard',          href: '/ja/flashcards'},
      { icon: FaGraduationCap, text: 'Xem tiến trình',        href: '/dashboard'    },
    ],
  },
  zh: {
    greeting: 'Xin chào! Mình là Ikagi — trợ lý học tiếng Trung của bạn 🇨🇳',
    subgreeting: 'Mình có thể giúp bạn chọn cấp HSK, tìm bài học phù hợp hoặc luyện từ vựng.',
    suggestions: [
      { icon: FaBookOpen,      text: 'Bắt đầu học HSK1',      href: '/zh/learn/HSK1'},
      { icon: FaChartLine,     text: 'Làm đề thi thử HSK',    href: '/zh/levels'    },
      { icon: FaRegLightbulb,  text: 'Ôn flashcard',          href: '/zh/flashcards'},
      { icon: FaGraduationCap, text: 'Xem tiến trình',        href: '/dashboard'    },
    ],
  },
  ko: {
    greeting: 'Xin chào! Mình là Ikagi — trợ lý học tiếng Hàn của bạn 🇰🇷',
    subgreeting: 'Mình có thể giúp bạn học TOPIK, luyện Hangul hoặc ôn từ vựng.',
    suggestions: [
      { icon: FaBookOpen,      text: 'Bắt đầu học TOPIK1',    href: '/ko/learn/TOPIK1'},
      { icon: FaChartLine,     text: 'Làm đề thi thử TOPIK',  href: '/ko/levels'      },
      { icon: FaRegLightbulb,  text: 'Ôn flashcard',          href: '/ko/flashcards'  },
      { icon: FaGraduationCap, text: 'Xem tiến trình',        href: '/dashboard'      },
    ],
  },
};

export function ChatBot() {
  const pathname = usePathname();
  const seg  = pathname.split('/')[1];
  const lang = VALID_LANGS.includes(seg) ? seg : 'ja';
  const meta = LANG_META[lang];

  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]     = useState('');
  const [hasOpened, setHasOpened] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Draggable Y position ────────────────────────────────────────────────
  const BTN_SIZE = 52;
  const DEFAULT_BOTTOM = 24;
  const [btnBottom, setBtnBottom] = useState(DEFAULT_BOTTOM);
  const dragging = useRef(false);
  const hasDragged = useRef(false);
  const startY = useRef(0);
  const startBottom = useRef(0);
  const currentBottom = useRef(DEFAULT_BOTTOM);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('chatbot-btn-bottom');
    if (stored) {
      const val = Number(stored);
      setBtnBottom(val);
      currentBottom.current = val;
    }
  }, []);

  function handleBtnPointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    dragging.current = true;
    hasDragged.current = false;
    startY.current = e.clientY;
    startBottom.current = currentBottom.current;
    btnRef.current?.setPointerCapture(e.pointerId);
  }
  function handleBtnPointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    if (!dragging.current) return;
    const dy = startY.current - e.clientY;
    if (Math.abs(dy) > 5) hasDragged.current = true;
    const max = window.innerHeight - BTN_SIZE - 8;
    const next = Math.max(8, Math.min(max, startBottom.current + dy));
    currentBottom.current = next;
    setBtnBottom(next);
  }
  function handleBtnPointerUp() {
    if (!dragging.current) return;
    dragging.current = false;
    if (hasDragged.current) {
      localStorage.setItem('chatbot-btn-bottom', String(Math.round(currentBottom.current)));
    }
  }

  // Init messages on first open
  useEffect(() => {
    if (open && !hasOpened) {
      setHasOpened(true);
      setMessages([
        {
          id: 1,
          role: 'bot',
          text: meta.greeting,
        },
        {
          id: 2,
          role: 'bot',
          text: meta.subgreeting,
          links: meta.suggestions.map(s => ({ label: s.text, href: s.href })),
        },
      ]);
    }
  }, [open, hasOpened, meta]);

  // Scroll to bottom on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = { id: Date.now(), role: 'user', text };
    setInput('');

    // Simple keyword routing
    const lower = text.toLowerCase();
    let reply: Message;
    if (/n5|n4|n3|n2|n1|hsk|topik/i.test(text)) {
      const code = text.match(/n[1-5]|hsk\d?|topik\d?/i)?.[0]?.toUpperCase() ?? '';
      reply = {
        id: Date.now() + 1,
        role: 'bot',
        text: `Bạn muốn học ${code || 'cấp này'} nhỉ! Đây là lối vào nhanh:`,
        links: [
          { label: `Học ${code}`, href: `/${lang}/learn/${code}` },
          { label: 'Thi thử', href: `/${lang}/levels` },
        ],
      };
    } else if (/flash|từ vựng|vocab/i.test(lower)) {
      reply = { id: Date.now() + 1, role: 'bot', text: 'Flashcard giúp bạn nhớ nhanh hơn 3x nhờ spaced repetition! 🔥', links: [{ label: 'Mở Flashcard', href: `/${lang}/flashcards` }] };
    } else if (/nghe|listen|đọc|read/i.test(lower)) {
      reply = { id: Date.now() + 1, role: 'bot', text: 'Luyện kỹ năng nghe và đọc hiểu theo format thi thật:', links: [{ label: 'Luyện nghe', href: `/${lang}/listening` }, { label: 'Đọc hiểu', href: `/${lang}/reading` }] };
    } else if (/tiến trình|dashboard|điểm|score/i.test(lower)) {
      reply = { id: Date.now() + 1, role: 'bot', text: 'Xem tổng kết tiến trình học, streak và điểm thi của bạn:', links: [{ label: 'Xem Dashboard', href: '/dashboard' }] };
    } else if (/đăng ký|register|tài khoản|account/i.test(lower)) {
      reply = { id: Date.now() + 1, role: 'bot', text: 'Tạo tài khoản để lưu tiến trình, streak và flashcard cá nhân:', links: [{ label: 'Đăng ký miễn phí', href: '/auth/register' }] };
    } else {
      reply = {
        id: Date.now() + 1,
        role: 'bot',
        text: 'Hiện tại mình hỗ trợ tìm đường nhanh đến các mục học. Thử gõ: "N3", "flashcard", "nghe", hoặc "tiến trình" nhé!',
      };
    }

    setMessages(prev => [...prev, userMsg, reply]);
  }, [input, lang]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      {/* Floating button */}
      <button
        ref={btnRef}
        onClick={() => { if (!hasDragged.current) setOpen(o => !o); }}
        onPointerDown={handleBtnPointerDown}
        onPointerMove={handleBtnPointerMove}
        onPointerUp={handleBtnPointerUp}
        aria-label="Mở trợ lý Ikagi"
        className="fixed right-6 z-50 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95"
        style={{
          bottom: btnBottom,
          width: BTN_SIZE, height: BTN_SIZE, borderRadius: '50%',
          background: 'linear-gradient(135deg, #7C3AED, #2563EB)',
          boxShadow: '0 4px 20px rgba(124,58,237,.45)',
          touchAction: 'none',
          cursor: dragging.current ? 'grabbing' : 'grab',
          transition: dragging.current ? 'none' : 'transform .15s, box-shadow .15s',
        }}
      >
        {open
          ? <FaXmark size={20} color="white"/>
          : <LogoMark size={30}/>
        }
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed right-6 z-50 flex flex-col overflow-hidden"
          style={{
            bottom: btnBottom + BTN_SIZE + 12,
            width: 340, height: 480,
            borderRadius: 20,
            border: '1px solid var(--border)',
            background: 'var(--bg-surface)',
            boxShadow: '0 20px 60px rgba(0,0,0,.18)',
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 shrink-0"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)', borderRadius: '20px 20px 0 0' }}>
            <LogoMark size={32}/>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#fff' }}>Ikagi Assistant</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.7)' }}>Trợ lý học ngôn ngữ</div>
            </div>
            <div style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: '#34D399' }}/>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3"
            style={{ background: 'var(--bg-base)' }}>
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'items-start gap-2'}`}>
                {msg.role === 'bot' && (
                  <div className="shrink-0 mt-0.5">
                    <LogoMark size={24}/>
                  </div>
                )}
                <div style={{ maxWidth: '84%' }}>
                  <div
                    style={{
                      padding: '9px 13px',
                      borderRadius: msg.role === 'bot' ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                      fontSize: 13,
                      lineHeight: 1.55,
                      background: msg.role === 'bot'
                        ? 'var(--bg-surface)'
                        : 'linear-gradient(135deg, #7C3AED, #2563EB)',
                      color: msg.role === 'bot' ? 'var(--text-primary)' : '#fff',
                      border: msg.role === 'bot' ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    {msg.text}
                  </div>
                  {msg.links && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.links.map(l => (
                        <Link key={l.href} href={l.href}
                          onClick={() => setOpen(false)}
                          className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition-all hover:scale-105"
                          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: '#7C3AED' }}>
                          {l.label} <FaArrowRight size={9}/>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={endRef}/>
          </div>

          {/* Input */}
          <div className="shrink-0 px-3 py-3 flex gap-2 items-center"
            style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Nhập câu hỏi..."
              style={{
                flex: 1, fontSize: 13, padding: '8px 12px',
                borderRadius: 12, border: '1px solid var(--border)',
                background: 'var(--bg-base)', color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              style={{
                width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                background: input.trim() ? 'linear-gradient(135deg, #7C3AED, #2563EB)' : 'var(--bg-muted)',
                border: 'none', cursor: input.trim() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all .15s',
              }}
            >
              <FaArrowRight size={13} color={input.trim() ? '#fff' : 'var(--text-muted)'}/>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
