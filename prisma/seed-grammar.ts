import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const patterns: Array<{
  lang: string;
  levelCode: string;
  pattern: string;
  reading?: string;
  meaning: string;
  example: string;
  exampleReading?: string;
  exampleVi: string;
  searchIn: string;
  order: number;
}> = [
  // ─── Japanese N5 ──────────────────────────────────────────────────────────
  { lang: 'ja', levelCode: 'N5', order: 1,  searchIn: 'ます',            pattern: '〜ます',              reading: '〜ます',              meaning: 'Thể lịch sự (hiện tại / tương lai)',              example: '毎朝６時に起きます。',              exampleReading: 'まいあさろくじにおきます。',          exampleVi: 'Tôi thức dậy lúc 6 giờ sáng.' },
  { lang: 'ja', levelCode: 'N5', order: 2,  searchIn: 'ません',           pattern: '〜ません',            reading: '〜ません',            meaning: 'Phủ định lịch sự',                               example: 'お酒は飲みません。',                exampleReading: 'おさけはのみません。',                exampleVi: 'Tôi không uống rượu.' },
  { lang: 'ja', levelCode: 'N5', order: 3,  searchIn: 'ましょう',         pattern: '〜ましょう',          reading: '〜ましょう',          meaning: 'Đề nghị cùng làm ~',                             example: '一緒に行きましょう。',              exampleReading: 'いっしょにいきましょう。',             exampleVi: 'Hãy cùng đi nào.' },
  { lang: 'ja', levelCode: 'N5', order: 4,  searchIn: 'ましょうか',       pattern: '〜ましょうか',        reading: '〜ましょうか',        meaning: 'Để tôi làm ~ cho / Chúng ta ~ nhé?',             example: '窓を開けましょうか。',              exampleReading: 'まどをあけましょうか。',               exampleVi: 'Để tôi mở cửa sổ nhé?' },
  { lang: 'ja', levelCode: 'N5', order: 5,  searchIn: 'てください',       pattern: '〜てください',        reading: '〜てください',        meaning: 'Xin hãy làm ~',                                  example: 'ここに名前を書いてください。',      exampleReading: 'ここになまえをかいてください。',       exampleVi: 'Xin hãy viết tên vào đây.' },
  { lang: 'ja', levelCode: 'N5', order: 6,  searchIn: 'ています',         pattern: '〜ています',          reading: '〜ています',          meaning: 'Đang làm ~ / trạng thái kết quả',                example: '今、勉強しています。',              exampleReading: 'いま、べんきょうしています。',         exampleVi: 'Bây giờ tôi đang học.' },
  { lang: 'ja', levelCode: 'N5', order: 7,  searchIn: 'ませんか',         pattern: '〜ませんか',          reading: '〜ませんか',          meaning: 'Mời / Bạn có muốn ~ không?',                     example: '一緒に食べませんか。',              exampleReading: 'いっしょにたべませんか。',             exampleVi: 'Bạn có muốn ăn cùng không?' },
  { lang: 'ja', levelCode: 'N5', order: 8,  searchIn: 'でしょうか',       pattern: '〜でしょうか',        reading: '〜でしょうか',        meaning: 'Bạn có biết ~ không? (hỏi lịch sự)',             example: 'すみません、駅はどこでしょうか。', exampleReading: 'すみません、えきはどこでしょうか。',  exampleVi: 'Xin hỏi, ga tàu ở đâu ạ?' },
  { lang: 'ja', levelCode: 'N5', order: 9,  searchIn: 'ないでください',   pattern: '〜ないでください',    reading: '〜ないでください',    meaning: 'Xin đừng làm ~',                                 example: 'ここで写真を撮らないでください。', exampleReading: 'ここでしゃしんをとらないでください。', exampleVi: 'Xin đừng chụp ảnh ở đây.' },
  { lang: 'ja', levelCode: 'N5', order: 10, searchIn: 'たいです',         pattern: '〜たいです',          reading: '〜たいです',          meaning: 'Muốn làm ~ (người nói)',                          example: '日本に行きたいです。',              exampleReading: 'にほんにいきたいです。',               exampleVi: 'Tôi muốn đi Nhật.' },

  // ─── Japanese N4 ──────────────────────────────────────────────────────────
  { lang: 'ja', levelCode: 'N4', order: 1,  searchIn: 'てもいいですか',       pattern: '〜てもいいですか',       reading: '〜てもいいですか',       meaning: 'Tôi có thể ~ được không?',               example: 'ここに座ってもいいですか。',          exampleReading: 'ここにすわってもいいですか。',          exampleVi: 'Tôi có thể ngồi đây không?' },
  { lang: 'ja', levelCode: 'N4', order: 2,  searchIn: 'なければなりません',   pattern: '〜なければなりません',   reading: '〜なければなりません',   meaning: 'Phải làm ~',                             example: '薬を飲まなければなりません。',        exampleReading: 'くすりをのまなければなりません。',      exampleVi: 'Tôi phải uống thuốc.' },
  { lang: 'ja', levelCode: 'N4', order: 3,  searchIn: 'なくてもいいです',     pattern: '〜なくてもいいです',     reading: '〜なくてもいいです',     meaning: 'Không cần phải ~',                       example: '急がなくてもいいですよ。',            exampleReading: 'いそがなくてもいいですよ。',            exampleVi: 'Bạn không cần phải vội đâu.' },
  { lang: 'ja', levelCode: 'N4', order: 4,  searchIn: 'てしまいました',       pattern: '〜てしまう',             reading: '〜てしまう',             meaning: 'Lỡ làm ~ / làm xong (hối tiếc)',         example: '財布を忘れてしまいました。',          exampleReading: 'さいふをわすれてしまいました。',        exampleVi: 'Tôi đã lỡ quên ví mất rồi.' },
  { lang: 'ja', levelCode: 'N4', order: 5,  searchIn: 'ことができます',       pattern: '〜ことができます',       reading: '〜ことができます',       meaning: 'Có thể làm ~',                           example: '私はピアノを弾くことができます。',    exampleReading: 'わたしはピアノをひくことができます。',  exampleVi: 'Tôi có thể chơi đàn piano.' },
  { lang: 'ja', levelCode: 'N4', order: 6,  searchIn: 'そうです',             pattern: '〜そうです',             reading: '〜そうです',             meaning: 'Có vẻ ~ (cảm quan)',                     example: 'この料理はおいしそうです。',          exampleReading: 'このりょうりはおいしそうです。',        exampleVi: 'Món ăn này trông có vẻ ngon.' },
  { lang: 'ja', levelCode: 'N4', order: 7,  searchIn: 'ために',               pattern: '〜ために',               reading: '〜ために',               meaning: 'Để làm ~ / vì ~',                        example: '健康のために運動します。',            exampleReading: 'けんこうのためにうんどうします。',      exampleVi: 'Tôi tập thể dục để giữ sức khỏe.' },
  { lang: 'ja', levelCode: 'N4', order: 8,  searchIn: 'ながら',               pattern: '〜ながら',               reading: '〜ながら',               meaning: 'Vừa ~ vừa ~ (hai hành động đồng thời)', example: '音楽を聴きながら勉強します。',        exampleReading: 'おんがくをききながらべんきょうします。', exampleVi: 'Vừa nghe nhạc vừa học.' },
  { lang: 'ja', levelCode: 'N4', order: 9,  searchIn: 'てから',               pattern: '〜てから',               reading: '〜てから',               meaning: 'Sau khi ~ rồi mới ~',                    example: 'ご飯を食べてから出かけます。',        exampleReading: 'ごはんをたべてからでかけます。',        exampleVi: 'Ăn cơm xong rồi mới đi.' },

  // ─── Japanese N3 ──────────────────────────────────────────────────────────
  { lang: 'ja', levelCode: 'N3', order: 1, searchIn: 'ようにしています',  pattern: '〜ようにする',    reading: '〜ようにする',     meaning: 'Cố gắng để ~ (thói quen)',                     example: '毎日運動するようにしています。',         exampleReading: 'まいにちうんどうするようにしています。',  exampleVi: 'Tôi cố gắng tập thể dục mỗi ngày.' },
  { lang: 'ja', levelCode: 'N3', order: 2, searchIn: 'ばかり',            pattern: '〜ばかり',        reading: '〜ばかり',         meaning: 'Chỉ toàn ~ / vừa mới ~',                       example: '彼は文句ばかり言う。',                   exampleReading: 'かれはもんくばかりいう。',                exampleVi: 'Anh ấy chỉ toàn phàn nàn.' },
  { lang: 'ja', levelCode: 'N3', order: 3, searchIn: 'ことになりました',   pattern: '〜ことになる',    reading: '〜ことになる',     meaning: 'Sẽ xảy ra / được quyết định (khách quan)',     example: '来月大阪に転勤することになりました。', exampleReading: undefined,                                 exampleVi: 'Tháng tới tôi sẽ chuyển công tác đến Osaka.' },
  { lang: 'ja', levelCode: 'N3', order: 4, searchIn: 'やすい',            pattern: '〜やすい',        reading: '〜やすい',         meaning: 'Dễ làm ~',                                      example: 'このペンは書きやすい。',                 exampleReading: 'このペンはかきやすい。',                  exampleVi: 'Cây bút này dễ viết.' },
  { lang: 'ja', levelCode: 'N3', order: 5, searchIn: 'にくい',            pattern: '〜にくい',        reading: '〜にくい',         meaning: 'Khó làm ~',                                     example: 'この漢字は読みにくい。',                 exampleReading: 'このかんじはよみにくい。',                exampleVi: 'Chữ Hán này khó đọc.' },
  { lang: 'ja', levelCode: 'N3', order: 6, searchIn: 'らしい',            pattern: '〜らしい',        reading: '〜らしい',         meaning: 'Nghe nói ~ / có vẻ ~ (suy đoán từ thông tin)', example: '明日は雨らしいです。',                   exampleReading: 'あしたはあめらしいです。',                exampleVi: 'Nghe nói ngày mai trời mưa.' },
  { lang: 'ja', levelCode: 'N3', order: 7, searchIn: 'はずです',          pattern: '〜はずです',      reading: '〜はずです',       meaning: 'Hẳn là ~ (kỳ vọng logic)',                     example: '彼女はもう着いているはずです。',         exampleReading: 'かのじょはもうついているはずです。',      exampleVi: 'Chắc chắn cô ấy đã đến rồi.' },
  { lang: 'ja', levelCode: 'N3', order: 8, searchIn: 'ようとしています',  pattern: '〜ようとする',    reading: '〜ようとする',     meaning: 'Cố gắng / sắp ~',                              example: '新しい仕事を始めようとしています。',     exampleReading: undefined,                                 exampleVi: 'Tôi đang cố gắng bắt đầu công việc mới.' },
  { lang: 'ja', levelCode: 'N3', order: 9, searchIn: 'てみます',          pattern: '〜てみる',        reading: '〜てみる',         meaning: 'Thử làm ~',                                     example: 'このレストランで食べてみます。',         exampleReading: 'このレストランでたべてみます。',          exampleVi: 'Tôi sẽ thử ăn ở nhà hàng này.' },

  // ─── Japanese N2 ──────────────────────────────────────────────────────────
  { lang: 'ja', levelCode: 'N2', order: 1, searchIn: 'にもかかわらず', pattern: '〜にもかかわらず', reading: '〜にもかかわらず', meaning: 'Mặc dù ~ nhưng (tương phản mạnh)',       example: '雨にもかかわらず大勢来た。',          exampleReading: undefined, exampleVi: 'Mặc dù trời mưa nhưng nhiều người đã đến.' },
  { lang: 'ja', levelCode: 'N2', order: 2, searchIn: 'をきっかけに',   pattern: '〜をきっかけに',  reading: '〜をきっかけに',  meaning: 'Lấy ~ làm cơ hội/duyên cớ',             example: '留学をきっかけに日本語を学んだ。',    exampleReading: undefined, exampleVi: 'Nhờ việc du học mà tôi bắt đầu học tiếng Nhật.' },
  { lang: 'ja', levelCode: 'N2', order: 3, searchIn: 'に過ぎない',     pattern: '〜に過ぎない',    reading: '〜にすぎない',     meaning: 'Chẳng qua chỉ là ~',                    example: 'これは推測に過ぎない。',              exampleReading: undefined, exampleVi: 'Đây chỉ là dự đoán mà thôi.' },
  { lang: 'ja', levelCode: 'N2', order: 4, searchIn: 'わけだ',         pattern: '〜わけだ',         reading: '〜わけだ',         meaning: 'Có nghĩa là ~ / đương nhiên ~',          example: '5年も勉強したんだから、上手なわけだ。', exampleReading: undefined, exampleVi: 'Đã học 5 năm nên giỏi là đương nhiên.' },
  { lang: 'ja', levelCode: 'N2', order: 5, searchIn: 'わけです',       pattern: '〜わけです',       reading: '〜わけです',       meaning: 'Có nghĩa là ~ / tất nhiên ~ (lịch sự)', example: '毎日練習したから上手になったわけです。', exampleReading: undefined, exampleVi: 'Luyện tập hàng ngày nên tất nhiên giỏi lên rồi.' },
  { lang: 'ja', levelCode: 'N2', order: 6, searchIn: 'ざるを得ない',   pattern: '〜ざるを得ない',  reading: '〜ざるをえない',   meaning: 'Không thể không ~ / buộc phải ~',        example: '認めざるを得ない。',                  exampleReading: undefined, exampleVi: 'Không thể không thừa nhận.' },
  { lang: 'ja', levelCode: 'N2', order: 7, searchIn: 'に違いない',     pattern: '〜に違いない',    reading: '〜にちがいない',   meaning: 'Chắc chắn là ~ (khẳng định mạnh)',      example: '彼女は知っているに違いない。',        exampleReading: undefined, exampleVi: 'Chắc chắn cô ấy biết rồi.' },
  { lang: 'ja', levelCode: 'N2', order: 8, searchIn: 'せいで',         pattern: '〜せいで',         reading: '〜せいで',         meaning: 'Do ~, vì ~ (mang ý tiêu cực)',           example: '雨のせいで試合が中止になった。',      exampleReading: undefined, exampleVi: 'Do mưa nên trận đấu bị hủy.' },

  // ─── Japanese N1 ──────────────────────────────────────────────────────────
  { lang: 'ja', levelCode: 'N1', order: 1, searchIn: 'にほかならない',  pattern: '〜にほかならない',  reading: '〜にほかならない',  meaning: 'Chính là ~ (nhấn mạnh)',             example: '成功は努力の結果にほかならない。',     exampleReading: undefined, exampleVi: 'Thành công chính là kết quả của nỗ lực.' },
  { lang: 'ja', levelCode: 'N1', order: 2, searchIn: 'を余儀なく',      pattern: '〜を余儀なくされる', reading: '〜をよぎなくされる', meaning: 'Bị buộc phải ~',                    example: '台風で試合は中止を余儀なくされた。', exampleReading: undefined, exampleVi: 'Trận đấu bị buộc phải dừng lại do bão.' },
  { lang: 'ja', levelCode: 'N1', order: 3, searchIn: 'いかんによっては', pattern: '〜いかんによっては', reading: '〜いかんによっては', meaning: 'Tùy theo ~',                         example: 'やり方いかんによっては成功する。',    exampleReading: undefined, exampleVi: 'Tùy cách làm mà có thể thành công.' },
  { lang: 'ja', levelCode: 'N1', order: 4, searchIn: 'ともなると',      pattern: '〜ともなると',      reading: '〜ともなると',      meaning: 'Khi đã đến tầm/mức ~',               example: 'プロともなると技術が違う。',          exampleReading: undefined, exampleVi: 'Đến tầm chuyên nghiệp thì kỹ thuật khác hẳn.' },
  { lang: 'ja', levelCode: 'N1', order: 5, searchIn: 'かねない',        pattern: '〜かねない',        reading: '〜かねない',        meaning: 'Có thể xảy ra điều không hay ~',     example: 'このままでは倒産しかねない。',        exampleReading: undefined, exampleVi: 'Cứ như vậy có thể sẽ phá sản mất.' },
  { lang: 'ja', levelCode: 'N1', order: 6, searchIn: 'をもって',        pattern: '〜をもって',        reading: '〜をもって',        meaning: 'Bằng ~ / Vào ~ (thời điểm kết thúc)', example: '本日をもって閉店いたします。',        exampleReading: undefined, exampleVi: 'Cửa hàng chúng tôi sẽ đóng cửa kể từ hôm nay.' },

  // ─── Chinese HSK1 ─────────────────────────────────────────────────────────
  { lang: 'zh', levelCode: 'HSK1', order: 1, searchIn: '是', pattern: '是 (shì)',  meaning: 'Là',                                        example: '我是学生。',          exampleVi: 'Tôi là học sinh.' },
  { lang: 'zh', levelCode: 'HSK1', order: 2, searchIn: '吗', pattern: '吗 (ma)',   meaning: 'Câu hỏi Yes/No (cuối câu)',                 example: '你是老师吗？',        exampleVi: 'Bạn có phải là giáo viên không?' },
  { lang: 'zh', levelCode: 'HSK1', order: 3, searchIn: '不', pattern: '不 (bù)',   meaning: 'Phủ định',                                  example: '我不喝咖啡。',        exampleVi: 'Tôi không uống cà phê.' },
  { lang: 'zh', levelCode: 'HSK1', order: 4, searchIn: '有', pattern: '有 (yǒu)',  meaning: 'Có (sở hữu/tồn tại)',                       example: '我有一个朋友。',      exampleVi: 'Tôi có một người bạn.' },
  { lang: 'zh', levelCode: 'HSK1', order: 5, searchIn: '呢', pattern: '呢 (ne)',   meaning: 'Còn ~ thì sao? (hỏi ngược)',               example: '我很好，你呢？',      exampleVi: 'Tôi ổn lắm, còn bạn thì sao?' },

  // ─── Chinese HSK2 ─────────────────────────────────────────────────────────
  { lang: 'zh', levelCode: 'HSK2', order: 1, searchIn: '了',   pattern: '了 (le)',              meaning: 'Hoàn thành / thay đổi trạng thái',         example: '我吃了饭。',          exampleVi: 'Tôi đã ăn cơm rồi.' },
  { lang: 'zh', levelCode: 'HSK2', order: 2, searchIn: '过',   pattern: '过 (guò)',             meaning: 'Đã từng trải nghiệm',                      example: '我去过北京。',        exampleVi: 'Tôi đã từng đến Bắc Kinh.' },
  { lang: 'zh', levelCode: 'HSK2', order: 3, searchIn: '快要', pattern: '快要…了 (kuàiyào…le)', meaning: 'Sắp ~ rồi',                               example: '快要下雨了。',        exampleVi: 'Sắp mưa rồi.' },
  { lang: 'zh', levelCode: 'HSK2', order: 4, searchIn: '比',   pattern: '比 (bǐ)',              meaning: 'So sánh hơn/kém',                          example: '今天比昨天热。',      exampleVi: 'Hôm nay nóng hơn hôm qua.' },
  { lang: 'zh', levelCode: 'HSK2', order: 5, searchIn: '也',   pattern: '也 (yě)',              meaning: 'Cũng',                                     example: '我也喜欢看电影。',    exampleVi: 'Tôi cũng thích xem phim.' },
  { lang: 'zh', levelCode: 'HSK2', order: 6, searchIn: '还',   pattern: '还 (hái)',             meaning: 'Vẫn còn / nữa',                            example: '我还没吃饭。',        exampleVi: 'Tôi vẫn chưa ăn cơm.' },

  // ─── Chinese HSK3 ─────────────────────────────────────────────────────────
  { lang: 'zh', levelCode: 'HSK3', order: 1, searchIn: '把',   pattern: '把 (bǎ)',                     meaning: 'Cấu trúc xử lý đối tượng trực tiếp',   example: '请把书放在桌子上。',      exampleVi: 'Hãy đặt sách lên bàn.' },
  { lang: 'zh', levelCode: 'HSK3', order: 2, searchIn: '被',   pattern: '被 (bèi)',                    meaning: 'Câu bị động',                          example: '钱包被偷了。',            exampleVi: 'Ví đã bị ăn cắp.' },
  { lang: 'zh', levelCode: 'HSK3', order: 3, searchIn: '虽然', pattern: '虽然…但是 (suīrán…dànshì)',  meaning: 'Tuy … nhưng …',                       example: '虽然很累，但是还要继续。', exampleVi: 'Tuy mệt nhưng vẫn phải tiếp tục.' },
  { lang: 'zh', levelCode: 'HSK3', order: 4, searchIn: '因为', pattern: '因为…所以 (yīnwèi…suǒyǐ)', meaning: 'Vì … nên …',                          example: '因为下雨，所以没出门。',   exampleVi: 'Vì trời mưa nên không ra ngoài.' },
  { lang: 'zh', levelCode: 'HSK3', order: 5, searchIn: '如果', pattern: '如果…就 (rúguǒ…jiù)',         meaning: 'Nếu … thì …',                         example: '如果你去，我就去。',       exampleVi: 'Nếu bạn đi thì tôi sẽ đi.' },
  { lang: 'zh', levelCode: 'HSK3', order: 6, searchIn: '一边', pattern: '一边…一边 (yībiān…yībiān)',  meaning: 'Vừa … vừa …',                         example: '他一边吃饭一边看电视。',   exampleVi: 'Anh ấy vừa ăn cơm vừa xem TV.' },

  // ─── Chinese HSK4 ─────────────────────────────────────────────────────────
  { lang: 'zh', levelCode: 'HSK4', order: 1, searchIn: '不管', pattern: '不管…都 (bùguǎn…dōu)',      meaning: 'Dù ~ cũng',                  example: '不管多忙，都要锻炼。',      exampleVi: 'Dù bận thế nào cũng phải tập thể dục.' },
  { lang: 'zh', levelCode: 'HSK4', order: 2, searchIn: '连',   pattern: '连…都/也 (lián…dōu/yě)',    meaning: 'Ngay cả ~ cũng',             example: '连他都不知道。',            exampleVi: 'Ngay cả anh ấy cũng không biết.' },
  { lang: 'zh', levelCode: 'HSK4', order: 3, searchIn: '既然', pattern: '既然…就 (jìrán…jiù)',        meaning: 'Đã ~ thì ~',                 example: '既然决定了，就去做吧。',    exampleVi: 'Đã quyết định rồi thì cứ làm thôi.' },
  { lang: 'zh', levelCode: 'HSK4', order: 4, searchIn: '到底', pattern: '到底 (dàodǐ)',               meaning: 'Rốt cuộc / Đến cùng',        example: '到底发生了什么？',          exampleVi: 'Rốt cuộc đã xảy ra chuyện gì thế?' },
  { lang: 'zh', levelCode: 'HSK4', order: 5, searchIn: '对',   pattern: '对…来说 (duì…lái shuō)',    meaning: 'Đối với … mà nói',           example: '对我来说，学语言很难。',    exampleVi: 'Đối với tôi, học ngôn ngữ rất khó.' },

  // ─── Chinese HSK5 ─────────────────────────────────────────────────────────
  { lang: 'zh', levelCode: 'HSK5', order: 1, searchIn: '不得不', pattern: '不得不 (bùdébù)',              meaning: 'Không thể không ~ (bắt buộc)',     example: '他不得不辞职。',             exampleVi: 'Anh ấy không thể không từ chức.' },
  { lang: 'zh', levelCode: 'HSK5', order: 2, searchIn: '宁可',   pattern: '宁可…也不 (nìngkě…yě bù)',  meaning: 'Thà ~ còn hơn ~',                 example: '宁可早去，也不迟到。',       exampleVi: 'Thà đi sớm còn hơn đến muộn.' },
  { lang: 'zh', levelCode: 'HSK5', order: 3, searchIn: '以便',   pattern: '以便 (yǐbiàn)',               meaning: 'Để thuận tiện ~ / để ~ có thể',    example: '请提前通知，以便我们准备。', exampleVi: 'Vui lòng thông báo trước để chúng tôi chuẩn bị.' },
  { lang: 'zh', levelCode: 'HSK5', order: 4, searchIn: '何况',   pattern: '何况 (hékuàng)',               meaning: 'Huống chi ~ / Hơn nữa (tăng cấp)', example: '大人都难做到，何况孩子。',   exampleVi: 'Người lớn còn khó làm, huống chi trẻ em.' },

  // ─── Chinese HSK6 ─────────────────────────────────────────────────────────
  { lang: 'zh', levelCode: 'HSK6', order: 1, searchIn: '未免', pattern: '未免 (wèimiǎn)',           meaning: 'Hơi quá / không khỏi',           example: '这样做未免太过分了。',        exampleVi: 'Làm vậy hơi quá đáng rồi.' },
  { lang: 'zh', levelCode: 'HSK6', order: 2, searchIn: '况且', pattern: '况且 (kuàngqiě)',           meaning: 'Hơn nữa, vả lại',                example: '太贵了，况且也不需要。',      exampleVi: 'Quá đắt, vả lại cũng không cần.' },
  { lang: 'zh', levelCode: 'HSK6', order: 3, searchIn: '无论', pattern: '无论如何 (wúlùn rúhé)',    meaning: 'Dù thế nào đi nữa',              example: '无论如何，我们必须完成任务。', exampleVi: 'Dù thế nào, chúng ta phải hoàn thành nhiệm vụ.' },
  { lang: 'zh', levelCode: 'HSK6', order: 4, searchIn: '诚然', pattern: '诚然 (chéngrán)',           meaning: 'Đành rằng ~ / đúng là ~ nhưng',  example: '诚然，这很难，但值得尝试。',  exampleVi: 'Đành rằng điều này khó, nhưng đáng để thử.' },
];

export async function seeder03() {
  await prisma.grammarPattern.deleteMany();
  await prisma.grammarPattern.createMany({ data: patterns });
  console.log(`Seeded ${patterns.length} grammar patterns`);
}
