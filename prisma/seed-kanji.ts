import { PrismaClient, Prisma, Language } from '@prisma/client';

const prisma = new PrismaClient();

// ─── JLPT N5 Kanji (80 kanji, 8 lessons × 10) ────────────────────────────────
interface KanjiExample {
  word: string; reading: string; meaning: string;
  sentence?: string; sentenceReading?: string; sentenceMeaning?: string;
}
const N5_KANJI: Array<{
  character: string; onyomi: string; kunyomi: string; meaning: string;
  strokeCount: number; radical?: string; radicalMeaning?: string;
  examples?: KanjiExample[];
}> = [
  // Lesson 1: Numbers & Basics
  { character: '一', onyomi: 'イチ', kunyomi: 'ひと(つ)', meaning: 'Một', strokeCount: 1, radical: '一', radicalMeaning: 'Một', examples: [
    { word: '一つ', reading: 'ひとつ', meaning: 'Một cái', sentence: 'りんごを一つください。', sentenceReading: 'りんごをひとつください。', sentenceMeaning: 'Cho tôi một quả táo.' },
    { word: '一人', reading: 'ひとり', meaning: 'Một người', sentence: '一人で行きます。', sentenceReading: 'ひとりでいきます。', sentenceMeaning: 'Tôi đi một mình.' },
  ] },
  { character: '二', onyomi: 'ニ', kunyomi: 'ふた(つ)', meaning: 'Hai', strokeCount: 2, radical: '二', radicalMeaning: 'Hai', examples: [
    { word: '二つ', reading: 'ふたつ', meaning: 'Hai cái', sentence: '二つの箱があります。', sentenceReading: 'ふたつのはこがあります。', sentenceMeaning: 'Có hai cái hộp.' },
    { word: '二人', reading: 'ふたり', meaning: 'Hai người', sentence: '二人で映画を見ました。', sentenceReading: 'ふたりでえいがをみました。', sentenceMeaning: 'Hai người cùng xem phim.' },
  ] },
  { character: '三', onyomi: 'サン', kunyomi: 'み(つ)', meaning: 'Ba', strokeCount: 3, radical: '一', radicalMeaning: 'Một', examples: [
    { word: '三つ', reading: 'みっつ', meaning: 'Ba cái', sentence: 'いちごを三つ食べました。', sentenceReading: 'いちごをみっつたべました。', sentenceMeaning: 'Tôi đã ăn ba quả dâu.' },
    { word: '三月', reading: 'さんがつ', meaning: 'Tháng 3', sentence: '三月に桜が咲きます。', sentenceReading: 'さんがつにさくらがさきます。', sentenceMeaning: 'Hoa anh đào nở vào tháng 3.' },
  ] },
  { character: '四', onyomi: 'シ', kunyomi: 'よ(つ)', meaning: 'Bốn', strokeCount: 5, radical: '囗', radicalMeaning: 'Bao vây', examples: [
    { word: '四つ', reading: 'よっつ', meaning: 'Bốn cái', sentence: 'コップが四つあります。', sentenceReading: 'コップがよっつあります。', sentenceMeaning: 'Có bốn cái cốc.' },
    { word: '四月', reading: 'しがつ', meaning: 'Tháng 4', sentence: '四月は新学期です。', sentenceReading: 'しがつはしんがっきです。', sentenceMeaning: 'Tháng 4 là học kỳ mới.' },
  ] },
  { character: '五', onyomi: 'ゴ', kunyomi: 'いつ(つ)', meaning: 'Năm', strokeCount: 4, radical: '二', radicalMeaning: 'Hai', examples: [
    { word: '五つ', reading: 'いつつ', meaning: 'Năm cái', sentence: '五つ星のホテルに泊まりました。', sentenceReading: 'いつつぼしのホテルにとまりました。', sentenceMeaning: 'Tôi ở khách sạn năm sao.' },
    { word: '五月', reading: 'ごがつ', meaning: 'Tháng 5', sentence: '五月は暑くなります。', sentenceReading: 'ごがつはあつくなります。', sentenceMeaning: 'Tháng 5 trời nóng lên.' },
  ] },
  { character: '六', onyomi: 'ロク', kunyomi: 'む(つ)', meaning: 'Sáu', strokeCount: 4, radical: '八', radicalMeaning: 'Tám', examples: [
    { word: '六つ', reading: 'むっつ', meaning: 'Sáu cái', sentence: '卵を六つ買いました。', sentenceReading: 'たまごをむっつかいました。', sentenceMeaning: 'Tôi đã mua sáu quả trứng.' },
    { word: '六月', reading: 'ろくがつ', meaning: 'Tháng 6', sentence: '六月は雨が多いです。', sentenceReading: 'ろくがつはあめがおおいです。', sentenceMeaning: 'Tháng 6 mưa nhiều.' },
  ] },
  { character: '七', onyomi: 'シチ', kunyomi: 'なな(つ)', meaning: 'Bảy', strokeCount: 2, radical: '一', radicalMeaning: 'Một', examples: [
    { word: '七つ', reading: 'ななつ', meaning: 'Bảy cái', sentence: '七つの宝石があります。', sentenceReading: 'ななつのほうせきがあります。', sentenceMeaning: 'Có bảy viên đá quý.' },
    { word: '七月', reading: 'しちがつ', meaning: 'Tháng 7', sentence: '七月に祭りがあります。', sentenceReading: 'しちがつにまつりがあります。', sentenceMeaning: 'Tháng 7 có lễ hội.' },
  ] },
  { character: '八', onyomi: 'ハチ', kunyomi: 'や(つ)', meaning: 'Tám', strokeCount: 2, radical: '八', radicalMeaning: 'Tám', examples: [
    { word: '八つ', reading: 'やっつ', meaning: 'Tám cái', sentence: '八つのお菓子を配りました。', sentenceReading: 'やっつのおかしをくばりました。', sentenceMeaning: 'Tôi đã phát tám cái bánh.' },
    { word: '八月', reading: 'はちがつ', meaning: 'Tháng 8', sentence: '八月に海に行きます。', sentenceReading: 'はちがつにうみにいきます。', sentenceMeaning: 'Tháng 8 tôi đi biển.' },
  ] },
  { character: '九', onyomi: 'キュウ', kunyomi: 'ここの(つ)', meaning: 'Chín', strokeCount: 2, radical: '乙', radicalMeaning: 'Ất', examples: [
    { word: '九つ', reading: 'ここのつ', meaning: 'Chín cái', sentence: '九つのボールが残っています。', sentenceReading: 'ここのつのボールがのこっています。', sentenceMeaning: 'Còn lại chín quả bóng.' },
    { word: '九月', reading: 'くがつ', meaning: 'Tháng 9', sentence: '九月から学校が始まります。', sentenceReading: 'くがつからがっこうがはじまります。', sentenceMeaning: 'Trường học bắt đầu từ tháng 9.' },
  ] },
  { character: '十', onyomi: 'ジュウ', kunyomi: 'とお', meaning: 'Mười', strokeCount: 2, radical: '十', radicalMeaning: 'Mười', examples: [
    { word: '十', reading: 'じゅう', meaning: 'Mười', sentence: '一から十まで数えてください。', sentenceReading: 'いちからじゅうまでかぞえてください。', sentenceMeaning: 'Hãy đếm từ 1 đến 10.' },
    { word: '十月', reading: 'じゅうがつ', meaning: 'Tháng 10', sentence: '十月は涼しいです。', sentenceReading: 'じゅうがつはすずしいです。', sentenceMeaning: 'Tháng 10 mát mẻ.' },
  ] },

  // Lesson 2: People & Nature
  { character: '人', onyomi: 'ジン', kunyomi: 'ひと', meaning: 'Người', strokeCount: 2, radical: '人', radicalMeaning: 'Người', examples: [
    { word: '日本人', reading: 'にほんじん', meaning: 'Người Nhật', sentence: '彼は日本人です。', sentenceReading: 'かれはにほんじんです。', sentenceMeaning: 'Anh ấy là người Nhật.' },
    { word: '人々', reading: 'ひとびと', meaning: 'Mọi người', sentence: '人々が公園に集まりました。', sentenceReading: 'ひとびとがこうえんにあつまりました。', sentenceMeaning: 'Mọi người tụ tập ở công viên.' },
  ] },
  { character: '大', onyomi: 'ダイ', kunyomi: 'おお(きい)', meaning: 'Lớn', strokeCount: 3, radical: '大', radicalMeaning: 'Lớn', examples: [
    { word: '大学', reading: 'だいがく', meaning: 'Đại học', sentence: '来年大学に入ります。', sentenceReading: 'らいねんだいがくにはいります。', sentenceMeaning: 'Năm sau tôi vào đại học.' },
    { word: '大きい', reading: 'おおきい', meaning: 'To, lớn', sentence: 'この犬は大きいですね。', sentenceReading: 'このいぬはおおきいですね。', sentenceMeaning: 'Con chó này to nhỉ.' },
  ] },
  { character: '小', onyomi: 'ショウ', kunyomi: 'ちい(さい)', meaning: 'Nhỏ', strokeCount: 3, radical: '小', radicalMeaning: 'Nhỏ', examples: [
    { word: '小学校', reading: 'しょうがっこう', meaning: 'Trường tiểu học', sentence: '妹は小学校に通っています。', sentenceReading: 'いもうとはしょうがっこうにかよっています。', sentenceMeaning: 'Em gái tôi đang học tiểu học.' },
    { word: '小さい', reading: 'ちいさい', meaning: 'Nhỏ bé', sentence: 'この花は小さいけど綺麗です。', sentenceReading: 'このはなはちいさいけどきれいです。', sentenceMeaning: 'Bông hoa này nhỏ nhưng đẹp.' },
  ] },
  { character: '日', onyomi: 'ニチ', kunyomi: 'ひ', meaning: 'Ngày, mặt trời', strokeCount: 4, radical: '日', radicalMeaning: 'Mặt trời', examples: [
    { word: '日本', reading: 'にほん', meaning: 'Nhật Bản', sentence: '日本に旅行に行きたいです。', sentenceReading: 'にほんにりょこうにいきたいです。', sentenceMeaning: 'Tôi muốn đi du lịch Nhật Bản.' },
    { word: '毎日', reading: 'まいにち', meaning: 'Mỗi ngày', sentence: '毎日日本語を勉強しています。', sentenceReading: 'まいにちにほんごをべんきょうしています。', sentenceMeaning: 'Tôi học tiếng Nhật mỗi ngày.' },
  ] },
  { character: '月', onyomi: 'ゲツ', kunyomi: 'つき', meaning: 'Tháng, mặt trăng', strokeCount: 4, radical: '月', radicalMeaning: 'Mặt trăng', examples: [
    { word: '月曜日', reading: 'げつようび', meaning: 'Thứ hai', sentence: '月曜日は忙しいです。', sentenceReading: 'げつようびはいそがしいです。', sentenceMeaning: 'Thứ hai rất bận.' },
    { word: '今月', reading: 'こんげつ', meaning: 'Tháng này', sentence: '今月は休みが多いです。', sentenceReading: 'こんげつはやすみがおおいです。', sentenceMeaning: 'Tháng này nhiều ngày nghỉ.' },
  ] },
  { character: '火', onyomi: 'カ', kunyomi: 'ひ', meaning: 'Lửa', strokeCount: 4, radical: '火', radicalMeaning: 'Lửa', examples: [
    { word: '火曜日', reading: 'かようび', meaning: 'Thứ ba', sentence: '火曜日にテストがあります。', sentenceReading: 'かようびにテストがあります。', sentenceMeaning: 'Thứ ba có bài kiểm tra.' },
    { word: '火事', reading: 'かじ', meaning: 'Hỏa hoạn', sentence: '隣の家で火事がありました。', sentenceReading: 'となりのいえでかじがありました。', sentenceMeaning: 'Nhà hàng xóm bị cháy.' },
  ] },
  { character: '水', onyomi: 'スイ', kunyomi: 'みず', meaning: 'Nước', strokeCount: 4, radical: '水', radicalMeaning: 'Nước', examples: [
    { word: '水曜日', reading: 'すいようび', meaning: 'Thứ tư', sentence: '水曜日は早く帰ります。', sentenceReading: 'すいようびははやくかえります。', sentenceMeaning: 'Thứ tư tôi về sớm.' },
    { word: '水', reading: 'みず', meaning: 'Nước', sentence: 'お水をください。', sentenceReading: 'おみずをください。', sentenceMeaning: 'Cho tôi nước.' },
  ] },
  { character: '木', onyomi: 'モク', kunyomi: 'き', meaning: 'Cây, gỗ', strokeCount: 4, radical: '木', radicalMeaning: 'Cây', examples: [
    { word: '木曜日', reading: 'もくようび', meaning: 'Thứ năm', sentence: '木曜日に友達と会います。', sentenceReading: 'もくようびにともだちとあいます。', sentenceMeaning: 'Thứ năm tôi gặp bạn.' },
    { word: '木', reading: 'き', meaning: 'Cây', sentence: '庭に大きい木があります。', sentenceReading: 'にわにおおきいきがあります。', sentenceMeaning: 'Trong vườn có một cây to.' },
  ] },
  { character: '金', onyomi: 'キン', kunyomi: 'かね', meaning: 'Vàng, tiền', strokeCount: 8, radical: '金', radicalMeaning: 'Kim loại', examples: [
    { word: '金曜日', reading: 'きんようび', meaning: 'Thứ sáu', sentence: '金曜日の夜は楽しいです。', sentenceReading: 'きんようびのよるはたのしいです。', sentenceMeaning: 'Tối thứ sáu vui lắm.' },
    { word: 'お金', reading: 'おかね', meaning: 'Tiền', sentence: 'お金を銀行に預けました。', sentenceReading: 'おかねをぎんこうにあずけました。', sentenceMeaning: 'Tôi gửi tiền vào ngân hàng.' },
  ] },
  { character: '土', onyomi: 'ド', kunyomi: 'つち', meaning: 'Đất', strokeCount: 3, radical: '土', radicalMeaning: 'Đất', examples: [
    { word: '土曜日', reading: 'どようび', meaning: 'Thứ bảy', sentence: '土曜日に買い物に行きます。', sentenceReading: 'どようびにかいものにいきます。', sentenceMeaning: 'Thứ bảy tôi đi mua sắm.' },
    { word: '土地', reading: 'とち', meaning: 'Đất đai', sentence: 'この土地は安いです。', sentenceReading: 'このとちはやすいです。', sentenceMeaning: 'Mảnh đất này rẻ.' },
  ] },

  // Lesson 3: Time & Direction
  { character: '年', onyomi: 'ネン', kunyomi: 'とし', meaning: 'Năm', strokeCount: 6, radical: '干', radicalMeaning: 'Can', examples: [
    { word: '今年', reading: 'ことし', meaning: 'Năm nay', sentence: '今年は日本に行きます。', sentenceReading: 'ことしはにほんにいきます。', sentenceMeaning: 'Năm nay tôi đi Nhật.' },
    { word: '去年', reading: 'きょねん', meaning: 'Năm ngoái', sentence: '去年、京都に行きました。', sentenceReading: 'きょねん、きょうとにいきました。', sentenceMeaning: 'Năm ngoái tôi đã đi Kyoto.' },
  ] },
  { character: '時', onyomi: 'ジ', kunyomi: 'とき', meaning: 'Giờ, thời gian', strokeCount: 10, radical: '日', radicalMeaning: 'Mặt trời', examples: [
    { word: '時間', reading: 'じかん', meaning: 'Thời gian', sentence: '時間がありません。', sentenceReading: 'じかんがありません。', sentenceMeaning: 'Không có thời gian.' },
    { word: '時計', reading: 'とけい', meaning: 'Đồng hồ', sentence: 'この時計は高いです。', sentenceReading: 'このとけいはたかいです。', sentenceMeaning: 'Chiếc đồng hồ này đắt.' },
  ] },
  { character: '分', onyomi: 'ブン', kunyomi: 'わ(かる)', meaning: 'Phút, chia', strokeCount: 4, radical: '刀', radicalMeaning: 'Dao', examples: [
    { word: '十分', reading: 'じゅっぷん', meaning: '10 phút', sentence: '十分待ってください。', sentenceReading: 'じゅっぷんまってください。', sentenceMeaning: 'Xin hãy đợi 10 phút.' },
    { word: '分かる', reading: 'わかる', meaning: 'Hiểu', sentence: '日本語が分かりますか？', sentenceReading: 'にほんごがわかりますか？', sentenceMeaning: 'Bạn hiểu tiếng Nhật không?' },
  ] },
  { character: '半', onyomi: 'ハン', kunyomi: 'なか(ば)', meaning: 'Nửa', strokeCount: 5, radical: '十', radicalMeaning: 'Mười', examples: [
    { word: '半分', reading: 'はんぶん', meaning: 'Một nửa', sentence: 'ケーキの半分をあげます。', sentenceReading: 'ケーキのはんぶんをあげます。', sentenceMeaning: 'Tôi cho bạn một nửa bánh.' },
    { word: '三時半', reading: 'さんじはん', meaning: '3 giờ rưỡi', sentence: '三時半に会いましょう。', sentenceReading: 'さんじはんにあいましょう。', sentenceMeaning: 'Hẹn gặp lúc 3 giờ rưỡi.' },
  ] },
  { character: '上', onyomi: 'ジョウ', kunyomi: 'うえ', meaning: 'Trên', strokeCount: 3, radical: '一', radicalMeaning: 'Một', examples: [
    { word: '上手', reading: 'じょうず', meaning: 'Giỏi', sentence: '彼女は歌が上手です。', sentenceReading: 'かのじょはうたがじょうずです。', sentenceMeaning: 'Cô ấy hát rất giỏi.' },
    { word: '上', reading: 'うえ', meaning: 'Phía trên', sentence: '机の上に本があります。', sentenceReading: 'つくえのうえにほんがあります。', sentenceMeaning: 'Trên bàn có cuốn sách.' },
  ] },
  { character: '下', onyomi: 'カ', kunyomi: 'した', meaning: 'Dưới', strokeCount: 3, radical: '一', radicalMeaning: 'Một', examples: [
    { word: '下手', reading: 'へた', meaning: 'Kém', sentence: '料理が下手です。', sentenceReading: 'りょうりがへたです。', sentenceMeaning: 'Tôi nấu ăn dở.' },
    { word: '下', reading: 'した', meaning: 'Phía dưới', sentence: '椅子の下に猫がいます。', sentenceReading: 'いすのしたにねこがいます。', sentenceMeaning: 'Dưới ghế có con mèo.' },
  ] },
  { character: '中', onyomi: 'チュウ', kunyomi: 'なか', meaning: 'Trong, giữa', strokeCount: 4, radical: '丨', radicalMeaning: 'Nét sổ', examples: [
    { word: '中国', reading: 'ちゅうごく', meaning: 'Trung Quốc', sentence: '中国語を勉強しています。', sentenceReading: 'ちゅうごくごをべんきょうしています。', sentenceMeaning: 'Tôi đang học tiếng Trung.' },
    { word: '中', reading: 'なか', meaning: 'Bên trong', sentence: '箱の中に何がありますか？', sentenceReading: 'はこのなかになにがありますか？', sentenceMeaning: 'Trong hộp có gì?' },
  ] },
  { character: '右', onyomi: 'ウ', kunyomi: 'みぎ', meaning: 'Phải', strokeCount: 5, radical: '口', radicalMeaning: 'Miệng', examples: [
    { word: '右', reading: 'みぎ', meaning: 'Bên phải', sentence: '右に曲がってください。', sentenceReading: 'みぎにまがってください。', sentenceMeaning: 'Hãy rẽ phải.' },
    { word: '右手', reading: 'みぎて', meaning: 'Tay phải', sentence: '右手で字を書きます。', sentenceReading: 'みぎてでじをかきます。', sentenceMeaning: 'Tôi viết chữ bằng tay phải.' },
  ] },
  { character: '左', onyomi: 'サ', kunyomi: 'ひだり', meaning: 'Trái', strokeCount: 5, radical: '工', radicalMeaning: 'Công', examples: [
    { word: '左', reading: 'ひだり', meaning: 'Bên trái', sentence: '左に銀行があります。', sentenceReading: 'ひだりにぎんこうがあります。', sentenceMeaning: 'Bên trái có ngân hàng.' },
    { word: '左手', reading: 'ひだりて', meaning: 'Tay trái', sentence: '左手でお箸を使います。', sentenceReading: 'ひだりてでおはしをつかいます。', sentenceMeaning: 'Tôi dùng đũa tay trái.' },
  ] },
  { character: '前', onyomi: 'ゼン', kunyomi: 'まえ', meaning: 'Trước', strokeCount: 9, radical: '刀', radicalMeaning: 'Dao', examples: [
    { word: '名前', reading: 'なまえ', meaning: 'Tên', sentence: 'お名前は何ですか？', sentenceReading: 'おなまえはなんですか？', sentenceMeaning: 'Tên bạn là gì?' },
    { word: '前', reading: 'まえ', meaning: 'Phía trước', sentence: '駅の前にバス停があります。', sentenceReading: 'えきのまえにバスていがあります。', sentenceMeaning: 'Trước ga có trạm xe buýt.' },
  ] },

  // Lesson 4: Actions & School
  { character: '後', onyomi: 'ゴ', kunyomi: 'うし(ろ)', meaning: 'Sau', strokeCount: 9, radical: '彳', radicalMeaning: 'Bước chân', examples: [{ word: '午後', reading: 'ごご', meaning: 'Buổi chiều' }, { word: '後ろ', reading: 'うしろ', meaning: 'Phía sau' }] },
  { character: '外', onyomi: 'ガイ', kunyomi: 'そと', meaning: 'Ngoài', strokeCount: 5, radical: '夕', radicalMeaning: 'Chiều tối', examples: [{ word: '外国', reading: 'がいこく', meaning: 'Nước ngoài' }, { word: '外', reading: 'そと', meaning: 'Bên ngoài' }] },
  { character: '北', onyomi: 'ホク', kunyomi: 'きた', meaning: 'Bắc', strokeCount: 5, radical: '匕', radicalMeaning: 'Thìa', examples: [{ word: '北', reading: 'きた', meaning: 'Phía bắc' }, { word: '北海道', reading: 'ほっかいどう', meaning: 'Hokkaido' }] },
  { character: '南', onyomi: 'ナン', kunyomi: 'みなみ', meaning: 'Nam', strokeCount: 9, radical: '十', radicalMeaning: 'Mười', examples: [{ word: '南', reading: 'みなみ', meaning: 'Phía nam' }, { word: '南口', reading: 'みなみぐち', meaning: 'Cửa phía nam' }] },
  { character: '東', onyomi: 'トウ', kunyomi: 'ひがし', meaning: 'Đông', strokeCount: 8, radical: '木', radicalMeaning: 'Cây', examples: [{ word: '東京', reading: 'とうきょう', meaning: 'Tokyo' }, { word: '東', reading: 'ひがし', meaning: 'Phía đông' }] },
  { character: '西', onyomi: 'セイ', kunyomi: 'にし', meaning: 'Tây', strokeCount: 6, radical: '西', radicalMeaning: 'Tây', examples: [{ word: '西', reading: 'にし', meaning: 'Phía tây' }, { word: '西口', reading: 'にしぐち', meaning: 'Cửa phía tây' }] },
  { character: '学', onyomi: 'ガク', kunyomi: 'まな(ぶ)', meaning: 'Học', strokeCount: 8, radical: '子', radicalMeaning: 'Con', examples: [{ word: '学生', reading: 'がくせい', meaning: 'Học sinh' }, { word: '学校', reading: 'がっこう', meaning: 'Trường học' }] },
  { character: '校', onyomi: 'コウ', kunyomi: '', meaning: 'Trường', strokeCount: 10, radical: '木', radicalMeaning: 'Cây', examples: [{ word: '学校', reading: 'がっこう', meaning: 'Trường học' }, { word: '高校', reading: 'こうこう', meaning: 'Trường cấp 3' }] },
  { character: '生', onyomi: 'セイ', kunyomi: 'い(きる)', meaning: 'Sống, sinh', strokeCount: 5, radical: '生', radicalMeaning: 'Sống', examples: [{ word: '先生', reading: 'せんせい', meaning: 'Thầy/cô' }, { word: '学生', reading: 'がくせい', meaning: 'Học sinh' }] },
  { character: '先', onyomi: 'セン', kunyomi: 'さき', meaning: 'Trước, tiên', strokeCount: 6, radical: '儿', radicalMeaning: 'Chân người', examples: [{ word: '先生', reading: 'せんせい', meaning: 'Thầy/cô' }, { word: '先週', reading: 'せんしゅう', meaning: 'Tuần trước' }] },

  // Lesson 5: Body & Family
  { character: '子', onyomi: 'シ', kunyomi: 'こ', meaning: 'Con', strokeCount: 3, radical: '子', radicalMeaning: 'Con', examples: [{ word: '子供', reading: 'こども', meaning: 'Trẻ em' }, { word: '女の子', reading: 'おんなのこ', meaning: 'Con gái' }] },
  { character: '女', onyomi: 'ジョ', kunyomi: 'おんな', meaning: 'Nữ', strokeCount: 3, radical: '女', radicalMeaning: 'Nữ', examples: [{ word: '女の人', reading: 'おんなのひと', meaning: 'Phụ nữ' }, { word: '女子', reading: 'じょし', meaning: 'Nữ giới' }] },
  { character: '男', onyomi: 'ダン', kunyomi: 'おとこ', meaning: 'Nam', strokeCount: 7, radical: '田', radicalMeaning: 'Ruộng', examples: [{ word: '男の人', reading: 'おとこのひと', meaning: 'Đàn ông' }, { word: '男子', reading: 'だんし', meaning: 'Nam giới' }] },
  { character: '父', onyomi: 'フ', kunyomi: 'ちち', meaning: 'Cha', strokeCount: 4, radical: '父', radicalMeaning: 'Cha', examples: [{ word: 'お父さん', reading: 'おとうさん', meaning: 'Bố' }, { word: '父', reading: 'ちち', meaning: 'Cha (kính ngữ)' }] },
  { character: '母', onyomi: 'ボ', kunyomi: 'はは', meaning: 'Mẹ', strokeCount: 5, radical: '母', radicalMeaning: 'Mẹ', examples: [{ word: 'お母さん', reading: 'おかあさん', meaning: 'Mẹ' }, { word: '母', reading: 'はは', meaning: 'Mẹ (kính ngữ)' }] },
  { character: '友', onyomi: 'ユウ', kunyomi: 'とも', meaning: 'Bạn', strokeCount: 4, radical: '又', radicalMeaning: 'Lại', examples: [{ word: '友達', reading: 'ともだち', meaning: 'Bạn bè' }, { word: '友人', reading: 'ゆうじん', meaning: 'Bạn hữu' }] },
  { character: '目', onyomi: 'モク', kunyomi: 'め', meaning: 'Mắt', strokeCount: 5, radical: '目', radicalMeaning: 'Mắt', examples: [{ word: '目', reading: 'め', meaning: 'Mắt' }, { word: '目的', reading: 'もくてき', meaning: 'Mục đích' }] },
  { character: '耳', onyomi: 'ジ', kunyomi: 'みみ', meaning: 'Tai', strokeCount: 6, radical: '耳', radicalMeaning: 'Tai', examples: [{ word: '耳', reading: 'みみ', meaning: 'Tai' }] },
  { character: '口', onyomi: 'コウ', kunyomi: 'くち', meaning: 'Miệng', strokeCount: 3, radical: '口', radicalMeaning: 'Miệng', examples: [{ word: '入口', reading: 'いりぐち', meaning: 'Lối vào' }, { word: '出口', reading: 'でぐち', meaning: 'Lối ra' }] },
  { character: '手', onyomi: 'シュ', kunyomi: 'て', meaning: 'Tay', strokeCount: 4, radical: '手', radicalMeaning: 'Tay', examples: [{ word: '上手', reading: 'じょうず', meaning: 'Giỏi' }, { word: '下手', reading: 'へた', meaning: 'Kém' }] },

  // Lesson 6: Actions
  { character: '足', onyomi: 'ソク', kunyomi: 'あし', meaning: 'Chân', strokeCount: 7, radical: '足', radicalMeaning: 'Chân', examples: [{ word: '足', reading: 'あし', meaning: 'Chân' }, { word: '足りる', reading: 'たりる', meaning: 'Đủ' }] },
  { character: '見', onyomi: 'ケン', kunyomi: 'み(る)', meaning: 'Xem, nhìn', strokeCount: 7, radical: '見', radicalMeaning: 'Nhìn', examples: [{ word: '見る', reading: 'みる', meaning: 'Xem' }, { word: '花見', reading: 'はなみ', meaning: 'Ngắm hoa' }] },
  { character: '聞', onyomi: 'ブン', kunyomi: 'き(く)', meaning: 'Nghe', strokeCount: 14, radical: '耳', radicalMeaning: 'Tai', examples: [{ word: '聞く', reading: 'きく', meaning: 'Nghe' }, { word: '新聞', reading: 'しんぶん', meaning: 'Báo' }] },
  { character: '食', onyomi: 'ショク', kunyomi: 'た(べる)', meaning: 'Ăn', strokeCount: 9, radical: '食', radicalMeaning: 'Ăn', examples: [{ word: '食べる', reading: 'たべる', meaning: 'Ăn' }, { word: '食堂', reading: 'しょくどう', meaning: 'Nhà ăn' }] },
  { character: '飲', onyomi: 'イン', kunyomi: 'の(む)', meaning: 'Uống', strokeCount: 12, radical: '食', radicalMeaning: 'Ăn', examples: [{ word: '飲む', reading: 'のむ', meaning: 'Uống' }, { word: '飲み物', reading: 'のみもの', meaning: 'Đồ uống' }] },
  { character: '読', onyomi: 'ドク', kunyomi: 'よ(む)', meaning: 'Đọc', strokeCount: 14, radical: '言', radicalMeaning: 'Lời nói', examples: [{ word: '読む', reading: 'よむ', meaning: 'Đọc' }, { word: '読書', reading: 'どくしょ', meaning: 'Đọc sách' }] },
  { character: '書', onyomi: 'ショ', kunyomi: 'か(く)', meaning: 'Viết', strokeCount: 10, radical: '曰', radicalMeaning: 'Nói', examples: [{ word: '書く', reading: 'かく', meaning: 'Viết' }, { word: '辞書', reading: 'じしょ', meaning: 'Từ điển' }] },
  { character: '話', onyomi: 'ワ', kunyomi: 'はな(す)', meaning: 'Nói chuyện', strokeCount: 13, radical: '言', radicalMeaning: 'Lời nói', examples: [{ word: '話す', reading: 'はなす', meaning: 'Nói' }, { word: '電話', reading: 'でんわ', meaning: 'Điện thoại' }] },
  { character: '行', onyomi: 'コウ', kunyomi: 'い(く)', meaning: 'Đi', strokeCount: 6, radical: '行', radicalMeaning: 'Đi', examples: [{ word: '行く', reading: 'いく', meaning: 'Đi' }, { word: '旅行', reading: 'りょこう', meaning: 'Du lịch' }] },
  { character: '来', onyomi: 'ライ', kunyomi: 'く(る)', meaning: 'Đến', strokeCount: 7, radical: '木', radicalMeaning: 'Cây', examples: [{ word: '来る', reading: 'くる', meaning: 'Đến' }, { word: '来年', reading: 'らいねん', meaning: 'Năm sau' }] },

  // Lesson 7: Places & Things
  { character: '出', onyomi: 'シュツ', kunyomi: 'で(る)', meaning: 'Ra', strokeCount: 5, radical: '凵', radicalMeaning: 'Hõm', examples: [{ word: '出る', reading: 'でる', meaning: 'Ra' }, { word: '出口', reading: 'でぐち', meaning: 'Lối ra' }] },
  { character: '入', onyomi: 'ニュウ', kunyomi: 'はい(る)', meaning: 'Vào', strokeCount: 2, radical: '入', radicalMeaning: 'Vào', examples: [{ word: '入る', reading: 'はいる', meaning: 'Vào' }, { word: '入口', reading: 'いりぐち', meaning: 'Lối vào' }] },
  { character: '山', onyomi: 'サン', kunyomi: 'やま', meaning: 'Núi', strokeCount: 3, radical: '山', radicalMeaning: 'Núi', examples: [{ word: '山', reading: 'やま', meaning: 'Núi' }, { word: '富士山', reading: 'ふじさん', meaning: 'Núi Phú Sĩ' }] },
  { character: '川', onyomi: 'セン', kunyomi: 'かわ', meaning: 'Sông', strokeCount: 3, radical: '川', radicalMeaning: 'Sông', examples: [{ word: '川', reading: 'かわ', meaning: 'Sông' }] },
  { character: '田', onyomi: 'デン', kunyomi: 'た', meaning: 'Ruộng', strokeCount: 5, radical: '田', radicalMeaning: 'Ruộng', examples: [{ word: '田中', reading: 'たなか', meaning: 'Tanaka (họ)' }] },
  { character: '天', onyomi: 'テン', kunyomi: 'あま', meaning: 'Trời', strokeCount: 4, radical: '大', radicalMeaning: 'Lớn', examples: [{ word: '天気', reading: 'てんき', meaning: 'Thời tiết' }, { word: '天', reading: 'てん', meaning: 'Trời' }] },
  { character: '気', onyomi: 'キ', kunyomi: '', meaning: 'Khí, tinh thần', strokeCount: 6, radical: '气', radicalMeaning: 'Hơi', examples: [{ word: '天気', reading: 'てんき', meaning: 'Thời tiết' }, { word: '元気', reading: 'げんき', meaning: 'Khỏe mạnh' }] },
  { character: '雨', onyomi: 'ウ', kunyomi: 'あめ', meaning: 'Mưa', strokeCount: 8, radical: '雨', radicalMeaning: 'Mưa', examples: [{ word: '雨', reading: 'あめ', meaning: 'Mưa' }, { word: '大雨', reading: 'おおあめ', meaning: 'Mưa to' }] },
  { character: '電', onyomi: 'デン', kunyomi: '', meaning: 'Điện', strokeCount: 13, radical: '雨', radicalMeaning: 'Mưa', examples: [{ word: '電話', reading: 'でんわ', meaning: 'Điện thoại' }, { word: '電車', reading: 'でんしゃ', meaning: 'Tàu điện' }] },
  { character: '車', onyomi: 'シャ', kunyomi: 'くるま', meaning: 'Xe', strokeCount: 7, radical: '車', radicalMeaning: 'Xe', examples: [{ word: '電車', reading: 'でんしゃ', meaning: 'Tàu điện' }, { word: '車', reading: 'くるま', meaning: 'Ô tô' }] },

  // Lesson 8: Adjectives & Misc
  { character: '高', onyomi: 'コウ', kunyomi: 'たか(い)', meaning: 'Cao, đắt', strokeCount: 10, radical: '高', radicalMeaning: 'Cao', examples: [{ word: '高い', reading: 'たかい', meaning: 'Cao/đắt' }, { word: '高校', reading: 'こうこう', meaning: 'Cấp 3' }] },
  { character: '安', onyomi: 'アン', kunyomi: 'やす(い)', meaning: 'Rẻ, yên', strokeCount: 6, radical: '宀', radicalMeaning: 'Mái nhà', examples: [{ word: '安い', reading: 'やすい', meaning: 'Rẻ' }, { word: '安心', reading: 'あんしん', meaning: 'An tâm' }] },
  { character: '新', onyomi: 'シン', kunyomi: 'あたら(しい)', meaning: 'Mới', strokeCount: 13, radical: '斤', radicalMeaning: 'Cân', examples: [{ word: '新しい', reading: 'あたらしい', meaning: 'Mới' }, { word: '新聞', reading: 'しんぶん', meaning: 'Báo' }] },
  { character: '古', onyomi: 'コ', kunyomi: 'ふる(い)', meaning: 'Cũ', strokeCount: 5, radical: '口', radicalMeaning: 'Miệng', examples: [{ word: '古い', reading: 'ふるい', meaning: 'Cũ' }, { word: '中古', reading: 'ちゅうこ', meaning: 'Đã qua sử dụng' }] },
  { character: '長', onyomi: 'チョウ', kunyomi: 'なが(い)', meaning: 'Dài', strokeCount: 8, radical: '長', radicalMeaning: 'Dài', examples: [{ word: '長い', reading: 'ながい', meaning: 'Dài' }, { word: '社長', reading: 'しゃちょう', meaning: 'Giám đốc' }] },
  { character: '白', onyomi: 'ハク', kunyomi: 'しろ(い)', meaning: 'Trắng', strokeCount: 5, radical: '白', radicalMeaning: 'Trắng', examples: [{ word: '白い', reading: 'しろい', meaning: 'Trắng' }] },
  { character: '百', onyomi: 'ヒャク', kunyomi: '', meaning: 'Trăm', strokeCount: 6, radical: '白', radicalMeaning: 'Trắng', examples: [{ word: '百', reading: 'ひゃく', meaning: 'Một trăm' }, { word: '三百', reading: 'さんびゃく', meaning: 'Ba trăm' }] },
  { character: '千', onyomi: 'セン', kunyomi: 'ち', meaning: 'Nghìn', strokeCount: 3, radical: '十', radicalMeaning: 'Mười', examples: [{ word: '千', reading: 'せん', meaning: 'Một nghìn' }, { word: '千円', reading: 'せんえん', meaning: 'Nghìn yên' }] },
  { character: '万', onyomi: 'マン', kunyomi: '', meaning: 'Vạn', strokeCount: 3, radical: '一', radicalMeaning: 'Một', examples: [{ word: '一万', reading: 'いちまん', meaning: 'Mười nghìn' }, { word: '万年筆', reading: 'まんねんひつ', meaning: 'Bút máy' }] },
  { character: '円', onyomi: 'エン', kunyomi: 'まる(い)', meaning: 'Yên (tiền), tròn', strokeCount: 4, radical: '冂', radicalMeaning: 'Bao quanh', examples: [{ word: '百円', reading: 'ひゃくえん', meaning: 'Trăm yên' }, { word: '千円', reading: 'せんえん', meaning: 'Nghìn yên' }] },
];

// ─── JLPT N4 Kanji (sample first 50) ──────────────────────────────────────────
const N4_KANJI: typeof N5_KANJI = [
  { character: '会', onyomi: 'カイ', kunyomi: 'あ(う)', meaning: 'Gặp, hội', strokeCount: 6, radical: '人', examples: [{ word: '会う', reading: 'あう', meaning: 'Gặp' }, { word: '会社', reading: 'かいしゃ', meaning: 'Công ty' }] },
  { character: '同', onyomi: 'ドウ', kunyomi: 'おな(じ)', meaning: 'Giống nhau', strokeCount: 6, radical: '口', examples: [{ word: '同じ', reading: 'おなじ', meaning: 'Giống nhau' }] },
  { character: '事', onyomi: 'ジ', kunyomi: 'こと', meaning: 'Việc', strokeCount: 8, radical: '亅', examples: [{ word: '仕事', reading: 'しごと', meaning: 'Công việc' }, { word: '事', reading: 'こと', meaning: 'Điều, việc' }] },
  { character: '自', onyomi: 'ジ', kunyomi: 'みずか(ら)', meaning: 'Tự mình', strokeCount: 6, radical: '自', examples: [{ word: '自分', reading: 'じぶん', meaning: 'Bản thân' }, { word: '自転車', reading: 'じてんしゃ', meaning: 'Xe đạp' }] },
  { character: '社', onyomi: 'シャ', kunyomi: 'やしろ', meaning: 'Xã hội, công ty', strokeCount: 7, radical: '示', examples: [{ word: '会社', reading: 'かいしゃ', meaning: 'Công ty' }, { word: '社会', reading: 'しゃかい', meaning: 'Xã hội' }] },
  { character: '発', onyomi: 'ハツ', kunyomi: '', meaning: 'Phát, xuất phát', strokeCount: 9, radical: '癶', examples: [{ word: '出発', reading: 'しゅっぱつ', meaning: 'Xuất phát' }] },
  { character: '者', onyomi: 'シャ', kunyomi: 'もの', meaning: 'Người, kẻ', strokeCount: 8, radical: '老', examples: [{ word: '若者', reading: 'わかもの', meaning: 'Người trẻ' }] },
  { character: '地', onyomi: 'チ', kunyomi: '', meaning: 'Đất', strokeCount: 6, radical: '土', examples: [{ word: '地図', reading: 'ちず', meaning: 'Bản đồ' }, { word: '地下鉄', reading: 'ちかてつ', meaning: 'Tàu điện ngầm' }] },
  { character: '業', onyomi: 'ギョウ', kunyomi: 'わざ', meaning: 'Nghiệp', strokeCount: 13, radical: '木', examples: [{ word: '授業', reading: 'じゅぎょう', meaning: 'Tiết học' }, { word: '卒業', reading: 'そつぎょう', meaning: 'Tốt nghiệp' }] },
  { character: '方', onyomi: 'ホウ', kunyomi: 'かた', meaning: 'Phương, cách', strokeCount: 4, radical: '方', examples: [{ word: '方', reading: 'かた', meaning: 'Người (lịch sự)' }, { word: '方法', reading: 'ほうほう', meaning: 'Phương pháp' }] },
  { character: '新', onyomi: 'シン', kunyomi: 'あたら(しい)', meaning: 'Mới', strokeCount: 13, radical: '斤', examples: [{ word: '新しい', reading: 'あたらしい', meaning: 'Mới' }] },
  { character: '場', onyomi: 'ジョウ', kunyomi: 'ば', meaning: 'Nơi, chỗ', strokeCount: 12, radical: '土', examples: [{ word: '場所', reading: 'ばしょ', meaning: 'Địa điểm' }] },
  { character: '員', onyomi: 'イン', kunyomi: '', meaning: 'Nhân viên', strokeCount: 10, radical: '口', examples: [{ word: '会社員', reading: 'かいしゃいん', meaning: 'Nhân viên công ty' }] },
  { character: '立', onyomi: 'リツ', kunyomi: 'た(つ)', meaning: 'Đứng', strokeCount: 5, radical: '立', examples: [{ word: '立つ', reading: 'たつ', meaning: 'Đứng' }, { word: '国立', reading: 'こくりつ', meaning: 'Quốc lập' }] },
  { character: '開', onyomi: 'カイ', kunyomi: 'あ(ける)', meaning: 'Mở', strokeCount: 12, radical: '門', examples: [{ word: '開ける', reading: 'あける', meaning: 'Mở' }, { word: '開く', reading: 'ひらく', meaning: 'Mở ra' }] },
  { character: '手', onyomi: 'シュ', kunyomi: 'て', meaning: 'Tay', strokeCount: 4, radical: '手', examples: [{ word: '手紙', reading: 'てがみ', meaning: 'Thư' }] },
  { character: '力', onyomi: 'リョク', kunyomi: 'ちから', meaning: 'Sức mạnh', strokeCount: 2, radical: '力', examples: [{ word: '力', reading: 'ちから', meaning: 'Sức mạnh' }, { word: '努力', reading: 'どりょく', meaning: 'Nỗ lực' }] },
  { character: '問', onyomi: 'モン', kunyomi: 'と(う)', meaning: 'Hỏi', strokeCount: 11, radical: '口', examples: [{ word: '質問', reading: 'しつもん', meaning: 'Câu hỏi' }, { word: '問題', reading: 'もんだい', meaning: 'Vấn đề' }] },
  { character: '代', onyomi: 'ダイ', kunyomi: 'か(わる)', meaning: 'Đại, thay thế', strokeCount: 5, radical: '人', examples: [{ word: '時代', reading: 'じだい', meaning: 'Thời đại' }, { word: '代わり', reading: 'かわり', meaning: 'Thay thế' }] },
  { character: '明', onyomi: 'メイ', kunyomi: 'あか(るい)', meaning: 'Sáng, rõ ràng', strokeCount: 8, radical: '日', examples: [{ word: '明るい', reading: 'あかるい', meaning: 'Sáng' }, { word: '説明', reading: 'せつめい', meaning: 'Giải thích' }] },
  { character: '動', onyomi: 'ドウ', kunyomi: 'うご(く)', meaning: 'Động, di chuyển', strokeCount: 11, radical: '力', examples: [{ word: '動く', reading: 'うごく', meaning: 'Di chuyển' }, { word: '運動', reading: 'うんどう', meaning: 'Vận động' }] },
  { character: '京', onyomi: 'キョウ', kunyomi: '', meaning: 'Kinh đô', strokeCount: 8, radical: '亠', examples: [{ word: '東京', reading: 'とうきょう', meaning: 'Tokyo' }, { word: '京都', reading: 'きょうと', meaning: 'Kyoto' }] },
  { character: '目', onyomi: 'モク', kunyomi: 'め', meaning: 'Mắt, mục', strokeCount: 5, radical: '目', examples: [{ word: '目的', reading: 'もくてき', meaning: 'Mục đích' }] },
  { character: '通', onyomi: 'ツウ', kunyomi: 'とお(る)', meaning: 'Thông, đi qua', strokeCount: 10, radical: '辶', examples: [{ word: '通る', reading: 'とおる', meaning: 'Đi qua' }, { word: '交通', reading: 'こうつう', meaning: 'Giao thông' }] },
  { character: '言', onyomi: 'ゲン', kunyomi: 'い(う)', meaning: 'Nói', strokeCount: 7, radical: '言', examples: [{ word: '言う', reading: 'いう', meaning: 'Nói' }, { word: '言葉', reading: 'ことば', meaning: 'Từ ngữ' }] },
  { character: '理', onyomi: 'リ', kunyomi: '', meaning: 'Lý, lý do', strokeCount: 11, radical: '玉', examples: [{ word: '料理', reading: 'りょうり', meaning: 'Nấu ăn' }, { word: '理由', reading: 'りゆう', meaning: 'Lý do' }] },
  { character: '体', onyomi: 'タイ', kunyomi: 'からだ', meaning: 'Thân thể', strokeCount: 7, radical: '人', examples: [{ word: '体', reading: 'からだ', meaning: 'Cơ thể' }, { word: '大体', reading: 'だいたい', meaning: 'Đại khái' }] },
  { character: '田', onyomi: 'デン', kunyomi: 'た', meaning: 'Ruộng', strokeCount: 5, radical: '田', examples: [{ word: '田中', reading: 'たなか', meaning: 'Tanaka' }] },
  { character: '主', onyomi: 'シュ', kunyomi: 'おも', meaning: 'Chủ', strokeCount: 5, radical: '丶', examples: [{ word: '主人', reading: 'しゅじん', meaning: 'Chủ nhân' }, { word: '主に', reading: 'おもに', meaning: 'Chủ yếu' }] },
  { character: '題', onyomi: 'ダイ', kunyomi: '', meaning: 'Đề tài', strokeCount: 18, radical: '頁', examples: [{ word: '問題', reading: 'もんだい', meaning: 'Vấn đề' }, { word: '題名', reading: 'だいめい', meaning: 'Tiêu đề' }] },
];

// ─── JLPT N3 Kanji (sample first 30) ──────────────────────────────────────────
const N3_KANJI: typeof N5_KANJI = [
  { character: '政', onyomi: 'セイ', kunyomi: 'まつりごと', meaning: 'Chính trị', strokeCount: 9, radical: '攵', examples: [{ word: '政治', reading: 'せいじ', meaning: 'Chính trị' }] },
  { character: '議', onyomi: 'ギ', kunyomi: '', meaning: 'Nghị luận', strokeCount: 20, radical: '言', examples: [{ word: '会議', reading: 'かいぎ', meaning: 'Hội nghị' }] },
  { character: '民', onyomi: 'ミン', kunyomi: 'たみ', meaning: 'Dân', strokeCount: 5, radical: '氏', examples: [{ word: '国民', reading: 'こくみん', meaning: 'Quốc dân' }] },
  { character: '連', onyomi: 'レン', kunyomi: 'つら(なる)', meaning: 'Liên kết', strokeCount: 10, radical: '辶', examples: [{ word: '連絡', reading: 'れんらく', meaning: 'Liên lạc' }] },
  { character: '対', onyomi: 'タイ', kunyomi: '', meaning: 'Đối', strokeCount: 7, radical: '寸', examples: [{ word: '反対', reading: 'はんたい', meaning: 'Phản đối' }, { word: '対する', reading: 'たいする', meaning: 'Đối với' }] },
  { character: '部', onyomi: 'ブ', kunyomi: '', meaning: 'Bộ, phần', strokeCount: 11, radical: '阝', examples: [{ word: '全部', reading: 'ぜんぶ', meaning: 'Tất cả' }, { word: '部分', reading: 'ぶぶん', meaning: 'Bộ phận' }] },
  { character: '合', onyomi: 'ゴウ', kunyomi: 'あ(う)', meaning: 'Hợp', strokeCount: 6, radical: '口', examples: [{ word: '場合', reading: 'ばあい', meaning: 'Trường hợp' }, { word: '合う', reading: 'あう', meaning: 'Phù hợp' }] },
  { character: '市', onyomi: 'シ', kunyomi: 'いち', meaning: 'Thành phố, chợ', strokeCount: 5, radical: '巾', examples: [{ word: '市場', reading: 'しじょう', meaning: 'Thị trường' }] },
  { character: '内', onyomi: 'ナイ', kunyomi: 'うち', meaning: 'Trong', strokeCount: 4, radical: '冂', examples: [{ word: '国内', reading: 'こくない', meaning: 'Trong nước' }, { word: '内容', reading: 'ないよう', meaning: 'Nội dung' }] },
  { character: '相', onyomi: 'ソウ', kunyomi: 'あい', meaning: 'Lẫn nhau', strokeCount: 9, radical: '目', examples: [{ word: '相手', reading: 'あいて', meaning: 'Đối phương' }, { word: '相談', reading: 'そうだん', meaning: 'Thảo luận' }] },
  { character: '定', onyomi: 'テイ', kunyomi: 'さだ(める)', meaning: 'Định', strokeCount: 8, radical: '宀', examples: [{ word: '予定', reading: 'よてい', meaning: 'Dự kiến' }] },
  { character: '回', onyomi: 'カイ', kunyomi: 'まわ(る)', meaning: 'Lần, xoay', strokeCount: 6, radical: '口', examples: [{ word: '今回', reading: 'こんかい', meaning: 'Lần này' }] },
  { character: '選', onyomi: 'セン', kunyomi: 'えら(ぶ)', meaning: 'Chọn', strokeCount: 15, radical: '辶', examples: [{ word: '選ぶ', reading: 'えらぶ', meaning: 'Lựa chọn' }] },
  { character: '米', onyomi: 'ベイ', kunyomi: 'こめ', meaning: 'Gạo, Mỹ', strokeCount: 6, radical: '米', examples: [{ word: '米', reading: 'こめ', meaning: 'Gạo' }] },
  { character: '実', onyomi: 'ジツ', kunyomi: 'み', meaning: 'Thực tế, quả', strokeCount: 8, radical: '宀', examples: [{ word: '実は', reading: 'じつは', meaning: 'Thực ra' }] },
  { character: '関', onyomi: 'カン', kunyomi: 'せき', meaning: 'Liên quan', strokeCount: 14, radical: '門', examples: [{ word: '関係', reading: 'かんけい', meaning: 'Quan hệ' }] },
  { character: '決', onyomi: 'ケツ', kunyomi: 'き(める)', meaning: 'Quyết định', strokeCount: 7, radical: '水', examples: [{ word: '決める', reading: 'きめる', meaning: 'Quyết định' }] },
  { character: '全', onyomi: 'ゼン', kunyomi: 'まった(く)', meaning: 'Toàn bộ', strokeCount: 6, radical: '入', examples: [{ word: '全部', reading: 'ぜんぶ', meaning: 'Tất cả' }] },
  { character: '表', onyomi: 'ヒョウ', kunyomi: 'おもて', meaning: 'Bề ngoài, biểu', strokeCount: 8, radical: '衣', examples: [{ word: '表', reading: 'おもて', meaning: 'Mặt ngoài' }, { word: '発表', reading: 'はっぴょう', meaning: 'Phát biểu' }] },
  { character: '戦', onyomi: 'セン', kunyomi: 'たたか(う)', meaning: 'Chiến đấu', strokeCount: 13, radical: '戈', examples: [{ word: '戦争', reading: 'せんそう', meaning: 'Chiến tranh' }] },
  { character: '経', onyomi: 'ケイ', kunyomi: 'へ(る)', meaning: 'Kinh, qua', strokeCount: 11, radical: '糸', examples: [{ word: '経験', reading: 'けいけん', meaning: 'Kinh nghiệm' }, { word: '経済', reading: 'けいざい', meaning: 'Kinh tế' }] },
  { character: '最', onyomi: 'サイ', kunyomi: 'もっと(も)', meaning: 'Nhất, tối', strokeCount: 12, radical: '曰', examples: [{ word: '最初', reading: 'さいしょ', meaning: 'Đầu tiên' }, { word: '最近', reading: 'さいきん', meaning: 'Gần đây' }] },
  { character: '現', onyomi: 'ゲン', kunyomi: 'あらわ(れる)', meaning: 'Hiện tại', strokeCount: 11, radical: '玉', examples: [{ word: '現在', reading: 'げんざい', meaning: 'Hiện tại' }] },
  { character: '調', onyomi: 'チョウ', kunyomi: 'しら(べる)', meaning: 'Điều tra', strokeCount: 15, radical: '言', examples: [{ word: '調べる', reading: 'しらべる', meaning: 'Tra cứu' }] },
  { character: '化', onyomi: 'カ', kunyomi: 'ば(ける)', meaning: 'Hóa', strokeCount: 4, radical: '人', examples: [{ word: '文化', reading: 'ぶんか', meaning: 'Văn hóa' }, { word: '変化', reading: 'へんか', meaning: 'Biến hóa' }] },
  { character: '当', onyomi: 'トウ', kunyomi: 'あ(たる)', meaning: 'Đương, trúng', strokeCount: 6, radical: '小', examples: [{ word: '本当', reading: 'ほんとう', meaning: 'Thật sự' }] },
  { character: '約', onyomi: 'ヤク', kunyomi: '', meaning: 'Khoảng, hẹn', strokeCount: 9, radical: '糸', examples: [{ word: '約束', reading: 'やくそく', meaning: 'Hứa hẹn' }, { word: '予約', reading: 'よやく', meaning: 'Đặt trước' }] },
  { character: '首', onyomi: 'シュ', kunyomi: 'くび', meaning: 'Đầu, cổ', strokeCount: 9, radical: '首', examples: [{ word: '首相', reading: 'しゅしょう', meaning: 'Thủ tướng' }] },
  { character: '法', onyomi: 'ホウ', kunyomi: '', meaning: 'Pháp luật', strokeCount: 8, radical: '水', examples: [{ word: '方法', reading: 'ほうほう', meaning: 'Phương pháp' }, { word: '法律', reading: 'ほうりつ', meaning: 'Pháp luật' }] },
  { character: '用', onyomi: 'ヨウ', kunyomi: 'もち(いる)', meaning: 'Dùng', strokeCount: 5, radical: '用', examples: [{ word: '利用', reading: 'りよう', meaning: 'Sử dụng' }, { word: '用意', reading: 'ようい', meaning: 'Chuẩn bị' }] },
];

// Organize into level → lessons
function groupIntoLessons(kanji: typeof N5_KANJI, perLesson = 10) {
  const lessons: Record<number, typeof N5_KANJI> = {};
  kanji.forEach((k, i) => {
    const lesson = Math.floor(i / perLesson) + 1;
    if (!lessons[lesson]) lessons[lesson] = [];
    lessons[lesson].push(k);
  });
  return lessons;
}

async function seed() {
  console.log('🔤 Seeding Kanji data...');

  const levels: { code: string; data: typeof N5_KANJI; perLesson: number }[] = [
    { code: 'N5', data: N5_KANJI, perLesson: 10 },
    { code: 'N4', data: N4_KANJI, perLesson: 10 },
    { code: 'N3', data: N3_KANJI, perLesson: 10 },
  ];

  for (const { code, data, perLesson } of levels) {
    const lessons = groupIntoLessons(data, perLesson);
    let totalInserted = 0;

    for (const [lessonNum, kanjiList] of Object.entries(lessons)) {
      for (let i = 0; i < kanjiList.length; i++) {
        const k = kanjiList[i];
        await prisma.kanji.upsert({
          where: {
            character_language_level: {
              character: k.character,
              language: 'ja' as Language,
              level: code,
            },
          },
          update: {
            lesson: Number(lessonNum),
            order: i,
            onyomi: k.onyomi || null,
            kunyomi: k.kunyomi || null,
            meaning: k.meaning,
            strokeCount: k.strokeCount,
            radical: k.radical || null,
            radicalMeaning: k.radicalMeaning || null,
            examples: k.examples ? (k.examples as unknown as Prisma.InputJsonValue) : Prisma.DbNull,
          },
          create: {
            character: k.character,
            language: 'ja' as Language,
            level: code,
            lesson: Number(lessonNum),
            order: i,
            onyomi: k.onyomi || null,
            kunyomi: k.kunyomi || null,
            meaning: k.meaning,
            strokeCount: k.strokeCount,
            radical: k.radical || null,
            radicalMeaning: k.radicalMeaning || null,
            examples: k.examples ? (k.examples as unknown as Prisma.InputJsonValue) : Prisma.DbNull,
          },
        });
        totalInserted++;
      }
    }
    console.log(`  ✅ ${code}: ${totalInserted} kanji (${Object.keys(lessons).length} lessons)`);
  }

  console.log('✅ Kanji seed complete!');
}

seed()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
