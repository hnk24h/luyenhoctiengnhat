/**
 * Seed bảng chữ cái sơ cấp — bài học bắt buộc:
 *   - Tiếng Nhật: Hiragana (ひらがな) + Katakana (カタカナ) → Level N5
 *   - Tiếng Trung: Bính âm Pinyin (拼音) — thanh điệu, phụ âm đầu, vần → Level HSK1
 *
 * Run: npx tsx prisma/seed-alphabet.ts
 */

import { PrismaClient, Language } from '@prisma/client';
const prisma = new PrismaClient();

type CharRow = {
  char: string;        // character(s) to learn
  rom: string;         // romanization
  meaning: string;     // Vietnamese description
  example?: string;    // example word
  exampleRom?: string;
  exampleVi?: string;
};
type AlphabetLesson = { title: string; description?: string; chars: CharRow[] };

// ─── Hiragana ─────────────────────────────────────────────────────────────────
const HIRAGANA: AlphabetLesson[] = [
  {
    title: 'Hiragana — Nguyên âm (あ行)',
    description: '5 nguyên âm cơ bản: a・i・u・e・o. Nền tảng của toàn bộ âm tiết tiếng Nhật.',
    chars: [
      { char: 'あ', rom: 'a',  meaning: 'Nguyên âm /a/', example: 'あお', exampleRom: 'ao', exampleVi: 'màu xanh lam' },
      { char: 'い', rom: 'i',  meaning: 'Nguyên âm /i/', example: 'いぬ', exampleRom: 'inu', exampleVi: 'con chó' },
      { char: 'う', rom: 'u',  meaning: 'Nguyên âm /u/ (môi không tròn)', example: 'うみ', exampleRom: 'umi', exampleVi: 'biển' },
      { char: 'え', rom: 'e',  meaning: 'Nguyên âm /e/', example: 'えき', exampleRom: 'eki', exampleVi: 'nhà ga' },
      { char: 'お', rom: 'o',  meaning: 'Nguyên âm /o/', example: 'おかね', exampleRom: 'okane', exampleVi: 'tiền' },
    ],
  },
  {
    title: 'Hiragana — Hàng KA (か行)',
    description: 'Âm phụ âm /k/: ka・ki・ku・ke・ko.',
    chars: [
      { char: 'か', rom: 'ka',  meaning: 'Âm /ka/', example: 'かさ', exampleRom: 'kasa', exampleVi: 'ô (dù)' },
      { char: 'き', rom: 'ki',  meaning: 'Âm /ki/', example: 'きって', exampleRom: 'kitte', exampleVi: 'tem thư' },
      { char: 'く', rom: 'ku',  meaning: 'Âm /ku/', example: 'くに', exampleRom: 'kuni', exampleVi: 'đất nước' },
      { char: 'け', rom: 'ke',  meaning: 'Âm /ke/', example: 'けいたい', exampleRom: 'keitai', exampleVi: 'điện thoại di động' },
      { char: 'こ', rom: 'ko',  meaning: 'Âm /ko/', example: 'こども', exampleRom: 'kodomo', exampleVi: 'trẻ em' },
    ],
  },
  {
    title: 'Hiragana — Hàng SA (さ行)',
    description: 'Âm phụ âm /s/: sa・shi・su・se・so. Lưu ý: し đọc là "shi", không phải "si".',
    chars: [
      { char: 'さ', rom: 'sa',  meaning: 'Âm /sa/', example: 'さくら', exampleRom: 'sakura', exampleVi: 'hoa anh đào' },
      { char: 'し', rom: 'shi', meaning: 'Âm /shi/ (≠ "si")', example: 'しごと', exampleRom: 'shigoto', exampleVi: 'công việc' },
      { char: 'す', rom: 'su',  meaning: 'Âm /su/', example: 'すし', exampleRom: 'sushi', exampleVi: 'sushi' },
      { char: 'せ', rom: 'se',  meaning: 'Âm /se/', example: 'せんせい', exampleRom: 'sensei', exampleVi: 'giáo viên' },
      { char: 'そ', rom: 'so',  meaning: 'Âm /so/', example: 'そら', exampleRom: 'sora', exampleVi: 'bầu trời' },
    ],
  },
  {
    title: 'Hiragana — Hàng TA (た行)',
    description: 'Âm phụ âm /t/: ta・chi・tsu・te・to. Lưu ý: ち = "chi", つ = "tsu".',
    chars: [
      { char: 'た', rom: 'ta',  meaning: 'Âm /ta/', example: 'たべもの', exampleRom: 'tabemono', exampleVi: 'thức ăn' },
      { char: 'ち', rom: 'chi', meaning: 'Âm /chi/ (≠ "ti")', example: 'ちず', exampleRom: 'chizu', exampleVi: 'bản đồ' },
      { char: 'つ', rom: 'tsu', meaning: 'Âm /tsu/ (≠ "tu")', example: 'つき', exampleRom: 'tsuki', exampleVi: 'mặt trăng' },
      { char: 'て', rom: 'te',  meaning: 'Âm /te/', example: 'てがみ', exampleRom: 'tegami', exampleVi: 'thư tay' },
      { char: 'と', rom: 'to',  meaning: 'Âm /to/', example: 'とけい', exampleRom: 'tokei', exampleVi: 'đồng hồ' },
    ],
  },
  {
    title: 'Hiragana — Hàng NA (な行)',
    description: 'Âm phụ âm mũi /n/: na・ni・nu・ne・no.',
    chars: [
      { char: 'な', rom: 'na', meaning: 'Âm /na/', example: 'なまえ', exampleRom: 'namae', exampleVi: 'tên' },
      { char: 'に', rom: 'ni', meaning: 'Âm /ni/', example: 'にほん', exampleRom: 'nihon', exampleVi: 'Nhật Bản' },
      { char: 'ぬ', rom: 'nu', meaning: 'Âm /nu/', example: 'ぬの', exampleRom: 'nuno', exampleVi: 'vải' },
      { char: 'ね', rom: 'ne', meaning: 'Âm /ne/', example: 'ねこ', exampleRom: 'neko', exampleVi: 'mèo' },
      { char: 'の', rom: 'no', meaning: 'Âm /no/', example: 'のみもの', exampleRom: 'nomimono', exampleVi: 'đồ uống' },
    ],
  },
  {
    title: 'Hiragana — Hàng HA (は行)',
    description: 'Âm phụ âm /h/: ha・hi・fu・he・ho. Lưu ý: ふ = "fu" (cả hai môi), は/へ có thể là trợ từ.',
    chars: [
      { char: 'は', rom: 'ha', meaning: 'Âm /ha/ (khi là trợ từ chủ đề → đọc "wa")', example: 'はな', exampleRom: 'hana', exampleVi: 'hoa' },
      { char: 'ひ', rom: 'hi', meaning: 'Âm /hi/', example: 'ひと', exampleRom: 'hito', exampleVi: 'người' },
      { char: 'ふ', rom: 'fu', meaning: 'Âm /fu/ (phát âm bằng cả hai môi, ≠ "hu")', example: 'ふゆ', exampleRom: 'fuyu', exampleVi: 'mùa đông' },
      { char: 'へ', rom: 'he', meaning: 'Âm /he/ (khi là trợ từ hướng → đọc "e")', example: 'へや', exampleRom: 'heya', exampleVi: 'căn phòng' },
      { char: 'ほ', rom: 'ho', meaning: 'Âm /ho/', example: 'ほん', exampleRom: 'hon', exampleVi: 'sách' },
    ],
  },
  {
    title: 'Hiragana — Hàng MA (ま行)',
    description: 'Âm phụ âm /m/: ma・mi・mu・me・mo.',
    chars: [
      { char: 'ま', rom: 'ma', meaning: 'Âm /ma/', example: 'まいにち', exampleRom: 'mainichi', exampleVi: 'mỗi ngày' },
      { char: 'み', rom: 'mi', meaning: 'Âm /mi/', example: 'みず', exampleRom: 'mizu', exampleVi: 'nước' },
      { char: 'む', rom: 'mu', meaning: 'Âm /mu/', example: 'むすめ', exampleRom: 'musume', exampleVi: 'con gái' },
      { char: 'め', rom: 'me', meaning: 'Âm /me/', example: 'めがね', exampleRom: 'megane', exampleVi: 'kính mắt' },
      { char: 'も', rom: 'mo', meaning: 'Âm /mo/', example: 'もも', exampleRom: 'momo', exampleVi: 'quả đào' },
    ],
  },
  {
    title: 'Hiragana — Hàng YA・RA・WA・N',
    description: 'Hoàn thiện bảng hiragana: ya/yu/yo, ra/ri/ru/re/ro, wa/wo, và âm mũi ん.',
    chars: [
      { char: 'や', rom: 'ya', meaning: 'Âm /ya/', example: 'やさい', exampleRom: 'yasai', exampleVi: 'rau củ' },
      { char: 'ゆ', rom: 'yu', meaning: 'Âm /yu/', example: 'ゆき', exampleRom: 'yuki', exampleVi: 'tuyết' },
      { char: 'よ', rom: 'yo', meaning: 'Âm /yo/', example: 'よる', exampleRom: 'yoru', exampleVi: 'ban đêm' },
      { char: 'ら', rom: 'ra', meaning: 'Âm /ra/ (r rung nhẹ)', example: 'らいしゅう', exampleRom: 'raishuu', exampleVi: 'tuần tới' },
      { char: 'り', rom: 'ri', meaning: 'Âm /ri/', example: 'りんご', exampleRom: 'ringo', exampleVi: 'táo' },
      { char: 'る', rom: 'ru', meaning: 'Âm /ru/', example: 'るすばん', exampleRom: 'rusuban', exampleVi: 'trông nhà' },
      { char: 'れ', rom: 're', meaning: 'Âm /re/', example: 'れいぞうこ', exampleRom: 'reizouko', exampleVi: 'tủ lạnh' },
      { char: 'ろ', rom: 'ro', meaning: 'Âm /ro/', example: 'ろうか', exampleRom: 'rouka', exampleVi: 'hành lang' },
      { char: 'わ', rom: 'wa', meaning: 'Âm /wa/', example: 'わたし', exampleRom: 'watashi', exampleVi: 'tôi' },
      { char: 'を', rom: 'wo / o', meaning: 'Trợ từ tân ngữ trực tiếp (đọc là "o")', example: 'ほんをよむ', exampleRom: 'hon wo yomu', exampleVi: 'đọc sách' },
      { char: 'ん', rom: 'n',      meaning: 'Âm mũi /n/ — chỉ đứng cuối âm tiết', example: 'にほん', exampleRom: 'nihon', exampleVi: 'Nhật Bản (kết thúc bằng ん)' },
    ],
  },
  {
    title: 'Hiragana — Dakuten & Handakuten (濁音・半濁音)',
    description: 'Thêm ゛ (dakuten) tạo âm hữu thanh; ゜ (handakuten) tạo âm /p/.',
    chars: [
      // が行
      { char: 'が', rom: 'ga', meaning: 'か + ゛ → âm /ga/', example: 'がくせい', exampleRom: 'gakusei', exampleVi: 'học sinh' },
      { char: 'ぎ', rom: 'gi', meaning: 'き + ゛ → âm /gi/', example: 'ぎんこう', exampleRom: 'ginkou', exampleVi: 'ngân hàng' },
      { char: 'ぐ', rom: 'gu', meaning: 'く + ゛ → âm /gu/', example: 'ぐあい', exampleRom: 'guai', exampleVi: 'tình trạng (sức khỏe)' },
      { char: 'げ', rom: 'ge', meaning: 'け + ゛ → âm /ge/', example: 'げんき', exampleRom: 'genki', exampleVi: 'khỏe mạnh' },
      { char: 'ご', rom: 'go', meaning: 'こ + ゛ → âm /go/', example: 'ごはん', exampleRom: 'gohan', exampleVi: 'cơm' },
      // ざ行
      { char: 'ざ', rom: 'za', meaning: 'さ + ゛ → âm /za/', example: 'ざっし', exampleRom: 'zasshi', exampleVi: 'tạp chí' },
      { char: 'じ', rom: 'ji', meaning: 'し + ゛ → âm /ji/', example: 'じかん', exampleRom: 'jikan', exampleVi: 'thời gian' },
      { char: 'ず', rom: 'zu', meaning: 'す + ゛ → âm /zu/', example: 'ずっと', exampleRom: 'zutto', exampleVi: 'suốt, liên tục' },
      { char: 'ぜ', rom: 'ze', meaning: 'せ + ゛ → âm /ze/', example: 'ぜんぶ', exampleRom: 'zenbu', exampleVi: 'tất cả' },
      { char: 'ぞ', rom: 'zo', meaning: 'そ + ゛ → âm /zo/', example: 'ぞう', exampleRom: 'zou', exampleVi: 'con voi' },
      // だ行
      { char: 'だ', rom: 'da', meaning: 'た + ゛ → âm /da/', example: 'だいがく', exampleRom: 'daigaku', exampleVi: 'đại học' },
      { char: 'ぢ', rom: 'di (ji)', meaning: 'ち + ゛ → /ji/ (ít dùng, thường viết じ)', example: 'はなぢ', exampleRom: 'hanaji', exampleVi: 'chảy máu mũi' },
      { char: 'づ', rom: 'du (zu)', meaning: 'つ + ゛ → /zu/ (ít dùng, thường viết ず)', example: 'こづつみ', exampleRom: 'kodutsumi', exampleVi: 'bưu kiện' },
      { char: 'で', rom: 'de', meaning: 'て + ゛ → âm /de/', example: 'でんしゃ', exampleRom: 'densha', exampleVi: 'tàu điện' },
      { char: 'ど', rom: 'do', meaning: 'と + ゛ → âm /do/', example: 'どこ', exampleRom: 'doko', exampleVi: 'ở đâu' },
      // ば行
      { char: 'ば', rom: 'ba', meaning: 'は + ゛ → âm /ba/', example: 'ばんごはん', exampleRom: 'bangohan', exampleVi: 'bữa tối' },
      { char: 'び', rom: 'bi', meaning: 'ひ + ゛ → âm /bi/', example: 'びじゅつかん', exampleRom: 'bijutsukan', exampleVi: 'bảo tàng mỹ thuật' },
      { char: 'ぶ', rom: 'bu', meaning: 'ふ + ゛ → âm /bu/', example: 'ぶんか', exampleRom: 'bunka', exampleVi: 'văn hóa' },
      { char: 'べ', rom: 'be', meaning: 'へ + ゛ → âm /be/', example: 'べんきょう', exampleRom: 'benkyou', exampleVi: 'học tập' },
      { char: 'ぼ', rom: 'bo', meaning: 'ほ + ゛ → âm /bo/', example: 'ぼうし', exampleRom: 'boushi', exampleVi: 'mũ nón' },
      // ぱ行
      { char: 'ぱ', rom: 'pa', meaning: 'は + ゜ → âm /pa/ (bật hơi)', example: 'ぱーていー', exampleRom: 'paatii', exampleVi: 'tiệc (←パーティー)' },
      { char: 'ぴ', rom: 'pi', meaning: 'ひ + ゜ → âm /pi/', example: 'ぴあの', exampleRom: 'piano', exampleVi: 'đàn piano (←ピアノ)' },
      { char: 'ぷ', rom: 'pu', meaning: 'ふ + ゜ → âm /pu/', example: 'ぷりん', exampleRom: 'purin', exampleVi: 'bánh flan (←プリン)' },
      { char: 'ぺ', rom: 'pe', meaning: 'へ + ゜ → âm /pe/', example: 'ぺんぎん', exampleRom: 'pengin', exampleVi: 'chim cánh cụt (←ペンギン)' },
      { char: 'ぽ', rom: 'po', meaning: 'ほ + ゜ → âm /po/', example: 'ぽすと', exampleRom: 'posuto', exampleVi: 'hòm thư (←ポスト)' },
    ],
  },
  {
    title: 'Hiragana — Yōon (拗音) — Vần ghép',
    description: 'Kết hợp âm い-kana (き・し・ち...) với や・ゆ・よ nhỏ tạo vần ghép.',
    chars: [
      { char: 'きゃ', rom: 'kya', meaning: 'き + ゃ → /kya/', example: 'きゃく', exampleRom: 'kyaku', exampleVi: 'khách' },
      { char: 'きゅ', rom: 'kyu', meaning: 'き + ゅ → /kyu/', example: 'きゅうきゅうしゃ', exampleRom: 'kyuukyuusha', exampleVi: 'xe cứu thương' },
      { char: 'きょ', rom: 'kyo', meaning: 'き + ょ → /kyo/', example: 'きょうしつ', exampleRom: 'kyoushitsu', exampleVi: 'phòng học' },
      { char: 'しゃ', rom: 'sha', meaning: 'し + ゃ → /sha/', example: 'しゃしん', exampleRom: 'shashin', exampleVi: 'ảnh chụp' },
      { char: 'しゅ', rom: 'shu', meaning: 'し + ゅ → /shu/', example: 'しゅくだい', exampleRom: 'shukudai', exampleVi: 'bài tập về nhà' },
      { char: 'しょ', rom: 'sho', meaning: 'し + ょ → /sho/', example: 'しょうがっこう', exampleRom: 'shougakkou', exampleVi: 'trường tiểu học' },
      { char: 'ちゃ', rom: 'cha', meaning: 'ち + ゃ → /cha/', example: 'おちゃ', exampleRom: 'ocha', exampleVi: 'trà' },
      { char: 'ちゅ', rom: 'chu', meaning: 'ち + ゅ → /chu/', example: 'ちゅうごく', exampleRom: 'chuugoku', exampleVi: 'Trung Quốc' },
      { char: 'ちょ', rom: 'cho', meaning: 'ち + ょ → /cho/', example: 'ちょっと', exampleRom: 'chotto', exampleVi: 'một chút' },
      { char: 'にゃ', rom: 'nya', meaning: 'に + ゃ → /nya/', example: 'にゃんこ', exampleRom: 'nyanko', exampleVi: 'mèo con (thân mật)' },
      { char: 'にゅ', rom: 'nyu', meaning: 'に + ゅ → /nyu/', example: 'にゅうがく', exampleRom: 'nyuugaku', exampleVi: 'nhập học' },
      { char: 'にょ', rom: 'nyo', meaning: 'に + ょ → /nyo/', example: 'にょろにょろ', exampleRom: 'nyoronyoro', exampleVi: 'uốn lượn (từ tượng hình)' },
      { char: 'ひゃ', rom: 'hya', meaning: 'ひ + ゃ → /hya/', example: 'ひゃく', exampleRom: 'hyaku', exampleVi: '100 (một trăm)' },
      { char: 'ひゅ', rom: 'hyu', meaning: 'ひ + ゅ → /hyu/', example: 'ひゅーひゅー', exampleRom: 'hyuuhyuu', exampleVi: 'tiếng gió hú' },
      { char: 'ひょ', rom: 'hyo', meaning: 'ひ + ょ → /hyo/', example: 'ひょうじょう', exampleRom: 'hyoujou', exampleVi: 'biểu cảm, nét mặt' },
      { char: 'みゃ', rom: 'mya', meaning: 'み + ゃ → /mya/', example: 'みゃく', exampleRom: 'myaku', exampleVi: 'mạch (nhịp tim)' },
      { char: 'みゅ', rom: 'myu', meaning: 'み + ゅ → /myu/', example: 'みゅーじっく', exampleRom: 'myuujikku', exampleVi: 'âm nhạc (←ミュージック)' },
      { char: 'みょ', rom: 'myo', meaning: 'み + ょ → /myo/', example: 'みょうじ', exampleRom: 'myouji', exampleVi: 'họ (tên người)' },
      { char: 'りゃ', rom: 'rya', meaning: 'り + ゃ → /rya/', example: 'りゃくご', exampleRom: 'ryakugo', exampleVi: 'chữ viết tắt' },
      { char: 'りゅ', rom: 'ryu', meaning: 'り + ゅ → /ryu/', example: 'りゅうがく', exampleRom: 'ryuugaku', exampleVi: 'du học' },
      { char: 'りょ', rom: 'ryo', meaning: 'り + ょ → /ryo/', example: 'りょこう', exampleRom: 'ryokou', exampleVi: 'du lịch' },
      { char: 'ぎゃ', rom: 'gya', meaning: 'ぎ + ゃ → /gya/', example: 'ぎゃく', exampleRom: 'gyaku', exampleVi: 'ngược lại' },
      { char: 'ぎゅ', rom: 'gyu', meaning: 'ぎ + ゅ → /gyu/', example: 'ぎゅうにゅう', exampleRom: 'gyuunyuu', exampleVi: 'sữa bò' },
      { char: 'ぎょ', rom: 'gyo', meaning: 'ぎ + ょ → /gyo/', example: 'ぎょうざ', exampleRom: 'gyouza', exampleVi: 'há cảo' },
      { char: 'じゃ', rom: 'ja',  meaning: 'じ + ゃ → /ja/', example: 'じゃあ', exampleRom: 'jaa', exampleVi: 'vậy thì, thôi' },
      { char: 'じゅ', rom: 'ju',  meaning: 'じ + ゅ → /ju/', example: 'じゅぎょう', exampleRom: 'jugyou', exampleVi: 'tiết học, bài giảng' },
      { char: 'じょ', rom: 'jo',  meaning: 'じ + ょ → /jo/', example: 'じょせい', exampleRom: 'josei', exampleVi: 'phụ nữ' },
      { char: 'びゃ', rom: 'bya', meaning: 'び + ゃ → /bya/', example: 'さんびゃく', exampleRom: 'sanbyaku', exampleVi: '300 (ba trăm)' },
      { char: 'びゅ', rom: 'byu', meaning: 'び + ゅ → /byu/', example: 'びゅーびゅー', exampleRom: 'byuubyuu', exampleVi: 'tiếng gió mạnh' },
      { char: 'びょ', rom: 'byo', meaning: 'び + ょ → /byo/', example: 'びょういん', exampleRom: 'byouin', exampleVi: 'bệnh viện' },
      { char: 'ぴゃ', rom: 'pya', meaning: 'ぴ + ゃ → /pya/', example: 'はっぴゃく', exampleRom: 'happyaku', exampleVi: '800 (tám trăm)' },
      { char: 'ぴゅ', rom: 'pyu', meaning: 'ぴ + ゅ → /pyu/', example: 'ぴゅーっと', exampleRom: 'pyuutto', exampleVi: 'âm thanh bay vút' },
      { char: 'ぴょ', rom: 'pyo', meaning: 'ぴ + ょ → /pyo/', example: 'ぴょんぴょん', exampleRom: 'pyonpyon', exampleVi: 'nhảy nhót (từ tượng thanh)' },
    ],
  },
];

// ─── Katakana ─────────────────────────────────────────────────────────────────
const KATAKANA: AlphabetLesson[] = [
  {
    title: 'Katakana — Nguyên âm (ア行)',
    description: 'Katakana dùng chủ yếu cho từ ngoại lai, tên nước ngoài. 5 nguyên âm: a・i・u・e・o.',
    chars: [
      { char: 'ア', rom: 'a', meaning: 'Nguyên âm /a/', example: 'アイスクリーム', exampleRom: 'aisukuriimu', exampleVi: 'kem (ice cream)' },
      { char: 'イ', rom: 'i', meaning: 'Nguyên âm /i/', example: 'インターネット', exampleRom: 'intaanetto', exampleVi: 'internet' },
      { char: 'ウ', rom: 'u', meaning: 'Nguyên âm /u/', example: 'ウール', exampleRom: 'uuru', exampleVi: 'len (wool)' },
      { char: 'エ', rom: 'e', meaning: 'Nguyên âm /e/', example: 'エレベーター', exampleRom: 'erebeetaa', exampleVi: 'thang máy (elevator)' },
      { char: 'オ', rom: 'o', meaning: 'Nguyên âm /o/', example: 'オレンジ', exampleRom: 'orenji', exampleVi: 'cam (orange)' },
    ],
  },
  {
    title: 'Katakana — Hàng KA (カ行)',
    description: 'Âm /k/: ka・ki・ku・ke・ko.',
    chars: [
      { char: 'カ', rom: 'ka', meaning: 'Âm /ka/', example: 'カメラ', exampleRom: 'kamera', exampleVi: 'máy ảnh (camera)' },
      { char: 'キ', rom: 'ki', meaning: 'Âm /ki/', example: 'キッチン', exampleRom: 'kicchin', exampleVi: 'nhà bếp (kitchen)' },
      { char: 'ク', rom: 'ku', meaning: 'Âm /ku/', example: 'クラス', exampleRom: 'kurasu', exampleVi: 'lớp học (class)' },
      { char: 'ケ', rom: 'ke', meaning: 'Âm /ke/', example: 'ケーキ', exampleRom: 'keeki', exampleVi: 'bánh ngọt (cake)' },
      { char: 'コ', rom: 'ko', meaning: 'Âm /ko/', example: 'コーヒー', exampleRom: 'koohii', exampleVi: 'cà phê (coffee)' },
    ],
  },
  {
    title: 'Katakana — Hàng SA (サ行)',
    description: 'Âm /s/: sa・shi・su・se・so.',
    chars: [
      { char: 'サ', rom: 'sa',  meaning: 'Âm /sa/', example: 'サンドイッチ', exampleRom: 'sandoicchi', exampleVi: 'bánh sandwich' },
      { char: 'シ', rom: 'shi', meaning: 'Âm /shi/', example: 'シャツ', exampleRom: 'shatsu', exampleVi: 'áo sơ mi (shirt)' },
      { char: 'ス', rom: 'su',  meaning: 'Âm /su/', example: 'スポーツ', exampleRom: 'supootsu', exampleVi: 'thể thao (sports)' },
      { char: 'セ', rom: 'se',  meaning: 'Âm /se/', example: 'セーター', exampleRom: 'seetaa', exampleVi: 'áo len (sweater)' },
      { char: 'ソ', rom: 'so',  meaning: 'Âm /so/', example: 'ソファ', exampleRom: 'sofa', exampleVi: 'ghế sofa' },
    ],
  },
  {
    title: 'Katakana — Hàng TA (タ行)',
    description: 'Âm /t/: ta・chi・tsu・te・to.',
    chars: [
      { char: 'タ', rom: 'ta',  meaning: 'Âm /ta/', example: 'タクシー', exampleRom: 'takushii', exampleVi: 'taxi' },
      { char: 'チ', rom: 'chi', meaning: 'Âm /chi/', example: 'チケット', exampleRom: 'chiketto', exampleVi: 'vé (ticket)' },
      { char: 'ツ', rom: 'tsu', meaning: 'Âm /tsu/', example: 'ツアー', exampleRom: 'tsuaa', exampleVi: 'chuyến tham quan (tour)' },
      { char: 'テ', rom: 'te',  meaning: 'Âm /te/', example: 'テレビ', exampleRom: 'terebi', exampleVi: 'tivi (television)' },
      { char: 'ト', rom: 'to',  meaning: 'Âm /to/', example: 'トイレ', exampleRom: 'toire', exampleVi: 'nhà vệ sinh (toilet)' },
    ],
  },
  {
    title: 'Katakana — Hàng NA・HA・MA (ナ・ハ・マ行)',
    description: 'Các âm /n/, /h/, /m/.',
    chars: [
      { char: 'ナ', rom: 'na', meaning: 'Âm /na/', example: 'ナイフ', exampleRom: 'naifu', exampleVi: 'dao (knife)' },
      { char: 'ニ', rom: 'ni', meaning: 'Âm /ni/', example: 'ニュース', exampleRom: 'nyuusu', exampleVi: 'tin tức (news)' },
      { char: 'ヌ', rom: 'nu', meaning: 'Âm /nu/', example: 'ヌードル', exampleRom: 'nuudoru', exampleVi: 'mì sợi (noodle)' },
      { char: 'ネ', rom: 'ne', meaning: 'Âm /ne/', example: 'ネクタイ', exampleRom: 'nekutai', exampleVi: 'cà vạt (necktie)' },
      { char: 'ノ', rom: 'no', meaning: 'Âm /no/', example: 'ノート', exampleRom: 'nooto', exampleVi: 'vở ghi (notebook)' },
      { char: 'ハ', rom: 'ha', meaning: 'Âm /ha/', example: 'ハンバーガー', exampleRom: 'hanbaagaa', exampleVi: 'hamburger' },
      { char: 'ヒ', rom: 'hi', meaning: 'Âm /hi/', example: 'ヒーター', exampleRom: 'hiitaa', exampleVi: 'máy sưởi (heater)' },
      { char: 'フ', rom: 'fu', meaning: 'Âm /fu/', example: 'フランス', exampleRom: 'furansu', exampleVi: 'Pháp (France)' },
      { char: 'ヘ', rom: 'he', meaning: 'Âm /he/', example: 'ヘルメット', exampleRom: 'herumetto', exampleVi: 'mũ bảo hiểm (helmet)' },
      { char: 'ホ', rom: 'ho', meaning: 'Âm /ho/', example: 'ホテル', exampleRom: 'hoteru', exampleVi: 'khách sạn (hotel)' },
      { char: 'マ', rom: 'ma', meaning: 'Âm /ma/', example: 'マスク', exampleRom: 'masuku', exampleVi: 'khẩu trang (mask)' },
      { char: 'ミ', rom: 'mi', meaning: 'Âm /mi/', example: 'ミルク', exampleRom: 'miruku', exampleVi: 'sữa (milk)' },
      { char: 'ム', rom: 'mu', meaning: 'Âm /mu/', example: 'ムード', exampleRom: 'muudo', exampleVi: 'tâm trạng (mood)' },
      { char: 'メ', rom: 'me', meaning: 'Âm /me/', example: 'メール', exampleRom: 'meeru', exampleVi: 'email' },
      { char: 'モ', rom: 'mo', meaning: 'Âm /mo/', example: 'モデル', exampleRom: 'moderu', exampleVi: 'người mẫu (model)' },
    ],
  },
  {
    title: 'Katakana — Hàng YA・RA・WA・N (ヤ・ラ・ワ・ン)',
    description: 'Các âm còn lại và ン (n).',
    chars: [
      { char: 'ヤ', rom: 'ya', meaning: 'Âm /ya/', example: 'ヤード', exampleRom: 'yaado', exampleVi: 'yard (đơn vị đo)' },
      { char: 'ユ', rom: 'yu', meaning: 'Âm /yu/', example: 'ユニフォーム', exampleRom: 'yunifoomu', exampleVi: 'đồng phục (uniform)' },
      { char: 'ヨ', rom: 'yo', meaning: 'Âm /yo/', example: 'ヨーロッパ', exampleRom: 'yooroppa', exampleVi: 'châu Âu (Europe)' },
      { char: 'ラ', rom: 'ra', meaning: 'Âm /ra/', example: 'ラジオ', exampleRom: 'rajio', exampleVi: 'radio' },
      { char: 'リ', rom: 'ri', meaning: 'Âm /ri/', example: 'リモコン', exampleRom: 'rimokon', exampleVi: 'điều khiển từ xa (remote)' },
      { char: 'ル', rom: 'ru', meaning: 'Âm /ru/', example: 'ルール', exampleRom: 'ruuru', exampleVi: 'quy tắc (rule)' },
      { char: 'レ', rom: 're', meaning: 'Âm /re/', example: 'レストラン', exampleRom: 'resutoran', exampleVi: 'nhà hàng (restaurant)' },
      { char: 'ロ', rom: 'ro', meaning: 'Âm /ro/', example: 'ロビー', exampleRom: 'robii', exampleVi: 'sảnh (lobby)' },
      { char: 'ワ', rom: 'wa', meaning: 'Âm /wa/', example: 'ワイン', exampleRom: 'wain', exampleVi: 'rượu vang (wine)' },
      { char: 'ヲ', rom: 'wo', meaning: 'Trợ từ tân ngữ (ít xuất hiện trong katakana)', example: 'ヲタク', exampleRom: 'wotaku', exampleVi: 'otaku (người đam mê cuồng nhiệt)' },
      { char: 'ン', rom: 'n',  meaning: 'Âm mũi /n/ — đứng cuối âm tiết', example: 'パン', exampleRom: 'pan', exampleVi: 'bánh mì (từ tiếng Bồ Đào Nha)' },
    ],
  },
  {
    title: 'Katakana — Dakuten & Handakuten (ガ〜ポ行)',
    description: 'Âm hữu thanh và bán hữu thanh trong katakana.',
    chars: [
      { char: 'ガ', rom: 'ga', meaning: 'カ + ゛ → /ga/', example: 'ガソリン', exampleRom: 'gasorin', exampleVi: 'xăng (gasoline)' },
      { char: 'ギ', rom: 'gi', meaning: 'キ + ゛ → /gi/', example: 'ギター', exampleRom: 'gitaa', exampleVi: 'đàn guitar' },
      { char: 'グ', rom: 'gu', meaning: 'ク + ゛ → /gu/', example: 'グラス', exampleRom: 'gurasu', exampleVi: 'cốc thủy tinh (glass)' },
      { char: 'ゲ', rom: 'ge', meaning: 'ケ + ゛ → /ge/', example: 'ゲーム', exampleRom: 'geemu', exampleVi: 'trò chơi (game)' },
      { char: 'ゴ', rom: 'go', meaning: 'コ + ゛ → /go/', example: 'ゴール', exampleRom: 'gooru', exampleVi: 'bàn thắng, đích (goal)' },
      { char: 'ザ', rom: 'za', meaning: 'サ + ゛ → /za/', example: 'ザーザー', exampleRom: 'zaazaa', exampleVi: 'tiếng mưa rào' },
      { char: 'ジ', rom: 'ji', meaning: 'シ + ゛ → /ji/', example: 'ジュース', exampleRom: 'juusu', exampleVi: 'nước hoa quả (juice)' },
      { char: 'ズ', rom: 'zu', meaning: 'ス + ゛ → /zu/', example: 'ズボン', exampleRom: 'zubon', exampleVi: 'quần dài (trousers)' },
      { char: 'ゼ', rom: 'ze', meaning: 'セ + ゛ → /ze/', example: 'ゼロ', exampleRom: 'zero', exampleVi: 'số 0 (zero)' },
      { char: 'ゾ', rom: 'zo', meaning: 'ソ + ゛ → /zo/', example: 'ゾーン', exampleRom: 'zoon', exampleVi: 'khu vực (zone)' },
      { char: 'ダ', rom: 'da', meaning: 'タ + ゛ → /da/', example: 'ダンス', exampleRom: 'dansu', exampleVi: 'nhảy múa (dance)' },
      { char: 'ヂ', rom: 'di', meaning: 'チ + ゛ → /ji/ (ít dùng)', example: 'ヂ', exampleRom: 'di/ji', exampleVi: 'rất ít xuất hiện trong từ ngoại lai' },
      { char: 'ヅ', rom: 'du', meaning: 'ツ + ゛ → /zu/ (ít dùng)', example: 'ヅ', exampleRom: 'du/zu', exampleVi: 'rất ít xuất hiện trong từ ngoại lai' },
      { char: 'デ', rom: 'de', meaning: 'テ + ゛ → /de/', example: 'デザイン', exampleRom: 'dezain', exampleVi: 'thiết kế (design)' },
      { char: 'ド', rom: 'do', meaning: 'ト + ゛ → /do/', example: 'ドア', exampleRom: 'doa', exampleVi: 'cửa (door)' },
      { char: 'バ', rom: 'ba', meaning: 'ハ + ゛ → /ba/', example: 'バス', exampleRom: 'basu', exampleVi: 'xe buýt (bus)' },
      { char: 'ビ', rom: 'bi', meaning: 'ヒ + ゛ → /bi/', example: 'ビール', exampleRom: 'biiru', exampleVi: 'bia (beer)' },
      { char: 'ブ', rom: 'bu', meaning: 'フ + ゛ → /bu/', example: 'ブラジル', exampleRom: 'burajiru', exampleVi: 'Brazil' },
      { char: 'ベ', rom: 'be', meaning: 'ヘ + ゛ → /be/', example: 'ベッド', exampleRom: 'beddo', exampleVi: 'giường (bed)' },
      { char: 'ボ', rom: 'bo', meaning: 'ホ + ゛ → /bo/', example: 'ボール', exampleRom: 'booru', exampleVi: 'quả bóng (ball)' },
      { char: 'パ', rom: 'pa', meaning: 'ハ + ゜ → /pa/', example: 'パン', exampleRom: 'pan', exampleVi: 'bánh mì (bread)' },
      { char: 'ピ', rom: 'pi', meaning: 'ヒ + ゜ → /pi/', example: 'ピザ', exampleRom: 'piza', exampleVi: 'pizza' },
      { char: 'プ', rom: 'pu', meaning: 'フ + ゜ → /pu/', example: 'プール', exampleRom: 'puuru', exampleVi: 'hồ bơi (pool)' },
      { char: 'ペ', rom: 'pe', meaning: 'ヘ + ゜ → /pe/', example: 'ペット', exampleRom: 'petto', exampleVi: 'thú cưng (pet)' },
      { char: 'ポ', rom: 'po', meaning: 'ホ + ゜ → /po/', example: 'ポスター', exampleRom: 'posutaa', exampleVi: 'áp phích (poster)' },
    ],
  },
  {
    title: 'Katakana — Yōon & Âm ghép đặc biệt',
    description: 'Vần ghép thông thường (キャ〜ピョ) và âm ghép đặc biệt chỉ có trong katakana (ティ・ファ・ウィ...).',
    chars: [
      // standard yōon
      { char: 'キャ', rom: 'kya', meaning: '/kya/', example: 'キャンプ', exampleRom: 'kyanpu', exampleVi: 'cắm trại (camp)' },
      { char: 'キュ', rom: 'kyu', meaning: '/kyu/', example: 'キューバ', exampleRom: 'kyuuba', exampleVi: 'Cuba' },
      { char: 'キョ', rom: 'kyo', meaning: '/kyo/', example: 'キョウト → 京都', exampleRom: 'kyouto', exampleVi: 'Kyoto' },
      { char: 'シャ', rom: 'sha', meaning: '/sha/', example: 'シャワー', exampleRom: 'shawaa', exampleVi: 'vòi sen (shower)' },
      { char: 'シュ', rom: 'shu', meaning: '/shu/', example: 'シュークリーム', exampleRom: 'shuukuriimu', exampleVi: 'su kem (cream puff)' },
      { char: 'ショ', rom: 'sho', meaning: '/sho/', example: 'ショッピング', exampleRom: 'shoppingu', exampleVi: 'mua sắm (shopping)' },
      { char: 'チャ', rom: 'cha', meaning: '/cha/', example: 'チャンス', exampleRom: 'chansu', exampleVi: 'cơ hội (chance)' },
      { char: 'チュ', rom: 'chu', meaning: '/chu/', example: 'チューリップ', exampleRom: 'chuurippu', exampleVi: 'hoa tulip' },
      { char: 'チョ', rom: 'cho', meaning: '/cho/', example: 'チョコレート', exampleRom: 'chokoreeto', exampleVi: 'sô cô la (chocolate)' },
      { char: 'ニュ', rom: 'nyu', meaning: '/nyu/', example: 'ニュース', exampleRom: 'nyuusu', exampleVi: 'tin tức (news)' },
      { char: 'ヒュ', rom: 'hyu', meaning: '/hyu/', example: 'ヒューストン', exampleRom: 'hyuusuton', exampleVi: 'Houston (thành phố Mỹ)' },
      { char: 'ミャ', rom: 'mya', meaning: '/mya/', example: 'ミャンマー', exampleRom: 'myanmaa', exampleVi: 'Myanmar' },
      { char: 'ミュ', rom: 'myu', meaning: '/myu/', example: 'ミュージアム', exampleRom: 'myuujiamu', exampleVi: 'bảo tàng (museum)' },
      { char: 'リュ', rom: 'ryu', meaning: '/ryu/', example: 'リュック', exampleRom: 'ryukku', exampleVi: 'ba lô (rucksack)' },
      { char: 'ギャ', rom: 'gya', meaning: '/gya/', example: 'ギャップ', exampleRom: 'gyappu', exampleVi: 'khoảng cách (gap)' },
      { char: 'ジャ', rom: 'ja',  meaning: '/ja/', example: 'ジャズ', exampleRom: 'jazu', exampleVi: 'nhạc jazz' },
      { char: 'ジュ', rom: 'ju',  meaning: '/ju/', example: 'ジュース', exampleRom: 'juusu', exampleVi: 'nước hoa quả (juice)' },
      { char: 'ジョ', rom: 'jo',  meaning: '/jo/', example: 'ジョギング', exampleRom: 'jogingu', exampleVi: 'chạy bộ (jogging)' },
      { char: 'ビュ', rom: 'byu', meaning: '/byu/', example: 'ビュッフェ', exampleRom: 'byuffe', exampleVi: 'tiệc buffet' },
      // katakana-only special combinations
      { char: 'ティ', rom: 'ti', meaning: 'テ + ィ → /ti/ (đặc biệt katakana)', example: 'パーティー', exampleRom: 'paatii', exampleVi: 'tiệc (party)' },
      { char: 'ディ', rom: 'di', meaning: 'デ + ィ → /di/ (đặc biệt katakana)', example: 'ディズニー', exampleRom: 'dizunii', exampleVi: 'Disney' },
      { char: 'ファ', rom: 'fa', meaning: 'フ + ァ → /fa/ (đặc biệt katakana)', example: 'ファッション', exampleRom: 'fasshon', exampleVi: 'thời trang (fashion)' },
      { char: 'フィ', rom: 'fi', meaning: 'フ + ィ → /fi/ (đặc biệt katakana)', example: 'フィリピン', exampleRom: 'firipin', exampleVi: 'Philippines' },
      { char: 'フェ', rom: 'fe', meaning: 'フ + ェ → /fe/ (đặc biệt katakana)', example: 'フェスタ', exampleRom: 'fesuta', exampleVi: 'lễ hội (festa)' },
      { char: 'フォ', rom: 'fo', meaning: 'フ + ォ → /fo/ (đặc biệt katakana)', example: 'フォーク', exampleRom: 'fooku', exampleVi: 'nĩa (fork)' },
      { char: 'ウィ', rom: 'wi', meaning: 'ウ + ィ → /wi/ (đặc biệt katakana)', example: 'ウィキペディア', exampleRom: 'wikipedia', exampleVi: 'Wikipedia' },
      { char: 'ウェ', rom: 'we', meaning: 'ウ + ェ → /we/ (đặc biệt katakana)', example: 'ウェブ', exampleRom: 'webu', exampleVi: 'web' },
      { char: 'ウォ', rom: 'wo', meaning: 'ウ + ォ → /wo/ (đặc biệt katakana)', example: 'ウォーター', exampleRom: 'wootaa', exampleVi: 'nước (water)' },
      { char: 'ヴァ', rom: 'va', meaning: 'ヴ + ァ → /va/ (đặc biệt katakana)', example: 'ヴァイオリン', exampleRom: 'vaiorin', exampleVi: 'đàn violin' },
    ],
  },
];

// ─── Pinyin (Chinese) ─────────────────────────────────────────────────────────
const PINYIN: AlphabetLesson[] = [
  {
    title: 'Pinyin — Thanh điệu (声调)',
    description: 'Tiếng Trung có 4 thanh điệu + 1 thanh nhẹ. Cùng một âm tiết nhưng khác thanh = khác nghĩa hoàn toàn.',
    chars: [
      { char: '¯ (ā)', rom: 'Thanh 1', meaning: 'Thanh bằng cao — kéo dài đều, như hát note cao', example: 'māma (妈妈)', exampleRom: 'mā + mā', exampleVi: 'mẹ' },
      { char: '´ (á)', rom: 'Thanh 2', meaning: 'Thanh sắc — lên dần từ thấp lên cao, như hỏi "hả?"', example: 'máo (毛)', exampleRom: 'máo', exampleVi: 'lông, tóc' },
      { char: 'ˇ (ǎ)', rom: 'Thanh 3', meaning: 'Thanh hỏi — xuống thấp rồi lên, như gọi từ xa', example: 'mǎi (买)', exampleRom: 'mǎi', exampleVi: 'mua' },
      { char: '` (à)', rom: 'Thanh 4', meaning: 'Thanh nặng — từ cao xuống thấp mạnh, như ra lệnh', example: 'mà (骂)', exampleRom: 'mà', exampleVi: 'mắng, chửi' },
      { char: '· (a)', rom: 'Thanh nhẹ', meaning: 'Thanh nhẹ (轻声) — không dấu, phát âm nhẹ nhanh', example: 'māma (妈妈)', exampleRom: 'mā·ma', exampleVi: 'mẹ (âm "ma" thứ 2 là thanh nhẹ)' },
    ],
  },
  {
    title: 'Pinyin — Phụ âm đầu (声母) nhóm 1: b p m f / d t n l',
    description: 'Phụ âm môi và đầu lưỡi. Nhóm đầu tiên, xuất hiện nhiều nhất trong HSK1.',
    chars: [
      { char: 'b', rom: 'b', meaning: '/p/ không bật hơi (≠ tiếng Việt "b")', example: 'bā (八)', exampleRom: 'bā', exampleVi: 'số 8' },
      { char: 'p', rom: 'p', meaning: '/pʰ/ có bật hơi mạnh (như tiếng Việt "p")', example: 'péngyou (朋友)', exampleRom: 'péngyou', exampleVi: 'bạn bè' },
      { char: 'm', rom: 'm', meaning: '/m/ phụ âm mũi môi (giống tiếng Việt)', example: 'māma (妈妈)', exampleRom: 'māma', exampleVi: 'mẹ' },
      { char: 'f', rom: 'f', meaning: '/f/ phụ âm răng môi (giống tiếng Anh "f")', example: 'fàn (饭)', exampleRom: 'fàn', exampleVi: 'cơm, bữa ăn' },
      { char: 'd', rom: 'd', meaning: '/t/ không bật hơi (≠ tiếng Việt "đ")', example: 'dà (大)', exampleRom: 'dà', exampleVi: 'to, lớn' },
      { char: 't', rom: 't', meaning: '/tʰ/ có bật hơi (như tiếng Việt "th")', example: 'tā (他)', exampleRom: 'tā', exampleVi: 'anh ấy, cô ấy' },
      { char: 'n', rom: 'n', meaning: '/n/ phụ âm mũi đầu lưỡi (giống tiếng Việt)', example: 'nǐ (你)', exampleRom: 'nǐ', exampleVi: 'bạn (ngôi 2)' },
      { char: 'l', rom: 'l', meaning: '/l/ phụ âm biên (giống tiếng Việt "l")', example: 'lǎoshī (老师)', exampleRom: 'lǎoshī', exampleVi: 'giáo viên' },
    ],
  },
  {
    title: 'Pinyin — Phụ âm đầu (声母) nhóm 2: g k h / j q x / zh ch sh r / z c s',
    description: 'Phụ âm họng, vòm miệng và đầu lưỡi uốn. Chú ý j/q/x chỉ kết hợp với i/ü; zh/ch/sh/r là âm uốn lưỡi.',
    chars: [
      { char: 'g', rom: 'g',  meaning: '/k/ không bật hơi, phụ âm họng (≠ tiếng Việt "g")', example: 'gāo (高)', exampleRom: 'gāo', exampleVi: 'cao' },
      { char: 'k', rom: 'k',  meaning: '/kʰ/ bật hơi, phụ âm họng (giống tiếng Việt "kh")', example: 'kāfēi (咖啡)', exampleRom: 'kāfēi', exampleVi: 'cà phê' },
      { char: 'h', rom: 'h',  meaning: '/x/ phụ âm xát họng (hơi mạnh hơn "h" tiếng Việt)', example: 'hǎo (好)', exampleRom: 'hǎo', exampleVi: 'tốt, khỏe' },
      { char: 'j', rom: 'j',  meaning: '/tɕ/ vòm miệng, không bật hơi — chỉ đi với i/ü', example: 'jiā (家)', exampleRom: 'jiā', exampleVi: 'gia đình, nhà' },
      { char: 'q', rom: 'q',  meaning: '/tɕʰ/ vòm miệng, bật hơi — chỉ đi với i/ü', example: 'qǐng (请)', exampleRom: 'qǐng', exampleVi: 'mời, xin hãy' },
      { char: 'x', rom: 'x',  meaning: '/ɕ/ xát vòm miệng — chỉ đi với i/ü', example: 'xièxiè (谢谢)', exampleRom: 'xièxiè', exampleVi: 'cảm ơn' },
      { char: 'zh', rom: 'zh', meaning: '/tʂ/ uốn lưỡi, không bật hơi (lưỡi cong lên)', example: 'zhōngguó (中国)', exampleRom: 'zhōngguó', exampleVi: 'Trung Quốc' },
      { char: 'ch', rom: 'ch', meaning: '/tʂʰ/ uốn lưỡi, bật hơi', example: 'chī (吃)', exampleRom: 'chī', exampleVi: 'ăn' },
      { char: 'sh', rom: 'sh', meaning: '/ʂ/ xát uốn lưỡi', example: 'shū (书)', exampleRom: 'shū', exampleVi: 'sách' },
      { char: 'r', rom: 'r',  meaning: '/ɻ/ hoặc /ʐ/ uốn lưỡi (gần "r" kiểu Anh-Mỹ)', example: 'rén (人)', exampleRom: 'rén', exampleVi: 'người' },
      { char: 'z', rom: 'z',  meaning: '/ts/ phụ âm tắc xát đầu lưỡi, không bật hơi', example: 'zài (在)', exampleRom: 'zài', exampleVi: 'ở, đang' },
      { char: 'c', rom: 'c',  meaning: '/tsʰ/ phụ âm tắc xát đầu lưỡi, bật hơi', example: 'cídiǎn (词典)', exampleRom: 'cídiǎn', exampleVi: 'từ điển' },
      { char: 's', rom: 's',  meaning: '/s/ xát đầu lưỡi (giống tiếng Việt "s")', example: 'sān (三)', exampleRom: 'sān', exampleVi: 'ba (số 3)' },
    ],
  },
  {
    title: 'Pinyin — Vần đơn & vần kép (单韵母・复韵母)',
    description: '6 vần đơn (a o e i u ü) và các vần kép phổ biến. Đây là vần cuối âm tiết.',
    chars: [
      // simple finals
      { char: 'a',  rom: 'a',   meaning: 'Vần /a/ (mở rộng miệng như "a" tiếng Việt)', example: 'māma (妈妈)', exampleRom: 'māma', exampleVi: 'mẹ' },
      { char: 'o',  rom: 'o',   meaning: 'Vần /o/ (môi tròn, như "o" tiếng Việt)', example: 'wǒ (我)', exampleRom: 'wǒ', exampleVi: 'tôi' },
      { char: 'e',  rom: 'e',   meaning: 'Vần /ɤ/ (môi không tròn, khác "e" tiếng Việt)', example: 'hé (河)', exampleRom: 'hé', exampleVi: 'sông' },
      { char: 'i',  rom: 'i',   meaning: 'Vần /i/ — sau zh/ch/sh/r/z/c/s đọc khác (/ɨ/)', example: 'nǐ (你)', exampleRom: 'nǐ', exampleVi: 'bạn' },
      { char: 'u',  rom: 'u',   meaning: 'Vần /u/ (tròn môi, giống "u" tiếng Việt)', example: 'chū (出)', exampleRom: 'chū', exampleVi: 'ra, xuất' },
      { char: 'ü',  rom: 'ü',   meaning: 'Vần /y/ (môi tròn + lưỡi ở vị trí /i/) — chỉ sau n/l/j/q/x', example: 'lǘ (驴)', exampleRom: 'lǘ', exampleVi: 'con lừa' },
      // compound finals
      { char: 'ai', rom: 'ai', meaning: 'Vần kép /ai/', example: 'ài (爱)', exampleRom: 'ài', exampleVi: 'yêu' },
      { char: 'ei', rom: 'ei', meaning: 'Vần kép /ei/', example: 'měi (美)', exampleRom: 'měi', exampleVi: 'đẹp' },
      { char: 'ao', rom: 'ao', meaning: 'Vần kép /au/', example: 'hǎo (好)', exampleRom: 'hǎo', exampleVi: 'tốt' },
      { char: 'ou', rom: 'ou', meaning: 'Vần kép /ou/', example: 'gǒu (狗)', exampleRom: 'gǒu', exampleVi: 'con chó' },
      { char: 'ia', rom: 'ia', meaning: 'Vần kép /ia/', example: 'jiā (家)', exampleRom: 'jiā', exampleVi: 'nhà, gia đình' },
      { char: 'ie', rom: 'ie', meaning: 'Vần kép /ie/', example: 'xiě (写)', exampleRom: 'xiě', exampleVi: 'viết' },
      { char: 'ua', rom: 'ua', meaning: 'Vần kép /ua/', example: 'huā (花)', exampleRom: 'huā', exampleVi: 'hoa' },
      { char: 'uo', rom: 'uo', meaning: 'Vần kép /uo/', example: 'shuō (说)', exampleRom: 'shuō', exampleVi: 'nói' },
      { char: 'üe', rom: 'üe', meaning: 'Vần kép /ye/', example: 'xuéxiào (学校)', exampleRom: 'xuéxiào', exampleVi: 'trường học' },
      { char: 'er', rom: 'er', meaning: 'Vần đặc biệt /ɚ/ (uốn lưỡi)', example: 'ér (儿)', exampleRom: 'ér', exampleVi: 'con (trai)' },
    ],
  },
  {
    title: 'Pinyin — Vần mũi (鼻韵母)',
    description: 'Vần kết thúc bằng phụ âm mũi: -n (âm mũi đầu lưỡi) hoặc -ng (âm mũi cuống họng).',
    chars: [
      { char: 'an',  rom: 'an',  meaning: 'Vần mũi /an/', example: 'nán (男)', exampleRom: 'nán', exampleVi: 'đàn ông, phái nam' },
      { char: 'en',  rom: 'en',  meaning: 'Vần mũi /ən/', example: 'mén (门)', exampleRom: 'mén', exampleVi: 'cửa' },
      { char: 'in',  rom: 'in',  meaning: 'Vần mũi /in/', example: 'xīn (心)', exampleRom: 'xīn', exampleVi: 'tim, lòng' },
      { char: 'un',  rom: 'un',  meaning: 'Vần mũi /wən/', example: 'wèn (问)', exampleRom: 'wèn', exampleVi: 'hỏi' },
      { char: 'ün',  rom: 'ün',  meaning: 'Vần mũi /yn/', example: 'yùn (运)', exampleRom: 'yùn', exampleVi: 'vận chuyển, may mắn' },
      { char: 'ian', rom: 'ian', meaning: 'Vần mũi /iɛn/', example: 'tiān (天)', exampleRom: 'tiān', exampleVi: 'trời, ngày' },
      { char: 'uan', rom: 'uan', meaning: 'Vần mũi /wan/', example: 'guān (关)', exampleRom: 'guān', exampleVi: 'đóng, quan' },
      { char: 'ang', rom: 'ang', meaning: 'Vần mũi /aŋ/ (-ng phát âm bằng cuống họng)', example: 'māng (忙)', exampleRom: 'máng', exampleVi: 'bận rộn' },
      { char: 'eng', rom: 'eng', meaning: 'Vần mũi /əŋ/', example: 'néng (能)', exampleRom: 'néng', exampleVi: 'có thể, có năng lực' },
      { char: 'ing', rom: 'ing', meaning: 'Vần mũi /iŋ/', example: 'míng (名)', exampleRom: 'míng', exampleVi: 'tên, nổi tiếng' },
      { char: 'ong', rom: 'ong', meaning: 'Vần mũi /uŋ/', example: 'zhōng (中)', exampleRom: 'zhōng', exampleVi: 'giữa, Trung' },
      { char: 'iang', rom: 'iang', meaning: 'Vần mũi /iaŋ/', example: 'liǎng (两)', exampleRom: 'liǎng', exampleVi: 'hai (số lượng đôi)' },
      { char: 'uang', rom: 'uang', meaning: 'Vần mũi /waŋ/', example: 'shuāng (双)', exampleRom: 'shuāng', exampleVi: 'đôi, đôi cặp' },
    ],
  },
];

// ─── Seed helper ─────────────────────────────────────────────────────────────
async function ensureLevel(code: string, name: string, subject: 'JLPT' | 'HSK', order: number) {
  return prisma.level.upsert({
    where: { code },
    create: { code, name, subject, order },
    update: {},
  });
}

async function seedAlphabetCategory(
  levelCode: string,
  lang: Language,
  categoryId: string,
  categoryName: string,
  categoryDesc: string,
  categoryIcon: string,
  lessons: AlphabetLesson[],
) {
  const level = await prisma.level.findUnique({ where: { code: levelCode } });
  if (!level) { console.error(`  ❌ Level ${levelCode} not found.`); return; }
  const cat = await prisma.learningCategory.upsert({
    where: { id: categoryId },
    create: {
      id: categoryId,
      levelId: level.id,
      skill: 'vocab',
      name: categoryName,
      description: categoryDesc,
      icon: categoryIcon,
      order: 0, // appears FIRST — mandatory beginner content
    },
    update: { name: categoryName, description: categoryDesc, icon: categoryIcon },
  });

  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    const lessonId = `${categoryId}-${i + 1}`;

    await prisma.learningLesson.upsert({
      where: { id: lessonId },
      create: {
        id: lessonId,
        categoryId: cat.id,
        title: lesson.title,
        description: lesson.description,
        type: 'vocab',
        order: i + 1,
      },
      update: { title: lesson.title, description: lesson.description },
    });

    // Recreate fresh content items
    await prisma.content.deleteMany({ where: { lessonId } });

    const created = await prisma.content.createManyAndReturn({
      data: lesson.chars.map((c, idx) => ({
        lessonId,
        type: 'character' as const,
        language: lang,
        term: c.char,
        pronunciation: c.rom,
        order: idx + 1,
      })),
    });

    await prisma.contentMeaning.createMany({
      data: created.map((c, idx) => ({
        contentId: c.id,
        language: 'vi' as Language,
        meaning: lesson.chars[idx].meaning,
      })),
    });

    const examples = created
      .map((c, idx) => ({ c, ch: lesson.chars[idx] }))
      .filter(({ ch }) => ch.example)
      .map(({ c, ch }) => ({
        contentId: c.id,
        exampleText: ch.example!,
        translation: ch.exampleVi ?? null,
        language: lang,
        translationLanguage: ch.exampleVi ? ('vi' as Language) : null,
      }));
    if (examples.length > 0) await prisma.contentExample.createMany({ data: examples });

    process.stdout.write(`  [${levelCode}] ${i + 1}/${lessons.length} — ${lesson.title} ✓\r`);
  }
  console.log(`\n✅ ${categoryName}: ${lessons.length} bài, ${lessons.reduce((s, l) => s + l.chars.length, 0)} ký tự seeded.`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🔤 Seeding bảng chữ cái tiếng Nhật — Hiragana (N5)...');
  await seedAlphabetCategory(
    'N5', 'ja',
    'alphabet-n5-hiragana',
    'Bảng chữ cái — Hiragana (ひらがな)',
    'Bộ chữ cái hiragana bắt buộc học ở N5. Bao gồm 46 ký tự cơ bản, dakuten, handakuten và vần ghép yōon.',
    'あ',
    HIRAGANA,
  );

  console.log('\n🔤 Seeding bảng chữ cái tiếng Nhật — Katakana (N5)...');
  await seedAlphabetCategory(
    'N5', 'ja',
    'alphabet-n5-katakana',
    'Bảng chữ cái — Katakana (カタカナ)',
    'Bộ chữ katakana bắt buộc học ở N5. Dùng cho từ ngoại lai, tên nước ngoài và âm nhấn mạnh.',
    'ア',
    KATAKANA,
  );

  console.log('\n🔤 Seeding bảng chữ cái tiếng Trung — Pinyin (HSK1)...');
  // ensure HSK1 level exists (created by seed-hsk.ts; auto-create if missing)
  await ensureLevel('HSK1', 'HSK 1 — Nhập môn', 'HSK', 10);
  await seedAlphabetCategory(
    'HSK1', 'zh',
    'alphabet-hsk1-pinyin',
    'Bảng phát âm — Bính âm Pinyin (拼音)',
    'Hệ thống phiên âm Pinyin bắt buộc học ở HSK1: thanh điệu, phụ âm đầu và vần.',
    '拼',
    PINYIN,
  );
}

main()
  .then(() => { console.log('\n🎉 Bảng chữ cái seeded thành công!'); process.exit(0); })
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
