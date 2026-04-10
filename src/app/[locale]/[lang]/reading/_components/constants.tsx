import React from 'react';
import { FaAlignLeft, FaAlignJustify, FaNewspaper } from 'react-icons/fa6';
import type { GrammarPoint } from './types';

// ─── Constants ────────────────────────────────────────────────────────────────

export const LEVEL_META: Record<string, { bg: string; color: string; gradient: string; emoji: string; desc: string }> = {
  N5:   { bg: '#DCFCE7', color: '#15803D', gradient: 'linear-gradient(135deg, #DCFCE7, #BBF7D0)', emoji: '🌱', desc: 'Sơ cấp' },
  N4:   { bg: '#DBEAFE', color: '#1D4ED8', gradient: 'linear-gradient(135deg, #DBEAFE, #BFDBFE)', emoji: '📗', desc: 'Sơ trung cấp' },
  N3:   { bg: '#FEF9C3', color: '#92400E', gradient: 'linear-gradient(135deg, #FEF9C3, #FDE68A)', emoji: '📘', desc: 'Trung cấp' },
  N2:   { bg: '#FFEDD5', color: '#C2410C', gradient: 'linear-gradient(135deg, #FFEDD5, #FED7AA)', emoji: '🔥', desc: 'Trung cao cấp' },
  N1:   { bg: '#FFE4E6', color: '#BE123C', gradient: 'linear-gradient(135deg, #FFE4E6, #FECDD3)', emoji: '👑', desc: 'Cao cấp' },
  HSK1: { bg: '#DCFCE7', color: '#15803D', gradient: 'linear-gradient(135deg, #DCFCE7, #BBF7D0)', emoji: '🌱', desc: 'Sơ cấp' },
  HSK2: { bg: '#DBEAFE', color: '#1D4ED8', gradient: 'linear-gradient(135deg, #DBEAFE, #BFDBFE)', emoji: '📗', desc: 'Sơ trung cấp' },
  HSK3: { bg: '#FEF9C3', color: '#92400E', gradient: 'linear-gradient(135deg, #FEF9C3, #FDE68A)', emoji: '📘', desc: 'Trung cấp' },
  HSK4: { bg: '#FFEDD5', color: '#C2410C', gradient: 'linear-gradient(135deg, #FFEDD5, #FED7AA)', emoji: '🔥', desc: 'Trung cao cấp' },
  HSK5: { bg: '#F3E8FF', color: '#6B21A8', gradient: 'linear-gradient(135deg, #F3E8FF, #E9D5FF)', emoji: '⚡', desc: 'Cao cấp' },
  HSK6: { bg: '#FFE4E6', color: '#BE123C', gradient: 'linear-gradient(135deg, #FFE4E6, #FECDD3)', emoji: '👑', desc: 'Bậc thầy' },
};

export const TYPE_META: Record<string, { label: string; icon: React.ReactNode; bg: string; color: string }> = {
  short: { label: 'Đoạn ngắn', icon: <FaAlignLeft size={10} />,   bg: '#EFF6FF', color: '#2563EB' },
  long:  { label: 'Bài dài',   icon: <FaAlignJustify size={10} />, bg: '#F5F3FF', color: '#7C3AED' },
  news:  { label: 'Tin tức',   icon: <FaNewspaper size={10} />,    bg: '#FFF7ED', color: '#EA580C' },
};

export const THUMB_GRADIENTS = [
  'linear-gradient(135deg, #667eea, #764ba2)',
  'linear-gradient(135deg, #f093fb, #f5576c)',
  'linear-gradient(135deg, #4facfe, #00f2fe)',
  'linear-gradient(135deg, #43e97b, #38f9d7)',
  'linear-gradient(135deg, #fa709a, #fee140)',
  'linear-gradient(135deg, #a18cd1, #fbc2eb)',
  'linear-gradient(135deg, #fccb90, #d57eeb)',
  'linear-gradient(135deg, #e0c3fc, #8ec5fc)',
];

export const THUMB_ICONS = ['📖', '📝', '🗾', '🏯', '🌸', '🎌', '📰', '🗞️'];

export const GRAMMAR_LEVEL_META: Record<string, { bg: string; color: string }> = {
  N5: { bg: '#DCFCE7', color: '#15803D' },
  N4: { bg: '#DBEAFE', color: '#1D4ED8' },
  N3: { bg: '#FEF9C3', color: '#92400E' },
  N2: { bg: '#FFEDD5', color: '#C2410C' },
  N1: { bg: '#FFE4E6', color: '#BE123C' },
};

export const LEVEL_ORDER = ['N5', 'N4', 'N3', 'N2', 'N1'];

// ─── Grammar DB ───────────────────────────────────────────────────────────────

export const GRAMMAR_DB: Record<string, GrammarPoint[]> = {
  N5: [
    { id:'wa',   name:'〜は〜',     meaning:'Trợ từ chủ đề câu',                            pattern:/は/,                                highlight:'は' },
    { id:'ga',   name:'〜が〜',     meaning:'Trợ từ chủ ngữ — nhấn mạnh chủ thể',           pattern:/が/,                                highlight:'が' },
    { id:'wo',   name:'〜を〜',     meaning:'Trợ từ tân ngữ trực tiếp',                     pattern:/を/,                                highlight:'を' },
    { id:'de',   name:'〜で〜',     meaning:'Nơi diễn ra hành động / phương tiện',          pattern:/[^\s]で[^\s]/,                      highlight:'で' },
    { id:'ni',   name:'〜に〜',     meaning:'Điểm đến / thời điểm / đối tượng',            pattern:/[^\s]に[^\s]/,                      highlight:'に' },
    { id:'nai',  name:'〜ない',     meaning:'Phủ định động từ thông thường',               pattern:/ない[でですがをにもから]/,           highlight:'ない' },
    { id:'te',   name:'〜て〜',     meaning:'Liên kết hành động liên tiếp (て形)',          pattern:/[くがみりっ]て[いなくもお]/,        highlight:'て' },
    { id:'kara', name:'〜から',     meaning:'Từ ~ / vì ~ (nguyên nhân / xuất phát)',       pattern:/[^\s]から/,                         highlight:'から' },
    { id:'desu', name:'です／ます', meaning:'Thể lịch sự trong văn phong trang trọng',    pattern:/[ですけりかよ]ます|[ないきてで]です/, highlight:'です' },
  ],
  N4: [
    { id:'tekara',       name:'〜てから',       meaning:'Sau khi làm ~, rồi mới ~',                  pattern:/てから/,                    highlight:'てから' },
    { id:'nagara',       name:'〜ながら',       meaning:'Hai hành động đồng thời',                   pattern:/ながら/,                    highlight:'ながら' },
    { id:'teshimau',     name:'〜てしまう',     meaning:'Lỡ làm ~ / hoàn toàn đã làm ~',            pattern:/てしまう|でしまう/,          highlight:'てしまう' },
    { id:'tame',         name:'〜ために',       meaning:'Vì mục đích ~ / bởi lý do ~',              pattern:/ために/,                    highlight:'ために' },
    { id:'youni',        name:'〜ように',       meaning:'Để có thể ~ / dần dần trở nên ~',          pattern:/ように[するなっ]/,           highlight:'ように' },
    { id:'bakari',       name:'〜ばかり',       meaning:'Vừa mới ~ / chỉ toàn ~',                   pattern:/ばかり/,                    highlight:'ばかり' },
    { id:'toki',         name:'〜とき',         meaning:'Khi ~ (thời điểm xảy ra)',                 pattern:/とき[、。\nに]/,             highlight:'とき' },
    { id:'kamoshirenai', name:'〜かもしれない', meaning:'Có thể là ~ (không chắc chắn)',            pattern:/かもしれない|かもしれません/,  highlight:'かもしれない' },
    { id:'souda',        name:'〜そうだ',       meaning:'Trông có vẻ ~ / nghe nói rằng ~',          pattern:/そうだ|そうです|そうな/,      highlight:'そうだ' },
    { id:'rashii',       name:'〜らしい',       meaning:'Có vẻ ~ / mang đặc tính của ~',            pattern:/らしい|らしく/,              highlight:'らしい' },
  ],
  N3: [
    { id:'niyotte',  name:'〜によって',     meaning:'Tùy theo ~ / được thực hiện bởi ~',      pattern:/によって|による/,          highlight:'によって' },
    { id:'toiu',     name:'〜という',       meaning:'Được gọi là ~ / ý kiến rằng ~',           pattern:/という/,                   highlight:'という' },
    { id:'dakede',   name:'〜だけでなく',   meaning:'Không chỉ ~ mà còn ~',                   pattern:/だけでなく/,                highlight:'だけでなく' },
    { id:'hazu',     name:'〜はずだ',       meaning:'Đáng lẽ phải ~ / chắc chắn là ~',        pattern:/はずだ|はずです|はずが/,    highlight:'はず' },
    { id:'noni',     name:'〜のに',         meaning:'Mặc dù ~ (thất vọng / trái kỳ vọng)',    pattern:/[^\s]のに[、。\n]/,         highlight:'のに' },
    { id:'youda',    name:'〜ようだ',       meaning:'Trông giống như ~ / có vẻ như ~',         pattern:/ようだ|ようです|ような/,    highlight:'ようだ' },
    { id:'kotoga',   name:'〜ことができる', meaning:'Có thể làm ~',                            pattern:/ことができ/,                highlight:'ことができ' },
    { id:'tabi',     name:'〜たびに',       meaning:'Mỗi lần ~ / khi nào ~ thì ~',            pattern:/たびに/,                    highlight:'たびに' },
    { id:'sokode',   name:'そこで〜',       meaning:'Vì vậy / do đó (kết quả tất yếu)',       pattern:/そこで/,                    highlight:'そこで' },
    { id:'tsumori',  name:'〜つもりだ',     meaning:'Có dự định làm ~',                       pattern:/つもり/,                    highlight:'つもり' },
  ],
  N2: [
    { id:'niokite',  name:'〜において',       meaning:'Trong lĩnh vực ~ (trang trọng)',           pattern:/において|における/,       highlight:'において' },
    { id:'nitaish',  name:'〜に対して',       meaning:'Đối với ~ / phản ứng lại ~',              pattern:/に対して|に対する/,       highlight:'に対して' },
    { id:'nitotte',  name:'〜にとって',       meaning:'Đối với ai / từ góc nhìn của ~',          pattern:/にとって/,                highlight:'にとって' },
    { id:'toshite',  name:'〜として',         meaning:'Với tư cách là ~ / trong vai trò ~',      pattern:/として/,                  highlight:'として' },
    { id:'niyoruto', name:'〜によると',       meaning:'Theo nguồn ~ / dựa theo ~',               pattern:/によると|によれば/,       highlight:'によると' },
    { id:'nimotoka', name:'〜にもかかわらず', meaning:'Dù cho ~ (trái kỳ vọng, trang trọng)',    pattern:/にもかかわらず/,          highlight:'にもかかわらず' },
    { id:'womajime', name:'〜をはじめ',       meaning:'Đứng đầu danh sách ~ / bao gồm ~',       pattern:/をはじめ/,                highlight:'をはじめ' },
    { id:'uede',     name:'〜うえで',         meaning:'Trên cơ sở ~ / sau khi làm ~',           pattern:/うえで|うえに/,           highlight:'うえで' },
    { id:'sarani',   name:'さらに〜',         meaning:'Hơn nữa / thêm vào đó',                  pattern:/さらに/,                  highlight:'さらに' },
    { id:'tooshite', name:'〜を通して',       meaning:'Thông qua ~ / suốt quá trình ~',         pattern:/を通して|を通じて/,       highlight:'を通して' },
  ],
  N1: [
    { id:'womotte',   name:'〜をもって',     meaning:'Bằng phương tiện ~ / kể từ ~ (rất trang trọng)', pattern:/をもって/,             highlight:'をもって' },
    { id:'womegute',  name:'〜をめぐって',   meaning:'Xoay quanh vấn đề ~',                           pattern:/をめぐって|をめぐる/,  highlight:'をめぐって' },
    { id:'nisaishi',  name:'〜に際して',     meaning:'Nhân dịp ~ / vào lúc quan trọng ~',             pattern:/に際して|に際し/,      highlight:'に際して' },
    { id:'karasite',  name:'〜からして',     meaning:'Ngay cả ~ đã / xét từ bản thân ~',             pattern:/からして/,             highlight:'からして' },
    { id:'bekida',    name:'〜べきだ',       meaning:'Nên làm ~ / có nghĩa vụ ~',                    pattern:/べきだ|べきで|べき[^\s]/,highlight:'べき' },
    { id:'kagiri',    name:'〜かぎり',       meaning:'Trong giới hạn ~ / chừng nào còn ~',           pattern:/かぎり|限り/,           highlight:'かぎり' },
    { id:'monoda',    name:'〜ものだ',       meaning:'Đương nhiên / bản chất / hồi tưởng',           pattern:/ものだ|ものです|ものがある/,highlight:'ものだ' },
    { id:'nishitemo', name:'〜にしても',     meaning:'Dù là ~ đi nữa / ngay cả khi ~',              pattern:/にしても/,             highlight:'にしても' },
    { id:'koso',      name:'〜こそ',         meaning:'Chính ~ (nhấn mạnh đặc biệt)',                 pattern:/こそ/,                 highlight:'こそ' },
    { id:'taritomo',  name:'〜たりとも',     meaning:'Dù chỉ một ~ cũng không (phủ định tuyệt đối)', pattern:/たりとも/,             highlight:'たりとも' },
  ],
};
