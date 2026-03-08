import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Language, Skill, LessonType } from '@prisma/client';

// ─── N5 Learning Data ──────────────────────────────────────────────────────

const N5_LEARNING = [
  // ━━━ NGHE ━━━
  {
    skill: 'nghe', name: 'Hội thoại hàng ngày', icon: '💬', order: 1,
    description: 'Các đoạn hội thoại ngắn trong cuộc sống thường ngày',
    lessons: [
      {
        title: 'Chào hỏi và giới thiệu', type: 'vocab', order: 1,
        description: 'Các mẫu câu chào hỏi cơ bản khi gặp gỡ',
        content: 'Học các mẫu câu chào hỏi và giới thiệu bản thân cơ bản nhất trong tiếng Nhật.',
        items: [
          { type: 'phrase', term: 'おはようございます', pronunciation: 'Ohayou gozaimasu', meaning: 'Chào buổi sáng (lịch sự)', example: 'おはようございます、田中さん。', exampleReading: 'Ohayou gozaimasu, Tanaka-san.', exampleMeaning: 'Chào buổi sáng, anh Tanaka.' },
          { type: 'phrase', term: 'こんにちは', pronunciation: 'Konnichiwa', meaning: 'Xin chào (ban ngày)', example: 'こんにちは！いい天気ですね。', exampleReading: 'Konnichiwa! Ii tenki desu ne.', exampleMeaning: 'Xin chào! Thời tiết đẹp nhỉ.' },
          { type: 'phrase', term: 'こんばんは', pronunciation: 'Konbanwa', meaning: 'Chào buổi tối', example: 'こんばんは、お帰りなさい。', exampleReading: 'Konbanwa, okaeri nasai.', exampleMeaning: 'Chào buổi tối, chào anh về.' },
          { type: 'phrase', term: 'はじめまして', pronunciation: 'Hajimemashite', meaning: 'Rất vui được gặp bạn (lần đầu)', example: 'はじめまして、山田です。', exampleReading: 'Hajimemashite, Yamada desu.', exampleMeaning: 'Rất vui được gặp bạn, tôi là Yamada.' },
          { type: 'phrase', term: 'よろしくおねがいします', pronunciation: 'Yoroshiku onegaishimasu', meaning: 'Rất mong được giúp đỡ / Mong bạn quan tâm', example: 'どうぞよろしくおねがいします。', exampleReading: 'Douzo yoroshiku onegaishimasu.', exampleMeaning: 'Rất mong bạn quan tâm.' },
          { type: 'phrase', term: 'おなまえは？', pronunciation: 'O-namae wa?', meaning: 'Tên bạn là gì?', example: 'おなまえはなんですか？', exampleReading: 'O-namae wa nan desu ka?', exampleMeaning: 'Tên bạn là gì?' },
        ],
      },
      {
        title: 'Mua sắm tại cửa hàng', type: 'vocab', order: 2,
        description: 'Hội thoại tại cửa hàng, siêu thị',
        content: 'Các mẫu câu thường gặp khi mua sắm tại Nhật Bản.',
        items: [
          { type: 'phrase', term: 'いらっしゃいませ', pronunciation: 'Irasshaimase', meaning: 'Xin chào quý khách (lời chào của nhân viên)', example: 'いらっしゃいませ！何をお探しですか？', exampleReading: 'Irasshaimase! Nani wo osagashi desu ka?', exampleMeaning: 'Xin chào quý khách! Quý khách tìm gì ạ?' },
          { type: 'phrase', term: 'これをください', pronunciation: 'Kore wo kudasai', meaning: 'Cho tôi cái này', example: 'このりんごをふたつください。', exampleReading: 'Kono ringo wo futatsu kudasai.', exampleMeaning: 'Cho tôi hai quả táo này.' },
          { type: 'phrase', term: 'いくらですか', pronunciation: 'Ikura desu ka', meaning: 'Cái này bao nhiêu tiền?', example: 'このかばんはいくらですか？', exampleReading: 'Kono kaban wa ikura desu ka?', exampleMeaning: 'Cái túi này bao nhiêu tiền?' },
          { type: 'vocab', term: '円', pronunciation: 'えん (en)', meaning: 'Yên Nhật (đơn vị tiền tệ)', example: '500円です。', exampleReading: 'Gohyaku en desu.', exampleMeaning: '500 yên.' },
          { type: 'phrase', term: 'ありがとうございます', pronunciation: 'Arigatou gozaimasu', meaning: 'Cảm ơn rất nhiều', example: 'ありがとうございます、またきてください。', exampleReading: 'Arigatou gozaimasu, mata kite kudasai.', exampleMeaning: 'Cảm ơn, hãy đến lần sau nhé.' },
        ],
      },
      {
        title: 'Hỏi đường và di chuyển', type: 'vocab', order: 3,
        description: 'Hỏi đường, hướng dẫn địa điểm',
        content: 'Học cách hỏi và chỉ đường bằng tiếng Nhật.',
        items: [
          { type: 'phrase', term: 'すみません', pronunciation: 'Sumimasen', meaning: 'Xin lỗi / Xin hỏi (mở đầu câu)', example: 'すみません、駅はどこですか？', exampleReading: 'Sumimasen, eki wa doko desu ka?', exampleMeaning: 'Xin hỏi, nhà ga ở đâu ạ?' },
          { type: 'phrase', term: '〜はどこですか', pronunciation: '～wa doko desu ka', meaning: '～ ở đâu vậy?', example: 'トイレはどこですか？', exampleReading: 'Toire wa doko desu ka?', exampleMeaning: 'Nhà vệ sinh ở đâu vậy?' },
          { type: 'vocab', term: '右', pronunciation: 'みぎ (migi)', meaning: 'Bên phải', example: '右にまがってください。', exampleReading: 'Migi ni magatte kudasai.', exampleMeaning: 'Hãy rẽ phải.' },
          { type: 'vocab', term: '左', pronunciation: 'ひだり (hidari)', meaning: 'Bên trái', example: 'つぎの信号を左にまがります。', exampleReading: 'Tsugi no shingou wo hidari ni magarimasu.', exampleMeaning: 'Tại đèn tín hiệu tiếp theo rẽ trái.' },
          { type: 'vocab', term: 'まっすぐ', pronunciation: 'Massugu', meaning: 'Đi thẳng', example: 'まっすぐいってください。', exampleReading: 'Massugu itte kudasai.', exampleMeaning: 'Vui lòng đi thẳng.' },
        ],
      },
    ],
  },
  {
    skill: 'nghe', name: 'Số, ngày giờ, thời tiết', icon: '🕐', order: 2,
    description: 'Nghe và hiểu số đếm, ngày tháng, giờ giấc và thời tiết',
    lessons: [
      {
        title: 'Số đếm cơ bản 1~100', type: 'vocab', order: 1,
        description: 'Cách đọc các con số trong tiếng Nhật',
        content: 'Số đếm là nền tảng quan trọng nhất. Hãy luyện tập đọc số đến khi thuộc lòng.',
        items: [
          { type: 'vocab', term: '一・１', pronunciation: 'いち (ichi)', meaning: 'Một', example: 'りんごが一つあります。', exampleReading: 'Ringo ga hitotsu arimasu.', exampleMeaning: 'Có một quả táo.' },
          { type: 'vocab', term: '二・２', pronunciation: 'に (ni)', meaning: 'Hai', example: '二人で食べましょう。', exampleReading: 'Futari de tabemashou.', exampleMeaning: 'Hãy cùng ăn hai người.' },
          { type: 'vocab', term: '三・３', pronunciation: 'さん (san)', meaning: 'Ba', example: '三時に会いましょう。', exampleReading: 'Sanji ni aimashou.', exampleMeaning: 'Hãy gặp nhau lúc 3 giờ.' },
          { type: 'vocab', term: '十・10', pronunciation: 'じゅう (juu)', meaning: 'Mười', example: '十円ください。', exampleReading: 'Juu en kudasai.', exampleMeaning: 'Cho tôi 10 yên.' },
          { type: 'vocab', term: '百・100', pronunciation: 'ひゃく (hyaku)', meaning: 'Một trăm', example: '百円ショップへ行きます。', exampleReading: 'Hyaku en shoppu e ikimasu.', exampleMeaning: 'Đi siêu thị 100 yên.' },
        ],
      },
      {
        title: 'Ngày trong tuần và tháng', type: 'vocab', order: 2,
        description: 'Thứ trong tuần, tháng trong năm',
        content: 'Học tên các ngày trong tuần và tháng trong năm. Đây là kiến thức cơ bản để hỏi/trả lời về lịch.',
        items: [
          { type: 'vocab', term: '月曜日', pronunciation: 'げつようび (Getsuyoubi)', meaning: 'Thứ Hai', example: '月曜日は学校があります。', exampleReading: 'Getsuyoubi wa gakkou ga arimasu.', exampleMeaning: 'Thứ Hai có trường học.' },
          { type: 'vocab', term: '火曜日', pronunciation: 'かようび (Kayoubi)', meaning: 'Thứ Ba', example: '火曜日にテストがあります。', exampleReading: 'Kayoubi ni tesuto ga arimasu.', exampleMeaning: 'Thứ Ba có bài kiểm tra.' },
          { type: 'vocab', term: '水曜日', pronunciation: 'すいようび (Suiyoubi)', meaning: 'Thứ Tư' },
          { type: 'vocab', term: '木曜日', pronunciation: 'もくようび (Mokuyoubi)', meaning: 'Thứ Năm' },
          { type: 'vocab', term: '金曜日', pronunciation: 'きんようび (Kin\'youbi)', meaning: 'Thứ Sáu', example: '金曜日の夜は友達と飲みます。', exampleReading: 'Kin\'youbi no yoru wa tomodachi to nomimasu.', exampleMeaning: 'Tối thứ Sáu uống cùng bạn bè.' },
          { type: 'vocab', term: '土曜日', pronunciation: 'どようび (Doyoubi)', meaning: 'Thứ Bảy' },
          { type: 'vocab', term: '日曜日', pronunciation: 'にちようび (Nichiyoubi)', meaning: 'Chủ Nhật', example: '日曜日は休みです。', exampleReading: 'Nichiyoubi wa yasumi desu.', exampleMeaning: 'Chủ Nhật là ngày nghỉ.' },
        ],
      },
    ],
  },

  // ━━━ NÓI ━━━
  {
    skill: 'noi', name: 'Giới thiệu bản thân', icon: '🙋', order: 1,
    description: 'Học cách giới thiệu bản thân, gia đình, công việc',
    lessons: [
      {
        title: 'Tự giới thiệu cơ bản', type: 'grammar', order: 1,
        description: '〜です、〜は〜です、〜からきました',
        content: `Giới thiệu bản thân là bước đầu tiên khi gặp người Nhật. Cấu trúc cơ bản:
• 「わたしは ～です」= Tôi là ～
• 「～からきました」= Tôi đến từ ～
• 「～さい です」= Tôi ～ tuổi
• 「～をしています」= Tôi đang làm việc ～`,
        items: [
          { type: 'grammar', term: 'わたしは〜です', pronunciation: 'Watashi wa ~ desu', meaning: 'Tôi là ～', example: 'わたしはベトナム人です。', exampleReading: 'Watashi wa Betonamu-jin desu.', exampleMeaning: 'Tôi là người Việt Nam.' },
          { type: 'grammar', term: '〜からきました', pronunciation: '～kara kimashita', meaning: 'Tôi đến từ ～', example: 'わたしはベトナムからきました。', exampleReading: 'Watashi wa Betonamu kara kimashita.', exampleMeaning: 'Tôi đến từ Việt Nam.' },
          { type: 'grammar', term: '〜をしています', pronunciation: '～wo shite imasu', meaning: 'Tôi đang làm (nghề) ～', example: 'わたしはエンジニアをしています。', exampleReading: 'Watashi wa enjinia wo shite imasu.', exampleMeaning: 'Tôi đang làm kỹ sư.' },
          { type: 'vocab', term: '学生', pronunciation: 'がくせい (gakusei)', meaning: 'Học sinh / Sinh viên', example: 'わたしは大学生です。', exampleReading: 'Watashi wa daigakusei desu.', exampleMeaning: 'Tôi là sinh viên đại học.' },
          { type: 'vocab', term: '会社員', pronunciation: 'かいしゃいん (kaishain)', meaning: 'Nhân viên công ty', example: 'ちちは会社員です。', exampleReading: 'Chichi wa kaishain desu.', exampleMeaning: 'Bố tôi là nhân viên công ty.' },
        ],
      },
      {
        title: 'Nói về sở thích', type: 'grammar', order: 2,
        description: '〜が好きです、〜が苦手です',
        content: `Học cách diễn đạt sở thích và không thích:
• 「〜がすきです」= Tôi thích ～
• 「〜がきらいです」= Tôi ghét ～  
• 「〜がとくいです」= Tôi giỏi ～
• 「〜がにがてです」= Tôi không giỏi ～`,
        items: [
          { type: 'grammar', term: '〜が好きです', pronunciation: '～ga suki desu', meaning: 'Tôi thích ～', example: 'わたしは音楽が好きです。', exampleReading: 'Watashi wa ongaku ga suki desu.', exampleMeaning: 'Tôi thích âm nhạc.' },
          { type: 'grammar', term: '〜が嫌いです', pronunciation: '～ga kirai desu', meaning: 'Tôi ghét / không thích ～', example: 'わたしはにんじんが嫌いです。', exampleReading: 'Watashi wa ninjin ga kirai desu.', exampleMeaning: 'Tôi không thích cà rốt.' },
          { type: 'vocab', term: '趣味', pronunciation: 'しゅみ (shumi)', meaning: 'Sở thích', example: 'しゅみはなんですか？', exampleReading: 'Shumi wa nan desu ka?', exampleMeaning: 'Sở thích của bạn là gì?' },
          { type: 'vocab', term: '音楽', pronunciation: 'おんがく (ongaku)', meaning: 'Âm nhạc' },
          { type: 'vocab', term: '映画', pronunciation: 'えいが (eiga)', meaning: 'Phim ảnh', example: 'えいがをみることがすきです。', exampleReading: 'Eiga wo miru koto ga suki desu.', exampleMeaning: 'Tôi thích xem phim.' },
          { type: 'vocab', term: '旅行', pronunciation: 'りょこう (ryokou)', meaning: 'Du lịch' },
        ],
      },
    ],
  },
  {
    skill: 'noi', name: 'Mẫu câu giao tiếp', icon: '🗣️', order: 2,
    description: 'Các mẫu câu hay dùng trong giao tiếp hàng ngày',
    lessons: [
      {
        title: 'Yêu cầu và nhờ vả', type: 'grammar', order: 1,
        description: '〜てください、〜てもいいですか',
        content: `Học cách nhờ vả và xin phép lịch sự:
• 「〜てください」= Vui lòng làm ～ (yêu cầu)
• 「〜てもいいですか」= Tôi có thể ～ không? (xin phép)
• 「〜てはいけません」= Không được ～ (cấm)`,
        items: [
          { type: 'grammar', term: '〜てください', pronunciation: '～te kudasai', meaning: 'Vui lòng hãy ～', example: 'もう一度いってください。', exampleReading: 'Mou ichido itte kudasai.', exampleMeaning: 'Vui lòng nói lại một lần nữa.' },
          { type: 'grammar', term: '〜てもいいですか', pronunciation: '～te mo ii desu ka', meaning: 'Tôi có thể ～ không?', example: 'ここに座ってもいいですか？', exampleReading: 'Koko ni suwatte mo ii desu ka?', exampleMeaning: 'Tôi có thể ngồi đây không?' },
          { type: 'grammar', term: 'わかりました', pronunciation: 'Wakarimashita', meaning: 'Tôi hiểu rồi / Được rồi', example: 'はい、わかりました。', exampleReading: 'Hai, wakarimashita.', exampleMeaning: 'Vâng, tôi hiểu rồi.' },
          { type: 'grammar', term: 'わかりません', pronunciation: 'Wakarimasen', meaning: 'Tôi không hiểu', example: 'すみません、わかりません。', exampleReading: 'Sumimasen, wakarimasen.', exampleMeaning: 'Xin lỗi, tôi không hiểu.' },
        ],
      },
      {
        title: 'Đặt lịch hẹn và thói quen', type: 'grammar', order: 2,
        description: '〜ます、〜ました、〜ません',
        content: `Động từ ます - dạng lịch sự dùng nhiều nhất trong N5:
• Hiện tại / Tương lai: ～ます
• Quá khứ: ～ました
• Phủ định: ～ません
• Phủ định quá khứ: ～ませんでした`,
        items: [
          { type: 'grammar', term: '〜ます', pronunciation: '～masu', meaning: 'Làm ～ (hiện tại/tương lai, lịch sự)', example: 'まいにち日本語を勉強します。', exampleReading: 'Mainichi nihongo wo benkyou shimasu.', exampleMeaning: 'Mỗi ngày tôi học tiếng Nhật.' },
          { type: 'grammar', term: '〜ました', pronunciation: '～mashita', meaning: 'Đã làm ～ (quá khứ, lịch sự)', example: 'きのう映画を見ました。', exampleReading: 'Kinou eiga wo mimashita.', exampleMeaning: 'Hôm qua tôi đã xem phim.' },
          { type: 'grammar', term: '〜ません', pronunciation: '～masen', meaning: 'Không làm ～ (phủ định)', example: 'お酒は飲みません。', exampleReading: 'Osake wa nomimasen.', exampleMeaning: 'Tôi không uống rượu.' },
          { type: 'vocab', term: '毎日', pronunciation: 'まいにち (mainichi)', meaning: 'Mỗi ngày' },
          { type: 'vocab', term: '毎朝', pronunciation: 'まいあさ (maiasa)', meaning: 'Mỗi sáng' },
          { type: 'vocab', term: '〜ごろ', pronunciation: '～goro', meaning: 'Vào khoảng ～ (giờ)', example: '7時ごろおきます。', exampleReading: 'Shichiji goro okimasu.', exampleMeaning: 'Tôi thức dậy vào khoảng 7 giờ.' },
        ],
      },
    ],
  },

  // ━━━ ĐỌC ━━━
  {
    skill: 'doc', name: 'Từ vựng chủ đề', icon: '📚', order: 1,
    description: 'Từ vựng N5 theo chủ đề: gia đình, thức ăn, màu sắc, đồ vật',
    lessons: [
      {
        title: 'Gia đình', type: 'vocab', order: 1,
        description: 'Từ vựng về các thành viên trong gia đình',
        content: 'Trong tiếng Nhật, có sự phân biệt giữa cách gọi gia đình mình (khiêm tốn) và cách gọi gia đình người khác (kính trọng).',
        items: [
          { type: 'vocab', term: '父', pronunciation: 'ちち (chichi)', meaning: 'Bố (nói về bố mình)', example: 'わたしのちちは医者です。', exampleReading: 'Watashi no chichi wa isha desu.', exampleMeaning: 'Bố tôi là bác sĩ.' },
          { type: 'vocab', term: '母', pronunciation: 'はは (haha)', meaning: 'Mẹ (nói về mẹ mình)', example: 'はははりょうりがじょうずです。', exampleReading: 'Haha wa ryouri ga jouzu desu.', exampleMeaning: 'Mẹ tôi nấu ăn giỏi.' },
          { type: 'vocab', term: '兄', pronunciation: 'あに (ani)', meaning: 'Anh trai (nói về anh mình)', example: 'あには大学生です。', exampleReading: 'Ani wa daigakusei desu.', exampleMeaning: 'Anh tôi là sinh viên đại học.' },
          { type: 'vocab', term: '姉', pronunciation: 'あね (ane)', meaning: 'Chị gái (nói về chị mình)' },
          { type: 'vocab', term: '弟', pronunciation: 'おとうと (otouto)', meaning: 'Em trai' },
          { type: 'vocab', term: '妹', pronunciation: 'いもうと (imouto)', meaning: 'Em gái' },
          { type: 'vocab', term: '家族', pronunciation: 'かぞく (kazoku)', meaning: 'Gia đình', example: 'わたしのかぞくは5人います。', exampleReading: 'Watashi no kazoku wa gonin imasu.', exampleMeaning: 'Gia đình tôi có 5 người.' },
        ],
      },
      {
        title: 'Thức ăn và đồ uống', type: 'vocab', order: 2,
        description: 'Tên các món ăn, đồ uống phổ biến ở Nhật',
        content: 'Nhật Bản nổi tiếng với ẩm thực phong phú. Hãy học tên các món ăn cơ bản nhé!',
        items: [
          { type: 'vocab', term: 'ごはん', pronunciation: 'Gohan', meaning: 'Cơm / Bữa ăn', example: 'ごはんを食べましょう。', exampleReading: 'Gohan wo tabemashou.', exampleMeaning: 'Hãy ăn cơm nào.' },
          { type: 'vocab', term: 'みず', pronunciation: 'Mizu (水)', meaning: 'Nước (lọc)', example: 'みずをください。', exampleReading: 'Mizu wo kudasai.', exampleMeaning: 'Cho tôi nước lọc.' },
          { type: 'vocab', term: 'ラーメン', pronunciation: 'Ra-men', meaning: 'Mì ramen', example: 'ラーメンが大好きです！', exampleReading: 'Ra-men ga daisuki desu!', exampleMeaning: 'Tôi rất thích mì ramen!' },
          { type: 'vocab', term: 'すし', pronunciation: 'Sushi (寿司)', meaning: 'Sushi', example: 'すしはおいしいです。', exampleReading: 'Sushi wa oishii desu.', exampleMeaning: 'Sushi ngon lắm.' },
          { type: 'vocab', term: 'おちゃ', pronunciation: 'Ocha (お茶)', meaning: 'Trà xanh Nhật Bản', example: 'おちゃはいかがですか？', exampleReading: 'Ocha wa ikaga desu ka?', exampleMeaning: 'Bạn có muốn uống trà không?' },
          { type: 'vocab', term: 'パン', pronunciation: 'Pan', meaning: 'Bánh mì', example: 'あさごはんにパンを食べます。', exampleReading: 'Asagohan ni pan wo tabemasu.', exampleMeaning: 'Bữa sáng tôi ăn bánh mì.' },
        ],
      },
      {
        title: 'Tính từ mô tả', type: 'vocab', order: 3,
        description: 'Tính từ い và tính từ な cơ bản',
        content: `Tiếng Nhật có 2 loại tính từ:
• Tính từ い (i-adjective): たかい, やすい, おおきい, ちいさい...
• Tính từ な (na-adjective): きれいな, しずかな, にぎやかな...`,
        items: [
          { type: 'vocab', term: '大きい', pronunciation: 'おおきい (ookii)', meaning: 'To, lớn', example: 'このリンゴは大きい。', exampleReading: 'Kono ringo wa ookii.', exampleMeaning: 'Quả táo này to.' },
          { type: 'vocab', term: '小さい', pronunciation: 'ちいさい (chiisai)', meaning: 'Nhỏ, bé', example: 'ねこはちいさいです。', exampleReading: 'Neko wa chiisai desu.', exampleMeaning: 'Con mèo nhỏ.' },
          { type: 'vocab', term: '高い', pronunciation: 'たかい (takai)', meaning: 'Đắt / Cao', example: 'このくるまはたかいです。', exampleReading: 'Kono kuruma wa takai desu.', exampleMeaning: 'Chiếc xe này đắt.' },
          { type: 'vocab', term: '安い', pronunciation: 'やすい (yasui)', meaning: 'Rẻ', example: 'スーパーのやさいはやすいです。', exampleReading: 'Suupaa no yasai wa yasui desu.', exampleMeaning: 'Rau ở siêu thị rẻ.' },
          { type: 'vocab', term: 'きれい', pronunciation: 'Kirei (綺麗)', meaning: 'Đẹp / Sạch sẽ', example: 'さくらはきれいです。', exampleReading: 'Sakura wa kirei desu.', exampleMeaning: 'Hoa anh đào đẹp.' },
          { type: 'vocab', term: 'おいしい', pronunciation: 'Oishii (美味しい)', meaning: 'Ngon', example: 'このりょうりはおいしい！', exampleReading: 'Kono ryouri wa oishii!', exampleMeaning: 'Món này ngon!' },
        ],
      },
    ],
  },
  {
    skill: 'doc', name: 'Ngữ pháp N5', icon: '📐', order: 2,
    description: 'Các điểm ngữ pháp quan trọng cần nắm vững cho N5',
    lessons: [
      {
        title: 'Trợ từ は、が、を、に、で', type: 'grammar', order: 1,
        description: 'Các trợ từ cơ bản và cách dùng',
        content: `Trợ từ là xương sống của tiếng Nhật. N5 cần nắm vững:
• は (wa): chủ đề của câu
• が (ga): chủ ngữ / nhấn mạnh
• を (wo/o): tân ngữ trực tiếp
• に (ni): hướng đến / thời gian / địa điểm tồn tại
• で (de): địa điểm hành động / phương tiện / nguyên nhân`,
        items: [
          { type: 'grammar', term: '〜は〜です', pronunciation: '～wa ～desu', meaning: '～ là ～ (giới thiệu chủ đề)', example: 'わたしは学生です。', exampleReading: 'Watashi wa gakusei desu.', exampleMeaning: 'Tôi là học sinh.' },
          { type: 'grammar', term: '〜を〜ます', pronunciation: '～wo ～masu', meaning: 'Làm ～ (với đối tượng là ～)', example: 'テレビをみます。', exampleReading: 'Terebi wo mimasu.', exampleMeaning: 'Xem TV.' },
          { type: 'grammar', term: '〜に行きます', pronunciation: '～ni ikimasu', meaning: 'Đi đến ～', example: 'がっこうに行きます。', exampleReading: 'Gakkou ni ikimasu.', exampleMeaning: 'Đi đến trường.' },
          { type: 'grammar', term: '〜で食べます', pronunciation: '～de tabemasu', meaning: 'Ăn ở ～', example: 'レストランでたべます。', exampleReading: 'Resutoran de tabemasu.', exampleMeaning: 'Ăn ở nhà hàng.' },
          { type: 'grammar', term: '〜があります / います', pronunciation: '～ga arimasu / imasu', meaning: 'Có ～ (vật / người)', example: 'つくえの上に本があります。', exampleReading: 'Tsukue no ue ni hon ga arimasu.', exampleMeaning: 'Trên bàn có sách.' },
        ],
      },
      {
        title: 'Câu phủ định và nghi vấn', type: 'grammar', order: 2,
        description: 'Cách tạo câu hỏi và câu phủ định N5',
        content: `• Câu hỏi: thêm 「か」cuối câu
• Phủ định danh từ: ～ではありません (≠ ～です)
• Phủ định động từ: ～ません (≠ ～ます)
• Phủ định tính từ い: ～くありません (≠ ～い)`,
        items: [
          { type: 'grammar', term: '〜ですか', pronunciation: '～desu ka', meaning: '～ không? / Phải ～ không?', example: 'これはほんですか？', exampleReading: 'Kore wa hon desu ka?', exampleMeaning: 'Cái này là sách không?' },
          { type: 'grammar', term: '〜ではありません', pronunciation: '～dewa arimasen', meaning: 'Không phải là ～', example: 'わたしは先生ではありません。', exampleReading: 'Watashi wa sensei dewa arimasen.', exampleMeaning: 'Tôi không phải là giáo viên.' },
          { type: 'grammar', term: '〜くありません', pronunciation: '～ku arimasen', meaning: 'Không ～ (phủ định i-adj)', example: 'このりんごはおいしくありません。', exampleReading: 'Kono ringo wa oishiku arimasen.', exampleMeaning: 'Quả táo này không ngon.' },
          { type: 'grammar', term: 'なんですか', pronunciation: 'Nan desu ka', meaning: 'Cái gì vậy? / Là cái gì?', example: 'それはなんですか？', exampleReading: 'Sore wa nan desu ka?', exampleMeaning: 'Đó là cái gì vậy?' },
        ],
      },
    ],
  },

  // ━━━ VIẾT ━━━
  {
    skill: 'viet', name: 'Hiragana', icon: 'あ', order: 1,
    description: 'Học và luyện tập bảng chữ cái Hiragana (46 chữ cơ bản)',
    lessons: [
      {
        title: 'Hàng あ～お (A, I, U, E, O)', type: 'vocab', order: 1,
        description: 'Nguyên âm cơ bản trong Hiragana',
        content: '5 chữ đầu tiên của Hiragana là nguyên âm. Đây là nền tảng của toàn bộ hệ thống kana.',
        items: [
          { type: 'character', term: 'あ', pronunciation: 'a', meaning: 'Âm A', example: 'あめ (ame)', exampleReading: 'a-me', exampleMeaning: 'Mưa / Kẹo' },
          { type: 'character', term: 'い', pronunciation: 'i', meaning: 'Âm I', example: 'いぬ (inu)', exampleReading: 'i-nu', exampleMeaning: 'Con chó' },
          { type: 'character', term: 'う', pronunciation: 'u', meaning: 'Âm U', example: 'うみ (umi)', exampleReading: 'u-mi', exampleMeaning: 'Biển' },
          { type: 'character', term: 'え', pronunciation: 'e', meaning: 'Âm E', example: 'えき (eki)', exampleReading: 'e-ki', exampleMeaning: 'Nhà ga' },
          { type: 'character', term: 'お', pronunciation: 'o', meaning: 'Âm O', example: 'おかあさん (okaasan)', exampleReading: 'o-ka-a-san', exampleMeaning: 'Mẹ (gọi mẹ người khác)' },
        ],
      },
      {
        title: 'Hàng か～こ (KA, KI, KU, KE, KO)', type: 'vocab', order: 2,
        description: 'Hàng K trong Hiragana',
        content: 'Hàng か (ka) là hàng phụ âm đầu tiên của Hiragana.',
        items: [
          { type: 'character', term: 'か', pronunciation: 'ka', meaning: 'Âm KA', example: 'かさ (kasa)', exampleReading: 'ka-sa', exampleMeaning: 'Ô dù' },
          { type: 'character', term: 'き', pronunciation: 'ki', meaning: 'Âm KI', example: 'きって (kitte)', exampleReading: 'kit-te', exampleMeaning: 'Tem thư' },
          { type: 'character', term: 'く', pronunciation: 'ku', meaning: 'Âm KU', example: 'くるま (kuruma)', exampleReading: 'ku-ru-ma', exampleMeaning: 'Xe hơi' },
          { type: 'character', term: 'け', pronunciation: 'ke', meaning: 'Âm KE', example: 'けいたい (keitai)', exampleReading: 'ke-i-ta-i', exampleMeaning: 'Điện thoại di động' },
          { type: 'character', term: 'こ', pronunciation: 'ko', meaning: 'Âm KO', example: 'こども (kodomo)', exampleReading: 'ko-do-mo', exampleMeaning: 'Trẻ em' },
        ],
      },
      {
        title: 'Hàng さ～そ (SA, SHI, SU, SE, SO)', type: 'vocab', order: 3,
        description: 'Hàng S trong Hiragana',
        content: 'Lưu ý: し đọc là "shi" chứ không phải "si".',
        items: [
          { type: 'character', term: 'さ', pronunciation: 'sa', meaning: 'Âm SA', example: 'さかな (sakana)', exampleReading: 'sa-ka-na', exampleMeaning: 'Cá' },
          { type: 'character', term: 'し', pronunciation: 'shi', meaning: 'Âm SHI', example: 'しんぶん (shinbun)', exampleReading: 'shin-bun', exampleMeaning: 'Báo' },
          { type: 'character', term: 'す', pronunciation: 'su', meaning: 'Âm SU', example: 'すし (sushi)', exampleReading: 'su-shi', exampleMeaning: 'Sushi' },
          { type: 'character', term: 'せ', pronunciation: 'se', meaning: 'Âm SE', example: 'せんせい (sensei)', exampleReading: 'sen-sei', exampleMeaning: 'Giáo viên' },
          { type: 'character', term: 'そ', pronunciation: 'so', meaning: 'Âm SO', example: 'そら (sora)', exampleReading: 'so-ra', exampleMeaning: 'Bầu trời' },
        ],
      },
    ],
  },
  {
    skill: 'viet', name: 'Kanji N5', icon: '漢', order: 2,
    description: 'Học 103 chữ Kanji cơ bản của trình độ N5',
    lessons: [
      {
        title: 'Kanji thiên nhiên: 山川水火木', type: 'vocab', order: 1,
        description: 'Kanji về thiên nhiên cơ bản',
        content: 'Các chữ Kanji về thiên nhiên là những chữ cổ xưa nhất và đơn giản nhất. Hãy học chúng trước!',
        items: [
          { type: 'character', term: '山', pronunciation: 'やま / さん (yama / san)', meaning: 'Núi', example: '山に登ります。/ 富士山', exampleReading: 'Yama ni noborimasu. / Fujisan', exampleMeaning: 'Leo núi. / Núi Phú Sĩ' },
          { type: 'character', term: '川', pronunciation: 'かわ / せん (kawa / sen)', meaning: 'Sông', example: 'かわで魚を釣ります。', exampleReading: 'Kawa de sakana wo tsurimasu.', exampleMeaning: 'Câu cá ở sông.' },
          { type: 'character', term: '水', pronunciation: 'みず / すい (mizu / sui)', meaning: 'Nước', example: '水をのみます。/ 水曜日', exampleReading: 'Mizu wo nomimasu. / Suiyoubi', exampleMeaning: 'Uống nước. / Thứ Tư' },
          { type: 'character', term: '火', pronunciation: 'ひ / か (hi / ka)', meaning: 'Lửa', example: '火をつけます。/ 火曜日', exampleReading: 'Hi wo tsukemasu. / Kayoubi', exampleMeaning: 'Bật lửa. / Thứ Ba' },
          { type: 'character', term: '木', pronunciation: 'き / もく (ki / moku)', meaning: 'Cây gỗ', example: '木のたかさは10メートルです。/ 木曜日', exampleReading: 'Ki no takasa wa juu meetoru desu. / Mokuyoubi', exampleMeaning: 'Cây cao 10 mét. / Thứ Năm' },
        ],
      },
      {
        title: 'Kanji số: 一二三四五六七八九十百千万', type: 'vocab', order: 2,
        description: 'Chữ Kanji biểu thị số đếm',
        content: 'Các chữ số Kanji được dùng trong văn viết trang trọng. Hãy học cả âm On (Hán) và âm Kun (Nhật).',
        items: [
          { type: 'character', term: '一', pronunciation: 'いち / ひとつ (ichi / hitotsu)', meaning: 'Một (1)', example: '一つください。', exampleReading: 'Hitotsu kudasai.', exampleMeaning: 'Cho tôi một cái.' },
          { type: 'character', term: '二', pronunciation: 'に / ふたつ (ni / futatsu)', meaning: 'Hai (2)', example: '二人で行きます。', exampleReading: 'Futari de ikimasu.', exampleMeaning: 'Hai người cùng đi.' },
          { type: 'character', term: '三', pronunciation: 'さん / みっつ (san / mittsu)', meaning: 'Ba (3)' },
          { type: 'character', term: '百', pronunciation: 'ひゃく (hyaku)', meaning: 'Một trăm (100)', example: '百円ショップ', exampleReading: 'Hyakuen shoppu', exampleMeaning: 'Cửa hàng 100 yên' },
          { type: 'character', term: '千', pronunciation: 'せん (sen)', meaning: 'Một nghìn (1000)', example: '千円のランチ', exampleReading: 'Sen en no ranchi', exampleMeaning: 'Bữa trưa 1000 yên' },
          { type: 'character', term: '万', pronunciation: 'まん (man)', meaning: 'Mười nghìn (10,000)', example: '一万円', exampleReading: 'Ichiman en', exampleMeaning: '10,000 yên' },
        ],
      },
      {
        title: 'Kanji con người: 人口目耳手足', type: 'vocab', order: 3,
        description: 'Kanji liên quan đến con người và cơ thể',
        content: 'Học Kanji về con người và các bộ phận cơ thể cơ bản.',
        items: [
          { type: 'character', term: '人', pronunciation: 'ひと / じん (hito / jin)', meaning: 'Người', example: '日本人 / 一人', exampleReading: 'Nihonjin / Hitori', exampleMeaning: 'Người Nhật / Một mình' },
          { type: 'character', term: '口', pronunciation: 'くち / こう (kuchi / kou)', meaning: 'Miệng', example: '口をあけてください。', exampleReading: 'Kuchi wo akete kudasai.', exampleMeaning: 'Vui lòng há miệng.' },
          { type: 'character', term: '目', pronunciation: 'め / もく (me / moku)', meaning: 'Mắt', example: '目がいたいです。', exampleReading: 'Me ga itai desu.', exampleMeaning: 'Mắt tôi đau.' },
          { type: 'character', term: '手', pronunciation: 'て / しゅ (te / shu)', meaning: 'Tay', example: '手をあらいます。', exampleReading: 'Te wo araimasu.', exampleMeaning: 'Rửa tay.' },
          { type: 'character', term: '足', pronunciation: 'あし / そく (ashi / soku)', meaning: 'Chân / Bàn chân', example: '足がながいです。', exampleReading: 'Ashi ga nagai desu.', exampleMeaning: 'Chân dài.' },
        ],
      },
    ],
  },
  {
    skill: 'viet', name: 'Katakana', icon: 'ア', order: 3,
    description: 'Học bảng chữ cái Katakana - dùng cho từ ngoại lai',
    lessons: [
      {
        title: 'Katakana ア行～オ行', type: 'vocab', order: 1,
        description: '5 nguyên âm cơ bản trong Katakana',
        content: 'Katakana có dạng góc cạnh hơn Hiragana và chủ yếu dùng để viết các từ vay mượn từ nước ngoài.',
        items: [
          { type: 'character', term: 'ア', pronunciation: 'a', meaning: 'Âm A (Katakana)', example: 'アイスクリーム', exampleReading: 'Aisu kuriimu', exampleMeaning: 'Kem (ice cream)' },
          { type: 'character', term: 'イ', pronunciation: 'i', meaning: 'Âm I (Katakana)', example: 'インターネット', exampleReading: 'Intaanetto', exampleMeaning: 'Internet' },
          { type: 'character', term: 'ウ', pronunciation: 'u', meaning: 'Âm U (Katakana)', example: 'ウイルス', exampleReading: 'Uirusu', exampleMeaning: 'Virus' },
          { type: 'character', term: 'エ', pronunciation: 'e', meaning: 'Âm E (Katakana)', example: 'エレベーター', exampleReading: 'Erebeetaa', exampleMeaning: 'Thang máy' },
          { type: 'character', term: 'オ', pronunciation: 'o', meaning: 'Âm O (Katakana)', example: 'オレンジ', exampleReading: 'Orenji', exampleMeaning: 'Cam (quả)' },
        ],
      },
    ],
  },
];

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ message: 'Không có quyền.' }, { status: 403 });
  }

  const n5 = await prisma.level.findUnique({ where: { code: 'N5' } });
  if (!n5) return NextResponse.json({ message: 'Cần seed levels trước! Vào Admin → Seed để tạo levels.' }, { status: 400 });

  let categoryCount = 0; let lessonCount = 0; let itemCount = 0;

  for (const catData of N5_LEARNING) {
    const existingCat = await prisma.learningCategory.findFirst({
      where: { levelId: n5.id, skill: catData.skill as Skill, name: catData.name },
    });
    if (existingCat) continue;

    const cat = await prisma.learningCategory.create({
      data: { levelId: n5.id, skill: catData.skill as Skill, name: catData.name, icon: catData.icon, description: catData.description, order: catData.order },
    });
    categoryCount++;

    for (const lessonData of catData.lessons) {
      const lesson = await prisma.learningLesson.create({
        data: { categoryId: cat.id, title: lessonData.title, type: lessonData.type as LessonType, description: lessonData.description, order: lessonData.order },
      });
      lessonCount++;

      const itemsToCreate = lessonData.items.map((item: any, idx: number) => ({
        lessonId: lesson.id, order: idx + 1,
        type: item.type, term: item.term, pronunciation: item.pronunciation ?? null,
        language: item.language ?? 'ja', audioUrl: item.audioUrl ?? null, imageUrl: item.imageUrl ?? null,
      }));
      const createdItems = await prisma.content.createManyAndReturn({ data: itemsToCreate });
      await prisma.contentMeaning.createMany({
        data: createdItems.map((c, idx) => ({ contentId: c.id, language: 'vi', meaning: lessonData.items[idx].meaning })),
      });
      const exData = createdItems
        .map((c: any, idx: number) => ({ c, it: lessonData.items[idx] }))
        .filter(({ it }: any) => it.example)
        .map(({ c, it }: any) => ({ contentId: c.id, exampleText: it.example, translation: it.exampleMeaning ?? null, language: (it.language ?? 'ja') as Language, translationLanguage: it.exampleMeaning ? 'vi' as Language : null }));
      if (exData.length > 0) await prisma.contentExample.createMany({ data: exData });
      itemCount += createdItems.length;
    }
  }

  return NextResponse.json({
    message: `Seed học N5 thành công! Tạo ${categoryCount} chủ đề, ${lessonCount} bài học, ${itemCount} từ vựng/ngữ pháp.`,
  });
}
