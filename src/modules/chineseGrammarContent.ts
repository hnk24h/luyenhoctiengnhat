export type HskGrammarLevel = 'HSK1' | 'HSK2' | 'HSK3' | 'HSK4' | 'HSK5' | 'HSK6';

export interface GrammarExample {
  chinese: string;
  pinyin: string;
  vietnamese: string;
}

export interface GrammarPattern {
  id: string;
  level: HskGrammarLevel;
  pattern: string;          // e.g. "Subject + 是 + Noun"
  name: string;             // Short name
  nameVi: string;           // Vietnamese name
  usage: string;            // Brief usage explanation
  structure: string;        // Structure template
  examples: GrammarExample[];
}

export const HSK_GRAMMAR: GrammarPattern[] = [
  // ─── HSK 1 ────────────────────────────────────────────────────────────────
  {
    id: 'hsk1-shi',
    level: 'HSK1',
    pattern: '…是…',
    name: '是字句',
    nameVi: 'Câu với 是 (là)',
    usage: 'Dùng để xác định danh tính, nghề nghiệp, quốc tịch hoặc mối quan hệ.',
    structure: 'Chủ ngữ + 是 + Danh từ',
    examples: [
      { chinese: '我是学生。', pinyin: 'Wǒ shì xuéshēng.', vietnamese: 'Tôi là học sinh.' },
      { chinese: '他是中国人。', pinyin: 'Tā shì Zhōngguórén.', vietnamese: 'Anh ấy là người Trung Quốc.' },
      { chinese: '这是我的书。', pinyin: 'Zhè shì wǒ de shū.', vietnamese: 'Đây là sách của tôi.' },
    ],
  },
  {
    id: 'hsk1-you',
    level: 'HSK1',
    pattern: '…有…',
    name: '有字句',
    nameVi: 'Câu với 有 (có)',
    usage: 'Diễn tả sự sở hữu hoặc sự tồn tại của sự vật.',
    structure: 'Chủ ngữ + 有 + Tân ngữ',
    examples: [
      { chinese: '我有一本书。', pinyin: 'Wǒ yǒu yī běn shū.', vietnamese: 'Tôi có một quyển sách.' },
      { chinese: '教室里有五十个学生。', pinyin: 'Jiàoshì lǐ yǒu wǔshí gè xuéshēng.', vietnamese: 'Trong lớp học có năm mươi học sinh.' },
      { chinese: '你有时间吗？', pinyin: 'Nǐ yǒu shíjiān ma?', vietnamese: 'Bạn có thời gian không?' },
    ],
  },
  {
    id: 'hsk1-ma',
    level: 'HSK1',
    pattern: '…吗？',
    name: '吗疑问句',
    nameVi: 'Câu hỏi với 吗',
    usage: 'Thêm 吗 vào cuối câu kể để tạo câu hỏi có/không.',
    structure: 'Câu kể + 吗？',
    examples: [
      { chinese: '你是日本人吗？', pinyin: 'Nǐ shì rìběnrén ma?', vietnamese: 'Bạn là người Nhật không?' },
      { chinese: '你喜欢吃中国菜吗？', pinyin: 'Nǐ xǐhuān chī zhōngguó cài ma?', vietnamese: 'Bạn có thích ăn đồ Trung Quốc không?' },
      { chinese: '他今天来吗？', pinyin: 'Tā jīntiān lái ma?', vietnamese: 'Hôm nay anh ấy có đến không?' },
    ],
  },
  {
    id: 'hsk1-bu',
    level: 'HSK1',
    pattern: '不 + Động từ / Tính từ',
    name: '不否定句',
    nameVi: 'Phủ định với 不',
    usage: 'Phủ định hành động hiện tại/thói quen hoặc tính chất.',
    structure: 'Chủ ngữ + 不 + Động từ/Tính từ',
    examples: [
      { chinese: '我不喝咖啡。', pinyin: 'Wǒ bù hē kāfēi.', vietnamese: 'Tôi không uống cà phê.' },
      { chinese: '这个菜不好吃。', pinyin: 'Zhège cài bù hǎochī.', vietnamese: 'Món này không ngon.' },
      { chinese: '他今天不来。', pinyin: 'Tā jīntiān bù lái.', vietnamese: 'Hôm nay anh ấy không đến.' },
    ],
  },

  // ─── HSK 2 ────────────────────────────────────────────────────────────────
  {
    id: 'hsk2-bi',
    level: 'HSK2',
    pattern: '…比…',
    name: '比较句',
    nameVi: 'Câu so sánh với 比',
    usage: 'So sánh hai sự vật hoặc người về một đặc điểm.',
    structure: 'A + 比 + B + Tính từ',
    examples: [
      { chinese: '今天比昨天冷。', pinyin: 'Jīntiān bǐ zuótiān lěng.', vietnamese: 'Hôm nay lạnh hơn hôm qua.' },
      { chinese: '苹果比橙子便宜。', pinyin: 'Píngguǒ bǐ chéngzi piányí.', vietnamese: 'Táo rẻ hơn cam.' },
      { chinese: '他比我高一点儿。', pinyin: 'Tā bǐ wǒ gāo yīdiǎnr.', vietnamese: 'Anh ấy cao hơn tôi một chút.' },
    ],
  },
  {
    id: 'hsk2-guo',
    level: 'HSK2',
    pattern: '…过…',
    name: '经历体',
    nameVi: 'Trải nghiệm quá khứ với 过',
    usage: 'Diễn đạt rằng chủ ngữ đã từng có kinh nghiệm làm một việc gì đó.',
    structure: 'Chủ ngữ + Động từ + 过 + (Tân ngữ)',
    examples: [
      { chinese: '我去过北京。', pinyin: 'Wǒ qùguò Běijīng.', vietnamese: 'Tôi đã từng đến Bắc Kinh.' },
      { chinese: '你吃过饺子吗？', pinyin: 'Nǐ chīguò jiǎozi ma?', vietnamese: 'Bạn đã từng ăn sủi cảo chưa?' },
      { chinese: '他没来过这里。', pinyin: 'Tā méi láiguò zhèlǐ.', vietnamese: 'Anh ấy chưa bao giờ đến đây.' },
    ],
  },
  {
    id: 'hsk2-le',
    level: 'HSK2',
    pattern: '…了…',
    name: '完成体',
    nameVi: 'Hoàn thành với 了',
    usage: 'Đánh dấu một hành động đã hoàn thành hoặc thay đổi trạng thái.',
    structure: 'Chủ ngữ + Động từ + 了 + (Tân ngữ)',
    examples: [
      { chinese: '我吃了早饭。', pinyin: 'Wǒ chīle zǎofàn.', vietnamese: 'Tôi đã ăn sáng rồi.' },
      { chinese: '他买了一件新衣服。', pinyin: 'Tā mǎile yī jiàn xīn yīfú.', vietnamese: 'Anh ấy đã mua một chiếc áo mới.' },
      { chinese: '天气变冷了。', pinyin: 'Tiānqì biàn lěng le.', vietnamese: 'Thời tiết đã trở lạnh rồi.' },
    ],
  },
  {
    id: 'hsk2-zhi-dao',
    level: 'HSK2',
    pattern: 'A + 也/都 + B',
    name: '也/都用法',
    nameVi: 'Dùng 也 (cũng) và 都 (đều)',
    usage: '也 = cũng (thêm vào), 都 = đều (bao gồm tất cả).',
    structure: 'Chủ ngữ + 也/都 + Vị ngữ',
    examples: [
      { chinese: '我也喜欢看电影。', pinyin: 'Wǒ yě xǐhuān kàn diànyǐng.', vietnamese: 'Tôi cũng thích xem phim.' },
      { chinese: '他们都是大学生。', pinyin: 'Tāmen dōu shì dàxuéshēng.', vietnamese: 'Họ đều là sinh viên đại học.' },
      { chinese: '我们都去，你也去吧。', pinyin: 'Wǒmen dōu qù, nǐ yě qù ba.', vietnamese: 'Chúng tôi đều đi, bạn cũng đi đi.' },
    ],
  },

  // ─── HSK 3 ────────────────────────────────────────────────────────────────
  {
    id: 'hsk3-ruguo',
    level: 'HSK3',
    pattern: '如果…就…',
    name: '条件句',
    nameVi: 'Câu điều kiện với 如果…就',
    usage: 'Diễn đạt điều kiện (nếu…) và kết quả (thì…).',
    structure: '如果 + Điều kiện + 就 + Kết quả',
    examples: [
      { chinese: '如果明天下雨，我就不去了。', pinyin: 'Rúguǒ míngtiān xià yǔ, wǒ jiù bù qù le.', vietnamese: 'Nếu ngày mai trời mưa, tôi sẽ không đi nữa.' },
      { chinese: '如果你有时间，就来帮我。', pinyin: 'Rúguǒ nǐ yǒu shíjiān, jiù lái bāng wǒ.', vietnamese: 'Nếu bạn có thời gian thì đến giúp tôi.' },
      { chinese: '如果努力学习，就一定能成功。', pinyin: 'Rúguǒ nǔlì xuéxí, jiù yīdìng néng chénggōng.', vietnamese: 'Nếu học hành chăm chỉ thì chắc chắn sẽ thành công.' },
    ],
  },
  {
    id: 'hsk3-suiran',
    level: 'HSK3',
    pattern: '虽然…但是…',
    name: '转折句',
    nameVi: 'Câu nhượng bộ với 虽然…但是',
    usage: 'Diễn đạt mặc dù… nhưng…, thể hiện sự tương phản.',
    structure: '虽然 + Mệnh đề 1 + 但是 + Mệnh đề 2',
    examples: [
      { chinese: '虽然很贵，但是质量很好。', pinyin: 'Suīrán hěn guì, dànshì zhìliàng hěn hǎo.', vietnamese: 'Tuy đắt nhưng chất lượng rất tốt.' },
      { chinese: '虽然天气不好，但是我们还是去了。', pinyin: 'Suīrán tiānqì bù hǎo, dànshì wǒmen háishì qù le.', vietnamese: 'Mặc dù thời tiết không đẹp, chúng tôi vẫn đi.' },
      { chinese: '他虽然学习努力，但是成绩不太好。', pinyin: 'Tā suīrán xuéxí nǔlì, dànshì chéngjì bù tài hǎo.', vietnamese: 'Dù anh ấy học hành chăm chỉ nhưng kết quả không tốt lắm.' },
    ],
  },
  {
    id: 'hsk3-wei-le',
    level: 'HSK3',
    pattern: '为了…',
    name: '为了目的状语',
    nameVi: 'Trạng ngữ mục đích với 为了',
    usage: 'Diễn đạt mục đích thực hiện hành động (để làm gì).',
    structure: '为了 + Mục đích + Chủ ngữ + Động từ',
    examples: [
      { chinese: '为了健康，他每天跑步。', pinyin: 'Wèile jiànkāng, tā měitiān pǎobù.', vietnamese: 'Để giữ sức khoẻ, anh ấy chạy bộ mỗi ngày.' },
      { chinese: '为了学好汉语，她来到中国留学。', pinyin: 'Wèile xuéhǎo Hànyǔ, tā lái dào Zhōngguó liúxué.', vietnamese: 'Để học tiếng Trung tốt, cô ấy đến Trung Quốc du học.' },
      { chinese: '为了赶上飞机，我们早早出发了。', pinyin: 'Wèile gǎnshang fēijī, wǒmen zǎozǎo chūfā le.', vietnamese: 'Để kịp chuyến bay, chúng tôi xuất phát sớm.' },
    ],
  },

  // ─── HSK 4 ────────────────────────────────────────────────────────────────
  {
    id: 'hsk4-yinwei',
    level: 'HSK4',
    pattern: '因为…所以…',
    name: '因果句',
    nameVi: 'Câu nhân quả với 因为…所以',
    usage: 'Diễn đạt nguyên nhân và kết quả: vì… nên…',
    structure: '因为 + Nguyên nhân + 所以 + Kết quả',
    examples: [
      { chinese: '因为下雨，所以我没出门。', pinyin: 'Yīnwèi xià yǔ, suǒyǐ wǒ méi chūmén.', vietnamese: 'Vì trời mưa nên tôi không ra ngoài.' },
      { chinese: '因为他工作太忙，所以没有时间陪家人。', pinyin: 'Yīnwèi tā gōngzuò tài máng, suǒyǐ méiyǒu shíjiān péi jiārén.', vietnamese: 'Vì anh ấy quá bận công việc nên không có thời gian ở bên gia đình.' },
      { chinese: '因为价格便宜，所以很受欢迎。', pinyin: 'Yīnwèi jiàgé piányí, suǒyǐ hěn shòu huānyíng.', vietnamese: 'Vì giá rẻ nên rất được ưa chuộng.' },
    ],
  },
  {
    id: 'hsk4-ba',
    level: 'HSK4',
    pattern: '把字句',
    name: '把字句',
    nameVi: 'Câu 把 — xử lý tân ngữ',
    usage: 'Nhấn mạnh kết quả/tác động lên tân ngữ, thường kèm kết quả hoặc hướng.',
    structure: 'Chủ ngữ + 把 + Tân ngữ + Động từ + (Bổ ngữ kết quả)',
    examples: [
      { chinese: '请把窗户关上。', pinyin: 'Qǐng bǎ chuānghù guān shàng.', vietnamese: 'Vui lòng đóng cửa sổ lại.' },
      { chinese: '他把作业做完了。', pinyin: 'Tā bǎ zuòyè zuò wán le.', vietnamese: 'Anh ấy đã làm xong bài tập về nhà.' },
      { chinese: '我把手机忘在家里了。', pinyin: 'Wǒ bǎ shǒujī wàng zài jiālǐ le.', vietnamese: 'Tôi để quên điện thoại ở nhà rồi.' },
    ],
  },
  {
    id: 'hsk4-bei',
    level: 'HSK4',
    pattern: '被字句',
    name: '被字句',
    nameVi: 'Câu bị động với 被',
    usage: 'Nhấn mạnh chủ thể chịu tác động của hành động (thể bị động).',
    structure: 'Chủ thể chịu tác động + 被 + (Tác nhân) + Động từ + Bổ ngữ',
    examples: [
      { chinese: '我的钱包被偷了。', pinyin: 'Wǒ de qiánbāo bèi tōu le.', vietnamese: 'Ví tiền của tôi bị trộm mất rồi.' },
      { chinese: '那本书被他借走了。', pinyin: 'Nà běn shū bèi tā jiè zǒu le.', vietnamese: 'Quyển sách đó đã bị anh ấy mượn đi rồi.' },
      { chinese: '问题被大家解决了。', pinyin: 'Wèntí bèi dàjiā jiějué le.', vietnamese: 'Vấn đề đã được mọi người giải quyết.' },
    ],
  },

  // ─── HSK 5 ────────────────────────────────────────────────────────────────
  {
    id: 'hsk5-jiran',
    level: 'HSK5',
    pattern: '既然…就…',
    name: '既然句',
    nameVi: 'Đã vậy thì… với 既然…就',
    usage: 'Dựa trên thực tế đã biết để rút ra kết luận logic.',
    structure: '既然 + Thực tế + 就 + Kết luận',
    examples: [
      { chinese: '既然你不喜欢，就别勉强自己。', pinyin: 'Jìrán nǐ bù xǐhuān, jiù bié miǎnqiǎng zìjǐ.', vietnamese: 'Đã không thích thì đừng ép bản thân.' },
      { chinese: '既然决定了，就要坚持到底。', pinyin: 'Jìrán juédìng le, jiù yào jiānchí dào dǐ.', vietnamese: 'Đã quyết định rồi thì phải kiên trì đến cùng.' },
      { chinese: '既然大家都同意，就这样定了。', pinyin: 'Jìrán dàjiā dōu tóngyì, jiù zhèyàng dìng le.', vietnamese: 'Đã mọi người đều đồng ý thì cứ như vậy mà quyết định.' },
    ],
  },
  {
    id: 'hsk5-conglai',
    level: 'HSK5',
    pattern: '从来…不/没…',
    name: '从来否定',
    nameVi: 'Phủ định tuyệt đối với 从来',
    usage: 'Diễn đạt chưa bao giờ hoặc không bao giờ (nhấn mạnh tính liên tục).',
    structure: '主语 + 从来 + 不/没 + 动词',
    examples: [
      { chinese: '他从来不迟到。', pinyin: 'Tā cónglái bù chídào.', vietnamese: 'Anh ấy không bao giờ đi muộn.' },
      { chinese: '我从来没去过西藏。', pinyin: 'Wǒ cónglái méi qùguò Xīzàng.', vietnamese: 'Tôi chưa bao giờ đến Tây Tạng.' },
      { chinese: '她从来不说谎。', pinyin: 'Tā cónglái bù shuō huǎng.', vietnamese: 'Cô ấy không bao giờ nói dối.' },
    ],
  },
  {
    id: 'hsk5-biran',
    level: 'HSK5',
    pattern: '…必然…',
    name: '必然推断',
    nameVi: 'Suy luận tất yếu với 必然',
    usage: 'Diễn đạt điều chắc chắn xảy ra do logic hay quy luật (tất nhiên, nhất định).',
    structure: '…必然 + Động từ/Tính từ',
    examples: [
      { chinese: '没有付出，必然没有收获。', pinyin: 'Méiyǒu fùchū, bìrán méiyǒu shōuhuò.', vietnamese: 'Không có cống hiến tất nhiên sẽ không có thu hoạch.' },
      { chinese: '这样下去，事情必然会越来越糟。', pinyin: 'Zhèyàng xiàqù, shìqíng bìrán huì yuèlaiyuè zāo.', vietnamese: 'Cứ như vậy thì mọi việc tất yếu sẽ ngày càng tệ hơn.' },
      { chinese: '技术的发展必然改变人类的生活方式。', pinyin: 'Jìshù de fāzhǎn bìrán gǎibiàn rénlèi de shēnghuó fāngshì.', vietnamese: 'Sự phát triển của công nghệ tất yếu sẽ thay đổi lối sống của con người.' },
    ],
  },

  // ─── HSK 6 ────────────────────────────────────────────────────────────────
  {
    id: 'hsk6-bujin',
    level: 'HSK6',
    pattern: '不仅…而且…',
    name: '递进关系',
    nameVi: 'Quan hệ tiệm tiến với 不仅…而且',
    usage: 'Không chỉ… mà còn… — nhấn mạnh bổ sung ý, tiệm tiến về mức độ.',
    structure: '不仅 + Mệnh đề 1 + 而且 + Mệnh đề 2',
    examples: [
      { chinese: '他不仅会说汉语，而且写得也很好。', pinyin: 'Tā bùjǐn huì shuō Hànyǔ, érqiě xiě de yě hěn hǎo.', vietnamese: 'Anh ấy không chỉ biết nói tiếng Trung mà còn viết rất tốt.' },
      { chinese: '这个问题不仅复杂，而且影响深远。', pinyin: 'Zhège wèntí bùjǐn fùzá, érqiě yǐngxiǎng shēnyuǎn.', vietnamese: 'Vấn đề này không chỉ phức tạp mà còn có tầm ảnh hưởng sâu rộng.' },
      { chinese: '这项政策不仅提高了效率，而且降低了成本。', pinyin: 'Zhè xiàng zhèngcè bùjǐn tígāole xiàolǜ, érqiě jiàngdīle chéngběn.', vietnamese: 'Chính sách này không chỉ nâng cao hiệu quả mà còn giảm chi phí.' },
    ],
  },
  {
    id: 'hsk6-suizhao',
    level: 'HSK6',
    pattern: '随着…',
    name: '随着变化',
    nameVi: 'Cùng với sự thay đổi — 随着',
    usage: 'Diễn đạt sự thay đổi đồng thời hoặc kèm theo một quá trình.',
    structure: '随着 + Danh từ/Mệnh đề + Kết quả',
    examples: [
      { chinese: '随着科技的发展，人们的生活越来越便利。', pinyin: 'Suízhe kējì de fāzhǎn, rénmen de shēnghuó yuèlaiyuè biànlì.', vietnamese: 'Cùng với sự phát triển của khoa học công nghệ, cuộc sống của người dân ngày càng thuận tiện.' },
      { chinese: '随着年龄的增长，他的思想也逐渐成熟。', pinyin: 'Suízhe niánlíng de zēngzhǎng, tā de sīxiǎng yě zhújiàn chéngshú.', vietnamese: 'Theo tuổi tác ngày càng lớn, suy nghĩ của anh ấy cũng dần trưởng thành.' },
      { chinese: '随着全球化的深入，国际合作变得更加重要。', pinyin: 'Suízhe quánqiúhuà de shēnrù, guójì hézuò biàn de gèngjiā zhòngyào.', vietnamese: 'Khi toàn cầu hoá ngày càng sâu rộng, hợp tác quốc tế trở nên quan trọng hơn.' },
    ],
  },
  {
    id: 'hsk6-shi-de',
    level: 'HSK6',
    pattern: '是…的 (强调句)',
    name: '是…的强调句',
    nameVi: 'Câu nhấn mạnh với 是…的',
    usage: 'Nhấn mạnh thời gian, địa điểm, phương thức hoặc người thực hiện của một hành động đã xảy ra.',
    structure: '是 + [thành phần nhấn mạnh] + Động từ + 的',
    examples: [
      { chinese: '他是昨天到北京的。', pinyin: 'Tā shì zuótiān dào Běijīng de.', vietnamese: 'Anh ấy đến Bắc Kinh vào hôm qua (nhấn mạnh thời gian).' },
      { chinese: '这个项目是他们三个人合作完成的。', pinyin: 'Zhège xiàngmù shì tāmen sān gè rén hézuò wánchéng de.', vietnamese: 'Dự án này là do ba người họ hợp tác hoàn thành (nhấn mạnh chủ thể).' },
      { chinese: '这篇文章是用英文写的。', pinyin: 'Zhè piān wénzhāng shì yòng yīngwén xiě de.', vietnamese: 'Bài viết này được viết bằng tiếng Anh (nhấn mạnh phương thức).' },
    ],
  },
];
