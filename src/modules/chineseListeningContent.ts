export type HskLevel = 'HSK1' | 'HSK2' | 'HSK3' | 'HSK4' | 'HSK5' | 'HSK6';
export type HskListeningType = 'Hội thoại' | 'Độc thoại' | 'Thông báo' | 'Phỏng vấn';

export interface HskListeningSegment {
  speaker: string;
  text: string;
  pinyin?: string;
}

export interface HskListeningPractice {
  id: string;
  level: HskLevel;
  type: HskListeningType;
  title: string;
  titleVi: string;
  summary: string;
  situation: string;
  durationSec: number;
  focus: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  audioUrl?: string | null;
  segments: HskListeningSegment[];
}

export const HSK_LEVEL_META: Record<HskLevel, { badgeBg: string; badgeText: string; accent: string; desc: string }> = {
  HSK1: { badgeBg: '#DCFCE7', badgeText: '#15803D', accent: '#4ADE80', desc: 'Câu đơn, từ cơ bản' },
  HSK2: { badgeBg: '#DBEAFE', badgeText: '#1D4ED8', accent: '#60A5FA', desc: 'Hội thoại ngắn hàng ngày' },
  HSK3: { badgeBg: '#FEF9C3', badgeText: '#92400E', accent: '#FACC15', desc: 'Tình huống giao tiếp thường gặp' },
  HSK4: { badgeBg: '#FFEDD5', badgeText: '#C2410C', accent: '#FB923C', desc: 'Chủ đề xã hội, công việc' },
  HSK5: { badgeBg: '#F3E8FF', badgeText: '#6B21A8', accent: '#C084FC', desc: 'Nội dung phức tạp, học thuật' },
  HSK6: { badgeBg: '#FFE4E6', badgeText: '#BE123C', accent: '#FB7185', desc: 'Thảo luận chuyên sâu, trừu tượng' },
};

export const HSK_LISTENING_TYPE_LABELS: Record<HskListeningType, string> = {
  'Hội thoại':  'Nghe và chọn đáp án đúng',
  'Độc thoại':  'Nghe độc thoại, tìm ý chính',
  'Thông báo':  'Nghe thông báo công cộng',
  'Phỏng vấn': 'Nghe phỏng vấn, tóm tắt ý',
};

export const CHINESE_LISTENING_PRACTICES: HskListeningPractice[] = [
  // ─── HSK 1 ───────────────────────────────────────────────────────────────────
  {
    id: 'hsk1-ht-greet',
    level: 'HSK1',
    type: 'Hội thoại',
    title: '问好 — Chào hỏi',
    titleVi: 'Hội thoại chào hỏi buổi sáng',
    summary: 'Hội thoại ngắn giữa hai người gặp nhau buổi sáng.',
    situation: 'Hai học sinh gặp nhau trước cửa trường.',
    durationSec: 28,
    focus: 'Chào hỏi cơ bản, hỏi thăm sức khỏe',
    question: 'Người A hỏi người B điều gì?',
    options: ['Tên là gì', 'Có khỏe không', 'Bao nhiêu tuổi', 'Ở đâu'],
    answer: 'Có khỏe không',
    explanation: '人A 问"你好吗？" — đây là câu hỏi thăm sức khỏe cơ bản nhất.',
    segments: [
      { speaker: 'A', text: '你好！', pinyin: 'Nǐ hǎo!' },
      { speaker: 'B', text: '你好！你好吗？', pinyin: 'Nǐ hǎo! Nǐ hǎo ma?' },
      { speaker: 'A', text: '我很好，谢谢。你呢？', pinyin: 'Wǒ hěn hǎo, xièxiè. Nǐ ne?' },
      { speaker: 'B', text: '我也很好！', pinyin: 'Wǒ yě hěn hǎo!' },
    ],
  },
  {
    id: 'hsk1-ht-buy',
    level: 'HSK1',
    type: 'Hội thoại',
    title: '买东西 — Mua đồ',
    titleVi: 'Mua nước ở cửa hàng',
    summary: 'Nghe hội thoại mua nước uống.',
    situation: 'Khách mua nước ở cửa hàng tiện lợi.',
    durationSec: 32,
    focus: 'Số đếm, hỏi giá tiền',
    question: 'Một chai nước giá bao nhiêu?',
    options: ['一块', '两块', '三块', '五块'],
    answer: '两块',
    explanation: '售货员说"两块钱" — hai tệ một chai.',
    segments: [
      { speaker: 'A', text: '这个水多少钱？', pinyin: 'Zhège shuǐ duōshao qián?' },
      { speaker: 'B', text: '两块钱一瓶。', pinyin: 'Liǎng kuài qián yī píng.' },
      { speaker: 'A', text: '我要两瓶。', pinyin: 'Wǒ yào liǎng píng.' },
      { speaker: 'B', text: '好，四块钱。谢谢！', pinyin: 'Hǎo, sì kuài qián. Xièxiè!' },
    ],
  },
  // ─── HSK 2 ───────────────────────────────────────────────────────────────────
  {
    id: 'hsk2-ht-weather',
    level: 'HSK2',
    type: 'Hội thoại',
    title: '天气 — Thời tiết',
    titleVi: 'Nói về thời tiết hôm nay',
    summary: 'Hội thoại về thời tiết và kế hoạch ra ngoài.',
    situation: 'Hai bạn nhắn tin hỏi về thời tiết.',
    durationSec: 38,
    focus: 'Mô tả thời tiết, bày tỏ ý định',
    question: 'Họ quyết định làm gì?',
    options: ['Ở nhà xem phim', 'Đi dạo công viên', 'Đi siêu thị', 'Đến thư viện'],
    answer: 'Đi dạo công viên',
    explanation: '两人 决定去公园 因为天气很好。',
    segments: [
      { speaker: 'A', text: '今天天气怎么样？', pinyin: 'Jīntiān tiānqì zěnmeyàng?' },
      { speaker: 'B', text: '天气很好，有阳光，不冷也不热。', pinyin: 'Tiānqì hěn hǎo, yǒu yángguāng, bù lěng yě bù rè.' },
      { speaker: 'A', text: '那我们去公园走走吧。', pinyin: 'Nà wǒmen qù gōngyuán zǒuzou ba.' },
      { speaker: 'B', text: '好主意！几点出发？', pinyin: 'Hǎo zhǔyì! Jǐ diǎn chūfā?' },
      { speaker: 'A', text: '下午两点怎么样？', pinyin: 'Xiàwǔ liǎng diǎn zěnmeyàng?' },
      { speaker: 'B', text: '可以，两点见！', pinyin: 'Kěyǐ, liǎng diǎn jiàn!' },
    ],
  },
  {
    id: 'hsk2-tb-school',
    level: 'HSK2',
    type: 'Thông báo',
    title: '学校通知 — Thông báo trường học',
    titleVi: 'Thông báo lịch nghỉ',
    summary: 'Nghe thông báo về kỳ nghỉ lễ của trường.',
    situation: 'Loa thông báo tại trường học.',
    durationSec: 30,
    focus: 'Thông tin sự kiện, thời gian',
    question: 'Trường nghỉ mấy ngày?',
    options: ['1 ngày', '2 ngày', '3 ngày', '5 ngày'],
    answer: '3 ngày',
    explanation: '通知说"放假三天" — nghỉ ba ngày.',
    segments: [
      { speaker: 'Announcer', text: '同学们请注意，下周一到周三学校放假三天。', pinyin: 'Tóngxuémen qǐng zhùyì, xià zhōuyī dào zhōusān xuéxiào fàngjià sān tiān.' },
      { speaker: 'Announcer', text: '周四正常上课，请同学们合理安排时间。', pinyin: 'Zhōusì zhèngcháng shàngkè, qǐng tóngxuémen hélǐ ānpái shíjiān.' },
    ],
  },
  // ─── HSK 3 ───────────────────────────────────────────────────────────────────
  {
    id: 'hsk3-ht-work',
    level: 'HSK3',
    type: 'Hội thoại',
    title: '工作计划 — Kế hoạch công việc',
    titleVi: 'Thảo luận kế hoạch dự án',
    summary: 'Hai đồng nghiệp bàn về tiến độ dự án.',
    situation: 'Văn phòng công ty, giờ họp buổi sáng.',
    durationSec: 48,
    focus: 'Từ vựng công việc, diễn đạt kế hoạch',
    question: 'Dự án sẽ hoàn thành khi nào?',
    options: ['Tuần này', 'Cuối tháng', 'Tháng sau', '3 tháng sau'],
    answer: 'Cuối tháng',
    explanation: '他说"这个月底完成" — hoàn thành cuối tháng này.',
    segments: [
      { speaker: 'A', text: '这个项目进展怎么样了？', pinyin: 'Zhège xiàngmù jìnzhǎn zěnmeyàng le?' },
      { speaker: 'B', text: '进展很顺利，我们预计这个月底可以完成。', pinyin: 'Jìnzhǎn hěn shùnlì, wǒmen yùjì zhège yuèdǐ kěyǐ wánchéng.' },
      { speaker: 'A', text: '太好了！有没有遇到什么困难？', pinyin: 'Tài hǎo le! Yǒu méiyǒu yùdào shénme kùnnán?' },
      { speaker: 'B', text: '有一些小问题，但都已经解决了。', pinyin: 'Yǒu yīxiē xiǎo wèntí, dàn dōu yǐjīng jiějué le.' },
      { speaker: 'A', text: '好的，如果有需要帮助的地方，随时告诉我。', pinyin: 'Hǎo de, rúguǒ yǒu xūyào bāngzhù de dìfāng, suíshí gàosù wǒ.' },
    ],
  },
  {
    id: 'hsk3-dt-health',
    level: 'HSK3',
    type: 'Độc thoại',
    title: '健康饮食 — Ăn uống lành mạnh',
    titleVi: 'Chia sẻ về chế độ ăn uống',
    summary: 'Nghe một người chia sẻ thói quen ăn uống lành mạnh.',
    situation: 'Bài nói ngắn trong chương trình radio.',
    durationSec: 42,
    focus: 'Thói quen sức khỏe, từ vựng ẩm thực',
    question: 'Người này không ăn gì vào buổi tối?',
    options: ['Rau', 'Đồ ngọt', 'Cá', 'Cơm'],
    answer: 'Đồ ngọt',
    explanation: '她说"晚上不吃甜食" — buổi tối không ăn đồ ngọt.',
    segments: [
      { speaker: 'Speaker', text: '我平时很注意饮食健康。早上吃燕麦和水果，中午吃米饭、蔬菜和鱼。', pinyin: 'Wǒ píngshí hěn zhùyì yǐnshí jiànkāng. Zǎoshang chī yànmài hé shuǐguǒ, zhōngwǔ chī mǐfàn、shūcài hé yú.' },
      { speaker: 'Speaker', text: '晚上吃得少，不吃甜食，也不喝饮料，只喝白开水。', pinyin: 'Wǎnshang chī de shǎo, bù chī tiánshí, yě bù hē yǐnliào, zhǐ hē báikāishuǐ.' },
      { speaker: 'Speaker', text: '我觉得这样的饮食习惯让我精力充沛，睡眠也很好。', pinyin: 'Wǒ juéde zhèyàng de yǐnshí xíguàn ràng wǒ jīnglì chōngpèi, shuìmián yě hěn hǎo.' },
    ],
  },
  // ─── HSK 4 ───────────────────────────────────────────────────────────────────
  {
    id: 'hsk4-ht-travel',
    level: 'HSK4',
    type: 'Hội thoại',
    title: '旅行计划 — Kế hoạch du lịch',
    titleVi: 'Lên kế hoạch chuyến du lịch',
    summary: 'Hai người bạn bàn luận về chuyến đi Thượng Hải.',
    situation: 'Cuộc gọi điện thoại lên kế hoạch.',
    durationSec: 55,
    focus: 'Lên kế hoạch, diễn đạt ý kiến',
    question: 'Họ sẽ đi bằng phương tiện gì?',
    options: ['Máy bay', 'Tàu hỏa cao tốc', 'Xe khách', 'Ô tô riêng'],
    answer: 'Tàu hỏa cao tốc',
    explanation: '他们决定坐高铁，因为便宜又方便。',
    segments: [
      { speaker: 'A', text: '我们下周去上海，你打算怎么去？', pinyin: 'Wǒmen xià zhōu qù Shànghǎi, nǐ dǎsuàn zěnme qù?' },
      { speaker: 'B', text: '飞机票太贵了，我觉得坐高铁比较合适，又快又便宜。', pinyin: 'Fēijī piào tài guì le, wǒ juéde zuò gāotiě bǐjiào héshì, yòu kuài yòu piányí.' },
      { speaker: 'A', text: '高铁要多长时间？', pinyin: 'Gāotiě yào duō cháng shíjiān?' },
      { speaker: 'B', text: '大约四个小时，比飞机慢一点，但是从市区出发很方便。', pinyin: 'Dàyuē sì gè xiǎoshí, bǐ fēijī màn yīdiǎn, dànshì cóng shìqū chūfā hěn fāngbiàn.' },
      { speaker: 'A', text: '说得对，那我们订高铁票吧。', pinyin: 'Shuō de duì, nà wǒmen dìng gāotiě piào ba.' },
    ],
  },
  {
    id: 'hsk4-pw-society',
    level: 'HSK4',
    type: 'Phỏng vấn',
    title: '环境保护 — Bảo vệ môi trường',
    titleVi: 'Phỏng vấn về bảo vệ môi trường',
    summary: 'Nghe phóng viên phỏng vấn một chuyên gia.',
    situation: 'Chương trình tọa đàm trên đài phát thanh.',
    durationSec: 60,
    focus: 'Từ vựng môi trường, diễn đạt quan điểm',
    question: 'Chuyên gia khuyên mỗi người nên làm gì?',
    options: ['Trồng cây', 'Giảm dùng túi nhựa', 'Đi xe đạp', 'Tiết kiệm điện nước'],
    answer: 'Giảm dùng túi nhựa',
    explanation: '专家说减少使用塑料袋是每个人都能做到的事情。',
    segments: [
      { speaker: 'Phóng viên', text: '请问，普通人在日常生活中可以做哪些事来保护环境？', pinyin: 'Qǐngwèn, pǔtōngrén zài rìcháng shēnghuó zhōng kěyǐ zuò nǎxiē shì lái bǎohù huánjìng?' },
      { speaker: 'Chuyên gia', text: '方法很多，但最简单、立竿见影的就是减少使用一次性塑料袋。', pinyin: 'Fāngfǎ hěn duō, dàn zuì jiǎndān、lìgān-jiànyǐng de jiùshì jiǎnshǎo shǐyòng yīcìxìng sùliào dài.' },
      { speaker: 'Chuyên gia', text: '每人每天少用一个塑料袋，一年下来就能减少几百个，效果非常显著。', pinyin: 'Měi rén měitiān shǎo yòng yīgè sùliào dài, yī nián xiàlái jiù néng jiǎnshǎo jǐ bǎi gè, xiàoguǒ fēicháng xiǎnzhù.' },
    ],
  },
  // ─── HSK 5 ───────────────────────────────────────────────────────────────────
  {
    id: 'hsk5-dt-economy',
    level: 'HSK5',
    type: 'Độc thoại',
    title: '数字经济 — Kinh tế số',
    titleVi: 'Xu hướng kinh tế số',
    summary: 'Nghe bài phân tích về tác động của kinh tế số.',
    situation: 'Bài giảng mở đầu khóa học kinh tế.',
    durationSec: 65,
    focus: 'Từ vựng kinh tế, phân tích xu hướng',
    question: 'Kinh tế số ảnh hưởng ra sao đến thị trường lao động?',
    options: [
      'Chỉ tạo ra nhiều việc làm mới',
      'Vừa tạo việc làm mới vừa làm mất đi một số nghề cũ',
      'Không ảnh hưởng nhiều',
      'Làm mất hoàn toàn việc làm truyền thống',
    ],
    answer: 'Vừa tạo việc làm mới vừa làm mất đi một số nghề cũ',
    explanation: '讲者说数字经济"创造了新岗位，也淘汰了部分传统职业"。',
    segments: [
      { speaker: 'Lecturer', text: '数字经济正在深刻改变我们的生产和生活方式。电商、人工智能、大数据等新兴行业蓬勃发展，', pinyin: 'Shùzì jīngjì zhèngzài shēnkè gǎibiàn wǒmen de shēngchǎn hé shēnghuó fāngshì. Diànshāng, réngōng zhìnéng, dà shùjù děng xīnxīng hángyè péngbó fāzhǎn,' },
      { speaker: 'Lecturer', text: '创造了大量新就业岗位。然而与此同时，部分传统职业也面临被自动化取代的压力。', pinyin: 'Chuàngzàole dàliàng xīn jiùyè gǎngwèi. Rán ér yǔ cǐ tóngshí, bùfèn chuántǒng zhíyè yě miànlín bèi zìdònghuà qǔdài de yālì.' },
      { speaker: 'Lecturer', text: '因此，如何在享受技术红利的同时，帮助受冲击的劳动者转型，是当前最重要的社会课题之一。', pinyin: 'Yīncǐ, rúhé zài xiǎngshòu jìshù hónglì de tóngshí, bāngzhù shòu chōngjī de láodòngzhě zhuǎnxíng, shì dāngqián zuì zhòngyào de shèhuì kètí zhī yī.' },
    ],
  },
  {
    id: 'hsk5-pw-education',
    level: 'HSK5',
    type: 'Phỏng vấn',
    title: '教育改革 — Cải cách giáo dục',
    titleVi: 'Thảo luận về đổi mới giáo dục',
    summary: 'Phỏng vấn một chuyên gia giáo dục về phương pháp học mới.',
    situation: 'Chương trình podcast chuyên đề giáo dục.',
    durationSec: 70,
    focus: 'Thuật ngữ giáo dục, lập luận',
    question: 'Theo chuyên gia, điều quan trọng nhất trong giáo dục hiện đại là gì?',
    options: [
      'Học thuộc lòng thật nhiều kiến thức',
      'Rèn luyện tư duy phản biện và sáng tạo',
      'Tập trung vào kỳ thi đầu vào đại học',
      'Học ngoại ngữ từ nhỏ',
    ],
    answer: 'Rèn luyện tư duy phản biện và sáng tạo',
    explanation: '专家认为"培养批判性思维和创造力"比死记硬背更重要。',
    segments: [
      { speaker: 'Host', text: '您认为现代教育最应该培养学生哪方面的能力？', pinyin: 'Nín rènwéi xiàndài jiàoyù zuì yīnggāi péiyǎng xuéshēng nǎ fāngmiàn de nénglì?' },
      { speaker: 'Expert', text: '我认为是批判性思维和创造力。传统教育过于注重知识的灌输，而忽视了学生独立思考和解决问题的能力。', pinyin: 'Wǒ rènwéi shì pīpànxìng sīwéi hé chuàngzàolì. Chuántǒng jiàoyù guòyú zhùzhòng zhīshì de guànshū, ér hūshìle xuéshēng dúlì sīkǎo hé jiějué wèntí de nénglì.' },
      { speaker: 'Expert', text: '未来的社会需要的是能够面对未知、灵活应变的人才，而不是只会背书的机器。', pinyin: 'Wèilái de shèhuì xūyào de shì nénggòu miànduì wèizhī, línghuó yìngbiàn de réncái, ér bùshì zhǐ huì bèishū de jīqì.' },
    ],
  },
  // ─── HSK 6 ───────────────────────────────────────────────────────────────────
  {
    id: 'hsk6-dt-culture',
    level: 'HSK6',
    type: 'Độc thoại',
    title: '文化软实力 — Sức mạnh mềm văn hóa',
    titleVi: 'Bài luận về sức mạnh mềm',
    summary: 'Nghe bài phân tích sâu về vai trò văn hóa trong ngoại giao.',
    situation: 'Tham luận tại hội nghị học thuật.',
    durationSec: 80,
    focus: 'Từ vựng học thuật, lập luận phức tạp',
    question: 'Tác giả cho rằng điều gì làm nên sức mạnh mềm văn hóa?',
    options: [
      'Quân sự và kinh tế mạnh',
      'Xuất khẩu hàng hóa nhiều',
      'Giá trị và sức hút văn hóa được thế giới công nhận',
      'Số lượng người học tiếng',
    ],
    answer: 'Giá trị và sức hút văn hóa được thế giới công nhận',
    explanation: '演讲者说文化软实力来自"被国际社会认可的文化价值与吸引力"。',
    segments: [
      { speaker: 'Speaker', text: '文化软实力，是一国通过文化吸引力、价值观和外交影响力所产生的非强制性国际影响，区别于以军事和经济为基础的硬实力。', pinyin: 'Wénhuà ruǎn shílì, shì yī guó tōngguò wénhuà xīyǐn lì、jiàzhíguān hé wàijiāo yǐngxiǎng lì suǒ chǎnshēng de fēi qiángzhìxìng guójì yǐngxiǎng, qūbié yú yǐ jūnshì hé jīngjì wéi jīchǔ de yìng shílì.' },
      { speaker: 'Speaker', text: '一个国家的文化软实力，核心在于其文化所蕴含的普世价值是否能够引起国际社会的共鸣与认同。', pinyin: 'Yīgè guójiā de wénhuà ruǎn shílì, héxīn zàiyú qí wénhuà suǒ yùnhán de pǔshì jiàzhí shìfǒu nénggòu yǐnqǐ guójì shèhuì de gòngmíng yǔ rèntóng.' },
      { speaker: 'Speaker', text: '因此，提升文化软实力不仅需要对外传播，更需要不断深化和创新本民族的文化内涵。', pinyin: 'Yīncǐ, tíshēng wénhuà ruǎn shílì bùjǐn xūyào duìwài chuánbō, gèng xūyào bùduàn shēnhuà hé chuàngxīn běn mínzú de wénhuà nèihán.' },
    ],
  },
  {
    id: 'hsk6-pw-tech',
    level: 'HSK6',
    type: 'Phỏng vấn',
    title: '人工智能与伦理 — AI và đạo đức',
    titleVi: 'Tranh luận về đạo đức trong AI',
    summary: 'Nghe cuộc tranh luận chuyên sâu về AI và quyền con người.',
    situation: 'Chương trình tọa đàm học thuật truyền hình.',
    durationSec: 85,
    focus: 'Từ vựng công nghệ và triết học, lập luận đa chiều',
    question: 'Quan điểm nào được hai bên đồng thuận?',
    options: [
      'AI nên bị cấm hoàn toàn',
      'AI không có nguy cơ gì',
      'Cần có khung pháp lý điều chỉnh AI',
      'AI sẽ thay thế hoàn toàn con người',
    ],
    answer: 'Cần có khung pháp lý điều chỉnh AI',
    explanation: '两人都认同"需要建立完善的法律框架来规范AI的发展和使用"。',
    segments: [
      { speaker: 'Guest A', text: '人工智能的发展速度令人叹为观止，但我们必须正视它带来的伦理挑战，尤其是隐私侵犯和算法偏见等问题。', pinyin: 'Réngōng zhìnéng de fāzhǎn sùdù lìng rén tàn wéi guān zhǐ, dàn wǒmen bìxū zhèngshì tā dài lái de lúnlǐ tiǎozhàn, yóuqí shì yǐnsī qīnfàn hé suànfǎ piānjiàn děng wèntí.' },
      { speaker: 'Guest B', text: '我同意这些担忧不可忽视，但过度监管可能会扼杀创新。关键在于找到平衡——通过完善的法律框架来规范，而非全面限制。', pinyin: 'Wǒ tóngyì zhèxiē dānyōu bùkě hūshì, dàn guòdù jiānguǎn kěnéng huì èshā chuàngxīn. Guānjiàn zàiyú zhǎodào pínghéng——tōngguò wánshàn de fǎlǜ kuàngjià lái guīfàn, ér fēi quánmiàn xiànzhì.' },
      { speaker: 'Guest A', text: '这一点我赞同。建立透明、可问责的AI监管机制，是我们双方都认为最迫切的任务。', pinyin: 'Zhè yīdiǎn wǒ zàntóng. Jiànlì tòumíng、kě wèn zé de AI jiānguǎn jīzhì, shì wǒmen shuāngfāng dōu rènwéi zuì pòqiè de rènwù.' },
    ],
  },
];
