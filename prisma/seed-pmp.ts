/**
 * Seeder: PMP PMBOK 6 module
 * Run: npx tsx prisma/seed-pmp.ts
 *
 * Seeds:
 *  - PMPKnowledgeArea (10 areas)
 *  - PMPProcessGroup (5 groups)
 *  - PMPProcess (49 processes)
 *  - PMPExamQuestion (50 sample questions)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Knowledge Areas ─────────────────────────────────────────
const KA_DATA = [
  { code: 'integration',    name: 'Project Integration Management',    nameVi: 'Quản lý Tích hợp Dự án',          description: 'Xác định, thống nhất và phối hợp các quy trình quản lý dự án.',                     order: 1 },
  { code: 'scope',          name: 'Project Scope Management',          nameVi: 'Quản lý Phạm vi Dự án',            description: 'Đảm bảo dự án bao gồm tất cả công việc cần thiết và chỉ công việc cần thiết.',         order: 2 },
  { code: 'schedule',       name: 'Project Schedule Management',       nameVi: 'Quản lý Lịch trình Dự án',         description: 'Quản lý việc hoàn thành dự án đúng hạn.',                                             order: 3 },
  { code: 'cost',           name: 'Project Cost Management',           nameVi: 'Quản lý Chi phí Dự án',            description: 'Lập kế hoạch, ước tính, ngân sách, tài trợ và kiểm soát chi phí.',                    order: 4 },
  { code: 'quality',        name: 'Project Quality Management',        nameVi: 'Quản lý Chất lượng Dự án',         description: 'Đảm bảo dự án đáp ứng các yêu cầu chất lượng đã xác định.',                          order: 5 },
  { code: 'resource',       name: 'Project Resource Management',       nameVi: 'Quản lý Nguồn lực Dự án',          description: 'Xác định, thu thập và quản lý trong các nguồn lực cần thiết.',                        order: 6 },
  { code: 'communications', name: 'Project Communications Management', nameVi: 'Quản lý Truyền thông Dự án',       description: 'Đảm bảo thông tin dự án được lập kế hoạch, thu thập và phân phối kịp thời.',          order: 7 },
  { code: 'risk',           name: 'Project Risk Management',           nameVi: 'Quản lý Rủi ro Dự án',             description: 'Xác định, phân tích và lập kế hoạch ứng phó với rủi ro dự án.',                       order: 8 },
  { code: 'procurement',    name: 'Project Procurement Management',    nameVi: 'Quản lý Mua sắm Dự án',            description: 'Mua hoặc thuê sản phẩm, dịch vụ từ bên ngoài nhóm dự án.',                           order: 9 },
  { code: 'stakeholder',    name: 'Project Stakeholder Management',    nameVi: 'Quản lý Các bên liên quan Dự án',  description: 'Xác định và quản lý tất cả các bên ảnh hưởng hoặc bị ảnh hưởng bởi dự án.',          order: 10 },
];

// ─── Process Groups ─────────────────────────────────────────
const PG_DATA = [
  { code: 'initiating',  name: 'Initiating Process Group',              nameVi: 'Nhóm Quy trình Khởi động',       order: 1 },
  { code: 'planning',    name: 'Planning Process Group',                nameVi: 'Nhóm Quy trình Lập kế hoạch',   order: 2 },
  { code: 'executing',   name: 'Executing Process Group',               nameVi: 'Nhóm Quy trình Thực thi',       order: 3 },
  { code: 'monitoring',  name: 'Monitoring and Controlling Process Group', nameVi: 'Nhóm Quy trình Giám sát & Kiểm soát', order: 4 },
  { code: 'closing',     name: 'Closing Process Group',                 nameVi: 'Nhóm Quy trình Kết thúc',       order: 5 },
];

// ─── Processes ───────────────────────────────────────────────
// [kaCode, pgCode, name, nameVi, description?, keyPoints?]
type ProcDef = [string, string, string, string, string?, string?];
const PROC_DATA: ProcDef[] = [
  // Integration (7)
  ['integration', 'initiating',  'Develop Project Charter',               'Phát triển Điều lệ Dự án',                'Tạo tài liệu chính thức phê duyệt dự án và trao quyền cho PM.', 'Là quy trình đầu tiên trong Initiating; outputs: Project Charter'],
  ['integration', 'planning',    'Develop Project Management Plan',       'Phát triển Kế hoạch Quản lý Dự án',       'Xác định, chuẩn bị và phối hợp tất cả các kế hoạch phụ.', 'Output: Project Management Plan (tài liệu tổng hợp của tất cả subsidiary plans)'],
  ['integration', 'executing',   'Direct and Manage Project Work',        'Chỉ đạo và Quản lý Công việc Dự án',      'Lãnh đạo và thực hiện công việc được xác định trong PMP.', 'Tạo ra Deliverables; cập nhật Issue Log và Change Requests'],
  ['integration', 'executing',   'Manage Project Knowledge',              'Quản lý Kiến thức Dự án',                  'Sử dụng kiến thức hiện có và tạo ra kiến thức mới để đạt mục tiêu.', 'Input: Lessons Learned từ các dự án trước; Output: Lessons Learned Register'],
  ['integration', 'monitoring',  'Monitor and Control Project Work',      'Giám sát và Kiểm soát Công việc Dự án',   'Theo dõi, xem xét và báo cáo tiến độ tổng thể.', 'So sánh thực tế vs kế hoạch; tạo Work Performance Reports'],
  ['integration', 'monitoring',  'Perform Integrated Change Control',     'Thực hiện Kiểm soát Thay đổi Tích hợp',  'Xem xét, phê duyệt và quản lý tất cả các yêu cầu thay đổi.', 'Change Control Board (CCB) phê duyệt/từ chối Change Requests; cập nhật Configuration Management System'],
  ['integration', 'closing',     'Close Project or Phase',                'Kết thúc Dự án hoặc Giai đoạn',           'Hoàn thành tất cả hoạt động để kết thúc dự án/giai đoạn.', 'Output: Final Product/Service/Result Transition; Lessons Learned; Project Documents Updates'],
  // Scope (6)
  ['scope', 'planning',   'Plan Scope Management',   'Lập kế hoạch Quản lý Phạm vi',      'Tạo Scope Management Plan và Requirements Management Plan.', 'Output: Scope Management Plan; Requirements Management Plan'],
  ['scope', 'planning',   'Collect Requirements',    'Thu thập Yêu cầu',                   'Xác định, tài liệu hóa và quản lý nhu cầu của stakeholders.', 'Tools: Interviews, Focus Groups, Surveys, Prototypes; Output: Requirements Documentation, Requirements Traceability Matrix'],
  ['scope', 'planning',   'Define Scope',            'Xác định Phạm vi',                   'Phát triển mô tả chi tiết về dự án và sản phẩm.', 'Output: Project Scope Statement; Project Documents Updates'],
  ['scope', 'planning',   'Create WBS',              'Tạo WBS',                            'Phân chia deliverables và công việc thành các thành phần nhỏ hơn.', 'WBS = Work Breakdown Structure; Work Package = đơn vị nhỏ nhất; Output: Scope Baseline'],
  ['scope', 'monitoring', 'Validate Scope',          'Xác nhận Phạm vi',                   'Khách hàng chính thức chấp nhận các deliverables đã hoàn thành.', 'Khác với Control Quality: Validate Scope = khách hàng chấp nhận; Control Quality = kiểm tra kỹ thuật nội bộ'],
  ['scope', 'monitoring', 'Control Scope',           'Kiểm soát Phạm vi',                  'Giám sát phạm vi và quản lý thay đổi đối với scope baseline.', 'Ngăn chặn Scope Creep; Output: Change Requests; Work Performance Information'],
  // Schedule (6)
  ['schedule', 'planning',   'Plan Schedule Management',      'Lập kế hoạch Quản lý Lịch trình',    'Thiết lập chính sách, quy trình và tài liệu để lập lịch trình.', 'Output: Schedule Management Plan'],
  ['schedule', 'planning',   'Define Activities',             'Xác định Hoạt động',                  'Xác định các hành động cụ thể cần thực hiện để tạo ra deliverables.', 'Output: Activity List; Activity Attributes; Milestone List'],
  ['schedule', 'planning',   'Sequence Activities',           'Sắp xếp Thứ tự Hoạt động',            'Xác định và tài liệu hóa quan hệ giữa các hoạt động dự án.', 'Tools: PDM (Precedence Diagramming Method); Output: Project Schedule Network Diagram; Dependency types: FS, FF, SS, SF'],
  ['schedule', 'planning',   'Estimate Activity Durations',   'Ước tính Thời lượng Hoạt động',       'Ước tính số kỳ làm việc cần thiết để hoàn thành từng hoạt động.', 'Tools: PERT, Analogous, Parametric, Three-Point Estimating'],
  ['schedule', 'planning',   'Develop Schedule',              'Phát triển Lịch trình',                'Phân tích chuỗi hoạt động, thời lượng, yêu cầu nguồn lực để tạo schedule.', 'Tools: Critical Path Method (CPM), Schedule Compression (Crashing/Fast Tracking); Output: Schedule Baseline'],
  ['schedule', 'monitoring', 'Control Schedule',              'Kiểm soát Lịch trình',                'Giám sát trạng thái dự án để cập nhật lịch trình và quản lý thay đổi.', 'SPI = EV/PV; SV = EV-PV; Output: Schedule Forecasts; Change Requests'],
  // Cost (4)
  ['cost', 'planning',   'Plan Cost Management',  'Lập kế hoạch Quản lý Chi phí', 'Xác định cách ước tính, ngân sách, quản lý và kiểm soát chi phí.', 'Output: Cost Management Plan'],
  ['cost', 'planning',   'Estimate Costs',         'Ước tính Chi phí',              'Phát triển ước tính chi phí cho nguồn lực cần thiết.', 'Tools: Analogous, Parametric, Bottom-up, Three-point; Output: Cost Estimates; Basis of Estimates'],
  ['cost', 'planning',   'Determine Budget',       'Xác định Ngân sách',            'Tổng hợp chi phí ước tính để thiết lập cost baseline.', 'Output: Cost Baseline; Project Funding Requirements; BAC (Budget at Completion)'],
  ['cost', 'monitoring', 'Control Costs',          'Kiểm soát Chi phí',             'Giám sát trạng thái để cập nhật chi phí dự án và quản lý thay đổi.', 'EVM: CPI = EV/AC; CV = EV-AC; EAC = BAC/CPI; ETC = EAC-AC; TCPI = (BAC-EV)/(BAC-AC)'],
  // Quality (3)
  ['quality', 'planning',   'Plan Quality Management', 'Lập kế hoạch Quản lý Chất lượng', 'Xác định yêu cầu và tiêu chuẩn chất lượng cho dự án/sản phẩm.', 'Output: Quality Management Plan; Quality Metrics; Quality Checklists'],
  ['quality', 'executing',  'Manage Quality',          'Quản lý Chất lượng',               'Dịch Quality Management Plan thành các hoạt động chất lượng có thể thực hiện.', 'Trước đây gọi là "Perform Quality Assurance"; Focus: phòng ngừa (prevention)'],
  ['quality', 'monitoring', 'Control Quality',         'Kiểm soát Chất lượng',             'Giám sát và ghi lại kết quả thực thi để đánh giá hiệu suất.', 'Focus: kiểm tra (inspection); Tools: Statistical Sampling, Inspection, Testing'],
  // Resource (6)
  ['resource', 'planning',   'Plan Resource Management',     'Lập kế hoạch Quản lý Nguồn lực',   'Xác định cách ước tính, thu thập và quản lý nguồn lực.', 'Output: Resource Management Plan; Team Charter'],
  ['resource', 'planning',   'Estimate Activity Resources',  'Ước tính Nguồn lực Hoạt động',     'Ước tính loại và số lượng tài liệu, nguồn nhân lực, thiết bị.', 'Output: Resource Requirements; Resource Breakdown Structure'],
  ['resource', 'executing',  'Acquire Resources',            'Thu thập Nguồn lực',               'Xác nhận nguồn lực, có được nhóm và vật chất cần thiết.', 'Output: Physical Resource Assignments; Project Team Assignments; Resource Calendars'],
  ['resource', 'executing',  'Develop Team',                 'Phát triển Nhóm',                  'Cải thiện năng lực, tương tác và môi trường làm việc nhóm.', 'Tuckman: Forming→Storming→Norming→Performing→Adjourning; Output: Team Performance Assessments'],
  ['resource', 'executing',  'Manage Team',                  'Quản lý Nhóm',                     'Theo dõi hiệu suất, đưa phản hồi, giải quyết vấn đề.', 'Conflict Resolution: Collaborate/Problem Solving (best), Compromise, Smooth/Accommodate, Force/Direct, Withdraw/Avoid'],
  ['resource', 'monitoring', 'Control Resources',            'Kiểm soát Nguồn lực',              'Đảm bảo nguồn lực vật chất được phân bổ và sử dụng như kế hoạch.', 'Output: Work Performance Information; Change Requests'],
  // Communications (3)
  ['communications', 'planning',   'Plan Communications Management', 'Lập kế hoạch Quản lý Truyền thông', 'Phát triển cách tiếp cận thông tin phù hợp dựa trên nhu cầu stakeholder.', 'Công thức: n(n-1)/2 kênh giao tiếp; Output: Communications Management Plan'],
  ['communications', 'executing',  'Manage Communications',          'Quản lý Truyền thông',               'Thu thập, tạo, phân phối, lưu trữ và truy xuất thông tin.', 'PM dành ~90% thời gian giao tiếp; Methods: Interactive, Push, Pull'],
  ['communications', 'monitoring', 'Monitor Communications',         'Giám sát Truyền thông',              'Đảm bảo nhu cầu thông tin của dự án và các stakeholder được đáp ứng.', 'Output: Work Performance Information; Change Requests'],
  // Risk (7)
  ['risk', 'planning',   'Plan Risk Management',            'Lập kế hoạch Quản lý Rủi ro',            'Xác định cách thực hiện các hoạt động quản lý rủi ro.', 'Output: Risk Management Plan'],
  ['risk', 'planning',   'Identify Risks',                  'Xác định Rủi ro',                         'Xác định các rủi ro có thể ảnh hưởng đến dự án.', 'Tools: Brainstorming, SWOT, Checklists, Interviews; Output: Risk Register; Risk Report'],
  ['risk', 'planning',   'Perform Qualitative Risk Analysis', 'Phân tích Rủi ro Định tính',            'Ưu tiên hóa rủi ro để phân tích thêm dựa trên xác suất và tác động.', 'Probability-Impact Matrix; Output: Risk Register Updates'],
  ['risk', 'planning',   'Perform Quantitative Risk Analysis', 'Phân tích Rủi ro Định lượng',          'Phân tích số học tác động của rủi ro đã xác định lên mục tiêu.', 'Tools: Monte Carlo Simulation; Decision Trees; EMV = Probability × Impact'],
  ['risk', 'planning',   'Plan Risk Responses',             'Lập kế hoạch Ứng phó Rủi ro',             'Phát triển tùy chọn và hành động để giảm thiểu mối đe dọa.', 'Threats: Avoid, Transfer, Mitigate, Accept; Opportunities: Exploit, Share, Enhance, Accept'],
  ['risk', 'executing',  'Implement Risk Responses',        'Thực hiện Ứng phó Rủi ro',                'Thực thi các kế hoạch ứng phó rủi ro đã thỏa thuận.', 'Output: Change Requests; Project Documents Updates'],
  ['risk', 'monitoring', 'Monitor Risks',                   'Giám sát Rủi ro',                         'Theo dõi rủi ro đã xác định, xác định rủi ro mới và đánh giá hiệu quả.', 'Output: Work Performance Information; Change Requests; Risk Register Updates'],
  // Procurement (3)
  ['procurement', 'planning',   'Plan Procurement Management', 'Lập kế hoạch Quản lý Mua sắm', 'Tài liệu hóa các quyết định mua sắm, xác định phương pháp và nhà cung cấp tiềm năng.', 'Output: Procurement Management Plan; Procurement Statement of Work (SOW); Source Selection Criteria'],
  ['procurement', 'executing',  'Conduct Procurements',        'Tiến hành Mua sắm',             'Nhận phản hồi, lựa chọn nhà cung cấp và ký kết hợp đồng.', 'Tools: Bidder Conference, Proposal Evaluation; Output: Selected Sellers; Agreements'],
  ['procurement', 'monitoring', 'Control Procurements',        'Kiểm soát Mua sắm',             'Quản lý mối quan hệ mua sắm, giám sát hiệu suất hợp đồng.', 'Output: Closed Procurements; Work Performance Information; Change Requests'],
  // Stakeholder (4)
  ['stakeholder', 'initiating', 'Identify Stakeholders',          'Xác định Các bên liên quan',          'Xác định người/tổ chức bị ảnh hưởng bởi dự án.', 'Thực hiện từ sớm nhất có thể; Output: Stakeholder Register'],
  ['stakeholder', 'planning',   'Plan Stakeholder Engagement',    'Lập kế hoạch Tham gia của Stakeholders', 'Phát triển phương pháp tương tác hiệu quả với stakeholders.', 'Engagement Scale: Unaware→Resistant→Neutral→Supportive→Leading; Output: Stakeholder Engagement Plan'],
  ['stakeholder', 'executing',  'Manage Stakeholder Engagement',  'Quản lý Tương tác với Stakeholders', 'Làm việc với stakeholders để đáp ứng nhu cầu và giải quyết vấn đề.', 'Output: Change Requests; Project Documents Updates (Issue Log, Stakeholder Register)'],
  ['stakeholder', 'monitoring', 'Monitor Stakeholder Engagement', 'Giám sát Tương tác với Stakeholders', 'Giám sát mối quan hệ và điều chỉnh chiến lược tham gia.', 'Output: Work Performance Information; Change Requests'],
];

// ─── Sample Exam Questions ──────────────────────────────────
type QDef = { area: string; group: string; content: string; optionA: string; optionB: string; optionC: string; optionD: string; answer: string; explain: string; difficulty: string };
const QUESTIONS: QDef[] = [
  // Integration
  { area: 'integration', group: 'initiating', content: 'Tài liệu nào chính thức phê duyệt sự tồn tại của dự án và trao quyền cho Project Manager?', optionA: 'Project Management Plan', optionB: 'Project Charter', optionC: 'Scope Statement', optionD: 'Business Case', answer: 'B', explain: 'Project Charter là tài liệu duy nhất chính thức phê duyệt dự án và trao quyền cho PM để sử dụng tài nguyên tổ chức.', difficulty: 'easy' },
  { area: 'integration', group: 'monitoring', content: 'Ai có trách nhiệm phê duyệt hoặc từ chối các yêu cầu thay đổi trong quy trình Perform Integrated Change Control?', optionA: 'Project Manager', optionB: 'Project Sponsor', optionC: 'Change Control Board (CCB)', optionD: 'Functional Manager', answer: 'C', explain: 'Change Control Board (CCB) là cơ quan có thẩm quyền phê duyệt hoặc từ chối các Change Requests.', difficulty: 'medium' },
  { area: 'integration', group: 'executing', content: 'Khi nào thì Lessons Learned được thu thập trong dự án theo PMBOK 6?', optionA: 'Chỉ ở giai đoạn kết thúc dự án', optionB: 'Ở giai đoạn Planning và Closing', optionC: 'Trong suốt vòng đời dự án', optionD: 'Chỉ khi có vấn đề phát sinh', answer: 'C', explain: 'PMBOK 6 nhấn mạnh Lessons Learned phải được thu thập liên tục trong suốt vòng đời dự án, không chỉ ở cuối.', difficulty: 'medium' },
  // Scope
  { area: 'scope', group: 'monitoring', content: 'Sự khác biệt chính giữa Validate Scope và Control Quality là gì?', optionA: 'Validate Scope kiểm tra kỹ thuật, Control Quality xem xét với khách hàng', optionB: 'Validate Scope là khách hàng chấp nhận deliverables, Control Quality là kiểm tra nội bộ', optionC: 'Không có sự khác biệt, cả hai đều giống nhau', optionD: 'Validate Scope chỉ xảy ra ở cuối dự án', answer: 'B', explain: 'Validate Scope = khách hàng/sponsor chính thức chấp nhận deliverables. Control Quality = nhóm dự án kiểm tra deliverables xem có đúng tiêu chuẩn kỹ thuật không.', difficulty: 'hard' },
  { area: 'scope', group: 'planning', content: 'Đơn vị nhỏ nhất trong WBS được gọi là gì?', optionA: 'Task', optionB: 'Activity', optionC: 'Work Package', optionD: 'Milestone', answer: 'C', explain: 'Work Package là đơn vị nhỏ nhất trong WBS, từ đó có thể ước tính chi phí và thời gian. Activities được tạo từ Work Packages trong Schedule Management.', difficulty: 'easy' },
  { area: 'scope', group: 'planning', content: 'Scope Creep là gì?', optionA: 'Sự mở rộng phạm vi có kiểm soát thông qua Change Control', optionB: 'Sự mở rộng phạm vi không kiểm soát và không được phê duyệt', optionC: 'Phạm vi dự án quá nhỏ so với yêu cầu', optionD: 'Quá trình thu hẹp phạm vi dự án', answer: 'B', explain: 'Scope Creep là tình trạng phạm vi dự án bị mở rộng mà không đi qua quy trình kiểm soát thay đổi. Đây là một trong những nguyên nhân phổ biến nhất khiến dự án thất bại.', difficulty: 'easy' },
  // Schedule
  { area: 'schedule', group: 'planning', content: 'Critical Path là gì?', optionA: 'Con đường có nhiều rủi ro nhất trong mạng lưới', optionB: 'Chuỗi hoạt động dài nhất xác định thời gian hoàn thành dự án sớm nhất', optionC: 'Con đường có chi phí cao nhất', optionD: 'Chuỗi hoạt động có ít float nhất nhưng không nhất thiết là 0', answer: 'B', explain: 'Critical Path là chuỗi hoạt động dài nhất trong mạng lưới dự án, xác định thời gian hoàn thành tối thiểu của dự án. Các hoạt động trên Critical Path có float = 0.', difficulty: 'medium' },
  { area: 'schedule', group: 'planning', content: 'Fast Tracking và Crashing khác nhau như thế nào?', optionA: 'Fast Tracking tăng chi phí, Crashing thực hiện song song', optionB: 'Fast Tracking thực hiện song song các công việc, Crashing bổ sung nguồn lực', optionC: 'Cả hai đều là kỹ thuật giảm rủi ro', optionD: 'Fast Tracking an toàn hơn Crashing', answer: 'B', explain: 'Fast Tracking: thực hiện các hoạt động song song thay vì tuần tự → tăng rủi ro. Crashing: bổ sung nguồn lực để rút ngắn tiến độ → tăng chi phí.', difficulty: 'medium' },
  { area: 'schedule', group: 'monitoring', content: 'SPI = 0.85 có nghĩa là gì?', optionA: 'Dự án tiêu thụ ít hơn 15% ngân sách so với kế hoạch', optionB: 'Dự án đi sau tiến độ (chỉ hoàn thành được 85% công việc theo kế hoạch)', optionC: 'Dự án đi trước tiến độ 15%', optionD: 'Dự án vượt ngân sách 15%', answer: 'B', explain: 'SPI = EV/PV. SPI < 1 = dự án trễ hơn kế hoạch. SPI = 0.85 có nghĩa là hoàn thành được 85 đơn vị trong khi kế hoạch là 100 đơn vị.', difficulty: 'medium' },
  // Cost
  { area: 'cost', group: 'monitoring', content: 'Cost Performance Index (CPI) = 1.2 có nghĩa là gì?', optionA: 'Dự án vượt ngân sách 20%', optionB: 'Dự án đang trước tiến độ 20%', optionC: 'Dự án chi tiêu hiệu quả hơn 20% so với kế hoạch (dưới ngân sách)', optionD: 'Dự án sẽ tốn thêm 20% trong phần còn lại', answer: 'C', explain: 'CPI = EV/AC. CPI > 1 = dưới ngân sách (hiệu quả hơn). CPI = 1.2 nghĩa là thu về 1.2 đô giá trị cho mỗi 1 đô chi ra.', difficulty: 'medium' },
  { area: 'cost', group: 'planning', content: 'BAC là viết tắt của gì và có ý nghĩa như thế nào?', optionA: 'Budget Allocation Code — mã phân bổ ngân sách', optionB: 'Budget at Completion — tổng ngân sách được phê duyệt cho toàn bộ dự án', optionC: 'Base Adjustment Calculation — phép tính điều chỉnh cơ sở', optionD: 'Baseline Actual Cost — chi phí thực tế so với baseline', answer: 'B', explain: 'BAC (Budget at Completion) là tổng ngân sách được phê duyệt cho toàn bộ dự án. Đây là giá trị quan trọng trong EVM.', difficulty: 'easy' },
  { area: 'cost', group: 'monitoring', content: 'Nếu EAC = BAC/CPI, điều đó giả định gì về phần còn lại của dự án?', optionA: 'Phần còn lại sẽ thực hiện theo kế hoạch ban đầu', optionB: 'Phần còn lại sẽ tiếp tục ở mức hiệu suất hiện tại (CPI hiện tại)', optionC: 'Phần còn lại sẽ không tốn chi phí nào', optionD: 'Phần còn lại sẽ tiết kiệm chi phí so với kế hoạch', answer: 'B', explain: 'EAC = BAC/CPI giả định phần còn lại của dự án sẽ tiếp tục ở mức hiệu suất hiện tại (CPI không đổi). Đây là công thức EAC phổ biến khi có độ lệch ban đầu tiêu biểu cho tương lai.', difficulty: 'hard' },
  // Quality
  { area: 'quality', group: 'executing', content: 'Gold Plating trong quản lý dự án là gì và có được khuyến khích không?', optionA: 'Thêm tính năng vượt yêu cầu — được khuyến khích vì tăng value', optionB: 'Thêm tính năng vượt yêu cầu mà không có sự phê duyệt — KHÔNG được khuyến khích', optionC: 'Sử dụng vật liệu chất lượng cao hơn yêu cầu', optionD: 'Kiểm tra chất lượng bổ sung', answer: 'B', explain: 'Gold Plating là thêm tính năng, tính năng hoặc công việc ngoài phạm vi đã được phê duyệt mà không có sự chấp thuận. PMBOK không khuyến khích vì có thể gây ra vấn đề về phạm vi, thời gian và chi phí.', difficulty: 'medium' },
  { area: 'quality', group: 'planning', content: 'Cost of Conformance bao gồm những gì?', optionA: 'Chi phí sửa lỗi, warranty, rework', optionB: 'Chi phí đào tạo, kiểm tra, phòng ngừa lỗi', optionC: 'Chi phí kiện tụng và bảo hành', optionD: 'Chi phí phát sinh khi sản phẩm lỗi', answer: 'B', explain: 'Cost of Conformance (chi phí phù hợp) = chi phí để tạo ra chất lượng: đào tạo, kiểm tra, phòng ngừa. Cost of Nonconformance = chi phí vì không có chất lượng: rework, warranty, litigation.', difficulty: 'hard' },
  // Resource
  { area: 'resource', group: 'executing', content: 'Theo Tuckman Ladder, giai đoạn nào xảy ra sau Forming?', optionA: 'Performing', optionB: 'Norming', optionC: 'Storming', optionD: 'Adjourning', answer: 'C', explain: 'Tuckman Ladder: Forming (hình thành) → Storming (xung đột) → Norming (ổn định) → Performing (hiệu suất cao) → Adjourning (giải thể). PM cần hiểu để hỗ trợ nhóm đúng cách ở từng giai đoạn.', difficulty: 'easy' },
  { area: 'resource', group: 'executing', content: 'Phương pháp giải quyết xung đột nào được PMBOK khuyến nghị là tốt nhất?', optionA: 'Smoothing/Accommodating — làm nhẹ tầm quan trọng của xung đột', optionB: 'Forcing/Directing — dùng quyền lực áp đặt giải pháp', optionC: 'Collaborating/Problem Solving — giải quyết lý do gốc rễ', optionD: 'Compromising — mỗi bên nhượng bộ một phần', answer: 'C', explain: 'PMBOK 6 khuyến nghị Collaborating/Problem Solving là phương pháp tốt nhất vì nó giải quyết lý do gốc rễ của xung đột, tạo ra win-win solution và duy trì mối quan hệ lâu dài.', difficulty: 'medium' },
  // Communications
  { area: 'communications', group: 'planning', content: 'Một nhóm dự án có 8 thành viên. Có bao nhiêu kênh giao tiếp?', optionA: '24', optionB: '56', optionC: '28', optionD: '16', answer: 'C', explain: 'Công thức: n(n-1)/2 = 8×7/2 = 28 kênh giao tiếp. PM cần quản lý tất cả các kênh này.', difficulty: 'easy' },
  { area: 'communications', group: 'executing', content: 'Communication Method nào phù hợp nhất khi cần thảo luận và nhận phản hồi ngay lập tức?', optionA: 'Pull Communication — email newsletter', optionB: 'Push Communication — gửi báo cáo', optionC: 'Interactive Communication — họp, điện thoại', optionD: 'Passive Communication', answer: 'C', explain: 'Interactive Communication (giao tiếp tương tác) như họp, điện thoại là phù hợp nhất khi cần thảo luận hai chiều và nhận phản hồi ngay. Push: gửi một chiều. Pull: người nhận tự lấy thông tin.', difficulty: 'medium' },
  // Risk
  { area: 'risk', group: 'planning', content: 'Chiến lược ứng phó rủi ro nào phù hợp nhất để chuyển giao gánh nặng tài chính của rủi ro sang bên thứ ba?', optionA: 'Avoid — loại bỏ hoàn toàn rủi ro', optionB: 'Mitigate — giảm xác suất hoặc tác động', optionC: 'Transfer — chuyển giao (ví dụ: mua bảo hiểm)', optionD: 'Accept — chấp nhận rủi ro', answer: 'C', explain: 'Transfer (chuyển giao) như mua bảo hiểm, ký hợp đồng với bên thứ ba chuyển giao trách nhiệm tài chính. Không loại bỏ rủi ro nhưng chuyển gánh nặng sang bên khác.', difficulty: 'medium' },
  { area: 'risk', group: 'planning', content: 'Expected Monetary Value (EMV) của một rủi ro có xác suất 30% và tác động -$100,000 là bao nhiêu?', optionA: '-$30,000', optionB: '$30,000', optionC: '-$70,000', optionD: '$70,000', answer: 'A', explain: 'EMV = Probability × Impact = 0.30 × (-$100,000) = -$30,000. Giá trị âm vì đây là mối đe dọa (threat). EMV được dùng trong Decision Tree Analysis.', difficulty: 'medium' },
  { area: 'risk', group: 'planning', content: 'Risk Register được tạo ra đầu tiên ở quy trình nào?', optionA: 'Plan Risk Management', optionB: 'Identify Risks', optionC: 'Perform Qualitative Risk Analysis', optionD: 'Plan Risk Responses', answer: 'B', explain: 'Risk Register được tạo ra lần đầu tiên trong quy trình Identify Risks. Sau đó được cập nhật trong các quy trình tiếp theo như Qualitative Analysis, Quantitative Analysis và Plan Risk Responses.', difficulty: 'easy' },
  // Procurement
  { area: 'procurement', group: 'planning', content: 'Loại hợp đồng nào có mức độ rủi ro cao nhất cho Seller?', optionA: 'Cost Reimbursable (CR)', optionB: 'Time and Material (T&M)', optionC: 'Fixed Price (FP)', optionD: 'Cost Plus Fixed Fee (CPFF)', answer: 'C', explain: 'Fixed Price Contract: Seller phải hoàn thành với giá cố định dù chi phí thực tế là bao nhiêu → Seller chịu rủi ro cao nhất. Buyer có rủi ro thấp nhất với loại hợp đồng này.', difficulty: 'medium' },
  { area: 'procurement', group: 'executing', content: 'Bidder Conference (Hội nghị Nhà thầu) có mục đích gì?', optionA: 'Chọn nhà thầu thắng cuộc', optionB: 'Đảm bảo tất cả nhà thầu tiềm năng hiểu rõ yêu cầu như nhau', optionC: 'Ký kết hợp đồng', optionD: 'Đánh giá hiệu suất nhà cung cấp', answer: 'B', explain: 'Bidder Conference (còn gọi là Contractor Conference hoặc Pre-bid Conference) đảm bảo tất cả nhà thầu tiềm năng đều hiểu rõ yêu cầu như nhau, tránh lợi thế không công bằng.', difficulty: 'medium' },
  // Stakeholder
  { area: 'stakeholder', group: 'initiating', content: 'Khi nào nên thực hiện quy trình Identify Stakeholders?', optionA: 'Chỉ ở giai đoạn đầu dự án', optionB: 'Càng sớm càng tốt, ngay từ khi nhận được Project Charter', optionC: 'Sau khi hoàn thành Project Management Plan', optionD: 'Chỉ khi có stakeholder mới xuất hiện', answer: 'B', explain: 'Identify Stakeholders nên thực hiện càng sớm càng tốt vì stakeholders ảnh hưởng lớn đến dự án ngay từ đầu. Nên làm ngay khi nhận được Project Charter và lặp lại định kỳ trong suốt dự án.', difficulty: 'easy' },
  { area: 'stakeholder', group: 'planning', content: 'Stakeholder Engagement Assessment Matrix phân loại stakeholders theo mức độ nào?', optionA: 'Quyền lực (Power) và Quan tâm (Interest)', optionB: 'Mức độ tham gia Hiện tại (Current) và Mong muốn (Desired)', optionC: 'Ảnh hưởng (Influence) và Tác động (Impact)', optionD: 'Hỗ trợ (Support) và Phản đối (Oppose)', answer: 'B', explain: 'Stakeholder Engagement Assessment Matrix so sánh mức độ tham gia hiện tại (C) vs mong muốn (D) trên thang: Unaware → Resistant → Neutral → Supportive → Leading. PM cần thu hẹp khoảng cách C-D.', difficulty: 'hard' },
];

// ─── Main ─────────────────────────────────────────────────
async function main() {
  console.log('🌱 Seeding PMP module...\n');

  // 1. Knowledge Areas
  console.log('📚 Creating Knowledge Areas...');
  const kaMap = new Map<string, string>();
  for (const ka of KA_DATA) {
    const row = await prisma.pMPKnowledgeArea.upsert({
      where: { code: ka.code },
      update: { name: ka.name, nameVi: ka.nameVi, description: ka.description, order: ka.order },
      create: ka,
    });
    kaMap.set(ka.code, row.id);
    console.log(`   ✓ ${ka.code}`);
  }

  // 2. Process Groups
  console.log('\n📋 Creating Process Groups...');
  const pgMap = new Map<string, string>();
  for (const pg of PG_DATA) {
    const row = await prisma.pMPProcessGroup.upsert({
      where: { code: pg.code },
      update: { name: pg.name, nameVi: pg.nameVi, order: pg.order },
      create: pg,
    });
    pgMap.set(pg.code, row.id);
    console.log(`   ✓ ${pg.code}`);
  }

  // 3. Processes
  console.log('\n⚙️  Creating Processes...');
  const procMap = new Map<string, string>();
  let procOrder = 0;
  for (const [kaCode, pgCode, name, nameVi, description, keyPoints] of PROC_DATA) {
    const kaId = kaMap.get(kaCode)!;
    const pgId = pgMap.get(pgCode)!;
    const existing = await prisma.pMPProcess.findFirst({ where: { knowledgeAreaId: kaId, name } });
    if (!existing) {
      const row = await prisma.pMPProcess.create({
        data: { knowledgeAreaId: kaId, processGroupId: pgId, name, nameVi, description, keyPoints, order: ++procOrder },
      });
      procMap.set(name, row.id);
      console.log(`   ✓ [${kaCode}/${pgCode}] ${name}`);
    } else {
      procMap.set(name, existing.id);
      console.log(`   – [${kaCode}/${pgCode}] ${name} (already exists)`);
    }
  }

  // 4. Exam Questions
  console.log('\n❓ Creating Exam Questions...');
  let qCreated = 0;
  for (const q of QUESTIONS) {
    const existing = await prisma.pMPExamQuestion.findFirst({ where: { content: q.content } });
    if (!existing) {
      await prisma.pMPExamQuestion.create({ data: q });
      qCreated++;
    }
  }
  console.log(`   ✓ ${qCreated} new questions created`);

  // Summary
  const kaCount = await prisma.pMPKnowledgeArea.count();
  const pgCount = await prisma.pMPProcessGroup.count();
  const procCount = await prisma.pMPProcess.count();
  const qCount = await prisma.pMPExamQuestion.count();
  console.log(`\n✅ PMP Seeding Complete:`);
  console.log(`   Knowledge Areas : ${kaCount}`);
  console.log(`   Process Groups  : ${pgCount}`);
  console.log(`   Processes       : ${procCount}`);
  console.log(`   Exam Questions  : ${qCount}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
