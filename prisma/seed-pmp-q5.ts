/**
 * seed-pmp-q5.ts — PMP Exam Questions Part 2e
 * Phần: Procurement Management (20 câu) + Stakeholder Management (20 câu)
 * Chạy: npx tsx prisma/seed-pmp-q5.ts
 */
import { PrismaClient, Difficulty } from '@prisma/client';
const prisma = new PrismaClient();

type QDef = {
  area: string;
  group: string;
  content: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  answer: string;
  explain: string;
  difficulty: Difficulty;
};

const QUESTIONS: QDef[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // PROCUREMENT MANAGEMENT (20 câu)
  // ─────────────────────────────────────────────────────────────────────────
  {
    area: 'procurement', group: 'planning',
    content: 'Loại hợp đồng nào chuyển NHIỀU RỦI RO NHẤT sang nhà thầu (seller)?',
    optionA: 'Cost Plus Fixed Fee (CPFF)',
    optionB: 'Time and Material (T&M)',
    optionC: 'Firm Fixed Price (FFP)',
    optionD: 'Cost Plus Incentive Fee (CPIF)',
    answer: 'C',
    explain: 'FFP (Firm Fixed Price): giá cố định bất kể chi phí thực tế → Seller chịu toàn bộ rủi ro chi phí. Nếu cost vượt giá cố định, seller chịu lỗ. Buyer biết chính xác chi phí. CPFF/CPIF: Buyer chịu rủi ro chi phí (reimbursed actual costs). FFP phù hợp khi scope rõ ràng và ổn định.',
    difficulty: 'easy',
  },
  {
    area: 'procurement', group: 'planning',
    content: 'Fixed Price Incentive Fee (FPIF) hoạt động như thế nào?',
    optionA: 'Giá cố định với fee cố định không thay đổi',
    optionB: 'Seller có thể earn thêm incentive fee nếu meet/exceed performance targets, nhưng có price ceiling',
    optionC: 'Buyer reimburse tất cả chi phí cộng thêm fixed management fee',
    optionD: 'Fee thay đổi dựa trên actual costs tiêu tốn',
    answer: 'B',
    explain: 'FPIF: có price ceiling (giá tối đa), target price và share ratio (ví dụ 80/20 — seller giữ 20% khi dưới target). Nếu seller under target cost: earn incentive. Nếu over price ceiling: seller chịu 100% phần vượt. Balance risk/reward giữa buyer và seller.',
    difficulty: 'hard',
  },
  {
    area: 'procurement', group: 'planning',
    content: 'Make-or-Buy Analysis trong Procurement Planning là gì?',
    optionA: 'Quyết định sản phẩm cuối cùng nào cần tạo ra',
    optionB: 'Phân tích để quyết định nên tự thực hiện (make) hay thuê ngoài (buy) một deliverable',
    optionC: 'Quyết định giá bán sản phẩm của dự án',
    optionD: 'So sánh chi phí giữa các vendor khác nhau',
    answer: 'B',
    explain: 'Make-or-Buy Analysis xem xét: Direct/Indirect costs, organizational expertise, capacity, quality requirements, confidentiality, IP ownership, risk allocation. Kết quả: Make (giữ nội bộ) or Buy (outsource). Là key input để biết có cần procurement không.',
    difficulty: 'easy',
  },
  {
    area: 'procurement', group: 'planning',
    content: 'Sự khác biệt giữa SOW (Statement of Work), PWS (Performance Work Statement) và SOO (Statement of Objectives) là gì?',
    optionA: 'Ba tài liệu giống nhau, chỉ khác tên',
    optionB: 'SOW mô tả WHAT (deliverables); PWS mô tả OUTCOMES; SOO mô tả GOALS để vendor propose solutions',
    optionC: 'SOW cho commercial work, PWS cho government, SOO cho R&D',
    optionD: 'SOW là tóm tắt, PWS chi tiết hơn, SOO đầy đủ nhất',
    answer: 'B',
    explain: 'SOW (Statement of Work): mô tả chi tiết deliverables/work cần thực hiện — Buyer biết MUỐN GÌ và nói cho Seller. PWS (Performance Work Statement): focus vào outcomes/performance standards, ít prescriptive hơn. SOO (Statement of Objectives): chỉ nêu goals, để sellers propose solutions.',
    difficulty: 'hard',
  },
  {
    area: 'procurement', group: 'planning',
    content: 'Request for Proposal (RFP) khác Request for Quote (RFQ) và Invitation for Bid (IFB) như thế nào?',
    optionA: 'Cả ba đều giống nhau',
    optionB: 'RFP = technical + price solution (complex); RFQ = price only (standard items); IFB = formal bid process (large/government)',
    optionC: 'RFP cho IT, RFQ cho construction, IFB cho government',
    optionD: 'RFP yêu cầu đề xuất; RFQ yêu cầu demo; IFB yêu cầu presentation',
    answer: 'B',
    explain: 'RFP (Request for Proposal): dùng khi cần technical solution + price — complex, customized (e.g., software development). RFQ (Request for Quotation): khi chỉ cần price (commodity items, standard products). IFB (Invitation for Bid): formal sealed bids, often government, award goes to lowest qualified bidder.',
    difficulty: 'medium',
  },
  {
    area: 'procurement', group: 'executing',
    content: 'Bidder Conference (Vendor Conference) trong Conduct Procurements nhằm mục đích gì?',
    optionA: 'Giới thiệu vendors với nhau để họ collaborate',
    optionB: 'Đảm bảo tất cả potential sellers có cùng thông tin về procurement và có cơ hội hỏi clarification',
    optionC: 'Thương lượng giá với vendors',
    optionD: 'Đánh giá năng lực kỹ thuật của vendors',
    answer: 'B',
    explain: 'Bidder Conference (Pre-bid/Pre-proposal conference): Buyer meet với tất cả potential bidders cùng lúc để: (1) Trình bày procurement docs; (2) Answer questions (đảm bảo Q&A được shared với tất cả, không ưu tiên seller nào); (3) Clarify ambiguities. Đảm bảo fair competition.',
    difficulty: 'easy',
  },
  {
    area: 'procurement', group: 'executing',
    content: 'Privity of Contract trong Procurement Management có nghĩa là gì?',
    optionA: 'Private information trong hợp đồng',
    optionB: 'Quan hệ hợp đồng trực tiếp giữa hai bên ký kết — PM không có privity với sub-contractors của vendor',
    optionC: 'Điều khoản bảo mật trong hợp đồng',
    optionD: 'Priority trong thanh toán',
    answer: 'B',
    explain: 'Privity = legal relationship giữa parties trong contract. Buyer có privity với Seller (prime contractor) nhưng KHÔNG có privity với Sub-contractors. Nếu có vấn đề với sub-contractor, Buyer phải thông qua prime contractor (Seller). PM không thể trực tiếp direct sub-contractors.',
    difficulty: 'hard',
  },
  {
    area: 'procurement', group: 'planning',
    content: 'Procurement Management Plan định nghĩa điều gì?',
    optionA: 'Danh sách vendors đã được pre-approved',
    optionB: 'HOW procurement sẽ được managed: contract types, risk analysis, standard docs, managing multiple vendors, constraints',
    optionC: 'Chi tiết tất cả hợp đồng cần ký',
    optionD: 'Quy trình thanh toán cho vendors',
    answer: 'B',
    explain: 'Procurement Management Plan bao gồm: contract types to use, standardized procurement docs, make-or-buy decisions, independent cost estimates, managing multiple providers, coordination with project schedule, constraints/assumptions, lead times, risk issues và insurance/bonding requirements.',
    difficulty: 'medium',
  },
  {
    area: 'procurement', group: 'planning',
    content: 'Independent Cost Estimates (ICE) trong Procurement được dùng để làm gì?',
    optionA: 'Tính toán total project budget',
    optionB: 'Benchmark để evaluate reasonableness của proposals nhận được từ potential sellers',
    optionC: 'Estimate chi phí của internal project work',
    optionD: 'Xác định minimum acceptable bid',
    answer: 'B',
    explain: 'Independent Cost Estimate được chuẩn bị bởi buyer (hoặc independent 3rd party) để baseline so sánh với seller proposals. Nếu bid quá cao → seller overcharging hoặc SOW ambiguous. Nếu bid quá thấp → seller misunderstood hoặc leaving something out. Là sanity check cho proposals.',
    difficulty: 'medium',
  },
  {
    area: 'procurement', group: 'planning',
    content: 'Source Selection Criteria trong Procurement được dùng để làm gì?',
    optionA: 'Xác định danh sách shortlisted vendors',
    optionB: 'Đánh giá và so sánh proposals từ sellers theo criteria đã xác định trước (technical, cost, references, management approach)',
    optionC: 'Chọn loại hợp đồng phù hợp',
    optionD: 'Định nghĩa requirements cho procurement',
    answer: 'B',
    explain: 'Source Selection Criteria là rating/scoring system để evaluate seller proposals objectively: technical approach, understanding of need, management approach, technical skills, business size, references, financial capacity, IP rights, warranty. Được xác định trước khi receive proposals (tránh bias).',
    difficulty: 'medium',
  },
  {
    area: 'procurement', group: 'monitoring',
    content: 'Claims Administration trong Procurement Management xử lý vấn đề gì?',
    optionA: 'Quản lý hóa đơn thanh toán',
    optionB: 'Xử lý contested changes hoặc potential constructive changes mà buyer và seller không đồng ý',
    optionC: 'Bảo hiểm cho dự án',
    optionD: 'Khiếu nại chất lượng sản phẩm',
    answer: 'B',
    explain: 'Claims Administration xử lý disputed changes, constructive changes (changes seller claims occurred but buyer not acknowledged), và contract disputes. Nếu không thể giải quyết, có thể dẫn đến Alternative Dispute Resolution (negotiation, mediation, arbitration, litigation).',
    difficulty: 'hard',
  },
  {
    area: 'procurement', group: 'planning',
    content: 'Force Majeure clause trong hợp đồng là gì?',
    optionA: 'Điều khoản cho phép seller tăng giá',
    optionB: 'Điều khoản miễn trách nhiệm khi có sự kiện bất khả kháng ngoài tầm kiểm soát hợp lý (thiên tai, chiến tranh)',
    optionC: 'Điều khoản cho phép buyer terminate contract',
    optionD: 'Điều khoản về penalty khi trễ',
    answer: 'B',
    explain: 'Force Majeure ("Higher Power"): điều khoản miễn trách nhiệm cho cả hai bên khi có extraordinary events không thể kiểm soát: natural disasters (bão, lũ, động đất), war, government actions, pandemics. Seller không bị penalty nếu delay do force majeure.',
    difficulty: 'medium',
  },
  {
    area: 'procurement', group: 'closing',
    content: 'Khi nào Closed Procurements xảy ra và kết quả là gì?',
    optionA: 'Khi dự án kết thúc; tất cả hợp đồng tự động đóng',
    optionB: 'Khi contract work complete và buyer issues formal written notice; kết quả là Closed Procurement documentation',
    optionC: 'Khi seller ngừng kinh doanh',
    optionD: 'Khi budget procurement hết',
    answer: 'B',
    explain: 'Close Procurements: Buyer verifies tất cả contract deliverables đã được accepted và issues formal written notice of closure. Documentation: contract file (tất cả correspondence), deliverable acceptance, lessons learned. Có thể xảy ra trước khi Close Project nếu contract ends early.',
    difficulty: 'medium',
  },
  {
    area: 'procurement', group: 'executing',
    content: 'Trong Cost Plus Fixed Fee (CPFF) contract, fee là gì?',
    optionA: 'Phần trăm trên actual costs',
    optionB: 'Số tiền cố định không thay đổi bất kể actual costs (chỉ thay đổi nếu scope thay đổi)',
    optionC: 'Fee tăng nếu seller vượt performance target',
    optionD: 'Fee giảm nếu chi phí vượt budget',
    answer: 'B',
    explain: 'CPFF: Buyer reimburses actual costs (biến đổi) + pays Fixed Fee (không đổi). Fixed Fee được tính theo % estimated cost nhưng không thay đổi khi actual costs thay đổi. Fee chỉ thay đổi nếu SOW/scope thay đổi. Seller có ít incentive để control costs.',
    difficulty: 'medium',
  },
  {
    area: 'procurement', group: 'monitoring',
    content: 'Procurement Performance Review trong Control Procurements nhằm mục đích gì?',
    optionA: 'Đánh giá performance của procurement team nội bộ',
    optionB: 'Structured review của seller progress: schedule, cost, quality, risk — so sánh với contract terms',
    optionC: 'Tính toán final payment cho seller',
    optionD: 'Đàm phán lại giá hợp đồng',
    answer: 'B',
    explain: 'Procurement Performance Reviews đánh giá seller performance theo góc độ: on-schedule delivery, quality of deliverables, cost performance, compliance với contract terms. Kết quả có thể trigger: change requests, corrective actions, contract updates hoặc contract termination.',
    difficulty: 'medium',
  },
  {
    area: 'procurement', group: 'planning',
    content: 'Time and Material (T&M) contract phù hợp nhất khi nào?',
    optionA: 'Khi scope rõ ràng và hoàn toàn defined',
    optionB: 'Khi cần staff augmentation hoặc scope không fully defined, thường cho short duration',
    optionC: 'Khi buyer muốn minimize risk',
    optionD: 'Khi budget rất hạn chế',
    answer: 'B',
    explain: 'T&M phù hợp: (1) Staff augmentation (thêm người); (2) Scope chưa fully defined; (3) Short duration, small value. Rủi ro: costs có thể escalate vì cả labor hours lẫn material không cố định. Thường set "not-to-exceed" clause để kiểm soát. Hybrid của Fixed Price và Cost Reimbursable.',
    difficulty: 'medium',
  },
  {
    area: 'procurement', group: 'executing',
    content: 'Letter of Intent (LOI) trong procurement là gì?',
    optionA: 'Hợp đồng chính thức ràng buộc pháp lý',
    optionB: 'Văn bản cho thấy buyer có ý định ký hợp đồng — không phải hợp đồng chính thức',
    optionC: 'Thư từ chối đề nghị của seller',
    optionD: 'Tài liệu giải thích ý định của project',
    answer: 'B',
    explain: 'Letter of Intent bày tỏ buyer intention để proceed với seller, cho phép seller begin preparation/procurement TRƯỚC KHI contract được ký chính thức. Thường không phải binding contract nhưng có thể có một số obligations. Dùng khi cần seller start work ngay mà contract chưa finalize.',
    difficulty: 'hard',
  },
  {
    area: 'procurement', group: 'monitoring',
    content: 'Payment Milestones trong hợp đồng liên quan đến procurement như thế nào?',
    optionA: 'Milestone chỉ để track tiến độ nội bộ',
    optionB: 'Linked payments với specific deliverables để incentivize seller performance và protect buyer',
    optionC: 'Payments được thực hiện cố định hàng tháng',
    optionD: 'Toàn bộ payment chỉ khi kết thúc hợp đồng',
    answer: 'B',
    explain: 'Payment Milestones: tie payments to verified deliverables/achievements. Buyer trả tiền khi seller deliver và accept specific outputs. Bảo vệ buyer (không trả trước khi nhận); incentivize seller (nhận tiền khi hoàn thành). Phổ biến trong fixed-price contracts: 30% signing, 40% delivery, 30% acceptance.',
    difficulty: 'medium',
  },
  {
    area: 'procurement', group: 'planning',
    content: 'Centralized Contracting vs Decentralized Contracting khác nhau thế nào?',
    optionA: 'Không có sự khác biệt thực tế',
    optionB: 'Centralized: contract specialist shared across projects (expertise, consistency); Decentralized: PM directly manages procurement (flexibility, ownership)',
    optionC: 'Centralized cho large organizations, Decentralized cho small',
    optionD: 'Centralized tiết kiệm chi phí hơn',
    answer: 'B',
    explain: 'Centralized Contracting (Contract Management Office): procurement professionals shared, ensures compliance, economies of scale, expertise. Decentralized: PM owns procurement, faster decisions, understands project needs better but may lack expertise. Trade-off giữa efficiency và project-specific knowledge.',
    difficulty: 'hard',
  },
  {
    area: 'procurement', group: 'executing',
    content: 'Khi seller không giao hàng đúng hạn theo hợp đồng, PM (buyer) nên làm gì đầu tiên?',
    optionA: 'Terminate contract ngay lập tức',
    optionB: 'Kiểm tra contract terms và issue formal written notice/cure notice yêu cầu seller remedy',
    optionC: 'Trả thêm tiền để seller tăng tốc',
    optionD: 'Tự thực hiện công việc thay seller',
    answer: 'B',
    explain: 'Khi seller breach contract: (1) Review contract terms; (2) Issue formal written notice (cure notice) — thông báo seller vi phạm và yêu cầu remedy trong timeframe cụ thể; (3) Nếu không remedy → consider termination for cause. Theo đúng contract dispute process trước khi escalate.',
    difficulty: 'medium',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // STAKEHOLDER MANAGEMENT (20 câu)
  // ─────────────────────────────────────────────────────────────────────────
  {
    area: 'stakeholder', group: 'initiating',
    content: 'Identify Stakeholders nên được thực hiện lần đầu khi nào?',
    optionA: 'Trong giai đoạn Planning khi PM Plan được tạo',
    optionB: 'Càng sớm càng tốt trong Initiating, lý tưởng nhất là trước hoặc đồng thời với Develop Project Charter',
    optionC: 'Chỉ khi có conflict giữa stakeholders',
    optionD: 'Sau khi project team đã assembled',
    answer: 'B',
    explain: 'Identify Stakeholders nên làm trong Initiating càng sớm càng tốt — vì: (1) Stakeholders ảnh hưởng project requirements; (2) Cần input họ từ sớm; (3) Bỏ sót stakeholder sớm có thể gây change requests tốn kém sau. Sponsor và key stakeholders thường involve trong Project Charter development.',
    difficulty: 'medium',
  },
  {
    area: 'stakeholder', group: 'initiating',
    content: 'Stakeholder Register chứa thông tin gì?',
    optionA: 'Chỉ tên và email của stakeholders',
    optionB: 'Identification info, assessment info (interests, involvement, potential impact) và stakeholder classification',
    optionC: 'Lịch trình họp với từng stakeholder',
    optionD: 'Vai trò và trách nhiệm của stakeholder trong project',
    answer: 'B',
    explain: 'Stakeholder Register bao gồm: (1) Identification info: name, position, location, role, contact; (2) Assessment info: requirements, expectations, potential impact, phase of greatest interest; (3) Classification: internal/external, supporter/neutral/resistor, power/interest grid position.',
    difficulty: 'medium',
  },
  {
    area: 'stakeholder', group: 'planning',
    content: 'Stakeholder Engagement Assessment Matrix theo dõi điều gì?',
    optionA: 'Timeline các cuộc họp với stakeholders',
    optionB: 'Current engagement level (C) vs Desired engagement level (D) cho mỗi stakeholder để xác định gap cần xử lý',
    optionC: 'Power và Interest của mỗi stakeholder',
    optionD: 'Chi phí cho stakeholder management activities',
    answer: 'B',
    explain: '5 Engagement Levels: Unaware → Resistant → Neutral → Supportive → Leading. Matrix shows: C (current) và D (desired) cho mỗi stakeholder. Nếu C = D: đang tốt. Nếu C ≠ D: cần action để move stakeholder toward desired level. Focus effort vào gap lớn nhất.',
    difficulty: 'medium',
  },
  {
    area: 'stakeholder', group: 'planning',
    content: 'Power/Interest Grid (Stakeholder Power/Interest Matrix) phân loại stakeholders như thế nào?',
    optionA: 'Chỉ 2 nhóm: internal và external',
    optionB: '4 quadrants: High Power/High Interest (Manage Closely), High Power/Low Interest (Keep Satisfied), Low Power/High Interest (Keep Informed), Low Power/Low Interest (Monitor)',
    optionC: '3 nhóm: key, secondary, tertiary',
    optionD: 'Chỉ dựa trên organizational hierarchy',
    answer: 'B',
    explain: 'Power/Interest Grid: (1) High Power + High Interest → Manage Closely (communicate frequently); (2) High Power + Low Interest → Keep Satisfied (don\'t ignore but don\'t over-communicate); (3) Low Power + High Interest → Keep Informed; (4) Low Power + Low Interest → Monitor (minimal effort).',
    difficulty: 'medium',
  },
  {
    area: 'stakeholder', group: 'planning',
    content: 'Salience Model phân loại stakeholders dựa trên 3 yếu tố nào?',
    optionA: 'Power, Interest, Influence',
    optionB: 'Power (authority), Urgency (time-sensitive claims), Legitimacy (appropriate involvement)',
    optionC: 'Internal, External, Neutral',
    optionD: 'Positive, Negative, Neutral impact',
    answer: 'B',
    explain: 'Salience Model (Mitchell et al.): Power = ability to impose will, Urgency = time sensitivity of needs, Legitimacy = appropriate involvement. Combinations create 7 types: Dormant (only power), Discretionary (only legitimacy), Demanding (only urgency), Dominant (power+legit), Dangerous (power+urgency), Dependent (legit+urgency), Definitive (all three).',
    difficulty: 'hard',
  },
  {
    area: 'stakeholder', group: 'planning',
    content: 'Stakeholder Engagement Plan (output của Plan Stakeholder Engagement) xác định điều gì?',
    optionA: 'Lịch họp với từng stakeholder',
    optionB: 'Strategies và actions để promote productive stakeholder involvement — HOW to engage each stakeholder',
    optionC: 'Danh sách stakeholders phân loại theo power',
    optionD: 'Budget cho stakeholder entertainment',
    answer: 'B',
    explain: 'Stakeholder Engagement Plan định nghĩa: engagement strategies cho mỗi stakeholder/group, communication approaches, phương pháp increase support/reduce resistance, key messages, timing của engagement activities. Là component of Project Management Plan.',
    difficulty: 'medium',
  },
  {
    area: 'stakeholder', group: 'executing',
    content: 'Manage Stakeholder Engagement nhằm mục đích gì?',
    optionA: 'Theo dõi stakeholders để tránh conflict',
    optionB: 'Communicate và work với stakeholders để meet their needs, address issues và foster appropriate engagement',
    optionC: 'Quản lý expectations của sponsor để nhận thêm budget',
    optionD: 'Document tất cả stakeholder requests',
    answer: 'B',
    explain: 'Manage Stakeholder Engagement = active process để communicate, work with stakeholders, address concerns và foster appropriate engagement. Không chỉ thông báo — mà thực sự engage: listen to needs, resolve issues, negotiate, build relationships và manage their influence pada project.',
    difficulty: 'medium',
  },
  {
    area: 'stakeholder', group: 'monitoring',
    content: 'Monitor Stakeholder Engagement theo dõi điều gì?',
    optionA: 'Số lần stakeholders attend meetings',
    optionB: 'Overall project stakeholder relationships và adjusts strategies and plans để engage effectively',
    optionC: 'Chi phí của stakeholder management',
    optionD: 'Quyết định của từng stakeholder',
    answer: 'B',
    explain: 'Monitor Stakeholder Engagement liên tục đánh giá: stakeholder relationships, effectiveness of engagement strategies, engagement levels trong Stakeholder Register và Engagement Assessment Matrix. Nếu strategies không hiệu quả, update Stakeholder Engagement Plan và implement adjustments.',
    difficulty: 'medium',
  },
  {
    area: 'stakeholder', group: 'executing',
    content: 'Một stakeholder quan trọng đang "Resistant" theo Stakeholder Engagement Level. PM nên làm gì?',
    optionA: 'Bỏ qua resistor vì không tránh được',
    optionB: 'Understand root cause of resistance, address concerns, provide information và involve them trong decision-making để move them toward Supportive',
    optionC: 'Escalate lên sponsor để xử lý',
    optionD: 'Giảm influence của stakeholder này trong dự án',
    answer: 'B',
    explain: 'Để move stakeholder từ Resistant → Neutral/Supportive: (1) One-on-one meetings để hiểu concerns thực sự; (2) Provide information về project benefits; (3) Address specific objections; (4) Involve trong decisions affecting them; (5) Find common ground/shared interests. Resistance thường có rational root cause.',
    difficulty: 'medium',
  },
  {
    area: 'stakeholder', group: 'initiating',
    content: 'Tại sao Identify Stakeholders quan trọng ngay cả khi một số stakeholders không muốn được identified?',
    optionA: 'PMBOK bắt buộc phải identify tất cả',
    optionB: 'Hidden/unidentified stakeholders có thể emerge later và disrupt project — better to identify early và manage proactively',
    optionC: 'Để compliance với organizational policies',
    optionD: 'Để phân bổ resources phù hợp',
    answer: 'B',
    explain: 'Unidentified stakeholders có thể emerge later với strong objections, causing: scope changes, delays, budget overruns hoặc project cancellation. Proactively identifying ALL stakeholders (even opponents) allows PM to: analyze their concerns, develop engagement strategies và mitigate risks của unexpected opposition.',
    difficulty: 'medium',
  },
  {
    area: 'stakeholder', group: 'planning',
    content: 'Interpersonal Skills quan trọng nhất trong Manage Stakeholder Engagement là gì?',
    optionA: 'Technical expertise về product',
    optionB: 'Building trust, resolving conflicts, active listening, cultural awareness và political sensitivity',
    optionC: 'Presentation skills',
    optionD: 'Project management software proficiency',
    answer: 'B',
    explain: 'Key interpersonal skills cho Manage Stakeholder Engagement: Active listening, cultural awareness để understand context, building trust qua consistency và transparency, conflict resolution, political and organizational awareness để navigate power dynamics, leadership để inspire commitment.',
    difficulty: 'medium',
  },
  {
    area: 'stakeholder', group: 'executing',
    content: 'Change Log quan hệ với Stakeholder Management như thế nào?',
    optionA: 'Không có mối quan hệ',
    optionB: 'Change Requests từ stakeholders được tracked trong Change Log; PM cần communicate approved/rejected changes back cho stakeholders',
    optionC: 'Stakeholders không được phép request changes',
    optionD: 'Change Log chỉ dùng cho technical changes',
    answer: 'B',
    explain: 'Stakeholders thường là source của Change Requests. Changes phải qua PICC. Change Log tracks status. PM cần: (1) Communicate approved changes và timeline; (2) Explain rejected changes với rationale; (3) Không để stakeholders wonder về what happened to their requests — ảnh hưởng trực tiếp đến engagement level.',
    difficulty: 'medium',
  },
  {
    area: 'stakeholder', group: 'monitoring',
    content: 'Khi nào PM nên cập nhật Stakeholder Register?',
    optionA: 'Chỉ một lần khi Identify Stakeholders',
    optionB: 'Liên tục suốt dự án khi stakeholders mới identified, engagement levels thay đổi hoặc stakeholder information changes',
    optionC: 'Chỉ khi có major change request',
    optionD: 'Mỗi quý một lần',
    answer: 'B',
    explain: 'Stakeholder Register là living document: cập nhật khi (1) Stakeholders mới identified hoặc exit; (2) Engagement levels thay đổi; (3) Stakeholder roles/responsibilities change; (4) New information về interests/influence discovered. Là input cho Monitor Stakeholder Engagement.',
    difficulty: 'easy',
  },
  {
    area: 'stakeholder', group: 'executing',
    content: 'Stakeholder ở mức "Leading" trong Stakeholder Engagement Level là gì?',
    optionA: 'Stakeholder có power cao nhất trong tổ chức',
    optionB: 'Stakeholder chủ động engage và act as champion cho project success',
    optionC: 'PM leading the stakeholder management activities',
    optionD: 'Stakeholder ở đầu danh sách priority',
    answer: 'B',
    explain: '5 levels: Unaware (không biết) → Resistant (biết nhưng phản đối) → Neutral (biết, không ủng hộ cũng không phản đối) → Supportive (biết và ủng hộ) → Leading (biết, ủng hộ và chủ động thúc đẩy). "Leading" là level cao nhất — stakeholder actively advocates untuk project success.',
    difficulty: 'medium',
  },
  {
    area: 'stakeholder', group: 'planning',
    content: 'Ground Rules trong Stakeholder/Team Management nhằm mục đích gì?',
    optionA: 'Quy tắc của tổ chức bắt buộc phải tuân thủ',
    optionB: 'Xác định expected behaviors của team và stakeholders — tạo shared expectations và reduce conflicts',
    optionC: 'Legal requirements cho project conduct',
    optionD: 'Quy trình để xử lý scope changes',
    answer: 'B',
    explain: 'Ground Rules là tập hợp expectations về acceptable behavior cho: meetings (punctuality, no phone), communication (response time), conflict resolution, decision making, confidentiality. Khi team establish ground rules together, accountability tăng và conflicts giảm vì expectations đã clear từ đầu.',
    difficulty: 'easy',
  },
  {
    area: 'stakeholder', group: 'executing',
    content: 'Khi có conflict giữa hai stakeholder quan trọng về project direction, PM nên ưu tiên làm gì?',
    optionA: 'Ủng hộ stakeholder có power cao hơn',
    optionB: 'Facilitate một cuộc gặp gỡ giữa hai bên để understand concerns và tìm common ground aligned với project objectives',
    optionC: 'Escalate lên Executive Steering Committee ngay lập tức',
    optionD: 'Ignore conflict và tiếp tục dự án',
    answer: 'B',
    explain: 'Khi stakeholders conflict: (1) Understand both perspectives fully; (2) Identify shared interests/project goals; (3) Facilitate structured conversation focused on interests not positions; (4) Aim for win-win hoặc compromise; (5) Nếu không resolve, escalate với documentation của both positions.',
    difficulty: 'medium',
  },
  {
    area: 'stakeholder', group: 'planning',
    content: 'Influence Mapping (Stakeholder Influence Diagram) giúp PM làm gì?',
    optionA: 'Tạo organizational chart của dự án',
    optionB: 'Visualize relationships và influence patterns giữa stakeholders để hiểu coalition dynamics',
    optionC: 'Track stakeholder meeting attendance',
    optionD: 'Phân bổ budget cho stakeholder management',
    answer: 'B',
    explain: 'Influence Mapping/Stakeholder Influence Diagram shows: connections, alliances và influence lines giữa stakeholders. Giúp PM: understand who influences whom, identify key influencers, discover informal power structures, plan engagement (reach resistant stakeholders qua their influencers).',
    difficulty: 'hard',
  },
  {
    area: 'stakeholder', group: 'executing',
    content: 'Presentation Skills quan trọng với PM trong Stakeholder Management vì?',
    optionA: 'PMBOK yêu cầu PM present hàng tuần',
    optionB: 'Ability to clearly communicate project status, vision và justify decisions helps secure stakeholder buy-in và maintain support',
    optionC: 'Để impress executives và advance career',
    optionD: 'Chỉ cần thiết trong giai đoạn Initiating',
    answer: 'B',
    explain: 'Effective presentations help PM: (1) Build credibility; (2) Explain complex information clearly; (3) Justify decisions với data; (4) Inspire confidence; (5) Manage resistance. Regular transparent presentations (not just good news) build trust và maintain stakeholder commitment suốt dự án.',
    difficulty: 'easy',
  },
  {
    area: 'stakeholder', group: 'planning',
    content: 'PM nhận ra một key stakeholder đã bị bỏ sót trong Stakeholder Register. PM nên làm gì?',
    optionA: 'Tiếp tục dự án vì quá muộn để thêm người',
    optionB: 'Ngay lập tức add stakeholder vào Register, analyze power/interest, develop engagement approach và incorporate vào Communications Plan',
    optionC: 'Thông báo cho sponsor và chờ quyết định',
    optionD: 'Chỉ add vào distribution list cho reports',
    answer: 'B',
    explain: 'Bổ sung stakeholder bị bỏ sót: (1) Add to Stakeholder Register với full analysis; (2) Review nếu stakeholder có requirements/concerns chưa được captured; (3) Update Communications Management Plan; (4) Update Stakeholder Engagement Plan; (5) Có thể cần Change Request nếu new requirements discovered.',
    difficulty: 'medium',
  },
  {
    area: 'stakeholder', group: 'monitoring',
    content: 'Issue Log liên quan đến Stakeholder Management như thế nào?',
    optionA: 'Issue Log chỉ dùng cho technical issues',
    optionB: 'Stakeholder concerns và unresolved conflicts được documented trong Issue Log để track và resolve, preventing escalation',
    optionC: 'Issue Log là nơi stakeholders submit complaints',
    optionD: 'Không có mối tương quan',
    answer: 'B',
    explain: 'Issue Log captures: stakeholder concerns, unresolved conflicts, open items requiring decisions. Cho phép PM: track trạng thái xử lý, assign ownership. Issues không được resolve có thể escalate thành conflicts hoặc change requests. Regular issue reviews trong stakeholder meetings build trust.',
    difficulty: 'medium',
  },
];

async function main() {
  console.log('🌱 Seeding PMP Exam Questions — Part 2e: Procurement + Stakeholder\n');
  let created = 0;
  let skipped = 0;

  for (const q of QUESTIONS) {
    const exists = await prisma.pMPExamQuestion.findFirst({
      where: { content: q.content },
    });
    if (exists) {
      process.stdout.write('○');
      skipped++;
      continue;
    }
    await prisma.pMPExamQuestion.create({ data: q });
    process.stdout.write('✓');
    created++;
  }

  console.log(`\n\n📊 Kết quả:`);
  console.log(`   ✅ Tạo mới : ${created} câu`);
  console.log(`   ⏭  Bỏ qua  : ${skipped} câu (đã tồn tại)`);
  console.log(`   📝 Tổng    : ${QUESTIONS.length} câu`);
  console.log(`\n🎉 Part 2 hoàn tất! Tổng cộng ~200 câu mới trải đều 10 KAs.`);
  console.log(`\n👉 Bước tiếp: npx tsx prisma/seed-pmp-learn.ts (Part 3)`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
