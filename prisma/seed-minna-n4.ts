/**
 * Seed Minna no Nihongo N4 (Bài 26~50) — Full vocabulary & grammar.
 * Replaces the placeholder N4 data in seed-minna.ts.
 *
 * Run: npx tsx prisma/seed-minna-n4.ts
 */

import { PrismaClient, Language } from '@prisma/client';
const prisma = new PrismaClient();

// ─── Types ───────────────────────────────────────────────────────────────────
type WordRow = { term: string; pronunciation: string; meaning: string; example?: string; exampleReading?: string; exampleMeaning?: string };
type GrammarRow = { pattern: string; meaning: string; usage: string; example?: string; exampleReading?: string; exampleMeaning?: string };
type Lesson = { title: string; description?: string; vocab: WordRow[]; grammar: GrammarRow[] };

// ─── N4 — Minna no Nihongo II (Bài 26~50) ────────────────────────────────────
const MINNA_N4: Lesson[] = [
  {
    title: 'Bài 26 — Suy nghĩ và ý kiến',
    description: 'Cách diễn đạt suy nghĩ, ý kiến với 〜と思います.',
    vocab: [
      { term: '普通形', pronunciation: 'ふつうけい', meaning: 'thể thông thường (plain form)', example: '彼は来ると思います。', exampleReading: 'かれはくるとおもいます。', exampleMeaning: 'Tôi nghĩ anh ấy sẽ đến.' },
      { term: '意見', pronunciation: 'いけん', meaning: 'ý kiến', example: '意見を言ってください。', exampleReading: 'いけんをいってください。', exampleMeaning: 'Hãy nói ý kiến của bạn.' },
      { term: '理由', pronunciation: 'りゆう', meaning: 'lý do', example: '理由を説明します。', exampleReading: 'りゆうをせつめいします。', exampleMeaning: 'Tôi giải thích lý do.' },
      { term: '賛成', pronunciation: 'さんせい', meaning: 'đồng ý, tán thành', example: 'あなたの意見に賛成です。', exampleReading: 'あなたのいけんにさんせいです。', exampleMeaning: 'Tôi đồng ý với ý kiến của bạn.' },
      { term: '反対', pronunciation: 'はんたい', meaning: 'phản đối, ngược lại', example: '反対意見があります。', exampleReading: 'はんたいいけんがあります。', exampleMeaning: 'Có ý kiến phản đối.' },
      { term: '乗り換える', pronunciation: 'のりかえる', meaning: 'đổi tàu/xe, chuyển tiếp', example: '新宿で乗り換えます。', exampleReading: 'しんじゅくでのりかえます。', exampleMeaning: 'Tôi đổi tàu ở Shinjuku.' },
      { term: '道', pronunciation: 'みち', meaning: 'đường, con đường', example: 'この道はどこに続きますか？', exampleReading: 'このみちはどこにつづきますか？', exampleMeaning: 'Con đường này dẫn đến đâu?' },
      { term: '地図', pronunciation: 'ちず', meaning: 'bản đồ', example: '地図を見て確認します。', exampleReading: 'ちずをみてかくにんします。', exampleMeaning: 'Tôi xem bản đồ để xác nhận.' },
    ],
    grammar: [
      { pattern: '〜と思います', meaning: 'Tôi nghĩ rằng 〜', usage: 'Dùng thể thường + と思います để diễn đạt suy nghĩ, ý kiến.', example: '彼女は来ないと思います。', exampleReading: 'かのじょはこないとおもいます。', exampleMeaning: 'Tôi nghĩ cô ấy sẽ không đến.' },
      { pattern: '〜でしょう', meaning: 'Chắc là 〜 / có lẽ 〜', usage: 'Diễn đạt phỏng đoán lịch sự với thể thường + でしょう.', example: '明日は晴れるでしょう。', exampleReading: 'あしたははれるでしょう。', exampleMeaning: 'Ngày mai chắc là trời đẹp.' },
    ],
  },
  {
    title: 'Bài 27 — Nghe nói, trích dẫn',
    description: 'Cách dùng 〜そうです (dạng nghe nói).',
    vocab: [
      { term: '彼女', pronunciation: 'かのじょ', meaning: 'cô ấy, bạn gái', example: '彼女は来ないそうです。', exampleReading: 'かのじょはこないそうです。', exampleMeaning: 'Nghe nói cô ấy không đến.' },
      { term: 'ニュース', pronunciation: 'ニュース', meaning: 'tin tức', example: 'ニュースによると、雪が降るそうです。', exampleReading: 'ニュースによると、ゆきがふるそうです。', exampleMeaning: 'Theo tin tức thì sẽ có tuyết rơi.' },
      { term: '台風', pronunciation: 'たいふう', meaning: 'bão', example: '台風が来るそうです。', exampleReading: 'たいふうがくるそうです。', exampleMeaning: 'Nghe nói sắp có bão.' },
      { term: '予報', pronunciation: 'よほう', meaning: 'dự báo', example: '天気予報を確認しましたか？', exampleReading: 'てんきよほうをかくにんしましたか？', exampleMeaning: 'Bạn đã xem dự báo thời tiết chưa?' },
      { term: '登る', pronunciation: 'のぼる', meaning: 'leo, trèo lên', example: '山を登るのは大変です。', exampleReading: 'やまをのぼるのはたいへんです。', exampleMeaning: 'Leo núi rất vất vả.' },
      { term: '集める', pronunciation: 'あつめる', meaning: 'thu thập, gom lại', example: '切手を集めています。', exampleReading: 'きってをあつめています。', exampleMeaning: 'Tôi đang sưu tập tem.' },
      { term: '習う', pronunciation: 'ならう', meaning: 'học (từ thầy), tập', example: 'ピアノを習っています。', exampleReading: 'ピアノをならっています。', exampleMeaning: 'Tôi đang học đàn piano.' },
    ],
    grammar: [
      { pattern: '〜そうです (nghe nói)', meaning: 'Nghe nói 〜 / Tôi nghe rằng 〜', usage: 'Thể thường + そうです để truyền đạt thông tin nghe từ người khác.', example: '田中さんは結婚するそうです。', exampleReading: 'たなかさんはけっこんするそうです。', exampleMeaning: 'Nghe nói anh Tanaka sắp kết hôn.' },
      { pattern: '〜って', meaning: 'Nghe nói 〜 (thân mật)', usage: 'Dạng trích dẫn thân mật, dùng trong hội thoại thường ngày.', example: '明日休みだって。', exampleReading: 'あしたやすみだって。', exampleMeaning: 'Nghe nói ngày mai nghỉ đấy.' },
    ],
  },
  {
    title: 'Bài 28 — Trông có vẻ, tình trạng',
    description: 'Cách diễn đạt vẻ ngoài 〜そうです (dạng trông có vẻ).',
    vocab: [
      { term: '直す', pronunciation: 'なおす', meaning: 'sửa chữa, chữa bệnh', example: '車を修理に出しました。', exampleReading: 'くるまをしゅうりにだしました。', exampleMeaning: 'Tôi đưa xe đi sửa.' },
      { term: '壊れる', pronunciation: 'こわれる', meaning: 'hỏng, bị vỡ', example: 'パソコンが壊れました。', exampleReading: 'パソコンがこわれました。', exampleMeaning: 'Máy tính bị hỏng rồi.' },
      { term: '落とす', pronunciation: 'おとす', meaning: 'đánh rơi, làm rớt', example: '財布を落としてしまいました。', exampleReading: 'さいふをおとしてしまいました。', exampleMeaning: 'Tôi đã đánh rơi ví mất rồi.' },
      { term: '危ない', pronunciation: 'あぶない', meaning: 'nguy hiểm', example: 'あの道は危ないです。', exampleReading: 'あのみちはあぶないです。', exampleMeaning: 'Con đường đó nguy hiểm.' },
      { term: '便利', pronunciation: 'べんり', meaning: 'tiện lợi', example: 'スマホはとても便利です。', exampleReading: 'スマホはとてもべんりです。', exampleMeaning: 'Điện thoại thông minh rất tiện lợi.' },
      { term: '元気', pronunciation: 'げんき', meaning: 'khỏe, vui vẻ', example: '元気そうですね。', exampleReading: 'げんきそうですね。', exampleMeaning: 'Trông bạn khỏe nhỉ.' },
      { term: 'おいしそう', pronunciation: 'おいしそう', meaning: 'trông ngon', example: 'このケーキはおいしそうです。', exampleReading: 'このケーキはおいしそうです。', exampleMeaning: 'Cái bánh này trông ngon quá.' },
    ],
    grammar: [
      { pattern: '〜そうです (trông có vẻ)', meaning: 'Trông có vẻ 〜 / nhìn có vẻ 〜', usage: 'Stem tính từ / V-masu-stem + そうです để diễn đạt vẻ ngoài, cảm nhận trực tiếp.', example: '空が暗くなりそうです。', exampleReading: 'そらがくらくなりそうです。', exampleMeaning: 'Bầu trời trông có vẻ sắp tối.' },
      { pattern: 'V-てしまいました', meaning: 'Đã lỡ 〜 / vô tình đã 〜 (tiếc nuối)', usage: 'Diễn đạt hành động hoàn tất mang tính không mong muốn hoặc hối tiếc.', example: '宿題を忘れてしまいました。', exampleReading: 'しゅくだいをわすれてしまいました。', exampleMeaning: 'Tôi đã quên mất bài tập về nhà rồi.' },
    ],
  },
  {
    title: 'Bài 29 — Chuẩn bị và mục đích',
    description: 'Cách dùng 〜ために (mục đích) và 〜ておきます (chuẩn bị trước).',
    vocab: [
      { term: '始める', pronunciation: 'はじめる', meaning: 'bắt đầu', example: '8時に会議を始めます。', exampleReading: 'はちじにかいぎをはじめます。', exampleMeaning: 'Bắt đầu cuộc họp lúc 8 giờ.' },
      { term: '進む', pronunciation: 'すすむ', meaning: 'tiến lên, tiến triển', example: '仕事が順調に進んでいます。', exampleReading: 'しごとがじゅんちょうにすすんでいます。', exampleMeaning: 'Công việc đang tiến triển thuận lợi.' },
      { term: '変える', pronunciation: 'かえる', meaning: 'thay đổi (cái gì đó)', example: '計画を変えることにしました。', exampleReading: 'けいかくをかえることにしました。', exampleMeaning: 'Tôi quyết định thay đổi kế hoạch.' },
      { term: '準備', pronunciation: 'じゅんび', meaning: 'chuẩn bị', example: '旅行の準備をしておきます。', exampleReading: 'りょこうのじゅんびをしておきます。', exampleMeaning: 'Tôi chuẩn bị trước cho chuyến du lịch.' },
      { term: '目的', pronunciation: 'もくてき', meaning: 'mục đích', example: '目的のために頑張ります。', exampleReading: 'もくてきのためにがんばります。', exampleMeaning: 'Tôi cố gắng vì mục đích.' },
      { term: '予約', pronunciation: 'よやく', meaning: 'đặt chỗ, đặt trước', example: 'レストランを予約しておきました。', exampleReading: 'レストランをよやくしておきました。', exampleMeaning: 'Tôi đã đặt chỗ nhà hàng trước.' },
    ],
    grammar: [
      { pattern: '〜ために', meaning: 'để 〜 / vì mục đích 〜', usage: 'Danh từのために / V-る + ために để chỉ mục đích.', example: '日本語を勉強するために、日本に来ました。', exampleReading: 'にほんごをべんきょうするために、にほんにきました。', exampleMeaning: 'Tôi đến Nhật để học tiếng Nhật.' },
      { pattern: 'V-ておきます', meaning: 'Làm 〜 trước (chuẩn bị)', usage: 'Gắn ておく vào dạng て của động từ để diễn đạt hành động chuẩn bị sẵn.', example: '明日のために料理を作っておきます。', exampleReading: 'あしたのためにりょうりをつくっておきます。', exampleMeaning: 'Tôi nấu ăn trước cho ngày mai.' },
    ],
  },
  {
    title: 'Bài 30 — Thử làm, nhờ vả',
    description: 'Cách dùng 〜てみます (thử làm) và 〜てもらえますか (nhờ).',
    vocab: [
      { term: '招待する', pronunciation: 'しょうたいする', meaning: 'mời, chiêu đãi', example: 'パーティーに招待されました。', exampleReading: 'パーティーにしょうたいされました。', exampleMeaning: 'Tôi được mời đến bữa tiệc.' },
      { term: '押す', pronunciation: 'おす', meaning: 'đẩy, nhấn', example: 'ボタンを押してください。', exampleReading: 'ボタンをおしてください。', exampleMeaning: 'Xin hãy nhấn nút.' },
      { term: '踏む', pronunciation: 'ふむ', meaning: 'giẫm, đạp lên', example: '足を踏まないでください。', exampleReading: 'あしをふまないでください。', exampleMeaning: 'Đừng giẫm lên chân tôi.' },
      { term: '試す', pronunciation: 'ためす', meaning: 'thử nghiệm', example: '新しい方法を試してみます。', exampleReading: 'あたらしいほうほうをためしてみます。', exampleMeaning: 'Tôi sẽ thử phương pháp mới.' },
      { term: '確認', pronunciation: 'かくにん', meaning: 'xác nhận, kiểm tra', example: '内容を確認してもらえますか？', exampleReading: 'ないようをかくにんしてもらえますか？', exampleMeaning: 'Bạn có thể xác nhận nội dung giúp tôi không?' },
      { term: '手伝う', pronunciation: 'てつだう', meaning: 'giúp đỡ', example: '引越しを手伝ってもらえますか？', exampleReading: 'ひっこしをてつだってもらえますか？', exampleMeaning: 'Bạn có thể giúp tôi chuyển nhà không?' },
    ],
    grammar: [
      { pattern: 'V-てみます', meaning: 'Thử 〜 (xem sao)', usage: 'てみる = thử làm gì đó để xem kết quả.', example: 'この料理を食べてみました。', exampleReading: 'このりょうりをたべてみました。', exampleMeaning: 'Tôi đã thử ăn món này.' },
      { pattern: 'V-てもらえますか', meaning: 'Bạn có thể 〜 giúp tôi không?', usage: 'Yêu cầu lịch sự, nhờ ai làm hành động.', example: '荷物を運んでもらえますか？', exampleReading: 'にもつをはこんでもらえますか？', exampleMeaning: 'Bạn có thể mang hành lý giúp tôi không?' },
    ],
  },
  {
    title: 'Bài 31 — Trang trí và sắp xếp',
    description: 'Cách dùng 〜てあります và hành động đã chuẩn bị.',
    vocab: [
      { term: '飾る', pronunciation: 'かざる', meaning: 'trang trí', example: '部屋に花が飾ってあります。', exampleReading: 'へやにはながかざってあります。', exampleMeaning: 'Trong phòng có hoa được trang trí sẵn.' },
      { term: '並べる', pronunciation: 'ならべる', meaning: 'xếp hàng, sắp xếp', example: '本が棚に並べてあります。', exampleReading: 'ほんがたなにならべてあります。', exampleMeaning: 'Sách đã được xếp lên kệ rồi.' },
      { term: '置く', pronunciation: 'おく', meaning: 'đặt, để (vật)', example: '鍵はテーブルの上に置いてあります。', exampleReading: 'かぎはテーブルのうえにおいてあります。', exampleMeaning: 'Chìa khóa đã được để trên bàn rồi.' },
      { term: '窓', pronunciation: 'まど', meaning: 'cửa sổ', example: '窓が開けてあります。', exampleReading: 'まどがあけてあります。', exampleMeaning: 'Cửa sổ được mở sẵn rồi.' },
      { term: '黒板', pronunciation: 'こくばん', meaning: 'bảng đen', example: '黒板に授業の内容が書いてあります。', exampleReading: 'こくばんにじゅぎょうのないようがかいてあります。', exampleMeaning: 'Nội dung bài học đã được viết lên bảng.' },
      { term: '予定', pronunciation: 'よてい', meaning: 'kế hoạch, lịch', example: '来週の予定が決まっています。', exampleReading: 'らいしゅうのよていがきまっています。', exampleMeaning: 'Lịch tuần sau đã được quyết định rồi.' },
    ],
    grammar: [
      { pattern: 'V-てあります', meaning: 'Đã được 〜 (trạng thái sẵn sàng)', usage: 'Diễn đạt trạng thái kết quả của hành động chuẩn bị trước, tập trung vào trạng thái hiện tại.', example: 'パーティーの準備がしてあります。', exampleReading: 'パーティーのじゅんびがしてあります。', exampleMeaning: 'Việc chuẩn bị tiệc đã được làm xong rồi.' },
      { pattern: 'V-ておく', meaning: 'Làm 〜 để dành / Làm 〜 sẵn', usage: 'Nhấn mạnh hành động được thực hiện có chủ ý để dùng sau.', example: 'メモしておきます。', exampleReading: 'メモしておきます。', exampleMeaning: 'Tôi sẽ ghi chú lại để dùng sau.' },
    ],
  },
  {
    title: 'Bài 32 — Cho và nhận (nâng cao)',
    description: 'Phân biệt いただく、くださる、やる trong các tình huống.',
    vocab: [
      { term: 'いただく', pronunciation: 'いただく', meaning: 'nhận (khiêm tốn)', example: '先生からアドバイスをいただきました。', exampleReading: 'せんせいからアドバイスをいただきました。', exampleMeaning: 'Tôi được thầy cho lời khuyên.' },
      { term: 'くださる', pronunciation: 'くださる', meaning: 'cho (kính ngữ)', example: '社長がプレゼントをくださいました。', exampleReading: 'しゃちょうがプレゼントをくださいました。', exampleMeaning: 'Giám đốc đã tặng quà.' },
      { term: 'やる', meaning: 'cho (bề dưới/vật nuôi)', pronunciation: 'やる', example: '犬にえさをやります。', exampleReading: 'いぬにえさをやります。', exampleMeaning: 'Cho chó ăn.' },
      { term: '差し上げる', pronunciation: 'さしあげる', meaning: 'tặng (khiêm tốn)', example: '先生にお土産を差し上げます。', exampleReading: 'せんせいにおみやげをさしあげます。', exampleMeaning: 'Tôi tặng quà cho thầy giáo.' },
      { term: 'お世話になる', pronunciation: 'おせわになる', meaning: 'được chăm sóc, nhờ vả', example: 'いつもお世話になっています。', exampleReading: 'いつもおせわになっています。', exampleMeaning: 'Tôi luôn được nhờ vả (cảm ơn sự quan tâm).' },
      { term: '喜ぶ', pronunciation: 'よろこぶ', meaning: 'vui mừng', example: 'プレゼントをもらって喜んでいます。', exampleReading: 'プレゼントをもらってよろこんでいます。', exampleMeaning: 'Nhận được quà nên vui lắm.' },
    ],
    grammar: [
      { pattern: 'V-ていただけますか', meaning: 'Bạn có thể ～ giúp tôi không? (lịch sự)', usage: 'Dạng lịch sự cao hơn てもらえますか, dùng với cấp trên.', example: '資料を送っていただけますか？', exampleReading: 'しりょうをおくっていただけますか？', exampleMeaning: 'Bạn có thể gửi tài liệu giúp tôi không?' },
      { pattern: 'V-てくださいませんか', meaning: 'Bạn có thể vui lòng 〜 không? (kính ngữ)', usage: 'Yêu cầu lịch sự cấp cao, dùng với người cần tôn trọng.', example: 'もう一度説明してくださいませんか？', exampleReading: 'もういちどせつめいしてくださいませんか？', exampleMeaning: 'Bạn có thể vui lòng giải thích lại một lần nữa không?' },
    ],
  },
  {
    title: 'Bài 33 — Thụ động (bị động)',
    description: 'Cách chia thể bị động 〜られます và cách dùng.',
    vocab: [
      { term: '叱る', pronunciation: 'しかる', meaning: 'mắng, rầy la', example: '先生に叱られました。', exampleReading: 'せんせいにしかられました。', exampleMeaning: 'Tôi bị thầy mắng.' },
      { term: '褒める', pronunciation: 'ほめる', meaning: 'khen ngợi', example: '上司に褒められました。', exampleReading: 'じょうしにほめられました。', exampleMeaning: 'Tôi được sếp khen.' },
      { term: '盗む', pronunciation: 'ぬすむ', meaning: 'ăn trộm', example: '財布を盗まれました。', exampleReading: 'さいふをぬすまれました。', exampleMeaning: 'Tôi bị mất trộm ví.' },
      { term: '踏む', pronunciation: 'ふむ', meaning: 'giẫm lên', example: '足を踏まれました。', exampleReading: 'あしをふまれました。', exampleMeaning: 'Tôi bị giẫm lên chân.' },
      { term: '呼ぶ', pronunciation: 'よぶ', meaning: 'gọi, gọi tên', example: '名前を呼ばれました。', exampleReading: 'なまえをよばれました。', exampleMeaning: 'Tên tôi được gọi.' },
      { term: '傷つける', pronunciation: 'きずつける', meaning: 'làm tổn thương', example: '彼の言葉に傷つけられました。', exampleReading: 'かれのことばにきずつけられました。', exampleMeaning: 'Tôi bị tổn thương bởi lời nói của anh ấy.' },
    ],
    grammar: [
      { pattern: 'V-られます (thể bị động)', meaning: 'Bị 〜 / được 〜', usage: 'Nhóm 1: う→あれる; Nhóm 2: る→られる; する→される; くる→こられる.', example: '先生に注意されました。', exampleReading: 'せんせいにちゅういされました。', exampleMeaning: 'Tôi bị thầy cảnh cáo.' },
      { pattern: 'Nに V-られます', meaning: 'Bị N làm 〜 (gây khó chịu)', usage: 'Bị động gián tiếp: hành động của người khác ảnh hưởng đến mình.', example: '雨に降られて、びしょぬれになりました。', exampleReading: 'あめにふられて、びしょぬれになりました。', exampleMeaning: 'Bị mưa, nên ướt hết.' },
    ],
  },
  {
    title: 'Bài 34 — Sai bảo, sai đi',
    description: 'Cách chia thể sai khiến 〜させます.',
    vocab: [
      { term: '発表する', pronunciation: 'はっぴょうする', meaning: 'phát biểu, thuyết trình', example: '学生に発表させます。', exampleReading: 'がくせいにはっぴょうさせます。', exampleMeaning: 'Tôi cho học sinh thuyết trình.' },
      { term: '参加する', pronunciation: 'さんかする', meaning: 'tham gia', example: '会議に参加させてください。', exampleReading: 'かいぎにさんかさせてください。', exampleMeaning: 'Xin hãy cho tôi tham dự cuộc họp.' },
      { term: '反省する', pronunciation: 'はんせいする', meaning: 'phản tỉnh, nhìn lại', example: '失敗を反省させられました。', exampleReading: 'しっぱいをはんせいさせられました。', exampleMeaning: 'Tôi bị bắt nhìn lại thất bại của mình.' },
      { term: '待たせる', pronunciation: 'またせる', meaning: 'bắt ai đó đợi', example: 'お待たせしました。', exampleReading: 'おまたせしました。', exampleMeaning: 'Xin lỗi đã để bạn chờ.' },
      { term: '心配する', pronunciation: 'しんぱいする', meaning: 'lo lắng', example: '親を心配させてしまいました。', exampleReading: 'おやをしんぱいさせてしまいました。', exampleMeaning: 'Tôi đã làm bố mẹ lo lắng.' },
    ],
    grammar: [
      { pattern: 'V-させます (thể sai khiến)', meaning: 'Bắt 〜 làm / Cho 〜 làm', usage: 'Nhóm 1: う→わせる; Nhóm 2: る→させる; する→させる.', example: '子どもに野菜を食べさせます。', exampleReading: 'こどもにやさいをたべさせます。', exampleMeaning: 'Tôi bắt con ăn rau.' },
      { pattern: 'V-させてください', meaning: 'Xin hãy cho tôi 〜', usage: 'Xin phép được làm gì đó một cách lịch sự.', example: 'ここに座らせてください。', exampleReading: 'ここにすわらせてください。', exampleMeaning: 'Xin hãy cho tôi ngồi ở đây.' },
    ],
  },
  {
    title: 'Bài 35 — Bị bắt làm',
    description: 'Thể sai-bị động 〜させられます.',
    vocab: [
      { term: '残業する', pronunciation: 'ざんぎょうする', meaning: 'làm thêm giờ', example: '毎日残業させられています。', exampleReading: 'まいにちざんぎょうさせられています。', exampleMeaning: 'Tôi bị bắt làm thêm giờ mỗi ngày.' },
      { term: '謝る', pronunciation: 'あやまる', meaning: 'xin lỗi', example: '間違えて謝らされました。', exampleReading: 'まちがえてあやまらされました。', exampleMeaning: 'Nhầm nên bị bắt phải xin lỗi.' },
      { term: '報告する', pronunciation: 'ほうこくする', meaning: 'báo cáo', example: '毎週報告させられます。', exampleReading: 'まいしゅうほうこくさせられます。', exampleMeaning: 'Tôi bị bắt báo cáo mỗi tuần.' },
      { term: '掃除する', pronunciation: 'そうじする', meaning: 'dọn dẹp', example: '毎日部屋を掃除させられます。', exampleReading: 'まいにちへやをそうじさせられます。', exampleMeaning: 'Tôi bị bắt dọn phòng mỗi ngày.' },
      { term: 'やめる', pronunciation: 'やめる', meaning: 'dừng lại, bỏ', example: 'タバコをやめさせられました。', exampleReading: 'タバコをやめさせられました。', exampleMeaning: 'Tôi bị bắt phải bỏ thuốc.' },
    ],
    grammar: [
      { pattern: 'V-させられます (sai-bị động)', meaning: 'Bị bắt (phải) làm 〜', usage: 'Kết hợp sai khiến + bị động; nhóm 1 rút gọn: わせられる → わされる.', example: '子どもの頃、ピアノを習わされました。', exampleReading: 'こどものころ、ピアノをならわされました。', exampleMeaning: 'Hồi nhỏ tôi bị bắt phải học đàn piano.' },
      { pattern: 'V-させられてしまいました', meaning: 'Cuối cùng bị bắt làm 〜 (khó chịu)', usage: 'Kết hợp sai-bị động + てしまう, nhấn mạnh sự không mong muốn.', example: '無理な仕事を引き受けさせられてしまいました。', exampleReading: 'むりなしごとをひきうけさせられてしまいました。', exampleMeaning: 'Tôi bị bắt phải nhận việc quá sức mình.' },
    ],
  },
  {
    title: 'Bài 36 — Kính ngữ (tôn kính)',
    description: 'Cách dùng kính ngữ 〜いらっしゃいます, お〜になります.',
    vocab: [
      { term: 'いらっしゃる', pronunciation: 'いらっしゃる', meaning: 'ở/đi/đến (kính ngữ của いる/行く/来る)', example: '先生はいらっしゃいますか？', exampleReading: 'せんせいはいらっしゃいますか？', exampleMeaning: 'Thầy giáo có ở đây không?' },
      { term: 'おっしゃる', pronunciation: 'おっしゃる', meaning: 'nói (kính ngữ của 言う)', example: '先生がおっしゃったことを守ります。', exampleReading: 'せんせいがおっしゃったことをまもります。', exampleMeaning: 'Tôi sẽ làm theo điều thầy nói.' },
      { term: 'なさる', pronunciation: 'なさる', meaning: 'làm (kính ngữ của する)', example: '何をなさっているんですか？', exampleReading: 'なにをなさっているんですか？', exampleMeaning: 'Bạn đang làm gì vậy?' },
      { term: 'ご存知', pronunciation: 'ごぞんじ', meaning: 'biết (kính ngữ của 知っている)', example: 'その件はご存知ですか？', exampleReading: 'そのけんはごぞんじですか？', exampleMeaning: 'Bạn có biết về việc đó không?' },
      { term: 'めしあがる', pronunciation: 'めしあがる', meaning: 'ăn/uống (kính ngữ của 食べる/飲む)', example: 'どうぞめしあがってください。', exampleReading: 'どうぞめしあがってください。', exampleMeaning: 'Xin mời dùng bữa.' },
    ],
    grammar: [
      { pattern: 'お〜になります', meaning: '〜 (tôn kính)', usage: 'お + V-masu-stem + になる = tôn kính hành động của người khác.', example: '先生がお帰りになりました。', exampleReading: 'せんせいがおかえりになりました。', exampleMeaning: 'Thầy giáo đã về rồi.' },
      { pattern: 'ご〜になります', meaning: '〜 (tôn kính chữ Hán)', usage: 'ご + danh từ (gốc Hán) + になる.', example: '社長がご到着になりました。', exampleReading: 'しゃちょうがごとうちゃくになりました。', exampleMeaning: 'Giám đốc đã đến rồi.' },
    ],
  },
  {
    title: 'Bài 37 — Kính ngữ (khiêm tốn)',
    description: 'Cách dùng kính ngữ khiêm tốn お〜します, 参ります.',
    vocab: [
      { term: '参る', pronunciation: 'まいる', meaning: 'đến/đi (khiêm tốn của 来る/行く)', example: 'すぐ参ります。', exampleReading: 'すぐまいります。', exampleMeaning: 'Tôi sẽ đến ngay.' },
      { term: '申す', pronunciation: 'もうす', meaning: 'nói (khiêm tốn của 言う)', example: '田中と申します。', exampleReading: 'たなかともうします。', exampleMeaning: 'Tôi tên là Tanaka.' },
      { term: 'いたす', pronunciation: 'いたす', meaning: 'làm (khiêm tốn của する)', example: 'ご連絡いたします。', exampleReading: 'ごれんらくいたします。', exampleMeaning: 'Tôi sẽ liên lạc.' },
      { term: 'おる', pronunciation: 'おる', meaning: 'ở, có (khiêm tốn của いる)', example: '田中はただいまおりません。', exampleReading: 'たなかはただいまおりません。', exampleMeaning: 'Anh Tanaka hiện không có ở đây.' },
      { term: '存じる', pronunciation: 'ぞんじる', meaning: 'biết (khiêm tốn của 知る)', example: 'その件は存じません。', exampleReading: 'そのけんはぞんじません。', exampleMeaning: 'Tôi không biết về việc đó.' },
    ],
    grammar: [
      { pattern: 'お〜します', meaning: '〜 (khiêm tốn)', usage: 'お + V-masu-stem + する = khiêm tốn hành động của bản thân.', example: 'お荷物をお持ちします。', exampleReading: 'おにもつをおもちします。', exampleMeaning: 'Để tôi mang hành lý cho bạn.' },
      { pattern: 'ご〜します', meaning: '〜 (khiêm tốn chữ Hán)', usage: 'ご + danh từ (gốc Hán) + する.', example: 'ご説明します。', exampleReading: 'ごせつめいします。', exampleMeaning: 'Tôi sẽ giải thích.' },
    ],
  },
  {
    title: 'Bài 38 — Quyết định và thay đổi',
    description: 'Cách dùng 〜ことにします, 〜ことになります.',
    vocab: [
      { term: '決める', pronunciation: 'きめる', meaning: 'quyết định', example: '会議の日程を決めました。', exampleReading: 'かいぎのにっていをきめました。', exampleMeaning: 'Tôi đã quyết định lịch họp.' },
      { term: '転職する', pronunciation: 'てんしょくする', meaning: 'chuyển việc', example: '転職することにしました。', exampleReading: 'てんしょくすることにしました。', exampleMeaning: 'Tôi quyết định chuyển việc.' },
      { term: '結婚する', pronunciation: 'けっこんする', meaning: 'kết hôn', example: '来年結婚することになりました。', exampleReading: 'らいねんけっこんすることになりました。', exampleMeaning: 'Năm sau tôi được quyết định là sẽ kết hôn.' },
      { term: 'やめる', pronunciation: 'やめる', meaning: 'dừng, bỏ', example: 'タバコをやめることにしました。', exampleReading: 'タバコをやめることにしました。', exampleMeaning: 'Tôi quyết định bỏ thuốc.' },
      { term: '海外', pronunciation: 'かいがい', meaning: 'nước ngoài', example: '海外に転勤することになりました。', exampleReading: 'かいがいにてんきんすることになりました。', exampleMeaning: 'Tôi được điều động ra nước ngoài.' },
    ],
    grammar: [
      { pattern: '〜ことにします', meaning: 'Quyết định (sẽ) 〜', usage: 'V-る/ない + ことにする = bản thân tự quyết định.', example: '毎朝運動することにしました。', exampleReading: 'まいあさうんどうすることにしました。', exampleMeaning: 'Tôi quyết định tập thể dục mỗi sáng.' },
      { pattern: '〜ことになります', meaning: 'Được quyết định là 〜 (do hoàn cảnh)', usage: 'V-る/ない + ことになる = quyết định bên ngoài, không thể kiểm soát.', example: '来月東京に転勤することになりました。', exampleReading: 'らいつきとうきょうにてんきんすることになりました。', exampleMeaning: 'Tôi được điều chuyển đến Tokyo tháng tới.' },
    ],
  },
  {
    title: 'Bài 39 — Trở nên, cố gắng',
    description: 'Cách dùng 〜ようになります, 〜ようにします.',
    vocab: [
      { term: '上達する', pronunciation: 'じょうたつする', meaning: 'tiến bộ, nâng cao', example: '日本語が上達しました。', exampleReading: 'にほんごがじょうたつしました。', exampleMeaning: 'Tiếng Nhật của tôi tiến bộ rồi.' },
      { term: '毎日', pronunciation: 'まいにち', meaning: 'mỗi ngày', example: '毎日練習するようにしています。', exampleReading: 'まいにちれんしゅうするようにしています。', exampleMeaning: 'Tôi cố gắng tập luyện mỗi ngày.' },
      { term: '無駄遣い', pronunciation: 'むだづかい', meaning: 'tiêu lãng phí', example: '無駄遣いしないようにします。', exampleReading: 'むだづかいしないようにします。', exampleMeaning: 'Tôi cố gắng không tiêu lãng phí.' },
      { term: '読める', pronunciation: 'よめる', meaning: 'có thể đọc (tiềm năng)', example: '漢字が読めるようになりました。', exampleReading: 'かんじがよめるようになりました。', exampleMeaning: 'Tôi đã có thể đọc được kanji.' },
      { term: '泳げる', pronunciation: 'およげる', meaning: 'có thể bơi', example: '子どもが泳げるようになりました。', exampleReading: 'こどもがおよげるようになりました。', exampleMeaning: 'Đứa trẻ đã biết bơi rồi.' },
    ],
    grammar: [
      { pattern: '〜ようになります', meaning: 'Trở nên (có thể) 〜 / bây giờ đã 〜', usage: 'Diễn đạt sự thay đổi về khả năng hoặc thói quen theo thời gian.', example: 'ひらがなが書けるようになりました。', exampleReading: 'ひらがながかけるようになりました。', exampleMeaning: 'Tôi đã có thể viết hiragana rồi.' },
      { pattern: '〜ようにします', meaning: 'Cố gắng (để) 〜', usage: 'Diễn đạt nỗ lực, cố ý thay đổi hành vi.', example: '野菜を食べるようにしています。', exampleReading: 'やさいをたべるようにしています。', exampleMeaning: 'Tôi đang cố gắng ăn rau.' },
    ],
  },
  {
    title: 'Bài 40 — Cho và nhận (hành động)',
    description: '〜てあげます/てくれます/てもらいます với hành động giúp đỡ.',
    vocab: [
      { term: '送る', pronunciation: 'おくる', meaning: 'gửi, đưa đến', example: '友達を駅まで送ってあげました。', exampleReading: 'ともだちをえきまでおくってあげました。', exampleMeaning: 'Tôi đưa bạn ra đến ga.' },
      { term: '教える', pronunciation: 'おしえる', meaning: 'dạy, chỉ cho', example: '道を教えてくれました。', exampleReading: 'みちをおしえてくれました。', exampleMeaning: 'Anh ấy chỉ đường cho tôi.' },
      { term: '修理する', pronunciation: 'しゅうりする', meaning: 'sửa chữa', example: '車を修理してもらいました。', exampleReading: 'くるまをしゅうりしてもらいました。', exampleMeaning: 'Tôi nhờ người sửa xe.' },
      { term: '翻訳する', pronunciation: 'ほんやくする', meaning: 'dịch thuật', example: '手紙を翻訳してもらえますか？', exampleReading: 'てがみをほんやくしてもらえますか？', exampleMeaning: 'Bạn có thể dịch bức thư này giúp tôi không?' },
      { term: '迎える', pronunciation: 'むかえる', meaning: 'đón, ra đón', example: '空港まで迎えに来てくれました。', exampleReading: 'くうこうまでむかえにきてくれました。', exampleMeaning: 'Họ ra sân bay đón tôi.' },
    ],
    grammar: [
      { pattern: 'V-てあげます', meaning: 'Làm 〜 cho ai đó (người nói giúp)', usage: 'Mình giúp người khác. Cẩn thận với bề trên (dùng してさしあげます).', example: '荷物を運んであげます。', exampleReading: 'にもつをはこんであげます。', exampleMeaning: 'Tôi sẽ mang hành lý cho bạn.' },
      { pattern: 'V-てくれます', meaning: 'Ai đó làm 〜 cho tôi', usage: 'Người khác giúp người nói hoặc người gần người nói.', example: '友達が宿題を手伝ってくれました。', exampleReading: 'ともだちがしゅくだいをてつだってくれました。', exampleMeaning: 'Bạn đã giúp tôi làm bài tập.' },
    ],
  },
  {
    title: 'Bài 41 — Điều kiện 〜と',
    description: 'Cấu trúc điều kiện tự nhiên/quy tắc với 〜と.',
    vocab: [
      { term: '押す', pronunciation: 'おす', meaning: 'nhấn, đẩy', example: 'このボタンを押すと、ドアが開きます。', exampleReading: 'このボタンをおすと、ドアがあきます。', exampleMeaning: 'Nhấn nút này thì cửa sẽ mở.' },
      { term: 'スイッチ', pronunciation: 'スイッチ', meaning: 'công tắc', example: 'スイッチを入れると電気がつきます。', exampleReading: 'スイッチをいれるとでんきがつきます。', exampleMeaning: 'Bật công tắc thì đèn sáng.' },
      { term: '角', pronunciation: 'かど', meaning: 'góc đường', example: '角を曲がると、コンビニがあります。', exampleReading: 'かどをまがると、コンビニがあります。', exampleMeaning: 'Rẽ ở góc đường thì có cửa hàng tiện lợi.' },
      { term: 'まっすぐ', pronunciation: 'まっすぐ', meaning: 'thẳng', example: 'まっすぐ行くと、駅が見えます。', exampleReading: 'まっすぐいくと、えきがみえます。', exampleMeaning: 'Đi thẳng thì thấy ga tàu.' },
      { term: '春', pronunciation: 'はる', meaning: 'mùa xuân', example: '春になると桜が咲きます。', exampleReading: 'はるになるとさくらがさきます。', exampleMeaning: 'Vào mùa xuân, hoa anh đào nở.' },
    ],
    grammar: [
      { pattern: 'V-ると〜', meaning: 'Hễ V thì 〜 (quy luật)', usage: '〜と dùng với điều kiện tự nhiên, quy tắc kỹ thuật, hướng dẫn đường.', example: '右に曲がると駅があります。', exampleReading: 'みぎにまがるとえきがあります。', exampleMeaning: 'Rẽ phải là thấy ga tàu.' },
      { pattern: '〜なら', meaning: 'Nếu 〜 thì (giả định có điều kiện)', usage: 'なら dùng khi giả định dựa trên thông tin đã biết từ người đối diện.', example: '東京に行くなら、新幹線が便利です。', exampleReading: 'とうきょうにいくなら、しんかんせんがべんりです。', exampleMeaning: 'Nếu đi Tokyo thì đi tàu shinkansen tiện lợi.' },
    ],
  },
  {
    title: 'Bài 42 — Điều kiện 〜たら',
    description: 'Cấu trúc điều kiện tình huống với 〜たら.',
    vocab: [
      { term: '卒業する', pronunciation: 'そつぎょうする', meaning: 'tốt nghiệp', example: '卒業したら、就職します。', exampleReading: 'そつぎょうしたら、しゅうしょくします。', exampleMeaning: 'Sau khi tốt nghiệp thì xin việc.' },
      { term: '宝くじ', pronunciation: 'たからくじ', meaning: 'xổ số', example: '宝くじが当たったら、旅行します。', exampleReading: 'たからくじがあたったら、りょこうします。', exampleMeaning: 'Nếu trúng xổ số thì đi du lịch.' },
      { term: '着く', pronunciation: 'つく', meaning: 'đến nơi', example: '家に着いたら、連絡します。', exampleReading: 'うちについたら、れんらくします。', exampleMeaning: 'Khi về đến nhà sẽ báo tin.' },
      { term: 'もし', pronunciation: 'もし', meaning: 'nếu như', example: 'もし雨が降ったら、中止します。', exampleReading: 'もしあめがふったら、ちゅうしします。', exampleMeaning: 'Nếu trời mưa thì hủy.' },
      { term: '困る', pronunciation: 'こまる', meaning: 'khó xử, gặp rắc rối', example: '迷子になったら困ります。', exampleReading: 'まいごになったらこまります。', exampleMeaning: 'Nếu bị lạc thì khổ lắm.' },
    ],
    grammar: [
      { pattern: 'V-たら〜', meaning: 'Khi/sau khi 〜 thì', usage: '〜たら dùng cho điều kiện có thứ tự thời gian hoặc điều kiện ngẫu nhiên.', example: '勉強が終わったら遊びましょう。', exampleReading: 'べんきょうがおわったらあそびましょう。', exampleMeaning: 'Học xong rồi thì vui chơi thôi.' },
      { pattern: 'い-adj → 〜かったら', meaning: 'Nếu 〜 (tính từ い)', usage: 'Bỏ い, thêm かったら.', example: '安かったら買います。', exampleReading: 'やすかったらかいます。', exampleMeaning: 'Nếu rẻ thì tôi mua.' },
    ],
  },
  {
    title: 'Bài 43 — Điều kiện 〜ば',
    description: 'Cấu trúc điều kiện mong ước với 〜ば.',
    vocab: [
      { term: '晴れる', pronunciation: 'はれる', meaning: 'trời nắng, quang mây', example: '晴れれば、ピクニックに行きます。', exampleReading: 'はれれば、ピクニックにいきます。', exampleMeaning: 'Nếu trời đẹp thì đi dã ngoại.' },
      { term: '安ければ', pronunciation: 'やすければ', meaning: 'nếu rẻ', example: '安ければ買います。', exampleReading: 'やすければかいます。', exampleMeaning: 'Nếu rẻ thì tôi mua.' },
      { term: '時間', pronunciation: 'じかん', meaning: 'thời gian', example: '時間があれば、来てください。', exampleReading: 'じかんがあれば、きてください。', exampleMeaning: 'Nếu có thời gian thì hãy đến.' },
      { term: '練習する', pronunciation: 'れんしゅうする', meaning: 'luyện tập', example: '練習すれば上手になります。', exampleReading: 'れんしゅうすればじょうずになります。', exampleMeaning: 'Nếu luyện tập thì sẽ giỏi.' },
      { term: '健康', pronunciation: 'けんこう', meaning: 'sức khỏe', example: '健康であれば何でもできます。', exampleReading: 'けんこうであればなんでもできます。', exampleMeaning: 'Nếu khỏe mạnh thì làm được gì cũng được.' },
    ],
    grammar: [
      { pattern: 'V-ば〜', meaning: 'Nếu 〜 thì (điều kiện mong ước)', usage: 'Nhóm 1: う→えば; Nhóm 2: る→れば; する→すれば; くる→くれば.', example: '薬を飲めば治ります。', exampleReading: 'くすりをのめばなおります。', exampleMeaning: 'Nếu uống thuốc thì sẽ khỏi.' },
      { pattern: 'N-であれば / な-adj であれば', meaning: 'Nếu là 〜 thì', usage: 'であれば cho danh từ và tính từ な.', example: '元気であれば大丈夫です。', exampleReading: 'げんきであればだいじょうぶです。', exampleMeaning: 'Nếu khỏe thì không sao.' },
    ],
  },
  {
    title: 'Bài 44 — Dù cho, nhượng bộ',
    description: 'Cách dùng 〜ても và 〜のに.',
    vocab: [
      { term: '文句', pronunciation: 'もんく', meaning: 'lời phàn nàn', example: '文句があっても言えません。', exampleReading: 'もんくがあってもいえません。', exampleMeaning: 'Dù có phàn nàn cũng không nói được.' },
      { term: '諦める', pronunciation: 'あきらめる', meaning: 'từ bỏ, chịu thua', example: '難しくても諦めません。', exampleReading: 'むずかしくてもあきらめません。', exampleMeaning: 'Dù khó cũng không từ bỏ.' },
      { term: '文句', pronunciation: 'ぶんく', meaning: 'câu văn (trong văn học)', example: 'どんなに文句を言っても無駄です。', exampleReading: 'どんなにもんくをいってもむだです。', exampleMeaning: 'Dù có phàn nàn bao nhiêu cũng vô ích.' },
      { term: '試験', pronunciation: 'しけん', meaning: 'kỳ thi', example: '試験が難しかったのに合格しました。', exampleReading: 'しけんがむずかしかったのにごうかくしました。', exampleMeaning: 'Mặc dù kỳ thi khó những vẫn đỗ.' },
      { term: '努力する', pronunciation: 'どりょくする', meaning: 'nỗ lực', example: '努力したのに失敗しました。', exampleReading: 'どりょくしたのにしっぱいしました。', exampleMeaning: 'Mặc dù đã cố gắng nhưng vẫn thất bại.' },
    ],
    grammar: [
      { pattern: 'V-ても〜', meaning: 'Dù 〜 cũng (nhượng bộ)', usage: 'Dạng て + も; tính từ い → くても; tính từ な/danh từ → でも.', example: '雨が降っても試合があります。', exampleReading: 'あめがふってもしあいがあります。', exampleMeaning: 'Dù trời mưa cũng có trận đấu.' },
      { pattern: '〜のに', meaning: 'Mặc dù 〜 mà (thất vọng, bất ngờ)', usage: 'Thể thường + のに; diễn đạt kết quả trái ngược với mong đợi, thường mang cảm xúc.', example: '一生懸命勉強したのに、負けました。', exampleReading: 'いっしょうけんめいべんきょうしたのに、まけました。', exampleMeaning: 'Dù đã học chăm chỉ hết sức nhưng vẫn thua.' },
    ],
  },
  {
    title: 'Bài 45 — Trông có vẻ, hình như',
    description: 'Cách dùng 〜ようです, 〜らしいです, 〜みたいです.',
    vocab: [
      { term: 'まるで', pronunciation: 'まるで', meaning: 'như thể là, hệt như', example: 'まるで子どものようです。', exampleReading: 'まるでこどものようです。', exampleMeaning: 'Hệt như đứa trẻ vậy.' },
      { term: '様子', pronunciation: 'ようす', meaning: 'tình trạng, biểu hiện', example: '様子がおかしいですね。', exampleReading: 'ようすがおかしいですね。', exampleMeaning: 'Tình trạng có vẻ lạ nhỉ.' },
      { term: '気配', pronunciation: 'けはい', meaning: 'dấu hiệu, khí sắc', example: '誰かが来る気配がします。', exampleReading: 'だれかがくるけはいがします。', exampleMeaning: 'Tôi có cảm giác như có ai đó sắp đến.' },
      { term: 'まるで', pronunciation: 'まるで', meaning: 'giống hệt (so sánh)', example: 'まるで夢のようです。', exampleReading: 'まるでゆめのようです。', exampleMeaning: 'Hệt như là mơ vậy.' },
      { term: '立派', pronunciation: 'りっぱ', meaning: 'xuất sắc, hoành tráng', example: 'あの建物は立派ですね。', exampleReading: 'あのたてものはりっぱですね。', exampleMeaning: 'Tòa nhà đó thật hoành tráng nhỉ.' },
    ],
    grammar: [
      { pattern: '〜ようです', meaning: 'Có vẻ 〜 / hình như 〜 (dựa trên bằng chứng)', usage: 'Thể thường + ようだ; diễn đạt phán đoán dựa trên quan sát/ bằng chứng trực tiếp.', example: '彼女は眠そうなようです。', exampleReading: 'かのじょはねむそうなようです。', exampleMeaning: 'Cô ấy có vẻ buồn ngủ.' },
      { pattern: '〜らしいです', meaning: 'Hình như 〜 / nghe nói 〜 (theo thông tin)', usage: 'Thể thường + らしい; phán đoán dựa trên thông tin gián tiếp.', example: '彼は風邪らしいです。', exampleReading: 'かれはかぜらしいです。', exampleMeaning: 'Hình như anh ấy bị cảm.' },
    ],
  },
  {
    title: 'Bài 46 — Có lẽ, chắc hẳn',
    description: 'Cách dùng 〜かもしれません, 〜はずです.',
    vocab: [
      { term: '可能性', pronunciation: 'かのうせい', meaning: 'khả năng, tiềm năng', example: '遅刻する可能性があります。', exampleReading: 'ちこくするかのうせいがあります。', exampleMeaning: 'Có khả năng đến muộn.' },
      { term: '間違い', pronunciation: 'まちがい', meaning: 'sai lầm, nhầm lẫn', example: '間違いかもしれません。', exampleReading: 'まちがいかもしれません。', exampleMeaning: 'Có lẽ là nhầm rồi.' },
      { term: '空港', pronunciation: 'くうこう', meaning: 'sân bay', example: '空港はもう開いているはずです。', exampleReading: 'くうこうはもうあいているはずです。', exampleMeaning: 'Sân bay chắc đã mở rồi.' },
      { term: '合格', pronunciation: 'ごうかく', meaning: 'đỗ (kỳ thi), trúng tuyển', example: '合格しているはずです。', exampleReading: 'ごうかくしているはずです。', exampleMeaning: 'Chắc hẳn đã đỗ rồi.' },
      { term: '締め切り', pronunciation: 'しめきり', meaning: 'hạn chót', example: '締め切りは明日のはずです。', exampleReading: 'しめきりはあしたのはずです。', exampleMeaning: 'Hạn chót chắc là ngày mai.' },
    ],
    grammar: [
      { pattern: '〜かもしれません', meaning: 'Có lẽ 〜 / có thể 〜', usage: 'Thể thường + かもしれない; khả năng xảy ra khoảng 50%.', example: '明日は雨が降るかもしれません。', exampleReading: 'あしたはあめがふるかもしれません。', exampleMeaning: 'Ngày mai có lẽ trời mưa.' },
      { pattern: '〜はずです', meaning: 'Chắc hẳn 〜 / đáng lẽ 〜', usage: 'Thể thường + はず; kỳ vọng dựa trên logic, quy tắc, thông tin đã biết.', example: '彼はもう来ているはずです。', exampleReading: 'かれはもうきているはずです。', exampleMeaning: 'Anh ấy chắc đã đến rồi.' },
    ],
  },
  {
    title: 'Bài 47 — Khi làm, thời điểm',
    description: 'Cách dùng 〜とき và cách diễn đạt thời điểm.',
    vocab: [
      { term: '子どものとき', pronunciation: 'こどものとき', meaning: 'lúc còn nhỏ', example: '子どものとき、よく公園で遊びました。', exampleReading: 'こどものとき、よくこうえんであそびました。', exampleMeaning: 'Lúc còn nhỏ, tôi hay chơi trong công viên.' },
      { term: '困ったとき', pronunciation: 'こまったとき', meaning: 'khi gặp khó khăn', example: '困ったときは、相談してください。', exampleReading: 'こまったときは、そうだんしてください。', exampleMeaning: 'Khi gặp khó khăn thì hãy tham khảo ý kiến.' },
      { term: '暇', pronunciation: 'ひま', meaning: 'rảnh rỗi', example: '暇なとき、本を読みます。', exampleReading: 'ひまなとき、ほんをよみます。', exampleMeaning: 'Khi rảnh, tôi đọc sách.' },
      { term: '急ぐ', pronunciation: 'いそぐ', meaning: 'vội vàng, gấp', example: '急いでいるとき、タクシーを使います。', exampleReading: 'いそいでいるとき、タクシーをつかいます。', exampleMeaning: 'Khi vội, tôi đi taxi.' },
      { term: '若い', pronunciation: 'わかい', meaning: 'trẻ trung', example: '若いときにたくさん勉強しました。', exampleReading: 'わかいときにたくさんべんきょうしました。', exampleMeaning: 'Khi còn trẻ tôi đã học rất nhiều.' },
    ],
    grammar: [
      { pattern: 'V-るとき / V-たとき', meaning: 'Khi 〜 (thời điểm hành động)', usage: '〜るとき = trước khi hoàn thành; 〜たとき = sau khi hoàn thành.', example: '日本に来るとき、地図を買いました。', exampleReading: 'にほんにくるとき、ちずをかいました。', exampleMeaning: 'Trước khi đến Nhật, tôi mua bản đồ.' },
      { pattern: 'N/な-adj なとき', meaning: 'Khi là 〜 (danh từ, tính từ な)', usage: 'Danh từ/tính từ な + なとき để diễn đạt thời điểm theo trạng thái.', example: '元気なとき、よく走ります。', exampleReading: 'げんきなとき、よくはしります。', exampleMeaning: 'Khi khỏe, tôi hay chạy bộ.' },
    ],
  },
  {
    title: 'Bài 48 — Cho dù, cả hai, không kể',
    description: 'Cách dùng 〜ても, 〜でも, どんな〜でも.',
    vocab: [
      { term: 'どんな', pronunciation: 'どんな', meaning: 'bất kỳ loại nào, dù như thế nào', example: 'どんな仕事でも頑張ります。', exampleReading: 'どんなしごとでもがんばります。', exampleMeaning: 'Dù công việc nào tôi cũng cố gắng.' },
      { term: 'どこ', pronunciation: 'どこ', meaning: 'bất cứ đâu', example: 'どこでも生きていけます。', exampleReading: 'どこでもいきていけます。', exampleMeaning: 'Tôi có thể sống ở bất cứ đâu.' },
      { term: 'いくら', pronunciation: 'いくら', meaning: 'dù bao nhiêu', example: 'いくら食べても太りません。', exampleReading: 'いくらたべてもふとりません。', exampleMeaning: 'Dù ăn bao nhiêu cũng không béo.' },
      { term: '誰でも', pronunciation: 'だれでも', meaning: 'bất kỳ ai', example: '誰でも参加できます。', exampleReading: 'だれでもさんかできます。', exampleMeaning: 'Ai cũng có thể tham gia.' },
      { term: 'なんでも', pronunciation: 'なんでも', meaning: 'bất cứ gì', example: 'なんでも食べられます。', exampleReading: 'なんでもたべられます。', exampleMeaning: 'Tôi ăn được bất kỳ thứ gì.' },
    ],
    grammar: [
      { pattern: 'どんな〜でも', meaning: 'Dù 〜 nào cũng', usage: '疑問詞 + でも = bao quát mọi trường hợp.', example: 'どんな問題でも解決できます。', exampleReading: 'どんなもんだいでもかいけつできます。', exampleMeaning: 'Dù vấn đề nào cũng giải quyết được.' },
      { pattern: '〜さえ〜ば', meaning: 'Chỉ cần 〜 thì', usage: 'さえ nhấn mạnh điều kiện tối thiểu cần thiết.', example: '健康さえあれば幸せです。', exampleReading: 'けんこうさえあればしあわせです。', exampleMeaning: 'Chỉ cần có sức khỏe là hạnh phúc rồi.' },
    ],
  },
  {
    title: 'Bài 49 — Cách nói về nghề nghiệp, vai trò',
    description: 'Từ vựng về công việc, nghề nghiệp và vai trò xã hội.',
    vocab: [
      { term: '職業', pronunciation: 'しょくぎょう', meaning: 'nghề nghiệp', example: '職業は何ですか？', exampleReading: 'しょくぎょうはなんですか？', exampleMeaning: 'Nghề nghiệp của bạn là gì?' },
      { term: '医者', pronunciation: 'いしゃ', meaning: 'bác sĩ', example: '医者になりたいです。', exampleReading: 'いしゃになりたいです。', exampleMeaning: 'Tôi muốn trở thành bác sĩ.' },
      { term: '弁護士', pronunciation: 'べんごし', meaning: 'luật sư', example: '弁護士として働いています。', exampleReading: 'べんごしとしてはたらいています。', exampleMeaning: 'Tôi làm việc với tư cách luật sư.' },
      { term: '看護師', pronunciation: 'かんごし', meaning: 'y tá', example: '看護師は大変な仕事です。', exampleReading: 'かんごしはたいへんなしごとです。', exampleMeaning: 'Y tá là công việc vất vả.' },
      { term: '経営者', pronunciation: 'けいえいしゃ', meaning: 'nhà quản lý, chủ doanh nghiệp', example: '彼女は会社の経営者です。', exampleReading: 'かのじょはかいしゃのけいえいしゃです。', exampleMeaning: 'Cô ấy là người quản lý công ty.' },
      { term: '責任', pronunciation: 'せきにん', meaning: 'trách nhiệm', example: '責任を持って仕事をします。', exampleReading: 'せきにんをもってしごとをします。', exampleMeaning: 'Tôi làm việc có trách nhiệm.' },
    ],
    grammar: [
      { pattern: '〜として', meaning: 'Với tư cách là 〜 / trong vai trò 〜', usage: 'N + として diễn đạt vai trò, chức danh.', example: '教師として働いています。', exampleReading: 'きょうしとしてはたらいています。', exampleMeaning: 'Tôi làm việc với tư cách giáo viên.' },
      { pattern: '〜に対して', meaning: 'Đối với 〜 / về phía 〜', usage: 'N + に対して; diễn đạt thái độ hoặc hành động hướng về đối tượng.', example: '先生に対して敬意を持ちます。', exampleReading: 'せんせいにたいしてけいいをもちます。', exampleMeaning: 'Tôi tôn trọng thầy giáo.' },
    ],
  },
  {
    title: 'Bài 50 — Ôn tập tổng hợp N4',
    description: 'Ôn tập tổng hợp các cấu trúc chính của N4.',
    vocab: [
      { term: '目標', pronunciation: 'もくひょう', meaning: 'mục tiêu', example: '目標を達成するために努力します。', exampleReading: 'もくひょうをたっせいするためにどりょくします。', exampleMeaning: 'Tôi nỗ lực để đạt mục tiêu.' },
      { term: '達成する', pronunciation: 'たっせいする', meaning: 'đạt được, hoàn thành', example: '目標を達成しました。', exampleReading: 'もくひょうをたっせいしました。', exampleMeaning: 'Tôi đã đạt được mục tiêu.' },
      { term: '継続する', pronunciation: 'けいぞくする', meaning: 'tiếp tục', example: '継続は力なり。', exampleReading: 'けいぞくはちからなり。', exampleMeaning: 'Kiên trì là sức mạnh.' },
      { term: '向上する', pronunciation: 'こうじょうする', meaning: 'tiến bộ, cải thiện', example: 'スキルを向上させたいです。', exampleReading: 'スキルをこうじょうさせたいです。', exampleMeaning: 'Tôi muốn cải thiện kỹ năng.' },
      { term: '自信', pronunciation: 'じしん', meaning: 'tự tin', example: '自信を持って話してください。', exampleReading: 'じしんをもってはなしてください。', exampleMeaning: 'Hãy tự tin nói.' },
      { term: '成長する', pronunciation: 'せいちょうする', meaning: 'phát triển, trưởng thành', example: '毎日少しずつ成長しています。', exampleReading: 'まいにちすこしずつせいちょうしています。', exampleMeaning: 'Tôi đang phát triển từng ngày một chút.' },
    ],
    grammar: [
      { pattern: '〜ために (lý do)', meaning: 'Vì 〜 / do 〜 (nguyên nhân)', usage: 'Thể thông thường (quá khứ) + ために; diễn đạt nguyên nhân không thể kiểm soát.', example: '病気のために、会社を休みました。', exampleReading: 'びょうきのために、かいしゃをやすみました。', exampleMeaning: 'Vì bị ốm nên tôi nghỉ công ty.' },
      { pattern: '〜によって', meaning: 'Tùy 〜 / do 〜 (nguyên nhân/phương tiện)', usage: 'N + によって; diễn đạt nguyên nhân, phương tiện hoặc sự khác biệt tùy đối tượng.', example: '人によって意見が違います。', exampleReading: 'ひとによっていけんがちがいます。', exampleMeaning: 'Tùy người mà ý kiến khác nhau.' },
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
    const lessonOrder = i + 1; // bài 26 = order 26 - offset by N4 start

    // Vocab lesson
    if (lesson.vocab.length > 0) {
      const vocabLessonId = `ml-n4-v-${lessonOrder}`;
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
          categoryId: vocabCat.id,
        },
      });

      // Delete existing items then recreate
      await prisma.content.deleteMany({ where: { lessonId: vocabLessonId } });
      const createdVocab = await prisma.content.createManyAndReturn({
        data: lesson.vocab.map((w, idx) => ({
          lessonId: vocabLessonId,
          type: 'vocab' as const,
          language: 'ja' as Language,
          term: w.term,
          pronunciation: w.pronunciation ?? null,
          order: idx + 1,
        })),
      });
      await prisma.contentMeaning.createMany({
        data: createdVocab.map((c, idx) => ({
          contentId: c.id,
          language: 'vi' as Language,
          meaning: lesson.vocab[idx].meaning,
        })),
      });
      const vocabExamples = createdVocab
        .map((c, idx) => ({ c, w: lesson.vocab[idx] }))
        .filter(({ w }) => w.example)
        .map(({ c, w }) => ({
          contentId: c.id,
          exampleText: w.example!,
          translation: w.exampleMeaning ?? null,
          language: 'ja' as Language,
          translationLanguage: w.exampleMeaning ? ('vi' as Language) : null,
        }));
      if (vocabExamples.length > 0) {
        await prisma.contentExample.createMany({ data: vocabExamples });
      }
    }

    // Grammar lesson
    if (lesson.grammar.length > 0) {
      const grammarLessonId = `ml-n4-g-${lessonOrder}`;
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
          categoryId: grammarCat.id,
        },
      });

      await prisma.content.deleteMany({ where: { lessonId: grammarLessonId } });
      const createdGrammar = await prisma.content.createManyAndReturn({
        data: lesson.grammar.map((g, idx) => ({
          lessonId: grammarLessonId,
          type: 'grammar' as const,
          language: 'ja' as Language,
          term: g.pattern,
          pronunciation: null,
          order: idx + 1,
        })),
      });
      await prisma.contentMeaning.createMany({
        data: createdGrammar.map((c, idx) => ({
          contentId: c.id,
          language: 'vi' as Language,
          meaning: lesson.grammar[idx].meaning,
        })),
      });
      const grammarExamples = createdGrammar
        .map((c, idx) => ({ c, g: lesson.grammar[idx] }))
        .filter(({ g }) => g.example)
        .map(({ c, g }) => ({
          contentId: c.id,
          exampleText: g.example!,
          translation: g.exampleMeaning ?? null,
          language: 'ja' as Language,
          translationLanguage: g.exampleMeaning ? ('vi' as Language) : null,
        }));
      if (grammarExamples.length > 0) {
        await prisma.contentExample.createMany({ data: grammarExamples });
      }
    }

    process.stdout.write(`  N4 Bài ${lessonOrder}/${lessons.length} ✓\r`);
  }
  console.log(`\n✅ N4: ${lessons.length} bài (vocab + grammar) seeded.`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌸 Seeding Minna no Nihongo N4 (Bài 26~50) — Full data...');
  await seedLevel('N4', MINNA_N4, 'Minna no Nihongo II');
  console.log('🎉 Done!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
