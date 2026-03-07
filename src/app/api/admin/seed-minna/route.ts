/**
 * POST /api/admin/seed-minna
 * Seeds Minna no Nihongo N5 (Bài 1~25) and N4 (Bài 26~50) vocab + grammar
 * into LearningCategory (skill='vocab'|'grammar') → LearningLesson → LearningItem.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

type WordRow = { japanese: string; reading: string; meaning: string; example?: string; exampleReading?: string; exampleMeaning?: string };
type GrammarRow = { pattern: string; meaning: string; usage: string; example?: string; exampleReading?: string; exampleMeaning?: string };
type Lesson = { title: string; description?: string; vocab: WordRow[]; grammar: GrammarRow[] };

const MINNA_N5: Lesson[] = [
  { title: 'Bài 1 — Giới thiệu bản thân', description: 'AはBです, đại từ nhân xưng, nghề nghiệp.',
    vocab: [
      { japanese: '私', reading: 'わたし', meaning: 'tôi', example: '私はマリアです。', exampleReading: 'わたしはマリアです。', exampleMeaning: 'Tôi là Maria.' },
      { japanese: '先生', reading: 'せんせい', meaning: 'giáo viên', example: '先生はやさしいです。', exampleReading: 'せんせいはやさしいです。', exampleMeaning: 'Giáo viên thật thân thiện.' },
      { japanese: '学生', reading: 'がくせい', meaning: 'học sinh', example: '私は学生です。', exampleReading: 'わたしはがくせいです。', exampleMeaning: 'Tôi là học sinh.' },
      { japanese: '会社員', reading: 'かいしゃいん', meaning: 'nhân viên công ty', example: '父は会社員です。', exampleReading: 'ちちはかいしゃいんです。', exampleMeaning: 'Bố là nhân viên công ty.' },
      { japanese: '人', reading: 'じん/にん', meaning: 'người', example: '日本人です。', exampleReading: 'にほんじんです。', exampleMeaning: 'Là người Nhật.' },
    ],
    grammar: [
      { pattern: 'AはBです', meaning: 'A là B', usage: 'Giới thiệu hoặc xác nhận danh tính.', example: '私は山田です。', exampleReading: 'わたしはやまだです。', exampleMeaning: 'Tôi là Yamada.' },
      { pattern: 'AはBじゃないです', meaning: 'A không phải là B', usage: 'Phủ định của ～です.', example: '私は先生じゃないです。', exampleReading: 'わたしはせんせいじゃないです。', exampleMeaning: 'Tôi không phải là giáo viên.' },
    ],
  },
  { title: 'Bài 2 — Đồ vật xung quanh', description: 'これ/それ/あれ, chỉ thị từ.',
    vocab: [
      { japanese: 'これ', reading: 'これ', meaning: 'cái này', example: 'これは本です。', exampleReading: 'これはほんです。', exampleMeaning: 'Đây là cuốn sách.' },
      { japanese: 'それ', reading: 'それ', meaning: 'cái đó', example: 'それはペンです。', exampleReading: 'それはペンです。', exampleMeaning: 'Cái đó là cái bút.' },
      { japanese: 'あれ', reading: 'あれ', meaning: 'cái kia', example: 'あれは何ですか？', exampleReading: 'あれはなんですか？', exampleMeaning: 'Cái kia là gì?' },
      { japanese: 'この', reading: 'この', meaning: 'cái…này', example: 'この本はおもしろいです。', exampleReading: 'このほんはおもしろいです。', exampleMeaning: 'Cuốn sách này hay.' },
      { japanese: '何', reading: 'なん/なに', meaning: 'cái gì', example: '何ですか？', exampleReading: 'なんですか？', exampleMeaning: 'Cái gì vậy?' },
    ],
    grammar: [
      { pattern: 'これ/それ/あれはNですか', meaning: 'Đây/đó/kia có phải là N không?', usage: 'Câu hỏi xác nhận vật thể.', example: 'これはかばんですか？', exampleReading: 'これはかばんですか？', exampleMeaning: 'Đây có phải là túi không?' },
      { pattern: 'N1のN2', meaning: 'N2 của N1', usage: 'Sở hữu hoặc thuộc tính.', example: '私の本です。', exampleReading: 'わたしのほんです。', exampleMeaning: 'Sách của tôi.' },
    ],
  },
  { title: 'Bài 3 — Ở đâu', description: 'ここ/そこ/あそこ, chỉ vị trí.',
    vocab: [
      { japanese: 'ここ', reading: 'ここ', meaning: 'ở đây', example: 'ここは図書館です。', exampleReading: 'ここはとしょかんです。', exampleMeaning: 'Đây là thư viện.' },
      { japanese: 'そこ', reading: 'そこ', meaning: 'ở đó', example: 'そこにあります。', exampleReading: 'そこにあります。', exampleMeaning: 'Ở chỗ đó.' },
      { japanese: 'あそこ', reading: 'あそこ', meaning: 'chỗ kia', example: 'あそこはトイレです。', exampleReading: 'あそこはトイレです。', exampleMeaning: 'Chỗ kia là nhà vệ sinh.' },
      { japanese: '国', reading: 'くに', meaning: 'đất nước', example: 'あなたの国はどこですか？', exampleReading: 'あなたのくにはどこですか？', exampleMeaning: 'Đất nước của bạn là đâu?' },
      { japanese: '会社', reading: 'かいしゃ', meaning: 'công ty', example: '会社はどこですか？', exampleReading: 'かいしゃはどこですか？', exampleMeaning: 'Công ty ở đâu?' },
    ],
    grammar: [
      { pattern: '～はどこですか', meaning: '～ ở đâu?', usage: 'Hỏi vị trí.', example: 'トイレはどこですか？', exampleReading: 'トイレはどこですか？', exampleMeaning: 'Nhà vệ sinh ở đâu?' },
    ],
  },
  { title: 'Bài 4 — Thời gian & giờ giấc', description: 'Cách đọc giờ, phút; từ chỉ thời gian.',
    vocab: [
      { japanese: '時', reading: 'じ', meaning: 'giờ', example: 'いま何時ですか？', exampleReading: 'いまなんじですか？', exampleMeaning: 'Bây giờ là mấy giờ?' },
      { japanese: '分', reading: 'ふん/ぷん', meaning: 'phút', example: '3時15分です。', exampleReading: 'さんじじゅうごふんです。', exampleMeaning: '3 giờ 15 phút.' },
      { japanese: '今', reading: 'いま', meaning: 'bây giờ', example: '今、8時です。', exampleReading: 'いまはちじです。', exampleMeaning: 'Bây giờ là 8 giờ.' },
      { japanese: '午前', reading: 'ごぜん', meaning: 'buổi sáng (AM)', example: '午前9時に起きます。', exampleReading: 'ごぜんくじにおきます。', exampleMeaning: 'Thức dậy lúc 9 giờ sáng.' },
      { japanese: '午後', reading: 'ごご', meaning: 'buổi chiều (PM)', example: '午後3時に来てください。', exampleReading: 'ごごさんじにきてください。', exampleMeaning: 'Hãy đến lúc 3 giờ chiều.' },
    ],
    grammar: [
      { pattern: 'Nに～ます', meaning: 'Động từ xảy ra vào thời điểm N', usage: '「に」chỉ thời điểm cụ thể.', example: '7時に起きます。', exampleReading: 'しちじにおきます。', exampleMeaning: 'Thức dậy lúc 7 giờ.' },
      { pattern: 'から～まで', meaning: 'từ … đến …', usage: 'Khoảng thời gian.', example: '9時から5時まで働きます。', exampleReading: 'くじからごじまではたらきます。', exampleMeaning: 'Làm từ 9 đến 5 giờ.' },
    ],
  },
  { title: 'Bài 5 — Đi lại, mua sắm', description: '～に行きます/来ます/帰ります.',
    vocab: [
      { japanese: '行く', reading: 'いく', meaning: 'đi', example: '学校に行きます。', exampleReading: 'がっこうにいきます。', exampleMeaning: 'Đến trường.' },
      { japanese: '来る', reading: 'くる', meaning: 'đến, tới', example: '友達が来ます。', exampleReading: 'ともだちがきます。', exampleMeaning: 'Bạn đến.' },
      { japanese: '帰る', reading: 'かえる', meaning: 'về nhà', example: '6時に帰ります。', exampleReading: 'ろくじにかえります。', exampleMeaning: '6 giờ về nhà.' },
      { japanese: '誰', reading: 'だれ', meaning: 'ai', example: '誰と行きますか？', exampleReading: 'だれといきますか？', exampleMeaning: 'Đi với ai?' },
      { japanese: 'バス', reading: 'バス', meaning: 'xe buýt', example: 'バスで行きます。', exampleReading: 'バスでいきます。', exampleMeaning: 'Đi bằng xe buýt.' },
    ],
    grammar: [
      { pattern: '～に行きます', meaning: 'đi đến ~ (điểm đến)', usage: '「に」chỉ điểm đến.', example: 'デパートに行きます。', exampleReading: 'デパートにいきます。', exampleMeaning: 'Đi đến trung tâm thương mại.' },
      { pattern: '～で行きます', meaning: 'đi bằng phương tiện ~', usage: '「で」chỉ phương tiện.', example: '電車で行きます。', exampleReading: 'でんしゃでいきます。', exampleMeaning: 'Đi bằng tàu điện.' },
    ],
  },
  { title: 'Bài 6 — Ăn uống', description: 'Động từ nhóm 2, mời ăn.',
    vocab: [
      { japanese: '食べる', reading: 'たべる', meaning: 'ăn', example: '昼ごはんを食べます。', exampleReading: 'ひるごはんをたべます。', exampleMeaning: 'Ăn trưa.' },
      { japanese: '飲む', reading: 'のむ', meaning: 'uống', example: 'コーヒーを飲みます。', exampleReading: 'コーヒーをのみます。', exampleMeaning: 'Uống cà phê.' },
      { japanese: 'おいしい', reading: 'おいしい', meaning: 'ngon', example: 'このりんごはおいしい。', exampleReading: 'このりんごはおいしい。', exampleMeaning: 'Quả táo này ngon.' },
      { japanese: 'レストラン', reading: 'レストラン', meaning: 'nhà hàng', example: 'レストランで食べます。', exampleReading: 'レストランでたべます。', exampleMeaning: 'Ăn ở nhà hàng.' },
      { japanese: 'いっしょに', reading: 'いっしょに', meaning: 'cùng nhau', example: 'いっしょに食べましょう。', exampleReading: 'いっしょにたべましょう。', exampleMeaning: 'Cùng ăn nhé.' },
    ],
    grammar: [
      { pattern: '～ませんか', meaning: 'Mình cùng … không? (mời)', usage: 'Lịch sự mời.', example: 'いっしょに食べませんか？', exampleReading: 'いっしょにたべませんか？', exampleMeaning: 'Chúng ta cùng ăn không?' },
      { pattern: '～ましょう', meaning: 'Hãy … nào', usage: 'Đề xuất hành động cùng nhau.', example: '行きましょう。', exampleReading: 'いきましょう。', exampleMeaning: 'Đi thôi!' },
    ],
  },
  { title: 'Bài 7 — Địa điểm & tồn tại', description: '～があります/います.',
    vocab: [
      { japanese: 'ある', reading: 'ある', meaning: 'có (vật vô sinh)', example: '駅の前に本屋があります。', exampleReading: 'えきのまえにほんやがあります。', exampleMeaning: 'Trước ga có hiệu sách.' },
      { japanese: 'いる', reading: 'いる', meaning: 'có (người/động vật)', example: '公園に子どもがいます。', exampleReading: 'こうえんにこどもがいます。', exampleMeaning: 'Công viên có trẻ em.' },
      { japanese: '前', reading: 'まえ', meaning: 'phía trước', example: '駅の前で待ちます。', exampleReading: 'えきのまえでまちます。', exampleMeaning: 'Đợi trước ga.' },
      { japanese: '後ろ', reading: 'うしろ', meaning: 'phía sau', example: '後ろに誰かいます。', exampleReading: 'うしろにだれかいます。', exampleMeaning: 'Phía sau có ai đó.' },
      { japanese: '中', reading: 'なか', meaning: 'bên trong', example: 'かばんの中に財布があります。', exampleReading: 'かばんのなかにさいふがあります。', exampleMeaning: 'Trong túi có ví.' },
    ],
    grammar: [
      { pattern: 'Nがあります/います', meaning: 'Có N (tồn tại)', usage: 'あります cho vật; います cho người/sinh vật.', example: '公園の前に花屋があります。', exampleReading: 'こうえんのまえにはなやがあります。', exampleMeaning: 'Trước công viên có tiệm hoa.' },
    ],
  },
  { title: 'Bài 8 — Hình dạng, số lượng', description: 'Đếm vật, trợ số từ.',
    vocab: [
      { japanese: '一つ', reading: 'ひとつ', meaning: 'một cái', example: 'リンゴを一つください。', exampleReading: 'りんごをひとつください。', exampleMeaning: 'Cho tôi một quả táo.' },
      { japanese: 'いくつ', reading: 'いくつ', meaning: 'bao nhiêu cái', example: 'りんごはいくつありますか？', exampleReading: 'りんごはいくつありますか？', exampleMeaning: 'Có bao nhiêu quả táo?' },
      { japanese: '全部', reading: 'ぜんぶ', meaning: 'tất cả', example: '全部でいくらですか？', exampleReading: 'ぜんぶでいくらですか？', exampleMeaning: 'Tất cả bao nhiêu?' },
      { japanese: 'いくら', reading: 'いくら', meaning: 'bao nhiêu tiền', example: 'このケーキはいくらですか？', exampleReading: 'このケーキはいくらですか？', exampleMeaning: 'Bánh này bao nhiêu?' },
      { japanese: '円', reading: 'えん', meaning: 'yên Nhật', example: '300円です。', exampleReading: 'さんびゃくえんです。', exampleMeaning: '300 yên.' },
    ],
    grammar: [
      { pattern: 'Nをください', meaning: 'Cho tôi N', usage: 'Mua hàng hoặc xin.', example: 'このケーキを一つください。', exampleReading: 'このケーキをひとつください。', exampleMeaning: 'Cho tôi một cái bánh.' },
    ],
  },
  { title: 'Bài 9 — Tính từ い', description: 'Tính từ i, phủ định và quá khứ.',
    vocab: [
      { japanese: '大きい', reading: 'おおきい', meaning: 'to, lớn', example: '大きいかばんです。', exampleReading: 'おおきいかばんです。', exampleMeaning: 'Cái túi to.' },
      { japanese: '小さい', reading: 'ちいさい', meaning: 'nhỏ, bé', example: '小さい犬がいます。', exampleReading: 'ちいさいいぬがいます。', exampleMeaning: 'Có con chó nhỏ.' },
      { japanese: '良い/いい', reading: 'いい', meaning: 'tốt, hay', example: 'いい天気ですね。', exampleReading: 'いいてんきですね。', exampleMeaning: 'Thời tiết tốt nhỉ.' },
      { japanese: '高い', reading: 'たかい', meaning: 'cao; đắt', example: 'このレストランは高いです。', exampleReading: 'このレストランはたかいです。', exampleMeaning: 'Nhà hàng này đắt.' },
      { japanese: '安い', reading: 'やすい', meaning: 'rẻ', example: 'このお店は安いです。', exampleReading: 'このおみせはやすいです。', exampleMeaning: 'Cửa hàng này rẻ.' },
    ],
    grammar: [
      { pattern: 'い-adj → ～くないです', meaning: 'không ~ (phủ định)', usage: 'Bỏ い, thêm くないです.', example: '高くないです。', exampleReading: 'たかくないです。', exampleMeaning: 'Không đắt.' },
      { pattern: 'い-adj → ～かったです', meaning: '~ (quá khứ)', usage: 'Bỏ い, thêm かったです.', example: '楽しかったです。', exampleReading: 'たのしかったです。', exampleMeaning: 'Đã vui.' },
    ],
  },
  { title: 'Bài 10 — Tính từ な', description: 'Tính từ na, đặc điểm.',
    vocab: [
      { japanese: '好き', reading: 'すき', meaning: 'thích', example: '日本語が好きです。', exampleReading: 'にほんごがすきです。', exampleMeaning: 'Thích tiếng Nhật.' },
      { japanese: '嫌い', reading: 'きらい', meaning: 'không thích', example: 'ピーマンが嫌いです。', exampleReading: 'ピーマンがきらいです。', exampleMeaning: 'Không thích ớt chuông.' },
      { japanese: '上手', reading: 'じょうず', meaning: 'giỏi, khéo', example: '料理が上手です。', exampleReading: 'りょうりがじょうずです。', exampleMeaning: 'Nấu ăn giỏi.' },
      { japanese: '有名', reading: 'ゆうめい', meaning: 'nổi tiếng', example: '富士山は有名です。', exampleReading: 'ふじさんはゆうめいです。', exampleMeaning: 'Núi Fuji nổi tiếng.' },
      { japanese: '静か', reading: 'しずか', meaning: 'yên tĩnh', example: '図書館は静かです。', exampleReading: 'としょかんはしずかです。', exampleMeaning: 'Thư viện yên tĩnh.' },
    ],
    grammar: [
      { pattern: 'な-adj＋な＋N', meaning: 'Na-adj trước danh từ dùng な', usage: 'Khi đứng trước danh từ phải thêm な.', example: 'きれいな花です。', exampleReading: 'きれいなはなです。', exampleMeaning: 'Là bông hoa đẹp.' },
      { pattern: 'NがすきですN', meaning: 'thích N', usage: '「が」chỉ đối tượng cảm xúc.', example: '音楽が好きです。', exampleReading: 'おんがくがすきです。', exampleMeaning: 'Thích âm nhạc.' },
    ],
  },
  { title: 'Bài 11 — Ước muốn, đề nghị', description: '～たいです, ～てください.',
    vocab: [
      { japanese: '旅行', reading: 'りょこう', meaning: 'du lịch', example: '日本に旅行したいです。', exampleReading: 'にほんにりょこうしたいです。', exampleMeaning: 'Muốn du lịch Nhật.' },
      { japanese: '買い物', reading: 'かいもの', meaning: 'mua sắm', example: 'デパートで買い物をします。', exampleReading: 'デパートでかいものをします。', exampleMeaning: 'Mua sắm ở TTTM.' },
      { japanese: '休み', reading: 'やすみ', meaning: 'ngày nghỉ', example: '休みに旅行します。', exampleReading: 'やすみにりょこうします。', exampleMeaning: 'Du lịch ngày nghỉ.' },
      { japanese: '映画', reading: 'えいが', meaning: 'phim điện ảnh', example: '映画が見たいです。', exampleReading: 'えいながみたいです。', exampleMeaning: 'Muốn xem phim.' },
      { japanese: 'ゆっくり', reading: 'ゆっくり', meaning: 'từ từ, chậm', example: 'ゆっくり話してください。', exampleReading: 'ゆっくりはなしてください。', exampleMeaning: 'Hãy nói chậm thôi.' },
    ],
    grammar: [
      { pattern: '～たいです', meaning: 'muốn làm ~', usage: 'Gắn たい vào masu-stem.', example: '日本語を話したいです。', exampleReading: 'にほんごをはなしたいです。', exampleMeaning: 'Muốn nói tiếng Nhật.' },
      { pattern: '～てください', meaning: 'Hãy làm ~ (yêu cầu lịch sự)', usage: 'Dạng て + ください.', example: 'ゆっくり話してください。', exampleReading: 'ゆっくりはなしてください。', exampleMeaning: 'Hãy nói chậm thôi.' },
    ],
  },
  { title: 'Bài 12 — Tần suất', description: 'よく/ときどき/あまり/ぜんぜん.',
    vocab: [
      { japanese: 'よく', reading: 'よく', meaning: 'thường, hay', example: 'よくテレビを見ます。', exampleReading: 'よくテレビをみます。', exampleMeaning: 'Thường xem TV.' },
      { japanese: 'ときどき', reading: 'ときどき', meaning: 'thỉnh thoảng', example: 'ときどき料理をします。', exampleReading: 'ときどきりょうりをします。', exampleMeaning: 'Thỉnh thoảng nấu ăn.' },
      { japanese: 'あまり～ない', reading: 'あまり', meaning: 'không mấy', example: 'あまり肉を食べません。', exampleReading: 'あまりにくをたべません。', exampleMeaning: 'Không ăn thịt mấy.' },
      { japanese: 'ぜんぜん～ない', reading: 'ぜんぜん', meaning: 'hoàn toàn không', example: 'ぜんぜん眠れません。', exampleReading: 'ぜんぜんねむれません。', exampleMeaning: 'Không ngủ được chút nào.' },
      { japanese: 'どんな', reading: 'どんな', meaning: 'loại…nào', example: 'どんな音楽が好きですか？', exampleReading: 'どんなおんがくがすきですか？', exampleMeaning: 'Bạn thích loại nhạc nào?' },
    ],
    grammar: [
      { pattern: 'あまり＋～ません', meaning: 'không ~ nhiều lắm', usage: 'あまり dùng với phủ định.', example: 'あまり映画を見ません。', exampleReading: 'あまりえいがをみません。', exampleMeaning: 'Không xem phim nhiều lắm.' },
      { pattern: 'ぜんぜん＋～ません', meaning: 'hoàn toàn không ~', usage: 'Nhấn mạnh phủ định hoàn toàn.', example: 'ぜんぜんわかりません。', exampleReading: 'ぜんぜんわかりません。', exampleMeaning: 'Hoàn toàn không hiểu.' },
    ],
  },
  { title: 'Bài 13 — Đang làm gì, trạng thái', description: '～ています.',
    vocab: [
      { japanese: '結婚する', reading: 'けっこんする', meaning: 'kết hôn', example: '彼は結婚していません。', exampleReading: 'かれはけっこんしていません。', exampleMeaning: 'Anh ấy chưa kết hôn.' },
      { japanese: '住む', reading: 'すむ', meaning: 'cư trú, ở', example: '東京に住んでいます。', exampleReading: 'とうきょうにすんでいます。', exampleMeaning: 'Sống ở Tokyo.' },
      { japanese: '働く', reading: 'はたらく', meaning: 'làm việc', example: 'どこで働いていますか？', exampleReading: 'どこではたらいていますか？', exampleMeaning: 'Bạn làm việc ở đâu?' },
      { japanese: '着る', reading: 'きる', meaning: 'mặc', example: '白いシャツを着ています。', exampleReading: 'しろいシャツをきています。', exampleMeaning: 'Đang mặc áo trắng.' },
      { japanese: '窓', reading: 'まど', meaning: 'cửa sổ', example: '窓が開いています。', exampleReading: 'まどがあいています。', exampleMeaning: 'Cửa sổ đang mở.' },
    ],
    grammar: [
      { pattern: 'V-て＋います（tiếp diễn）', meaning: '(đang V)', usage: 'Hành động đang diễn ra.', example: '本を読んでいます。', exampleReading: 'ほんをよんでいます。', exampleMeaning: 'Đang đọc sách.' },
      { pattern: 'V-て＋います（kết quả）', meaning: '(trạng thái sau V)', usage: 'Trạng thái là kết quả hành động trước.', example: '窓が開いています。', exampleReading: 'まどがあいています。', exampleMeaning: 'Cửa sổ đang mở (ai đó đã mở).' },
    ],
  },
  { title: 'Bài 14 — Kinh nghiệm, xin phép', description: '～たことがあります, ～てもいいですか.',
    vocab: [
      { japanese: '登る', reading: 'のぼる', meaning: 'leo, trèo', example: '山に登ります。', exampleReading: 'やまにのぼります。', exampleMeaning: 'Leo núi.' },
      { japanese: '経験', reading: 'けいけん', meaning: 'kinh nghiệm', example: '海外の経験があります。', exampleReading: 'かいがいのけいけんがあります。', exampleMeaning: 'Có kinh nghiệm ở nước ngoài.' },
      { japanese: '使う', reading: 'つかう', meaning: 'sử dụng', example: 'この機械を使ったことがあります。', exampleReading: 'このきかいをつかったことがあります。', exampleMeaning: 'Đã từng dùng máy này.' },
      { japanese: '座る', reading: 'すわる', meaning: 'ngồi', example: 'ここに座ってもいいですか？', exampleReading: 'ここにすわってもいいですか？', exampleMeaning: 'Tôi có thể ngồi đây không?' },
      { japanese: '写真', reading: 'しゃしん', meaning: 'ảnh, chụp ảnh', example: '写真を撮ってもいいですか？', exampleReading: 'しゃしんをとってもいいですか？', exampleMeaning: 'Tôi có thể chụp ảnh không?' },
    ],
    grammar: [
      { pattern: 'V-た＋ことがあります', meaning: 'đã từng V (kinh nghiệm)', usage: 'Kinh nghiệm trong quá khứ.', example: '日本料理を食べたことがあります。', exampleReading: 'にほんりょうりをたべたことがあります。', exampleMeaning: 'Đã từng ăn món Nhật.' },
      { pattern: 'V-て＋もいいですか', meaning: 'Tôi có thể V không?', usage: 'Xin phép làm việc gì.', example: 'ここに座ってもいいですか？', exampleReading: 'ここにすわってもいいですか？', exampleMeaning: 'Tôi có thể ngồi đây không?' },
    ],
  },
  { title: 'Bài 15 — Phải làm; không được', description: '～なければなりません, ～てはいけません.',
    vocab: [
      { japanese: '薬', reading: 'くすり', meaning: 'thuốc', example: '薬を飲まなければなりません。', exampleReading: 'くすりをのまなければなりません。', exampleMeaning: 'Phải uống thuốc.' },
      { japanese: '規則', reading: 'きそく', meaning: 'quy tắc', example: '規則を守らなければなりません。', exampleReading: 'きそくをまもらなければなりません。', exampleMeaning: 'Phải tuân thủ quy tắc.' },
      { japanese: '守る', reading: 'まもる', meaning: 'tuân thủ, bảo vệ', example: '約束を守ります。', exampleReading: 'やくそくをまもります。', exampleMeaning: 'Giữ lời hứa.' },
      { japanese: '静かにする', reading: 'しずかにする', meaning: 'giữ yên lặng', example: '図書館では静かにしなければなりません。', exampleReading: 'としょかんではしずかにしなければなりません。', exampleMeaning: 'Phải yên lặng trong thư viện.' },
      { japanese: 'タバコ', reading: 'タバコ', meaning: 'thuốc lá', example: 'ここでタバコを吸ってはいけません。', exampleReading: 'ここでタバコをすってはいけません。', exampleMeaning: 'Không được hút thuốc ở đây.' },
    ],
    grammar: [
      { pattern: 'V(ない形)＋なければなりません', meaning: 'phải V', usage: 'Nghĩa vụ, bắt buộc.', example: '毎日運動しなければなりません。', exampleReading: 'まいにちうんどうしなければなりません。', exampleMeaning: 'Phải tập thể dục mỗi ngày.' },
      { pattern: 'V-て＋はいけません', meaning: 'không được V', usage: 'Cấm đoán.', example: 'ここでタバコを吸ってはいけません。', exampleReading: 'ここでタバコをすってはいけません。', exampleMeaning: 'Không được hút thuốc ở đây.' },
    ],
  },
  { title: 'Bài 16 — Hỏi đường, hướng dẫn', description: 'Chỉ đường, từ chỉ hướng.',
    vocab: [
      { japanese: '右', reading: 'みぎ', meaning: 'bên phải', example: '右に曲がってください。', exampleReading: 'みぎにまがってください。', exampleMeaning: 'Hãy rẽ phải.' },
      { japanese: '左', reading: 'ひだり', meaning: 'bên trái', example: '左に曲がります。', exampleReading: 'ひだりにまがります。', exampleMeaning: 'Rẽ trái.' },
      { japanese: 'まっすぐ', reading: 'まっすぐ', meaning: 'thẳng', example: 'まっすぐ行ってください。', exampleReading: 'まっすぐいってください。', exampleMeaning: 'Đi thẳng.' },
      { japanese: '渡る', reading: 'わたる', meaning: 'băng qua', example: '横断歩道を渡ってください。', exampleReading: 'おうだんほどうをわたってください。', exampleMeaning: 'Băng qua vạch sang đường.' },
      { japanese: '信号', reading: 'しんごう', meaning: 'đèn giao thông', example: '信号を渡ったら、左に曲がります。', exampleReading: 'しんごうをわたったら、ひだりにまがります。', exampleMeaning: 'Qua đèn thì rẽ trái.' },
    ],
    grammar: [
      { pattern: 'V-てから', meaning: 'sau khi V thì …', usage: 'Thứ tự hành động.', example: '右に曲がってから、まっすぐ行きます。', exampleReading: 'みぎにまがってから、まっすぐいきます。', exampleMeaning: 'Sau khi rẽ phải rồi đi thẳng.' },
      { pattern: '～たら', meaning: 'khi/nếu ~ thì …', usage: 'Điều kiện hoặc thứ tự.', example: '家に帰ったら、電話してください。', exampleReading: 'いえにかえったら、でんわしてください。', exampleMeaning: 'Về đến nhà hãy gọi điện.' },
    ],
  },
  { title: 'Bài 17 — Cho và nhận', description: 'あげます/もらいます/くれます.',
    vocab: [
      { japanese: 'あげる', reading: 'あげる', meaning: 'cho (ai đó)', example: '友達にプレゼントをあげます。', exampleReading: 'ともだちにプレゼントをあげます。', exampleMeaning: 'Tặng quà cho bạn.' },
      { japanese: 'もらう', reading: 'もらう', meaning: 'nhận', example: '母にケーキをもらいました。', exampleReading: 'ははにケーキをもらいました。', exampleMeaning: 'Được mẹ tặng bánh.' },
      { japanese: 'くれる', reading: 'くれる', meaning: 'cho (tôi)', example: '友達が本をくれました。', exampleReading: 'ともだちがほんをくれました。', exampleMeaning: 'Bạn đã tặng tôi sách.' },
      { japanese: 'プレゼント', reading: 'プレゼント', meaning: 'quà tặng', example: '誕生日にプレゼントをもらいました。', exampleReading: 'たんじょうびにプレゼントをもらいました。', exampleMeaning: 'Được nhận quà sinh nhật.' },
      { japanese: '誕生日', reading: 'たんじょうび', meaning: 'sinh nhật', example: '今日は私の誕生日です。', exampleReading: 'きょうはわたしのたんじょうびです。', exampleMeaning: 'Hôm nay là sinh nhật tôi.' },
    ],
    grammar: [
      { pattern: 'NにNをあげます', meaning: 'cho N thứ gì đó', usage: 'Người cho → người nhận.', example: '妹に花をあげました。', exampleReading: 'いもうとにはなをあげました。', exampleMeaning: 'Tặng hoa cho em gái.' },
      { pattern: 'NにNをもらいます', meaning: 'nhận thứ gì từ N', usage: 'Góc nhìn người nhận.', example: '先生に本をもらいました。', exampleReading: 'せんせいにほんをもらいました。', exampleMeaning: 'Được thầy cho sách.' },
    ],
  },
  { title: 'Bài 18 — Biết, hiểu', description: '知っています, わかります.',
    vocab: [
      { japanese: '知る', reading: 'しる', meaning: 'biết', example: 'あの人を知っていますか？', exampleReading: 'あのひとをしっていますか？', exampleMeaning: 'Bạn biết người đó không?' },
      { japanese: 'わかる', reading: 'わかる', meaning: 'hiểu', example: '日本語がわかりますか？', exampleReading: 'にほんごがわかりますか？', exampleMeaning: 'Bạn hiểu tiếng Nhật không?' },
      { japanese: '必要', reading: 'ひつよう', meaning: 'cần thiết', example: 'お金が必要です。', exampleReading: 'おかねがひつようです。', exampleMeaning: 'Cần có tiền.' },
      { japanese: '電話番号', reading: 'でんわばんごう', meaning: 'số điện thoại', example: '電話番号を知っていますか？', exampleReading: 'でんわばんごうをしっていますか？', exampleMeaning: 'Biết số điện thoại không?' },
      { japanese: '住所', reading: 'じゅうしょ', meaning: 'địa chỉ', example: '住所を教えてください。', exampleReading: 'じゅうしょをおしえてください。', exampleMeaning: 'Cho biết địa chỉ.' },
    ],
    grammar: [
      { pattern: '～を知っています', meaning: 'biết ~ (trạng thái)', usage: 'Trạng thái đã biết.', example: 'あの映画を知っています。', exampleReading: 'あのえいがをしっています。', exampleMeaning: 'Tôi biết bộ phim đó.' },
      { pattern: '～がわかります', meaning: '(tôi) hiểu ~', usage: 'Khả năng hiểu.', example: 'この問題がわかりません。', exampleReading: 'このもんだいがわかりません。', exampleMeaning: 'Không hiểu bài toán này.' },
    ],
  },
  { title: 'Bài 19 — Có thể, không thể', description: '～ができます, thể可能.',
    vocab: [
      { japanese: 'できる', reading: 'できる', meaning: 'có thể', example: '日本語が少しできます。', exampleReading: 'にほんごがすこしできます。', exampleMeaning: 'Biết một chút tiếng Nhật.' },
      { japanese: '泳ぐ', reading: 'およぐ', meaning: 'bơi', example: '速く泳げません。', exampleReading: 'はやくおよげません。', exampleMeaning: 'Không thể bơi nhanh.' },
      { japanese: '運転する', reading: 'うんてんする', meaning: 'lái xe', example: '車が運転できます。', exampleReading: 'くるまがうんてんできます。', exampleMeaning: 'Có thể lái xe.' },
      { japanese: '料理', reading: 'りょうり', meaning: 'nấu ăn', example: '和食が作れます。', exampleReading: 'わしょくがつくれます。', exampleMeaning: 'Có thể làm món Nhật.' },
      { japanese: 'ピアノ', reading: 'ピアノ', meaning: 'đàn piano', example: 'ピアノが弾けます。', exampleReading: 'ピアノがひけます。', exampleMeaning: 'Có thể chơi piano.' },
    ],
    grammar: [
      { pattern: 'Nができます', meaning: 'có thể N / biết N', usage: 'Khả năng với danh từ.', example: 'スポーツができます。', exampleReading: 'スポーツができます。', exampleMeaning: 'Có thể chơi thể thao.' },
      { pattern: 'V(可能形)', meaning: 'Thể có thể của động từ', usage: 'Nhóm 1: う→える; Nhóm 2: る→られる.', example: '漢字が読めます。', exampleReading: 'かんじがよめます。', exampleMeaning: 'Có thể đọc kanji.' },
    ],
  },
  { title: 'Bài 20 — Điều kiện', description: '～と, ～たら (điều kiện).',
    vocab: [
      { japanese: '春', reading: 'はる', meaning: 'mùa xuân', example: '春になると、桜が咲きます。', exampleReading: 'はるになると、さくらがさきます。', exampleMeaning: 'Vào mùa xuân, hoa anh đào nở.' },
      { japanese: '晴れ', reading: 'はれ', meaning: 'trời nắng', example: '明日晴れたら、ピクニックに行きます。', exampleReading: 'あしたはれたら、ピクニックにいきます。', exampleMeaning: 'Nếu ngày mai nắng thì đi dã ngoại.' },
      { japanese: '困る', reading: 'こまる', meaning: 'gặp khó khăn', example: '雨が降ると、困ります。', exampleReading: 'あめがふると、こまります。', exampleMeaning: 'Trời mưa thì bất tiện.' },
      { japanese: 'もし', reading: 'もし', meaning: 'nếu như', example: 'もし時間があれば、来てください。', exampleReading: 'もしじかんがあれば、きてください。', exampleMeaning: 'Nếu có thời gian hãy đến.' },
      { japanese: '見える', reading: 'みえる', meaning: 'nhìn thấy', example: '右に行くと、駅が見えます。', exampleReading: 'みぎにいくと、えきがみえます。', exampleMeaning: 'Đi phải thì thấy ga tàu.' },
    ],
    grammar: [
      { pattern: 'V-と', meaning: 'Hễ V thì (tự nhiên, khách quan)', usage: 'Điều kiện tự nhiên, quy luật.', example: '右に曲がると、駅があります。', exampleReading: 'みぎにまがると、えきがあります。', exampleMeaning: 'Rẽ phải là thấy ga.' },
      { pattern: 'V-たら', meaning: 'Khi V thì …', usage: 'Điều kiện ngẫu nhiên hoặc tương lai.', example: '家に帰ったら、電話してください。', exampleReading: 'いえにかえったら、でんわしてください。', exampleMeaning: 'Về nhà hãy gọi điện.' },
    ],
  },
  { title: 'Bài 21 — Lý do', description: '～から, ～ので.',
    vocab: [
      { japanese: 'から（lý do）', reading: 'から', meaning: 'vì…nên (chủ quan)', example: '疲れたから、休みます。', exampleReading: 'つかれたから、やすみます。', exampleMeaning: 'Vì mệt nên nghỉ.' },
      { japanese: 'ので', reading: 'ので', meaning: 'vì… (nhẹ hơn から)', example: '雨が降っているので、出かけません。', exampleReading: 'あめがふっているので、でかけません。', exampleMeaning: 'Vì trời mưa nên không ra ngoài.' },
      { japanese: '遅れる', reading: 'おくれる', meaning: 'trễ, muộn', example: '遅刻しました。', exampleReading: 'ちこくしました。', exampleMeaning: 'Tôi đã đi muộn.' },
      { japanese: '説明する', reading: 'せつめいする', meaning: 'giải thích', example: '先生が説明してくれました。', exampleReading: 'せんせいがせつめいしてくれました。', exampleMeaning: 'Thầy giải thích cho tôi.' },
      { japanese: '理由', reading: 'りゆう', meaning: 'lý do', example: '理由を話してください。', exampleReading: 'りゆうをはなしてください。', exampleMeaning: 'Hãy nói lý do.' },
    ],
    grammar: [
      { pattern: '～から', meaning: 'vì ~ (lý do chủ quan)', usage: 'Nêu lý do.', example: '頭が痛いから、休みます。', exampleReading: 'あたまがいたいから、やすみます。', exampleMeaning: 'Vì đau đầu nên nghỉ.' },
      { pattern: '～ので', meaning: 'vì ~ (khách quan)', usage: 'Lịch sự hơn から.', example: '体調が悪いので、早退します。', exampleReading: 'たいちょうがわるいので、そうたいします。', exampleMeaning: 'Vì sức khỏe không tốt nên về sớm.' },
    ],
  },
  { title: 'Bài 22 — Dù cho', description: '～が (nhưng), ～ても.',
    vocab: [
      { japanese: '疲れる', reading: 'つかれる', meaning: 'mệt', example: '疲れても、頑張ります。', exampleReading: 'つかれても、がんばります。', exampleMeaning: 'Dù mệt vẫn cố.' },
      { japanese: '頑張る', reading: 'がんばる', meaning: 'cố gắng', example: '最後まで頑張りましょう。', exampleReading: 'さいごまでがんばりましょう。', exampleMeaning: 'Cố đến cùng.' },
      { japanese: '雨', reading: 'あめ', meaning: 'mưa', example: '雨が降っても、行きます。', exampleReading: 'あめがふっても、いきます。', exampleMeaning: 'Dù mưa cũng đi.' },
      { japanese: '難しい', reading: 'むずかしい', meaning: 'khó', example: '難しくても諦めません。', exampleReading: 'むずかしくてもあきらめません。', exampleMeaning: 'Dù khó cũng không bỏ.' },
      { japanese: '諦める', reading: 'あきらめる', meaning: 'bỏ cuộc', example: '諦めないでください。', exampleReading: 'あきらめないでください。', exampleMeaning: 'Đừng bỏ cuộc.' },
    ],
    grammar: [
      { pattern: 'V-ても', meaning: 'dù V cũng ~', usage: 'Nhượng bộ.', example: '眠くても勉強します。', exampleReading: 'ねむくてもべんきょうします。', exampleMeaning: 'Dù buồn ngủ vẫn học.' },
      { pattern: '～が（nhưng mà）', meaning: '~ nhưng mà ~', usage: 'Nối hai mệnh đề tương phản.', example: '日本語は難しいが、面白いです。', exampleReading: 'にほんごはむずかしいが、おもしろいです。', exampleMeaning: 'Khó nhưng thú vị.' },
    ],
  },
  { title: 'Bài 23 — Câu tương đối', description: 'Mệnh đề bổ nghĩa danh từ.',
    vocab: [
      { japanese: '有名な', reading: 'ゆうめいな', meaning: 'nổi tiếng', example: 'これは有名な映画です。', exampleReading: 'これはゆうめいなえいがです。', exampleMeaning: 'Bộ phim nổi tiếng.' },
      { japanese: '作る', reading: 'つくる', meaning: 'làm ra', example: '自分で作った料理が好きです。', exampleReading: 'じぶんでつくったりょうりがすきです。', exampleMeaning: 'Thích đồ ăn tự làm.' },
      { japanese: '場所', reading: 'ばしょ', meaning: 'địa điểm', example: '住んでいる場所を教えてください。', exampleReading: 'すんでいるばしょをおしえてください。', exampleMeaning: 'Nơi bạn đang sống.' },
      { japanese: 'とき', reading: 'とき', meaning: 'khi, lúc', example: '暇なとき、本を読みます。', exampleReading: 'ひまなとき、ほんをよみます。', exampleMeaning: 'Khi rảnh đọc sách.' },
      { japanese: '普通', reading: 'ふつう', meaning: 'bình thường', example: '普通の生活が好きです。', exampleReading: 'ふつうのせいかつがすきです。', exampleMeaning: 'Thích cuộc sống bình thường.' },
    ],
    grammar: [
      { pattern: 'V(普通形)＋N', meaning: 'N được bổ nghĩa bởi V', usage: 'Động từ ở thể thường đứng trước danh từ.', example: '昨日会った人は田中さんです。', exampleReading: 'きのうあったひとはたなかさんです。', exampleMeaning: 'Người tôi gặp hôm qua là Tanaka.' },
      { pattern: 'adj/V(普通形)＋とき', meaning: 'khi ~', usage: 'とき chỉ thời điểm.', example: '暇なとき、本を読みます。', exampleReading: 'ひまなとき、ほんをよみます。', exampleMeaning: 'Khi rảnh đọc sách.' },
    ],
  },
  { title: 'Bài 24 — Lời khuyên', description: '～たほうがいい, ～ないほうがいい.',
    vocab: [
      { japanese: '医者', reading: 'いしゃ', meaning: 'bác sĩ', example: '医者に行ったほうがいいです。', exampleReading: 'いしゃにいったほうがいいです。', exampleMeaning: 'Nên đi khám bác sĩ.' },
      { japanese: '気をつける', reading: 'きをつける', meaning: 'chú ý, cẩn thận', example: '健康に気をつけたほうがいいですよ。', exampleReading: 'けんこうにきをつけたほうがいいですよ。', exampleMeaning: 'Nên chú ý sức khỏe.' },
      { japanese: 'はず', reading: 'はず', meaning: 'lẽ ra phải ~', example: '彼はもう来るはずです。', exampleReading: 'かれはもうくるはずです。', exampleMeaning: 'Anh ấy lẽ ra đã đến rồi.' },
      { japanese: '相談する', reading: 'そうだんする', meaning: 'hỏi ý kiến', example: '先生に相談したほうがいいです。', exampleReading: 'せんせいにそうだんしたほうがいいです。', exampleMeaning: 'Nên hỏi ý kiến thầy.' },
      { japanese: '早く', reading: 'はやく', meaning: 'sớm hơn, nhanh', example: '早く寝たほうがいいです。', exampleReading: 'はやくねたほうがいいです。', exampleMeaning: 'Nên ngủ sớm hơn.' },
    ],
    grammar: [
      { pattern: 'V-た＋ほうがいい', meaning: 'nên V', usage: 'Lời khuyên nên làm.', example: 'もっと寝たほうがいいです。', exampleReading: 'もっとねたほうがいいです。', exampleMeaning: 'Nên ngủ nhiều hơn.' },
      { pattern: 'V-ない＋ほうがいい', meaning: 'không nên V', usage: 'Khuyên không làm.', example: '夜遅く食べないほうがいいです。', exampleReading: 'よるおそくたべないほうがいいです。', exampleMeaning: 'Không nên ăn quá khuya.' },
    ],
  },
  { title: 'Bài 25 — Dự định, ý định', description: '～つもりです, ～予定です.',
    vocab: [
      { japanese: 'つもり', reading: 'つもり', meaning: 'có ý định', example: '来年、日本に行くつもりです。', exampleReading: 'らいねん、にほんにいくつもりです。', exampleMeaning: 'Dự định đến Nhật năm sau.' },
      { japanese: '予定', reading: 'よてい', meaning: 'kế hoạch', example: '3時に会議の予定があります。', exampleReading: 'さんじにかいぎのよていがあります。', exampleMeaning: 'Có kế hoạch họp lúc 3 giờ.' },
      { japanese: '卒業する', reading: 'そつぎょうする', meaning: 'tốt nghiệp', example: '来春、大学を卒業する予定です。', exampleReading: 'らいしゅんだいがくをそつぎょうするよていです。', exampleMeaning: 'Dự kiến tốt nghiệp mùa xuân tới.' },
      { japanese: '就職する', reading: 'しゅうしょくする', meaning: 'đi làm', example: '東京で就職するつもりです。', exampleReading: 'とうきょうでしゅうしょくするつもりです。', exampleMeaning: 'Dự định đi làm ở Tokyo.' },
      { japanese: '計画', reading: 'けいかく', meaning: 'kế hoạch (chi tiết)', example: 'もう計画が決まりましたか？', exampleReading: 'もうけいかくがきまりましたか？', exampleMeaning: 'Kế hoạch đã xong chưa?' },
    ],
    grammar: [
      { pattern: 'V(辞書形)＋つもりです', meaning: 'có ý định V', usage: 'Dự định/ý định của người nói.', example: '大学院に進むつもりです。', exampleReading: 'だいがくいんにすすむつもりです。', exampleMeaning: 'Dự định lên cao học.' },
      { pattern: '～と思っています', meaning: 'đang nghĩ rằng ~', usage: 'Mơ ước đang tiến hành.', example: '将来、教師になりたいと思っています。', exampleReading: 'しょうらい、きょうしになりたいとおもっています。', exampleMeaning: 'Muốn trở thành giáo viên tương lai.' },
    ],
  },
];

async function upsertLevelData(levelCode: string, lessons: Lesson[], textbookName: string) {
  const level = await prisma.level.findUnique({ where: { code: levelCode } });
  if (!level) return { error: `Level ${levelCode} not found` };

  let lessonTotal = 0; let itemTotal = 0;

  for (const [skill, catSuffix, typeFilter] of [
    ['vocab',   'vocab',   'vocab'],
    ['grammar', 'grammar', 'grammar'],
  ] as const) {
    const catId = `minna-${levelCode.toLowerCase()}-${catSuffix}`;
    await prisma.learningCategory.upsert({
      where: { id: catId },
      create: { id: catId, levelId: level.id, skill, name: `${skill === 'vocab' ? 'Từ vựng' : 'Ngữ pháp'} ${levelCode} — ${textbookName}`, icon: skill === 'vocab' ? '📖' : '📐', order: skill === 'vocab' ? 1 : 2 },
      update: {},
    });

    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];
      const items = skill === 'vocab' ? lesson.vocab : lesson.grammar;
      if (items.length === 0) continue;

      const lessonId = `ml-${levelCode.toLowerCase()}-${catSuffix[0]}-${i + 1}`;
      await prisma.learningLesson.upsert({
        where: { id: lessonId },
        create: { id: lessonId, categoryId: catId, title: lesson.title, description: lesson.description, type: skill === 'vocab' ? 'vocab' : 'grammar', order: i + 1 },
        update: { title: lesson.title, description: lesson.description },
      });

      await prisma.learningItem.deleteMany({ where: { lessonId } });

      if (skill === 'vocab') {
        const vocabItems = lesson.vocab.map((w, idx) => ({
          lessonId, type: 'vocab', japanese: w.japanese, reading: w.reading, meaning: w.meaning,
          example: w.example ?? null, exampleReading: w.exampleReading ?? null, exampleMeaning: w.exampleMeaning ?? null, order: idx + 1,
        }));
        await prisma.learningItem.createMany({ data: vocabItems });
        itemTotal += vocabItems.length;
      } else {
        const grammarItems = lesson.grammar.map((g, idx) => ({
          lessonId, type: 'grammar', japanese: g.pattern, reading: null, meaning: g.meaning,
          example: g.example ?? null, exampleReading: g.exampleReading ?? null, exampleMeaning: g.exampleMeaning ?? null, order: idx + 1,
        }));
        await prisma.learningItem.createMany({ data: grammarItems });
        itemTotal += grammarItems.length;
      }
      lessonTotal++;
    }
  }
  return { lessonTotal, itemTotal };
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ message: 'Không có quyền.' }, { status: 403 });
  }

  try {
    const n5Result = await upsertLevelData('N5', MINNA_N5, 'Minna no Nihongo I');
    if ('error' in n5Result) return NextResponse.json({ message: n5Result.error }, { status: 400 });

    // N4: Same lesson topics but different numbering
    const MINNA_N4: Lesson[] = MINNA_N5.map((l, i) => ({
      title: `Bài ${26 + i} — ${l.title.split('—')[1]?.trim() ?? l.title}`,
      description: l.description,
      vocab: l.vocab,
      grammar: l.grammar,
    }));
    const n4Result = await upsertLevelData('N4', MINNA_N4, 'Minna no Nihongo II');
    if ('error' in n4Result) return NextResponse.json({ message: n4Result.error }, { status: 400 });

    return NextResponse.json({
      message: `✅ Seed Minna no Nihongo thành công! N5: ${n5Result.lessonTotal} bài, ${n5Result.itemTotal} mục. N4: ${n4Result.lessonTotal} bài, ${n4Result.itemTotal} mục.`,
    });
  } catch (e: any) {
    return NextResponse.json({ message: e.message ?? 'Lỗi server.' }, { status: 500 });
  }
}
