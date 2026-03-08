/**
 * POST /api/admin/seed-mimikara
 * Seeds Mimikara Oboeru vocab (N3/N2/N1) + Shin Kanzen Master grammar (N3/N2/N1)
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

// ─────────────────────────────────────────────────────────────────────────────
// N3 — Mimikara Oboeru N3 Goi + Shin Kanzen Master N3 Bunpou
// ─────────────────────────────────────────────────────────────────────────────
const MIMIKARA_N3: Lesson[] = [
  {
    title: 'Chương 1 — Hành động & di chuyển',
    description: 'Động từ hành động, di chuyển; Ngữ pháp ～ながら, ～てから.',
    vocab: [
      { term: '向かう', pronunciation: 'むかう', meaning: 'hướng về, đi tới', example: '駅に向かっています。', exampleReading: 'えきにむかっています。', exampleMeaning: 'Đang hướng đến ga.' },
      { term: '戻る', pronunciation: 'もどる', meaning: 'quay lại, trở về', example: '会社に戻ります。', exampleReading: 'かいしゃにもどります。', exampleMeaning: 'Trở lại công ty.' },
      { term: '通る', pronunciation: 'とおる', meaning: 'đi qua, đi ngang', example: '公園を通って帰ります。', exampleReading: 'こうえんをとおってかえります。', exampleMeaning: 'Đi qua công viên về nhà.' },
      { term: '追いかける', pronunciation: 'おいかける', meaning: 'đuổi theo', example: '犬が子どもを追いかけました。', exampleReading: 'いぬがこどもをおいかけました。', exampleMeaning: 'Con chó đuổi theo đứa trẻ.' },
      { term: '集まる', pronunciation: 'あつまる', meaning: 'tập hợp lại', example: '広場に人が集まりました。', exampleReading: 'ひろばにひとがあつまりました。', exampleMeaning: 'Người tụ tập ở quảng trường.' },
      { term: '離れる', pronunciation: 'はなれる', meaning: 'rời khỏi, xa cách', example: '故郷を離れています。', exampleReading: 'こきょうをはなれています。', exampleMeaning: 'Xa quê hương.' },
      { term: '近づく', pronunciation: 'ちかづく', meaning: 'tiến lại gần', example: '試験が近づいてきました。', exampleReading: 'しけんがちかづいてきました。', exampleMeaning: 'Kỳ thi đang đến gần.' },
    ],
    grammar: [
      { pattern: '～ながら', meaning: 'vừa ~ vừa ~ (cùng lúc)', usage: 'Hai hành động diễn ra đồng thời, chủ ngữ là một. Gắn vào masu-stem.', example: '音楽を聴きながら勉強します。', exampleReading: 'おんがくをききながらべんきょうします。', exampleMeaning: 'Vừa nghe nhạc vừa học bài.' },
      { pattern: '～てから', meaning: 'sau khi … thì ~', usage: 'Nhấn mạnh thứ tự hành động, hành động trước kết thúc thì mới đến hành động sau.', example: '宿題をしてから、ゲームをします。', exampleReading: 'しゅくだいをしてから、ゲームをします。', exampleMeaning: 'Sau khi làm bài tập xong mới chơi game.' },
      { pattern: '～ていく', meaning: '(hành động) rồi đi / dần dần ~', usage: 'Biến đổi hoặc hành động rời xa kẻ nói.', example: '気温がだんだん下がっていきます。', exampleReading: 'きおんがだんだんさがっていきます。', exampleMeaning: 'Nhiệt độ dần dần giảm xuống.' },
    ],
  },
  {
    title: 'Chương 2 — Cảm xúc & tâm lý',
    description: 'Từ chỉ cảm xúc; Ngữ pháp ～てしまう, ～てほしい.',
    vocab: [
      { term: '喜ぶ', pronunciation: 'よろこぶ', meaning: 'vui mừng', example: '合格して喜びました。', exampleReading: 'ごうかくしてよろこびました。', exampleMeaning: 'Vui mừng vì đậu kỳ thi.' },
      { term: '悲しむ', pronunciation: 'かなしむ', meaning: 'buồn bã', example: '友達の死を悲しみました。', exampleReading: 'ともだちのしをかなしみました。', exampleMeaning: 'Buồn bã vì sự ra đi của bạn.' },
      { term: '驚く', pronunciation: 'おどろく', meaning: 'ngạc nhiên, sửng sốt', example: '突然の知らせに驚きました。', exampleReading: 'とつぜんのしらせにおどろきました。', exampleMeaning: 'Ngạc nhiên vì tin tức bất ngờ.' },
      { term: '恥ずかしい', pronunciation: 'はずかしい', meaning: 'xấu hổ, ngượng ngùng', example: '間違えて恥ずかしかったです。', exampleReading: 'まちがえてはずかしかったです。', exampleMeaning: 'Xấu hổ vì nói sai.' },
      { term: '悔しい', pronunciation: 'くやしい', meaning: 'tiếc, ấm ức', example: '負けて悔しいです。', exampleReading: 'まけてくやしいです。', exampleMeaning: 'Ấm ức vì thua.' },
      { term: '懐かしい', pronunciation: 'なつかしい', meaning: 'thân thương, gợi nhớ', example: '故郷が懐かしいです。', exampleReading: 'こきょうがなつかしいです。', exampleMeaning: 'Nhớ quê hương.' },
      { term: '羨ましい', pronunciation: 'うらやましい', meaning: 'ghen tị, thèm thuồng', example: '海外旅行が羨ましいです。', exampleReading: 'かいがいりょこうがうらやましいです。', exampleMeaning: 'Thèm được đi du lịch nước ngoài.' },
    ],
    grammar: [
      { pattern: '～てしまう', meaning: '(lỡ) ~ mất / đã ~ rồi', usage: 'Diễn đạt hành động hoàn tất — thường có hàm ý tiếc nuối hoặc không chủ ý.', example: '財布を忘れてしまいました。', exampleReading: 'さいふをわすれてしまいました。', exampleMeaning: 'Tôi đã bỏ quên ví mất rồi.' },
      { pattern: '～てほしい', meaning: 'muốn (ai đó) làm ~', usage: 'Diễn đạt mong muốn người khác thực hiện hành động gì đó cho mình.', example: 'もっと早く来てほしいです。', exampleReading: 'もっとはやくきてほしいです。', exampleMeaning: 'Tôi muốn bạn đến sớm hơn.' },
      { pattern: '～くて/～で（nguyên nhân）', meaning: '~ nên ~ (liên kết adj → kết quả)', usage: 'Nối tính từ với hệ quả, lý do.', example: '嬉しくて、涙が出ました。', exampleReading: 'うれしくて、なみだがでました。', exampleMeaning: 'Vui quá nên nước mắt rơi.' },
    ],
  },
  {
    title: 'Chương 3 — Xã hội & con người',
    description: 'Danh từ xã hội; Ngữ pháp ～によると, ～だけでなく.',
    vocab: [
      { term: '社会', pronunciation: 'しゃかい', meaning: 'xã hội', example: '社会に貢献したいです。', exampleReading: 'しゃかいにこうけんしたいです。', exampleMeaning: 'Muốn cống hiến cho xã hội.' },
      { term: '地域', pronunciation: 'ちいき', meaning: 'vùng, khu vực', example: 'この地域は安全です。', exampleReading: 'このちいきはあんぜんです。', exampleMeaning: 'Khu vực này an toàn.' },
      { term: '人口', pronunciation: 'じんこう', meaning: 'dân số', example: '東京の人口は多いです。', exampleReading: 'とうきょうのじんこうはおおいです。', exampleMeaning: 'Dân số Tokyo rất đông.' },
      { term: '世代', pronunciation: 'せだい', meaning: 'thế hệ', example: '若い世代に人気があります。', exampleReading: 'わかいせだいにじんきがあります。', exampleMeaning: 'Phổ biến với thế hệ trẻ.' },
      { term: '習慣', pronunciation: 'しゅうかん', meaning: 'thói quen, phong tục', example: '健康な習慣を作りましょう。', exampleReading: 'けんこうなしゅうかんをつくりましょう。', exampleMeaning: 'Hãy tạo thói quen lành mạnh.' },
      { term: '環境', pronunciation: 'かんきょう', meaning: 'môi trường', example: '環境を守ることが大切です。', exampleReading: 'かんきょうをまもることがたいせつです。', exampleMeaning: 'Bảo vệ môi trường là quan trọng.' },
      { term: '問題', pronunciation: 'もんだい', meaning: 'vấn đề', example: '問題を解決しなければなりません。', exampleReading: 'もんだいをかいけつしなければなりません。', exampleMeaning: 'Phải giải quyết vấn đề.' },
    ],
    grammar: [
      { pattern: '～によると', meaning: 'theo ~ (nguồn thông tin)', usage: 'Trích dẫn nguồn thông tin. Thường đi với ～そうだ/～とのことだ.', example: 'ニュースによると、明日は雨だそうです。', exampleReading: 'ニュースによると、あしたはあめだそうです。', exampleMeaning: 'Theo tin tức, ngày mai trời mưa.' },
      { pattern: '～だけでなく', meaning: 'không chỉ ~ mà còn ~', usage: 'Nêu thêm nhiều điều ngoài điều đã đề cập.', example: '彼は英語だけでなく、中国語も話せます。', exampleReading: 'かれはえいごだけでなく、ちゅうごくごもはなせます。', exampleMeaning: 'Anh ấy không chỉ nói tiếng Anh mà còn nói được tiếng Trung.' },
      { pattern: '～に対して', meaning: 'đối với ~, phản ứng với ~', usage: 'Chỉ đối tượng của hành động hoặc thái độ.', example: '意見に対して反論しました。', exampleReading: 'いけんにたいしてはんろんしました。', exampleMeaning: 'Phản bác ý kiến đó.' },
    ],
  },
  {
    title: 'Chương 4 — Công việc & sự nghiệp',
    description: 'Từ vựng công sở; Ngữ pháp ～ために, ～ように.',
    vocab: [
      { term: '勤める', pronunciation: 'つとめる', meaning: 'làm việc tại (công ty)', example: '銀行に勤めています。', exampleReading: 'ぎんこうにつとめています。', exampleMeaning: 'Làm việc tại ngân hàng.' },
      { term: '担当する', pronunciation: 'たんとうする', meaning: 'phụ trách, đảm nhận', example: '営業を担当しています。', exampleReading: 'えいぎょうをたんとうしています。', exampleMeaning: 'Phụ trách mảng kinh doanh.' },
      { term: '報告する', pronunciation: 'ほうこくする', meaning: 'báo cáo', example: '上司に報告しました。', exampleReading: 'じょうしにほうこくしました。', exampleMeaning: 'Báo cáo với cấp trên.' },
      { term: '打ち合わせ', pronunciation: 'うちあわせ', meaning: 'họp bàn sơ bộ', example: '午後から打ち合わせがあります。', exampleReading: 'ごごからうちあわせがあります。', exampleMeaning: 'Chiều có họp bàn.' },
      { term: '締め切り', pronunciation: 'しめきり', meaning: 'hạn chót', example: '締め切りは明日です。', exampleReading: 'しめきりはあしたです。', exampleMeaning: 'Hạn chót là ngày mai.' },
      { term: '昇進する', pronunciation: 'しょうしんする', meaning: 'thăng chức', example: '課長に昇進しました。', exampleReading: 'かちょうにしょうしんしました。', exampleMeaning: 'Được thăng chức lên trưởng phòng.' },
      { term: '退職する', pronunciation: 'たいしょくする', meaning: 'nghỉ việc, về hưu', example: '来月、退職します。', exampleReading: 'らいげつ、たいしょくします。', exampleMeaning: 'Tháng sau tôi nghỉ việc.' },
    ],
    grammar: [
      { pattern: '～ために', meaning: 'để (mục đích) / vì (nguyên nhân)', usage: 'Mục đích (V辞書形+ために) hoặc nguyên nhân khách quan (N/普通形+ために).', example: '合格するために、毎日勉強しています。', exampleReading: 'ごうかくするために、まいにちべんきょうしています。', exampleMeaning: 'Để thi đậu, tôi học mỗi ngày.' },
      { pattern: '～ように', meaning: 'để (có thể) ~ / sao cho ~', usage: 'Mục đích đạt trạng thái hoặc khả năng nào đó.', example: '聞こえるように、大きい声で話してください。', exampleReading: 'きこえるように、おおきいこえではなしてください。', exampleMeaning: 'Hãy nói to lên để mọi người nghe được.' },
      { pattern: '～てもらう', meaning: 'nhờ (ai đó) làm ~ (lợi cho mình)', usage: 'Người nói nhận lợi ích từ hành động của người khác.', example: '先生に添削してもらいました。', exampleReading: 'せんせいにてんさくしてもらいました。', exampleMeaning: 'Nhờ thầy chữa bài hộ.' },
    ],
  },
  {
    title: 'Chương 5 — Tự nhiên & thời tiết',
    description: 'Từ vựng thiên nhiên; Ngữ pháp ～らしい, ～そうだ.',
    vocab: [
      { term: '雲', pronunciation: 'くも', meaning: 'đám mây', example: '空に白い雲があります。', exampleReading: 'そらにしろいくもがあります。', exampleMeaning: 'Có đám mây trắng trên bầu trời.' },
      { term: '嵐', pronunciation: 'あらし', meaning: 'bão, cơn giông', example: '嵐が来そうです。', exampleReading: 'あらしがきそうです。', exampleMeaning: 'Có vẻ bão sắp đến.' },
      { term: '津波', pronunciation: 'つなみ', meaning: 'sóng thần', example: '津波の危険があります。', exampleReading: 'つなみのきけんがあります。', exampleMeaning: 'Có nguy cơ sóng thần.' },
      { term: '咲く', pronunciation: 'さく', meaning: 'nở (hoa)', example: '桜が咲きました。', exampleReading: 'さくらがさきました。', exampleMeaning: 'Hoa anh đào nở rồi.' },
      { term: '枯れる', pronunciation: 'かれる', meaning: 'héo, khô (cây)', example: '水をあげないと枯れます。', exampleReading: 'みずをあげないとかれます。', exampleMeaning: 'Không tưới nước thì cây sẽ héo.' },
      { term: '溶ける', pronunciation: 'とける', meaning: 'tan chảy', example: '雪が溶けました。', exampleReading: 'ゆきがとけました。', exampleMeaning: 'Tuyết đã tan.' },
      { term: '揺れる', pronunciation: 'ゆれる', meaning: 'rung, lung lay', example: '地震で建物が揺れました。', exampleReading: 'じしんでたてものがゆれました。', exampleMeaning: 'Tòa nhà rung do động đất.' },
    ],
    grammar: [
      { pattern: '～らしい（suy đoán）', meaning: 'có vẻ ~, nghe có vẻ ~', usage: 'Suy đoán dựa trên thông tin gián tiếp từ bên ngoài.', example: '彼女は昨日来なかったらしいです。', exampleReading: 'かのじょはきのうこなかったらしいです。', exampleMeaning: 'Có vẻ như cô ấy hôm qua không đến.' },
      { pattern: '～そうだ（truyền đạt）', meaning: 'nghe nói ~, người ta nói ~', usage: 'Truyền đạt thông tin nghe được từ người khác.', example: '明日は雪が降るそうです。', exampleReading: 'あしたはゆきがふるそうです。', exampleMeaning: 'Nghe nói ngày mai có tuyết rơi.' },
      { pattern: '～ようだ', meaning: 'có vẻ ~, dường như ~', usage: 'Suy đoán dựa trên quan sát trực tiếp.', example: '電気が消えているから、誰もいないようだ。', exampleReading: 'でんきがきえているから、だれもいないようだ。', exampleMeaning: 'Đèn tắt nên có vẻ không có ai.' },
    ],
  },
  {
    title: 'Chương 6 — Giáo dục & học tập',
    description: 'Từ vựng giáo dục; Ngữ pháp ～ば, ～のに.',
    vocab: [
      { term: '授業', pronunciation: 'じゅぎょう', meaning: 'buổi học, tiết học', example: '授業は9時に始まります。', exampleReading: 'じゅぎょうはくじにはじまります。', exampleMeaning: 'Buổi học bắt đầu lúc 9 giờ.' },
      { term: '教科書', pronunciation: 'きょうかしょ', meaning: 'sách giáo khoa', example: '教科書を忘れました。', exampleReading: 'きょうかしょをわすれました。', exampleMeaning: 'Quên sách giáo khoa.' },
      { term: '試験に合格する', pronunciation: 'しけんにごうかくする', meaning: 'thi đậu', example: 'N3に合格しました！', exampleReading: 'N3にごうかくしました！', exampleMeaning: 'Thi đậu N3 rồi!' },
      { term: '復習する', pronunciation: 'ふくしゅうする', meaning: 'ôn tập', example: '毎日復習することが大切です。', exampleReading: 'まいにちふくしゅうすることがたいせつです。', exampleMeaning: 'Ôn tập mỗi ngày rất quan trọng.' },
      { term: '暗記する', pronunciation: 'あんきする', meaning: 'học thuộc lòng', example: '単語を暗記しました。', exampleReading: 'たんごをあんきしました。', exampleMeaning: 'Học thuộc lòng từ vựng.' },
      { term: '理解する', pronunciation: 'りかいする', meaning: 'hiểu, nắm bắt', example: '内容を理解できましたか？', exampleReading: 'ないようをりかいできましたか？', exampleMeaning: 'Bạn đã hiểu nội dung chưa?' },
      { term: '参考書', pronunciation: 'さんこうしょ', meaning: 'sách tham khảo', example: '参考書を買いました。', exampleReading: 'さんこうしょをかいました。', exampleMeaning: 'Mua sách tham khảo.' },
    ],
    grammar: [
      { pattern: '～ば', meaning: 'nếu ~ thì ~', usage: 'Điều kiện giả định, thường mang tính tích cực hoặc trung lập.', example: '勉強すれば、合格できます。', exampleReading: 'べんきょうすれば、ごうかくできます。', exampleMeaning: 'Nếu học thì có thể thi đậu.' },
      { pattern: '～のに', meaning: 'mặc dù ~ mà vẫn ~ (ngạc nhiên)', usage: 'Diễn đạt sự tương phản bất ngờ hoặc tiếc nuối.', example: '練習したのに、失敗しました。', exampleReading: 'れんしゅうしたのに、しっぱいしました。', exampleMeaning: 'Dù đã luyện tập mà vẫn thất bại.' },
      { pattern: '～ことになる', meaning: '(được quyết định là) sẽ ~', usage: 'Diễn đạt quyết định hoặc sắp xếp khách quan.', example: '来月から東京に働くことになりました。', exampleReading: 'らいげつからとうきょうではたらくことになりました。', exampleMeaning: 'Được quyết định từ tháng sau sẽ làm việc ở Tokyo.' },
    ],
  },
  {
    title: 'Chương 7 — Sức khỏe & ẩm thực',
    description: 'Từ vựng y tế, sức khỏe; Ngữ pháp ～てある, ～ておく.',
    vocab: [
      { term: '症状', pronunciation: 'しょうじょう', meaning: 'triệu chứng', example: '症状を医者に伝えました。', exampleReading: 'しょうじょうをいしゃにつたえました。', exampleMeaning: 'Truyền đạt triệu chứng cho bác sĩ.' },
      { term: '回復する', pronunciation: 'かいふくする', meaning: 'hồi phục', example: '風邪から回復しました。', exampleReading: 'かぜからかいふくしました。', exampleMeaning: 'Đã khỏi cảm.' },
      { term: '手術', pronunciation: 'しゅじゅつ', meaning: 'phẫu thuật', example: '手術は成功しました。', exampleReading: 'しゅじゅつはせいこうしました。', exampleMeaning: 'Phẫu thuật thành công.' },
      { term: '栄養', pronunciation: 'えいよう', meaning: 'dinh dưỡng', example: 'バランスのいい栄養が必要です。', exampleReading: 'バランスのいいえいようがひつようです。', exampleMeaning: 'Cần dinh dưỡng cân bằng.' },
      { term: '消化', pronunciation: 'しょうか', meaning: 'tiêu hóa', example: '消化に良い食べ物を食べましょう。', exampleReading: 'しょうかにいいたべものをたべましょう。', exampleMeaning: 'Hãy ăn thức ăn dễ tiêu.' },
      { term: '処方する', pronunciation: 'しょほうする', meaning: 'kê đơn thuốc', example: '医者に薬を処方してもらいました。', exampleReading: 'いしゃにくすりをしょほうしてもらいました。', exampleMeaning: 'Được bác sĩ kê đơn thuốc.' },
      { term: '禁煙する', pronunciation: 'きんえんする', meaning: 'cai thuốc lá', example: '禁煙を決意しました。', exampleReading: 'きんえんをけついしました。', exampleMeaning: 'Quyết tâm cai thuốc.' },
    ],
    grammar: [
      { pattern: '～てある', meaning: '(ai đó đã) ~ và vẫn còn trạng thái đó', usage: 'Trạng thái là kết quả của hành động có chủ ý.', example: '窓が開けてあります。', exampleReading: 'まどがあけてあります。', exampleMeaning: 'Cửa sổ được (ai đó) mở ra (và vẫn đang mở).' },
      { pattern: '～ておく', meaning: 'làm ~ trước (chuẩn bị sẵn)', usage: 'Làm trước để phòng ngừa hoặc chuẩn bị.', example: '会議の前に資料を読んでおきます。', exampleReading: 'かいぎのまえにしりょうをよんでおきます。', exampleMeaning: 'Đọc tài liệu trước khi họp.' },
      { pattern: '～ように言う/頼む', meaning: 'nói/nhờ (ai) hãy ~', usage: 'Truyền đạt lời dặn, yêu cầu cho người khác.', example: '医者に安静にするように言われました。', exampleReading: 'いしゃにあんせいにするようにいわれました。', exampleMeaning: 'Bác sĩ dặn phải nghỉ ngơi.' },
    ],
  },
  {
    title: 'Chương 8 — Giao tiếp & truyền thông',
    description: 'Từ vựng truyền thông; Ngữ pháp ～という, ～として.',
    vocab: [
      { term: '情報', pronunciation: 'じょうほう', meaning: 'thông tin', example: '正確な情報が必要です。', exampleReading: 'せいかくなじょうほうがひつようです。', exampleMeaning: 'Cần thông tin chính xác.' },
      { term: '伝える', pronunciation: 'つたえる', meaning: 'truyền đạt, thông báo', example: '大切なことを伝えました。', exampleReading: 'たいせつなことをつたえました。', exampleMeaning: 'Truyền đạt điều quan trọng.' },
      { term: '報道する', pronunciation: 'ほうどうする', meaning: 'đưa tin, phóng sự', example: 'ニュースで事故を報道しました。', exampleReading: 'ニュースでじこをほうどうしました。', exampleMeaning: 'Đưa tin tai nạn trên bản tin.' },
      { term: '連絡する', pronunciation: 'れんらくする', meaning: 'liên lạc', example: '後で連絡します。', exampleReading: 'あとでれんらくします。', exampleMeaning: 'Lát nữa tôi liên lạc.' },
      { term: '掲載する', pronunciation: 'けいさいする', meaning: 'đăng tải, in lên', example: '記事が新聞に掲載されました。', exampleReading: 'きじがしんぶんにけいさいされました。', exampleMeaning: 'Bài báo được đăng trên báo.' },
      { term: '公表する', pronunciation: 'こうひょうする', meaning: 'công bố', example: '結果が公表されました。', exampleReading: 'けっかがこうひょうされました。', exampleMeaning: 'Kết quả được công bố.' },
      { term: '取材する', pronunciation: 'しゅざいする', meaning: 'phỏng vấn, thu thập tư liệu', example: '現地で取材しました。', exampleReading: 'げんちでしゅざいしました。', exampleMeaning: 'Phỏng vấn tại chỗ.' },
    ],
    grammar: [
      { pattern: '～という', meaning: 'được gọi là ~, mang tên ~', usage: 'Giới thiệu tên gọi hoặc nội dung của điều gì đó.', example: '「もったいない」という言葉は有名です。', exampleReading: '「もったいない」ということばはゆうめいです。', exampleMeaning: 'Từ "mottainai" rất nổi tiếng.' },
      { pattern: '～として', meaning: 'với tư cách là ~, như là ~', usage: 'Vai trò hoặc tư cách.', example: '代表として発言しました。', exampleReading: 'だいひょうとしてはつげんしました。', exampleMeaning: 'Phát biểu với tư cách đại diện.' },
      { pattern: '～に関して', meaning: 'liên quan đến ~, về ~', usage: 'Đề tài hoặc phạm vi.', example: '環境問題に関して話し合いました。', exampleReading: 'かんきょうもんだいにかんしてはなしあいました。', exampleMeaning: 'Thảo luận về vấn đề môi trường.' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// N2 — Mimikara Oboeru N2 Goi + Shin Kanzen Master N2 Bunpou
// ─────────────────────────────────────────────────────────────────────────────
const MIMIKARA_N2: Lesson[] = [
  {
    title: 'Unit 1 — Kinh tế & kinh doanh',
    description: 'Từ vựng kinh tế; Ngữ pháp ～に伴い, ～に応じて.',
    vocab: [
      { term: '景気', pronunciation: 'けいき', meaning: 'tình hình kinh tế, cảnh khí', example: '最近、景気が悪いです。', exampleReading: 'さいきん、けいきがわるいです。', exampleMeaning: 'Gần đây kinh tế không tốt.' },
      { term: '利益', pronunciation: 'りえき', meaning: 'lợi nhuận, lợi ích', example: '会社の利益が増えました。', exampleReading: 'かいしゃのりえきがふえました。', exampleMeaning: 'Lợi nhuận công ty tăng.' },
      { term: '赤字', pronunciation: 'あかじ', meaning: 'thâm hụt, lỗ (kinh doanh)', example: '今年は赤字になりそうです。', exampleReading: 'ことしはあかじになりそうです。', exampleMeaning: 'Năm nay có vẻ bị lỗ.' },
      { term: '融資', pronunciation: 'ゆうし', meaning: 'cấp vốn, cho vay', example: '銀行から融資を受けました。', exampleReading: 'ぎんこうからゆうしをうけました。', exampleMeaning: 'Vay vốn từ ngân hàng.' },
      { term: '契約', pronunciation: 'けいやく', meaning: 'hợp đồng, ký kết', example: '契約書にサインしました。', exampleReading: 'けいやくしょにサインしました。', exampleMeaning: 'Đã ký hợp đồng.' },
      { term: '投資', pronunciation: 'とうし', meaning: 'đầu tư', example: '株に投資しています。', exampleReading: 'かぶにとうしています。', exampleMeaning: 'Đang đầu tư cổ phiếu.' },
      { term: '需要', pronunciation: 'じゅよう', meaning: 'nhu cầu (cung cầu)', example: '需要が高まっています。', exampleReading: 'じゅようがたかまっています。', exampleMeaning: 'Nhu cầu đang tăng lên.' },
    ],
    grammar: [
      { pattern: '～に伴い／に伴って', meaning: 'đi kèm với ~, cùng với sự thay đổi của ~', usage: 'Hai sự kiện xảy ra đồng thời theo nhau, thường trong văn viết trang trọng.', example: '経済の発展に伴い、生活水準が上がりました。', exampleReading: 'けいざいのはってんにともない、せいかつすいじゅんがあがりました。', exampleMeaning: 'Cùng với sự phát triển kinh tế, mức sống được nâng cao.' },
      { pattern: '～に応じて', meaning: 'tùy theo ~, đáp lại ~', usage: 'Điều chỉnh theo điều kiện hoặc yêu cầu thay đổi.', example: '状況に応じて対応します。', exampleReading: 'じょうきょうにおうじてたいおうします。', exampleMeaning: 'Ứng xử tùy theo tình huống.' },
      { pattern: '～にもかかわらず', meaning: 'mặc dù ~, bất chấp ~', usage: 'Dù kết quả trái với kỳ vọng từ điều kiện ban đầu.', example: '努力したにもかかわらず、失敗しました。', exampleReading: 'どりょくしたにもかかわらず、しっぱいしました。', exampleMeaning: 'Mặc dù đã cố gắng nhưng vẫn thất bại.' },
    ],
  },
  {
    title: 'Unit 2 — Khoa học & công nghệ',
    description: 'Từ vựng khoa học, công nghệ; Ngữ pháp ～によって, ～をもとに.',
    vocab: [
      { term: '開発する', pronunciation: 'かいはつする', meaning: 'phát triển, khai thác', example: '新しい薬を開発しました。', exampleReading: 'あたらしいくすりをかいはつしました。', exampleMeaning: 'Phát triển loại thuốc mới.' },
      { term: '実験', pronunciation: 'じっけん', meaning: 'thí nghiệm', example: '実験の結果が出ました。', exampleReading: 'じっけんのけっかがでました。', exampleMeaning: 'Kết quả thí nghiệm đã ra.' },
      { term: '発見する', pronunciation: 'はっけんする', meaning: 'phát hiện', example: '新しい病原菌を発見しました。', exampleReading: 'あたらしいびょうげんきんをはっけんしました。', exampleMeaning: 'Phát hiện vi khuẩn gây bệnh mới.' },
      { term: '応用する', pronunciation: 'おうようする', meaning: 'ứng dụng', example: '研究結果を応用します。', exampleReading: 'けんきゅうけっかをおうようします。', exampleMeaning: 'Ứng dụng kết quả nghiên cứu.' },
      { term: '革新的な', pronunciation: 'かくしんてきな', meaning: 'mang tính đột phá', example: '革新的な技術が生まれました。', exampleReading: 'かくしんてきなぎじゅつがうまれました。', exampleMeaning: 'Công nghệ đột phá ra đời.' },
      { term: '分析する', pronunciation: 'ぶんせきする', meaning: 'phân tích', example: 'データを分析しました。', exampleReading: 'データをぶんせきしました。', exampleMeaning: 'Phân tích dữ liệu.' },
      { term: '証明する', pronunciation: 'しょうめいする', meaning: 'chứng minh', example: '理論が証明されました。', exampleReading: 'りろんがしょうめいされました。', exampleMeaning: 'Lý thuyết được chứng minh.' },
    ],
    grammar: [
      { pattern: '～によって（原因・手段）', meaning: 'bởi ~ / do ~ / bằng cách ~', usage: 'Chỉ nguyên nhân, phương pháp, hoặc người thực hiện (bị động).', example: '新薬によって多くの命が救われました。', exampleReading: 'しんやくによっておおくのいのちがすくわれました。', exampleMeaning: 'Nhờ thuốc mới, nhiều sinh mạng được cứu.' },
      { pattern: '～をもとに', meaning: 'dựa trên ~, căn cứ vào ~', usage: 'Lấy làm căn cứ hoặc nguyên liệu.', example: '事実をもとに小説を書きました。', exampleReading: 'じじつをもとにしょうせつをかきました。', exampleMeaning: 'Viết tiểu thuyết dựa trên sự thật.' },
      { pattern: '～はもちろん', meaning: '~ là đương nhiên rồi, ~ không cần nói', usage: 'Nhấn mạnh điều hiển nhiên rồi nêu thêm điều khác.', example: '日本語はもちろん、英語も話せます。', exampleReading: 'にほんごはもちろん、えいごもはなせます。', exampleMeaning: 'Tiếng Nhật đương nhiên rồi, còn nói được cả tiếng Anh.' },
    ],
  },
  {
    title: 'Unit 3 — Xã hội & văn hoá',
    description: 'Từ vựng xã hội; Ngữ pháp ～とともに, ～に際して.',
    vocab: [
      { term: '伝統', pronunciation: 'でんとう', meaning: 'truyền thống', example: '日本の伝統を守りたいです。', exampleReading: 'にほんのでんとうをまもりたいです。', exampleMeaning: 'Muốn giữ gìn truyền thống Nhật Bản.' },
      { term: '普及する', pronunciation: 'ふきゅうする', meaning: 'phổ biến, lan rộng', example: 'スマホが世界中に普及しました。', exampleReading: 'スマホがせかいじゅうにふきゅうしました。', exampleMeaning: 'Điện thoại thông minh phổ biến toàn thế giới.' },
      { term: '影響を与える', pronunciation: 'えいきょうをあたえる', meaning: 'gây ảnh hưởng', example: '彼は多くの人に影響を与えました。', exampleReading: 'かれはおおくのひとにえいきょうをあたえました。', exampleMeaning: 'Anh ấy ảnh hưởng đến nhiều người.' },
      { term: '格差', pronunciation: 'かくさ', meaning: 'chênh lệch, khoảng cách', example: '所得格差が問題です。', exampleReading: 'しょとくかくさがもんだいです。', exampleMeaning: 'Chênh lệch thu nhập là vấn đề.' },
      { term: '少子化', pronunciation: 'しょうしか', meaning: 'giảm tỷ lệ sinh', example: '少子化対策が必要です。', exampleReading: 'しょうしかたいさくがひつようです。', exampleMeaning: 'Cần biện pháp đối phó với giảm tỷ lệ sinh.' },
      { term: '高齢化', pronunciation: 'こうれいか', meaning: 'già hóa dân số', example: '高齢化社会が進んでいます。', exampleReading: 'こうれいかしゃかいがすすんでいます。', exampleMeaning: 'Xã hội già hóa đang tiến triển.' },
      { term: '多様性', pronunciation: 'たようせい', meaning: 'sự đa dạng', example: '多様性を尊重することが大切です。', exampleReading: 'たようせいをそんちょうすることがたいせつです。', exampleMeaning: 'Tôn trọng sự đa dạng là quan trọng.' },
    ],
    grammar: [
      { pattern: '～とともに', meaning: 'cùng với ~, đồng thời với ~', usage: 'Diễn đạt hai sự kiện xảy ra song song.', example: '時代の変化とともに、価値観も変わりました。', exampleReading: 'じだいのへんかとともに、かちかんもかわりました。', exampleMeaning: 'Cùng với sự thay đổi của thời đại, quan niệm cũng thay đổi.' },
      { pattern: '～に際して', meaning: 'nhân dịp ~, khi ~', usage: 'Dùng khi bắt đầu một việc quan trọng.', example: '入社に際して、挨拶をしました。', exampleReading: 'にゅうしゃにさいして、あいさつをしました。', exampleMeaning: 'Nhân dịp gia nhập công ty, tôi đã chào hỏi.' },
      { pattern: '～ないことには～ない', meaning: 'nếu không ~ thì không thể ~', usage: 'Nhấn mạnh điều kiện tiên quyết.', example: '試してみないことには、わかりません。', exampleReading: 'ためしてみないことには、わかりません。', exampleMeaning: 'Nếu không thử thì không biết được.' },
    ],
  },
  {
    title: 'Unit 4 — Tư duy & triết học',
    description: 'Từ vựng trừu tượng; Ngữ pháp ～から見ると, ～とすれば.',
    vocab: [
      { term: '概念', pronunciation: 'がいねん', meaning: 'khái niệm', example: '自由という概念は複雑です。', exampleReading: 'じゆうというがいねんはふくざつです。', exampleMeaning: 'Khái niệm tự do rất phức tạp.' },
      { term: '矛盾する', pronunciation: 'むじゅんする', meaning: 'mâu thuẫn', example: '彼の言動は矛盾しています。', exampleReading: 'かれのげんどうはむじゅんしています。', exampleMeaning: 'Lời nói và hành động của anh ấy mâu thuẫn.' },
      { term: '論理的な', pronunciation: 'ろんりてきな', meaning: 'có tính logic', example: '論理的な説明をしてください。', exampleReading: 'ろんりてきなせつめいをしてください。', exampleMeaning: 'Hãy giải thích một cách logic.' },
      { term: '批判的な', pronunciation: 'ひはんてきな', meaning: 'mang tính phê phán', example: '批判的な視点を持つことが重要です。', exampleReading: 'ひはんてきなしてんをもつことがじゅうようです。', exampleMeaning: 'Có cái nhìn phê phán là quan trọng.' },
      { term: '客観的な', pronunciation: 'きゃっかんてきな', meaning: 'khách quan', example: '客観的に判断してください。', exampleReading: 'きゃっかんてきにはんだんしてください。', exampleMeaning: 'Hãy phán đoán một cách khách quan.' },
      { term: '価値観', pronunciation: 'かちかん', meaning: 'quan niệm giá trị', example: '人によって価値観は違います。', exampleReading: 'ひとによってかちかんはちがいます。', exampleMeaning: 'Tùy người mà quan niệm giá trị khác nhau.' },
      { term: '本質', pronunciation: 'ほんしつ', meaning: 'bản chất', example: '問題の本質を見極めることが大切です。', exampleReading: 'もんだいのほんしつをみきわめることがたいせつです。', exampleMeaning: 'Nhìn thấu bản chất vấn đề là quan trọng.' },
    ],
    grammar: [
      { pattern: '～から見ると／から見れば', meaning: 'từ góc nhìn ~, nhìn từ phía ~', usage: 'Diễn đạt quan điểm từ vị trí nhất định.', example: '専門家から見ると、これは深刻な問題です。', exampleReading: 'せんもんかからみると、これはしんこくなもんだいです。', exampleMeaning: 'Nhìn từ góc độ chuyên gia, đây là vấn đề nghiêm trọng.' },
      { pattern: '～とすれば／としたら', meaning: 'nếu giả sử ~', usage: 'Giả định một điều kiện.', example: 'もし宝くじに当たったとすれば、何をしますか？', exampleReading: 'もしたからくじにあたったとすれば、なにをしますか？', exampleMeaning: 'Nếu giả sử trúng xổ số, bạn sẽ làm gì?' },
      { pattern: '～ものの', meaning: 'tuy nhiên ~, dù vậy ~', usage: 'Dù điều kiện trước, kết quả sau không như mong đợi.', example: '夢は持ったものの、実現が難しいです。', exampleReading: 'ゆめはもったものの、じつげんがむずかしいです。', exampleMeaning: 'Tuy có mơ ước nhưng thực hiện rất khó.' },
    ],
  },
  {
    title: 'Unit 5 — Luật pháp & quyền lợi',
    description: 'Từ vựng pháp luật; Ngữ pháp ～において, ～に基づいて.',
    vocab: [
      { term: '権利', pronunciation: 'けんり', meaning: 'quyền lợi', example: '人権を守ることが大切です。', exampleReading: 'じんけんをまもることがたいせつです。', exampleMeaning: 'Bảo vệ quyền con người là quan trọng.' },
      { term: '義務', pronunciation: 'ぎむ', meaning: 'nghĩa vụ', example: '税金を払う義務があります。', exampleReading: 'ぜいきんをはらうぎむがあります。', exampleMeaning: 'Có nghĩa vụ nộp thuế.' },
      { term: '違反する', pronunciation: 'いはんする', meaning: 'vi phạm', example: '法律に違反しました。', exampleReading: 'ほうりつにいはんしました。', exampleMeaning: 'Vi phạm pháp luật.' },
      { term: '裁判', pronunciation: 'さいばん', meaning: 'phiên tòa, xét xử', example: '裁判で無罪になりました。', exampleReading: 'さいばんでむざいになりました。', exampleMeaning: 'Được tuyên vô tội tại tòa.' },
      { term: '規制する', pronunciation: 'きせいする', meaning: 'quy định, kiểm soát', example: '車の速度を規制しています。', exampleReading: 'くるまのそくどをきせいしています。', exampleMeaning: 'Kiểm soát tốc độ xe.' },
      { term: '承認する', pronunciation: 'しょうにんする', meaning: 'phê duyệt, công nhận', example: '議会が法案を承認しました。', exampleReading: 'ぎかいがほうあんをしょうにんしました。', exampleMeaning: 'Nghị viện phê duyệt dự luật.' },
      { term: '施行する', pronunciation: 'しこうする', meaning: 'thi hành, thực thi', example: '新しい法律が施行されました。', exampleReading: 'あたらしいほうりつがしこうされました。', exampleMeaning: 'Luật mới được thi hành.' },
    ],
    grammar: [
      { pattern: '～において／においては', meaning: 'trong ~ / tại ~', usage: 'Chỉ phạm vi/bối cảnh. Trang trọng hơn ～で.', example: 'ビジネスにおいては、信頼が大切です。', exampleReading: 'ビジネスにおいては、しんらいがたいせつです。', exampleMeaning: 'Trong kinh doanh, sự tin tưởng là quan trọng.' },
      { pattern: '～に基づいて', meaning: 'dựa trên ~, căn cứ vào ~', usage: 'Hành động theo căn cứ rõ ràng.', example: '法律に基づいて対応します。', exampleReading: 'ほうりつにもとづいてたいおうします。', exampleMeaning: 'Xử lý dựa trên pháp luật.' },
      { pattern: '～わけにはいかない', meaning: 'không thể ~ (vì lý do hoặc nghĩa vụ)', usage: 'Không thể làm vì áp lực xã hội hoặc đạo đức.', example: '約束したのだから、行かないわけにはいかないです。', exampleReading: 'やくそくしたのだから、いかないわけにはいかないです。', exampleMeaning: 'Đã hứa rồi nên không thể không đi.' },
    ],
  },
  {
    title: 'Unit 6 — Thiên nhiên & môi trường',
    description: 'Từ vựng môi trường; Ngữ pháp ～が原因で, ～にわたって.',
    vocab: [
      { term: '排出する', pronunciation: 'はいしゅつする', meaning: 'thải ra', example: 'CO2を排出する量を減らします。', exampleReading: 'CO2をはいしゅつするりょうをへらします。', exampleMeaning: 'Giảm lượng CO2 thải ra.' },
      { term: '再生可能エネルギー', pronunciation: 'さいせいかのうエネルギー', meaning: 'năng lượng tái tạo', example: '再生可能エネルギーを活用します。', exampleReading: 'さいせいかのうエネルギーをかつようします。', exampleMeaning: 'Tận dụng năng lượng tái tạo.' },
      { term: '生態系', pronunciation: 'せいたいけい', meaning: 'hệ sinh thái', example: '生態系が壊れています。', exampleReading: 'せいたいけいがこわれています。', exampleMeaning: 'Hệ sinh thái đang bị phá vỡ.' },
      { term: '汚染', pronunciation: 'おせん', meaning: 'ô nhiễm', example: '川の汚染が問題です。', exampleReading: 'かわのおせんがもんだいです。', exampleMeaning: 'Ô nhiễm sông là vấn đề.' },
      { term: '保護する', pronunciation: 'ほごする', meaning: 'bảo vệ, bảo tồn', example: '絶滅危惧種を保護しています。', exampleReading: 'ぜつめつきぐしゅをほごしています。', exampleMeaning: 'Bảo vệ loài có nguy cơ tuyệt chủng.' },
      { term: '削減する', pronunciation: 'さくげんする', meaning: 'cắt giảm', example: 'エネルギー消費を削減します。', exampleReading: 'エネルギーしょうひをさくげんします。', exampleMeaning: 'Cắt giảm tiêu thụ năng lượng.' },
      { term: '持続可能な', pronunciation: 'じぞくかのうな', meaning: 'bền vững', example: '持続可能な社会を目指します。', exampleReading: 'じぞくかのうなしゃかいをめざします。', exampleMeaning: 'Hướng tới xã hội bền vững.' },
    ],
    grammar: [
      { pattern: '～が原因で', meaning: 'do ~ gây ra', usage: 'Nêu nguyên nhân trực tiếp.', example: '地球温暖化が原因で、異常気象が増えています。', exampleReading: 'ちきゅうおんだんかがげんいんで、いじょうきしょうがふえています。', exampleMeaning: 'Do ấm lên toàn cầu, các hiện tượng thời tiết cực đoan tăng lên.' },
      { pattern: '～にわたって', meaning: 'trải dài khắp ~, suốt ~ (không gian/thời gian)', usage: 'Phạm vi rộng — thời gian dài hoặc không gian lớn.', example: '長年にわたって研究してきました。', exampleReading: 'ながねんにわたってけんきゅうしてきました。', exampleMeaning: 'Đã nghiên cứu suốt nhiều năm.' },
      { pattern: '～に対する', meaning: '(thái độ/phản ứng) đối với ~', usage: 'Chỉ đối tượng của thái độ hoặc hành động.', example: '環境問題に対する意識が高まりました。', exampleReading: 'かんきょうもんだいにたいするいしきがたかまりました。', exampleMeaning: 'Ý thức về vấn đề môi trường được nâng cao.' },
    ],
  },
  {
    title: 'Unit 7 — Tâm lý học & hành vi',
    description: 'Từ vựng tâm lý; Ngữ pháp ～ほど, ～ばかりか.',
    vocab: [
      { term: '動機', pronunciation: 'どうき', meaning: 'động cơ, động lực', example: '犯罪の動機を調べています。', exampleReading: 'はんざいのどうきをしらべています。', exampleMeaning: 'Điều tra động cơ tội phạm.' },
      { term: '欲求', pronunciation: 'よっきゅう', meaning: 'nhu cầu, ham muốn', example: '人間には様々な欲求があります。', exampleReading: 'にんげんにはさまざまなよっきゅうがあります。', exampleMeaning: 'Con người có nhiều loại nhu cầu khác nhau.' },
      { term: '自尊心', pronunciation: 'じそんしん', meaning: 'lòng tự trọng', example: '子どもの自尊心を育てましょう。', exampleReading: 'こどものじそんしんをそだてましょう。', exampleMeaning: 'Hãy nuôi dưỡng lòng tự trọng của con trẻ.' },
      { term: 'ストレス', pronunciation: 'ストレス', meaning: 'căng thẳng', example: 'ストレスが溜まっています。', exampleReading: 'ストレスがたまっています。', exampleMeaning: 'Căng thẳng tích tụ.' },
      { term: '偏見', pronunciation: 'へんけん', meaning: 'định kiến', example: '偏見を持たないようにしましょう。', exampleReading: 'へんけんをもたないようにしましょう。', exampleMeaning: 'Hãy cố đừng mang định kiến.' },
      { term: '共感する', pronunciation: 'きょうかんする', meaning: 'đồng cảm', example: '彼女の意見に共感しました。', exampleReading: 'かのじょのいけんにきょうかんしました。', exampleMeaning: 'Đồng cảm với ý kiến của cô ấy.' },
      { term: '克服する', pronunciation: 'こくふくする', meaning: 'vượt qua, khắc phục', example: '恐怖を克服しました。', exampleReading: 'きょうふをこくふくしました。', exampleMeaning: 'Vượt qua nỗi sợ hãi.' },
    ],
    grammar: [
      { pattern: '～ほど～ない', meaning: 'không ~ bằng ~', usage: 'So sánh: A không ~ bằng B.', example: '思ったほど難しくありませんでした。', exampleReading: 'おもったほどむずかしくありませんでした。', exampleMeaning: 'Không khó như tôi tưởng.' },
      { pattern: '～ばかりか', meaning: 'không chỉ ~ mà còn ~', usage: 'Thêm điều ngạc nhiên hơn vào điều đã nêu.', example: '彼はサッカーばかりか、バスケットボールも得意です。', exampleReading: 'かれはサッカーばかりか、バスケットボールもとくいです。', exampleMeaning: 'Không chỉ bóng đá mà cả bóng rổ anh ấy cũng giỏi.' },
      { pattern: '～きり', meaning: 'chỉ ~ thôi / từ ~ về sau không còn nữa', usage: 'Chỉ sự giới hạn hoặc cắt đứt.', example: '彼とは一度会ったきり、連絡がありません。', exampleReading: 'かれとはいちどあったきり、れんらくがありません。', exampleMeaning: 'Sau một lần gặp đó không còn liên lạc nữa.' },
    ],
  },
  {
    title: 'Unit 8 — Nghệ thuật & văn học',
    description: 'Từ vựng nghệ thuật; Ngữ pháp ～として～ない, ～とは言えない.',
    vocab: [
      { term: '表現する', pronunciation: 'ひょうげんする', meaning: 'biểu đạt, thể hiện', example: '感情を絵で表現しました。', exampleReading: 'かんじょうをえでひょうげんしました。', exampleMeaning: 'Biểu đạt cảm xúc qua tranh.' },
      { term: '作品', pronunciation: 'さくひん', meaning: 'tác phẩm', example: 'この作品は有名です。', exampleReading: 'このさくひんはゆうめいです。', exampleMeaning: 'Tác phẩm này nổi tiếng.' },
      { term: '鑑賞する', pronunciation: 'かんしょうする', meaning: 'thưởng thức, thưởng ngoạn', example: '美術館で絵を鑑賞しました。', exampleReading: 'びじゅつかんでえをかんしょうしました。', exampleMeaning: 'Thưởng thức tranh tại bảo tàng mỹ thuật.' },
      { term: '描写する', pronunciation: 'びょうしゃする', meaning: 'miêu tả', example: '自然の美しさを描写しました。', exampleReading: 'しぜんのうつくしさをびょうしゃしました。', exampleMeaning: 'Miêu tả vẻ đẹp thiên nhiên.' },
      { term: '解釈する', pronunciation: 'かいしゃくする', meaning: 'diễn giải', example: '詩をどう解釈しますか？', exampleReading: 'しをどうかいしゃくしますか？', exampleMeaning: 'Bạn diễn giải bài thơ này như thế nào?' },
      { term: '批評する', pronunciation: 'ひひょうする', meaning: 'phê bình', example: '映画を批評しました。', exampleReading: 'えいがをひひょうしました。', exampleMeaning: 'Phê bình bộ phim.' },
      { term: '独創的な', pronunciation: 'どくそうてきな', meaning: 'sáng tạo độc đáo', example: '独創的なアイデアが評価されました。', exampleReading: 'どくそうてきなアイデアがひょうかされました。', exampleMeaning: 'Ý tưởng sáng tạo độc đáo được đánh giá cao.' },
    ],
    grammar: [
      { pattern: '～とは言えない', meaning: 'không thể nói là ~', usage: 'Phủ nhận nhẹ nhàng một đánh giá.', example: 'これが最善とは言えません。', exampleReading: 'これがさいぜんとはいえません。', exampleMeaning: 'Không thể nói đây là phương án tốt nhất.' },
      { pattern: '～というものだ', meaning: 'đó chính là ~, đó mới gọi là ~', usage: 'Định nghĩa hay nhận định tổng quát.', example: '失敗を恐れないのが挑戦というものだ。', exampleReading: 'しっぱいをおそれないのがちょうせんというものだ。', exampleMeaning: 'Không sợ thất bại, đó mới gọi là thử thách.' },
      { pattern: '～に他ならない', meaning: 'chẳng là gì khác ngoài ~', usage: 'Khẳng định mạnh mẽ.', example: 'それは愛情に他ならないです。', exampleReading: 'それはあいじょうにほかならないです。', exampleMeaning: 'Đó chẳng gì khác ngoài tình yêu thương.' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// N1 — Mimikara Oboeru N1 Goi + Shin Kanzen Master N1 Bunpou
// ─────────────────────────────────────────────────────────────────────────────
const MIMIKARA_N1: Lesson[] = [
  {
    title: 'Unit 1 — Chính trị & hành chính',
    description: 'Từ vựng chính trị; Ngữ pháp ～いかんによらず, ～もさることながら.',
    vocab: [
      { term: '施策', pronunciation: 'しさく', meaning: 'chính sách, biện pháp', example: '政府の施策が議論されています。', exampleReading: 'せいふのしさくがぎろんされています。', exampleMeaning: 'Chính sách của chính phủ đang được thảo luận.' },
      { term: '行政', pronunciation: 'ぎょうせい', meaning: 'hành chính', example: '行政の効率化が求められています。', exampleReading: 'ぎょうせいのこうりつかがもとめられています。', exampleMeaning: 'Việc nâng cao hiệu quả hành chính được đòi hỏi.' },
      { term: '審議する', pronunciation: 'しんぎする', meaning: 'thẩm tra, xem xét', example: '議会で法案を審議しています。', exampleReading: 'ぎかいでほうあんをしんぎしています。', exampleMeaning: 'Nghị viện đang xem xét dự luật.' },
      { term: '妥協する', pronunciation: 'だきょうする', meaning: 'thỏa hiệp', example: '双方が妥協して合意しました。', exampleReading: 'そうほうがだきょうしてごういしました。', exampleMeaning: 'Cả hai bên thỏa hiệp và đồng ý.' },
      { term: '弾劾する', pronunciation: 'だんがいする', meaning: 'luận tội, đàn hặc', example: '大統領が弾劾されました。', exampleReading: 'だいとうりょうがだんがいされました。', exampleMeaning: 'Tổng thống bị luận tội.' },
      { term: '批准する', pronunciation: 'ひじゅんする', meaning: 'phê chuẩn (hiệp ước)', example: '条約を批准しました。', exampleReading: 'じょうやくをひじゅんしました。', exampleMeaning: 'Phê chuẩn hiệp ước.' },
      { term: '介入する', pronunciation: 'かいにゅうする', meaning: 'can thiệp', example: '外国が内政に介入しました。', exampleReading: 'がいこくがないせいにかいにゅうしました。', exampleMeaning: 'Nước ngoài can thiệp vào chính trị nội bộ.' },
    ],
    grammar: [
      { pattern: '～いかんによらず／いかんにかかわらず', meaning: 'bất kể ~, không phân biệt ~', usage: 'Nhấn mạnh kết quả không thay đổi dù điều kiện như thế nào.', example: '成績のいかんにかかわらず、全員が参加できます。', exampleReading: 'せいせきのいかんにかかわらず、ぜんいんがさんかできます。', exampleMeaning: 'Bất kể thành tích thế nào, tất cả đều có thể tham gia.' },
      { pattern: '～もさることながら', meaning: '~ đã là điều đương nhiên rồi, nhưng ~', usage: 'Thừa nhận điều hiển nhiên rồi nhấn mạnh điều quan trọng hơn.', example: '費用もさることながら、時間の問題もあります。', exampleReading: 'ひようもさることながら、じかんのもんだいもあります。', exampleMeaning: 'Chi phí đã là vấn đề rồi, nhưng còn cả vấn đề thời gian nữa.' },
      { pattern: '～を踏まえた上で', meaning: 'trên cơ sở ~, dựa vào ~', usage: 'Hành động sau khi đã xem xét kỹ điều kiện.', example: '状況を踏まえた上で、判断します。', exampleReading: 'じょうきょうをふまえたうえで、はんだんします。', exampleMeaning: 'Phán đoán trên cơ sở đánh giá tình huống.' },
    ],
  },
  {
    title: 'Unit 2 — Kinh tế vĩ mô',
    description: 'Từ vựng kinh tế tầm cao; Ngữ pháp ～ならいざしらず, ～ないまでも.',
    vocab: [
      { term: '財政', pronunciation: 'ざいせい', meaning: 'tài chính (nhà nước)', example: '財政再建が急務です。', exampleReading: 'ざいせいさいけんがきゅうむです。', exampleMeaning: 'Cải thiện tài chính là việc cấp bách.' },
      { term: '格付け', pronunciation: 'かくづけ', meaning: 'xếp hạng, đánh giá tín nhiệm', example: '国債の格付けが下がりました。', exampleReading: 'こくさいのかくづけがさがりました。', exampleMeaning: 'Xếp hạng trái phiếu quốc gia giảm xuống.' },
      { term: '流動性', pronunciation: 'りゅうどうせい', meaning: 'tính thanh khoản', example: '市場の流動性が低下しています。', exampleReading: 'しじょうのりゅうどうせいがていかしています。', exampleMeaning: 'Thanh khoản thị trường đang giảm.' },
      { term: '構造改革', pronunciation: 'こうぞうかいかく', meaning: 'cải cách cơ cấu', example: '構造改革を推進します。', exampleReading: 'こうぞうかいかくをすいしんします。', exampleMeaning: 'Thúc đẩy cải cách cơ cấu.' },
      { term: '規制緩和', pronunciation: 'きせいかんわ', meaning: 'nới lỏng quy định', example: '規制緩和が企業の競争力を高めます。', exampleReading: 'きせいかんわがきぎょうのきょうそうりょくをたかめます。', exampleMeaning: 'Nới lỏng quy định nâng cao năng lực cạnh tranh doanh nghiệp.' },
      { term: '内需拡大', pronunciation: 'ないじゅかくだい', meaning: 'mở rộng nhu cầu nội địa', example: '内需拡大策が必要です。', exampleReading: 'ないじゅかくだいさくがひつようです。', exampleMeaning: 'Cần chính sách mở rộng nhu cầu nội địa.' },
      { term: '脱炭素化', pronunciation: 'だつたんそか', meaning: 'phi carbon hóa, giảm phát thải Carbon', example: '脱炭素化は世界共通の課題です。', exampleReading: 'だつたんそかはせかいきょうつうのかだいです。', exampleMeaning: 'Phi carbon hóa là thách thức chung của thế giới.' },
    ],
    grammar: [
      { pattern: '～ならいざしらず', meaning: 'nếu là ~ thì còn không nói, nhưng ~', usage: 'Dùng để loại trừ một trường hợp rõ ràng và nhấn mạnh trường hợp hiện tại.', example: '素人ならいざしらず、プロにしては失敗が多すぎます。', exampleReading: 'しろうとならいざしらず、プロにしてはしっぱいがおおすぎます。', exampleMeaning: 'Người nghiệp dư còn không nói làm gì, nhưng dân chuyên nghiệp mà lại thất bại nhiều vậy.' },
      { pattern: '～ないまでも', meaning: 'dù không ~ thì ít nhất cũng ~', usage: 'Thừa nhận không đạt mức lý tưởng nhưng nhấn mạnh một mức tối thiểu.', example: '完璧ではないまでも、ある程度の質は保ちたい。', exampleReading: 'かんぺきではないまでも、あるていどのしつはたもちたい。', exampleMeaning: 'Dù không hoàn hảo, muốn duy trì chất lượng ở mức độ nào đó.' },
      { pattern: '～とあって', meaning: 'vì là ~ / do đặc điểm ~', usage: 'Nêu lý do đặc biệt khiến sự việc xảy ra theo cách nhất định.', example: '連休とあって、観光地は混雑しています。', exampleReading: 'れんきゅうとあって、かんこうちはこんざつしています。', exampleMeaning: 'Vì là kỳ nghỉ liên tiếp, khu du lịch rất đông.' },
    ],
  },
  {
    title: 'Unit 3 — Triết học & tư tưởng',
    description: 'Từ vựng triết học; Ngữ pháp ～ずにはおかない, ～をおいて.',
    vocab: [
      { term: '倫理', pronunciation: 'りんり', meaning: 'đạo đức, luân lý', example: 'AIの倫理的な問題が注目されています。', exampleReading: 'AIのりんりてきなもんだいがちゅうもくされています。', exampleMeaning: 'Vấn đề đạo đức của AI đang được chú ý.' },
      { term: '普遍的な', pronunciation: 'ふへんてきな', meaning: 'phổ quát, toàn cầu', example: '普遍的な価値が存在するか議論があります。', exampleReading: 'ふへんてきなかちがそんざいするかぎろんがあります。', exampleMeaning: 'Có tranh luận về việc liệu có giá trị phổ quát hay không.' },
      { term: '相対的な', pronunciation: 'そうたいてきな', meaning: 'tương đối', example: '善悪は相対的だという考え方があります。', exampleReading: 'ぜんあくはそうたいてきだというかんがえかたがあります。', exampleMeaning: 'Có cách nghĩ rằng thiện ác là tương đối.' },
      { term: '実存する', pronunciation: 'じつぞんする', meaning: 'tồn tại thực sự', example: '自由は実存するか哲学の問いです。', exampleReading: 'じゆうはじつぞんするかてつがくのといです。', exampleMeaning: 'Tự do có tồn tại thực sự hay không là câu hỏi triết học.' },
      { term: '自己矛盾', pronunciation: 'じこむじゅん', meaning: 'tự mâu thuẫn', example: 'その主張は自己矛盾をはらんでいます。', exampleReading: 'そのしゅちょうはじこむじゅんをはらんでいます。', exampleMeaning: 'Lập luận đó chứa đựng tự mâu thuẫn.' },
      { term: '弁証法', pronunciation: 'べんしょうほう', meaning: 'phép biện chứng', example: 'ヘーゲルの弁証法を学びます。', exampleReading: 'ヘーゲルのべんしょうほうをまなびます。', exampleMeaning: 'Học phép biện chứng của Hegel.' },
      { term: '認識論', pronunciation: 'にんしきろん', meaning: 'nhận thức luận', example: '認識論は知識の本質を問います。', exampleReading: 'にんしきろんはちしきのほんしつをといます。', exampleMeaning: 'Nhận thức luận đặt câu hỏi về bản chất của tri thức.' },
    ],
    grammar: [
      { pattern: '～ずにはおかない', meaning: 'không thể không ~, ắt sẽ ~', usage: 'Diễn đạt hành động không thể tránh khỏi hoặc xúc cảm không kìm được.', example: 'この映画は見る者を感動させずにはおかない。', exampleReading: 'このえいがはみるものをかんどうさせずにはおかない。', exampleMeaning: 'Bộ phim này ắt sẽ làm cho người xem xúc động.' },
      { pattern: '～をおいて', meaning: 'ngoài ~ ra không còn ~', usage: 'Nhấn mạnh tính duy nhất, không thể thay thế.', example: 'この仕事は彼をおいて他にいない。', exampleReading: 'このしごとはかれをおいてほかにいない。', exampleMeaning: 'Ngoài anh ấy ra không còn ai có thể làm công việc này.' },
      { pattern: '～に至っては', meaning: 'đến (trường hợp) ~ thì ~', usage: 'Nêu trường hợp cực đoan nhất để nhấn mạnh.', example: '他の社員はともかく、部長に至っては全く協力しない。', exampleReading: 'ほかのしゃいんはともかく、ぶちょうにいたってはまったくきょうりょくしない。', exampleMeaning: 'Các nhân viên khác thì còn đỡ, nhưng đến trưởng phòng thì hoàn toàn không hợp tác.' },
    ],
  },
  {
    title: 'Unit 4 — Khoa học nâng cao',
    description: 'Từ vựng khoa học cao cấp; Ngữ pháp ～に先立って, ～を皮切りに.',
    vocab: [
      { term: '量子力学', pronunciation: 'りょうしりきがく', meaning: 'cơ học lượng tử', example: '量子力学は現代物理学の基礎です。', exampleReading: 'りょうしりきがくはげんだいぶつりがくのきそです。', exampleMeaning: 'Cơ học lượng tử là nền tảng vật lý hiện đại.' },
      { term: '遺伝子', pronunciation: 'いでんし', meaning: 'gen di truyền', example: '遺伝子研究が進んでいます。', exampleReading: 'いでんしけんきゅうがすすんでいます。', exampleMeaning: 'Nghiên cứu gen đang tiến triển.' },
      { term: '素粒子', pronunciation: 'そりゅうし', meaning: 'hạt cơ bản', example: '素粒子物理学を研究しています。', exampleReading: 'そりゅうしぶつりがくをけんきゅうしています。', exampleMeaning: 'Nghiên cứu vật lý hạt cơ bản.' },
      { term: '合成する', pronunciation: 'ごうせいする', meaning: 'tổng hợp', example: '人工タンパク質を合成しました。', exampleReading: 'じんこうタンパクしつをごうせいしました。', exampleMeaning: 'Tổng hợp protein nhân tạo.' },
      { term: '触媒', pronunciation: 'しょくばい', meaning: 'chất xúc tác', example: '新しい触媒を開発しました。', exampleReading: 'あたらしいしょくばいをかいはつしました。', exampleMeaning: 'Phát triển chất xúc tác mới.' },
      { term: '熱力学', pronunciation: 'ねつりきがく', meaning: 'nhiệt động lực học', example: '熱力学の法則を学びます。', exampleReading: 'ねつりきがくのほうそくをまなびます。', exampleMeaning: 'Học các định luật nhiệt động lực học.' },
      { term: '臨界点', pronunciation: 'りんかいてん', meaning: 'điểm tới hạn', example: '臨界点を超えると変化が起きます。', exampleReading: 'りんかいてんをこえるとへんかがおきます。', exampleMeaning: 'Vượt qua điểm tới hạn thì sự biến đổi xảy ra.' },
    ],
    grammar: [
      { pattern: '～に先立って', meaning: 'trước khi ~, trước tiên ~', usage: 'Làm một việc trước khi sự kiện chính diễn ra.', example: '本公演に先立って、リハーサルを行います。', exampleReading: 'ほんこうえんにさきだって、リハーサルをおこないます。', exampleMeaning: 'Trước buổi diễn chính, sẽ tiến hành tổng duyệt.' },
      { pattern: '～を皮切りに', meaning: 'bắt đầu từ ~', usage: 'Nêu sự kiện đầu tiên như điểm khởi đầu của chuỗi sự kiện.', example: '東京を皮切りに、全国ツアーを始めます。', exampleReading: 'とうきょうをかわきりに、ぜんこくツアーをはじめます。', exampleMeaning: 'Bắt đầu từ Tokyo, khởi động tour toàn quốc.' },
      { pattern: '～ことなく', meaning: 'mà không ~, không cần ~', usage: 'Hành động được thực hiện mà không có điều nêu trước.', example: '諦めることなく、挑戦し続けます。', exampleReading: 'あきらめることなく、ちょうせんしつづけます。', exampleMeaning: 'Tiếp tục thách thức mà không bỏ cuộc.' },
    ],
  },
  {
    title: 'Unit 5 — Nghệ thuật & mỹ học',
    description: 'Từ vựng mỹ học; Ngữ pháp ～というより～, ～ないではすまない.',
    vocab: [
      { term: '崇高な', pronunciation: 'すうこうな', meaning: 'cao quý,숭고한', example: '崇高な精神を持つ芸術家です。', exampleReading: 'すうこうなせいしんをもつげいじゅつかです。', exampleMeaning: 'Nghệ sĩ có tinh thần cao quý.' },
      { term: '巧みな', pronunciation: 'たくみな', meaning: 'khéo léo, tinh xảo', example: '巧みな表現で人を引き付けます。', exampleReading: 'たくみなひょうげんでひとをひきつけます。', exampleMeaning: 'Thu hút người khác bằng lối diễn đạt khéo léo.' },
      { term: '斬新な', pronunciation: 'ざんしんな', meaning: 'mới mẻ, độc đáo', example: '斬新なデザインが話題になりました。', exampleReading: 'ざんしんなデザインがわだいになりました。', exampleMeaning: 'Thiết kế độc đáo đang là chủ đề bàn tán.' },
      { term: '余韻', pronunciation: 'よいん', meaning: 'dư âm, dư vị', example: '映画の余韻が残っています。', exampleReading: 'えいがのよいんがのこっています。', exampleMeaning: 'Dư âm của bộ phim vẫn còn đó.' },
      { term: '洗練された', pronunciation: 'せんれんされた', meaning: 'tinh tế, thanh lịch', example: '洗練されたデザインが好みです。', exampleReading: 'せんれんされたデザインがこのみです。', exampleMeaning: 'Tôi thích thiết kế tinh tế.' },
      { term: '陳腐な', pronunciation: 'ちんぷな', meaning: 'cũ rích, nhàm chán', example: '陳腐な表現は避けましょう。', exampleReading: 'ちんぷなひょうげんはさけましょう。', exampleMeaning: 'Hãy tránh cách diễn đạt nhàm chán.' },
      { term: '幽玄な', pronunciation: 'ゆうげんな', meaning: 'huyền diệu, sâu xa', example: '能楽の幽玄な世界に魅了されました。', exampleReading: 'のうがくのゆうげんなせかいにみりょうされました。', exampleMeaning: 'Bị mê hoặc bởi thế giới huyền diệu của Noh.' },
    ],
    grammar: [
      { pattern: '～というより', meaning: 'đúng hơn là ~ / không hẳn là ~ mà ~', usage: 'Điều chỉnh hay bổ sung định nghĩa, đánh giá.', example: 'これは忙しいというより、楽しいです。', exampleReading: 'これはいそがしいというより、たのしいです。', exampleMeaning: 'Điều này đúng hơn là vui chứ không phải bận rộn.' },
      { pattern: '～ないではすまない', meaning: 'không thể không ~, buộc phải ~', usage: 'Sức ép đạo đức hoặc xã hội buộc phải làm.', example: '謝らないではすまない状況です。', exampleReading: 'あやまらないではすまないじょうきょうです。', exampleMeaning: 'Đây là tình huống không thể không xin lỗi.' },
      { pattern: '～と相まって', meaning: 'kết hợp với ~, cộng với ~', usage: 'Hai yếu tố kết hợp tạo ra hiệu quả tổng hợp.', example: '才能と努力と相まって、成功しました。', exampleReading: 'さいのうとどりょくとあいまって、せいこうしました。', exampleMeaning: 'Tài năng kết hợp với sự cố gắng đã dẫn đến thành công.' },
    ],
  },
  {
    title: 'Unit 6 — Y học & công nghệ sinh học',
    description: 'Từ vựng y sinh; Ngữ pháp ～ゆえに, ～に足る.',
    vocab: [
      { term: '免疫', pronunciation: 'めんえき', meaning: 'miễn dịch', example: '免疫力を高めるために食事に気をつけます。', exampleReading: 'めんえきりょくをたかめるためにしょくじにきをつけます。', exampleMeaning: 'Chú ý ăn uống để nâng cao sức đề kháng.' },
      { term: '細胞', pronunciation: 'さいぼう', meaning: 'tế bào', example: '幹細胞の研究が進んでいます。', exampleReading: 'かんさいぼうのけんきゅうがすすんでいます。', exampleMeaning: 'Nghiên cứu tế bào gốc đang tiến triển.' },
      { term: 'ゲノム', pronunciation: 'ゲノム', meaning: 'bộ gen (genome)', example: 'ゲノム解析技術が発展しました。', exampleReading: 'ゲノムかいせきぎじゅつがはってんしました。', exampleMeaning: 'Kỹ thuật phân tích genome phát triển.' },
      { term: '臨床試験', pronunciation: 'りんしょうしけん', meaning: 'thử nghiệm lâm sàng', example: '新薬の臨床試験を実施しています。', exampleReading: 'しんやくのりんしょうしけんをじっしています。', exampleMeaning: 'Đang thực hiện thử nghiệm lâm sàng thuốc mới.' },
      { term: '再生医療', pronunciation: 'さいせいいりょう', meaning: 'y học tái tạo', example: '再生医療は多くの患者を救えます。', exampleReading: 'さいせいいりょうはおおくのかんじゃをすくえます。', exampleMeaning: 'Y học tái tạo có thể cứu được nhiều bệnh nhân.' },
      { term: 'バイオテクノロジー', pronunciation: 'バイオテクノロジー', meaning: 'công nghệ sinh học', example: 'バイオテクノロジーが農業を変えます。', exampleReading: 'バイオテクノロジーがのうぎょうをかえます。', exampleMeaning: 'Công nghệ sinh học thay đổi nông nghiệp.' },
      { term: '抗体', pronunciation: 'こうたい', meaning: 'kháng thể', example: '抗体検査を受けました。', exampleReading: 'こうたいけんさをうけました。', exampleMeaning: 'Xét nghiệm kháng thể.' },
    ],
    grammar: [
      { pattern: '～ゆえに', meaning: 'chính vì ~, do ~', usage: 'Nêu nguyên nhân, mang sắc thái trang trọng hay văn học.', example: '若さゆえに、多くの過ちを犯します。', exampleReading: 'わかさゆえに、おおくのあやまちをおかします。', exampleMeaning: 'Chính vì còn trẻ nên phạm nhiều sai lầm.' },
      { pattern: '～に足る', meaning: 'đáng ~, xứng đáng ~', usage: 'Đủ tiêu chuẩn để làm điều gì.', example: '信頼するに足る人物です。', exampleReading: 'しんらいするにたるじんぶつです。', exampleMeaning: 'Là người đáng tin tưởng.' },
      { pattern: '～ないとも限らない', meaning: 'cũng không phải là không ~, có thể ~', usage: 'Không loại trừ khả năng.', example: '技術が進歩すれば、実現しないとも限らない。', exampleReading: 'ぎじゅつがしんぽすれば、じつげんしないともかぎらない。', exampleMeaning: 'Nếu công nghệ tiến bộ, cũng không phải không thể thực hiện được.' },
    ],
  },
  {
    title: 'Unit 7 — Ngoại giao & quan hệ quốc tế',
    description: 'Từ vựng ngoại giao; Ngữ pháp ～をよそに, ～かたわら.',
    vocab: [
      { term: '外交', pronunciation: 'がいこう', meaning: 'ngoại giao', example: '外交問題が表面化しました。', exampleReading: 'がいこうもんだいがひょうめんかしました。', exampleMeaning: 'Vấn đề ngoại giao nổi lên.' },
      { term: '条約', pronunciation: 'じょうやく', meaning: 'hiệp ước', example: '平和条約が締結されました。', exampleReading: 'へいわじょうやくがていけつされました。', exampleMeaning: 'Hiệp ước hòa bình được ký kết.' },
      { term: '制裁', pronunciation: 'せいさい', meaning: 'trừng phạt, cấm vận', example: '経済制裁が発動されました。', exampleReading: 'けいざいせいさいがはつどうされました。', exampleMeaning: 'Cấm vận kinh tế được áp dụng.' },
      { term: '覇権', pronunciation: 'はけん', meaning: 'bá quyền, bá chủ', example: '覇権争いが激化しています。', exampleReading: 'はけんあらそいがげきかしています。', exampleMeaning: 'Cuộc tranh giành bá quyền đang leo thang.' },
      { term: '和平交渉', pronunciation: 'わへいこうしょう', meaning: 'đàm phán hòa bình', example: '和平交渉が再開されました。', exampleReading: 'わへいこうしょうがさいかいされました。', exampleMeaning: 'Đàm phán hòa bình được nối lại.' },
      { term: '多国間', pronunciation: 'たこくかん', meaning: 'đa phương', example: '多国間協議が開かれました。', exampleReading: 'たこくかんきょうぎがひらかれました。', exampleMeaning: 'Hội nghị đa phương được mở.' },
      { term: '拒否権', pronunciation: 'きょひけん', meaning: 'quyền phủ quyết', example: '安保理で拒否権が行使されました。', exampleReading: 'あんぽりできょひけんがこうしされました。', exampleMeaning: 'Quyền phủ quyết được sử dụng tại Hội đồng Bảo an.' },
    ],
    grammar: [
      { pattern: '～をよそに', meaning: 'bất chấp ~, không màng đến ~', usage: 'Bỏ qua hay không để ý đến điều gì đó.', example: '周囲の心配をよそに、彼は旅立ちました。', exampleReading: 'しゅういのしんぱいをよそに、かれはたびだちました。', exampleMeaning: 'Bất chấp lo lắng của mọi người xung quanh, anh ấy lên đường.' },
      { pattern: '～かたわら', meaning: 'trong khi ~ / bên cạnh việc ~', usage: 'Làm việc phụ bên cạnh công việc chính.', example: '仕事のかたわら、ボランティアをしています。', exampleReading: 'しごとのかたわら、ボランティアをしています。', exampleMeaning: 'Bên cạnh công việc, tôi còn làm tình nguyện.' },
      { pattern: '～あっての', meaning: 'nhờ có ~ mà mới ~', usage: 'Nhấn mạnh sự không thể thiếu của điều đã nêu.', example: '信頼あっての関係です。', exampleReading: 'しんらいあってのかんけいです。', exampleMeaning: 'Quan hệ này tồn tại nhờ có sự tin tưởng.' },
    ],
  },
  {
    title: 'Unit 8 — Văn học & ngôn ngữ học',
    description: 'Từ vựng ngôn ngữ và văn học; Ngữ pháp ～にして, ～とは裏腹に.',
    vocab: [
      { term: '言語学', pronunciation: 'げんごがく', meaning: 'ngôn ngữ học', example: '言語学者が方言を研究しています。', exampleReading: 'げんごがくしゃがほうげんをけんきゅうしています。', exampleMeaning: 'Nhà ngôn ngữ học nghiên cứu phương ngữ.' },
      { term: '比喩', pronunciation: 'ひゆ', meaning: 'ẩn dụ, so sánh', example: '詩には多くの比喩が使われています。', exampleReading: 'しにはおおくのひゆがつかわれています。', exampleMeaning: 'Thơ sử dụng nhiều ẩn dụ.' },
      { term: '語源', pronunciation: 'ごげん', meaning: 'nguồn gốc từ ngữ', example: 'この言葉の語源はラテン語です。', exampleReading: 'このことばのごげんはラテンごです。', exampleMeaning: 'Nguồn gốc của từ này là tiếng Latin.' },
      { term: '翻訳する', pronunciation: 'ほんやくする', meaning: 'dịch thuật', example: '日本文学を英語に翻訳しました。', exampleReading: 'にほんぶんがくをえいごにほんやくしました。', exampleMeaning: 'Dịch văn học Nhật sang tiếng Anh.' },
      { term: '含蓄', pronunciation: 'がんちく', meaning: 'hàm súc, ý nghĩa sâu xa', example: '含蓄のある言葉が心に残ります。', exampleReading: 'がんちくのあることばがこころにのこります。', exampleMeaning: 'Những lời hàm súc đọng lại trong lòng.' },
      { term: '曖昧さ', pronunciation: 'あいまいさ', meaning: 'sự mơ hồ', example: '日本語の曖昧さが翻訳を難しくします。', exampleReading: 'にほんごのあいまいさがほんやくをむずかしくします。', exampleMeaning: 'Sự mơ hồ của tiếng Nhật làm cho việc dịch trở nên khó khăn.' },
      { term: '文体', pronunciation: 'ぶんたい', meaning: 'văn phong, phong cách văn', example: '著者の文体が独特です。', exampleReading: 'ちょしゃのぶんたいがどくとくです。', exampleMeaning: 'Văn phong của tác giả rất độc đáo.' },
    ],
    grammar: [
      { pattern: '～にして', meaning: '(ở tư cách/vị trí) ~ mà / chính là ~', usage: 'Nhấn mạnh vào tư cách hoặc bản thân của điều đó.', example: '天才にして努力家の彼女に感動します。', exampleReading: 'てんさいにしてどりょくかのかのじょにかんどうします。', exampleMeaning: 'Cảm phục cô ấy — vừa là thiên tài vừa là người nỗ lực.' },
      { pattern: '～とは裏腹に', meaning: 'trái ngược với ~, nghịch lại với ~', usage: 'Diễn đạt sự tương phản giữa kỳ vọng và thực tế.', example: '見た目とは裏腹に、彼は優しい人です。', exampleReading: 'みためとはうらはらに、かれはやさしいひとです。', exampleMeaning: 'Trái với vẻ ngoài, anh ấy là người tử tế.' },
      { pattern: '～ながら（逆接）', meaning: 'tuy ~, dù ~ (mà vẫn)', usage: 'Nhượng bộ — chỉ sự tương phản.', example: '知りながら、黙っていました。', exampleReading: 'しりながら、だまっていました。', exampleMeaning: 'Dù biết mà vẫn giữ im lặng.' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Shared helper
// ─────────────────────────────────────────────────────────────────────────────
async function upsertLevelData(
  levelCode: string,
  lessons: Lesson[],
  vocabBookName: string,
  grammarBookName: string,
) {
  const level = await prisma.level.findUnique({ where: { code: levelCode } });
  if (!level) return { error: `Level ${levelCode} not found. Run base seed first.` };

  let lessonTotal = 0;
  let itemTotal = 0;

  for (const [skill, catSuffix, bookName] of [
    ['vocab',   'vocab',   vocabBookName],
    ['grammar', 'grammar', grammarBookName],
  ] as const) {
    const catId = `mimikara-${levelCode.toLowerCase()}-${catSuffix}`;

    await prisma.learningCategory.upsert({
      where: { id: catId },
      create: {
        id: catId,
        levelId: level.id,
        skill,
        name: `${skill === 'vocab' ? 'Từ vựng' : 'Ngữ pháp'} ${levelCode} — ${bookName}`,
        description: `${skill === 'vocab' ? 'Từ vựng' : 'Ngữ pháp'} ${levelCode} theo giáo trình ${bookName}.`,
        icon: skill === 'vocab' ? '📗' : '📘',
        order: skill === 'vocab' ? 1 : 2,
      },
      update: {},
    });

    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];
      const items = skill === 'vocab' ? lesson.vocab : lesson.grammar;
      if (items.length === 0) continue;

      const lessonId = `mimikara-${levelCode.toLowerCase()}-${catSuffix[0]}-${i + 1}`;

      await prisma.learningLesson.upsert({
        where: { id: lessonId },
        create: {
          id: lessonId,
          categoryId: catId,
          title: lesson.title,
          description: lesson.description,
          type: skill === 'vocab' ? 'vocab' : 'grammar',
          order: i + 1,
        },
        update: { title: lesson.title, description: lesson.description },
      });

      await prisma.content.deleteMany({ where: { lessonId } });

      if (skill === 'vocab') {
        const createdItems = await prisma.content.createManyAndReturn({
          data: lesson.vocab.map((w, idx) => ({
            lessonId, type: 'vocab', language: 'ja',
            term: w.term, pronunciation: w.pronunciation ?? null, order: idx + 1,
          })),
        });
        await prisma.contentMeaning.createMany({
          data: createdItems.map((c, idx) => ({ contentId: c.id, language: 'vi', meaning: lesson.vocab[idx].meaning })),
        });
        const examples = createdItems
          .map((c, idx) => ({ c, w: lesson.vocab[idx] }))
          .filter(({ w }) => w.example)
          .map(({ c, w }) => ({ contentId: c.id, exampleText: w.example!, translation: w.exampleMeaning ?? null, language: 'ja' as Language, translationLanguage: w.exampleMeaning ? 'vi' as Language : null }));
        if (examples.length > 0) await prisma.contentExample.createMany({ data: examples });
        itemTotal += createdItems.length;
      } else {
        const createdItems = await prisma.content.createManyAndReturn({
          data: lesson.grammar.map((g, idx) => ({
            lessonId, type: 'grammar', language: 'ja',
            term: g.pattern, pronunciation: null, order: idx + 1,
          })),
        });
        await prisma.contentMeaning.createMany({
          data: createdItems.map((c, idx) => ({ contentId: c.id, language: 'vi', meaning: lesson.grammar[idx].meaning })),
        });
        const examples = createdItems
          .map((c, idx) => ({ c, g: lesson.grammar[idx] }))
          .filter(({ g }) => g.example)
          .map(({ c, g }) => ({ contentId: c.id, exampleText: g.example!, translation: g.exampleMeaning ?? null, language: 'ja' as Language, translationLanguage: g.exampleMeaning ? 'vi' as Language : null }));
        if (examples.length > 0) await prisma.contentExample.createMany({ data: examples });
        itemTotal += createdItems.length;
      }

      lessonTotal++;
    }
  }

  return { lessonTotal, itemTotal };
}

// ─────────────────────────────────────────────────────────────────────────────
// Route handler
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ message: 'Không có quyền.' }, { status: 403 });
  }

  // Support seeding a specific level via query param ?level=N3|N2|N1|all
  const { searchParams } = new URL(req.url);
  const target = searchParams.get('level') ?? 'all';

  const results: string[] = [];

  try {
    if (target === 'N3' || target === 'all') {
      const r = await upsertLevelData('N3', MIMIKARA_N3, 'Mimikara Oboeru N3 Goi', 'Shin Kanzen Master N3');
      if ('error' in r) return NextResponse.json({ message: r.error }, { status: 400 });
      results.push(`N3: ${r.lessonTotal} bài, ${r.itemTotal} mục`);
    }

    if (target === 'N2' || target === 'all') {
      const r = await upsertLevelData('N2', MIMIKARA_N2, 'Mimikara Oboeru N2 Goi', 'Shin Kanzen Master N2');
      if ('error' in r) return NextResponse.json({ message: r.error }, { status: 400 });
      results.push(`N2: ${r.lessonTotal} bài, ${r.itemTotal} mục`);
    }

    if (target === 'N1' || target === 'all') {
      const r = await upsertLevelData('N1', MIMIKARA_N1, 'Mimikara Oboeru N1 Goi', 'Shin Kanzen Master N1');
      if ('error' in r) return NextResponse.json({ message: r.error }, { status: 400 });
      results.push(`N1: ${r.lessonTotal} bài, ${r.itemTotal} mục`);
    }

    return NextResponse.json({
      message: `✅ Seed Mimikara thành công! ${results.join(' | ')}`,
    });
  } catch (e: any) {
    return NextResponse.json({ message: e.message ?? 'Lỗi server.' }, { status: 500 });
  }
}
