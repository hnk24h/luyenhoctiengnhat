/**
 * POST /api/admin/seed-minna
 * Seeds Minna no Nihongo N5 (Bài 1~25) and N4 (Bài 26~50) vocab + grammar
 * into LearningCategory (skill='vocab'|'grammar') → LearningLesson → LearningItem.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Language } from '@prisma/client';

type WordRow = { term: string; pronunciation: string; meaning: string; example?: string; exampleReading?: string; exampleMeaning?: string };
type GrammarRow = { pattern: string; meaning: string; usage: string; example?: string; exampleReading?: string; exampleMeaning?: string };
type Lesson = { title: string; description?: string; vocab: WordRow[]; grammar: GrammarRow[] };

const MINNA_N5: Lesson[] = [
  { title: 'Bài 1 — Giới thiệu bản thân', description: 'AはBです, đại từ nhân xưng, nghề nghiệp.',
    vocab: [
      { term: '私', pronunciation: 'わたし', meaning: 'tôi', example: '私はマリアです。', exampleReading: 'わたしはマリアです。', exampleMeaning: 'Tôi là Maria.' },
      { term: '先生', pronunciation: 'せんせい', meaning: 'giáo viên', example: '先生はやさしいです。', exampleReading: 'せんせいはやさしいです。', exampleMeaning: 'Giáo viên thật thân thiện.' },
      { term: '学生', pronunciation: 'がくせい', meaning: 'học sinh', example: '私は学生です。', exampleReading: 'わたしはがくせいです。', exampleMeaning: 'Tôi là học sinh.' },
      { term: '会社員', pronunciation: 'かいしゃいん', meaning: 'nhân viên công ty', example: '父は会社員です。', exampleReading: 'ちちはかいしゃいんです。', exampleMeaning: 'Bố là nhân viên công ty.' },
      { term: '人', pronunciation: 'じん/にん', meaning: 'người', example: '日本人です。', exampleReading: 'にほんじんです。', exampleMeaning: 'Là người Nhật.' },
    ],
    grammar: [
      { pattern: 'AはBです', meaning: 'A là B', usage: 'Giới thiệu hoặc xác nhận danh tính.', example: '私は山田です。', exampleReading: 'わたしはやまだです。', exampleMeaning: 'Tôi là Yamada.' },
      { pattern: 'AはBじゃないです', meaning: 'A không phải là B', usage: 'Phủ định của ～です.', example: '私は先生じゃないです。', exampleReading: 'わたしはせんせいじゃないです。', exampleMeaning: 'Tôi không phải là giáo viên.' },
    ],
  },
  { title: 'Bài 2 — Đồ vật xung quanh', description: 'これ/それ/あれ, chỉ thị từ.',
    vocab: [
      { term: 'これ', pronunciation: 'これ', meaning: 'cái này', example: 'これは本です。', exampleReading: 'これはほんです。', exampleMeaning: 'Đây là cuốn sách.' },
      { term: 'それ', pronunciation: 'それ', meaning: 'cái đó', example: 'それはペンです。', exampleReading: 'それはペンです。', exampleMeaning: 'Cái đó là cái bút.' },
      { term: 'あれ', pronunciation: 'あれ', meaning: 'cái kia', example: 'あれは何ですか？', exampleReading: 'あれはなんですか？', exampleMeaning: 'Cái kia là gì?' },
      { term: 'この', pronunciation: 'この', meaning: 'cái…này', example: 'この本はおもしろいです。', exampleReading: 'このほんはおもしろいです。', exampleMeaning: 'Cuốn sách này hay.' },
      { term: '何', pronunciation: 'なん/なに', meaning: 'cái gì', example: '何ですか？', exampleReading: 'なんですか？', exampleMeaning: 'Cái gì vậy?' },
    ],
    grammar: [
      { pattern: 'これ/それ/あれはNですか', meaning: 'Đây/đó/kia có phải là N không?', usage: 'Câu hỏi xác nhận vật thể.', example: 'これはかばんですか？', exampleReading: 'これはかばんですか？', exampleMeaning: 'Đây có phải là túi không?' },
      { pattern: 'N1のN2', meaning: 'N2 của N1', usage: 'Sở hữu hoặc thuộc tính.', example: '私の本です。', exampleReading: 'わたしのほんです。', exampleMeaning: 'Sách của tôi.' },
    ],
  },
  { title: 'Bài 3 — Ở đâu', description: 'ここ/そこ/あそこ, chỉ vị trí.',
    vocab: [
      { term: 'ここ', pronunciation: 'ここ', meaning: 'ở đây', example: 'ここは図書館です。', exampleReading: 'ここはとしょかんです。', exampleMeaning: 'Đây là thư viện.' },
      { term: 'そこ', pronunciation: 'そこ', meaning: 'ở đó', example: 'そこにあります。', exampleReading: 'そこにあります。', exampleMeaning: 'Ở chỗ đó.' },
      { term: 'あそこ', pronunciation: 'あそこ', meaning: 'chỗ kia', example: 'あそこはトイレです。', exampleReading: 'あそこはトイレです。', exampleMeaning: 'Chỗ kia là nhà vệ sinh.' },
      { term: '国', pronunciation: 'くに', meaning: 'đất nước', example: 'あなたの国はどこですか？', exampleReading: 'あなたのくにはどこですか？', exampleMeaning: 'Đất nước của bạn là đâu?' },
      { term: '会社', pronunciation: 'かいしゃ', meaning: 'công ty', example: '会社はどこですか？', exampleReading: 'かいしゃはどこですか？', exampleMeaning: 'Công ty ở đâu?' },
    ],
    grammar: [
      { pattern: '～はどこですか', meaning: '～ ở đâu?', usage: 'Hỏi vị trí.', example: 'トイレはどこですか？', exampleReading: 'トイレはどこですか？', exampleMeaning: 'Nhà vệ sinh ở đâu?' },
    ],
  },
  { title: 'Bài 4 — Thời gian & giờ giấc', description: 'Cách đọc giờ, phút; từ chỉ thời gian.',
    vocab: [
      { term: '時', pronunciation: 'じ', meaning: 'giờ', example: 'いま何時ですか？', exampleReading: 'いまなんじですか？', exampleMeaning: 'Bây giờ là mấy giờ?' },
      { term: '分', pronunciation: 'ふん/ぷん', meaning: 'phút', example: '3時15分です。', exampleReading: 'さんじじゅうごふんです。', exampleMeaning: '3 giờ 15 phút.' },
      { term: '今', pronunciation: 'いま', meaning: 'bây giờ', example: '今、8時です。', exampleReading: 'いまはちじです。', exampleMeaning: 'Bây giờ là 8 giờ.' },
      { term: '午前', pronunciation: 'ごぜん', meaning: 'buổi sáng (AM)', example: '午前9時に起きます。', exampleReading: 'ごぜんくじにおきます。', exampleMeaning: 'Thức dậy lúc 9 giờ sáng.' },
      { term: '午後', pronunciation: 'ごご', meaning: 'buổi chiều (PM)', example: '午後3時に来てください。', exampleReading: 'ごごさんじにきてください。', exampleMeaning: 'Hãy đến lúc 3 giờ chiều.' },
    ],
    grammar: [
      { pattern: 'Nに～ます', meaning: 'Động từ xảy ra vào thời điểm N', usage: '「に」chỉ thời điểm cụ thể.', example: '7時に起きます。', exampleReading: 'しちじにおきます。', exampleMeaning: 'Thức dậy lúc 7 giờ.' },
      { pattern: 'から～まで', meaning: 'từ … đến …', usage: 'Khoảng thời gian.', example: '9時から5時まで働きます。', exampleReading: 'くじからごじまではたらきます。', exampleMeaning: 'Làm từ 9 đến 5 giờ.' },
    ],
  },
  { title: 'Bài 5 — Đi lại, mua sắm', description: '～に行きます/来ます/帰ります.',
    vocab: [
      { term: '行く', pronunciation: 'いく', meaning: 'đi', example: '学校に行きます。', exampleReading: 'がっこうにいきます。', exampleMeaning: 'Đến trường.' },
      { term: '来る', pronunciation: 'くる', meaning: 'đến, tới', example: '友達が来ます。', exampleReading: 'ともだちがきます。', exampleMeaning: 'Bạn đến.' },
      { term: '帰る', pronunciation: 'かえる', meaning: 'về nhà', example: '6時に帰ります。', exampleReading: 'ろくじにかえります。', exampleMeaning: '6 giờ về nhà.' },
      { term: '誰', pronunciation: 'だれ', meaning: 'ai', example: '誰と行きますか？', exampleReading: 'だれといきますか？', exampleMeaning: 'Đi với ai?' },
      { term: 'バス', pronunciation: 'バス', meaning: 'xe buýt', example: 'バスで行きます。', exampleReading: 'バスでいきます。', exampleMeaning: 'Đi bằng xe buýt.' },
    ],
    grammar: [
      { pattern: '～に行きます', meaning: 'đi đến ~ (điểm đến)', usage: '「に」chỉ điểm đến.', example: 'デパートに行きます。', exampleReading: 'デパートにいきます。', exampleMeaning: 'Đi đến trung tâm thương mại.' },
      { pattern: '～で行きます', meaning: 'đi bằng phương tiện ~', usage: '「で」chỉ phương tiện.', example: '電車で行きます。', exampleReading: 'でんしゃでいきます。', exampleMeaning: 'Đi bằng tàu điện.' },
    ],
  },
  { title: 'Bài 6 — Ăn uống', description: 'Động từ nhóm 2, mời ăn.',
    vocab: [
      { term: '食べる', pronunciation: 'たべる', meaning: 'ăn', example: '昼ごはんを食べます。', exampleReading: 'ひるごはんをたべます。', exampleMeaning: 'Ăn trưa.' },
      { term: '飲む', pronunciation: 'のむ', meaning: 'uống', example: 'コーヒーを飲みます。', exampleReading: 'コーヒーをのみます。', exampleMeaning: 'Uống cà phê.' },
      { term: 'おいしい', pronunciation: 'おいしい', meaning: 'ngon', example: 'このりんごはおいしい。', exampleReading: 'このりんごはおいしい。', exampleMeaning: 'Quả táo này ngon.' },
      { term: 'レストラン', pronunciation: 'レストラン', meaning: 'nhà hàng', example: 'レストランで食べます。', exampleReading: 'レストランでたべます。', exampleMeaning: 'Ăn ở nhà hàng.' },
      { term: 'いっしょに', pronunciation: 'いっしょに', meaning: 'cùng nhau', example: 'いっしょに食べましょう。', exampleReading: 'いっしょにたべましょう。', exampleMeaning: 'Cùng ăn nhé.' },
    ],
    grammar: [
      { pattern: '～ませんか', meaning: 'Mình cùng … không? (mời)', usage: 'Lịch sự mời.', example: 'いっしょに食べませんか？', exampleReading: 'いっしょにたべませんか？', exampleMeaning: 'Chúng ta cùng ăn không?' },
      { pattern: '～ましょう', meaning: 'Hãy … nào', usage: 'Đề xuất hành động cùng nhau.', example: '行きましょう。', exampleReading: 'いきましょう。', exampleMeaning: 'Đi thôi!' },
    ],
  },
  { title: 'Bài 7 — Địa điểm & tồn tại', description: '～があります/います.',
    vocab: [
      { term: 'ある', pronunciation: 'ある', meaning: 'có (vật vô sinh)', example: '駅の前に本屋があります。', exampleReading: 'えきのまえにほんやがあります。', exampleMeaning: 'Trước ga có hiệu sách.' },
      { term: 'いる', pronunciation: 'いる', meaning: 'có (người/động vật)', example: '公園に子どもがいます。', exampleReading: 'こうえんにこどもがいます。', exampleMeaning: 'Công viên có trẻ em.' },
      { term: '前', pronunciation: 'まえ', meaning: 'phía trước', example: '駅の前で待ちます。', exampleReading: 'えきのまえでまちます。', exampleMeaning: 'Đợi trước ga.' },
      { term: '後ろ', pronunciation: 'うしろ', meaning: 'phía sau', example: '後ろに誰かいます。', exampleReading: 'うしろにだれかいます。', exampleMeaning: 'Phía sau có ai đó.' },
      { term: '中', pronunciation: 'なか', meaning: 'bên trong', example: 'かばんの中に財布があります。', exampleReading: 'かばんのなかにさいふがあります。', exampleMeaning: 'Trong túi có ví.' },
    ],
    grammar: [
      { pattern: 'Nがあります/います', meaning: 'Có N (tồn tại)', usage: 'あります cho vật; います cho người/sinh vật.', example: '公園の前に花屋があります。', exampleReading: 'こうえんのまえにはなやがあります。', exampleMeaning: 'Trước công viên có tiệm hoa.' },
    ],
  },
  { title: 'Bài 8 — Hình dạng, số lượng', description: 'Đếm vật, trợ số từ.',
    vocab: [
      { term: '一つ', pronunciation: 'ひとつ', meaning: 'một cái', example: 'リンゴを一つください。', exampleReading: 'りんごをひとつください。', exampleMeaning: 'Cho tôi một quả táo.' },
      { term: 'いくつ', pronunciation: 'いくつ', meaning: 'bao nhiêu cái', example: 'りんごはいくつありますか？', exampleReading: 'りんごはいくつありますか？', exampleMeaning: 'Có bao nhiêu quả táo?' },
      { term: '全部', pronunciation: 'ぜんぶ', meaning: 'tất cả', example: '全部でいくらですか？', exampleReading: 'ぜんぶでいくらですか？', exampleMeaning: 'Tất cả bao nhiêu?' },
      { term: 'いくら', pronunciation: 'いくら', meaning: 'bao nhiêu tiền', example: 'このケーキはいくらですか？', exampleReading: 'このケーキはいくらですか？', exampleMeaning: 'Bánh này bao nhiêu?' },
      { term: '円', pronunciation: 'えん', meaning: 'yên Nhật', example: '300円です。', exampleReading: 'さんびゃくえんです。', exampleMeaning: '300 yên.' },
    ],
    grammar: [
      { pattern: 'Nをください', meaning: 'Cho tôi N', usage: 'Mua hàng hoặc xin.', example: 'このケーキを一つください。', exampleReading: 'このケーキをひとつください。', exampleMeaning: 'Cho tôi một cái bánh.' },
    ],
  },
  { title: 'Bài 9 — Tính từ い', description: 'Tính từ i, phủ định và quá khứ.',
    vocab: [
      { term: '大きい', pronunciation: 'おおきい', meaning: 'to, lớn', example: '大きいかばんです。', exampleReading: 'おおきいかばんです。', exampleMeaning: 'Cái túi to.' },
      { term: '小さい', pronunciation: 'ちいさい', meaning: 'nhỏ, bé', example: '小さい犬がいます。', exampleReading: 'ちいさいいぬがいます。', exampleMeaning: 'Có con chó nhỏ.' },
      { term: '良い/いい', pronunciation: 'いい', meaning: 'tốt, hay', example: 'いい天気ですね。', exampleReading: 'いいてんきですね。', exampleMeaning: 'Thời tiết tốt nhỉ.' },
      { term: '高い', pronunciation: 'たかい', meaning: 'cao; đắt', example: 'このレストランは高いです。', exampleReading: 'このレストランはたかいです。', exampleMeaning: 'Nhà hàng này đắt.' },
      { term: '安い', pronunciation: 'やすい', meaning: 'rẻ', example: 'このお店は安いです。', exampleReading: 'このおみせはやすいです。', exampleMeaning: 'Cửa hàng này rẻ.' },
    ],
    grammar: [
      { pattern: 'い-adj → ～くないです', meaning: 'không ~ (phủ định)', usage: 'Bỏ い, thêm くないです.', example: '高くないです。', exampleReading: 'たかくないです。', exampleMeaning: 'Không đắt.' },
      { pattern: 'い-adj → ～かったです', meaning: '~ (quá khứ)', usage: 'Bỏ い, thêm かったです.', example: '楽しかったです。', exampleReading: 'たのしかったです。', exampleMeaning: 'Đã vui.' },
    ],
  },
  { title: 'Bài 10 — Tính từ な', description: 'Tính từ na, đặc điểm.',
    vocab: [
      { term: '好き', pronunciation: 'すき', meaning: 'thích', example: '日本語が好きです。', exampleReading: 'にほんごがすきです。', exampleMeaning: 'Thích tiếng Nhật.' },
      { term: '嫌い', pronunciation: 'きらい', meaning: 'không thích', example: 'ピーマンが嫌いです。', exampleReading: 'ピーマンがきらいです。', exampleMeaning: 'Không thích ớt chuông.' },
      { term: '上手', pronunciation: 'じょうず', meaning: 'giỏi, khéo', example: '料理が上手です。', exampleReading: 'りょうりがじょうずです。', exampleMeaning: 'Nấu ăn giỏi.' },
      { term: '有名', pronunciation: 'ゆうめい', meaning: 'nổi tiếng', example: '富士山は有名です。', exampleReading: 'ふじさんはゆうめいです。', exampleMeaning: 'Núi Fuji nổi tiếng.' },
      { term: '静か', pronunciation: 'しずか', meaning: 'yên tĩnh', example: '図書館は静かです。', exampleReading: 'としょかんはしずかです。', exampleMeaning: 'Thư viện yên tĩnh.' },
    ],
    grammar: [
      { pattern: 'な-adj＋な＋N', meaning: 'Na-adj trước danh từ dùng な', usage: 'Khi đứng trước danh từ phải thêm な.', example: 'きれいな花です。', exampleReading: 'きれいなはなです。', exampleMeaning: 'Là bông hoa đẹp.' },
      { pattern: 'NがすきですN', meaning: 'thích N', usage: '「が」chỉ đối tượng cảm xúc.', example: '音楽が好きです。', exampleReading: 'おんがくがすきです。', exampleMeaning: 'Thích âm nhạc.' },
    ],
  },
  { title: 'Bài 11 — Ước muốn, đề nghị', description: '～たいです, ～てください.',
    vocab: [
      { term: '旅行', pronunciation: 'りょこう', meaning: 'du lịch', example: '日本に旅行したいです。', exampleReading: 'にほんにりょこうしたいです。', exampleMeaning: 'Muốn du lịch Nhật.' },
      { term: '買い物', pronunciation: 'かいもの', meaning: 'mua sắm', example: 'デパートで買い物をします。', exampleReading: 'デパートでかいものをします。', exampleMeaning: 'Mua sắm ở TTTM.' },
      { term: '休み', pronunciation: 'やすみ', meaning: 'ngày nghỉ', example: '休みに旅行します。', exampleReading: 'やすみにりょこうします。', exampleMeaning: 'Du lịch ngày nghỉ.' },
      { term: '映画', pronunciation: 'えいが', meaning: 'phim điện ảnh', example: '映画が見たいです。', exampleReading: 'えいながみたいです。', exampleMeaning: 'Muốn xem phim.' },
      { term: 'ゆっくり', pronunciation: 'ゆっくり', meaning: 'từ từ, chậm', example: 'ゆっくり話してください。', exampleReading: 'ゆっくりはなしてください。', exampleMeaning: 'Hãy nói chậm thôi.' },
    ],
    grammar: [
      { pattern: '～たいです', meaning: 'muốn làm ~', usage: 'Gắn たい vào masu-stem.', example: '日本語を話したいです。', exampleReading: 'にほんごをはなしたいです。', exampleMeaning: 'Muốn nói tiếng Nhật.' },
      { pattern: '～てください', meaning: 'Hãy làm ~ (yêu cầu lịch sự)', usage: 'Dạng て + ください.', example: 'ゆっくり話してください。', exampleReading: 'ゆっくりはなしてください。', exampleMeaning: 'Hãy nói chậm thôi.' },
    ],
  },
  { title: 'Bài 12 — Tần suất', description: 'よく/ときどき/あまり/ぜんぜん.',
    vocab: [
      { term: 'よく', pronunciation: 'よく', meaning: 'thường, hay', example: 'よくテレビを見ます。', exampleReading: 'よくテレビをみます。', exampleMeaning: 'Thường xem TV.' },
      { term: 'ときどき', pronunciation: 'ときどき', meaning: 'thỉnh thoảng', example: 'ときどき料理をします。', exampleReading: 'ときどきりょうりをします。', exampleMeaning: 'Thỉnh thoảng nấu ăn.' },
      { term: 'あまり～ない', pronunciation: 'あまり', meaning: 'không mấy', example: 'あまり肉を食べません。', exampleReading: 'あまりにくをたべません。', exampleMeaning: 'Không ăn thịt mấy.' },
      { term: 'ぜんぜん～ない', pronunciation: 'ぜんぜん', meaning: 'hoàn toàn không', example: 'ぜんぜん眠れません。', exampleReading: 'ぜんぜんねむれません。', exampleMeaning: 'Không ngủ được chút nào.' },
      { term: 'どんな', pronunciation: 'どんな', meaning: 'loại…nào', example: 'どんな音楽が好きですか？', exampleReading: 'どんなおんがくがすきですか？', exampleMeaning: 'Bạn thích loại nhạc nào?' },
    ],
    grammar: [
      { pattern: 'あまり＋～ません', meaning: 'không ~ nhiều lắm', usage: 'あまり dùng với phủ định.', example: 'あまり映画を見ません。', exampleReading: 'あまりえいがをみません。', exampleMeaning: 'Không xem phim nhiều lắm.' },
      { pattern: 'ぜんぜん＋～ません', meaning: 'hoàn toàn không ~', usage: 'Nhấn mạnh phủ định hoàn toàn.', example: 'ぜんぜんわかりません。', exampleReading: 'ぜんぜんわかりません。', exampleMeaning: 'Hoàn toàn không hiểu.' },
    ],
  },
  { title: 'Bài 13 — Đang làm gì, trạng thái', description: '～ています.',
    vocab: [
      { term: '結婚する', pronunciation: 'けっこんする', meaning: 'kết hôn', example: '彼は結婚していません。', exampleReading: 'かれはけっこんしていません。', exampleMeaning: 'Anh ấy chưa kết hôn.' },
      { term: '住む', pronunciation: 'すむ', meaning: 'cư trú, ở', example: '東京に住んでいます。', exampleReading: 'とうきょうにすんでいます。', exampleMeaning: 'Sống ở Tokyo.' },
      { term: '働く', pronunciation: 'はたらく', meaning: 'làm việc', example: 'どこで働いていますか？', exampleReading: 'どこではたらいていますか？', exampleMeaning: 'Bạn làm việc ở đâu?' },
      { term: '着る', pronunciation: 'きる', meaning: 'mặc', example: '白いシャツを着ています。', exampleReading: 'しろいシャツをきています。', exampleMeaning: 'Đang mặc áo trắng.' },
      { term: '窓', pronunciation: 'まど', meaning: 'cửa sổ', example: '窓が開いています。', exampleReading: 'まどがあいています。', exampleMeaning: 'Cửa sổ đang mở.' },
    ],
    grammar: [
      { pattern: 'V-て＋います（tiếp diễn）', meaning: '(đang V)', usage: 'Hành động đang diễn ra.', example: '本を読んでいます。', exampleReading: 'ほんをよんでいます。', exampleMeaning: 'Đang đọc sách.' },
      { pattern: 'V-て＋います（kết quả）', meaning: '(trạng thái sau V)', usage: 'Trạng thái là kết quả hành động trước.', example: '窓が開いています。', exampleReading: 'まどがあいています。', exampleMeaning: 'Cửa sổ đang mở (ai đó đã mở).' },
    ],
  },
  { title: 'Bài 14 — Kinh nghiệm, xin phép', description: '～たことがあります, ～てもいいですか.',
    vocab: [
      { term: '登る', pronunciation: 'のぼる', meaning: 'leo, trèo', example: '山に登ります。', exampleReading: 'やまにのぼります。', exampleMeaning: 'Leo núi.' },
      { term: '経験', pronunciation: 'けいけん', meaning: 'kinh nghiệm', example: '海外の経験があります。', exampleReading: 'かいがいのけいけんがあります。', exampleMeaning: 'Có kinh nghiệm ở nước ngoài.' },
      { term: '使う', pronunciation: 'つかう', meaning: 'sử dụng', example: 'この機械を使ったことがあります。', exampleReading: 'このきかいをつかったことがあります。', exampleMeaning: 'Đã từng dùng máy này.' },
      { term: '座る', pronunciation: 'すわる', meaning: 'ngồi', example: 'ここに座ってもいいですか？', exampleReading: 'ここにすわってもいいですか？', exampleMeaning: 'Tôi có thể ngồi đây không?' },
      { term: '写真', pronunciation: 'しゃしん', meaning: 'ảnh, chụp ảnh', example: '写真を撮ってもいいですか？', exampleReading: 'しゃしんをとってもいいですか？', exampleMeaning: 'Tôi có thể chụp ảnh không?' },
    ],
    grammar: [
      { pattern: 'V-た＋ことがあります', meaning: 'đã từng V (kinh nghiệm)', usage: 'Kinh nghiệm trong quá khứ.', example: '日本料理を食べたことがあります。', exampleReading: 'にほんりょうりをたべたことがあります。', exampleMeaning: 'Đã từng ăn món Nhật.' },
      { pattern: 'V-て＋もいいですか', meaning: 'Tôi có thể V không?', usage: 'Xin phép làm việc gì.', example: 'ここに座ってもいいですか？', exampleReading: 'ここにすわってもいいですか？', exampleMeaning: 'Tôi có thể ngồi đây không?' },
    ],
  },
  { title: 'Bài 15 — Phải làm; không được', description: '～なければなりません, ～てはいけません.',
    vocab: [
      { term: '薬', pronunciation: 'くすり', meaning: 'thuốc', example: '薬を飲まなければなりません。', exampleReading: 'くすりをのまなければなりません。', exampleMeaning: 'Phải uống thuốc.' },
      { term: '規則', pronunciation: 'きそく', meaning: 'quy tắc', example: '規則を守らなければなりません。', exampleReading: 'きそくをまもらなければなりません。', exampleMeaning: 'Phải tuân thủ quy tắc.' },
      { term: '守る', pronunciation: 'まもる', meaning: 'tuân thủ, bảo vệ', example: '約束を守ります。', exampleReading: 'やくそくをまもります。', exampleMeaning: 'Giữ lời hứa.' },
      { term: '静かにする', pronunciation: 'しずかにする', meaning: 'giữ yên lặng', example: '図書館では静かにしなければなりません。', exampleReading: 'としょかんではしずかにしなければなりません。', exampleMeaning: 'Phải yên lặng trong thư viện.' },
      { term: 'タバコ', pronunciation: 'タバコ', meaning: 'thuốc lá', example: 'ここでタバコを吸ってはいけません。', exampleReading: 'ここでタバコをすってはいけません。', exampleMeaning: 'Không được hút thuốc ở đây.' },
    ],
    grammar: [
      { pattern: 'V(ない形)＋なければなりません', meaning: 'phải V', usage: 'Nghĩa vụ, bắt buộc.', example: '毎日運動しなければなりません。', exampleReading: 'まいにちうんどうしなければなりません。', exampleMeaning: 'Phải tập thể dục mỗi ngày.' },
      { pattern: 'V-て＋はいけません', meaning: 'không được V', usage: 'Cấm đoán.', example: 'ここでタバコを吸ってはいけません。', exampleReading: 'ここでタバコをすってはいけません。', exampleMeaning: 'Không được hút thuốc ở đây.' },
    ],
  },
  { title: 'Bài 16 — Hỏi đường, hướng dẫn', description: 'Chỉ đường, từ chỉ hướng.',
    vocab: [
      { term: '右', pronunciation: 'みぎ', meaning: 'bên phải', example: '右に曲がってください。', exampleReading: 'みぎにまがってください。', exampleMeaning: 'Hãy rẽ phải.' },
      { term: '左', pronunciation: 'ひだり', meaning: 'bên trái', example: '左に曲がります。', exampleReading: 'ひだりにまがります。', exampleMeaning: 'Rẽ trái.' },
      { term: 'まっすぐ', pronunciation: 'まっすぐ', meaning: 'thẳng', example: 'まっすぐ行ってください。', exampleReading: 'まっすぐいってください。', exampleMeaning: 'Đi thẳng.' },
      { term: '渡る', pronunciation: 'わたる', meaning: 'băng qua', example: '横断歩道を渡ってください。', exampleReading: 'おうだんほどうをわたってください。', exampleMeaning: 'Băng qua vạch sang đường.' },
      { term: '信号', pronunciation: 'しんごう', meaning: 'đèn giao thông', example: '信号を渡ったら、左に曲がります。', exampleReading: 'しんごうをわたったら、ひだりにまがります。', exampleMeaning: 'Qua đèn thì rẽ trái.' },
    ],
    grammar: [
      { pattern: 'V-てから', meaning: 'sau khi V thì …', usage: 'Thứ tự hành động.', example: '右に曲がってから、まっすぐ行きます。', exampleReading: 'みぎにまがってから、まっすぐいきます。', exampleMeaning: 'Sau khi rẽ phải rồi đi thẳng.' },
      { pattern: '～たら', meaning: 'khi/nếu ~ thì …', usage: 'Điều kiện hoặc thứ tự.', example: '家に帰ったら、電話してください。', exampleReading: 'いえにかえったら、でんわしてください。', exampleMeaning: 'Về đến nhà hãy gọi điện.' },
    ],
  },
  { title: 'Bài 17 — Cho và nhận', description: 'あげます/もらいます/くれます.',
    vocab: [
      { term: 'あげる', pronunciation: 'あげる', meaning: 'cho (ai đó)', example: '友達にプレゼントをあげます。', exampleReading: 'ともだちにプレゼントをあげます。', exampleMeaning: 'Tặng quà cho bạn.' },
      { term: 'もらう', pronunciation: 'もらう', meaning: 'nhận', example: '母にケーキをもらいました。', exampleReading: 'ははにケーキをもらいました。', exampleMeaning: 'Được mẹ tặng bánh.' },
      { term: 'くれる', pronunciation: 'くれる', meaning: 'cho (tôi)', example: '友達が本をくれました。', exampleReading: 'ともだちがほんをくれました。', exampleMeaning: 'Bạn đã tặng tôi sách.' },
      { term: 'プレゼント', pronunciation: 'プレゼント', meaning: 'quà tặng', example: '誕生日にプレゼントをもらいました。', exampleReading: 'たんじょうびにプレゼントをもらいました。', exampleMeaning: 'Được nhận quà sinh nhật.' },
      { term: '誕生日', pronunciation: 'たんじょうび', meaning: 'sinh nhật', example: '今日は私の誕生日です。', exampleReading: 'きょうはわたしのたんじょうびです。', exampleMeaning: 'Hôm nay là sinh nhật tôi.' },
    ],
    grammar: [
      { pattern: 'NにNをあげます', meaning: 'cho N thứ gì đó', usage: 'Người cho → người nhận.', example: '妹に花をあげました。', exampleReading: 'いもうとにはなをあげました。', exampleMeaning: 'Tặng hoa cho em gái.' },
      { pattern: 'NにNをもらいます', meaning: 'nhận thứ gì từ N', usage: 'Góc nhìn người nhận.', example: '先生に本をもらいました。', exampleReading: 'せんせいにほんをもらいました。', exampleMeaning: 'Được thầy cho sách.' },
    ],
  },
  { title: 'Bài 18 — Biết, hiểu', description: '知っています, わかります.',
    vocab: [
      { term: '知る', pronunciation: 'しる', meaning: 'biết', example: 'あの人を知っていますか？', exampleReading: 'あのひとをしっていますか？', exampleMeaning: 'Bạn biết người đó không?' },
      { term: 'わかる', pronunciation: 'わかる', meaning: 'hiểu', example: '日本語がわかりますか？', exampleReading: 'にほんごがわかりますか？', exampleMeaning: 'Bạn hiểu tiếng Nhật không?' },
      { term: '必要', pronunciation: 'ひつよう', meaning: 'cần thiết', example: 'お金が必要です。', exampleReading: 'おかねがひつようです。', exampleMeaning: 'Cần có tiền.' },
      { term: '電話番号', pronunciation: 'でんわばんごう', meaning: 'số điện thoại', example: '電話番号を知っていますか？', exampleReading: 'でんわばんごうをしっていますか？', exampleMeaning: 'Biết số điện thoại không?' },
      { term: '住所', pronunciation: 'じゅうしょ', meaning: 'địa chỉ', example: '住所を教えてください。', exampleReading: 'じゅうしょをおしえてください。', exampleMeaning: 'Cho biết địa chỉ.' },
    ],
    grammar: [
      { pattern: '～を知っています', meaning: 'biết ~ (trạng thái)', usage: 'Trạng thái đã biết.', example: 'あの映画を知っています。', exampleReading: 'あのえいがをしっています。', exampleMeaning: 'Tôi biết bộ phim đó.' },
      { pattern: '～がわかります', meaning: '(tôi) hiểu ~', usage: 'Khả năng hiểu.', example: 'この問題がわかりません。', exampleReading: 'このもんだいがわかりません。', exampleMeaning: 'Không hiểu bài toán này.' },
    ],
  },
  { title: 'Bài 19 — Có thể, không thể', description: '～ができます, thể可能.',
    vocab: [
      { term: 'できる', pronunciation: 'できる', meaning: 'có thể', example: '日本語が少しできます。', exampleReading: 'にほんごがすこしできます。', exampleMeaning: 'Biết một chút tiếng Nhật.' },
      { term: '泳ぐ', pronunciation: 'およぐ', meaning: 'bơi', example: '速く泳げません。', exampleReading: 'はやくおよげません。', exampleMeaning: 'Không thể bơi nhanh.' },
      { term: '運転する', pronunciation: 'うんてんする', meaning: 'lái xe', example: '車が運転できます。', exampleReading: 'くるまがうんてんできます。', exampleMeaning: 'Có thể lái xe.' },
      { term: '料理', pronunciation: 'りょうり', meaning: 'nấu ăn', example: '和食が作れます。', exampleReading: 'わしょくがつくれます。', exampleMeaning: 'Có thể làm món Nhật.' },
      { term: 'ピアノ', pronunciation: 'ピアノ', meaning: 'đàn piano', example: 'ピアノが弾けます。', exampleReading: 'ピアノがひけます。', exampleMeaning: 'Có thể chơi piano.' },
    ],
    grammar: [
      { pattern: 'Nができます', meaning: 'có thể N / biết N', usage: 'Khả năng với danh từ.', example: 'スポーツができます。', exampleReading: 'スポーツができます。', exampleMeaning: 'Có thể chơi thể thao.' },
      { pattern: 'V(可能形)', meaning: 'Thể có thể của động từ', usage: 'Nhóm 1: う→える; Nhóm 2: る→られる.', example: '漢字が読めます。', exampleReading: 'かんじがよめます。', exampleMeaning: 'Có thể đọc kanji.' },
    ],
  },
  { title: 'Bài 20 — Điều kiện', description: '～と, ～たら (điều kiện).',
    vocab: [
      { term: '春', pronunciation: 'はる', meaning: 'mùa xuân', example: '春になると、桜が咲きます。', exampleReading: 'はるになると、さくらがさきます。', exampleMeaning: 'Vào mùa xuân, hoa anh đào nở.' },
      { term: '晴れ', pronunciation: 'はれ', meaning: 'trời nắng', example: '明日晴れたら、ピクニックに行きます。', exampleReading: 'あしたはれたら、ピクニックにいきます。', exampleMeaning: 'Nếu ngày mai nắng thì đi dã ngoại.' },
      { term: '困る', pronunciation: 'こまる', meaning: 'gặp khó khăn', example: '雨が降ると、困ります。', exampleReading: 'あめがふると、こまります。', exampleMeaning: 'Trời mưa thì bất tiện.' },
      { term: 'もし', pronunciation: 'もし', meaning: 'nếu như', example: 'もし時間があれば、来てください。', exampleReading: 'もしじかんがあれば、きてください。', exampleMeaning: 'Nếu có thời gian hãy đến.' },
      { term: '見える', pronunciation: 'みえる', meaning: 'nhìn thấy', example: '右に行くと、駅が見えます。', exampleReading: 'みぎにいくと、えきがみえます。', exampleMeaning: 'Đi phải thì thấy ga tàu.' },
    ],
    grammar: [
      { pattern: 'V-と', meaning: 'Hễ V thì (tự nhiên, khách quan)', usage: 'Điều kiện tự nhiên, quy luật.', example: '右に曲がると、駅があります。', exampleReading: 'みぎにまがると、えきがあります。', exampleMeaning: 'Rẽ phải là thấy ga.' },
      { pattern: 'V-たら', meaning: 'Khi V thì …', usage: 'Điều kiện ngẫu nhiên hoặc tương lai.', example: '家に帰ったら、電話してください。', exampleReading: 'いえにかえったら、でんわしてください。', exampleMeaning: 'Về nhà hãy gọi điện.' },
    ],
  },
  { title: 'Bài 21 — Lý do', description: '～から, ～ので.',
    vocab: [
      { term: 'から（lý do）', pronunciation: 'から', meaning: 'vì…nên (chủ quan)', example: '疲れたから、休みます。', exampleReading: 'つかれたから、やすみます。', exampleMeaning: 'Vì mệt nên nghỉ.' },
      { term: 'ので', pronunciation: 'ので', meaning: 'vì… (nhẹ hơn から)', example: '雨が降っているので、出かけません。', exampleReading: 'あめがふっているので、でかけません。', exampleMeaning: 'Vì trời mưa nên không ra ngoài.' },
      { term: '遅れる', pronunciation: 'おくれる', meaning: 'trễ, muộn', example: '遅刻しました。', exampleReading: 'ちこくしました。', exampleMeaning: 'Tôi đã đi muộn.' },
      { term: '説明する', pronunciation: 'せつめいする', meaning: 'giải thích', example: '先生が説明してくれました。', exampleReading: 'せんせいがせつめいしてくれました。', exampleMeaning: 'Thầy giải thích cho tôi.' },
      { term: '理由', pronunciation: 'りゆう', meaning: 'lý do', example: '理由を話してください。', exampleReading: 'りゆうをはなしてください。', exampleMeaning: 'Hãy nói lý do.' },
    ],
    grammar: [
      { pattern: '～から', meaning: 'vì ~ (lý do chủ quan)', usage: 'Nêu lý do.', example: '頭が痛いから、休みます。', exampleReading: 'あたまがいたいから、やすみます。', exampleMeaning: 'Vì đau đầu nên nghỉ.' },
      { pattern: '～ので', meaning: 'vì ~ (khách quan)', usage: 'Lịch sự hơn から.', example: '体調が悪いので、早退します。', exampleReading: 'たいちょうがわるいので、そうたいします。', exampleMeaning: 'Vì sức khỏe không tốt nên về sớm.' },
    ],
  },
  { title: 'Bài 22 — Dù cho', description: '～が (nhưng), ～ても.',
    vocab: [
      { term: '疲れる', pronunciation: 'つかれる', meaning: 'mệt', example: '疲れても、頑張ります。', exampleReading: 'つかれても、がんばります。', exampleMeaning: 'Dù mệt vẫn cố.' },
      { term: '頑張る', pronunciation: 'がんばる', meaning: 'cố gắng', example: '最後まで頑張りましょう。', exampleReading: 'さいごまでがんばりましょう。', exampleMeaning: 'Cố đến cùng.' },
      { term: '雨', pronunciation: 'あめ', meaning: 'mưa', example: '雨が降っても、行きます。', exampleReading: 'あめがふっても、いきます。', exampleMeaning: 'Dù mưa cũng đi.' },
      { term: '難しい', pronunciation: 'むずかしい', meaning: 'khó', example: '難しくても諦めません。', exampleReading: 'むずかしくてもあきらめません。', exampleMeaning: 'Dù khó cũng không bỏ.' },
      { term: '諦める', pronunciation: 'あきらめる', meaning: 'bỏ cuộc', example: '諦めないでください。', exampleReading: 'あきらめないでください。', exampleMeaning: 'Đừng bỏ cuộc.' },
    ],
    grammar: [
      { pattern: 'V-ても', meaning: 'dù V cũng ~', usage: 'Nhượng bộ.', example: '眠くても勉強します。', exampleReading: 'ねむくてもべんきょうします。', exampleMeaning: 'Dù buồn ngủ vẫn học.' },
      { pattern: '～が（nhưng mà）', meaning: '~ nhưng mà ~', usage: 'Nối hai mệnh đề tương phản.', example: '日本語は難しいが、面白いです。', exampleReading: 'にほんごはむずかしいが、おもしろいです。', exampleMeaning: 'Khó nhưng thú vị.' },
    ],
  },
  { title: 'Bài 23 — Câu tương đối', description: 'Mệnh đề bổ nghĩa danh từ.',
    vocab: [
      { term: '有名な', pronunciation: 'ゆうめいな', meaning: 'nổi tiếng', example: 'これは有名な映画です。', exampleReading: 'これはゆうめいなえいがです。', exampleMeaning: 'Bộ phim nổi tiếng.' },
      { term: '作る', pronunciation: 'つくる', meaning: 'làm ra', example: '自分で作った料理が好きです。', exampleReading: 'じぶんでつくったりょうりがすきです。', exampleMeaning: 'Thích đồ ăn tự làm.' },
      { term: '場所', pronunciation: 'ばしょ', meaning: 'địa điểm', example: '住んでいる場所を教えてください。', exampleReading: 'すんでいるばしょをおしえてください。', exampleMeaning: 'Nơi bạn đang sống.' },
      { term: 'とき', pronunciation: 'とき', meaning: 'khi, lúc', example: '暇なとき、本を読みます。', exampleReading: 'ひまなとき、ほんをよみます。', exampleMeaning: 'Khi rảnh đọc sách.' },
      { term: '普通', pronunciation: 'ふつう', meaning: 'bình thường', example: '普通の生活が好きです。', exampleReading: 'ふつうのせいかつがすきです。', exampleMeaning: 'Thích cuộc sống bình thường.' },
    ],
    grammar: [
      { pattern: 'V(普通形)＋N', meaning: 'N được bổ nghĩa bởi V', usage: 'Động từ ở thể thường đứng trước danh từ.', example: '昨日会った人は田中さんです。', exampleReading: 'きのうあったひとはたなかさんです。', exampleMeaning: 'Người tôi gặp hôm qua là Tanaka.' },
      { pattern: 'adj/V(普通形)＋とき', meaning: 'khi ~', usage: 'とき chỉ thời điểm.', example: '暇なとき、本を読みます。', exampleReading: 'ひまなとき、ほんをよみます。', exampleMeaning: 'Khi rảnh đọc sách.' },
    ],
  },
  { title: 'Bài 24 — Lời khuyên', description: '～たほうがいい, ～ないほうがいい.',
    vocab: [
      { term: '医者', pronunciation: 'いしゃ', meaning: 'bác sĩ', example: '医者に行ったほうがいいです。', exampleReading: 'いしゃにいったほうがいいです。', exampleMeaning: 'Nên đi khám bác sĩ.' },
      { term: '気をつける', pronunciation: 'きをつける', meaning: 'chú ý, cẩn thận', example: '健康に気をつけたほうがいいですよ。', exampleReading: 'けんこうにきをつけたほうがいいですよ。', exampleMeaning: 'Nên chú ý sức khỏe.' },
      { term: 'はず', pronunciation: 'はず', meaning: 'lẽ ra phải ~', example: '彼はもう来るはずです。', exampleReading: 'かれはもうくるはずです。', exampleMeaning: 'Anh ấy lẽ ra đã đến rồi.' },
      { term: '相談する', pronunciation: 'そうだんする', meaning: 'hỏi ý kiến', example: '先生に相談したほうがいいです。', exampleReading: 'せんせいにそうだんしたほうがいいです。', exampleMeaning: 'Nên hỏi ý kiến thầy.' },
      { term: '早く', pronunciation: 'はやく', meaning: 'sớm hơn, nhanh', example: '早く寝たほうがいいです。', exampleReading: 'はやくねたほうがいいです。', exampleMeaning: 'Nên ngủ sớm hơn.' },
    ],
    grammar: [
      { pattern: 'V-た＋ほうがいい', meaning: 'nên V', usage: 'Lời khuyên nên làm.', example: 'もっと寝たほうがいいです。', exampleReading: 'もっとねたほうがいいです。', exampleMeaning: 'Nên ngủ nhiều hơn.' },
      { pattern: 'V-ない＋ほうがいい', meaning: 'không nên V', usage: 'Khuyên không làm.', example: '夜遅く食べないほうがいいです。', exampleReading: 'よるおそくたべないほうがいいです。', exampleMeaning: 'Không nên ăn quá khuya.' },
    ],
  },
  { title: 'Bài 25 — Dự định, ý định', description: '～つもりです, ～予定です.',
    vocab: [
      { term: 'つもり', pronunciation: 'つもり', meaning: 'có ý định', example: '来年、日本に行くつもりです。', exampleReading: 'らいねん、にほんにいくつもりです。', exampleMeaning: 'Dự định đến Nhật năm sau.' },
      { term: '予定', pronunciation: 'よてい', meaning: 'kế hoạch', example: '3時に会議の予定があります。', exampleReading: 'さんじにかいぎのよていがあります。', exampleMeaning: 'Có kế hoạch họp lúc 3 giờ.' },
      { term: '卒業する', pronunciation: 'そつぎょうする', meaning: 'tốt nghiệp', example: '来春、大学を卒業する予定です。', exampleReading: 'らいしゅんだいがくをそつぎょうするよていです。', exampleMeaning: 'Dự kiến tốt nghiệp mùa xuân tới.' },
      { term: '就職する', pronunciation: 'しゅうしょくする', meaning: 'đi làm', example: '東京で就職するつもりです。', exampleReading: 'とうきょうでしゅうしょくするつもりです。', exampleMeaning: 'Dự định đi làm ở Tokyo.' },
      { term: '計画', pronunciation: 'けいかく', meaning: 'kế hoạch (chi tiết)', example: 'もう計画が決まりましたか？', exampleReading: 'もうけいかくがきまりましたか？', exampleMeaning: 'Kế hoạch đã xong chưa?' },
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

      await prisma.content.deleteMany({ where: { lessonId } });

      if (skill === 'vocab') {
        const createdVocab = await prisma.content.createManyAndReturn({
          data: lesson.vocab.map((w, idx) => ({
            lessonId, type: 'vocab', language: 'ja',
            term: w.term, pronunciation: w.pronunciation ?? null, order: idx + 1,
          })),
        });
        await prisma.contentMeaning.createMany({
          data: createdVocab.map((c, idx) => ({ contentId: c.id, language: 'vi', meaning: lesson.vocab[idx].meaning })),
        });
        const vocabExamples = createdVocab
          .map((c, idx) => ({ c, w: lesson.vocab[idx] }))
          .filter(({ w }) => w.example)
          .map(({ c, w }) => ({ contentId: c.id, exampleText: w.example!, translation: w.exampleMeaning ?? null, language: 'ja' as Language, translationLanguage: w.exampleMeaning ? 'vi' as Language : null }));
        if (vocabExamples.length > 0) await prisma.contentExample.createMany({ data: vocabExamples });
        itemTotal += createdVocab.length;
      } else {
        const createdGrammar = await prisma.content.createManyAndReturn({
          data: lesson.grammar.map((g, idx) => ({
            lessonId, type: 'grammar', language: 'ja',
            term: g.pattern, pronunciation: null, order: idx + 1,
          })),
        });
        await prisma.contentMeaning.createMany({
          data: createdGrammar.map((c, idx) => ({ contentId: c.id, language: 'vi', meaning: lesson.grammar[idx].meaning })),
        });
        const grammarExamples = createdGrammar
          .map((c, idx) => ({ c, g: lesson.grammar[idx] }))
          .filter(({ g }) => g.example)
          .map(({ c, g }) => ({ contentId: c.id, exampleText: g.example!, translation: g.exampleMeaning ?? null, language: 'ja' as Language, translationLanguage: g.exampleMeaning ? 'vi' as Language : null }));
        if (grammarExamples.length > 0) await prisma.contentExample.createMany({ data: grammarExamples });
        itemTotal += createdGrammar.length;
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
