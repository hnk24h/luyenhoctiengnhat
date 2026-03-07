/**
 * Seed JLPT reference vocabulary (N5–N1) into LearningItem via LearningCategory/LearningLesson
 * Each word has 1–2 example sentences.
 * Run: npx tsx prisma/seed-jlpt-vocab.ts
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ─── Vocab data ──────────────────────────────────────────────────────────────
// [japanese, reading, meaning, example, exampleReading, exampleMeaning, example2?, exampleReading2?, exampleMeaning2?]
type WordRow = [string, string, string, string, string, string, string?, string?, string?];

const VOCAB: Record<string, WordRow[]> = {
  N5: [
    ['食べる', 'たべる', 'ăn', '毎日、野菜を食べます。', 'まいにち、やさいをたべます。', 'Mỗi ngày tôi ăn rau.', '朝ご飯を食べましたか？', 'あさごはんをたべましたか？', 'Bạn đã ăn sáng chưa?'],
    ['飲む', 'のむ', 'uống', '水を飲んでください。', 'みずをのんでください。', 'Xin hãy uống nước.', 'コーヒーを毎朝飲みます。', 'コーヒーをまいあさのみます。', 'Tôi uống cà phê mỗi sáng.'],
    ['見る', 'みる', 'xem, nhìn', '映画を見ます。', 'えいがをみます。', 'Tôi xem phim.', '空を見てください。', 'そらをみてください。', 'Hãy nhìn lên bầu trời.'],
    ['聞く', 'きく', 'nghe; hỏi', '音楽を聞きます。', 'おんがくをききます。', 'Tôi nghe nhạc.', '道を聞きました。', 'みちをききました。', 'Tôi đã hỏi đường.'],
    ['話す', 'はなす', 'nói chuyện', '友達と話します。', 'ともだちとはなします。', 'Tôi nói chuyện với bạn.', '日本語で話してください。', 'にほんごではなしてください。', 'Hãy nói bằng tiếng Nhật.'],
    ['書く', 'かく', 'viết', '手紙を書きます。', 'てがみをかきます。', 'Tôi viết thư.', '名前を書いてください。', 'なまえをかいてください。', 'Xin hãy viết tên.'],
    ['読む', 'よむ', 'đọc', '本を読みます。', 'ほんをよみます。', 'Tôi đọc sách.', '毎日新聞を読みます。', 'まいにちしんぶんをよみます。', 'Tôi đọc báo mỗi ngày.'],
    ['行く', 'いく', 'đi', '学校に行きます。', 'がっこうにいきます。', 'Tôi đến trường.', '明日、店に行きます。', 'あした、みせにいきます。', 'Ngày mai tôi đến cửa hàng.'],
    ['来る', 'くる', 'đến, tới', '友達が来ます。', 'ともだちがきます。', 'Bạn tôi đến.', '日本に来てよかった。', 'にほんにきてよかった。', 'Thật may khi đến Nhật.'],
    ['帰る', 'かえる', 'về (nhà)', '家に帰ります。', 'いえにかえります。', 'Tôi về nhà.', '何時に帰りますか？', 'なんじにかえりますか？', 'Bạn về lúc mấy giờ?'],
    ['大きい', 'おおきい', 'to, lớn', '大きい犬がいます。', 'おおきいいぬがいます。', 'Có một con chó to.', 'この部屋は大きいです。', 'このへやはおおきいです。', 'Phòng này rất rộng.'],
    ['小さい', 'ちいさい', 'nhỏ, bé', '小さい子どもです。', 'ちいさいこどもです。', 'Là đứa trẻ nhỏ.', 'このバッグは小さすぎます。', 'このバッグはちいさすぎます。', 'Cái túi này quá nhỏ.'],
    ['新しい', 'あたらしい', 'mới', '新しい本を買いました。', 'あたらしいほんをかいました。', 'Tôi đã mua sách mới.', '新しい仕事を始めます。', 'あたらしいしごとをはじめます。', 'Tôi bắt đầu công việc mới.'],
    ['古い', 'ふるい', 'cũ', '古い車を売りました。', 'ふるいくるまをうりました。', 'Tôi đã bán xe cũ.', 'この建物は古いです。', 'このたてものはふるいです。', 'Tòa nhà này cũ rồi.'],
    ['高い', 'たかい', 'cao; đắt', 'このかばんは高いです。', 'このかばんはたかいです。', 'Cái túi này đắt.', '山が高いです。', 'やまがたかいです。', 'Ngọn núi cao.'],
    ['安い', 'やすい', 'rẻ', '安いレストランです。', 'やすいレストランです。', 'Là nhà hàng rẻ.', 'この服は安くていいです。', 'このふくはやすくていいです。', 'Bộ quần áo này rẻ mà tốt.'],
    ['好き', 'すき', 'thích', '日本語が好きです。', 'にほんごがすきです。', 'Tôi thích tiếng Nhật.', '何が好きですか？', 'なにがすきですか？', 'Bạn thích gì?'],
    ['嫌い', 'きらい', 'ghét, không thích', '魚が嫌いです。', 'さかながきらいです。', 'Tôi không thích cá.', '虫が嫌いです。', 'むしがきらいです。', 'Tôi ghét côn trùng.'],
    ['電車', 'でんしゃ', 'tàu điện', '電車で行きます。', 'でんしゃでいきます。', 'Tôi đi bằng tàu điện.', '電車が遅れています。', 'でんしゃがおくれています。', 'Tàu điện bị trễ.'],
    ['学校', 'がっこう', 'trường học', '学校に行きます。', 'がっこうにいきます。', 'Tôi đến trường.', '学校は楽しいです。', 'がっこうはたのしいです。', 'Trường học thú vị.'],
    ['先生', 'せんせい', 'giáo viên, thầy/cô', '先生が来ました。', 'せんせいがきました。', 'Giáo viên đến rồi.', '先生に質問します。', 'せんせいにしつもんします。', 'Tôi hỏi thầy giáo.'],
    ['友達', 'ともだち', 'bạn bè', '友達と遊びます。', 'ともだちとあそびます。', 'Tôi chơi với bạn.', '友達に会いたいです。', 'ともだちにあいたいです。', 'Tôi muốn gặp bạn bè.'],
    ['家族', 'かぞく', 'gia đình', '家族と旅行します。', 'かぞくとりょこうします。', 'Tôi du lịch với gia đình.', '家族が大切です。', 'かぞくがたいせつです。', 'Gia đình quan trọng.'],
    ['今日', 'きょう', 'hôm nay', '今日は晴れです。', 'きょうははれです。', 'Hôm nay trời đẹp.', '今日は何曜日ですか？', 'きょうはなんようびですか？', 'Hôm nay là thứ mấy?'],
    ['明日', 'あした', 'ngày mai', '明日また来ます。', 'あしたまたきます。', 'Ngày mai tôi lại đến.', '明日の天気はどうですか？', 'あしたのてんきはどうですか？', 'Thời tiết ngày mai thế nào?'],
    ['毎日', 'まいにち', 'mỗi ngày', '毎日勉強します。', 'まいにちべんきょうします。', 'Tôi học mỗi ngày.', '毎日運動することが大切です。', 'まいにちうんどうすることがたいせつです。', 'Tập thể dục mỗi ngày rất quan trọng.'],
    ['何', 'なに', 'gì, cái gì', '何を食べますか？', 'なにをたべますか？', 'Bạn ăn gì?', '何時ですか？', 'なんじですか？', 'Mấy giờ rồi?'],
    ['どこ', 'どこ', 'ở đâu, đâu', 'どこに行きますか？', 'どこにいきますか？', 'Bạn đi đâu?', 'トイレはどこですか？', 'トイレはどこですか？', 'Nhà vệ sinh ở đâu?'],
    ['どうして', 'どうして', 'tại sao, vì sao', 'どうして来なかったんですか？', 'どうしてこなかったんですか？', 'Tại sao bạn không đến?', 'どうして日本語を勉強しますか？', 'どうしてにほんごをべんきょうしますか？', 'Tại sao bạn học tiếng Nhật?'],
    ['いくら', 'いくら', 'bao nhiêu tiền', 'これはいくらですか？', 'これはいくらですか？', 'Cái này bao nhiêu tiền?', 'あのかばんはいくらですか？', 'あのかばんはいくらですか？', 'Cái túi kia bao nhiêu tiền?'],
  ],

  N4: [
    ['受ける', 'うける', 'nhận; thi; chịu', '試験を受けます。', 'しけんをうけます。', 'Tôi thi.', '手術を受けました。', 'しゅじゅつをうけました。', 'Tôi đã phẫu thuật.'],
    ['集める', 'あつめる', 'thu thập, tập hợp', '切手を集めます。', 'きってをあつめます。', 'Tôi sưu tầm tem.', 'データを集めて分析します。', 'データをあつめてぶんせきします。', 'Tôi thu thập dữ liệu và phân tích.'],
    ['運ぶ', 'はこぶ', 'mang, vận chuyển', '荷物を運びます。', 'にもつをはこびます。', 'Tôi mang hành lý.', '机を運んでもらえますか？', 'つくえをはこんでもらえますか？', 'Bạn có thể mang bàn giúp tôi không?'],
    ['思う', 'おもう', 'nghĩ, cảm thấy', 'そう思います。', 'そうおもいます。', 'Tôi nghĩ vậy.', '彼は来ると思います。', 'かれはくるとおもいます。', 'Tôi nghĩ anh ấy sẽ đến.'],
    ['選ぶ', 'えらぶ', 'chọn, lựa chọn', '好きな物を選んでください。', 'すきなものをえらんでください。', 'Hãy chọn thứ bạn thích.', '正しい答えを選びなさい。', 'ただしいこたえをえらびなさい。', 'Hãy chọn câu trả lời đúng.'],
    ['教える', 'おしえる', 'dạy, chỉ dẫn', '道を教えてください。', 'みちをおしえてください。', 'Xin chỉ đường cho tôi.', '日本語を教えています。', 'にほんごをおしえています。', 'Tôi đang dạy tiếng Nhật.'],
    ['起きる', 'おきる', 'thức dậy; xảy ra', '毎朝六時に起きます。', 'まいあさろくじにおきます。', 'Tôi thức dậy lúc 6 giờ mỗi sáng.', '何が起きたのですか？', 'なにがおきたのですか？', 'Chuyện gì đã xảy ra vậy?'],
    ['考える', 'かんがえる', 'suy nghĩ, cân nhắc', 'よく考えてから決めます。', 'よくかんがえてからきめます。', 'Tôi suy nghĩ kỹ rồi quyết định.', '一緒に考えましょう。', 'いっしょにかんがえましょう。', 'Hãy cùng suy nghĩ nào.'],
    ['決める', 'きめる', 'quyết định, xác định', '行き先を決めます。', 'いきさきをきめます。', 'Tôi quyết định điểm đến.', '日にちを決めてください。', 'にちをきめてください。', 'Hãy quyết định ngày tháng.'],
    ['失敗', 'しっぱい', 'thất bại, sai lầm', '失敗しても大丈夫です。', 'しっぱいしてもだいじょうぶです。', 'Dù thất bại cũng không sao.', '料理に失敗しました。', 'りょうりにしっぱいしました。', 'Tôi đã nấu ăn thất bại.'],
    ['成功', 'せいこう', 'thành công', '成功するために頑張ります。', 'せいこうするためにがんばります。', 'Tôi cố gắng để thành công.', 'プロジェクトが成功しました。', 'プロジェクトがせいこうしました。', 'Dự án đã thành công.'],
    ['大切', 'たいせつ', 'quan trọng, quý giá', '健康が大切です。', 'けんこうがたいせつです。', 'Sức khỏe quan trọng.', '時間を大切にしてください。', 'じかんをたいせつにしてください。', 'Hãy trân trọng thời gian.'],
    ['準備', 'じゅんび', 'chuẩn bị', '旅行の準備をします。', 'りょこうのじゅんびをします。', 'Tôi chuẩn bị cho chuyến đi.', '準備はできましたか？', 'じゅんびはできましたか？', 'Bạn đã chuẩn bị xong chưa?'],
    ['練習', 'れんしゅう', 'luyện tập, thực hành', '毎日練習します。', 'まいにちれんしゅうします。', 'Tôi luyện tập mỗi ngày.', 'もっと練習が必要です。', 'もっとれんしゅうがひつようです。', 'Cần luyện tập thêm.'],
    ['予定', 'よてい', 'kế hoạch, lịch trình', '明日の予定は？', 'あしたのよていは？', 'Kế hoạch ngày mai là gì?', '会議の予定が変わりました。', 'かいぎのよていがかわりました。', 'Lịch họp đã thay đổi.'],
    ['生活', 'せいかつ', 'cuộc sống, sinh hoạt', '日本の生活は楽しいです。', 'にほんのせいかつはたのしいです。', 'Cuộc sống ở Nhật thú vị.', '健康な生活を送りたい。', 'けんこうなせいかつをおくりたい。', 'Tôi muốn sống cuộc sống khỏe mạnh.'],
    ['文化', 'ぶんか', 'văn hóa', '日本の文化を学びます。', 'にほんのぶんかをまなびます。', 'Tôi học văn hóa Nhật.', '文化の違いが面白いです。', 'ぶんかのちがいがおもしろいです。', 'Sự khác biệt văn hóa thật thú vị.'],
    ['社会', 'しゃかい', 'xã hội', '社会に役に立つ仕事がしたい。', 'しゃかいにやくにたつしごとがしたい。', 'Tôi muốn làm công việc có ích cho xã hội.', '社会の問題について考えます。', 'しゃかいのもんだいについてかんがえます。', 'Tôi suy nghĩ về các vấn đề xã hội.'],
    ['趣味', 'しゅみ', 'sở thích', '趣味は何ですか？', 'しゅみはなんですか？', 'Sở thích của bạn là gì?', '趣味は読書です。', 'しゅみはどくしょです。', 'Sở thích của tôi là đọc sách.'],
    ['世界', 'せかい', 'thế giới', '世界を旅したいです。', 'せかいをたびしたいです。', 'Tôi muốn du lịch thế giới.', '世界には多くの言語があります。', 'せかいにはおおくのげんごがあります。', 'Trên thế giới có rất nhiều ngôn ngữ.'],
    ['経験', 'けいけん', 'kinh nghiệm, trải nghiệm', '経験が大切です。', 'けいけんがたいせつです。', 'Kinh nghiệm quan trọng.', '海外での経験が役に立ちました。', 'かいがいでのけいけんがやくにたちました。', 'Kinh nghiệm ở nước ngoài đã có ích.'],
    ['結婚', 'けっこん', 'kết hôn', '来年結婚します。', 'らいねんけっこんします。', 'Năm sau tôi kết hôn.', '結婚おめでとうございます。', 'けっこんおめでとうございます。', 'Xin chúc mừng đám cưới.'],
    ['以前', 'いぜん', 'trước đây, trước kia', '以前は東京に住んでいました。', 'いぜんはとうきょうにすんでいました。', 'Trước đây tôi từng sống ở Tokyo.', '以前に会ったことがあります。', 'いぜんにあったことがあります。', 'Chúng ta đã gặp nhau trước đây.'],
    ['最近', 'さいきん', 'gần đây, dạo này', '最近、忙しいです。', 'さいきん、いそがしいです。', 'Dạo này tôi bận.', '最近何か面白いことがありましたか？', 'さいきんなにかおもしろいことがありましたか？', 'Gần đây bạn có điều gì thú vị không?'],
    ['気持ち', 'きもち', 'cảm giác, cảm xúc', '気持ちを伝えることが大切です。', 'きもちをつたえることがたいせつです。', 'Bày tỏ cảm xúc rất quan trọng.', 'ありがとう、気持ちが嬉しいです。', 'ありがとう、きもちがうれしいです。', 'Cảm ơn, tôi rất vui vì điều đó.'],
  ],

  N3: [
    ['悩む', 'なやむ', 'băn khoăn, lo lắng', '進路に悩んでいます。', 'しんろになやんでいます。', 'Tôi đang băn khoăn về hướng đi.', '悩んでも答えが出ません。', 'なやんでもこたえがでません。', 'Dù lo lắng cũng không ra được câu trả lời.'],
    ['困る', 'こまる', 'gặp khó khăn, bối rối', 'お金がなくて困っています。', 'おかねがなくてこまっています。', 'Tôi gặp khó khăn vì không có tiền.', '困ったらいつでも相談してください。', 'こまったらいつでもそうだんしてください。', 'Nếu gặp khó khăn, hãy tham khảo ý kiến bất cứ lúc nào.'],
    ['認める', 'みとめる', 'thừa nhận, công nhận', '失敗を認めることが大切です。', 'しっぱいをみとめることがたいせつです。', 'Thừa nhận thất bại là điều quan trọng.', '彼の能力を認めます。', 'かれののうりょくをみとめます。', 'Tôi công nhận năng lực của anh ấy.'],
    ['続ける', 'つづける', 'tiếp tục', '毎日練習を続けます。', 'まいにちれんしゅうをつづけます。', 'Tôi tiếp tục luyện tập mỗi ngày.', '努力を続ければ成功できます。', 'どりょくをつづければせいこうできます。', 'Nếu tiếp tục cố gắng thì có thể thành công.'],
    ['増える', 'ふえる', 'tăng lên, nhiều hơn', '人口が増えています。', 'じんこうがふえています。', 'Dân số đang tăng lên.', '外国人観光客が増えています。', 'がいこくじんかんこうきゃくがふえています。', 'Khách du lịch nước ngoài đang tăng lên.'],
    ['変わる', 'かわる', 'thay đổi, biến đổi', '季節が変わりました。', 'きせつがかわりました。', 'Mùa đã thay đổi.', '世界は常に変わり続けています。', 'せかいはつねにかわりつづけています。', 'Thế giới luôn thay đổi không ngừng.'],
    ['進む', 'すすむ', 'tiến lên, tiến bộ', '計画通りに進んでいます。', 'けいかくどおりにすすんでいます。', 'Đang tiến hành theo kế hoạch.', '話し合いが前に進まない。', 'はなしあいがまえにすすまない。', 'Cuộc thảo luận không tiến triển.'],
    ['減る', 'へる', 'giảm, ít đi', '体重が減りました。', 'たいじゅうがへりました。', 'Cân nặng giảm rồi.', '食料が減ってきた。', 'しょくりょうがへってきた。', 'Lương thực đang cạn dần.'],
    ['比べる', 'くらべる', 'so sánh', 'AとBを比べると、Aの方が良いです。', 'AとBをくらべると、Aのほうがよいです。', 'So sánh A và B thì A tốt hơn.', '去年と比べて物価が上がりました。', 'きょねんとくらべてぶっかがあがりました。', 'So với năm ngoái thì giá cả đã tăng.'],
    ['経済', 'けいざい', 'kinh tế', '経済が成長しています。', 'けいざいがせいちょうしています。', 'Nền kinh tế đang tăng trưởng.', '経済的な理由で留学を諦めた。', 'けいざいてきなりゆうでりゅうがくをあきらめた。', 'Tôi từ bỏ du học vì lý do kinh tế.'],
    ['環境', 'かんきょう', 'môi trường', '環境を守りましょう。', 'かんきょうをまもりましょう。', 'Hãy bảo vệ môi trường.', '環境問題は深刻です。', 'かんきょうもんだいはしんこくです。', 'Vấn đề môi trường rất nghiêm trọng.'],
    ['技術', 'ぎじゅつ', 'kỹ thuật, công nghệ', '最新技術を学びます。', 'さいしんぎじゅつをまなびます。', 'Tôi học công nghệ mới nhất.', '日本の技術は世界的に有名です。', 'にほんのぎじゅつはせかいてきにゆうめいです。', 'Công nghệ của Nhật nổi tiếng trên thế giới.'],
    ['影響', 'えいきょう', 'ảnh hưởng, tác động', '気候変動は生活に影響します。', 'きこうへんどうはせいかつにえいきょうします。', 'Biến đổi khí hậu ảnh hưởng đến cuộc sống.', 'ストレスは健康に悪い影響を与えます。', 'ストレスはけんこうにわるいえいきょうをあたえます。', 'Stress gây ảnh hưởng xấu đến sức khỏe.'],
    ['関係', 'かんけい', 'quan hệ, mối liên quan', '二人の関係は良好です。', 'ふたりのかんけいはりょうこうです。', 'Quan hệ của hai người tốt.', '仕事と家族の関係のバランスが難しい。', 'しごとかぞくのかんけいのバランスがむずかしい。', 'Cân bằng giữa công việc và gia đình rất khó.'],
    ['危険', 'きけん', 'nguy hiểm', '一人で山に登るのは危険です。', 'ひとりでやまにのぼるのはきけんです。', 'Leo núi một mình rất nguy hiểm.', '危険な場所には近づかないでください。', 'きけんなばしょにはちかづかないでください。', 'Không được tiếp cận những nơi nguy hiểm.'],
    ['安全', 'あんぜん', 'an toàn', '安全に気をつけてください。', 'あんぜんにきをつけてください。', 'Hãy chú ý an toàn.', '子どもの安全が最優先です。', 'こどものあんぜんがさいゆうせんです。', 'An toàn của trẻ em là ưu tiên hàng đầu.'],
    ['自然', 'しぜん', 'thiên nhiên; tự nhiên', '自然が好きです。', 'しぜんがすきです。', 'Tôi thích thiên nhiên.', '自然の中でリラックスできます。', 'しぜんのなかでリラックスできます。', 'Có thể thư giãn trong thiên nhiên.'],
    ['機会', 'きかい', 'cơ hội', 'このチャンスを逃さないようにしよう。', 'このチャンスをのがさないようにしよう。', 'Hãy đừng bỏ lỡ cơ hội này.', '海外で働く機会を得ました。', 'かいがいではたらくきかいをえました。', 'Tôi có được cơ hội làm việc ở nước ngoài.'],
    ['問題', 'もんだい', 'vấn đề, bài tập', '問題を解決します。', 'もんだいをかいけつします。', 'Tôi giải quyết vấn đề.', 'この問題は簡単ではありません。', 'このもんだいはかんたんではありません。', 'Vấn đề này không đơn giản.'],
    ['将来', 'しょうらい', 'tương lai', '将来の夢は医者です。', 'しょうらいのゆめはいしゃです。', 'Ước mơ tương lai của tôi là bác sĩ.', '将来のために今頑張っています。', 'しょうらいのためにいまがんばっています。', 'Tôi đang cố gắng hiện tại vì tương lai.'],
    ['原因', 'げんいん', 'nguyên nhân', '失敗の原因を調べます。', 'しっぱいのげんいんをしらべます。', 'Tôi điều tra nguyên nhân thất bại.', '事故の原因はまだわかりません。', 'じこのげんいんはまだわかりません。', 'Nguyên nhân tai nạn vẫn chưa rõ.'],
  ],

  N2: [
    ['以下', 'いか', 'dưới đây; dưới (số)', '詳細は以下を参照してください。', 'しょうさいはいかをさんしょうしてください。', 'Vui lòng xem chi tiết dưới đây.', '18歳以下は入場できません。', 'じゅうはっさいいかはにゅうじょうできません。', 'Người dưới 18 tuổi không được vào.'],
    ['以上', 'いじょう', 'trên, hơn; trở lên', '18歳以上の方が対象です。', 'じゅうはっさいいじょうのかたがたいしょうです。', 'Dành cho người từ 18 tuổi trở lên.', '以上で報告を終わります。', 'いじょうでほうこくをおわります。', 'Tôi kết thúc báo cáo ở đây.'],
    ['重要', 'じゅうよう', 'quan trọng, trọng yếu', 'これは重要な情報です。', 'これはじゅうようなじょうほうです。', 'Đây là thông tin quan trọng.', '重要な決定を下しました。', 'じゅうようなけっていをくだしました。', 'Chúng tôi đã đưa ra quyết định quan trọng.'],
    ['必要', 'ひつよう', 'cần thiết, cần có', 'パスポートが必要です。', 'パスポートがひつようです。', 'Cần có hộ chiếu.', '資格が必要な仕事です。', 'しかくがひつようなしごとです。', 'Đây là công việc cần có bằng cấp.'],
    ['可能', 'かのう', 'có thể, khả thi', 'それは可能です。', 'それはかのうです。', 'Điều đó là có thể.', '予約は可能ですか？', 'よやくはかのうですか？', 'Có thể đặt chỗ không?'],
    ['証明', 'しょうめい', 'chứng minh, chứng nhận', '身分を証明してください。', 'みぶんをしょうめいしてください。', 'Vui lòng chứng minh danh tính.', '彼は無実を証明しました。', 'かれはむじつをしょうめいしました。', 'Anh ấy đã chứng minh sự vô tội.'],
    ['判断', 'はんだん', 'phán đoán, quyết định', '自分で判断してください。', 'じぶんではんだんしてください。', 'Hãy tự mình phán đoán.', '状況を正確に判断することが重要です。', 'じょうきょうをせいかくにはんだんすることがじゅうようです。', 'Phán đoán tình huống chính xác là điều quan trọng.'],
    ['解決', 'かいけつ', 'giải quyết', '問題を解決しました。', 'もんだいをかいけつしました。', 'Đã giải quyết vấn đề.', '紛争を平和的に解決したい。', 'ふんそうをへいわてきにかいけつしたい。', 'Tôi muốn giải quyết xung đột một cách hòa bình.'],
    ['改善', 'かいぜん', 'cải thiện, cải tiến', 'サービスを改善します。', 'サービスをかいぜんします。', 'Chúng tôi cải thiện dịch vụ.', '生活習慣を改善する必要があります。', 'せいかつしゅうかんをかいぜんするひつようがあります。', 'Cần cải thiện thói quen sinh hoạt.'],
    ['提案', 'ていあん', 'đề xuất, đề nghị', '新しい提案をします。', 'あたらしいていあんをします。', 'Tôi đưa ra đề xuất mới.', '提案を検討してください。', 'ていあんをけんとうしてください。', 'Vui lòng xem xét đề xuất.'],
    ['調査', 'ちょうさ', 'điều tra, khảo sát', '市場調査を行います。', 'しじょうちょうさをおこないます。', 'Chúng tôi tiến hành khảo sát thị trường.', '事故の原因を調査中です。', 'じこのげんいんをちょうさちゅうです。', 'Đang điều tra nguyên nhân tai nạn.'],
    ['確認', 'かくにん', 'xác nhận, kiểm tra', '予約を確認します。', 'よやくをかくにんします。', 'Tôi xác nhận đặt chỗ.', '内容をよく確認してから署名してください。', 'ないようをよくかくにんしてからしょめいしてください。', 'Hãy xác nhận nội dung kỹ rồi mới ký.'],
    ['状況', 'じょうきょう', 'tình hình, tình trạng', '現在の状況を説明します。', 'げんざいのじょうきょうをせつめいします。', 'Tôi giải thích tình hình hiện tại.', '状況に応じて対応します。', 'じょうきょうにおうじてたいおうします。', 'Tôi ứng phó tùy theo tình hình.'],
    ['義務', 'ぎむ', 'nghĩa vụ, bổn phận', '税金を払う義務があります。', 'ぜいきんをはらうぎむがあります。', 'Có nghĩa vụ nộp thuế.', '法に従うことは市民の義務です。', 'ほうにしたがうことはしみんのぎむです。', 'Tuân theo pháp luật là nghĩa vụ của công dân.'],
    ['権利', 'けんり', 'quyền, quyền lợi', '発言する権利があります。', 'はつげんするけんりがあります。', 'Có quyền được nói.', '教育を受ける権利は基本的人権です。', 'きょういくをうけるけんりはきほんてきじんけんです。', 'Quyền được giáo dục là quyền con người cơ bản.'],
    ['効果', 'こうか', 'hiệu quả, tác dụng', 'この薬は効果があります。', 'このくすりはこうかがあります。', 'Thuốc này có hiệu quả.', '治療の効果が出てきました。', 'ちりょうのこうかがでてきました。', 'Hiệu quả điều trị đã bắt đầu xuất hiện.'],
    ['基準', 'きじゅん', 'tiêu chuẩn, cơ sở', '品質の基準を設けます。', 'ひんしつのきじゅんをもうけます。', 'Đặt ra tiêu chuẩn chất lượng.', '採用基準を満たしていません。', 'さいようきじゅんをみたしていません。', 'Không đáp ứng tiêu chuẩn tuyển dụng.'],
    ['具体的', 'ぐたいてき', 'cụ thể', '具体的な例を挙げてください。', 'ぐたいてきなれいをあげてください。', 'Hãy đưa ra ví dụ cụ thể.', '具体的な計画が必要です。', 'ぐたいてきなけいかくがひつようです。', 'Cần có kế hoạch cụ thể.'],
    ['一般的', 'いっぱんてき', 'nói chung, phổ biến', '一般的に言えば、これは正しいです。', 'いっぱんてきにいえば、これはただしいです。', 'Nói chung thì điều này đúng.', '一般的な考え方では理解できません。', 'いっぱんてきなかんがえかたではりかいできません。', 'Không thể hiểu được bằng suy nghĩ thông thường.'],
    ['対象', 'たいしょう', 'đối tượng', '全員が対象です。', 'ぜんいんがたいしょうです。', 'Tất cả mọi người đều là đối tượng.', 'この制度は学生を対象としています。', 'このせいどはがくせいをたいしょうとしています。', 'Chế độ này nhắm đến học sinh.'],
    ['目的', 'もくてき', 'mục đích, mục tiêu', '旅行の目的は何ですか？', 'りょこうのもくてきはなんですか？', 'Mục đích chuyến đi là gì?', '明確な目的を持って行動します。', 'めいかくなもくてきをもってこうどうします。', 'Tôi hành động với mục đích rõ ràng.'],
  ],

  N1: [
    ['概念', 'がいねん', 'khái niệm', '抽象的な概念を理解するのは難しい。', 'ちゅうしょうてきながいねんをりかいするのはむずかしい。', 'Hiểu khái niệm trừu tượng rất khó.', '新しい概念を導入しました。', 'あたらしいがいねんをどうにゅうしました。', 'Chúng tôi đã đưa vào khái niệm mới.'],
    ['促進', 'そくしん', 'thúc đẩy, xúc tiến', '経済発展を促進する政策が必要だ。', 'けいざいはってんをそくしんするせいさくがひつようだ。', 'Cần có chính sách thúc đẩy phát triển kinh tế.', '理解を促進するために図を使います。', 'りかいをそくしんするためにずをつかいます。', 'Tôi dùng hình ảnh để thúc đẩy sự hiểu biết.'],
    ['矛盾', 'むじゅん', 'mâu thuẫn', '彼の話には矛盾があります。', 'かれのはなしにはむじゅんがあります。', 'Câu chuyện của anh ấy có mâu thuẫn.', '行動と言葉が矛盾しています。', 'こうどうとことばがむじゅんしています。', 'Hành động và lời nói mâu thuẫn nhau.'],
    ['把握', 'はあく', 'nắm bắt, nắm vững', '現状を把握することが重要です。', 'げんじょうをはあくすることがじゅうようです。', 'Nắm bắt tình hình hiện tại rất quan trọng.', '問題の本質を把握しなければならない。', 'もんだいのほんしつをはあくしなければならない。', 'Phải nắm bắt được bản chất vấn đề.'],
    ['貢献', 'こうけん', 'đóng góp, cống hiến', '社会に貢献したい。', 'しゃかいにこうけんしたい。', 'Tôi muốn đóng góp cho xã hội.', '研究の貢献度を評価します。', 'けんきゅうのこうけんどをひょうかします。', 'Đánh giá mức độ đóng góp của nghiên cứu.'],
    ['維持', 'いじ', 'duy trì, giữ vững', '良い習慣を維持することが大切です。', 'よいしゅうかんをいじすることがたいせつです。', 'Duy trì thói quen tốt rất quan trọng.', '現状を維持するのも難しい。', 'げんじょうをいじするのもむずかしい。', 'Duy trì nguyên trạng cũng khó.'],
    ['批判', 'ひはん', 'phê bình, phê phán', '建設的な批判は受け入れるべきだ。', 'けんせつてきなひはんはうけいれるべきだ。', 'Nên tiếp nhận phê bình mang tính xây dựng.', '政府の政策を批判しました。', 'せいふのせいさくをひはんしました。', 'Chúng tôi đã phê phán chính sách của chính phủ.'],
    ['克服', 'こくふく', 'vượt qua, khắc phục', '困難を克服する力が必要です。', 'こんなんをこくふくするちからがひつようです。', 'Cần có sức mạnh để vượt qua khó khăn.', '恐怖を克服しなければならない。', 'きょうふをこくふくしなければならない。', 'Phải vượt qua nỗi sợ hãi.'],
    ['循環', 'じゅんかん', 'tuần hoàn, chu kỳ', '水の循環は自然の仕組みです。', 'みずのじゅんかんはしぜんのしくみです。', 'Tuần hoàn nước là cơ chế tự nhiên.', '経済の循環が滞っています。', 'けいざいのじゅんかんがとどこおっています。', 'Vòng tuần hoàn kinh tế đang bị trì trệ.'],
    ['普遍', 'ふへん', 'phổ quát, phổ biến', '人権は普遍的な価値です。', 'じんけんはふへんてきなかちです。', 'Nhân quyền là giá trị phổ quát.', '普遍的な真理を求めます。', 'ふへんてきなしんりをもとめます。', 'Tôi tìm kiếm chân lý phổ quát.'],
    ['逆説', 'ぎゃくせつ', 'nghịch lý, paradox', '少なく学ぶほど多くを理解できるとは逆説的だ。', 'すくなくまなぶほどおおくをりかいできるとはぎゃくせつてきだ。', 'Học ít hơn mà hiểu nhiều hơn là điều nghịch lý.', 'これは逆説的に聞こえるかもしれないが事実だ。', 'これはぎゃくせつてきにきこえるかもしれないがじじつだ。', 'Điều này nghe có vẻ nghịch lý nhưng là sự thật.'],
    ['廃棄', 'はいき', 'thải bỏ, hủy bỏ', '廃棄物の処理が問題です。', 'はいきぶつのしょりがもんだいです。', 'Xử lý chất thải là vấn đề.', '期限切れの食品を廃棄しました。', 'きげんぎれのしょくひんをはいきしました。', 'Chúng tôi đã loại bỏ thực phẩm hết hạn.'],
    ['模倣', 'もほう', 'bắt chước, mô phỏng', '創造は模倣から始まることが多い。', 'そうぞうはもほうからはじまることがおおい。', 'Sáng tạo thường bắt đầu từ sự bắt chước.', '彼は有名作家の文体を模倣しています。', 'かれはゆうめいさっかのぶんたいをもほうしています。', 'Anh ấy đang mô phỏng văn phong của tác giả nổi tiếng.'],
    ['包括', 'ほうかつ', 'bao gồm, toàn diện', '包括的な調査を行いました。', 'ほうかつてきなちょうさをおこないました。', 'Chúng tôi đã tiến hành điều tra toàn diện.', 'この報告書は問題を包括的に説明しています。', 'このほうこくしょはもんだいをほうかつてきにせつめいしています。', 'Báo cáo này giải thích vấn đề một cách toàn diện.'],
    ['抑制', 'よくせい', 'kiềm chế, hạn chế', '感情を抑制することは重要です。', 'かんじょうをよくせいすることはじゅうようです。', 'Kiềm chế cảm xúc là điều quan trọng.', '物価の上昇を抑制するために対策を講じた。', 'ぶっかのじょうしょうをよくせいするためにたいさくをこうじた。', 'Đã thực hiện các biện pháp để kiềm chế lạm phát.'],
  ],
};

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Seeding JLPT reference vocabulary...\n');

  for (const levelCode of ['N5', 'N4', 'N3', 'N2', 'N1']) {
    const words = VOCAB[levelCode];

    // 1. Find or create Level (subject=JLPT)
    let level = await prisma.level.findUnique({ where: { code: levelCode } });
    if (!level) {
      const orderMap: Record<string, number> = { N5: 1, N4: 2, N3: 3, N2: 4, N1: 5 };
      level = await prisma.level.create({
        data: {
          code: levelCode,
          name: `JLPT ${levelCode}`,
          subject: 'JLPT',
          order: orderMap[levelCode] ?? 0,
        },
      });
      console.log(`  ✓ Created Level: ${levelCode}`);
    }

    // 2. Find or create LearningCategory
    let category = await prisma.learningCategory.findFirst({
      where: { levelId: level.id, name: `Từ vựng tham khảo ${levelCode}` },
    });
    if (!category) {
      category = await prisma.learningCategory.create({
        data: {
          levelId: level.id,
          skill: 'tu_vung',
          name: `Từ vựng tham khảo ${levelCode}`,
          description: `Danh sách từ vựng chuẩn JLPT ${levelCode} theo giáo trình`,
          order: 10,
        },
      });
    }

    // 3. Find or create LearningLesson
    let lesson = await prisma.learningLesson.findFirst({
      where: { categoryId: category.id, title: `Từ vựng tham khảo ${levelCode}` },
    });
    if (!lesson) {
      lesson = await prisma.learningLesson.create({
        data: {
          categoryId: category.id,
          title: `Từ vựng tham khảo ${levelCode}`,
          description: `${words.length} từ vựng quan trọng nhất theo chuẩn JLPT ${levelCode}`,
          type: 'vocab',
          order: 0,
        },
      });
    }

    // 4. Seed vocab items
    let created = 0;
    for (let i = 0; i < words.length; i++) {
      const [japanese, reading, meaning, example, exampleReading, exampleMeaning, example2, exampleReading2, exampleMeaning2] = words[i];
      const existing = await prisma.learningItem.findFirst({ where: { lessonId: lesson.id, japanese } });
      if (!existing) {
        await prisma.learningItem.create({
          data: {
            lessonId: lesson.id,
            type: 'vocab',
            japanese,
            reading,
            meaning,
            example: example ?? null,
            exampleReading: exampleReading ?? null,
            exampleMeaning: exampleMeaning ?? null,
            // store 2nd example in imageUrl field temporarily, or skip — keep in order field
            order: i,
          },
        });
        // If there's a 2nd example, store as a separate item with type 'example'
        if (example2) {
          await prisma.learningItem.create({
            data: {
              lessonId: lesson.id,
              type: 'example',
              japanese: example2,
              reading: exampleReading2 ?? null,
              meaning: exampleMeaning2 ?? '',
              example: japanese, // reference back to parent word
              order: i,
            },
          });
        }
        created++;
      }
    }
    console.log(`  ✓ ${levelCode}: ${created} words seeded`);
  }

  const total = await prisma.learningItem.count({
    where: { lesson: { category: { level: { subject: 'JLPT' }, name: { contains: 'tham khảo' } } } },
  });
  console.log(`\n✅ Done! Total JLPT reference vocab items: ${total}`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
