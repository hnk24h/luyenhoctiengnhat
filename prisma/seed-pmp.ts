/**
 * Seeder: PMP PMBOK 6 — Full Edition
 * Run: npx tsx prisma/seed-pmp.ts
 *
 * Lần 1/3: Knowledge Areas + Process Groups + 49 Processes (đầy đủ ITTOs)
 * Lần 2/3: seed-pmp-questions.ts (200+ câu hỏi thi)
 * Lần 3/3: seed-pmp-learn.ts (LearningCategory / LearningLesson)
 *
 * Seeds:
 *  - PMPKnowledgeArea (10 vùng kiến thức)
 *  - PMPProcessGroup (5 nhóm quy trình)
 *  - PMPProcess (49 quy trình — đầy đủ inputs, tools, outputs theo PMBOK 6)
 *  - PMPExamQuestion (câu hỏi mẫu — đầy đủ hơn ở Lần 2)
 */

import { PrismaClient, Difficulty } from '@prisma/client';

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

// ─── 49 Processes — Full ITTOs ──────────────────────────────────────────────────
interface ProcDef {
  kaCode: string; pgCode: string;
  name: string; nameVi: string;
  description: string;
  inputs: string[]; tools: string[]; outputs: string[];
  keyPoints: string;
  order: number;
}

const PROC_DATA: ProcDef[] = [

  // ══════════════ 1. INTEGRATION (7) ══════════════
  {
    kaCode: 'integration', pgCode: 'initiating', order: 1,
    name: 'Develop Project Charter', nameVi: 'Phát triển Điều lệ Dự án',
    description: 'Tạo tài liệu chính thức phê duyệt sự tồn tại của dự án và trao quyền cho PM sử dụng nguồn lực tổ chức.',
    inputs: ['Business case', 'Benefits management plan', 'Agreements', 'Enterprise environmental factors (EEF)', 'Organizational process assets (OPA)'],
    tools: ['Expert judgment', 'Data gathering (brainstorming, focus groups, interviews)', 'Interpersonal & team skills (conflict management, facilitation, meeting management)', 'Meetings'],
    outputs: ['Project charter', 'Assumption log'],
    keyPoints: '**Điểm quan trọng:**\n- Là quy trình đầu tiên trong Initiating — project chính thức bắt đầu\n- Project Charter trao quyền cho PM quản lý nguồn lực tổ chức\n- PM không ký Project Charter — Sponsor ký\n- Project Charter không thể được phát triển bởi PM một mình\n- Output: Project Charter (phê duyệt dự án) + Assumption Log (ghi lại các giả định)',
  },
  {
    kaCode: 'integration', pgCode: 'planning', order: 2,
    name: 'Develop Project Management Plan', nameVi: 'Phát triển Kế hoạch Quản lý Dự án',
    description: 'Xác định, chuẩn bị và tích hợp tất cả các kế hoạch phụ thành một kế hoạch quản lý dự án toàn diện.',
    inputs: ['Project charter', 'Outputs from other planning processes', 'Enterprise environmental factors (EEF)', 'Organizational process assets (OPA)'],
    tools: ['Expert judgment', 'Data gathering (brainstorming, checklists, focus groups, interviews)', 'Interpersonal & team skills (conflict management, facilitation, meeting management)', 'Meetings'],
    outputs: ['Project management plan (tài liệu tổng hợp tất cả subsidiary plans)'],
    keyPoints: '**Subsidiary Plans:** Scope, Schedule, Cost, Quality, Resource, Communications, Risk, Procurement, Stakeholder Management Plans + Requirements, Change, Configuration Management Plans\n\n**Baselines:** Scope Baseline, Schedule Baseline, Cost Baseline (= Performance Measurement Baseline)\n\n**Lưu ý:** PMP được cập nhật thông qua Perform Integrated Change Control — không sửa trực tiếp.',
  },
  {
    kaCode: 'integration', pgCode: 'executing', order: 3,
    name: 'Direct and Manage Project Work', nameVi: 'Chỉ đạo và Quản lý Công việc Dự án',
    description: 'Lãnh đạo và thực hiện công việc được xác định trong PMP và thực thi các thay đổi đã được phê duyệt.',
    inputs: ['Project management plan', 'Project documents', 'Approved change requests', 'Enterprise environmental factors', 'Organizational process assets'],
    tools: ['Expert judgment', 'Project management information system (PMIS)', 'Meetings'],
    outputs: ['Deliverables', 'Work performance data', 'Issue log', 'Change requests', 'Project management plan updates', 'Project document updates', 'Organizational process assets updates'],
    keyPoints: '**Work Performance Data** (raw data — đầu ra quy trình này) vs **Work Performance Information** (phân tích — đầu ra M&C) vs **Work Performance Reports** (tổng hợp báo cáo).\nQuy trình này tạo ra Deliverables thực tế. Issue Log ghi lại vấn đề phát sinh. Change Requests được tạo đây và xử lý bởi Perform Integrated Change Control.',
  },
  {
    kaCode: 'integration', pgCode: 'executing', order: 4,
    name: 'Manage Project Knowledge', nameVi: 'Quản lý Kiến thức Dự án',
    description: 'Sử dụng kiến thức hiện có và tạo ra kiến thức mới để đạt mục tiêu dự án và đóng góp vào việc học tập tổ chức.',
    inputs: ['Project management plan', 'Project documents (lessons learned register, team assignments, etc.)', 'Deliverables', 'Enterprise environmental factors', 'Organizational process assets'],
    tools: ['Expert judgment', 'Knowledge management', 'Information management', 'Interpersonal & team skills (active listening, facilitation, leadership, networking, political awareness)'],
    outputs: ['Lessons learned register', 'Project management plan updates', 'Organizational process assets updates'],
    keyPoints: '**Quy trình mới trong PMBOK 6** (trước đây không có trong PMBOK 5).\nLessons Learned Register được tạo ở đây trong Executing và cập nhật xuyên suốt dự án. Cuối dự án, nó trở thành OPA.\n\n**Hai loại kiến thức:**\n- Explicit knowledge: có thể mã hóa thành văn bản\n- Tacit knowledge: khó mã hóa, cần trao đổi trực tiếp (quan trọng hơn)',
  },
  {
    kaCode: 'integration', pgCode: 'monitoring', order: 5,
    name: 'Monitor and Control Project Work', nameVi: 'Giám sát và Kiểm soát Công việc Dự án',
    description: 'Theo dõi, xem xét và báo cáo tiến độ tổng thể để đáp ứng mục tiêu hiệu suất được xác định trong PMP.',
    inputs: ['Project management plan', 'Project documents', 'Work performance information', 'Agreements', 'Enterprise environmental factors', 'Organizational process assets'],
    tools: ['Expert judgment', 'Data analysis (alternatives, cost-benefit, earned value, root cause, trend, variance)', 'Decision making', 'Meetings'],
    outputs: ['Work performance reports', 'Change requests', 'Project management plan updates', 'Project document updates'],
    keyPoints: '**Work Performance Information** (đầu vào) → phân tích → **Work Performance Reports** (đầu ra)\n\nKhác với Direct & Manage Project Work:\n- D&M: thực thi, tạo Work Performance Data (raw)\n- M&C Work: theo dõi, tạo Work Performance Reports (tổng hợp)\n\nMột số báo cáo điển hình: status reports, progress reports, forecasts.',
  },
  {
    kaCode: 'integration', pgCode: 'monitoring', order: 6,
    name: 'Perform Integrated Change Control', nameVi: 'Thực hiện Kiểm soát Thay đổi Tích hợp',
    description: 'Xem xét tất cả các yêu cầu thay đổi; phê duyệt và quản lý thay đổi đối với deliverables, tài liệu dự án và PMP.',
    inputs: ['Project management plan', 'Project documents', 'Work performance reports', 'Change requests', 'Enterprise environmental factors', 'Organizational process assets'],
    tools: ['Expert judgment', 'Change control tools (manual and automated)', 'Data analysis (alternatives analysis, cost-benefit analysis)', 'Decision making (voting, autocratic decision making, multicriteria decision analysis)', 'Meetings (Change Control Board)'],
    outputs: ['Approved change requests', 'Project management plan updates', 'Project document updates'],
    keyPoints: '**Change Control Board (CCB)** có thể bao gồm PM, sponsor, khách hàng và các stakeholder khác.\nTất cả Change Requests ĐỀU phải đi qua quy trình này.\n\n**Corrective Action:** điều chỉnh hiệu suất về kế hoạch\n**Preventive Action:** giảm xác suất vấn đề tiêu cực\n**Defect Repair:** sửa chữa defect\n\nPM có thể có quyền phê duyệt một số thay đổi nhỏ (quy định trong Change Management Plan).',
  },
  {
    kaCode: 'integration', pgCode: 'closing', order: 7,
    name: 'Close Project or Phase', nameVi: 'Kết thúc Dự án hoặc Giai đoạn',
    description: 'Hoàn thành tất cả mọi hoạt động đối với tất cả các nhóm quy trình để chính thức kết thúc dự án hoặc giai đoạn.',
    inputs: ['Project charter', 'Project management plan', 'Project documents (assumption log, change log, issue log, lessons learned register, etc.)', 'Accepted deliverables', 'Business documents (business case, benefits management plan)', 'Agreements', 'Procurement documentation', 'Organizational process assets'],
    tools: ['Expert judgment', 'Data analysis (document analysis, regression analysis, trend analysis, variance analysis)', 'Meetings'],
    outputs: ['Project documents updates (lessons learned register)', 'Final product/service/result transition', 'Final report', 'Organizational process assets updates'],
    keyPoints: '**Final Report** tóm tắt hiệu suất dự án: phạm vi, chất lượng, schedule, cost.\n\n**Quy trình này có thể chạy ở cuối mỗi phase (phase gate) hoặc cuối toàn bộ dự án.**\n\nNếu dự án bị hủy sớm: PM vẫn phải đóng dự án đúng cách — ghi lại lý do, chuyển giao deliverables đã có.',
  },

  // ══════════════ 2. SCOPE (6) ══════════════
  {
    kaCode: 'scope', pgCode: 'planning', order: 8,
    name: 'Plan Scope Management', nameVi: 'Lập kế hoạch Quản lý Phạm vi',
    description: 'Tạo Scope Management Plan và Requirements Management Plan mô tả cách phạm vi được xác định, xác nhận và kiểm soát.',
    inputs: ['Project charter', 'Project management plan (quality management plan, project lifecycle description)', 'Enterprise environmental factors', 'Organizational process assets'],
    tools: ['Expert judgment', 'Data analysis (alternatives analysis)', 'Meetings'],
    outputs: ['Scope management plan', 'Requirements management plan'],
    keyPoints: '**Scope Management Plan mô tả:** cách phát triển Project Scope Statement, tạo WBS, duy trì WBS, formal acceptance, xử lý thay đổi phạm vi.\n\n**Requirements Management Plan mô tả:** cách thu thập, phân tích, tài liệu hóa và quản lý yêu cầu, configuration management, requirements prioritization.',
  },
  {
    kaCode: 'scope', pgCode: 'planning', order: 9,
    name: 'Collect Requirements', nameVi: 'Thu thập Yêu cầu',
    description: 'Xác định, tài liệu hóa và quản lý nhu cầu và yêu cầu của stakeholders để đáp ứng mục tiêu dự án.',
    inputs: ['Project charter', 'Project management plan (scope management plan, requirements management plan, stakeholder engagement plan)', 'Project documents (assumption log, lessons learned register, stakeholder register)', 'Business documents (business case)', 'Agreements', 'Enterprise environmental factors', 'Organizational process assets'],
    tools: ['Expert judgment', 'Data gathering (brainstorming, interviews, focus groups, questionnaires & surveys, benchmarking)', 'Data analysis (document analysis)', 'Decision making (voting, autocratic decision making, multicriteria decision analysis)', 'Data representation (affinity diagrams, mind mapping)', 'Interpersonal & team skills (nominal group technique, observation/conversation, facilitation)', 'Context diagrams', 'Prototypes'],
    outputs: ['Requirements documentation', 'Requirements traceability matrix (RTM)'],
    keyPoints: '**Requirements categories:** Business requirements (why), Stakeholder requirements (needs), Solution requirements (Functional + Non-functional), Transition & readiness requirements, Project requirements, Quality requirements.\n\n**RTM (Requirements Traceability Matrix)** liên kết requirements với business objectives, WBS, product design, test strategy.',
  },
  {
    kaCode: 'scope', pgCode: 'planning', order: 10,
    name: 'Define Scope', nameVi: 'Xác định Phạm vi',
    description: 'Phát triển mô tả chi tiết về dự án và sản phẩm (Project Scope Statement).',
    inputs: ['Project charter', 'Project management plan (scope management plan)', 'Project documents (assumption log, requirements documentation, risk register)', 'Enterprise environmental factors', 'Organizational process assets'],
    tools: ['Expert judgment', 'Data analysis (alternatives analysis)', 'Decision making (multicriteria decision analysis)', 'Interpersonal & team skills (facilitation)', 'Product analysis (product breakdown, requirements analysis, systems analysis, value engineering)'],
    outputs: ['Project scope statement', 'Project document updates (assumption log, requirements documentation, requirements traceability matrix, stakeholder register)'],
    keyPoints: '**Project Scope Statement bao gồm:** Product scope description, Deliverables, Acceptance criteria, Project exclusions (explicitly out of scope), Constraints, Assumptions.\n\n**Phân biệt:** Project Charter = high-level scope; Project Scope Statement = detailed scope.\n\n**Project exclusions** giúp ngăn Scope Creep bằng cách nêu rõ what is NOT included.',
  },
  {
    kaCode: 'scope', pgCode: 'planning', order: 11,
    name: 'Create WBS', nameVi: 'Tạo WBS',
    description: 'Phân chia deliverables dự án và công việc dự án thành các thành phần nhỏ hơn, dễ quản lý hơn.',
    inputs: ['Project management plan (scope management plan)', 'Project documents (project scope statement, requirements documentation)', 'Enterprise environmental factors', 'Organizational process assets'],
    tools: ['Expert judgment', 'Decomposition'],
    outputs: ['Scope baseline (project scope statement + WBS + WBS dictionary)', 'Project document updates (assumption log, requirements documentation)'],
    keyPoints: '**WBS = Work Breakdown Structure** — deliverable-oriented (không phải activity-oriented)\n- Work Package = level thấp nhất trong WBS (có thể ước tính cost/duration)\n- Planning Package = nội dung đã biết nhưng chưa thể phân rã chi tiết\n\n**WBS Dictionary** ghi chi tiết mỗi WBS element: description, code, deliverables, responsible party, schedule milestones, quality requirements, cost estimates.\n\n**Scope Baseline** = Project Scope Statement + WBS + WBS Dictionary.',
  },
  {
    kaCode: 'scope', pgCode: 'monitoring', order: 12,
    name: 'Validate Scope', nameVi: 'Xác nhận Phạm vi',
    description: 'Formalizing acceptance của các completed project deliverables.',
    inputs: ['Project management plan (scope management plan, requirements management plan, requirements traceability matrix)', 'Project documents (lessons learned register, quality reports, requirements documentation, requirements traceability matrix)', 'Verified deliverables (từ Control Quality)', 'Work performance data'],
    tools: ['Inspection', 'Decision making (voting)'],
    outputs: ['Accepted deliverables', 'Work performance information', 'Change requests', 'Project document updates'],
    keyPoints: '**Validate Scope vs Control Quality:**\n- Validate Scope: khách hàng/sponsor chính thức chấp nhận deliverables (external focus)\n- Control Quality: nhóm dự án kiểm tra deliverables có đúng tiêu chuẩn không (internal focus)\n\n**Thứ tự thực hiện:** Control Quality → Validate Scope\n\n**Accepted Deliverables** → đầu vào của Close Project or Phase.',
  },
  {
    kaCode: 'scope', pgCode: 'monitoring', order: 13,
    name: 'Control Scope', nameVi: 'Kiểm soát Phạm vi',
    description: 'Giám sát trạng thái phạm vi dự án và sản phẩm, quản lý thay đổi đối với scope baseline.',
    inputs: ['Project management plan (scope management plan, requirements management plan, change management plan, configuration management plan, scope baseline, performance measurement baseline)', 'Project documents (lessons learned register, requirements documentation, requirements traceability matrix)', 'Work performance data', 'Organizational process assets'],
    tools: ['Data analysis (variance analysis, trend analysis)'],
    outputs: ['Work performance information', 'Change requests', 'Project management plan updates (scope baseline, schedule baseline, cost baseline)', 'Project document updates', 'Organizational process assets updates'],
    keyPoints: '**Scope Creep** = thêm tính năng/yêu cầu mà không qua Change Control → KHÔNG cho phép.\n\n**Gold Plating** = PM/team thêm tính năng ngoài phạm vi mà không được yêu cầu → KHÔNG khuyến nghị.\n\nVariance Analysis so sánh scope baseline vs actual scope.',
  },

  // ══════════════ 3. SCHEDULE (6) ══════════════
  {
    kaCode: 'schedule', pgCode: 'planning', order: 14,
    name: 'Plan Schedule Management', nameVi: 'Lập kế hoạch Quản lý Lịch trình',
    description: 'Thiết lập các chính sách, thủ tục và tài liệu cần thiết để lập kế hoạch, phát triển, quản lý và kiểm soát lịch trình dự án.',
    inputs: ['Project charter', 'Project management plan (scope management plan, development approach)', 'Enterprise environmental factors', 'Organizational process assets'],
    tools: ['Expert judgment', 'Data analysis (alternatives analysis)', 'Meetings'],
    outputs: ['Schedule management plan'],
    keyPoints: '**Schedule Management Plan xác định:** project schedule model development method, release and iteration lengths, level of accuracy, units of measure, organizational procedure links, project schedule model maintenance, control thresholds, rules of performance measurement (EVM), reporting formats.',
  },
  {
    kaCode: 'schedule', pgCode: 'planning', order: 15,
    name: 'Define Activities', nameVi: 'Xác định Hoạt động',
    description: 'Xác định và tài liệu hóa các hành động cụ thể cần thực hiện để tạo ra các deliverables của dự án.',
    inputs: ['Project management plan (scope management plan, schedule management plan, scope baseline)', 'Enterprise environmental factors', 'Organizational process assets'],
    tools: ['Expert judgment', 'Decomposition', 'Rolling wave planning', 'Meetings'],
    outputs: ['Activity list', 'Activity attributes', 'Milestone list', 'Change requests', 'Project management plan updates (schedule baseline, cost baseline)'],
    keyPoints: '**Phân biệt WBS vs Activity List:**\n- WBS = deliverable-oriented (WHAT)\n- Activity List = action-oriented verbs (HOW to achieve WBS components)\n- Work Package → vỡ nhỏ hơn thành Activities\n\n**Rolling Wave Planning:** hoạch định chi tiết cho công việc gần, để ở cấp cao hơn cho công việc xa.\n\n**Milestone:** sự kiện quan trọng trong lịch trình, thời gian = 0.',
  },
  {
    kaCode: 'schedule', pgCode: 'planning', order: 16,
    name: 'Sequence Activities', nameVi: 'Sắp xếp Thứ tự Hoạt động',
    description: 'Xác định và tài liệu hóa quan hệ giữa các hoạt động dự án.',
    inputs: ['Project management plan (schedule management plan, scope baseline)', 'Project documents (activity attributes, activity list, assumption log, milestone list)', 'Enterprise environmental factors', 'Organizational process assets'],
    tools: ['Precedence Diagramming Method (PDM)', 'Dependency determination and integration (mandatory/discretionary, internal/external)', 'Leads and lags', 'Project management information system (PMIS)'],
    outputs: ['Project schedule network diagrams', 'Project document updates (activity attributes, activity list, assumption log, milestone list)'],
    keyPoints: '**PDM — 4 loại dependency:**\n- FS (Finish-to-Start): phổ biến nhất — B bắt đầu sau khi A kết thúc\n- FF (Finish-to-Finish): B kết thúc sau khi A kết thúc\n- SS (Start-to-Start): B bắt đầu sau khi A bắt đầu\n- SF (Start-to-Finish): ít gặp nhất\n\n**Lead:** đẩy sớm hoạt động kế tiếp (negative lag)\n**Lag:** trì hoãn hoạt động kế tiếp\n\n**Mandatory dependency** = hard logic; **Discretionary dependency** = soft logic.',
  },
  {
    kaCode: 'schedule', pgCode: 'planning', order: 17,
    name: 'Estimate Activity Durations', nameVi: 'Ước tính Thời lượng Hoạt động',
    description: 'Ước tính số kỳ làm việc cần thiết để hoàn thành từng activity với các nguồn lực ước tính.',
    inputs: ['Project management plan (schedule management plan, scope baseline)', 'Project documents (activity attributes, activity list, assumption log, lessons learned register, resource calendars, resource requirements, risk register)', 'Enterprise environmental factors', 'Organizational process assets'],
    tools: ['Expert judgment', 'Analogous estimating', 'Parametric estimating', 'Three-point estimating (PERT: tE = (O + 4M + P) / 6)', 'Bottom-up estimating', 'Data analysis (alternatives analysis, reserve analysis)', 'Decision making', 'Meetings'],
    outputs: ['Duration estimates', 'Basis of estimates', 'Project document updates (activity attributes, assumption log, lessons learned register)'],
    keyPoints: '**Three-Point (PERT):**\n- tE = (O + 4M + P) / 6\n- SD = (P - O) / 6\n- O = Optimistic, M = Most likely, P = Pessimistic\n\n**Reserve Analysis:**\n- Contingency Reserve: cho identified risks (known unknowns)\n- Management Reserve: cho unidentified risks (unknown unknowns), không trong cost/schedule baseline\n\n**Effort ≠ Duration:** Effort = tổng giờ làm; Duration = thời gian thực tế trôi qua.',
  },
  {
    kaCode: 'schedule', pgCode: 'planning', order: 18,
    name: 'Develop Schedule', nameVi: 'Phát triển Lịch trình',
    description: 'Phân tích chuỗi hoạt động, thời lượng, yêu cầu nguồn lực và ràng buộc lịch trình để tạo mô hình lịch trình dự án.',
    inputs: ['Project management plan (schedule management plan, scope baseline)', 'Project documents (activity attributes, activity list, assumption log, basis of estimates, duration estimates, lessons learned register, milestone list, project schedule network diagrams, resource calendars, resource requirements, risk register)', 'Agreements', 'Enterprise environmental factors', 'Organizational process assets'],
    tools: ['Schedule network analysis', 'Critical Path Method (CPM)', 'Resource optimization (resource leveling, resource smoothing)', 'Data analysis (what-if scenario, simulation/Monte Carlo)', 'Leads and lags', 'Schedule compression (crashing, fast tracking)', 'Project management information system (PMIS)', 'Agile release planning'],
    outputs: ['Schedule baseline', 'Project schedule (Gantt chart, milestone chart, project schedule network diagram)', 'Schedule data', 'Project calendars', 'Change requests', 'Project management plan updates', 'Project document updates'],
    keyPoints: '**Critical Path Method:**\n- Forward pass: Early Start (ES) & Early Finish (EF)\n- Backward pass: Late Start (LS) & Late Finish (LF)\n- Float = LS - ES = LF - EF; Critical Path: Float = 0\n\n**Schedule Compression:**\n- Crashing: thêm nguồn lực → tăng cost, ít tăng risk\n- Fast Tracking: song song hóa các hoạt động → tăng risk, không tăng cost\n\n**Resource Leveling:** điều chỉnh ngày để giải quyết resource conflicts → có thể kéo dài schedule.',
  },
  {
    kaCode: 'schedule', pgCode: 'monitoring', order: 19,
    name: 'Control Schedule', nameVi: 'Kiểm soát Lịch trình',
    description: 'Giám sát trạng thái dự án để cập nhật schedule và quản lý thay đổi đối với schedule baseline.',
    inputs: ['Project management plan (schedule management plan, schedule baseline, scope baseline, performance measurement baseline)', 'Project documents (lessons learned register, project calendars, project schedule, resource calendars, schedule data)', 'Work performance data', 'Organizational process assets'],
    tools: ['Data analysis (earned value analysis, iteration burndown charts, performance reviews, trend analysis, variance analysis)', 'Critical path method', 'Project management information system (PMIS)', 'Resource optimization', 'Leads and lags', 'Schedule compression'],
    outputs: ['Work performance information', 'Schedule forecasts', 'Change requests', 'Project management plan updates', 'Project document updates', 'Organizational process assets updates'],
    keyPoints: '**EVM Schedule Metrics:**\n- SV (Schedule Variance) = EV - PV\n- SPI (Schedule Performance Index) = EV / PV\n- SPI > 1: ahead of schedule; SPI < 1: behind schedule; SPI = 1: on schedule\n\n**Schedule Forecast:** dự báo Expected Completion Date dựa trên hiệu suất hiện tại.',
  },

  // ══════════════ 4. COST (4) ══════════════
  {
    kaCode: 'cost', pgCode: 'planning', order: 20,
    name: 'Plan Cost Management', nameVi: 'Lập kế hoạch Quản lý Chi phí',
    description: 'Xác định cách chi phí dự án được ước tính, ngân sách hóa, quản lý, giám sát và kiểm soát.',
    inputs: ['Project charter', 'Project management plan (schedule management plan, risk management plan)', 'Enterprise environmental factors', 'Organizational process assets'],
    tools: ['Expert judgment', 'Data analysis (alternatives analysis)', 'Meetings'],
    outputs: ['Cost management plan'],
    keyPoints: '**Cost Management Plan bao gồm:** Units of measure, Level of precision (rounding), Level of accuracy (\u00b110%), Organizational procedure links, Control thresholds, Rules of performance measurement (EVM), Reporting formats.\n\nCost Management Plan là subsidiary plan của PMP.',
  },
  {
    kaCode: 'cost', pgCode: 'planning', order: 21,
    name: 'Estimate Costs', nameVi: 'Ước tính Chi phí',
    description: 'Phát triển ước tính chi phí cho nguồn lực tiền tệ cần thiết để hoàn thành các công việc dự án.',
    inputs: ['Project management plan (cost management plan, quality management plan, scope baseline, resource management plan)', 'Project documents (lessons learned register, project schedule, resource requirements, risk register)', 'Enterprise environmental factors', 'Organizational process assets'],
    tools: ['Expert judgment', 'Analogous estimating', 'Parametric estimating', 'Bottom-up estimating', 'Three-point estimating', 'Data analysis (alternatives analysis, reserve analysis, cost of quality)', 'Project management information system (PMIS)', 'Decision making (voting)'],
    outputs: ['Cost estimates', 'Basis of estimates', 'Project document updates (assumption log, lessons learned register, risk register)'],
    keyPoints: '**Order of Magnitude Estimate (ROM):** -25% đến +75% → giai đoạn sớm\n**Budget Estimate:** -10% đến +25%\n**Definitive Estimate:** -5% đến +10% → giai đoạn cuối planning\n\n**Analogous:** nhanh, ít tốn kém nhưng kém chính xác\n**Parametric:** dùng số liệu thống kê (vd: cost/m²)\n**Bottom-up:** chính xác nhất nhưng tốn thời gian nhất\n\nCost baseline KHÔNG bao gồm Management Reserve.',
  },
  {
    kaCode: 'cost', pgCode: 'planning', order: 22,
    name: 'Determine Budget', nameVi: 'Xác định Ngân sách',
    description: 'Tổng hợp chi phí ước tính của từng activity hoặc work package để xây dựng cost baseline đã được phê duyệt.',
    inputs: ['Project management plan (cost management plan, resource management plan, scope baseline)', 'Project documents (basis of estimates, cost estimates, project schedule, risk register)', 'Business documents (business case, benefits management plan)', 'Agreements', 'Enterprise environmental factors', 'Organizational process assets'],
    tools: ['Expert judgment', 'Cost aggregation', 'Data analysis (reserve analysis)', 'Historical information review', 'Funding limit reconciliation', 'Financing'],
    outputs: ['Cost baseline', 'Project funding requirements', 'Project document updates (cost estimates, project schedule, risk register)'],
    keyPoints: '**Cost Baseline** = tổng chi phí ước tính + contingency reserves\n**BAC (Budget at Completion)** = tổng cost baseline\n**Project Budget** = Cost Baseline + Management Reserve\n\n**Cost Baseline ≠ Project Budget:**\n- Cost Baseline: có contingency; dùng để đo EVM\n- Project Budget: thêm management reserve; total authorized budget.',
  },
  {
    kaCode: 'cost', pgCode: 'monitoring', order: 23,
    name: 'Control Costs', nameVi: 'Kiểm soát Chi phí',
    description: 'Giám sát trạng thái dự án để cập nhật chi phí và quản lý thay đổi đối với cost baseline.',
    inputs: ['Project management plan (cost management plan, cost baseline, performance measurement baseline)', 'Project documents (lessons learned register)', 'Project funding requirements', 'Work performance data', 'Organizational process assets'],
    tools: ['Expert judgment', 'Data analysis (EVM, variance analysis, trend analysis, reserve analysis)', 'To-complete performance index (TCPI)', 'Project management information system (PMIS)'],
    outputs: ['Work performance information', 'Cost forecasts (EAC)', 'Change requests', 'Project management plan updates (cost baseline, cost management plan)', 'Project document updates', 'Organizational process assets updates'],
    keyPoints: '**EVM Formulas (PHẢI THUỘC):**\n- PV = Planned Value; EV = Earned Value; AC = Actual Cost\n- CV = EV - AC (+ = under budget); SV = EV - PV (+ = ahead)\n- CPI = EV/AC (> 1 = under budget); SPI = EV/PV (> 1 = ahead)\n\n**Forecasts:**\n- EAC (typical) = BAC/CPI\n- EAC (atypical) = AC + (BAC - EV)\n- ETC = EAC - AC; VAC = BAC - EAC\n\n**TCPI** = (BAC-EV)/(BAC-AC) → > 1 = khó đạt được.',
  },

  // ══════════════ 5. QUALITY (3) ══════════════
  {
    kaCode: 'quality', pgCode: 'planning', order: 24,
    name: 'Plan Quality Management', nameVi: 'Lập kế hoạch Quản lý Chất lượng',
    description: 'Xác định yêu cầu và/hoặc tiêu chuẩn chất lượng cho dự án và sản phẩm; tài liệu hóa cách dự án sẽ đạt được sự tuân thủ.',
    inputs: ['Project charter', 'Project management plan (requirements management plan, risk management plan, stakeholder engagement plan, scope baseline)', 'Project documents (assumption log, requirements documentation, requirements traceability matrix, risk register, stakeholder register)', 'Enterprise environmental factors', 'Organizational process assets'],
    tools: ['Expert judgment', 'Data gathering (benchmarking, brainstorming, interviews)', 'Data analysis (cost-benefit analysis, cost of quality)', 'Decision making (multicriteria decision analysis)', 'Data representation (flowcharts, logical data model, matrix diagrams, mind mapping)', 'Test and inspection planning', 'Meetings'],
    outputs: ['Quality management plan', 'Quality metrics', 'Project management plan updates', 'Project document updates (lessons learned register, requirements traceability matrix, risk register, stakeholder register)'],
    keyPoints: '**Cost of Quality (COQ):**\n- Cost of Conformance: Prevention (training, process documentation) + Appraisal (testing, inspections)\n- Cost of Nonconformance: Internal failure (rework, scrap) + External failure (liabilities, warranty, lost business)\n\n**Chất lượng vs Cấp độ (Grade):**\n- Quality: đáp ứng requirements; Low quality = luôn có vấn đề\n- Grade: category based on technical characteristics; Low grade = có thể chấp nhận được.',
  },
  {
    kaCode: 'quality', pgCode: 'executing', order: 25,
    name: 'Manage Quality', nameVi: 'Quản lý Chất lượng',
    description: 'Chuyển đổi Quality Management Plan thành các hoạt động chất lượng có thể thực hiện được để đưa vào kế hoạch chất lượng của dự án.',
    inputs: ['Project management plan (quality management plan)', 'Project documents (lessons learned register, quality control measurements, quality metrics, risk report)', 'Organizational process assets'],
    tools: ['Data gathering (checklists)', 'Data analysis (alternatives analysis, document analysis, process analysis, root cause analysis)', 'Decision making (multicriteria decision analysis)', 'Data representation (affinity diagrams, cause-and-effect diagrams, flowcharts, histograms, matrix diagrams, scatter diagrams)', 'Audits', 'Design for X', 'Problem solving', 'Quality improvement methods (PDCA, Six Sigma)'],
    outputs: ['Quality reports', 'Test and evaluation documents', 'Change requests', 'Project management plan updates', 'Project document updates', 'Organizational process assets updates'],
    keyPoints: '**Manage Quality (trước là "Perform Quality Assurance"):**\n- Focus: PREVENTION — làm đúng quy trình để tránh lỗi\n- Là audit-based process\n\n**Vs Control Quality:**\n- Control Quality: INSPECTION — kiểm tra output có đạt standards không\n\n**Process Improvement Tools:** PDCA (Plan-Do-Check-Act) = Deming Cycle; Six Sigma: DMAIC; Lean: loại bỏ lãng phí; Kaizen: cải tiến liên tục.',
  },
  {
    kaCode: 'quality', pgCode: 'monitoring', order: 26,
    name: 'Control Quality', nameVi: 'Kiểm soát Chất lượng',
    description: 'Giám sát và ghi lại kết quả thực thi các hoạt động chất lượng để đánh giá hiệu suất và đảm bảo output dự án hoàn chỉnh, đúng, đáp ứng kỳ vọng.',
    inputs: ['Project management plan (quality management plan)', 'Project documents (lessons learned register, quality metrics, test and evaluation documents)', 'Approved change requests', 'Deliverables', 'Work performance data', 'Enterprise environmental factors', 'Organizational process assets'],
    tools: ['Data gathering (checklists, check sheets, statistical sampling, questionnaires and surveys)', 'Data analysis (performance reviews, root cause analysis)', 'Inspection', 'Testing/product evaluations', 'Data representation (cause-and-effect diagrams, control charts, histogram, scatter diagrams)', 'Meetings'],
    outputs: ['Quality control measurements', 'Verified deliverables', 'Work performance information', 'Change requests', 'Project management plan updates', 'Project document updates', 'Organizational process assets updates'],
    keyPoints: '**Control Charts (Statistical Process Control):**\n- Upper Control Limit (UCL) = Mean + 3σ\n- Lower Control Limit (LCL) = Mean - 3σ\n- Rule of Seven: 7 điểm liên tiếp cùng một phía → out of control\n\n**Verified Deliverables** → đầu vào của Validate Scope.\n\n**Sampling:** Attribute sampling (đạt/không đạt) vs Variable sampling (thang liên tục).',
  },

  // ══════════════ 6. RESOURCE (6) ══════════════
  {
    kaCode: 'resource', pgCode: 'planning', order: 27,
    name: 'Plan Resource Management', nameVi: 'Lập kế hoạch Quản lý Nguồn lực',
    description: 'Xác định cách ước tính, thu thập, quản lý và sử dụng nguồn lực dự án (nhân lực + vật chất).',
    inputs: ['Project charter', 'Project management plan (quality management plan, scope baseline)', 'Project documents (project schedule, requirements documentation, risk register, stakeholder register)', 'Enterprise environmental factors', 'Organizational process assets'],
    tools: ['Expert judgment', 'Data representation (hierarchical charts — OBS, RBS; responsibility assignment matrix — RAM/RACI; text-oriented formats)', 'Organizational theory', 'Meetings'],
    outputs: ['Resource management plan', 'Team charter', 'Project document updates (assumption log, risk register)'],
    keyPoints: '**RACI Matrix:** R = Responsible (thực hiện), A = Accountable (chịu trách nhiệm — chỉ một người), C = Consulted (tham vấn), I = Informed (thông báo).\n\n**Team Charter** thiết lập: team values, communication guidelines, decision-making criteria, conflict resolution process, meeting guidelines.\n\n**OBS (Organizational Breakdown Structure):** phân cấp tổ chức.\n**RBS (Resource Breakdown Structure):** phân cấp theo loại nguồn lực.',
  },
  {
    kaCode: 'resource', pgCode: 'planning', order: 28,
    name: 'Estimate Activity Resources', nameVi: 'Ước tính Nguồn lực Hoạt động',
    description: 'Ước tính nguồn lực nhóm và loại, số lượng vật liệu, thiết bị và nguồn cung cấp cần thiết để thực hiện công việc dự án.',
    inputs: ['Project management plan (resource management plan, scope baseline)', 'Project documents (activity attributes, activity list, assumption log, cost estimates, resource calendars, risk register)', 'Enterprise environmental factors', 'Organizational process assets'],
    tools: ['Expert judgment', 'Bottom-up estimating', 'Analogous estimating', 'Parametric estimating', 'Data analysis (alternatives analysis)', 'Project management information system (PMIS)', 'Meetings'],
    outputs: ['Resource requirements', 'Basis of estimates', 'Resource breakdown structure (RBS)', 'Project document updates (activity attributes, assumption log, lessons learned register)'],
    keyPoints: '**Resource types:** Human resources, Equipment, Materials, Supplies, Facilities.\n\n**Resource Breakdown Structure (RBS)** phân cấp nguồn lực theo loại và category.\n\n**Resource Requirements** sẽ là đầu vào của Develop Schedule, Estimate Costs, Determine Budget, Acquire Resources.',
  },
  {
    kaCode: 'resource', pgCode: 'executing', order: 29,
    name: 'Acquire Resources', nameVi: 'Thu thập Nguồn lực',
    description: 'Xác nhận nguồn lực, có được nhóm và tài sản vật chất cần thiết để hoàn thành công việc dự án.',
    inputs: ['Project management plan (resource management plan, procurement management plan, cost baseline)', 'Project documents (project schedule, resource calendars, resource requirements, stakeholder register)', 'Enterprise environmental factors', 'Organizational process assets'],
    tools: ['Decision making (multicriteria decision analysis)', 'Interpersonal & team skills (negotiation)', 'Pre-assignment', 'Virtual teams'],
    outputs: ['Physical resource assignments', 'Project team assignments', 'Resource calendars', 'Change requests', 'Project management plan updates', 'Project document updates', 'Enterprise environmental factors updates', 'Organizational process assets updates'],
    keyPoints: '**PM thường KHÔNG có quyền force-assign resources** trong functional/matrix org → phải negotiate với Functional Managers.\n\n**Pre-assignment:** resources đã được identify trước trong Project Charter → PM phải honor cam kết này.\n\n**Virtual Teams:** Pro: global talent, cost savings; Con: communication challenges, time zones, isolation.\n\nMulticriteria Decision Analysis để chọn team member: availability, cost, experience, skills.',
  },
  {
    kaCode: 'resource', pgCode: 'executing', order: 30,
    name: 'Develop Team', nameVi: 'Phát triển Nhóm',
    description: 'Cải thiện năng lực, tương tác giữa các thành viên và môi trường làm việc nhóm để nâng cao hiệu suất dự án.',
    inputs: ['Project management plan (resource management plan)', 'Project documents (lessons learned register, project schedule, project team assignments, resource calendars, team charter)', 'Enterprise environmental factors', 'Organizational process assets'],
    tools: ['Colocation (war room)', 'Virtual teams', 'Communication technology', 'Interpersonal & team skills (conflict management, influencing, motivation, negotiation, team building)', 'Recognition and rewards', 'Training', 'Individual and team assessments', 'Meetings'],
    outputs: ['Team performance assessments', 'Change requests', 'Project management plan updates', 'Project document updates', 'Enterprise environmental factors updates', 'Organizational process assets updates'],
    keyPoints: '**Tuckman Ladder (5 stages):**\n1. Forming — nhóm hình thành, lịch sự\n2. Storming — xung đột khi giao việc\n3. Norming — quy tắc được thiết lập, tin tưởng nhau\n4. Performing — hiệu suất cao, tự quản\n5. Adjourning — kết thúc dự án\n\n**Motivation Theories:**\n- Maslow: Hierarchy of needs\n- Herzberg: Hygiene factors vs Motivators\n- McGregor: Theory X (người lười) vs Theory Y (người ham làm)\n- Theory Z (Ouchi): trung thành và cam kết lâu dài.',
  },
  {
    kaCode: 'resource', pgCode: 'executing', order: 31,
    name: 'Manage Team', nameVi: 'Quản lý Nhóm',
    description: 'Theo dõi hiệu suất thành viên, đưa phản hồi, giải quyết vấn đề và quản lý thay đổi để tối ưu hiệu suất dự án.',
    inputs: ['Project management plan (resource management plan)', 'Project documents (issue log, lessons learned register, project team assignments, team charter)', 'Work performance reports', 'Team performance assessments', 'Enterprise environmental factors', 'Organizational process assets'],
    tools: ['Interpersonal & team skills (conflict management, decision making, emotional intelligence, influencing, leadership)', 'Project management information system (PMIS)'],
    outputs: ['Change requests', 'Project management plan updates (resource management plan, schedule baseline, cost baseline)', 'Project document updates (issue log, lessons learned register, project team assignments)', 'Enterprise environmental factors updates'],
    keyPoints: '**Conflict Resolution Methods (từ best đến worst):**\n1. Collaborating/Problem Solving — tìm giải pháp win-win (BEST)\n2. Compromising/Reconciling — nhân nhượng đôi bên\n3. Smoothing/Accommodating — nhấn mạnh điểm chung\n4. Forcing/Directing — áp đặt quan điểm (win/lose)\n5. Withdrawing/Avoiding — rút lui, không giải quyết (WORST)\n\n**Powers of PM:** Legitimate, Reward, Penalty (Coercive), Expert (best long-term), Referent, Informational.',
  },
  {
    kaCode: 'resource', pgCode: 'monitoring', order: 32,
    name: 'Control Resources', nameVi: 'Kiểm soát Nguồn lực',
    description: 'Đảm bảo rằng các nguồn lực vật chất được giao cho dự án được sử dụng như kế hoạch, và giám sát việc sử dụng nguồn lực thực tế so với kế hoạch.',
    inputs: ['Project management plan (resource management plan)', 'Project documents (issue log, lessons learned register, physical resource assignments, project schedule, resource breakdown structure, resource requirements, risk register)', 'Work performance data', 'Agreements', 'Organizational process assets'],
    tools: ['Data analysis (alternatives analysis, cost-benefit analysis, performance reviews, trend analysis)', 'Problem solving', 'Interpersonal & team skills (negotiation, influencing)', 'Project management information system (PMIS)'],
    outputs: ['Work performance information', 'Change requests', 'Project management plan updates', 'Project document updates', 'Organizational process assets updates'],
    keyPoints: '**Control Resources tập trung vào nguồn lực vật chất** (physical resources: vật liệu, thiết bị, cơ sở hạ tầng), KHÔNG phải nhân sự.\nNhân sự được quản lý bởi Manage Team.\n\n**Các vấn đề thường gặp:** Resource shortages, resource conflicts, over-allocation, under-utilization.\n\nGiải pháp: Resource leveling, crashing, fast tracking, outsourcing.',
  },

  // ══════════════ 7. COMMUNICATIONS (3) ══════════════
  {
    kaCode: 'communications', pgCode: 'planning', order: 33,
    name: 'Plan Communications Management', nameVi: 'Lập kế hoạch Quản lý Truyền thông',
    description: 'Phát triển cách tiếp cận truyền thông phù hợp và kế hoạch dựa trên nhu cầu thông tin của stakeholders và tài sản tổ chức.',
    inputs: ['Project charter', 'Project management plan (resource management plan, stakeholder engagement plan)', 'Project documents (requirements documentation, stakeholder register)', 'Enterprise environmental factors', 'Organizational process assets'],
    tools: ['Expert judgment', 'Communication requirements analysis', 'Communication technology', 'Communication models (noise, feedback, barriers)', 'Communication methods (interactive, push, pull)', 'Interpersonal & team skills (communication styles assessment, political awareness, cultural awareness)', 'Data representation (stakeholder engagement assessment matrix)', 'Meetings'],
    outputs: ['Communications management plan', 'Project management plan updates (stakeholder engagement plan)', 'Project document updates (project schedule, stakeholder register)'],
    keyPoints: '**Công thức số kênh giao tiếp:** n(n-1)/2\n- 10 người = 45 kênh; 15 người = 105 kênh\n\n**Communication Methods:**\n- Interactive: two-way, real-time (meetings, calls, video)\n- Push: sent but may not be read (emails, memos, reports)\n- Pull: receiver retrieves when needed (intranet, e-learning)\n\n**PM dành ~90% thời gian cho communication.**',
  },
  {
    kaCode: 'communications', pgCode: 'executing', order: 34,
    name: 'Manage Communications', nameVi: 'Quản lý Truyền thông',
    description: 'Đảm bảo thu thập, tạo, phân phối, lưu trữ, truy xuất, quản lý, giám sát và phân phối thông tin dự án kịp thời và phù hợp.',
    inputs: ['Project management plan (communications management plan, resource management plan, stakeholder engagement plan)', 'Project documents (change log, issue log, lessons learned register, quality report, risk report, stakeholder register)', 'Work performance reports', 'Enterprise environmental factors', 'Organizational process assets'],
    tools: ['Communication technology', 'Communication methods', 'Communication skills (communication competence, feedback, nonverbal, presentations)', 'Project management information system (PMIS)', 'Project reporting', 'Interpersonal & team skills (active listening, conflict management, cultural awareness, meeting management, networking, political awareness)', 'Meetings'],
    outputs: ['Project communications', 'Project management plan updates', 'Project document updates', 'Organizational process assets updates'],
    keyPoints: '**Communication Barriers:** Language/terminology, physical distance, cultural differences, information overload, noise.\n\n**Active Listening** bao gồm: paraphrasing, questioning, summarizing, không gián đoạn.\n\n**Formal vs Informal:** Formal Written (contracts), Formal Verbal (presentations), Informal Written (emails), Informal Verbal (conversations).',
  },
  {
    kaCode: 'communications', pgCode: 'monitoring', order: 35,
    name: 'Monitor Communications', nameVi: 'Giám sát Truyền thông',
    description: 'Đảm bảo nhu cầu thông tin của dự án và các stakeholders được đáp ứng.',
    inputs: ['Project management plan (communications management plan, stakeholder engagement plan)', 'Project documents (issue log, lessons learned register, project communications)', 'Work performance data', 'Enterprise environmental factors', 'Organizational process assets'],
    tools: ['Expert judgment', 'Project management information system (PMIS)', 'Data representation (stakeholder engagement assessment matrix)', 'Interpersonal & team skills (observation/conversation)', 'Meetings'],
    outputs: ['Work performance information', 'Change requests', 'Project management plan updates (communications management plan, stakeholder engagement plan)', 'Project document updates (issue log, lessons learned register, stakeholder register)'],
    keyPoints: '**Giám sát truyền thông đảm bảo:** thông tin đang được gửi/nhận đúng người, kênh truyền thông hoạt động hiệu quả, stakeholder engagement levels được duy trì, phát hiện communication breakdowns sớm.\n\nCommunication Plan phải được cập nhật khi có thay đổi về stakeholders hoặc project environment.',
  },

  // ══════════════ 8. RISK (7) ══════════════
  {
    kaCode: 'risk', pgCode: 'planning', order: 36,
    name: 'Plan Risk Management', nameVi: 'Lập kế hoạch Quản lý Rủi ro',
    description: 'Xác định cách thực hiện các hoạt động quản lý rủi ro cho một dự án.',
    inputs: ['Project charter', 'Project management plan (all subsidiary plans)', 'Project documents (stakeholder register)', 'Enterprise environmental factors', 'Organizational process assets'],
    tools: ['Expert judgment', 'Data analysis (stakeholder analysis)', 'Meetings'],
    outputs: ['Risk management plan'],
    keyPoints: '**Risk Management Plan bao gồm:** Risk strategy, Methodology, Roles and responsibilities, Funding (risk budget), Timing, Risk categories (RBS), Stakeholder risk appetite, Definitions of risk probability and impact, Probability and impact matrix, Reporting formats, Tracking.\n\n**Risk Appetite vs Risk Tolerance vs Risk Threshold:** Appetite = mức độ sẵn sàng chấp nhận rủi ro (chung); Tolerance = biên độ chấp nhận được; Threshold = điểm cụ thể kích hoạt hành động.',
  },
  {
    kaCode: 'risk', pgCode: 'planning', order: 37,
    name: 'Identify Risks', nameVi: 'Xác định Rủi ro',
    description: 'Xác định các rủi ro cá nhân cũng như nguồn rủi ro tổng thể của dự án, và tài liệu hóa đặc điểm của chúng.',
    inputs: ['Project management plan (requirements management plan, schedule management plan, cost management plan, quality management plan, resource management plan, risk management plan, scope baseline, schedule baseline, cost baseline)', 'Project documents (assumption log, cost estimates, duration estimates, issue log, lessons learned register, requirements documentation, resource requirements, stakeholder register)', 'Agreements', 'Procurement documentation', 'Enterprise environmental factors', 'Organizational process assets'],
    tools: ['Expert judgment', 'Data gathering (brainstorming, checklists, interviews)', 'Data analysis (root cause analysis, assumption and constraint analysis, SWOT analysis, document analysis)', 'Interpersonal & team skills (facilitation)', 'Prompt lists', 'Meetings'],
    outputs: ['Risk register', 'Risk report', 'Project document updates (assumption log, issue log, lessons learned register)'],
    keyPoints: '**Risk Register ban đầu bao gồm:** List of identified risks, Potential risk owners, Potential risk responses.\n\n**Risk Report (mới trong PMBOK 6):** Sources of overall project risk, Summary information on identified individual project risks.\n\n**SWOT Analysis:** Strengths, Weaknesses (internal); Opportunities, Threats (external).',
  },
  {
    kaCode: 'risk', pgCode: 'planning', order: 38,
    name: 'Perform Qualitative Risk Analysis', nameVi: 'Phân tích Rủi ro Định tính',
    description: 'Ưu tiên hóa rủi ro cá nhân để phân tích hoặc hành động tiếp theo bằng cách đánh giá xác suất xảy ra và tác động của chúng.',
    inputs: ['Project management plan (risk management plan)', 'Project documents (assumption log, risk register, stakeholder register)', 'Enterprise environmental factors', 'Organizational process assets'],
    tools: ['Expert judgment', 'Data gathering (interviews)', 'Data analysis (risk data quality assessment, risk probability and impact assessment, assessment of other risk parameters)', 'Interpersonal & team skills (facilitation)', 'Risk categorization', 'Data representation (probability and impact matrix, hierarchical charts)', 'Meetings'],
    outputs: ['Project document updates (assumption log, issue log, risk register, risk report)'],
    keyPoints: '**Probability-Impact Matrix (P-I Matrix):** Xếp hạng rủi ro từ Very High đến Very Low.\n**Risk Score** = Probability × Impact\n\n**Rất nhanh và tương đối rẻ** — không yêu cầu dữ liệu số liệu chính xác.\n\nRisk Owner được chỉ định ở quy trình này hoặc Plan Risk Responses.\n\nQualitative → tiếp theo là Quantitative (đối với high-priority risks) → Plan Risk Responses.',
  },
  {
    kaCode: 'risk', pgCode: 'planning', order: 39,
    name: 'Perform Quantitative Risk Analysis', nameVi: 'Phân tích Rủi ro Định lượng',
    description: 'Phân tích số học tác động kết hợp của các rủi ro cá nhân đã xác định lên mục tiêu dự án tổng thể.',
    inputs: ['Project management plan (risk management plan, scope baseline, schedule baseline, cost baseline)', 'Project documents (assumption log, basis of estimates, cost estimates, cost forecasts, duration estimates, milestone list, resource requirements, risk register, risk report, schedule forecasts)', 'Enterprise environmental factors', 'Organizational process assets'],
    tools: ['Expert judgment', 'Data gathering (interviews)', 'Interpersonal & team skills (facilitation)', 'Representations of uncertainty (probability distributions)', 'Data analysis (simulations/Monte Carlo, sensitivity analysis/tornado diagram, decision tree analysis, influence diagrams)'],
    outputs: ['Project document updates (risk report)'],
    keyPoints: '**Monte Carlo Simulation:** Chạy hàng nghìn lần với random inputs, tạo probability distribution cho outcomes, xác định P-80 cost/schedule.\n\n**Decision Tree Analysis:** EMV = Probability × Impact; Threat EMV: âm; Opportunity EMV: dương.\n\n**Sensitivity Analysis (Tornado Diagram):** Xác định risk nào ảnh hưởng nhất đến dự án.\n\nKHÔNG phải tất cả dự án đều cần Quantitative Analysis.',
  },
  {
    kaCode: 'risk', pgCode: 'planning', order: 40,
    name: 'Plan Risk Responses', nameVi: 'Lập kế hoạch Ứng phó Rủi ro',
    description: 'Phát triển các lựa chọn, lựa chọn chiến lược và thỏa thuận các hành động để giải quyết rủi ro tổng thể dự án và để xử lý rủi ro cá nhân.',
    inputs: ['Project management plan (resource management plan, risk management plan, cost baseline)', 'Project documents (lessons learned register, project schedule, project team assignments, resource calendars, risk register, risk report, stakeholder register)', 'Enterprise environmental factors', 'Organizational process assets'],
    tools: ['Expert judgment', 'Data gathering (interviews)', 'Interpersonal & team skills (facilitation)', 'Strategies for threats (Escalate/Avoid/Transfer/Mitigate/Accept)', 'Strategies for opportunities (Escalate/Exploit/Share/Enhance/Accept)', 'Contingent response strategies', 'Strategies for overall project risk', 'Data analysis (alternatives analysis, cost-benefit analysis)', 'Decision making (multicriteria decision analysis)'],
    outputs: ['Change requests', 'Project management plan updates (schedule management plan, cost management plan, quality management plan, resource management plan, procurement management plan, scope baseline, schedule baseline, cost baseline)', 'Project document updates (assumption log, cost forecasts, lessons learned register, project schedule, risk register, risk report)'],
    keyPoints: '**Strategies for THREATS (E-A-T-M-A):**\n- Escalate: vượt phạm vi PM, chuyển lên sponsor\n- Avoid: loại bỏ mối đe dọa hoàn toàn (thay đổi PMP)\n- Transfer: chuyển sang bên thứ ba (insurance, fixed-price contract)\n- Mitigate: giảm probability hoặc impact\n- Accept: active (contingency reserve, plan) hoặc passive (không làm gì)\n\n**Strategies for OPPORTUNITIES (E-E-S-E-A):**\n- Escalate, Exploit (đảm bảo cơ hội xảy ra), Share, Enhance (tăng probability/impact), Accept\n\n**Residual Risk:** sau khi áp dụng responses, vẫn còn lại.\n**Secondary Risk:** rủi ro mới phát sinh từ việc thực hiện risk response.',
  },
  {
    kaCode: 'risk', pgCode: 'executing', order: 41,
    name: 'Implement Risk Responses', nameVi: 'Thực hiện Ứng phó Rủi ro',
    description: 'Thực thi các kế hoạch ứng phó rủi ro đã thỏa thuận.',
    inputs: ['Project management plan (risk management plan)', 'Project documents (lessons learned register, risk register, risk report)', 'Organizational process assets'],
    tools: ['Expert judgment', 'Interpersonal & team skills (influencing)', 'Project management information system (PMIS)'],
    outputs: ['Change requests', 'Project document updates (issue log, lessons learned register, project team assignments, risk register, risk report)'],
    keyPoints: '**Quy trình mới trong PMBOK 6** (không có trong PMBOK 5).\n\nTrước đây, thực thi risk responses được coi là một phần của Direct and Manage Project Work.\n\n**Mục đích:** đảm bảo risk owners thực sự tiến hành các planned responses — không chỉ là lập kế hoạch.\n\nRisk owners chịu trách nhiệm thực thi responses đã được lên kế hoạch, và báo cáo lại cho PM.',
  },
  {
    kaCode: 'risk', pgCode: 'monitoring', order: 42,
    name: 'Monitor Risks', nameVi: 'Giám sát Rủi ro',
    description: 'Theo dõi việc thực hiện các kế hoạch ứng phó rủi ro đã thỏa thuận, theo dõi các rủi ro đã xác định, xác định và phân tích rủi ro mới.',
    inputs: ['Project management plan (risk management plan)', 'Project documents (issue log, lessons learned register, risk register, risk report)', 'Work performance data', 'Work performance reports'],
    tools: ['Data analysis (technical performance analysis, reserve analysis)', 'Audits', 'Meetings'],
    outputs: ['Work performance information', 'Change requests', 'Project management plan updates', 'Project document updates (assumption log, issue log, lessons learned register, risk register, risk report)', 'Organizational process assets updates'],
    keyPoints: '**Monitor Risks activities:** Check if risk responses are being executed, Evaluate effectiveness of risk responses, Track identified risks, Identify and analyze new risks, Evaluate reserve adequacy, Ensure risk management policies are followed.\n\n**Reserve Analysis:** So sánh contingency reserve còn lại với risks còn lại.\n\nRisk Audits: đánh giá hiệu quả của risk management processes.',
  },

  // ══════════════ 9. PROCUREMENT (3) ══════════════
  {
    kaCode: 'procurement', pgCode: 'planning', order: 43,
    name: 'Plan Procurement Management', nameVi: 'Lập kế hoạch Quản lý Mua sắm',
    description: 'Tài liệu hóa các quyết định mua sắm, xác định phương pháp mua sắm và xác định các nhà cung cấp tiềm năng.',
    inputs: ['Project charter', 'Business documents (business case, benefits management plan)', 'Project management plan (scope management plan, quality management plan, resource management plan, risk management plan, scope baseline)', 'Project documents (milestone list, project team assignments, requirements documentation, requirements traceability matrix, resource requirements, risk register, stakeholder register)', 'Enterprise environmental factors', 'Organizational process assets'],
    tools: ['Expert judgment', 'Data gathering (market research)', 'Data analysis (make-or-buy analysis)', 'Source selection analysis', 'Meetings'],
    outputs: ['Procurement management plan', 'Procurement strategy', 'Bid documents (RFP, IFB, RFQ)', 'Procurement statement of work (SOW)', 'Source selection criteria', 'Make-or-buy decisions', 'Independent cost estimates', 'Change requests', 'Project document updates', 'Organizational process assets updates'],
    keyPoints: '**Contract Types — Risk to Buyer/Seller:**\n\nFixed Price (FP) — Low risk Buyer, High risk Seller:\n- FFP (Firm Fixed Price): giá cố định hoàn toàn\n- FP-EPA (FP with Economic Price Adjustment): điều chỉnh theo inflation\n- FPIF (FP Incentive Fee): thưởng nếu tiết kiệm\n\nCost Reimbursable (CR) — High risk Buyer, Low risk Seller:\n- CPFF (Cost Plus Fixed Fee), CPAF (Cost Plus Award Fee), CPIF (Cost Plus Incentive Fee)\n\nT&M (Time and Material): middle risk, linh hoạt.\n\n**Make-or-buy analysis:** make (giữ bí mật, kiểm soát) vs buy (chuyên môn, cost).',
  },
  {
    kaCode: 'procurement', pgCode: 'executing', order: 44,
    name: 'Conduct Procurements', nameVi: 'Tiến hành Mua sắm',
    description: 'Nhận phản hồi từ nhà cung cấp, lựa chọn nhà cung cấp và trao hợp đồng.',
    inputs: ['Project management plan (scope management plan, requirements management plan, communications management plan, risk management plan, procurement management plan, configuration management plan, cost baseline)', 'Project documents (lessons learned register, project schedule, requirements documentation, risk register, stakeholder register)', 'Procurement documentation', 'Seller proposals', 'Enterprise environmental factors', 'Organizational process assets'],
    tools: ['Expert judgment', 'Advertising', 'Bidder conferences', 'Data analysis (proposal evaluation techniques)', 'Interpersonal & team skills (negotiation)'],
    outputs: ['Selected sellers', 'Agreements', 'Change requests', 'Project management plan updates', 'Project document updates', 'Organizational process assets updates'],
    keyPoints: '**Bidder Conference (Contractor Conference / Pre-bid Conference):** Đảm bảo tất cả nhà thầu tiềm năng hiểu requirements như nhau. Tránh lợi thế không công bằng.\n\n**Agreements (Contracts):** Legal, binding documents. Bảo vệ cả hai bên. Phải có consideration.\n\n**Privity of contract:** quan hệ hợp đồng trực tiếp (buyer-seller).',
  },
  {
    kaCode: 'procurement', pgCode: 'monitoring', order: 45,
    name: 'Control Procurements', nameVi: 'Kiểm soát Mua sắm',
    description: 'Quản lý quan hệ mua sắm, giám sát hiệu suất hợp đồng và thực hiện thay đổi/corrections theo yêu cầu; đóng hợp đồng.',
    inputs: ['Project management plan (requirements management plan, risk management plan, procurement management plan, change management plan, schedule baseline)', 'Project documents (assumption log, lessons learned register, milestone list, quality reports, requirements documentation, requirements traceability matrix, risk register, stakeholder register)', 'Agreements', 'Procurement documentation', 'Approved change requests', 'Work performance data', 'Enterprise environmental factors', 'Organizational process assets'],
    tools: ['Expert judgment', 'Claims administration', 'Data analysis (performance reviews, earned value analysis, trend analysis)', 'Inspection', 'Audits'],
    outputs: ['Closed procurements', 'Work performance information', 'Procurement documentation updates', 'Change requests', 'Project management plan updates', 'Project document updates', 'Organizational process assets updates'],
    keyPoints: '**Claims Administration (Disputes):** Claims = tranh chấp về hợp đồng. Best resolved through negotiation. Nếu không giải quyết được: Alternative Dispute Resolution (ADR), sau đó mới ra tòa.\n\n**Contract Closeout:** Xác nhận tất cả deliverables đã được accepted, giải quyết open claims, cập nhật records, formal written notice of completion.\n\n**Early Termination:** Termination for convenience (buyer có thể kết thúc); Termination for default (seller vi phạm).',
  },

  // ══════════════ 10. STAKEHOLDER (4) ══════════════
  {
    kaCode: 'stakeholder', pgCode: 'initiating', order: 46,
    name: 'Identify Stakeholders', nameVi: 'Xác định Các bên liên quan',
    description: 'Xác định các cá nhân, nhóm hoặc tổ chức có thể ảnh hưởng hoặc bị ảnh hưởng bởi quyết định, hoạt động hoặc kết quả của dự án.',
    inputs: ['Project charter', 'Business documents (business case, benefits management plan)', 'Project management plan (communications management plan, stakeholder engagement plan)', 'Project documents (change log, issue log, requirements documentation)', 'Agreements', 'Enterprise environmental factors', 'Organizational process assets'],
    tools: ['Expert judgment', 'Data gathering (questionnaires and surveys, brainstorming)', 'Data analysis (stakeholder analysis, document analysis)', 'Data representation (stakeholder mapping — Power/Interest Grid, Power/Influence Grid, Influence/Impact Grid, Salience Model)', 'Meetings'],
    outputs: ['Stakeholder register', 'Change requests', 'Project management plan updates', 'Project document updates (assumption log, issue log, risk register)'],
    keyPoints: '**Thực hiện sớm nhất có thể** — ngay từ khi nhận Project Charter.\n\n**Stakeholder Register bao gồm:** Identification information (name, role, department), Assessment information (major requirements, expectations, potential for influence), Stakeholder classification.\n\n**Stakeholder Mapping:** Power/Interest Grid, Power/Influence Grid, Salience Model (Power + Urgency + Legitimacy).\n\nIdentify Stakeholders lặp lại trong suốt dự án khi có stakeholders mới.',
  },
  {
    kaCode: 'stakeholder', pgCode: 'planning', order: 47,
    name: 'Plan Stakeholder Engagement', nameVi: 'Lập kế hoạch Tham gia của Stakeholders',
    description: 'Phát triển cách tiếp cận để tương tác hiệu quả với stakeholders dựa trên nhu cầu, kỳ vọng, lợi ích và tác động tiềm tàng của họ.',
    inputs: ['Project charter', 'Project management plan (communications management plan, resource management plan, risk management plan)', 'Project documents (assumption log, change log, issue log, project schedule, risk register, stakeholder register)', 'Agreements', 'Enterprise environmental factors', 'Organizational process assets'],
    tools: ['Expert judgment', 'Data gathering (benchmarking)', 'Data analysis (assumption and constraint analysis, root cause analysis)', 'Decision making (prioritization/ranking)', 'Data representation (mind mapping, stakeholder engagement assessment matrix)', 'Meetings'],
    outputs: ['Stakeholder engagement plan'],
    keyPoints: '**Stakeholder Engagement Assessment Matrix — Mức độ tham gia:**\n- Unaware: không biết về dự án và tác động\n- Resistant: biết nhưng chống lại\n- Neutral: biết nhưng không hỗ trợ/chống\n- Supportive: biết và hỗ trợ\n- Leading: biết, hỗ trợ và chủ động tham gia\n\nC = Current level; D = Desired level. PM cần bridge the gap (C→D).\n\n**Stakeholder Engagement Plan là CONFIDENTIAL** — không phổ biến rộng rãi.',
  },
  {
    kaCode: 'stakeholder', pgCode: 'executing', order: 48,
    name: 'Manage Stakeholder Engagement', nameVi: 'Quản lý Tương tác với Stakeholders',
    description: 'Truyền thông và làm việc với stakeholders để đáp ứng nhu cầu/kỳ vọng của họ, giải quyết vấn đề và thúc đẩy sự tham gia phù hợp.',
    inputs: ['Project management plan (communications management plan, risk management plan, stakeholder engagement plan)', 'Project documents (change log, issue log, lessons learned register, stakeholder register)', 'Enterprise environmental factors', 'Organizational process assets'],
    tools: ['Expert judgment', 'Communication skills (feedback, presentations)', 'Interpersonal & team skills (conflict management, cultural awareness, negotiation, observation/conversation, political awareness)', 'Ground rules', 'Meetings'],
    outputs: ['Change requests', 'Project management plan updates', 'Project document updates (change log, issue log, lessons learned register, stakeholder register)'],
    keyPoints: '**Mục tiêu chính:** Tăng sự ủng hộ, giảm sự kháng cự. Đưa stakeholders từ Resistant/Neutral → Supportive/Leading.\n\n**Chiến thuật quan trọng:** Active listening, frequent communication, involving stakeholders in decisions, addressing concerns promptly, building trust.\n\nIssue Log: ghi lại và theo dõi tất cả stakeholder issues → đảm bảo resolution.',
  },
  {
    kaCode: 'stakeholder', pgCode: 'monitoring', order: 49,
    name: 'Monitor Stakeholder Engagement', nameVi: 'Giám sát Tương tác với Stakeholders',
    description: 'Giám sát mối quan hệ với stakeholders và điều chỉnh chiến lược và kế hoạch tương tác với stakeholder.',
    inputs: ['Project management plan (resource management plan, communications management plan, stakeholder engagement plan)', 'Project documents (issue log, lessons learned register, project communications, risk register, stakeholder register)', 'Work performance data', 'Enterprise environmental factors', 'Organizational process assets'],
    tools: ['Data analysis (alternatives analysis, root cause analysis, stakeholder analysis)', 'Decision making (multicriteria decision analysis)', 'Data representation (stakeholder engagement assessment matrix)', 'Communication skills (feedback)', 'Interpersonal & team skills (active listening, cultural awareness, leadership, networking, political awareness)', 'Meetings'],
    outputs: ['Work performance information', 'Change requests', 'Project management plan updates (communications management plan, stakeholder engagement plan)', 'Project document updates (issue log, lessons learned register, risk register, stakeholder register)'],
    keyPoints: '**Monitor Stakeholder Engagement kiểm tra:** Stakeholder engagement levels có đạt mức desired không? Có stakeholders mới xuất hiện không? Có thay đổi về power/interest/influence không? Engagement strategies có hiệu quả không?\n\n**So sánh:** Plan = lập kế hoạch; Manage = thực thi; Monitor = theo dõi và điều chỉnh.\n\nKết thúc dự án: cập nhật stakeholder register lần cuối, ghi lessons learned.',
  },
];

// ─── Sample Exam Questions ──────────────────────────────────
type QDef = { area: string; group: string; content: string; optionA: string; optionB: string; optionC: string; optionD: string; answer: string; explain: string; difficulty: Difficulty };
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

// ─── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 PMP PMBOK 6 Seeder — Lần 1/3: Processes + ITTOs\n');

  // 1. Knowledge Areas
  console.log('📚 Knowledge Areas...');
  const kaMap = new Map<string, string>();
  for (const ka of KA_DATA) {
    const row = await prisma.pMPKnowledgeArea.upsert({
      where: { code: ka.code },
      update: { name: ka.name, nameVi: ka.nameVi, description: ka.description, order: ka.order },
      create: ka,
    });
    kaMap.set(ka.code, row.id);
    console.log(`   ✓ [${ka.order}] ${ka.nameVi}`);
  }

  // 2. Process Groups
  console.log('\n📋 Process Groups...');
  const pgMap = new Map<string, string>();
  for (const pg of PG_DATA) {
    const row = await prisma.pMPProcessGroup.upsert({
      where: { code: pg.code },
      update: { name: pg.name, nameVi: pg.nameVi, order: pg.order },
      create: pg,
    });
    pgMap.set(pg.code, row.id);
    console.log(`   ✓ ${pg.nameVi}`);
  }

  // 3. Processes with full ITTOs
  console.log('\n⚙️  Processes (49 with full ITTOs)...');
  const procMap = new Map<string, string>();
  let created = 0; let updated = 0;
  for (const p of PROC_DATA) {
    const kaId = kaMap.get(p.kaCode)!;
    const pgId = pgMap.get(p.pgCode)!;
    const existing = await prisma.pMPProcess.findFirst({ where: { knowledgeAreaId: kaId, name: p.name } });
    const data = {
      knowledgeAreaId: kaId, processGroupId: pgId,
      name: p.name, nameVi: p.nameVi, description: p.description,
      inputs: p.inputs, tools: p.tools, outputs: p.outputs,
      keyPoints: p.keyPoints, order: p.order,
    };
    let row: { id: string };
    if (existing) {
      row = await prisma.pMPProcess.update({ where: { id: existing.id }, data });
      updated++;
      console.log(`   ↻ [${p.kaCode}/${p.pgCode}] ${p.name}`);
    } else {
      row = await prisma.pMPProcess.create({ data });
      created++;
      console.log(`   ✓ [${p.kaCode}/${p.pgCode}] ${p.name}`);
    }
    procMap.set(p.name, row.id);
  }

  // 4. Exam Questions (giữ nguyên từ file gốc)
  console.log('\n❓ Exam Questions...');
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
  const kaCount   = await prisma.pMPKnowledgeArea.count();
  const pgCount   = await prisma.pMPProcessGroup.count();
  const procCount = await prisma.pMPProcess.count();
  const qCount    = await prisma.pMPExamQuestion.count();
  console.log(`\n✅ Lần 1/3 hoàn thành:`);
  console.log(`   Knowledge Areas : ${kaCount}`);
  console.log(`   Process Groups  : ${pgCount}`);
  console.log(`   Processes       : ${procCount} (${created} created, ${updated} updated)`);
  console.log(`   Exam Questions  : ${qCount}`);
  console.log(`\n👉 Chạy tiếp: npx tsx prisma/seed-pmp-questions.ts`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
