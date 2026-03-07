/**
 * Seed Minna no Nihongo N5 (Bài 1~25) & N4 (Bài 26~50) vocab + grammar.
 * Mimikara Oboeru N3/N2/N1 vocab + Shin Kanzen Master N3/N2/N1 grammar.
 *
 * Run: npx tsx prisma/seed-minna.ts
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ─── Types ──────────────────────────────────────────────────────────────────
type WordRow = { japanese: string; reading: string; meaning: string; example?: string; exampleReading?: string; exampleMeaning?: string };
type GrammarRow = { pattern: string; meaning: string; usage: string; example?: string; exampleReading?: string; exampleMeaning?: string };
type Lesson = { title: string; description?: string; vocab: WordRow[]; grammar: GrammarRow[] };

// ─── N5 — Minna no Nihongo I (Bài 1~25) ────────────────────────────────────
const MINNA_N5: Lesson[] = [
  {
    title: 'Bài 1 — Giới thiệu bản thân',
    description: 'Cấu trúc AはBです, đại từ nhân xưng, nghề nghiệp.',
    vocab: [
      { japanese: '私', reading: 'わたし', meaning: 'tôi', example: '私はマリアです。', exampleReading: 'わたしはマリアです。', exampleMeaning: 'Tôi là Maria.' },
      { japanese: '人', reading: 'じん／にん', meaning: 'người', example: '日本人です。', exampleReading: 'にほんじんです。', exampleMeaning: 'Là người Nhật.' },
      { japanese: '先生', reading: 'せんせい', meaning: 'giáo viên', example: '先生はやさしいです。', exampleReading: 'せんせいはやさしいです。', exampleMeaning: 'Giáo viên thật thân thiện.' },
      { japanese: '学生', reading: 'がくせい', meaning: 'học sinh', example: '私は学生です。', exampleReading: 'わたしはがくせいです。', exampleMeaning: 'Tôi là học sinh.' },
      { japanese: '会社員', reading: 'かいしゃいん', meaning: 'nhân viên công ty', example: '父は会社員です。', exampleReading: 'ちちはかいしゃいんです。', exampleMeaning: 'Bố là nhân viên công ty.' },
    ],
    grammar: [
      { pattern: 'AはBです', meaning: 'A là B', usage: 'Dùng để giới thiệu, định nghĩa hoặc xác nhận danh tính.', example: '私は山田です。', exampleReading: 'わたしはやまだです。', exampleMeaning: 'Tôi là Yamada.' },
      { pattern: 'AはBじゃないです', meaning: 'A không phải là B', usage: 'Phủ định của「～です」.', example: '私は先生じゃないです。', exampleReading: 'わたしはせんせいじゃないです。', exampleMeaning: 'Tôi không phải là giáo viên.' },
    ],
  },
  {
    title: 'Bài 2 — Đồ vật xung quanh',
    description: 'これ/それ/あれ, こ/そ/あ/ど, chỉ thị từ.',
    vocab: [
      { japanese: 'これ', reading: 'これ', meaning: 'cái này', example: 'これは本です。', exampleReading: 'これはほんです。', exampleMeaning: 'Đây là cuốn sách.' },
      { japanese: 'それ', reading: 'それ', meaning: 'cái đó', example: 'それはペンです。', exampleReading: 'それはペンです。', exampleMeaning: 'Cái đó là cái bút.' },
      { japanese: 'あれ', reading: 'あれ', meaning: 'cái kia', example: 'あれは何ですか？', exampleReading: 'あれはなんですか？', exampleMeaning: 'Cái kia là gì?' },
      { japanese: 'この', reading: 'この', meaning: 'cái … này', example: 'この本はおもしろいです。', exampleReading: 'このほんはおもしろいです。', exampleMeaning: 'Cuốn sách này hay.' },
      { japanese: '何', reading: 'なん／なに', meaning: 'cái gì / gì', example: '何ですか？', exampleReading: 'なんですか？', exampleMeaning: 'Cái gì vậy?' },
    ],
    grammar: [
      { pattern: 'これ/それ/あれはNですか', meaning: 'Đây/đó/kia có phải là N không?', usage: 'Câu hỏi xác nhận vật thể.', example: 'これはかばんですか？', exampleReading: 'これはかばんですか？', exampleMeaning: 'Đây có phải là túi không?' },
      { pattern: 'の（sở hữu）', meaning: '[N1]の[N2] — N2 của N1', usage: 'Chỉ sở hữu hoặc thuộc tính.', example: '私の本です。', exampleReading: 'わたしのほんです。', exampleMeaning: 'Sách của tôi.' },
    ],
  },
  {
    title: 'Bài 3 — Ở đâu',
    description: 'ここ/そこ/あそこ, 場所 (chỉ vị trí).',
    vocab: [
      { japanese: 'ここ', reading: 'ここ', meaning: 'chỗ này, ở đây', example: 'ここは図書館です。', exampleReading: 'ここはとしょかんです。', exampleMeaning: 'Đây là thư viện.' },
      { japanese: 'そこ', reading: 'そこ', meaning: 'chỗ đó, ở đó', example: 'そこにあります。', exampleReading: 'そこにあります。', exampleMeaning: 'Ở chỗ đó.' },
      { japanese: 'あそこ', reading: 'あそこ', meaning: 'chỗ kia', example: 'あそこはトイレです。', exampleReading: 'あそこはトイレです。', exampleMeaning: 'Chỗ kia là nhà vệ sinh.' },
      { japanese: '国', reading: 'くに', meaning: 'đất nước, quê hương', example: 'あなたの国はどこですか？', exampleReading: 'あなたのくにはどこですか？', exampleMeaning: 'Đất nước của bạn là đâu?' },
      { japanese: '会社', reading: 'かいしゃ', meaning: 'công ty', example: '会社はどこですか？', exampleReading: 'かいしゃはどこですか？', exampleMeaning: 'Công ty ở đâu?' },
    ],
    grammar: [
      { pattern: '～はどこですか', meaning: '～ ở đâu?', usage: 'Hỏi vị trí.', example: 'トイレはどこですか？', exampleReading: 'トイレはどこですか？', exampleMeaning: 'Nhà vệ sinh ở đâu?' },
      { pattern: 'N1のN2', meaning: 'N2 của N1 (phổ quát)', usage: 'の nối danh từ biểu thị sở hữu, xuất xứ, phân loại.', example: '日本の車です。', exampleReading: 'にほんのくるまです。', exampleMeaning: 'Xe Nhật.' },
    ],
  },
  {
    title: 'Bài 4 — Thời gian & giờ giấc',
    description: 'Cách đọc giờ, phút; hỏi mấy giờ; từ chỉ thời gian.',
    vocab: [
      { japanese: '時', reading: 'じ', meaning: 'giờ', example: 'いま何時ですか？', exampleReading: 'いまなんじですか？', exampleMeaning: 'Bây giờ là mấy giờ?' },
      { japanese: '分', reading: 'ふん／ぷん', meaning: 'phút', example: '3時15分です。', exampleReading: 'さんじじゅうごふんです。', exampleMeaning: 'Là 3 giờ 15 phút.' },
      { japanese: '今', reading: 'いま', meaning: 'bây giờ', example: '今、8時です。', exampleReading: 'いま、はちじです。', exampleMeaning: 'Bây giờ là 8 giờ.' },
      { japanese: '午前', reading: 'ごぜん', meaning: 'buổi sáng (AM)', example: '午前9時に起きます。', exampleReading: 'ごぜんくじにおきます。', exampleMeaning: 'Tôi thức dậy lúc 9 giờ sáng.' },
      { japanese: '午後', reading: 'ごご', meaning: 'buổi chiều (PM)', example: '午後3時に来てください。', exampleReading: 'ごごさんじにきてください。', exampleMeaning: 'Hãy đến lúc 3 giờ chiều.' },
      { japanese: '毎朝', reading: 'まいあさ', meaning: 'mỗi buổi sáng', example: '毎朝7時に起きます。', exampleReading: 'まいあさしちじにおきます。', exampleMeaning: 'Tôi thức dậy lúc 7 giờ mỗi sáng.' },
    ],
    grammar: [
      { pattern: 'Nに～ます', meaning: 'Động từ xảy ra vào thời điểm N', usage: 'Chỉ thời điểm cụ thể với trợ từ「に」.', example: '7時に起きます。', exampleReading: 'しちじにおきます。', exampleMeaning: 'Thức dậy lúc 7 giờ.' },
      { pattern: 'から～まで', meaning: 'từ … đến …', usage: 'Chỉ khoảng thời gian hoặc khoảng không gian.', example: '9時から5時まで働きます。', exampleReading: 'くじからごじまではたらきます。', exampleMeaning: 'Làm việc từ 9 giờ đến 5 giờ.' },
    ],
  },
  {
    title: 'Bài 5 — Đi lại, mua sắm',
    description: '～に行きます/来ます/帰ります, phương thức di chuyển.',
    vocab: [
      { japanese: '行く', reading: 'いく', meaning: 'đi', example: '学校に行きます。', exampleReading: 'がっこうにいきます。', exampleMeaning: 'Tôi đến trường.' },
      { japanese: '来る', reading: 'くる', meaning: 'đến, tới', example: '友達が来ます。', exampleReading: 'ともだちがきます。', exampleMeaning: 'Bạn đến.' },
      { japanese: '帰る', reading: 'かえる', meaning: 'về nhà', example: '6時に帰ります。', exampleReading: 'ろくじにかえります。', exampleMeaning: '6 giờ về nhà.' },
      { japanese: 'で（phương tiện）', reading: 'で', meaning: '[phương tiện] bằng xe…', example: 'バスで行きます。', exampleReading: 'バスでいきます。', exampleMeaning: 'Đi bằng xe buýt.' },
      { japanese: '誰', reading: 'だれ', meaning: 'ai', example: '誰と行きますか？', exampleReading: 'だれといきますか？', exampleMeaning: 'Bạn đi với ai?' },
    ],
    grammar: [
      { pattern: '～に行きます', meaning: 'đi đến ~ (địa điểm)', usage: 'Trợ từ「に」chỉ điểm đến.', example: 'デパートに行きます。', exampleReading: 'デパートにいきます。', exampleMeaning: 'Đi đến trung tâm thương mại.' },
      { pattern: '～で行きます', meaning: 'đi bằng phương tiện ~', usage: '「で」chỉ phương tiện di chuyển.', example: '電車で行きます。', exampleReading: 'でんしゃでいきます。', exampleMeaning: 'Đi bằng tàu điện.' },
    ],
  },
  {
    title: 'Bài 6 — Ăn uống',
    description: 'Động từ nhóm 2, mời ăn, thú vị.',
    vocab: [
      { japanese: '食べる', reading: 'たべる', meaning: 'ăn', example: '昼ごはんを食べます。', exampleReading: 'ひるごはんをたべます。', exampleMeaning: 'Tôi ăn trưa.' },
      { japanese: '飲む', reading: 'のむ', meaning: 'uống', example: 'コーヒーを飲みます。', exampleReading: 'コーヒーをのみます。', exampleMeaning: 'Tôi uống cà phê.' },
      { japanese: 'おいしい', reading: 'おいしい', meaning: 'ngon', example: 'このりんごはおいしい。', exampleReading: 'このりんごはおいしい。', exampleMeaning: 'Quả táo này ngon.' },
      { japanese: 'レストラン', reading: 'レストラン', meaning: 'nhà hàng', example: 'レストランで食べます。', exampleReading: 'レストランでたべます。', exampleMeaning: 'Ăn ở nhà hàng.' },
      { japanese: 'いっしょに', reading: 'いっしょに', meaning: 'cùng nhau', example: 'いっしょに食べましょう。', exampleReading: 'いっしょにたべましょう。', exampleMeaning: 'Hãy cùng ăn nhé.' },
    ],
    grammar: [
      { pattern: '～ませんか', meaning: 'Mình cùng … không? (mời)', usage: 'Lịch sự mời ai đó cùng làm việc gì.', example: 'いっしょに食べませんか？', exampleReading: 'いっしょにたべませんか？', exampleMeaning: 'Chúng ta cùng ăn không?' },
      { pattern: '～ましょう', meaning: 'Hãy … nào (đề nghị)', usage: 'Đề xuất hành động cùng nhau.', example: '行きましょう。', exampleReading: 'いきましょう。', exampleMeaning: 'Đi thôi!' },
    ],
  },
  {
    title: 'Bài 7 — Địa điểm & tồn tại',
    description: '～があります/います, chỉ vị trí.',
    vocab: [
      { japanese: 'ある', reading: 'ある', meaning: 'có (vật vô sinh)', example: '駅の前に本屋があります。', exampleReading: 'えきのまえにほんやがあります。', exampleMeaning: 'Trước ga có hiệu sách.' },
      { japanese: 'いる', reading: 'いる', meaning: 'có, ở (người/động vật)', example: '公園に子どもがいます。', exampleReading: 'こうえんにこどもがいます。', exampleMeaning: 'Công viên có trẻ em.' },
      { japanese: '前', reading: 'まえ', meaning: 'phía trước', example: '駅の前で待ちます。', exampleReading: 'えきのまえでまちます。', exampleMeaning: 'Đợi trước ga.' },
      { japanese: '後ろ', reading: 'うしろ', meaning: 'phía sau', example: '後ろに誰かいます。', exampleReading: 'うしろにだれかいます。', exampleMeaning: 'Phía sau có ai đó.' },
      { japanese: '中', reading: 'なか', meaning: 'bên trong', example: 'かばんの中に財布があります。', exampleReading: 'かばんのなかにさいふがあります。', exampleMeaning: 'Trong túi có ví.' },
    ],
    grammar: [
      { pattern: 'Nがあります/います', meaning: 'Có N (tồn tại)', usage: 'あります cho vật không sống; います cho người/động vật.', example: '公園の前に花屋があります。', exampleReading: 'こうえんのまえにはなやがあります。', exampleMeaning: 'Trước công viên có tiệm hoa.' },
      { pattern: '場所にNがある/いる', meaning: 'N ở địa điểm …', usage: 'Diễn đạt vật/người ở đâu.', example: '部屋にねこがいます。', exampleReading: 'へやにねこがいます。', exampleMeaning: 'Trong phòng có mèo.' },
    ],
  },
  {
    title: 'Bài 8 — Hình dạng, số lượng',
    description: 'Đếm vật, trợ số từ, bao nhiêu.',
    vocab: [
      { japanese: '一つ', reading: 'ひとつ', meaning: 'một cái', example: 'リンゴを一つください。', exampleReading: 'りんごをひとつください。', exampleMeaning: 'Cho tôi một quả táo.' },
      { japanese: 'いくつ', reading: 'いくつ', meaning: 'bao nhiêu cái', example: 'りんごはいくつありますか？', exampleReading: 'りんごはいくつありますか？', exampleMeaning: 'Có bao nhiêu quả táo?' },
      { japanese: '全部', reading: 'ぜんぶ', meaning: 'tất cả', example: '全部でいくらですか？', exampleReading: 'ぜんぶでいくらですか？', exampleMeaning: 'Tất cả bao nhiêu tiền?' },
      { japanese: 'いくら', reading: 'いくら', meaning: 'bao nhiêu tiền', example: 'このケーキはいくらですか？', exampleReading: 'このケーキはいくらですか？', exampleMeaning: 'Cái bánh này bao nhiêu?' },
      { japanese: '円', reading: 'えん', meaning: 'yên (đơn vị tiền Nhật)', example: '300円です。', exampleReading: 'さんびゃくえんです。', exampleMeaning: 'Là 300 yên.' },
    ],
    grammar: [
      { pattern: 'Nをください', meaning: 'Cho tôi N (mua hàng)', usage: 'Dùng khi mua hàng hoặc xin ai đó thứ gì.', example: 'このケーキを一つください。', exampleReading: 'このケーキをひとつください。', exampleMeaning: 'Cho tôi một cái bánh này.' },
      { pattern: '全部でいくらですか', meaning: 'Tất cả bao nhiêu tiền?', usage: 'Hỏi tổng giá khi mua hàng.', example: '全部で500円です。', exampleReading: 'ぜんぶでごひゃくえんです。', exampleMeaning: 'Tất cả là 500 yên.' },
    ],
  },
  {
    title: 'Bài 9 — Tính từ い',
    description: 'Tính từ 1 (い-adj), chia phủ định và quá khứ.',
    vocab: [
      { japanese: '大きい', reading: 'おおきい', meaning: 'to, lớn', example: '大きいかばんです。', exampleReading: 'おおきいかばんです。', exampleMeaning: 'Cái túi to.' },
      { japanese: '小さい', reading: 'ちいさい', meaning: 'nhỏ, bé', example: '小さい犬がいます。', exampleReading: 'ちいさいいぬがいます。', exampleMeaning: 'Có con chó nhỏ.' },
      { japanese: '良い', reading: 'いい', meaning: 'tốt', example: '今日はいい天気ですね。', exampleReading: 'きょうはいいてんきですね。', exampleMeaning: 'Hôm nay thời tiết tốt nhỉ.' },
      { japanese: '高い', reading: 'たかい', meaning: 'cao; đắt', example: 'このレストランは高いです。', exampleReading: 'このレストランはたかいです。', exampleMeaning: 'Nhà hàng này đắt.' },
      { japanese: '安い', reading: 'やすい', meaning: 'rẻ', example: 'このお店は安いです。', exampleReading: 'このおみせはやすいです。', exampleMeaning: 'Cửa hàng này rẻ.' },
    ],
    grammar: [
      { pattern: 'い-adj → ～くないです', meaning: 'không ~ (phủ định)', usage: 'Bỏ い, thêm くないです.', example: '高くないです。', exampleReading: 'たかくないです。', exampleMeaning: 'Không đắt.' },
      { pattern: 'い-adj → ～かったです', meaning: '~ (quá khứ thể lịch sự)', usage: 'Bỏ い, thêm かったです.', example: '楽しかったです。', exampleReading: 'たのしかったです。', exampleMeaning: 'Đã vui.' },
    ],
  },
  {
    title: 'Bài 10 — Tính từ な',
    description: 'Tính từ 2 (な-adj), đặc điểm, mô tả.',
    vocab: [
      { japanese: '好き', reading: 'すき', meaning: 'thích', example: '日本語が好きです。', exampleReading: 'にほんごがすきです。', exampleMeaning: 'Tôi thích tiếng Nhật.' },
      { japanese: '嫌い', reading: 'きらい', meaning: 'không thích', example: 'ピーマンが嫌いです。', exampleReading: 'ピーマンがきらいです。', exampleMeaning: 'Tôi không thích ớt chuông.' },
      { japanese: '上手', reading: 'じょうず', meaning: 'giỏi, khéo', example: '彼女は料理が上手です。', exampleReading: 'かのじょはりょうりがじょうずです。', exampleMeaning: 'Cô ấy nấu ăn giỏi.' },
      { japanese: '有名', reading: 'ゆうめい', meaning: 'nổi tiếng', example: '富士山は有名な山です。', exampleReading: 'ふじさんはゆうめいなやまです。', exampleMeaning: 'Núi Fuji là ngọn núi nổi tiếng.' },
      { japanese: '静か', reading: 'しずか', meaning: 'yên tĩnh', example: '図書館は静かです。', exampleReading: 'としょかんはしずかです。', exampleMeaning: 'Thư viện yên tĩnh.' },
    ],
    grammar: [
      { pattern: 'な-adj＋な＋N', meaning: 'tính từ na đứng trước danh từ dùng な', usage: 'Tính từ な khi đứng trước danh từ phải thêm な.', example: 'きれいな花です。', exampleReading: 'きれいなはなです。', exampleMeaning: 'Là bông hoa đẹp.' },
      { pattern: 'N が好きです/嫌いです', meaning: 'thích/ không thích N', usage: '「が」chỉ đối tượng của cảm xúc.', example: '音楽が好きです。', exampleReading: 'おんがくがすきです。', exampleMeaning: 'Tôi thích âm nhạc.' },
    ],
  },
  {
    title: 'Bài 11 — Ước muốn, đề nghị',
    description: '～たいです, ～てください, động từ dạng て.',
    vocab: [
      { japanese: '～たい', reading: 'たい', meaning: 'muốn ~', example: '寿司が食べたいです。', exampleReading: 'すしがたべたいです。', exampleMeaning: 'Tôi muốn ăn sushi.' },
      { japanese: '旅行', reading: 'りょこう', meaning: 'du lịch', example: '来年、日本に旅行したいです。', exampleReading: 'らいねん、にほんにりょこうしたいです。', exampleMeaning: 'Năm sau tôi muốn du lịch Nhật Bản.' },
      { japanese: '買い物', reading: 'かいもの', meaning: 'mua sắm', example: 'デパートで買い物をします。', exampleReading: 'デパートでかいものをします。', exampleMeaning: 'Mua sắm ở trung tâm thương mại.' },
      { japanese: '休み', reading: 'やすみ', meaning: 'ngày nghỉ, nghỉ ngơi', example: '休みに旅行します。', exampleReading: 'やすみにりょこうします。', exampleMeaning: 'Tôi đi du lịch vào ngày nghỉ.' },
      { japanese: '映画', reading: 'えいが', meaning: 'phim điện ảnh', example: '映画が見たいです。', exampleReading: 'えいががみたいです。', exampleMeaning: 'Tôi muốn xem phim.' },
    ],
    grammar: [
      { pattern: '～たいです', meaning: 'muốn làm ~', usage: 'Gắn たい vào gốc động từ (masu-stem).', example: '日本語を話したいです。', exampleReading: 'にほんごをはなしたいです。', exampleMeaning: 'Tôi muốn nói tiếng Nhật.' },
      { pattern: '～てください', meaning: 'Hãy làm ~ (yêu cầu lịch sự)', usage: 'Dạng て của động từ + ください.', example: 'ゆっくり話してください。', exampleReading: 'ゆっくりはなしてください。', exampleMeaning: 'Xin hãy nói chậm thôi.' },
    ],
  },
  {
    title: 'Bài 12 — Hỏi thăm, tần suất',
    description: 'よく/ときどき/あまり/ぜんぜん, câu hỏi bổ trợ.',
    vocab: [
      { japanese: 'よく', reading: 'よく', meaning: 'thường, hay', example: 'よくテレビを見ます。', exampleReading: 'よくテレビをみます。', exampleMeaning: 'Tôi thường xem TV.' },
      { japanese: 'ときどき', reading: 'ときどき', meaning: 'thỉnh thoảng', example: 'ときどき料理をします。', exampleReading: 'ときどきりょうりをします。', exampleMeaning: 'Thỉnh thoảng tôi nấu ăn.' },
      { japanese: 'あまり～ない', reading: 'あまり', meaning: 'không mấy, không lắm', example: 'あまり肉を食べません。', exampleReading: 'あまりにくをたべません。', exampleMeaning: 'Tôi không ăn thịt mấy.' },
      { japanese: 'ぜんぜん～ない', reading: 'ぜんぜん', meaning: 'hoàn toàn không', example: 'ぜんぜん眠れません。', exampleReading: 'ぜんぜんねむれません。', exampleMeaning: 'Không ngủ được chút nào.' },
      { japanese: 'どんな', reading: 'どんな', meaning: 'loại … nào', example: 'どんな音楽が好きですか？', exampleReading: 'どんなおんがくがすきですか？', exampleMeaning: 'Bạn thích loại nhạc nào?' },
    ],
    grammar: [
      { pattern: 'あまり＋～ません', meaning: 'không ~ nhiều lắm', usage: 'あまり dùng với phủ định.', example: 'あまり映画を見ません。', exampleReading: 'あまりえいがをみません。', exampleMeaning: 'Tôi không xem phim nhiều lắm.' },
      { pattern: 'ぜんぜん＋～ません', meaning: 'hoàn toàn không ~', usage: 'ぜんぜん nhấn mạnh phủ định hoàn toàn.', example: 'ぜんぜんわかりません。', exampleReading: 'ぜんぜんわかりません。', exampleMeaning: 'Tôi hoàn toàn không hiểu.' },
    ],
  },
  {
    title: 'Bài 13 — Đang làm gì, trạng thái',
    description: '～ています (tiếp diễn / kết quả).',
    vocab: [
      { japanese: '～ている', reading: 'ている', meaning: '(đang ~) / (trạng thái ~)', example: '今、勉強しています。', exampleReading: 'いま、べんきょうしています。', exampleMeaning: 'Tôi đang học.' },
      { japanese: '結婚する', reading: 'けっこんする', meaning: 'kết hôn', example: '彼は結婚していません。', exampleReading: 'かれはけっこんしていません。', exampleMeaning: 'Anh ấy chưa kết hôn.' },
      { japanese: '住む', reading: 'すむ', meaning: 'cư trú, ở', example: '東京に住んでいます。', exampleReading: 'とうきょうにすんでいます。', exampleMeaning: 'Tôi đang sống ở Tokyo.' },
      { japanese: '働く', reading: 'はたらく', meaning: 'làm việc', example: 'どこで働いていますか？', exampleReading: 'どこではたらいていますか？', exampleMeaning: 'Bạn đang làm việc ở đâu?' },
      { japanese: '着る', reading: 'きる', meaning: 'mặc (áo)', example: '白いシャツを着ています。', exampleReading: 'しろいシャツをきています。', exampleMeaning: 'Đang mặc áo phông trắng.' },
    ],
    grammar: [
      { pattern: 'V-て＋います', meaning: '(đang V) hoặc (trạng thái V)', usage: 'Chỉ hành động đang diễn ra hoặc trạng thái sau khi hành động.', example: '本を読んでいます。', exampleReading: 'ほんをよんでいます。', exampleMeaning: 'Đang đọc sách.' },
      { pattern: 'V-て＋います（kết quả）', meaning: '(trạng thái) đã V', usage: 'Mô tả trạng thái hiện tại là kết quả của hành động trước đó.', example: '窓が開いています。', exampleReading: 'まどがあいています。', exampleMeaning: 'Cửa sổ đang mở (ai đó đã mở).' },
    ],
  },
  {
    title: 'Bài 14 — Kinh nghiệm, xin phép',
    description: '～たことがあります, ～てもいいですか.',
    vocab: [
      { japanese: '～たことがある', reading: 'たことがある', meaning: 'đã từng ~', example: '富士山に登ったことがあります。', exampleReading: 'ふじさんにのぼったことがあります。', exampleMeaning: 'Tôi đã từng leo núi Fuji.' },
      { japanese: '登る', reading: 'のぼる', meaning: 'leo, trèo', example: '山に登ります。', exampleReading: 'やまにのぼります。', exampleMeaning: 'Leo núi.' },
      { japanese: '経験', reading: 'けいけん', meaning: 'kinh nghiệm', example: '海外の経験があります。', exampleReading: 'かいがいのけいけんがあります。', exampleMeaning: 'Tôi có kinh nghiệm ở nước ngoài.' },
      { japanese: '見る', reading: 'みる', meaning: 'xem, nhìn', example: 'その映画を見たことがあります。', exampleReading: 'そのえいがをみたことがあります。', exampleMeaning: 'Tôi đã từng xem bộ phim đó.' },
      { japanese: '使う', reading: 'つかう', meaning: 'sử dụng, dùng', example: 'この機械を使ったことがあります。', exampleReading: 'このきかいをつかったことがあります。', exampleMeaning: 'Tôi đã từng dùng máy này.' },
    ],
    grammar: [
      { pattern: 'V-た＋ことがあります', meaning: 'đã từng V (kinh nghiệm)', usage: 'Nói về kinh nghiệm đã có trong quá khứ.', example: '日本料理を食べたことがあります。', exampleReading: 'にほんりょうりをたべたことがあります。', exampleMeaning: 'Tôi đã từng ăn món Nhật.' },
      { pattern: 'V-て＋もいいですか', meaning: 'Tôi có thể V không?', usage: 'Xin phép làm việc gì.', example: 'ここに座ってもいいですか？', exampleReading: 'ここにすわってもいいですか？', exampleMeaning: 'Tôi có thể ngồi đây không?' },
    ],
  },
  {
    title: 'Bài 15 — Phải làm; không được',
    description: '～なければなりません, ～てはいけません.',
    vocab: [
      { japanese: '薬', reading: 'くすり', meaning: 'thuốc', example: '薬を飲まなければなりません。', exampleReading: 'くすりをのまなければなりません。', exampleMeaning: 'Tôi phải uống thuốc.' },
      { japanese: '規則', reading: 'きそく', meaning: 'quy tắc, nội quy', example: '規則を守らなければなりません。', exampleReading: 'きそくをまもらなければなりません。', exampleMeaning: 'Phải tuân thủ quy tắc.' },
      { japanese: '守る', reading: 'まもる', meaning: 'tuân thủ, bảo vệ', example: '約束を守ります。', exampleReading: 'やくそくをまもります。', exampleMeaning: 'Tôi giữ lời hứa.' },
      { japanese: '静かにする', reading: 'しずかにする', meaning: 'giữ yên lặng', example: '図書館では静かにしなければなりません。', exampleReading: 'としょかんではしずかにしなければなりません。', exampleMeaning: 'Phải giữ yên lặng trong thư viện.' },
      { japanese: '駄目', reading: 'だめ', meaning: 'không được, bị cấm', example: 'ここで写真を撮ってはいけません。', exampleReading: 'ここでしゃしんをとってはいけません。', exampleMeaning: 'Không được chụp ảnh ở đây.' },
    ],
    grammar: [
      { pattern: 'V(ない形)＋なければなりません', meaning: 'phải V', usage: 'Diễn đạt nghĩa vụ, bắt buộc.', example: '毎日運動しなければなりません。', exampleReading: 'まいにちうんどうしなければなりません。', exampleMeaning: 'Phải tập thể dục mỗi ngày.' },
      { pattern: 'V-て＋はいけません', meaning: 'không được V', usage: 'Cấm đoán.', example: 'ここでタバコを吸ってはいけません。', exampleReading: 'ここでタバコをすってはいけません。', exampleMeaning: 'Không được hút thuốc ở đây.' },
    ],
  },
  {
    title: 'Bài 16 — Hỏi đường, hướng dẫn',
    description: 'Chỉ đường, từ chỉ hướng, mệnh lệnh lịch sự.',
    vocab: [
      { japanese: '右', reading: 'みぎ', meaning: 'bên phải', example: '右に曲がってください。', exampleReading: 'みぎにまがってください。', exampleMeaning: 'Hãy rẽ phải.' },
      { japanese: '左', reading: 'ひだり', meaning: 'bên trái', example: '左に曲がります。', exampleReading: 'ひだりにまがります。', exampleMeaning: 'Rẽ trái.' },
      { japanese: 'まっすぐ', reading: 'まっすぐ', meaning: 'thẳng', example: 'まっすぐ行ってください。', exampleReading: 'まっすぐいってください。', exampleMeaning: 'Đi thẳng.' },
      { japanese: '渡る', reading: 'わたる', meaning: 'băng qua (đường, cầu)', example: '横断歩道を渡ってください。', exampleReading: 'おうだんほどうをわたってください。', exampleMeaning: 'Hãy băng qua vạch sang đường.' },
      { japanese: '信号', reading: 'しんごう', meaning: 'đèn giao thông', example: '信号を渡ったら、左に曲がります。', exampleReading: 'しんごうをわたったら、ひだりにまがります。', exampleMeaning: 'Qua đèn giao thông thì rẽ trái.' },
    ],
    grammar: [
      { pattern: 'V-てから', meaning: 'sau khi V thì …', usage: 'Chỉ thứ tự hành động.', example: '右に曲がってから、まっすぐ行きます。', exampleReading: 'みぎにまがってから、まっすぐいきます。', exampleMeaning: 'Sau khi rẽ phải rồi đi thẳng.' },
      { pattern: '～たら', meaning: 'khi/nếu ~ thì …', usage: 'Điều kiện hoặc thứ tự theo điều kiện.', example: '信号を渡ったら、見えます。', exampleReading: 'しんごうをわたったら、みえます。', exampleMeaning: 'Qua đèn giao thông thì thấy ngay.' },
    ],
  },
  {
    title: 'Bài 17 — Cho và nhận',
    description: '～てあげます/もらいます/くれます.',
    vocab: [
      { japanese: 'あげる', reading: 'あげる', meaning: 'cho (ai đó)', example: '友達にプレゼントをあげます。', exampleReading: 'ともだちにプレゼントをあげます。', exampleMeaning: 'Tôi tặng quà cho bạn.' },
      { japanese: 'もらう', reading: 'もらう', meaning: 'nhận (từ ai đó)', example: '母にケーキをもらいました。', exampleReading: 'ははにケーキをもらいました。', exampleMeaning: 'Tôi được mẹ tặng bánh.' },
      { japanese: 'くれる', reading: 'くれる', meaning: 'cho (tôi)', example: '友達が本をくれました。', exampleReading: 'ともだちがほんをくれました。', exampleMeaning: 'Bạn đã tặng tôi sách.' },
      { japanese: 'プレゼント', reading: 'プレゼント', meaning: 'quà tặng', example: '誕生日にプレゼントをもらいました。', exampleReading: 'たんじょうびにプレゼントをもらいました。', exampleMeaning: 'Nhân sinh nhật tôi được nhận quà.' },
      { japanese: '誕生日', reading: 'たんじょうび', meaning: 'sinh nhật', example: '今日は私の誕生日です。', exampleReading: 'きょうはわたしのたんじょうびです。', exampleMeaning: 'Hôm nay là sinh nhật tôi.' },
    ],
    grammar: [
      { pattern: 'NにNをあげます', meaning: 'cho N thứ gì đó', usage: 'Người cho → người nhận → vật.', example: '妹に花をあげました。', exampleReading: 'いもうとにはなをあげました。', exampleMeaning: 'Tôi đã tặng hoa cho em gái.' },
      { pattern: 'NにNをもらいます', meaning: 'nhận thứ gì từ N', usage: 'Người nhận góc nhìn người nói.', example: '先生に本をもらいました。', exampleReading: 'せんせいにほんをもらいました。', exampleMeaning: 'Tôi được thầy giáo cho sách.' },
    ],
  },
  {
    title: 'Bài 18 — Biết, hiểu, cần',
    description: '～を知っています, ～がわかります, ～が必要です.',
    vocab: [
      { japanese: '知る', reading: 'しる', meaning: 'biết, nhận biết', example: 'あの人を知っていますか？', exampleReading: 'あのひとをしっていますか？', exampleMeaning: 'Bạn có biết người đó không?' },
      { japanese: 'わかる', reading: 'わかる', meaning: 'hiểu, biết rõ', example: '日本語がわかりますか？', exampleReading: 'にほんごがわかりますか？', exampleMeaning: 'Bạn có hiểu tiếng Nhật không?' },
      { japanese: '必要', reading: 'ひつよう', meaning: 'cần thiết', example: 'お金が必要です。', exampleReading: 'おかねがひつようです。', exampleMeaning: 'Cần có tiền.' },
      { japanese: '電話番号', reading: 'でんわばんごう', meaning: 'số điện thoại', example: '電話番号を知っていますか？', exampleReading: 'でんわばんごうをしっていますか？', exampleMeaning: 'Bạn có biết số điện thoại không?' },
      { japanese: '住所', reading: 'じゅうしょ', meaning: 'địa chỉ', example: '住所を教えてください。', exampleReading: 'じゅうしょをおしえてください。', exampleMeaning: 'Hãy cho tôi biết địa chỉ.' },
    ],
    grammar: [
      { pattern: '～を知っています', meaning: 'biết ~ (đã biết từ trước)', usage: 'Trạng thái biết một thứ gì đó.', example: 'あの映画を知っています。', exampleReading: 'あのえいがをしっています。', exampleMeaning: 'Tôi biết bộ phim đó.' },
      { pattern: '～がわかります', meaning: '~ (tôi) hiểu được', usage: 'Khả năng hiểu, rõ ràng.', example: 'この問題がわかりません。', exampleReading: 'このもんだいがわかりません。', exampleMeaning: 'Tôi không hiểu bài toán này.' },
    ],
  },
  {
    title: 'Bài 19 — Có thể, không thể',
    description: '～ができます, 動詞の可能形.',
    vocab: [
      { japanese: 'できる', reading: 'できる', meaning: 'có thể, được', example: '日本語が少しできます。', exampleReading: 'にほんごがすこしできます。', exampleMeaning: 'Tôi biết một chút tiếng Nhật.' },
      { japanese: '泳ぐ', reading: 'およぐ', meaning: 'bơi', example: '速く泳げません。', exampleReading: 'はやくおよげません。', exampleMeaning: 'Tôi không thể bơi nhanh.' },
      { japanese: '運転する', reading: 'うんてんする', meaning: 'lái xe', example: '車が運転できます。', exampleReading: 'くるまがうんてんできます。', exampleMeaning: 'Tôi có thể lái xe.' },
      { japanese: '料理', reading: 'りょうり', meaning: 'nấu ăn, món ăn', example: '和食が作れます。', exampleReading: 'わしょくがつくれます。', exampleMeaning: 'Tôi có thể làm món Nhật.' },
      { japanese: 'ピアノ', reading: 'ピアノ', meaning: 'đàn piano', example: 'ピアノが弾けます。', exampleReading: 'ピアノがひけます。', exampleMeaning: 'Tôi có thể chơi đàn piano.' },
    ],
    grammar: [
      { pattern: 'Nができます', meaning: 'có thể N / biết N', usage: 'Diễn đạt khả năng với danh từ.', example: 'スポーツができます。', exampleReading: 'スポーツができます。', exampleMeaning: 'Tôi có thể chơi thể thao.' },
      { pattern: 'V(可能形)', meaning: 'Thể có thể của động từ', usage: 'Nhóm 1: う→える; Nhóm 2: る→られる; Nhóm 3 bất quy tắc.', example: '漢字が読めます。', exampleReading: 'かんじがよめます。', exampleMeaning: 'Tôi có thể đọc kanji.' },
    ],
  },
  {
    title: 'Bài 20 — Điều kiện, giả định',
    description: '～と, ～ば, ～たら (điều kiện).',
    vocab: [
      { japanese: '春', reading: 'はる', meaning: 'mùa xuân', example: '春になると、桜が咲きます。', exampleReading: 'はるになると、さくらがさきます。', exampleMeaning: 'Vào mùa xuân, hoa anh đào nở.' },
      { japanese: '右', reading: 'みぎ', meaning: 'bên phải', example: '右に行くと、駅が見えます。', exampleReading: 'みぎにいくと、えきがみえます。', exampleMeaning: 'Đi về bên phải thì thấy ga tàu.' },
      { japanese: '晴れ', reading: 'はれ', meaning: 'trời nắng', example: '明日晴れたら、ピクニックに行きます。', exampleReading: 'あしたはれたら、ピクニックにいきます。', exampleMeaning: 'Nếu ngày mai trời đẹp thì đi dã ngoại.' },
      { japanese: '困る', reading: 'こまる', meaning: 'gặp khó khăn', example: '雨が降ると、困ります。', exampleReading: 'あめがふると、こまります。', exampleMeaning: 'Nếu trời mưa thì bất tiện.' },
      { japanese: 'もし', reading: 'もし', meaning: 'nếu như', example: 'もし時間があれば、来てください。', exampleReading: 'もしじかんがあれば、きてください。', exampleMeaning: 'Nếu có thời gian thì hãy đến.' },
    ],
    grammar: [
      { pattern: 'V-と', meaning: 'Hễ V thì (tất nhiên, mang tính khách quan)', usage: 'Điều kiện tự nhiên, quy luật, hướng dẫn.', example: '右に曲がると、駅があります。', exampleReading: 'みぎにまがると、えきがあります。', exampleMeaning: 'Rẽ phải là thấy ga tàu.' },
      { pattern: 'V-たら', meaning: 'Khi/nếu V thì …', usage: 'Điều kiện ngẫu nhiên hoặc tương lai.', example: '家に帰ったら、電話してください。', exampleReading: 'いえにかえったら、でんわしてください。', exampleMeaning: 'Khi về đến nhà hãy gọi điện cho tôi.' },
    ],
  },
  {
    title: 'Bài 21 — Câu ghép, lý do',
    description: '～から, ～ので (lý do).',
    vocab: [
      { japanese: 'から（lý do）', reading: 'から', meaning: 'vì … cho nên …', example: '疲れたから、休みます。', exampleReading: 'つかれたから、やすみます。', exampleMeaning: 'Vì mệt nên tôi nghỉ.' },
      { japanese: 'ので', reading: 'ので', meaning: 'vì … (nhẹ hơn から)', example: '雨が降っているので、出かけません。', exampleReading: 'あめがふっているので、でかけません。', exampleMeaning: 'Vì trời mưa nên không ra ngoài.' },
      { japanese: '遅れる', reading: 'おくれる', meaning: 'trễ, muộn', example: '電車が遅れたので、遅刻しました。', exampleReading: 'でんしゃがおくれたので、ちこくしました。', exampleMeaning: 'Vì tàu trễ nên tôi đi muộn.' },
      { japanese: '説明する', reading: 'せつめいする', meaning: 'giải thích', example: '先生が説明してくれました。', exampleReading: 'せんせいがせつめいしてくれました。', exampleMeaning: 'Thầy giáo đã giải thích cho tôi.' },
      { japanese: '理由', reading: 'りゆう', meaning: 'lý do', example: '理由を話してください。', exampleReading: 'りゆうをはなしてください。', exampleMeaning: 'Hãy nói lý do.' },
    ],
    grammar: [
      { pattern: '～から', meaning: 'vì ~ (lý do chủ quan)', usage: 'Nêu lý do phía trước.', example: '頭が痛いから、休みます。', exampleReading: 'あたまがいたいから、やすみます。', exampleMeaning: 'Vì đau đầu nên nghỉ.' },
      { pattern: '～ので', meaning: 'vì ~ (khách quan, lịch sự hơn)', usage: 'Mang tính khách quan, dùng trong văn viết hoặc tình huống lịch sự.', example: '体調が悪いので、早退します。', exampleReading: 'たいちょうがわるいので、そうたいします。', exampleMeaning: 'Vì sức khỏe không tốt nên về sớm.' },
    ],
  },
  {
    title: 'Bài 22 — Câu phức, dù cho',
    description: '～が (nhưng mà), ～ても (dù ~ cũng).',
    vocab: [
      { japanese: '疲れる', reading: 'つかれる', meaning: 'mệt mỏi', example: '疲れても、頑張ります。', exampleReading: 'つかれても、がんばります。', exampleMeaning: 'Dù mệt tôi vẫn cố gắng.' },
      { japanese: '頑張る', reading: 'がんばる', meaning: 'cố gắng, nỗ lực', example: '最後まで頑張りましょう。', exampleReading: 'さいごまでがんばりましょう。', exampleMeaning: 'Hãy cố gắng đến cùng.' },
      { japanese: 'でも', reading: 'でも', meaning: 'nhưng (đứng đầu câu)', example: 'でも、難しいです。', exampleReading: 'でも、むずかしいです。', exampleMeaning: 'Nhưng mà, khó quá.' },
      { japanese: '雨', reading: 'あめ', meaning: 'mưa', example: '雨が降っても、行きます。', exampleReading: 'あめがふっても、いきます。', exampleMeaning: 'Dù trời mưa cũng đi.' },
      { japanese: '難しい', reading: 'むずかしい', meaning: 'khó', example: '難しくても諦めません。', exampleReading: 'むずかしくてもあきらめません。', exampleMeaning: 'Dù khó cũng không bỏ cuộc.' },
    ],
    grammar: [
      { pattern: 'V-ても', meaning: 'dù V cũng ~', usage: 'Nhượng bộ.', example: '眠くても勉強します。', exampleReading: 'ねむくてもべんきょうします。', exampleMeaning: 'Dù buồn ngủ vẫn học.' },
      { pattern: '～が (nhưng mà)', meaning: '~ nhưng mà ~', usage: 'が nối hai mệnh đề tương phản.', example: '日本語は難しいが、面白いです。', exampleReading: 'にほんごはむずかしいが、おもしろいです。', exampleMeaning: 'Tiếng Nhật khó nhưng thú vị.' },
    ],
  },
  {
    title: 'Bài 23 — Câu tương đối',
    description: 'Mệnh đề quan hệ (động từ/tính từ bổ nghĩa cho danh từ).',
    vocab: [
      { japanese: '普通', reading: 'ふつう', meaning: 'bình thường', example: '普通の生活が好きです。', exampleReading: 'ふつうのせいかつがすきです。', exampleMeaning: 'Tôi thích cuộc sống bình thường.' },
      { japanese: '有名な', reading: 'ゆうめいな', meaning: 'nổi tiếng', example: 'これは有名な映画です。', exampleReading: 'これはゆうめいなえいがです。', exampleMeaning: 'Đây là bộ phim nổi tiếng.' },
      { japanese: '作る', reading: 'つくる', meaning: 'làm ra, chế tạo', example: '自分で作った料理が好きです。', exampleReading: 'じぶんでつくったりょうりがすきです。', exampleMeaning: 'Tôi thích đồ ăn tự làm.' },
      { japanese: '困る', reading: 'こまる', meaning: 'lo lắng, bối rối', example: '困ったときは相談してください。', exampleReading: 'こまったときはそうだんしてください。', exampleMeaning: 'Khi gặp khó khăn, hãy hỏi ý kiến.' },
      { japanese: '場所', reading: 'ばしょ', meaning: 'địa điểm, nơi', example: '住んでいる場所を教えてください。', exampleReading: 'すんでいるばしょをおしえてください。', exampleMeaning: 'Hãy nói tôi biết nơi bạn đang sống.' },
    ],
    grammar: [
      { pattern: 'V(普通形)＋N', meaning: 'N bổ nghĩa bởi mệnh đề V', usage: 'Động từ ở dạng thường đứng trước danh từ để mô tả nó.', example: '昨日会った人は田中さんです。', exampleReading: 'きのうあったひとはたなかさんです。', exampleMeaning: 'Người tôi gặp hôm qua là Tanaka.' },
      { pattern: 'adj/V(普通形)＋とき', meaning: 'khi ~', usage: 'とき chỉ thời điểm.', example: '暇なとき、本を読みます。', exampleReading: 'ひまなとき、ほんをよみます。', exampleMeaning: 'Khi rảnh tôi đọc sách.' },
    ],
  },
  {
    title: 'Bài 24 — Lời khuyên, cần thiết',
    description: '～たほうがいい, ～ないほうがいい, ～はずです.',
    vocab: [
      { japanese: '早く', reading: 'はやく', meaning: 'sớm hơn, nhanh hơn', example: '早く寝たほうがいいです。', exampleReading: 'はやくねたほうがいいです。', exampleMeaning: 'Bạn nên đi ngủ sớm hơn.' },
      { japanese: '気をつける', reading: 'きをつける', meaning: 'chú ý, cẩn thận', example: '健康に気をつけたほうがいいですよ。', exampleReading: 'けんこうにきをつけたほうがいいですよ。', exampleMeaning: 'Bạn nên chú ý sức khỏe đó.' },
      { japanese: '医者', reading: 'いしゃ', meaning: 'bác sĩ', example: '医者に行ったほうがいいです。', exampleReading: 'いしゃにいったほうがいいです。', exampleMeaning: 'Bạn nên đi khám bác sĩ.' },
      { japanese: 'はず', reading: 'はず', meaning: '(lẽ ra) phải ~, chắc là ~', example: '彼はもう来るはずです。', exampleReading: 'かれはもうくるはずです。', exampleMeaning: 'Anh ấy lẽ ra đã đến rồi.' },
      { japanese: '相談する', reading: 'そうだんする', meaning: 'tham khảo, hỏi ý kiến', example: '先生に相談したほうがいいです。', exampleReading: 'せんせいにそうだんしたほうがいいです。', exampleMeaning: 'Nên hỏi ý kiến thầy giáo.' },
    ],
    grammar: [
      { pattern: 'V-た＋ほうがいい', meaning: 'nên V', usage: 'Lời khuyên (nên làm).', example: 'もっと寝たほうがいいです。', exampleReading: 'もっとねたほうがいいです。', exampleMeaning: 'Bạn nên ngủ nhiều hơn.' },
      { pattern: 'V-ない＋ほうがいい', meaning: 'không nên V', usage: 'Khuyên không làm gì.', example: '夜遅く食べないほうがいいです。', exampleReading: 'よるおそくたべないほうがいいです。', exampleMeaning: 'Không nên ăn quá khuya.' },
    ],
  },
  {
    title: 'Bài 25 — Dự định, ý định',
    description: '～つもりです, ～予定です, ～と思っています.',
    vocab: [
      { japanese: 'つもり', reading: 'つもり', meaning: 'có ý định, dự định', example: '来年、日本に行くつもりです。', exampleReading: 'らいねん、にほんにいくつもりです。', exampleMeaning: 'Tôi có dự định đến Nhật năm sau.' },
      { japanese: '予定', reading: 'よてい', meaning: 'kế hoạch, lịch trình', example: '3時に会議の予定があります。', exampleReading: 'さんじにかいぎのよていがあります。', exampleMeaning: 'Tôi có kế hoạch họp lúc 3 giờ.' },
      { japanese: '卒業する', reading: 'そつぎょうする', meaning: 'tốt nghiệp', example: '来春、大学を卒業する予定です。', exampleReading: 'らいしゅん、だいがくをそつぎょうするよていです。', exampleMeaning: 'Tôi dự kiến tốt nghiệp đại học vào mùa xuân tới.' },
      { japanese: '就職する', reading: 'しゅうしょくする', meaning: 'đi làm, xin việc', example: '東京で就職するつもりです。', exampleReading: 'とうきょうでしゅうしょくするつもりです。', exampleMeaning: 'Tôi có ý định đi làm ở Tokyo.' },
      { japanese: '計画', reading: 'けいかく', meaning: 'kế hoạch', example: 'もう計画が決まりましたか？', exampleReading: 'もうけいかくがきまりましたか？', exampleMeaning: 'Kế hoạch đã xong chưa?' },
    ],
    grammar: [
      { pattern: 'V(辞書形)＋つもりです', meaning: 'có ý định V', usage: 'Diễn đạt dự định/ý định của người nói.', example: '大学院に進むつもりです。', exampleReading: 'だいがくいんにすすむつもりです。', exampleMeaning: 'Tôi có dự định lên cao học.' },
      { pattern: '～と思っています', meaning: 'tôi đang nghĩ rằng ~', usage: 'Mơ ước hoặc suy nghĩ đang tiến hành.', example: '将来、教師になりたいと思っています。', exampleReading: 'しょうらい、きょうしになりたいとおもっています。', exampleMeaning: 'Tôi đang nghĩ muốn trở thành giáo viên trong tương lai.' },
    ],
  },
];

// ─── Seed helper ─────────────────────────────────────────────────────────────

async function seedLevel(
  levelCode: string,
  lessons: Lesson[],
  textbookLabel: string,
) {
  const level = await prisma.level.findUnique({ where: { code: levelCode } });
  if (!level) {
    console.error(`Level ${levelCode} not found. Run base seed first.`);
    return;
  }

  // Upsert vocab category
  const vocabCat = await prisma.learningCategory.upsert({
    where: { id: `minna-${levelCode.toLowerCase()}-vocab` },
    create: {
      id: `minna-${levelCode.toLowerCase()}-vocab`,
      levelId: level.id,
      skill: 'vocab',
      name: `Từ vựng ${levelCode} — ${textbookLabel}`,
      description: `Từ vựng ${levelCode} theo giáo trình ${textbookLabel}.`,
      icon: '📖',
      order: 1,
    },
    update: {
      name: `Từ vựng ${levelCode} — ${textbookLabel}`,
      description: `Từ vựng ${levelCode} theo giáo trình ${textbookLabel}.`,
    },
  });

  // Upsert grammar category
  const grammarCat = await prisma.learningCategory.upsert({
    where: { id: `minna-${levelCode.toLowerCase()}-grammar` },
    create: {
      id: `minna-${levelCode.toLowerCase()}-grammar`,
      levelId: level.id,
      skill: 'grammar',
      name: `Ngữ pháp ${levelCode} — ${textbookLabel}`,
      description: `Ngữ pháp ${levelCode} theo giáo trình ${textbookLabel}.`,
      icon: '📐',
      order: 2,
    },
    update: {
      name: `Ngữ pháp ${levelCode} — ${textbookLabel}`,
      description: `Ngữ pháp ${levelCode} theo giáo trình ${textbookLabel}.`,
    },
  });

  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    const lessonOrder = i + 1;

    // Vocab lesson
    if (lesson.vocab.length > 0) {
      const vocabLessonId = `ml-${levelCode.toLowerCase()}-v-${lessonOrder}`;
      await prisma.learningLesson.upsert({
        where: { id: vocabLessonId },
        create: {
          id: vocabLessonId,
          categoryId: vocabCat.id,
          title: lesson.title,
          description: lesson.description,
          type: 'vocab',
          order: lessonOrder,
        },
        update: {
          title: lesson.title,
          description: lesson.description,
        },
      });

      // Delete existing items then recreate
      await prisma.learningItem.deleteMany({ where: { lessonId: vocabLessonId } });
      await prisma.learningItem.createMany({
        data: lesson.vocab.map((w, idx) => ({
          lessonId: vocabLessonId,
          type: 'vocab',
          japanese: w.japanese,
          reading: w.reading,
          meaning: w.meaning,
          example: w.example ?? null,
          exampleReading: w.exampleReading ?? null,
          exampleMeaning: w.exampleMeaning ?? null,
          order: idx + 1,
        })),
      });
    }

    // Grammar lesson
    if (lesson.grammar.length > 0) {
      const grammarLessonId = `ml-${levelCode.toLowerCase()}-g-${lessonOrder}`;
      await prisma.learningLesson.upsert({
        where: { id: grammarLessonId },
        create: {
          id: grammarLessonId,
          categoryId: grammarCat.id,
          title: lesson.title,
          description: lesson.description,
          type: 'grammar',
          order: lessonOrder,
        },
        update: {
          title: lesson.title,
          description: lesson.description,
        },
      });

      await prisma.learningItem.deleteMany({ where: { lessonId: grammarLessonId } });
      await prisma.learningItem.createMany({
        data: lesson.grammar.map((g, idx) => ({
          lessonId: grammarLessonId,
          type: 'grammar',
          japanese: g.pattern,
          reading: null,
          meaning: g.meaning,
          example: g.example ?? null,
          exampleReading: g.exampleReading ?? null,
          exampleMeaning: g.exampleMeaning ?? null,
          order: idx + 1,
        })),
      });
    }

    process.stdout.write(`  ${levelCode} Bài ${lessonOrder}/${lessons.length} ✓\r`);
  }
  console.log(`\n✅ ${levelCode}: ${lessons.length} bài (vocab + grammar) seeded.`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌸 Seeding Minna no Nihongo N5 (Bài 1~25)...');
  await seedLevel('N5', MINNA_N5, 'Minna no Nihongo I');

  // N4: reuse same lesson titles but lighter vocab (could expand later)
  const MINNA_N4: Lesson[] = MINNA_N5.map((l, i) => ({
    title: `Bài ${26 + i} — ${l.title.split('—')[1]?.trim() ?? l.title}`,
    description: l.description,
    vocab: l.vocab.slice(0, 3), // placeholder until full N4 data added
    grammar: l.grammar,
  }));

  console.log('🌸 Seeding Minna no Nihongo N4 (Bài 26~50)...');
  await seedLevel('N4', MINNA_N4, 'Minna no Nihongo II');
}

main()
  .then(() => { console.log('🎉 Done!'); process.exit(0); })
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
