import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  FaHeadphones, FaMicrophone, FaBookOpen, FaPencil,
  FaCircleCheck, FaArrowRight, FaStar, FaGraduationCap,
  FaFire, FaPlay, FaTrophy, FaBolt, FaRocket, FaCrown,
  FaLeaf, FaBullseye, FaMap, FaGift, FaMobileScreen, FaBook,
} from 'react-icons/fa6';
import { HomeIntentSelector } from './HomeIntentSelector';

/* ── Types ──────────────────────────────────────────────────────────── */
interface VocabCard { word: string; read: string; vn: string; type: string; from: string; to: string; tc: string }
interface LevelCard { code: string; label: string; from: string; to: string; textC: string; pct: number; kanji: string; icon: ReactNode; rgb: string }
interface MarqueeItem { icon: ReactNode; text: string }
interface SkillCard { icon: ReactNode; label: string; href: string; desc: string; from: string; to: string; icon_bg: string; key_color: string }
interface StepCard { num: string; icon: ReactNode; title: string; desc: string; color: string }
interface LangConfig {
  badge: string;
  h1_plain: string;
  h1_gradient: string;
  h1_end: string;
  subhead: string;
  cta_learn_text: string;
  cta_exam_text: string;
  cta_learn_href: string;
  cta_exam_href: string;
  vocab: VocabCard[];
  levels: LevelCard[];
  levels_grid: string;
  skills: SkillCard[];
  marquee: MarqueeItem[];
  steps: StepCard[];
  section_levels_title: string;
  section_levels_sub: string;
  section_skills_title: string;
  section_skills_sub: string;
  section_steps_title: string;
  cta_tag: string;
  cta_h1: string;
  cta_gradient: string;
  cta_sub: string;
  register_href: string;
  try_href: string;
  show_intent_selector: boolean;
}

/* ── Language configs ───────────────────────────────────────────────── */
function getConfig(lang: string): LangConfig {
  /* ─── Japanese ─── */
  if (lang === 'ja') return {
    badge: 'Nền tảng học tiếng Nhật JLPT',
    h1_plain: 'Chinh phục',
    h1_gradient: 'JLPT N5 → N1',
    h1_end: 'dễ hơn bạn nghĩ',
    subhead: 'Học từ vựng, ngữ pháp, luyện 4 kỹ năng và thi thử với đề sát format JLPT — hoàn toàn miễn phí, không cần cài app.',
    cta_learn_text: 'Bắt đầu học ngay',
    cta_exam_text: 'Thi thử JLPT',
    cta_learn_href: '/ja/learn',
    cta_exam_href: '/ja/levels',
    vocab: [
      { word: '先生', read: 'せんせい', vn: 'Giáo viên',   type: '名詞', from: '#D1FAE5', to: '#A7F3D0', tc: '#065F46' },
      { word: '学ぶ', read: 'まなぶ',   vn: 'Học tập',     type: '動詞', from: '#EDE9FE', to: '#DDD6FE', tc: '#4C1D95' },
      { word: '日本語', read: 'にほんご', vn: 'Tiếng Nhật', type: '名詞', from: '#FEF3C7', to: '#FDE68A', tc: '#78350F' },
    ],
    levels: [
      { code: 'N5', label: 'Sơ cấp',        from: '#34D399', to: '#059669', textC: '#064E3B', pct: 20,  kanji: '始', icon: <FaLeaf   size={20} color="rgba(255,255,255,.9)"/>, rgb: '52,211,153'  },
      { code: 'N4', label: 'Sơ trung cấp',  from: '#60A5FA', to: '#2563EB', textC: '#1E3A8A', pct: 40,  kanji: '学', icon: <FaBook   size={20} color="rgba(255,255,255,.9)"/>, rgb: '96,165,250'  },
      { code: 'N3', label: 'Trung cấp',     from: '#FCD34D', to: '#D97706', textC: '#78350F', pct: 60,  kanji: '語', icon: <FaBolt   size={20} color="rgba(255,255,255,.9)"/>, rgb: '252,211,77'  },
      { code: 'N2', label: 'Trung cao cấp', from: '#FB923C', to: '#DC2626', textC: '#7C2D12', pct: 80,  kanji: '達', icon: <FaRocket size={20} color="rgba(255,255,255,.9)"/>, rgb: '251,146,60'  },
      { code: 'N1', label: 'Cao cấp',       from: '#F472B6', to: '#9333EA', textC: '#581C87', pct: 100, kanji: '極', icon: <FaCrown  size={20} color="rgba(255,255,255,.9)"/>, rgb: '244,114,182' },
    ],
    levels_grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4',
    marquee: [
      { icon: <FaTrophy size={12}/>,       text: 'JLPT N5 → N1' },
      { icon: <FaHeadphones size={12}/>,   text: 'Luyện nghe JLPT' },
      { icon: <FaBookOpen size={12}/>,     text: 'Đọc hiểu mỗi ngày' },
      { icon: <FaPencil size={12}/>,       text: 'Kanji & Kana' },
      { icon: <FaBolt size={12}/>,         text: 'Flashcards nhanh' },
      { icon: <FaGift size={12}/>,         text: 'Hoàn toàn miễn phí' },
      { icon: <FaMobileScreen size={12}/>, text: 'Mobile friendly' },
      { icon: <FaBullseye size={12}/>,     text: 'Mock test JLPT' },
      { icon: <FaFire size={12}/>,         text: 'Streak học mỗi ngày' },
      { icon: <FaLeaf size={12}/>,         text: '1,200+ bài học' },
    ],
    skills: [
      { icon: <FaHeadphones size={28}/>, label: 'Luyện Nghe', href: '/ja/listening', desc: 'Hội thoại & thông báo thực tế. Luyện tai để bắt kịp tốc độ người bản ngữ.',    from: '#DBEAFE', to: '#EFF6FF', icon_bg: '#2563EB', key_color: '#2563EB' },
      { icon: <FaMicrophone size={28}/>, label: 'Tập Nói',    href: '/ja/learn',     desc: 'Mẫu câu giao tiếp & phát âm chuẩn. Tự tin hội thoại trong mọi tình huống.',   from: '#D1FAE5', to: '#F0FDF4', icon_bg: '#10B981', key_color: '#10B981' },
      { icon: <FaBookOpen size={28}/>,   label: 'Đọc Hiểu',   href: '/ja/reading',   desc: 'Văn bản, bài báo, đề đọc sát format JLPT theo từng cấp độ N5–N1.',           from: '#FEF3C7', to: '#FFFBEB', icon_bg: '#F59E0B', key_color: '#F59E0B' },
      { icon: <FaPencil size={28}/>,     label: 'Luyện Viết', href: '/ja/learn',     desc: 'Kana, Kanji và cấu trúc câu từ cơ bản đến nâng cao, có lộ trình rõ ràng.',   from: '#EDE9FE', to: '#F5F3FF', icon_bg: '#7C3AED', key_color: '#7C3AED' },
    ],
    steps: [
      { num: '1', icon: <FaBullseye size={34} color="#7C3AED"/>, title: 'Chọn cấp độ phù hợp', desc: 'Bắt đầu từ N5 hoặc nhảy thẳng vào level bạn cần. Không cần kinh nghiệm.', color: '#7C3AED' },
      { num: '2', icon: <FaBook     size={34} color="#2563EB"/>, title: 'Học theo từng chủ đề', desc: 'Từ vựng, ngữ pháp, luyện nghe – nói – đọc – viết theo bài học có cấu trúc.', color: '#2563EB' },
      { num: '3', icon: <FaTrophy   size={34} color="#10B981"/>, title: 'Thi thử & kiểm tra',   desc: 'Format đề JLPT thực tế, theo dõi điểm và tiến trình học của bạn.', color: '#10B981' },
    ],
    section_levels_title: 'Chọn cấp độ của bạn',
    section_levels_sub: 'Từ N5 sơ cấp đến N1 cao cấp — học theo lộ trình hoặc nhảy thẳng vào level cần thiết',
    section_skills_title: '4 Kỹ năng luyện thi JLPT',
    section_skills_sub: 'Mỗi kỹ năng có lộ trình bài học riêng, được thiết kế sát format JLPT thực tế',
    section_steps_title: '3 bước để chinh phục JLPT',
    cta_tag: 'Hoàn toàn miễn phí',
    cta_h1: 'Bắt đầu hành trình',
    cta_gradient: 'học tiếng Nhật',
    cta_sub: 'Tiến trình lưu tự động · Không cần cài app · 1,200+ bài học miễn phí',
    register_href: '/auth/register',
    try_href: '/ja/learn',
    show_intent_selector: true,
  };

  /* ─── Chinese ─── */
  if (lang === 'zh') return {
    badge: 'Nền tảng học tiếng Trung HSK',
    h1_plain: 'Chinh phục',
    h1_gradient: 'HSK 1 → 6',
    h1_end: 'với lộ trình rõ ràng',
    subhead: 'Học từ vựng, ngữ pháp, luyện 4 kỹ năng và thi thử với đề sát format HSK — hoàn toàn miễn phí, không cần cài app.',
    cta_learn_text: 'Bắt đầu học ngay',
    cta_exam_text: 'Thi thử HSK',
    cta_learn_href: '/zh/learn',
    cta_exam_href: '/zh/levels',
    vocab: [
      { word: '老师', read: 'lǎo shī', vn: 'Giáo viên',    type: '名词', from: '#D1FAE5', to: '#A7F3D0', tc: '#065F46' },
      { word: '学习', read: 'xué xí',  vn: 'Học tập',      type: '动词', from: '#EDE9FE', to: '#DDD6FE', tc: '#4C1D95' },
      { word: '汉语', read: 'hàn yǔ',  vn: 'Tiếng Trung',  type: '名词', from: '#FEF3C7', to: '#FDE68A', tc: '#78350F' },
    ],
    levels: [
      { code: 'HSK1', label: 'Sơ cấp 1',   from: '#34D399', to: '#059669', textC: '#064E3B', pct: 17,  kanji: '一', icon: <FaLeaf   size={18} color="rgba(255,255,255,.9)"/>, rgb: '52,211,153'  },
      { code: 'HSK2', label: 'Sơ cấp 2',   from: '#60A5FA', to: '#2563EB', textC: '#1E3A8A', pct: 33,  kanji: '二', icon: <FaBook   size={18} color="rgba(255,255,255,.9)"/>, rgb: '96,165,250'  },
      { code: 'HSK3', label: 'Trung cấp',  from: '#FCD34D', to: '#D97706', textC: '#78350F', pct: 50,  kanji: '三', icon: <FaBolt   size={18} color="rgba(255,255,255,.9)"/>, rgb: '252,211,77'  },
      { code: 'HSK4', label: 'Trung cao',  from: '#FB923C', to: '#DC2626', textC: '#7C2D12', pct: 67,  kanji: '四', icon: <FaRocket size={18} color="rgba(255,255,255,.9)"/>, rgb: '251,146,60'  },
      { code: 'HSK5', label: 'Cao cấp',    from: '#F472B6', to: '#9333EA', textC: '#581C87', pct: 83,  kanji: '五', icon: <FaCrown  size={18} color="rgba(255,255,255,.9)"/>, rgb: '244,114,182' },
      { code: 'HSK6', label: 'Thành thạo', from: '#EF4444', to: '#7C3AED', textC: '#3B0764', pct: 100, kanji: '六', icon: <FaTrophy size={18} color="rgba(255,255,255,.9)"/>, rgb: '239,68,68'   },
    ],
    levels_grid: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3',
    marquee: [
      { icon: <FaTrophy size={12}/>,       text: 'HSK 1 → 6' },
      { icon: <FaHeadphones size={12}/>,   text: 'Luyện nghe HSK' },
      { icon: <FaBookOpen size={12}/>,     text: 'Đọc hiểu mỗi ngày' },
      { icon: <FaPencil size={12}/>,       text: 'Hán tự & Pinyin' },
      { icon: <FaBolt size={12}/>,         text: 'Flashcards nhanh' },
      { icon: <FaGift size={12}/>,         text: 'Hoàn toàn miễn phí' },
      { icon: <FaMobileScreen size={12}/>, text: 'Mobile friendly' },
      { icon: <FaBullseye size={12}/>,     text: 'Mock test HSK' },
      { icon: <FaFire size={12}/>,         text: 'Streak học mỗi ngày' },
      { icon: <FaLeaf size={12}/>,         text: '1,000+ bài học' },
    ],
    skills: [
      { icon: <FaHeadphones size={28}/>, label: 'Luyện Nghe', href: '/zh/listening', desc: 'Hội thoại & thông báo thực tế. Luyện tai nghe tiếng Trung tự nhiên.',     from: '#DBEAFE', to: '#EFF6FF', icon_bg: '#2563EB', key_color: '#2563EB' },
      { icon: <FaMicrophone size={28}/>, label: 'Tập Nói',    href: '/zh/learn',     desc: 'Phát âm 4 thanh điệu chuẩn, mẫu câu giao tiếp hàng ngày tự nhiên.',     from: '#D1FAE5', to: '#F0FDF4', icon_bg: '#10B981', key_color: '#10B981' },
      { icon: <FaBookOpen size={28}/>,   label: 'Đọc Hiểu',   href: '/zh/reading',   desc: 'Văn bản, bài báo, đề đọc sát format HSK theo từng cấp độ HSK1–6.',       from: '#FEF3C7', to: '#FFFBEB', icon_bg: '#F59E0B', key_color: '#F59E0B' },
      { icon: <FaPencil size={28}/>,     label: 'Luyện Viết', href: '/zh/learn',     desc: 'Hán tự, Pinyin và cấu trúc câu từ cơ bản đến nâng cao bài bản.',         from: '#EDE9FE', to: '#F5F3FF', icon_bg: '#7C3AED', key_color: '#7C3AED' },
    ],
    steps: [
      { num: '1', icon: <FaBullseye size={34} color="#7C3AED"/>, title: 'Chọn cấp độ HSK phù hợp', desc: 'Bắt đầu từ HSK1 hoặc nhảy thẳng vào level bạn cần. Không cần kinh nghiệm.', color: '#7C3AED' },
      { num: '2', icon: <FaBook     size={34} color="#2563EB"/>, title: 'Học theo từng chủ đề',     desc: 'Từ vựng, Hán tự, Pinyin, luyện nghe – nói – đọc – viết bài bản.',          color: '#2563EB' },
      { num: '3', icon: <FaTrophy   size={34} color="#10B981"/>, title: 'Thi thử & kiểm tra',       desc: 'Format đề HSK thực tế, theo dõi điểm và tiến trình học của bạn.',           color: '#10B981' },
    ],
    section_levels_title: 'Chọn cấp độ HSK của bạn',
    section_levels_sub: 'Từ HSK1 cơ bản đến HSK6 thành thạo — học theo lộ trình rõ ràng từng bước',
    section_skills_title: '4 Kỹ năng học tiếng Trung',
    section_skills_sub: 'Mỗi kỹ năng có lộ trình bài học riêng, phù hợp với từng cấp độ HSK',
    section_steps_title: '3 bước để thành thạo tiếng Trung',
    cta_tag: 'Hoàn toàn miễn phí',
    cta_h1: 'Bắt đầu hành trình',
    cta_gradient: 'học tiếng Trung',
    cta_sub: 'Tiến trình lưu tự động · Không cần cài app · 1,000+ bài học miễn phí',
    register_href: '/auth/register',
    try_href: '/zh/learn',
    show_intent_selector: false,
  };

  /* ─── Korean ─── */
  if (lang === 'ko') return {
    badge: 'Nền tảng học tiếng Hàn TOPIK',
    h1_plain: 'Chinh phục',
    h1_gradient: 'TOPIK I → II',
    h1_end: 'dễ hơn bạn nghĩ',
    subhead: 'Học từ vựng, ngữ pháp, luyện 4 kỹ năng tiếng Hàn — hoàn toàn miễn phí, không cần cài app.',
    cta_learn_text: 'Bắt đầu học ngay',
    cta_exam_text: 'Thi thử TOPIK',
    cta_learn_href: '/ko/learn',
    cta_exam_href: '/ko/levels',
    vocab: [
      { word: '선생님', read: 'seon saeng nim', vn: 'Giáo viên',   type: '명사', from: '#D1FAE5', to: '#A7F3D0', tc: '#065F46' },
      { word: '공부하다', read: 'gong bu ha da', vn: 'Học tập',    type: '동사', from: '#EDE9FE', to: '#DDD6FE', tc: '#4C1D95' },
      { word: '한국어', read: 'han guk eo',     vn: 'Tiếng Hàn',  type: '명사', from: '#FEF3C7', to: '#FDE68A', tc: '#78350F' },
    ],
    levels: [
      { code: 'TOPIK1', label: 'Sơ cấp 1',   from: '#34D399', to: '#059669', textC: '#064E3B', pct: 17,  kanji: '초', icon: <FaLeaf   size={18} color="rgba(255,255,255,.9)"/>, rgb: '52,211,153'  },
      { code: 'TOPIK2', label: 'Sơ cấp 2',   from: '#60A5FA', to: '#2563EB', textC: '#1E3A8A', pct: 33,  kanji: '기', icon: <FaBook   size={18} color="rgba(255,255,255,.9)"/>, rgb: '96,165,250'  },
      { code: 'TOPIK3', label: 'Trung cấp',  from: '#FCD34D', to: '#D97706', textC: '#78350F', pct: 50,  kanji: '중', icon: <FaBolt   size={18} color="rgba(255,255,255,.9)"/>, rgb: '252,211,77'  },
      { code: 'TOPIK4', label: 'Trung cao',  from: '#FB923C', to: '#DC2626', textC: '#7C2D12', pct: 67,  kanji: '상', icon: <FaRocket size={18} color="rgba(255,255,255,.9)"/>, rgb: '251,146,60'  },
      { code: 'TOPIK5', label: 'Cao cấp',    from: '#F472B6', to: '#9333EA', textC: '#581C87', pct: 83,  kanji: '고', icon: <FaCrown  size={18} color="rgba(255,255,255,.9)"/>, rgb: '244,114,182' },
      { code: 'TOPIK6', label: 'Thành thạo', from: '#EF4444', to: '#7C3AED', textC: '#3B0764', pct: 100, kanji: '최', icon: <FaTrophy size={18} color="rgba(255,255,255,.9)"/>, rgb: '239,68,68'   },
    ],
    levels_grid: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3',
    marquee: [
      { icon: <FaTrophy size={12}/>,       text: 'TOPIK I → II' },
      { icon: <FaHeadphones size={12}/>,   text: 'Luyện nghe TOPIK' },
      { icon: <FaBookOpen size={12}/>,     text: 'Đọc hiểu mỗi ngày' },
      { icon: <FaPencil size={12}/>,       text: 'Hangul & Từ vựng' },
      { icon: <FaBolt size={12}/>,         text: 'Flashcards nhanh' },
      { icon: <FaGift size={12}/>,         text: 'Hoàn toàn miễn phí' },
      { icon: <FaMobileScreen size={12}/>, text: 'Mobile friendly' },
      { icon: <FaBullseye size={12}/>,     text: 'Mock test TOPIK' },
      { icon: <FaFire size={12}/>,         text: 'Streak học mỗi ngày' },
      { icon: <FaLeaf size={12}/>,         text: '800+ bài học' },
    ],
    skills: [
      { icon: <FaHeadphones size={28}/>, label: 'Luyện Nghe', href: '/ko/listening', desc: 'Hội thoại & thông báo thực tế. Luyện tai nghe tiếng Hàn tự nhiên.',      from: '#DBEAFE', to: '#EFF6FF', icon_bg: '#2563EB', key_color: '#2563EB' },
      { icon: <FaMicrophone size={28}/>, label: 'Tập Nói',    href: '/ko/learn',     desc: 'Phát âm chuẩn tiếng Hàn, mẫu câu giao tiếp hàng ngày thực tế.',          from: '#D1FAE5', to: '#F0FDF4', icon_bg: '#10B981', key_color: '#10B981' },
      { icon: <FaBookOpen size={28}/>,   label: 'Đọc Hiểu',   href: '/ko/reading',   desc: 'Văn bản, bài báo, đề đọc sát format TOPIK theo từng cấp độ.',            from: '#FEF3C7', to: '#FFFBEB', icon_bg: '#F59E0B', key_color: '#F59E0B' },
      { icon: <FaPencil size={28}/>,     label: 'Luyện Viết', href: '/ko/learn',     desc: 'Hangul và cấu trúc câu tiếng Hàn từ cơ bản đến nâng cao.',               from: '#EDE9FE', to: '#F5F3FF', icon_bg: '#7C3AED', key_color: '#7C3AED' },
    ],
    steps: [
      { num: '1', icon: <FaBullseye size={34} color="#7C3AED"/>, title: 'Chọn cấp TOPIK phù hợp', desc: 'Bắt đầu từ TOPIK 1 hoặc nhảy thẳng vào level bạn cần.', color: '#7C3AED' },
      { num: '2', icon: <FaBook     size={34} color="#2563EB"/>, title: 'Học theo từng chủ đề',   desc: 'Từ vựng, Hangul, luyện nghe – nói – đọc – viết bài bản theo cấu trúc.', color: '#2563EB' },
      { num: '3', icon: <FaTrophy   size={34} color="#10B981"/>, title: 'Thi thử & kiểm tra',     desc: 'Format đề TOPIK thực tế, theo dõi điểm và tiến trình học.', color: '#10B981' },
    ],
    section_levels_title: 'Chọn cấp độ TOPIK của bạn',
    section_levels_sub: 'Từ TOPIK 1 cơ bản đến TOPIK 6 thành thạo — học từng bước rõ ràng',
    section_skills_title: '4 Kỹ năng học tiếng Hàn',
    section_skills_sub: 'Mỗi kỹ năng có lộ trình bài học riêng, phù hợp với từng cấp độ TOPIK',
    section_steps_title: '3 bước để thành thạo tiếng Hàn',
    cta_tag: 'Hoàn toàn miễn phí',
    cta_h1: 'Bắt đầu hành trình',
    cta_gradient: 'học tiếng Hàn',
    cta_sub: 'Tiến trình lưu tự động · Không cần cài app · 800+ bài học miễn phí',
    register_href: '/auth/register',
    try_href: '/ko/learn',
    show_intent_selector: false,
  };

  /* ─── Fallback → Japanese ─── */
  return getConfig('ja');
}

/* ── Component ──────────────────────────────────────────────────────── */
export function LandingPage({ lang }: { lang: string }) {
  const cfg = getConfig(lang);
  const tripled = [...cfg.marquee, ...cfg.marquee, ...cfg.marquee];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'IkagiLearn',
    url: `https://e-learn.ikagi.site${lang === 'ja' ? '' : `/${lang}`}`,
    description: cfg.subhead,
  };

  return (
    <div className="lp-root">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ════════════════════ HERO ════════════════════ */}
      <section className="lp-hero">
        <div className="lp-orb lp-orb-1" />
        <div className="lp-orb lp-orb-2" />
        <div className="lp-orb lp-orb-3" />

        <div className="max-w-5xl mx-auto px-6">
          <div className="lp-hero-inner">

            {/* LEFT */}
            <div className="lp-hero-left">
              <div className="lp-badge">
                <span className="lp-badge-dot-live" />
                <span>{cfg.badge}</span>
                <span className="lp-badge-chip">Miễn phí</span>
              </div>

              <h1 className="lp-h1">
                {cfg.h1_plain}<br />
                <span className="lp-h1-gradient">{cfg.h1_gradient}</span><br />
                {cfg.h1_end}
              </h1>
              <p className="lp-subhead">{cfg.subhead}</p>

              <div className="lp-hero-ctas">
                <Link href={cfg.cta_learn_href} className="lp-btn-primary">
                  {cfg.cta_learn_text} <FaArrowRight size={14}/>
                </Link>
                <Link href={cfg.cta_exam_href} className="lp-btn-outline">
                  <FaPlay size={13}/> {cfg.cta_exam_text}
                </Link>
              </div>

              <div className="lp-trust-row">
                <div className="lp-trust-item">
                  <FaGraduationCap size={14} color="#7C3AED"/>
                  <span>2,400+ học viên</span>
                </div>
                <div className="lp-trust-item">
                  <FaBookOpen size={13} color="#2563EB"/>
                  <span>1,000+ bài học</span>
                </div>
                <div className="lp-trust-item">
                  {[1,2,3,4,5].map(i=><FaStar key={i} size={11} color="#F59E0B"/>)}
                  <span style={{marginLeft:4}}>4.9</span>
                </div>
              </div>
            </div>

            {/* RIGHT – vocab card stack */}
            <div className="lp-hero-right">
              <div className="lp-card-stack">
                {cfg.vocab.map((v, i) => (
                  <div key={v.word} className={`lp-vocab-card lp-vocab-card-${i+1}`}
                    style={{ background: `linear-gradient(135deg, ${v.from}, ${v.to})` }}>
                    <span className="lp-vocab-type" style={{ color: v.tc, borderColor: v.tc + '44', background: v.tc + '18' }}>{v.type}</span>
                    <div className="lp-vocab-jp" style={{ color: v.tc }}>{v.word}</div>
                    <div className="lp-vocab-read" style={{ color: v.tc + 'bb' }}>{v.read}</div>
                    <div className="lp-vocab-vn">{v.vn}</div>
                    <div className="lp-vocab-done"><FaCircleCheck size={10}/> Đã học</div>
                  </div>
                ))}

                <div className="lp-float-badge lp-float-streak">
                  <FaFire size={18} color="#F97316"/>
                  <div>
                    <div style={{ fontSize:12, fontWeight:800, color:'#0F0D1A' }}>7 ngày streak</div>
                    <div style={{ fontSize:10, color:'#6B7280' }}>Tiếp tục nhé!</div>
                  </div>
                </div>
                <div className="lp-float-badge lp-float-xp">
                  <FaTrophy size={16} color="#F59E0B"/>
                  <div>
                    <div style={{ fontSize:12, fontWeight:800, color:'#0F0D1A' }}>+50 XP</div>
                    <div style={{ fontSize:10, color:'#6B7280' }}>Bài vừa xong</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════════ MARQUEE ════════════════════ */}
      <div className="lp-marquee-section">
        <div className="lp-marquee-track">
          {tripled.map((item, i) => (
            <span key={i} className="lp-marquee-item">
              {item.icon} {item.text}
              <span className="lp-marquee-sep">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ════════════════════ LEVELS ════════════════════ */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="lp-section-header">
            <div className="lp-section-tag"><FaMap size={11}/> LỘ TRÌNH</div>
            <h2 className="lp-section-title">{cfg.section_levels_title}</h2>
            <p className="lp-section-sub">{cfg.section_levels_sub}</p>
          </div>

          <div className={cfg.levels_grid}>
            {cfg.levels.map((l) => (
              <Link key={l.code} href={`/${lang}/learn/${l.code}`} className="lp-level-card"
                style={{ '--lc-rgb': l.rgb, '--lc-from': l.from, '--lc-to': l.to } as React.CSSProperties}>
                <div className="lp-level-head" style={{ background: `linear-gradient(135deg, ${l.from}, ${l.to})` }}>
                  <div className="lp-level-kanji">{l.kanji}</div>
                  <div className="lp-level-emoji">{l.icon}</div>
                  <div className="lp-level-badge" style={{ color: l.textC }}>{l.code}</div>
                </div>
                <div className="lp-level-body">
                  <div className="lp-level-name">{l.label}</div>
                  <div style={{ display:'flex', gap:3, marginBottom:10 }}>
                    {[20,40,60,80,100].map((threshold, idx) => (
                      <div key={idx} style={{ width:7, height:7, borderRadius:'50%', background: threshold<=l.pct ? l.from : '#E5E7EB', transition:'background .2s' }}/>
                    ))}
                  </div>
                  <div className="lp-level-arrow" style={{ '--lc-from': l.from, '--lc-to': l.to } as React.CSSProperties}>
                    <FaArrowRight size={10}/>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ INTENT SELECTOR (ja only) ════════════════════ */}
      {cfg.show_intent_selector && <HomeIntentSelector lang={lang} />}

      {/* ════════════════════ SKILLS ════════════════════ */}
      <section className="py-20 px-4" style={{ background: '#F8F9FF' }}>
        <div className="max-w-5xl mx-auto">
          <div className="lp-section-header">
            <div className="lp-section-tag"><FaStar size={11}/> NỘI DUNG</div>
            <h2 className="lp-section-title">{cfg.section_skills_title}</h2>
            <p className="lp-section-sub">{cfg.section_skills_sub}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cfg.skills.map(s => (
              <Link key={s.label} href={s.href} className="lp-skill-card"
                style={{ '--sk-bg-from': s.from, '--sk-bg-to': s.to, '--sk-color': s.key_color } as React.CSSProperties}>
                <div className="lp-skill-icon-box" style={{ background: s.icon_bg, color: '#fff' }}>{s.icon}</div>
                <div className="lp-skill-name">{s.label}</div>
                <p className="lp-skill-desc">{s.desc}</p>
                <div className="lp-skill-cta">Học ngay <FaArrowRight size={10}/></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ STEPS ════════════════════ */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="lp-section-header">
            <div className="lp-section-tag"><FaRocket size={11}/> BẮT ĐẦU</div>
            <h2 className="lp-section-title">{cfg.section_steps_title}</h2>
          </div>

          <div className="lp-steps-grid">
            {cfg.steps.map(step => (
              <div key={step.num} className="lp-step-card" style={{ '--st-color': step.color } as React.CSSProperties}>
                <div className="lp-step-num-bg">{step.num}</div>
                <div className="lp-step-icon">{step.icon}</div>
                <div className="lp-step-title">{step.title}</div>
                <p className="lp-step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ CTA ════════════════════ */}
      <section className="lp-cta py-28 px-4 text-center">
        <div className="lp-cta-orb-1" />
        <div className="lp-cta-orb-2" />
        <div className="relative max-w-2xl mx-auto">
          <div className="lp-cta-tag"><FaLeaf size={12}/> {cfg.cta_tag}</div>
          <h2 className="lp-cta-h2">
            {cfg.cta_h1}<br />
            <span className="lp-cta-h2-gradient">{cfg.cta_gradient}</span><br />
            ngay hôm nay
          </h2>
          <p className="lp-cta-sub mb-10">{cfg.cta_sub}</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href={cfg.register_href} className="lp-cta-btn-reg">
              Đăng ký miễn phí <FaArrowRight size={13}/>
            </Link>
            <Link href={cfg.try_href} className="lp-cta-btn-try">
              <FaPlay size={12}/> Học thử ngay
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
