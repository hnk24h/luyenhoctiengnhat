/**
 * Seeder: HSK Chinese module
 * Run: npx tsx prisma/seed-hsk.ts
 *
 * Seeds:
 *  - Level rows for HSK1–HSK6 (subject = 'HSK')
 *  - ChinesePassage rows (2 passages per level)
 *  - LearningCategory + LearningLesson + LearningItem (vocab) per level
 */

import { PrismaClient, Subject } from '@prisma/client';

const prisma = new PrismaClient();

// ─── HSK Levels ─────────────────────────────────────────────
const HSK_LEVELS = [
  { code: 'HSK1', name: 'HSK 1 — Nhập môn',      description: 'Khoảng 150 từ vựng, giao tiếp cơ bản',         order: 10, subject: Subject.HSK },
  { code: 'HSK2', name: 'HSK 2 — Cơ bản',         description: 'Khoảng 300 từ vựng, giao tiếp thông thường',    order: 11, subject: Subject.HSK },
  { code: 'HSK3', name: 'HSK 3 — Sơ trung cấp',   description: 'Khoảng 600 từ vựng, xử lý hầu hết tình huống', order: 12, subject: Subject.HSK },
  { code: 'HSK4', name: 'HSK 4 — Trung cấp',       description: 'Khoảng 1200 từ vựng, giao tiếp lưu loát',      order: 13, subject: Subject.HSK },
  { code: 'HSK5', name: 'HSK 5 — Trung cao cấp',   description: 'Khoảng 2500 từ vựng, đọc báo tự nhiên',        order: 14, subject: Subject.HSK },
  { code: 'HSK6', name: 'HSK 6 — Cao cấp',         description: 'Khoảng 5000+ từ vựng, thành thạo như người bản ngữ', order: 15, subject: Subject.HSK },
];

// ─── Reading Passages ────────────────────────────────────────
const PASSAGES = [
  // ── HSK 1 ──
  {
    title: '我的家',
    titleVi: 'Gia đình tôi',
    level: 'HSK1',
    content: '我叫李明。我家有四口人：爸爸、妈妈、妹妹和我。爸爸是老师，妈妈是医生。妹妹八岁，她很可爱。我们家住在北京。家里有一只猫，叫小白。我们都很喜欢它。',
    pinyin: 'Wǒ jiào Lǐ Míng. Wǒ jiā yǒu sì kǒu rén: bàba, māma, mèimei hé wǒ. Bàba shì lǎoshī, māma shì yīshēng. Mèimei bā suì, tā hěn kě\'ài. Wǒmen jiā zhù zài Běijīng. Jiā lǐ yǒu yī zhī māo, jiào Xiǎobái. Wǒmen dōu hěn xǐhuan tā.',
    translation: 'Tôi tên là Lý Minh. Gia đình tôi có bốn người: bố, mẹ, em gái và tôi. Bố là giáo viên, mẹ là bác sĩ. Em gái tám tuổi, rất đáng yêu. Nhà tôi ở Bắc Kinh. Trong nhà có một con mèo tên Tiểu Bạch. Chúng tôi đều rất thích nó.',
    topic: 'Gia đình',
  },
  {
    title: '今天的天气',
    titleVi: 'Thời tiết hôm nay',
    level: 'HSK1',
    content: '今天天气很好。太阳出来了，天很蓝。不冷也不热，很舒服。我想去公园走走。公园里有很多花，有红的，有黄的，还有白的。我喜欢春天，因为春天很美。',
    pinyin: 'Jīntiān tiānqì hěn hǎo. Tàiyáng chūlái le, tiān hěn lán. Bù lěng yě bù rè, hěn shūfu. Wǒ xiǎng qù gōngyuán zǒuzou. Gōngyuán lǐ yǒu hěn duō huā, yǒu hóng de, yǒu huáng de, hái yǒu bái de. Wǒ xǐhuan chūntiān, yīnwèi chūntiān hěn měi.',
    translation: 'Hôm nay thời tiết rất đẹp. Mặt trời ló dạng, bầu trời rất xanh. Không lạnh không nóng, rất dễ chịu. Tôi muốn đi dạo công viên. Trong công viên có rất nhiều hoa, có hoa đỏ, hoa vàng, còn có hoa trắng. Tôi thích mùa xuân vì mùa xuân rất đẹp.',
    topic: 'Thời tiết',
  },

  // ── HSK 2 ──
  {
    title: '我的一天',
    titleVi: 'Một ngày của tôi',
    level: 'HSK2',
    content: '我每天早上七点起床。先洗脸刷牙，然后吃早饭。早饭有面包、牛奶和鸡蛋。八点我坐公共汽车去学校。学校离家不太远，大概二十分钟。中午在学校吃午饭。下午四点放学，我回家做作业。晚上和家人一起吃饭，然后看电视或者看书。十点半睡觉。',
    pinyin: 'Wǒ měitiān zǎoshang qī diǎn qǐchuáng. Xiān xǐliǎn shuāyá, ránhòu chī zǎofàn. Zǎofàn yǒu miànbāo, niúnǎi hé jīdàn. Bā diǎn wǒ zuò gōnggòng qìchē qù xuéxiào...',
    translation: 'Mỗi ngày tôi thức dậy lúc bảy giờ sáng. Đầu tiên rửa mặt đánh răng, sau đó ăn sáng. Bữa sáng có bánh mì, sữa và trứng. Tám giờ tôi đi xe buýt đến trường. Trường không xa nhà lắm, khoảng hai mươi phút. Buổi trưa ăn trưa ở trường. Chiều bốn giờ tan học, tôi về nhà làm bài tập. Tối ăn cơm cùng gia đình, sau đó xem tivi hoặc đọc sách. Mười giờ rưỡi đi ngủ.',
    topic: 'Cuộc sống hàng ngày',
  },
  {
    title: '去超市买东西',
    titleVi: 'Đi siêu thị mua đồ',
    level: 'HSK2',
    content: '今天妈妈让我去超市买东西。她给了我一张购物清单：苹果两斤、牛奶两瓶、面条一袋、鸡蛋十个。我骑自行车去超市，大概骑了十分钟。超市里人很多，我找了很久才找到所有的东西。结账的时候，我发现忘记带钱包了，很着急。后来找到了，原来放在裤子口袋里。',
    pinyin: 'Jīntiān māma ràng wǒ qù chāoshì mǎi dōngxi...',
    translation: 'Hôm nay mẹ nhờ tôi đi siêu thị mua đồ. Bà đưa cho tôi một danh sách mua sắm: hai cân táo, hai chai sữa, một túi mì và mười quả trứng. Tôi đạp xe đến siêu thị, mất khoảng mười phút. Siêu thị rất đông người, tôi tìm mãi mới thấy hết đồ. Khi thanh toán, tôi phát hiện quên mang ví, rất lo lắng. Sau đó tìm được, hóa ra để trong túi quần.',
    topic: 'Mua sắm',
  },

  // ── HSK 3 ──
  {
    title: '中国的节日',
    titleVi: 'Các lễ hội Trung Quốc',
    level: 'HSK3',
    content: '中国有很多传统节日。春节是最重要的节日，人们贴春联、放鞭炮、吃饺子，家人团聚在一起。中秋节在农历八月十五，人们赏月、吃月饼。端午节要吃粽子，还要看龙舟比赛。重阳节在九月九日，有登高的习俗。这些节日都有悠久的历史和丰富的文化内涵，是中国文化的重要组成部分。',
    pinyin: 'Zhōngguó yǒu hěn duō chuántǒng jiérì. Chūnjié shì zuì zhòngzào de jiérì...',
    translation: 'Trung Quốc có rất nhiều lễ hội truyền thống. Tết Nguyên Đán là lễ hội quan trọng nhất, người ta dán câu đối đỏ, đốt pháo, ăn bánh bao, gia đình đoàn tụ. Tết Trung Thu vào ngày 15 tháng 8 âm lịch, người ta ngắm trăng và ăn bánh trung thu. Tết Đoan Ngọ phải ăn bánh tẻ, còn xem đua thuyền rồng. Lễ Trùng Dương vào ngày 9 tháng 9, có tục leo núi cao. Những lễ hội này đều có lịch sử lâu dài và nội hàm văn hóa phong phú.',
    topic: 'Văn hóa',
  },
  {
    title: '学汉语的经历',
    titleVi: 'Trải nghiệm học tiếng Trung',
    level: 'HSK3',
    content: '我学汉语已经两年了。开始的时候，觉得汉语很难，特别是声调和汉字。普通话有四个声调，说错了意思就完全不一样。汉字也很复杂，每个字都要认真地写好几遍才能记住。但是学了一段时间以后，我发现汉语其实很有规律。只要坚持练习，就一定能学好。现在我能用汉语和朋友聊天，看懂简单的文章，感觉很有成就感。',
    pinyin: 'Wǒ xué Hànyǔ yǐjīng liǎng nián le...',
    translation: 'Tôi đã học tiếng Trung được hai năm rồi. Lúc đầu cảm thấy tiếng Trung rất khó, đặc biệt là thanh điệu và chữ Hán. Tiếng phổ thông có bốn thanh điệu, nói sai là ý nghĩa hoàn toàn khác. Chữ Hán cũng rất phức tạp, mỗi chữ phải viết đi viết lại nhiều lần mới nhớ. Nhưng học một thời gian rồi, tôi phát hiện tiếng Trung thực ra rất có quy luật. Chỉ cần kiên trì luyện tập, nhất định sẽ học được. Bây giờ tôi có thể dùng tiếng Trung nói chuyện với bạn bè, đọc hiểu bài đơn giản, cảm thấy rất có thành tựu.',
    topic: 'Học ngôn ngữ',
  },

  // ── HSK 4 ──
  {
    title: '城市化的利与弊',
    titleVi: 'Lợi và hại của đô thị hóa',
    level: 'HSK4',
    content: '随着经济的发展，越来越多的人从农村搬到城市居住。城市化带来了很多好处：就业机会增多、教育和医疗条件改善、生活水平提高。然而，城市化也产生了一些问题。城市人口增加导致交通堵塞、住房紧张、环境污染等问题日益严重。农村劳动力大量减少，农业发展受到影响。如何实现城乡协调发展，是当前面临的重要课题。专家建议，应该加大对农村的投入，发展农村产业，让农民在家乡也能获得好的发展机会。',
    pinyin: 'Suízhe jīngjì de fāzhǎn, yuèlái yuè duō de rén cóng nóngcūn bān dào chéngshì jūzhù...',
    translation: 'Cùng với sự phát triển kinh tế, ngày càng nhiều người chuyển từ nông thôn ra thành phố sinh sống. Đô thị hóa mang lại nhiều lợi ích: cơ hội việc làm tăng, điều kiện giáo dục và y tế được cải thiện, mức sống nâng cao. Tuy nhiên, đô thị hóa cũng gây ra một số vấn đề: tắc nghẽn giao thông, căng thẳng nhà ở, ô nhiễm môi trường ngày càng nghiêm trọng. Lực lượng lao động nông thôn giảm mạnh, ảnh hưởng đến phát triển nông nghiệp.',
    topic: 'Xã hội',
  },
  {
    title: '互联网改变生活',
    titleVi: 'Internet thay đổi cuộc sống',
    level: 'HSK4',
    content: '互联网的发展极大地改变了人们的生活方式。购物、学习、工作、娱乐，几乎所有的事情都可以在网上完成。网上购物让人们足不出户就能买到世界各地的商品，非常方便。在线教育打破了时间和空间的限制，让更多人有机会学习优质课程。远程办公也因此变得越来越普遍。但与此同时，人们也越来越依赖网络，有人担心这会影响现实中的人际关系和社交能力。如何在享受网络便利的同时保持健康的生活方式，是现代人需要思考的问题。',
    pinyin: 'Hùliánwǎng de fāzhǎn jídà de gǎibiàn le rénmen de shēnghuó fāngshì...',
    translation: 'Sự phát triển của internet đã thay đổi rất nhiều lối sống của con người. Mua sắm, học tập, làm việc, giải trí — hầu hết mọi thứ đều có thể hoàn thành trực tuyến. Mua sắm online cho phép mọi người không cần ra khỏi nhà vẫn mua được hàng hóa từ khắp nơi trên thế giới, rất tiện lợi. Giáo dục trực tuyến phá vỡ giới hạn về thời gian và không gian...',
    topic: 'Công nghệ',
  },

  // ── HSK 5 ──
  {
    title: '人工智能的未来',
    titleVi: 'Tương lai của trí tuệ nhân tạo',
    level: 'HSK5',
    content: '随着技术的不断进步，人工智能正在渗透到社会的各个领域。从医疗诊断到自动驾驶，从语言翻译到艺术创作，AI的应用场景日益广泛。一些专家预测，在未来二三十年内，人工智能将取代大量重复性劳动，这不可避免地会对就业市场产生深远影响。与此同时，AI的发展也带来了新的职业和机遇。值得关注的是，随着AI变得越来越强大，如何确保其安全性和伦理性，防止被滥用，成为了学界和政界共同探讨的重要议题。人工智能既是一把双刃剑，如何善용，取决于人类自身的选择。',
    pinyin: 'Suízhe jìshù de bùduàn jìnbù, réngōng zhìnéng zhèngzài shèntòu dào shèhuì de gège lǐngyù...',
    translation: 'Cùng với sự tiến bộ không ngừng của công nghệ, trí tuệ nhân tạo đang thâm nhập vào mọi lĩnh vực của xã hội. Từ chẩn đoán y tế đến lái xe tự động, từ dịch thuật ngôn ngữ đến sáng tác nghệ thuật, phạm vi ứng dụng của AI ngày càng rộng rãi. Một số chuyên gia dự đoán trong 20-30 năm tới, AI sẽ thay thế nhiều lao động lặp đi lặp lại...',
    topic: 'Công nghệ & Xã hội',
  },
  {
    title: '传统文化与现代社会',
    titleVi: 'Văn hóa truyền thống và xã hội hiện đại',
    level: 'HSK5',
    content: '在全球化浪潮的冲击下，如何传承和弘扬传统文化，成为许多国家面临的共同挑战。中国拥有五千年的文明史，积淀了极为丰富的文化遗产，包括汉字、书法、中医、京剧、传统节日等。然而，随着西方文化的强势渗透和现代生活节奏的加快，年轻一代对传统文化的了解和兴趣日趋减少。如何让传统文化在当代焕发新的生命力，是教育工作者和文化研究者亟待解决的问题。一些成功的尝试表明，将传统元素与现代表达方式相结合，往往能够收到意想不到的效果。',
    pinyin: 'Zài quánqiúhuà làngcháo de chōngjī xià, rúhé chuánchéng hé hóngyáng chuántǒng wénhuà...',
    translation: 'Trước làn sóng toàn cầu hóa, làm thế nào để kế thừa và phát huy văn hóa truyền thống đã trở thành thách thức chung của nhiều quốc gia. Trung Quốc có lịch sử văn minh 5000 năm, tích lũy di sản văn hóa vô cùng phong phú...',
    topic: 'Văn hóa',
  },

  // ── HSK 6 ──
  {
    title: '气候变化与人类责任',
    titleVi: 'Biến đổi khí hậu và trách nhiệm con người',
    level: 'HSK6',
    content: '气候变化已成为21世纪最严峻的全球性挑战之一。科学数据表明，由于工业化进程中大量温室气体的排放，地球平均气温在过去百年间上升了约1.1摄氏度。冰川融化、海平面上升、极端天气事件频发——这些变化的背后，是人类活动对自然生态系统的长期干扰。应对气候变化，需要全球各国的协同努力。《巴黎协定》的签署标志着国际社会在这一议题上迈出了重要一步，但其实施进程仍面临重重阻碍。发展中国家与发达国家之间在减排责任和资金支持上的分歧，使得全球气候治理的前景充满不确定性。在个人层面，提倡绿色消费、减少碳足迹，亦是每个公民应尽的义务。',
    pinyin: 'Qìhòu biànhuà yǐ chéngwéi 21 shìjì zuì yánjùn de quánqiúxìng tiǎozhàn zhī yī...',
    translation: 'Biến đổi khí hậu đã trở thành một trong những thách thức toàn cầu nghiêm trọng nhất thế kỷ 21. Dữ liệu khoa học cho thấy, do lượng lớn khí nhà kính thải ra trong quá trình công nghiệp hóa, nhiệt độ trung bình của Trái đất đã tăng khoảng 1,1 độ C trong 100 năm qua...',
    topic: 'Môi trường',
  },
  {
    title: '哲学与现代生活',
    titleVi: 'Triết học và cuộc sống hiện đại',
    level: 'HSK6',
    content: '在物质文明高度发达的今天，人们的精神世界却未必同步充实。工作压力、生活焦虑、价值迷失——这些现代社会的"文明病"，促使越来越多的人开始重新审视哲学的价值。从苏格拉底的"认识你自己"，到孔子的"吾日三省吾身"，东西方哲学传统都在探索同一个核心命题：何为美好的生活？现代哲学不再是象牙塔中的高深学问，而是与心理健康、职业发展、人际关系等现实议题深度融合。斯多葛主义在当代的复兴，正是人们在纷繁世界中寻求内心宁静的写照。哲学的意义，在于帮助我们在不确定性中找到属于自己的确定性。',
    pinyin: 'Zài wùzhì wénmíng gāodù fādá de jīntiān, rénmen de jīngshén shìjiè quèwèibì tóngbù chōngshí...',
    translation: 'Trong thời đại văn minh vật chất phát triển cao độ ngày nay, thế giới tinh thần của con người chưa hẳn đã đồng bộ phong phú. Áp lực công việc, lo âu cuộc sống, mất phương hướng giá trị — những "bệnh văn minh" của xã hội hiện đại này thúc đẩy ngày càng nhiều người bắt đầu xem xét lại giá trị của triết học...',
    topic: 'Triết học',
  },
];

// ─── Vocabulary (LearningItem) per level ───────────────────
// Format: [chinese, pinyin, meaning]
const VOCAB: Record<string, [string, string, string][]> = {
  HSK1: [
    ['你好', 'nǐ hǎo', 'Xin chào'],
    ['谢谢', 'xièxiè', 'Cảm ơn'],
    ['对不起', 'duìbuqǐ', 'Xin lỗi'],
    ['没关系', 'méiguānxi', 'Không sao'],
    ['再见', 'zàijiàn', 'Tạm biệt'],
    ['我', 'wǒ', 'Tôi / Mình'],
    ['你', 'nǐ', 'Bạn / Anh / Chị'],
    ['他', 'tā', 'Anh ấy / Ông ấy'],
    ['她', 'tā', 'Cô ấy / Bà ấy'],
    ['我们', 'wǒmen', 'Chúng tôi'],
    ['是', 'shì', 'Là'],
    ['不', 'bù', 'Không'],
    ['好', 'hǎo', 'Tốt / Được'],
    ['大', 'dà', 'To / Lớn'],
    ['小', 'xiǎo', 'Nhỏ'],
    ['多', 'duō', 'Nhiều'],
    ['少', 'shǎo', 'Ít'],
    ['去', 'qù', 'Đi'],
    ['来', 'lái', 'Đến'],
    ['吃', 'chī', 'Ăn'],
    ['喝', 'hē', 'Uống'],
    ['看', 'kàn', 'Nhìn / Xem'],
    ['说', 'shuō', 'Nói'],
    ['听', 'tīng', 'Nghe'],
    ['买', 'mǎi', 'Mua'],
    ['爸爸', 'bàba', 'Bố / Ba'],
    ['妈妈', 'māma', 'Mẹ'],
    ['朋友', 'péngyou', 'Bạn bè'],
    ['老师', 'lǎoshī', 'Giáo viên'],
    ['学生', 'xuésheng', 'Học sinh'],
    ['家', 'jiā', 'Nhà / Gia đình'],
    ['学校', 'xuéxiào', 'Trường học'],
    ['中国', 'Zhōngguó', 'Trung Quốc'],
    ['一', 'yī', 'Một'],
    ['二', 'èr', 'Hai'],
    ['三', 'sān', 'Ba'],
    ['四', 'sì', 'Bốn'],
    ['五', 'wǔ', 'Năm'],
    ['今天', 'jīntiān', 'Hôm nay'],
    ['明天', 'míngtiān', 'Ngày mai'],
    ['年', 'nián', 'Năm (thời gian)'],
    ['月', 'yuè', 'Tháng'],
    ['日', 'rì', 'Ngày'],
    ['上', 'shàng', 'Trên'],
    ['下', 'xià', 'Dưới'],
    ['中', 'zhōng', 'Giữa / Trung'],
    ['里', 'lǐ', 'Trong'],
    ['钱', 'qián', 'Tiền'],
    ['书', 'shū', 'Sách'],
    ['水', 'shuǐ', 'Nước'],
  ],
  HSK2: [
    ['已经', 'yǐjīng', 'Đã (rồi)'],
    ['因为', 'yīnwèi', 'Vì'],
    ['所以', 'suǒyǐ', 'Cho nên / Vì vậy'],
    ['但是', 'dànshì', 'Nhưng'],
    ['或者', 'huòzhě', 'Hoặc là'],
    ['还是', 'háishi', 'Hay là (trong câu hỏi)'],
    ['觉得', 'juéde', 'Cảm thấy'],
    ['知道', 'zhīdào', 'Biết'],
    ['帮助', 'bāngzhù', 'Giúp đỡ'],
    ['告诉', 'gàosu', 'Kể / Nói cho biết'],
    ['希望', 'xīwàng', 'Hy vọng'],
    ['喜欢', 'xǐhuān', 'Thích'],
    ['高兴', 'gāoxìng', 'Vui / Vui mừng'],
    ['快乐', 'kuàilè', 'Vui vẻ / Hạnh phúc'],
    ['漂亮', 'piàoliang', 'Đẹp'],
    ['聪明', 'cōngmíng', 'Thông minh'],
    ['努力', 'nǔlì', 'Cố gắng / Chăm chỉ'],
    ['认真', 'rènzhēn', 'Nghiêm túc / Chăm chú'],
    ['走', 'zǒu', 'Đi bộ'],
    ['跑', 'pǎo', 'Chạy'],
    ['坐', 'zuò', 'Ngồi'],
    ['站', 'zhàn', 'Đứng'],
    ['时候', 'shíhou', 'Lúc / Khi'],
    ['以前', 'yǐqián', 'Trước đây'],
    ['以后', 'yǐhòu', 'Sau này'],
    ['快', 'kuài', 'Nhanh'],
    ['慢', 'màn', 'Chậm'],
    ['高', 'gāo', 'Cao'],
    ['矮', 'ǎi', 'Thấp'],
    ['贵', 'guì', 'Đắt'],
    ['便宜', 'piányí', 'Rẻ'],
    ['新', 'xīn', 'Mới'],
    ['旧', 'jiù', 'Cũ'],
    ['问题', 'wèntí', 'Vấn đề / Câu hỏi'],
    ['答案', 'dáàn', 'Câu trả lời'],
    ['考试', 'kǎoshì', 'Kỳ thi'],
    ['成绩', 'chéngjì', 'Kết quả / Điểm số'],
    ['工作', 'gōngzuò', 'Công việc'],
    ['公司', 'gōngsī', 'Công ty'],
    ['医院', 'yīyuàn', 'Bệnh viện'],
    ['超市', 'chāoshì', 'Siêu thị'],
    ['电话', 'diànhuà', 'Điện thoại'],
    ['手机', 'shǒujī', 'Điện thoại di động'],
    ['电脑', 'diànnǎo', 'Máy tính'],
    ['上班', 'shàngbān', 'Đi làm'],
    ['下班', 'xiàbān', 'Tan làm'],
    ['上课', 'shàngkè', 'Lên lớp'],
    ['下课', 'xiàkè', 'Tan học'],
    ['休息', 'xiūxi', 'Nghỉ ngơi'],
    ['睡觉', 'shuìjiào', 'Ngủ'],
  ],
  HSK3: [
    ['经验', 'jīngyàn', 'Kinh nghiệm'],
    ['机会', 'jīhuì', 'Cơ hội'],
    ['环境', 'huánjìng', 'Môi trường'],
    ['发展', 'fāzhǎn', 'Phát triển'],
    ['影响', 'yǐngxiǎng', 'Ảnh hưởng'],
    ['重要', 'zhòngyào', 'Quan trọng'],
    ['复杂', 'fùzá', 'Phức tạp'],
    ['简单', 'jiǎndān', 'Đơn giản'],
    ['认识', 'rènshi', 'Nhận ra / Quen biết'],
    ['了解', 'liǎojiě', 'Hiểu rõ'],
    ['解释', 'jiěshì', 'Giải thích'],
    ['选择', 'xuǎnzé', 'Lựa chọn'],
    ['决定', 'juédìng', 'Quyết định'],
    ['参加', 'cānjiā', 'Tham gia'],
    ['比较', 'bǐjiào', 'So sánh / Tương đối'],
    ['方便', 'fāngbiàn', 'Tiện lợi'],
    ['安全', 'ānquán', 'An toàn'],
    ['健康', 'jiànkāng', 'Sức khỏe / Khỏe mạnh'],
    ['感情', 'gǎnqíng', 'Tình cảm'],
    ['礼貌', 'lǐmào', 'Lịch sự'],
    ['习惯', 'xíguàn', 'Thói quen'],
    ['文化', 'wénhuà', 'Văn hóa'],
    ['历史', 'lìshǐ', 'Lịch sử'],
    ['科学', 'kēxué', 'Khoa học'],
    ['技术', 'jìshù', 'Kỹ thuật / Công nghệ'],
    ['社会', 'shèhuì', 'Xã hội'],
    ['政府', 'zhèngfǔ', 'Chính phủ'],
    ['经济', 'jīngjì', 'Kinh tế'],
    ['法律', 'fǎlǜ', 'Pháp luật'],
    ['教育', 'jiàoyù', 'Giáo dục'],
    ['成功', 'chénggōng', 'Thành công'],
    ['失败', 'shībài', 'Thất bại'],
    ['目的', 'mùdì', 'Mục đích'],
    ['计划', 'jìhuà', 'Kế hoạch'],
    ['方法', 'fāngfǎ', 'Phương pháp'],
    ['问题', 'wèntí', 'Vấn đề'],
    ['原因', 'yuányīn', 'Nguyên nhân'],
    ['结果', 'jiéguǒ', 'Kết quả'],
    ['根据', 'gēnjù', 'Dựa trên / Căn cứ'],
    ['通过', 'tōngguò', 'Thông qua'],
    ['关于', 'guānyú', 'Về / Liên quan đến'],
    ['对于', 'duìyú', 'Đối với'],
    ['另外', 'lìngwài', 'Ngoài ra'],
    ['同时', 'tóngshí', 'Đồng thời'],
    ['虽然…但是', 'suīrán…dànshì', 'Mặc dù…nhưng'],
    ['如果…就', 'rúguǒ…jiù', 'Nếu…thì'],
    ['只要…就', 'zhǐyào…jiù', 'Chỉ cần…là'],
    ['不但…而且', 'búdàn…érqiě', 'Không chỉ…mà còn'],
    ['越来越', 'yuèláiyuè', 'Ngày càng'],
    ['最终', 'zuìzhōng', 'Cuối cùng'],
  ],
  HSK4: [
    ['积极', 'jījí', 'Tích cực'],
    ['消极', 'xiāojí', 'Tiêu cực'],
    ['主动', 'zhǔdòng', 'Chủ động'],
    ['被动', 'bèidòng', 'Bị động'],
    ['竞争', 'jìngzhēng', 'Cạnh tranh'],
    ['合作', 'hézuò', 'Hợp tác'],
    ['交流', 'jiāoliú', 'Trao đổi / Giao lưu'],
    ['沟通', 'gōutōng', 'Giao tiếp / Thông cảm'],
    ['理解', 'lǐjiě', 'Hiểu / Thông cảm'],
    ['误解', 'wùjiě', 'Hiểu lầm'],
    ['尊重', 'zūnzhòng', 'Tôn trọng'],
    ['信任', 'xìnrèn', 'Tin tưởng'],
    ['承认', 'chéngrèn', 'Thừa nhận'],
    ['否认', 'fǒurèn', 'Phủ nhận'],
    ['批评', 'pīpíng', 'Phê bình / Chỉ trích'],
    ['表扬', 'biǎoyáng', 'Khen ngợi'],
    ['鼓励', 'gǔlì', 'Khuyến khích'],
    ['支持', 'zhīchí', 'Ủng hộ'],
    ['反对', 'fǎnduì', 'Phản đối'],
    ['坚持', 'jiānchí', 'Kiên trì'],
    ['放弃', 'fàngqì', 'Từ bỏ'],
    ['努力', 'nǔlì', 'Cố gắng'],
    ['拼命', 'pīnmìng', 'Cố hết sức'],
    ['提高', 'tígāo', 'Nâng cao'],
    ['改善', 'gǎishàn', 'Cải thiện'],
    ['改变', 'gǎibiàn', 'Thay đổi'],
    ['创新', 'chuàngxīn', 'Sáng tạo / Đổi mới'],
    ['突破', 'túpò', 'Đột phá / Vượt qua'],
    ['挑战', 'tiǎozhàn', 'Thách thức'],
    ['困难', 'kùnnán', 'Khó khăn'],
    ['机遇', 'jīyù', 'Cơ hội (quan trọng)'],
    ['风险', 'fēngxiǎn', 'Rủi ro'],
    ['责任', 'zérèn', 'Trách nhiệm'],
    ['义务', 'yìwù', 'Nghĩa vụ'],
    ['权利', 'quánlì', 'Quyền lợi'],
    ['利益', 'lìyì', 'Lợi ích'],
    ['损失', 'sǔnshī', 'Tổn thất'],
    ['解决', 'jiějué', 'Giải quyết'],
    ['处理', 'chǔlǐ', 'Xử lý'],
    ['分析', 'fēnxī', 'Phân tích'],
    ['研究', 'yánjiū', 'Nghiên cứu'],
    ['调查', 'diàochá', 'Điều tra / Khảo sát'],
    ['统计', 'tǒngjì', 'Thống kê'],
    ['数据', 'shùjù', 'Dữ liệu'],
    ['信息', 'xìnxī', 'Thông tin'],
    ['内容', 'nèiróng', 'Nội dung'],
    ['形式', 'xíngshì', 'Hình thức'],
    ['标准', 'biāozhǔn', 'Tiêu chuẩn'],
    ['要求', 'yāoqiú', 'Yêu cầu'],
    ['条件', 'tiáojiàn', 'Điều kiện'],
  ],
  HSK5: [
    ['辩证', 'biànzhèng', 'Biện chứng'],
    ['逻辑', 'luóji', 'Logic'],
    ['抽象', 'chōuxiàng', 'Trừu tượng'],
    ['具体', 'jùtǐ', 'Cụ thể'],
    ['本质', 'běnzhì', 'Bản chất'],
    ['现象', 'xiànxiàng', 'Hiện tượng'],
    ['规律', 'guīlǜ', 'Quy luật'],
    ['原则', 'yuánzé', 'Nguyên tắc'],
    ['理论', 'lǐlùn', 'Lý luận / Lý thuyết'],
    ['实践', 'shíjiàn', 'Thực hành'],
    ['客观', 'kèguān', 'Khách quan'],
    ['主观', 'zhǔguān', 'Chủ quan'],
    ['偏见', 'piānjiàn', 'Định kiến'],
    ['批判', 'pīpàn', 'Phê phán'],
    ['反思', 'fǎnsī', 'Phản tư / Suy ngẫm lại'],
    ['探索', 'tànsuǒ', 'Khám phá / Tìm tòi'],
    ['发现', 'fāxiàn', 'Phát hiện'],
    ['揭示', 'jiēshì', 'Vạch ra / Tiết lộ'],
    ['体现', 'tǐxiàn', 'Thể hiện / Biểu hiện'],
    ['反映', 'fǎnyìng', 'Phản ánh'],
    ['涉及', 'shèjí', 'Liên quan đến / Đề cập đến'],
    ['包含', 'bāohán', 'Bao gồm / Chứa đựng'],
    ['构成', 'gòuchéng', 'Cấu thành / Tạo nên'],
    ['形成', 'xíngchéng', 'Hình thành'],
    ['导致', 'dǎozhì', 'Dẫn đến'],
    ['促进', 'cùjìn', 'Thúc đẩy'],
    ['阻碍', 'zǔ\'ài', 'Cản trở'],
    ['克服', 'kèfú', 'Khắc phục / Vượt qua'],
    ['实现', 'shíxiàn', 'Thực hiện / Đạt được'],
    ['追求', 'zhuīqiú', 'Theo đuổi'],
    ['价值', 'jiàzhí', 'Giá trị'],
    ['意义', 'yìyì', 'Ý nghĩa'],
    ['目标', 'mùbiāo', 'Mục tiêu'],
    ['愿景', 'yuànjǐng', 'Tầm nhìn / Viễn cảnh'],
    ['使命', 'shǐmìng', 'Sứ mệnh'],
    ['贡献', 'gòngxiàn', 'Đóng góp'],
    ['影响力', 'yǐngxiǎnglì', 'Sức ảnh hưởng'],
    ['竞争力', 'jìngzhēnglì', 'Năng lực cạnh tranh'],
    ['可持续', 'kě chíxù', 'Bền vững'],
    ['协调', 'xiétiáo', 'Điều phối / Hài hòa'],
    ['平衡', 'pínghéng', 'Cân bằng'],
    ['多元', 'duōyuán', 'Đa dạng'],
    ['包容', 'bāoróng', 'Bao dung'],
    ['开放', 'kāifàng', 'Cởi mở'],
    ['保守', 'bǎoshǒu', 'Bảo thủ'],
    ['改革', 'gǎigé', 'Cải cách'],
    ['转型', 'zhuǎnxíng', 'Chuyển đổi'],
    ['升级', 'shēngjí', 'Nâng cấp'],
    ['融合', 'rónghé', 'Hội nhập / Hòa quyện'],
    ['创造', 'chuàngzào', 'Sáng tạo'],
  ],
  HSK6: [
    ['辩证法', 'biànzhèngfǎ', 'Phép biện chứng'],
    ['认识论', 'rènshílùn', 'Nhận thức luận'],
    ['世界观', 'shìjièguān', 'Thế giới quan'],
    ['方法论', 'fāngfǎlùn', 'Phương pháp luận'],
    ['宏观', 'hóngguān', 'Vĩ mô'],
    ['微观', 'wēiguān', 'Vi mô'],
    ['系统性', 'xìtǒngxìng', 'Tính hệ thống'],
    ['战略性', 'zhànlüèxìng', 'Tính chiến lược'],
    ['全局性', 'quánjúxìng', 'Tính toàn cục'],
    ['深层次', 'shēncéngcì', 'Tầng sâu / Chiều sâu'],
    ['潜移默化', 'qián yí mò huà', 'Ảnh hưởng ngầm / Thay đổi dần dà'],
    ['举一反三', 'jǔ yī fǎn sān', 'Từ một suy ra nhiều'],
    ['触类旁通', 'chù lèi páng tōng', 'Hiểu loại này, thông loại kia'],
    ['融会贯通', 'róng huì guàn tōng', 'Tổng hòa thông suốt'],
    ['循序渐进', 'xún xù jiàn jìn', 'Tuần tự tiến lên / Từ từ tiến bộ'],
    ['因地制宜', 'yīn dì zhì yí', 'Tùy điều kiện mà xử lý'],
    ['与时俱进', 'yǔ shí jù jìn', 'Bắt kịp thời đại'],
    ['实事求是', 'shí shì qiú shì', 'Thực sự cầu thị / Tôn trọng thực tế'],
    ['与众不同', 'yǔ zhòng bù tóng', 'Khác với số đông / Độc đáo'],
    ['前所未有', 'qián suǒ wèi yǒu', 'Chưa từng có trước đây'],
    ['可持续发展', 'kě chíxù fāzhǎn', 'Phát triển bền vững'],
    ['生态文明', 'shēngtài wénmíng', 'Văn minh sinh thái'],
    ['碳中和', 'tàn zhōnghé', 'Trung hòa carbon'],
    ['数字经济', 'shùzì jīngjì', 'Kinh tế số'],
    ['人工智能', 'réngōng zhìnéng', 'Trí tuệ nhân tạo'],
    ['大数据', 'dà shùjù', 'Dữ liệu lớn'],
    ['云计算', 'yún jìsuàn', 'Điện toán đám mây'],
    ['区块链', 'qūkuài liàn', 'Blockchain'],
    ['元宇宙', 'yuán yǔzhòu', 'Metaverse'],
    ['共同富裕', 'gòngtóng fùyù', 'Thịnh vượng chung'],
    ['脱贫攻坚', 'tuō pín gōngjiān', 'Xóa đói giảm nghèo'],
    ['乡村振兴', 'xiāngcūn zhènxīng', 'Phục hưng nông thôn'],
    ['全球治理', 'quánqiú zhìlǐ', 'Quản trị toàn cầu'],
    ['命运共同体', 'mìngyùn gòngtóngtǐ', 'Cộng đồng chung vận mệnh'],
    ['互联互通', 'hù lián hù tōng', 'Kết nối qua lại'],
    ['南南合作', 'nán nán hézuò', 'Hợp tác Nam-Nam'],
    ['多边主义', 'duōbiān zhǔyì', 'Chủ nghĩa đa phương'],
    ['单边主义', 'dānbiān zhǔyì', 'Chủ nghĩa đơn phương'],
    ['意识形态', 'yìshí xíngtài', 'Ý thức hệ'],
    ['话语权', 'huàyǔquán', 'Quyền phát ngôn'],
    ['软实力', 'ruǎn shílì', 'Quyền lực mềm'],
    ['硬实力', 'yìng shílì', 'Quyền lực cứng'],
    ['综合国力', 'zōnghé guólì', 'Sức mạnh tổng hợp quốc gia'],
    ['国际竞争力', 'guójì jìngzhēnglì', 'Sức cạnh tranh quốc tế'],
    ['核心竞争力', 'héxīn jìngzhēnglì', 'Năng lực cạnh tranh cốt lõi'],
    ['自主创新', 'zìzhǔ chuàngxīn', 'Tự chủ đổi mới sáng tạo'],
    ['知识产权', 'zhīshí chǎnquán', 'Quyền sở hữu trí tuệ'],
    ['供应链', 'gōngyìng liàn', 'Chuỗi cung ứng'],
    ['产业链', 'chǎnyè liàn', 'Chuỗi công nghiệp'],
    ['价值链', 'jiàzhí liàn', 'Chuỗi giá trị'],
  ],
};

// ─── Main ────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Seeding HSK module...\n');

  // 1. Upsert Levels
  console.log('📚 Creating HSK levels...');
  for (const lvl of HSK_LEVELS) {
    await prisma.level.upsert({
      where: { code: lvl.code },
      update: { name: lvl.name, description: lvl.description, order: lvl.order, subject: lvl.subject },
      create: lvl,
    });
    console.log(`   ✓ ${lvl.code}`);
  }

  // 2. Chinese Passages
  console.log('\n📖 Creating Chinese passages...');
  for (const p of PASSAGES) {
    const existing = await prisma.chinesePassage.findFirst({ where: { title: p.title, level: p.level } });
    if (!existing) {
      await prisma.chinesePassage.create({ data: p });
      console.log(`   ✓ [${p.level}] ${p.title}`);
    } else {
      console.log(`   – [${p.level}] ${p.title} (already exists)`);
    }
  }

  // 3. Vocabulary (LearningCategory + LearningLesson + LearningItem)
  console.log('\n📝 Creating vocabulary...');
  for (const [levelCode, words] of Object.entries(VOCAB)) {
    const level = await prisma.level.findUnique({ where: { code: levelCode } });
    if (!level) { console.log(`   ⚠ Level ${levelCode} not found, skipping vocab`); continue; }

    let category = await prisma.learningCategory.findFirst({ where: { levelId: level.id, name: `Từ vựng ${levelCode}` } });
    if (!category) {
      category = await prisma.learningCategory.create({
        data: { levelId: level.id, name: `Từ vựng ${levelCode}`, description: `Danh sách ${words.length} từ vựng chuẩn ${levelCode}`, skill: 'vocab', order: 1 },
      });
    }

    let lesson = await prisma.learningLesson.findFirst({ where: { categoryId: category.id, title: `Tất cả từ vựng ${levelCode}` } });
    if (!lesson) {
      lesson = await prisma.learningLesson.create({
        data: { categoryId: category.id, title: `Tất cả từ vựng ${levelCode}`, description: `${words.length} từ vựng quan trọng nhất ${levelCode}`, order: 1 },
      });
    }

    let created = 0;
    for (const [term, pronunciation, meaning] of words) {
      const existing = await prisma.content.findFirst({ where: { lessonId: lesson.id, term } });
      if (!existing) {
        await prisma.content.create({
          data: {
            lessonId: lesson.id, term, pronunciation, type: 'vocab', language: 'zh', order: 0,
            meanings: { create: [{ language: 'vi', meaning }] },
          },
        });
        created++;
      }
    }
    console.log(`   ✓ ${levelCode}: ${created} new vocab items`);
  }

  // Summary
  const passageCount = await prisma.chinesePassage.count();
  console.log(`\n✅ Done! Total ChinesePassage rows: ${passageCount}`);
  const itemCount = await prisma.content.count();
  console.log(`✅ Total Content rows: ${itemCount}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
