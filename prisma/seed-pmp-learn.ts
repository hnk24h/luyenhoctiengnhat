/**
 * seed-pmp-learn.ts — PMP Learning Content (Part 3/3)
 * Tạo: 1 Level (PMP) + 11 Categories + 22 Lessons (Markdown content)
 * Chạy: npx tsx prisma/seed-pmp-learn.ts
 */
import { PrismaClient, Subject, Skill, LessonType } from '@prisma/client';
const prisma = new PrismaClient();

// ─── Category định nghĩa ─────────────────────────────────────────────────────
interface CatDef {
  code: string;
  name: string;
  description: string;
  icon: string;
  order: number;
  skill: Skill;
  lessons: LessonDef[];
}

interface LessonDef {
  title: string;
  description: string;
  content: string;
  type: LessonType;
  order: number;
}

// ─── Nội dung học (Markdown) ──────────────────────────────────────────────────

const CATEGORIES: CatDef[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // 0. PMP FOUNDATIONS
  // ══════════════════════════════════════════════════════════════════════════
  {
    code: 'pmp_foundations',
    name: 'Nền tảng PMP & PMBOK',
    description: 'Framework tổng quan, 5 Process Groups, 10 Knowledge Areas và các khái niệm cốt lõi',
    icon: '🏛️',
    order: 0,
    skill: Skill.doc,
    lessons: [
      {
        title: 'PMBOK Framework & Project Life Cycle',
        description: 'Tổng quan PMBOK 6, Project vs Operation, Project Life Cycle',
        type: LessonType.text,
        order: 0,
        content: `# PMBOK Framework & Project Life Cycle

## Dự án là gì?
**Project** = nỗ lực tạm thời (temporary) để tạo ra sản phẩm/dịch vụ/kết quả **unique**.
- **Temporary**: có ngày bắt đầu và kết thúc rõ ràng
- **Unique**: mỗi project tạo ra thứ gì đó chưa từng tồn tại y hệt trước đó
- Khác với **Operations** (liên tục, lặp lại): nhà máy sản xuất, bộ phận Customer Service

## 5 Process Groups (Nhóm Quy trình)
| # | Process Group | Mục đích |
|---|---|---|
| 1 | **Initiating** | Authorize và define project/phase |
| 2 | **Planning** | Thiết lập scope, schedule, budget và kế hoạch quản lý |
| 3 | **Executing** | Thực hiện công việc theo kế hoạch |
| 4 | **Monitoring & Controlling** | Theo dõi, đo lường và kiểm soát tiến độ |
| 5 | **Closing** | Chính thức hoàn thành project/phase |

> 💡 **Nhớ**: Process Groups KHÔNG phải là phases của dự án. Chúng là nhóm hoạt động logic.

## 10 Knowledge Areas
Integration → Scope → Schedule → Cost → Quality → Resource → Communications → Risk → Procurement → Stakeholder

## Project vs Product Life Cycle
- **Project Life Cycle**: từ khi bắt đầu đến khi đóng project
- **Product Life Cycle**: toàn bộ vòng đời sản phẩm (conception → retirement)
- Project life cycle nằm TRONG product life cycle

## Ba Ràng buộc (Triple Constraint)
**Scope ↔ Time ↔ Cost** (và Quality ở giữa)
- Thay đổi một ràng buộc ảnh hưởng đến các ràng buộc còn lại
- PM phải balance cả ba để đạt mục tiêu chất lượng

## EEF vs OPA
| | Enterprise Environmental Factors (EEF) | Organizational Process Assets (OPA) |
|---|---|---|
| Ví dụ | Văn hóa công ty, market conditions, cơ sở hạ tầng, luật pháp | Templates, lessons learned, policies, procedures |
| Kiểm soát | PM ít/không kiểm soát được | PM có thể dùng và cập nhật |`,
      },
      {
        title: 'Project Manager Roles & Organizational Structures',
        description: 'PMO, cấu trúc tổ chức, quyền hạn PM, Skills tam giác',
        type: LessonType.text,
        order: 1,
        content: `# Project Manager Roles & Organizational Structures

## PMI Talent Triangle
PM cần 3 nhóm kỹ năng:
1. **Technical PM** (kỹ năng quản lý dự án kỹ thuật): scheduling, budgeting, risk management
2. **Leadership**: motivate, communicate, resolve conflicts, inspire
3. **Strategic & Business Management**: business acumen, domain knowledge, organization strategy

## Organizational Structures & PM Authority
| Cấu trúc | PM Authority | Resource Control |
|---|---|---|
| **Functional** | Rất thấp/None | Functional Manager kiểm soát |
| **Weak Matrix** | Thấp | Functional Manager |
| **Balanced Matrix** | Trung bình | Chia sẻ |
| **Strong Matrix** | Cao | PM kiểm soát nhiều |
| **Projectized** | Rất cao/Full | PM kiểm soát hoàn toàn |

> 💡 Trong **Functional Organization**: PM được gọi là Project Coordinator hoặc Expediter — rất ít authority.

## PMO (Project Management Office)
3 loại PMO:
- **Supportive**: templates, training, best practices — low control
- **Controlling**: standards, governance, compliance — moderate control
- **Directive**: trực tiếp manage projects — high control

## Project Sponsor
- **Authorize** Project Charter
- **Provide resources và funding**
- **Champion** dự án ở executive level
- Không phải line manager của PM (thường là cấp trên)

## Stakeholder Types
- **Internal**: sponsor, PM, team, PMO, functional managers
- **External**: customers, suppliers, government, communities

## Project Governance
Framework để guide decisions:
- **Organizational governance**: policies, procedures
- **Project governance**: how project decisions are made, escalation paths, phase gates`,
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 1. INTEGRATION MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════════
  {
    code: 'integration',
    name: 'Integration Management',
    description: '7 quy trình tích hợp — từ Project Charter đến Close Project',
    icon: '🔗',
    order: 1,
    skill: Skill.doc,
    lessons: [
      {
        title: 'Integration: 7 Quy Trình & Vai Trò PM',
        description: 'Develop Charter, Develop PM Plan, Direct Work, Manage Knowledge, Monitor Work, PICC, Close',
        type: LessonType.text,
        order: 0,
        content: `# Integration Management — 7 Quy Trình

## Tổng quan
Integration Management = KA duy nhất xuyên suốt tất cả Process Groups. PM là người chịu trách nhiệm chính.

## 7 Quy Trình
| # | Quy trình | Process Group | Output chính |
|---|---|---|---|
| 1 | **Develop Project Charter** | Initiating | Project Charter |
| 2 | **Develop PM Plan** | Planning | Project Management Plan |
| 3 | **Direct & Manage Project Work** | Executing | Deliverables, WPI, Issue Log |
| 4 | **Manage Project Knowledge** | Executing | Lessons Learned Register |
| 5 | **Monitor & Control Project Work** | M&C | Work Performance Reports, Change Requests |
| 6 | **Perform Integrated Change Control** | M&C | Approved Change Requests |
| 7 | **Close Project or Phase** | Closing | Final Deliverables, OPA Updates |

## Project Charter
**Đầu vào quan trọng**: Business Case + Benefits Management Plan + Agreements + EEF + OPA
**Nội dung**: High-level scope, objectives, milestones, budget, authorized PM, key stakeholders

> ⚠️ Project Charter **authorize** PM sử dụng organizational resources. KHÔNG phải contract với khách hàng.

## Project Management Plan
- **Subsidiary Plans**: Scope Plan, Schedule Plan, Cost Plan, Quality Plan, Resource Plan, Communications Plan, Risk Plan, Procurement Plan, Stakeholder Plan
- **Baselines**: Scope Baseline, Schedule Baseline, Cost Baseline
- Được **approved** trở thành **Performance Measurement Baseline (PMB)**

## Perform Integrated Change Control (PICC)
**Quy trình xử lý mọi Change Request**:
1. Change Request được tạo
2. Đánh giá tác động (scope/schedule/cost/quality/risk)
3. CCB (Change Control Board) review và phê duyệt/từ chối  
4. Update Project Management Plan nếu approved
5. Communicate kết quả

> 💡 **Mọi thay đổi phải qua PICC** — kể cả thay đổi nhỏ.

## WPD → WPI → WPR
- **Work Performance Data (WPD)**: raw data từ Direct & Manage Work (% complete, costs incurred, start/finish dates)
- **Work Performance Information (WPI)**: WPD đã được analyzed trong Monitoring processes
- **Work Performance Reports (WPR)**: output của Monitor & Control Work — dạng vật lý/điện tử gửi stakeholders`,
      },
      {
        title: 'Integration: Lessons Learned & Change Management',
        description: 'Manage Project Knowledge, Configuration Management, Closure',
        type: LessonType.text,
        order: 1,
        content: `# Integration: Knowledge Management & Change Control

## Manage Project Knowledge (PMBOK 6 — Quy trình MỚI)
**Mục đích**: Leverage existing knowledge & create new knowledge để đạt project objectives.

### 2 loại knowledge:
- **Explicit knowledge**: có thể document (reports, procedures, templates)
- **Tacit knowledge**: khó document (expertise, experience, judgment) — captured qua communities of practice, mentoring

### Output: **Lessons Learned Register**
- Created trong Manage Project Knowledge
- Updated liên tục suốt project
- Cuối project → stored vào **OPA (Lessons Learned Repository)**

## Configuration Management System
- Phần của Project Management Plan
- Track **versions** của deliverables và documents
- Đảm bảo mọi người làm việc với đúng version
- **Configuration Identification**: label và number items
- **Configuration Status Accounting**: record và report config item status
- **Configuration Verification & Audit**: verify config items match approved baselines

## Close Project or Phase
**Khi nào đóng project?**
- Project completed successfully ✅
- Project terminated early ❌ (cũng phải formally close!)

**Output quan trọng**:
1. **Final deliverable/service/result transition** — bàn giao chính thức  
2. **OPA Updates**: Lessons Learned, Final reports, Project records
3. **Organizational Process Assets Updates**

> 💡 **Exam tip**: Nếu project bị cancel/terminate sớm, PM vẫn phải **formally close** và document lessons learned!

## Key Change Control Concepts
| Thuật ngữ | Ý nghĩa |
|---|---|
| **Approved Change Request** | Được approve qua PICC |
| **Corrective Action** | Align future performance với plan |
| **Preventive Action** | Reduce probability of negative consequences |
| **Defect Repair** | Fix defective deliverable |
| **Change Log** | Document tất cả change requests và status |

## Assumptions Log
- Được tạo trong **Develop Project Charter**
- Ghi lại tất cả assumptions và constraints
- Updated suốt project lifecycle`,
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 2. SCOPE MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════════
  {
    code: 'scope',
    name: 'Scope Management',
    description: 'Thu thập requirements, định nghĩa scope, tạo WBS và kiểm soát phạm vi',
    icon: '📋',
    order: 2,
    skill: Skill.doc,
    lessons: [
      {
        title: 'Scope: Requirements & WBS',
        description: 'Collect Requirements, Define Scope, Create WBS — tools và outputs',
        type: LessonType.text,
        order: 0,
        content: `# Scope Management — Requirements & WBS

## 6 Quy Trình Scope Management
| Quy trình | Process Group | Output |
|---|---|---|
| Plan Scope Management | Planning | Scope Management Plan, Requirements Management Plan |
| Collect Requirements | Planning | Requirements Documentation, RTM |
| Define Scope | Planning | Project Scope Statement |
| Create WBS | Planning | Scope Baseline (PSS + WBS + WBS Dictionary) |
| Validate Scope | M&C | Accepted Deliverables |
| Control Scope | M&C | WPI, Change Requests |

## Product Scope vs Project Scope
- **Product Scope**: features và functions của sản phẩm (measured by product requirements)
- **Project Scope**: work cần làm để deliver sản phẩm (measured by PM plan)

## Collect Requirements — Key Techniques
| Technique | Mô tả |
|---|---|
| **Interviews** | Formal/informal 1-on-1 |
| **Focus Groups** | Nhóm nhỏ chuyên gia/users |
| **Facilitated Workshops** | **JAD** (Joint Application Design), **QFD** |
| **Brainstorming** | Generate nhiều ideas |
| **Nominal Group Technique** | Brainstorm + vote ưu tiên |
| **Delphi Technique** | Anonymous multi-round expert consensus |
| **Surveys/Questionnaires** | Large groups, quick |
| **Prototyping** | Tạo model để stakeholder phản hồi |
| **Benchmarking** | So sánh với projects/products tương tự |
| **Document Analysis** | Review existing docs/systems |

## Requirements Traceability Matrix (RTM)
Liên kết requirements từ **business need → deliverable → test case** để:
- Không bỏ sót requirement nào
- Justify mỗi deliverable
- Track scope changes

## Create WBS — 100% Rule
> **WBS must capture 100% of project work — không thừa, không thiếu**

- **Work Package**: mức thấp nhất của WBS (có thể estimate, assign, track)
- **Planning Package**: WBS component chưa đủ info để detail
- **WBS Dictionary**: mô tả chi tiết mỗi WBS component
- **Scope Baseline** = Project Scope Statement + WBS + WBS Dictionary

## MoSCoW Prioritization
- **M**ust have — bắt buộc
- **S**hould have — nên có
- **C**ould have — có thể có nếu còn thời gian
- **W**on't have this time — loại khỏi scope lần này`,
      },
      {
        title: 'Scope: Validate, Control & Scope Creep',
        description: 'Validate Scope vs Control Quality, Scope Creep, Gold Plating',
        type: LessonType.text,
        order: 1,
        content: `# Scope: Validation, Control & Pitfalls

## Validate Scope
**Mục đích**: Nhận **Accepted Deliverables** — formal acceptance từ customer/sponsor

### Validate Scope vs Control Quality
| | Validate Scope | Control Quality |
|---|---|---|
| **Focus** | Correctness — đúng thứ chưa? | Conformance — đúng yêu cầu chất lượng chưa? |
| **Who** | Customer/Sponsor review | Internal QC team |
| **Output** | Accepted Deliverables | Verified Deliverables |
| **Timing** | Sau Control Quality | Trước Validate Scope |

> 💡 **Flow**: Control Quality (verify quality) → Validate Scope (customer accepts) → Deliverable accepted

## Control Scope
- So sánh **actual scope** với **Scope Baseline**
- Sử dụng **Variance Analysis**: xác định magnitude và cause của variance
- Kết quả: WPI, Change Requests, Project Document Updates

## Scope Creep vs Gold Plating
| | Scope Creep | Gold Plating |
|---|---|---|
| **Ai làm?** | Customer/Stakeholder | Project Team |
| **Cách thức** | Thêm requirements dần dần không controlled | Tự ý thêm features ngoài scope |
| **Có CR không?** | Không | Không |
| **Vấn đề** | Ăn mòn schedule/budget | Waste resources, unintended side-effects |

> ⚠️ Cả hai đều nguy hiểm và phải tránh bằng **Change Control System** chặt chẽ

## Scope Definition — Project Scope Statement Gồm:
1. **Product scope description**: mô tả deliverables
2. **Product acceptance criteria**: điều kiện được chấp nhận
3. **Project deliverables**: tất cả outputs
4. **Project exclusions**: những gì KHÔNG thuộc scope (rất quan trọng!)
5. **Constraints**: giới hạn (budget, time, resources)
6. **Assumptions**: những gì assume là đúng

## Decomposition trong WBS
Dừng phân tách khi work package:
- Có thể **estimate** cost/duration
- Có thể **assign** cho 1 responsible party
- Có thể **schedule** và **monitor/control** thực tế

## Exam Tips
- **Accepted Deliverables** từ Validate Scope → input cho Close Project or Phase
- **Verified Deliverables** từ Control Quality → input cho Validate Scope
- Scope Baseline chỉ thay đổi qua **formal change control**`,
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 3. SCHEDULE MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════════
  {
    code: 'schedule',
    name: 'Schedule Management',
    description: 'Network diagrams, Critical Path, EVM schedule metrics, compression techniques',
    icon: '📅',
    order: 3,
    skill: Skill.doc,
    lessons: [
      {
        title: 'Schedule: Network Diagram & Critical Path',
        description: 'PDM, dependencies, CPM Forward/Backward Pass, Float',
        type: LessonType.text,
        order: 0,
        content: `# Schedule Management — Network Diagram & CPM

## 6 Quy Trình Schedule Management
| Quy trình | Output |
|---|---|
| Plan Schedule Management | Schedule Management Plan |
| Define Activities | Activity List, Milestone List |
| Sequence Activities | Project Schedule Network Diagram |
| Estimate Activity Durations | Duration Estimates |
| Develop Schedule | Schedule Baseline, Project Schedule |
| Control Schedule | WPI, Schedule Forecasts, Change Requests |

## Precedence Diagramming Method (PDM)
4 loại dependency (Activity-on-Node):
| Type | Ý nghĩa | Ví dụ thực tế |
|---|---|---|
| **FS** (Finish-to-Start) | B không bắt đầu cho đến khi A xong | Testing sau khi coding done |
| **SS** (Start-to-Start) | B không bắt đầu cho đến khi A bắt đầu | Document khi design bắt đầu |
| **FF** (Finish-to-Finish) | B không xong cho đến khi A xong | QA xong khi coding xong |
| **SF** (Start-to-Finish) | B không xong cho đến khi A bắt đầu | Shift handover (rất hiếm) |

**FS là phổ biến nhất, SF là hiếm nhất.**

## Lead & Lag
- **Lead (-)**: overlap — successor bắt đầu trước predecessor xong. Ví dụ: FS -3d  
- **Lag (+)**: delay/wait giữa 2 activities. Ví dụ: FS +2d (chờ 2 ngày)

## Dependency Types
| Type | Đặc điểm |
|---|---|
| **Mandatory** (Hard Logic) | Bắt buộc về kỹ thuật hoặc vật lý. VD: móng trước tường |
| **Discretionary** (Soft Logic) | Best practice, có thể thay đổi. VD: review trước code |
| **External** | Phụ thuộc ngoài dự án. VD: chờ government approval |
| **Internal** | Phụ thuộc trong dự án |

## Critical Path Method (CPM)
**Forward Pass** → Early Start (ES), Early Finish (EF)  
**Backward Pass** → Late Start (LS), Late Finish (LF)

**Total Float** = LS - ES = LF - EF  
**Free Float** = ES(next) - EF(current)

> 💡 **Critical Path** = path dài nhất, Total Float = 0, quyết định project duration

## Float Summary
| Type | Định nghĩa |
|---|---|
| **Total Float** | Trễ mà không làm trễ **project completion** |
| **Free Float** | Trễ mà không làm trễ **early start của successor** |
| **Project Float** | Trễ mà không làm trễ **customer-imposed deadline** |

## PERT Three-Point Estimate
$$E = \\frac{O + 4M + P}{6}$$  
$$SD = \\frac{P - O}{6}$$

Ví dụ: O=2, M=5, P=14 → E = (2+20+14)/6 = **6 ngày**, SD = (14-2)/6 = **2 ngày**`,
      },
      {
        title: 'Schedule: Compression, EVM & Key Metrics',
        description: 'Crashing, Fast Tracking, SPI, SV, Resource Leveling',
        type: LessonType.text,
        order: 1,
        content: `# Schedule: Compression Techniques & EVM Metrics

## Schedule Compression
| Technique | Cơ chế | Trade-off |
|---|---|---|
| **Crashing** | Thêm resources vào CP activities | Tăng chi phí |
| **Fast Tracking** | Song song hóa các activities vốn tuần tự | Tăng rủi ro, rework |

> 💡 **Crash** critical path activities có cost-efficiency tốt nhất (rẻ nhất để rút ngắn)
> 💡 **Fast Tracking** chỉ áp dụng được khi có overlap khả thi

## Resource Optimization
| Technique | Đặc điểm |
|---|---|
| **Resource Leveling** | Điều chỉnh dates để đáp ứng resource constraints → thường kéo dài duration |
| **Resource Smoothing** | Điều chỉnh trong float có sẵn → không thay đổi Critical Path |

## EVM Schedule Metrics
| Metric | Công thức | Ý nghĩa |
|---|---|---|
| **PV** | Budgeted work planned by today | Kế hoạch |
| **EV** | % complete × BAC | Giá trị công việc đã hoàn thành |
| **SV** | EV - PV | + = ahead, - = behind |
| **SPI** | EV / PV | >1 = ahead, <1 = behind |

**SPI = 0.85** → cứ $1 planned, chỉ earn được $0.85 → trễ tiến độ

## Schedule Baseline vs Project Schedule
- **Schedule Baseline**: approved version, **không thay đổi** ngoại trừ qua change control
- **Project Schedule**: working version, updated liên tục với actual data

## Estimating Methods
| Method | Cơ chế | Accuracy |
|---|---|---|
| **Analogous** | Dựa trên dự án tương tự trong quá khứ | Thấp, nhanh |
| **Parametric** | statistical relationship (VD: 100 hrs/feature point) | Trung bình→cao |
| **Bottom-up** | Estimate từng work package, aggregate lên | Cao nhất, chậm nhất |
| **Three-Point/PERT** | (O + 4M + P) / 6 | Cao, tính uncertainty |

## Monte Carlo Simulation
- Chạy hàng ngàn iterations với random duration values
- Kết quả: probability distribution
- VD: "80% xác suất hoàn thành trước ngày X"
- Là **Quantitative Risk Analysis** tool cho schedule

## Critical Chain Method (CCM)
- Xem xét **resource constraints** (khác CPM chỉ xét time)
- Sử dụng **buffers**: Project Buffer (cuối chain) + Feeding Buffers (nơi non-critical join critical)
- Remove individual activity padding → centralize vào buffers`,
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 4. COST MANAGEMENT & EVM
  // ══════════════════════════════════════════════════════════════════════════
  {
    code: 'cost',
    name: 'Cost Management & EVM',
    description: 'Estimate, Budget, Control — toàn bộ công thức EVM TCPI/EAC/ETC/VAC',
    icon: '💰',
    order: 4,
    skill: Skill.doc,
    lessons: [
      {
        title: 'Cost: Estimate & Budget',
        description: 'Estimating types, Cost Baseline, Reserves, Budget components',
        type: LessonType.text,
        order: 0,
        content: `# Cost Management — Estimate & Budget

## 4 Quy Trình Cost Management
| Quy trình | Output |
|---|---|
| Plan Cost Management | Cost Management Plan |
| Estimate Costs | Cost Estimates, Basis of Estimates |
| Determine Budget | Cost Baseline, Project Funding Requirements |
| Control Costs | WPI, Cost Forecasts, Change Requests |

## Cost Estimating Methods
| Method | Mô tả | Khi nào dùng |
|---|---|---|
| **Analogous** | Historical data từ similar projects | Ít thông tin, cần ước tính nhanh |
| **Parametric** | Statistical models (VD: $/sq.ft, $/function point) | Có historical data đáng tin cậy |
| **Bottom-up** | Estimate từng work package → aggregate | Cần độ chính xác cao, có WBS |
| **Three-Point** | (O + 4M + P) / 6 | Muốn tính uncertainty |

## Cost Baseline & Project Budget
$$\\text{Cost Baseline} = \\text{Work costs} + \\text{Contingency Reserves}$$
$$\\text{Project Budget} = \\text{Cost Baseline} + \\text{Management Reserves}$$

## Reserves
| Type | Dành cho | Kiểm soát bởi | Nằm trong Cost Baseline? |
|---|---|---|---|
| **Contingency Reserve** | Known-Unknown risks (identified risks) | PM | ✅ Có |
| **Management Reserve** | Unknown-Unknown (unforeseeable) | Management/Sponsor | ❌ Không |

> 💡 **BAC** (Budget at Completion) = Cost Baseline trong EVM calculations

## Life Cycle Costing
- Xem xét toàn bộ chi phí trong vòng đời sản phẩm:
  **Development + Operations + Maintenance + Disposal**
- Giúp đưa ra quyết định đầu tư tốt hơn

## Cost of Quality (CoQ)
$$\\text{CoQ} = \\text{Cost of Conformance} + \\text{Cost of Nonconformance}$$

| Category | Sub-category | Ví dụ |
|---|---|---|
| **Conformance** | Prevention | Training, process docs, equipment |
| **Conformance** | Appraisal | Testing, inspection, audits |
| **Nonconformance** | Internal Failure | Rework, scrap (trước giao hàng) |
| **Nonconformance** | External Failure | Warranty, recalls, liability (sau giao hàng) |

## Control Accounts
- Management control point tại intersection của **WBS × OBS**
- Nơi scope, cost và schedule được integrated và tracked theo EVM`,
      },
      {
        title: 'EVM: Tất cả Công thức Cần Thiết',
        description: 'EV, PV, AC, CV, SV, CPI, SPI, EAC, ETC, VAC, TCPI — ví dụ tính toán',
        type: LessonType.text,
        order: 1,
        content: `# EVM — Earned Value Management Complete Guide

## 3 Trị số Cơ bản
| | Tên đầy đủ | Ý nghĩa |
|---|---|---|
| **PV** | Planned Value | Budgeted value of work PLANNED by today |
| **EV** | Earned Value | Budgeted value of work COMPLETED = % done × BAC |
| **AC** | Actual Cost | Actual cost INCURRED for work completed |
| **BAC** | Budget at Completion | Total approved budget for all project work |

## Variance Metrics
| Metric | Công thức | Kết quả |
|---|---|---|
| **CV** (Cost Variance) | EV - AC | + = under budget, - = over budget |
| **SV** (Schedule Variance) | EV - PV | + = ahead of schedule, - = behind |
| **CPI** (Cost Performance Index) | EV / AC | >1 = under budget, <1 = over budget |
| **SPI** (Schedule Performance Index) | EV / PV | >1 = ahead, <1 = behind |

## Forecasting Metrics
| Metric | Công thức | Giải thích |
|---|---|---|
| **EAC** (Estimate at Completion) | BAC / CPI | Nếu CPI hiện tại tiếp diễn đến cuối |
| **EAC** (alternative) | AC + (BAC - EV) | Nếu future work theo kế hoạch |
| **EAC** (alternative 2) | AC + ETC | Dùng bottom-up ETC mới |
| **ETC** (Estimate to Complete) | EAC - AC | Chi phí còn lại |
| **ETC** (alternative) | (BAC - EV) / CPI | Remaining work / efficiency |
| **VAC** (Variance at Completion) | BAC - EAC | + = under final budget, - = over |
| **TCPI** (To-Complete PI) | (BAC - EV) / (BAC - AC) | Efficiency needed to meet BAC |

## Ví dụ Tính Toán
> **Dữ liệu**: BAC = $1,000,000 | PV = $400,000 | EV = $350,000 | AC = $420,000

| Metric | Tính | Kết quả | Ý nghĩa |
|---|---|---|---|
| CV | 350k - 420k | **-$70,000** | Over budget $70k |
| SV | 350k - 400k | **-$50,000** | Behind schedule |
| CPI | 350k / 420k | **0.833** | Over budget |
| SPI | 350k / 400k | **0.875** | Behind schedule |
| EAC | 1M / 0.833 | **$1,200,000** | Dự kiến vượt $200k |
| VAC | 1M - 1.2M | **-$200,000** | Dự kiến lỗ $200k |
| TCPI | (1M-350k)/(1M-420k) | **1.12** | Cần improve CPI lên 1.12 |

## TCPI Interpretation
- **TCPI ≈ CPI**: Achievable  
- **TCPI >> CPI**: Very difficult → escalate hoặc revise EAC
- TCPI based on EAC: (BAC - EV) / (EAC - AC)

## Quick Memory Aid
| Tốt | Xấu |
|---|---|
| CPI > 1, SPI > 1 | CPI < 1, SPI < 1 |
| CV > 0, SV > 0 | CV < 0, SV < 0 |
| EAC < BAC | EAC > BAC |
| VAC > 0 | VAC < 0 |`,
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 5. QUALITY MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════════
  {
    code: 'quality',
    name: 'Quality Management',
    description: 'Quality vs Grade, CoQ, 7 Basic Quality Tools, Manage Quality vs Control Quality',
    icon: '✅',
    order: 5,
    skill: Skill.doc,
    lessons: [
      {
        title: 'Quality: Concepts, Planning & Tools',
        description: 'Quality vs Grade, Prevention over Inspection, 7 Basic Quality Tools',
        type: LessonType.text,
        order: 0,
        content: `# Quality Management — Concepts & Tools

## 3 Quy Trình Quality Management
| Quy trình | Process Group | Output |
|---|---|---|
| Plan Quality Management | Planning | Quality Management Plan, Quality Metrics |
| Manage Quality | Executing | Quality Reports, Test & Evaluation Documents |
| Control Quality | M&C | Quality Control Measurements, Verified Deliverables |

## Quality vs Grade
| | Quality | Grade |
|---|---|---|
| **Định nghĩa** | Mức độ đáp ứng requirements | Category của features/functions |
| **Vấn đề** | Low quality = LUÔN vấn đề | Low grade có thể acceptable |
| **Ví dụ** | Phần mềm nhiều bugs = low quality | Phần mềm basic features = low grade |

> 💡 **High grade + Low quality** = nhiều tính năng nhưng nhiều bugs = VẤN ĐỀ

## Quality Philosophies
- **Prevention over Inspection**: ngăn ngừa defects rẻ hơn tìm và sửa sau
- **Continuous Improvement (Kaizen)**: cải tiến nhỏ liên tục
- **Fitness for Use**: sản phẩm phù hợp mục đích sử dụng

## 7 Basic Quality Tools
| Tool | Mục đích |
|---|---|
| **Cause-and-Effect (Fishbone/Ishikawa)** | Tìm root causes của problem (6Ms: Man, Machine, Method, Material, Measurement, Mother Nature) |
| **Flowchart/Process Map** | Hiểu process flow, tìm bottlenecks |
| **Check Sheet (Tally Sheet)** | Collect raw defect frequency data |
| **Pareto Chart** | 80/20 rule — focus vào "vital few" causes |
| **Histogram** | Frequency distribution của data |
| **Control Chart** | Monitor process stability over time |
| **Scatter Diagram** | Correlation giữa 2 variables |

## Control Charts — Key Rules
- **UCL/LCL**: ±3 standard deviations từ mean
- **Process in control**: data points ngẫu nhiên trong UCL/LCL
- **Rule of Seven**: 7 consecutive points một phía của mean hoặc trending = out of control
- **Specification Limits** (từ customer) KHÁC **Control Limits** (từ process)

## Design of Experiments (DoE)
- Statistical method xác định **factors** ảnh hưởng đến quality
- Test combinations để tìm optimal settings
- Ví dụ: nhiệt độ + áp suất + vật liệu → tìm combination tốt nhất`,
      },
      {
        title: 'Manage Quality vs Control Quality',
        description: 'Sự khác biệt QA/QC, Quality Audit, Inspection, Statistical Sampling',
        type: LessonType.text,
        order: 1,
        content: `# Quality: Manage Quality vs Control Quality

## Key Distinction

| | **Manage Quality** | **Control Quality** |
|---|---|---|
| **Focus** | **Process** quality improvement | **Product/Deliverable** quality check |
| **Cũ gọi là** | Quality Assurance (QA) | Quality Control (QC) |
| **Who** | PM + team + QA specialists | QC inspectors |
| **When** | Throughout project | When deliverables completed |
| **Output** | Quality Reports, Process Improvements | Verified Deliverables, QC Measurements |
| **Tools** | Quality Audits, Process Analysis | Inspection, Statistical Sampling, 7 tools |

> 💡 **"QA = process; QC = product"** — nhớ câu này cho exam!

## Manage Quality Tools

### Quality Audit
- Independent review của quy trình dự án
- Mục đích: identify best practices, gaps, non-compliance, improvement opportunities
- Kết quả: process improvement recommendations

### Process Analysis
- Identify inefficiencies trong process
- Dùng: Root Cause Analysis, Kaizen
- **PDCA Cycle** (Deming Wheel): Plan → Do → Check → Act

## Control Quality Tools

### Inspection
- Examine work product để verify it meets specifications
- Kết quả: Verified Deliverables → input cho Validate Scope

### Statistical Sampling
- Kiểm tra một **sample** thay vì 100% population
- Tiết kiệm chi phí/thời gian
- Sample size trong Quality Management Plan

### Testing / Product Evaluation
- Kiểm tra deliverables đáp ứng requirements
- Types: unit testing, integration testing, regression testing

## Cost of Quality Summary
| Category | Type | Ví dụ | Khi nào |
|---|---|---|---|
| **Conformance** | Prevention | Training, process docs | Before |
| **Conformance** | Appraisal | Testing, audits | During |
| **Nonconformance** | Internal Failure | Rework, scrap | During (found before delivery) |
| **Nonconformance** | External Failure | Warranties, liabilities | After (found by customer) |

**Prevention is cheapest → Appraisal → Internal failure → External failure is most expensive**

## Benchmarking
- So sánh practices/performance với projects/organizations tương tự
- Generate ideas cho improvement
- Establish performance baselines

## Process Flow
$$\\text{Deliverable} \\xrightarrow{\\text{Control Quality}} \\text{Verified Deliverable} \\xrightarrow{\\text{Validate Scope}} \\text{Accepted Deliverable}$$`,
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 6. RESOURCE MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════════
  {
    code: 'resource',
    name: 'Resource Management',
    description: 'Team development, motivation theories, RACI, Tuckman model, conflict resolution',
    icon: '👥',
    order: 6,
    skill: Skill.doc,
    lessons: [
      {
        title: 'Resource: Planning & Team Development',
        description: 'RACI, Resource Calendar, Tuckman 5 stages, Team building',
        type: LessonType.text,
        order: 0,
        content: `# Resource Management — Planning & Team Development

## 6 Quy Trình Resource Management
| Quy trình | Output |
|---|---|
| Plan Resource Management | Resource Management Plan (incl. Staffing Management Plan) |
| Estimate Activity Resources | Resource Requirements, Resource Breakdown Structure |
| Acquire Resources | Physical Resource Assignments, Project Team Assignments |
| Develop Team | Team Performance Assessments |
| Manage Team | Change Requests, Project Document Updates |
| Control Resources | WPI, Change Requests |

## RACI Matrix
| Role | Ý nghĩa |
|---|---|
| **R** — Responsible | Người **thực hiện** công việc |
| **A** — Accountable | Người **chịu trách nhiệm** cuối cùng (chỉ 1 người mỗi task) |
| **C** — Consult | Được hỏi ý kiến, **2-way** communication |
| **I** — Inform | Được thông báo, **1-way** communication |

## Tuckman's 5 Stages of Team Development
| Stage | Đặc điểm | PM nên làm |
|---|---|---|
| **1. Forming** | Mới quen, lịch sự, ít conflict | Orient, set expectations |
| **2. Storming** | Conflict về cách làm việc, roles | Coach, facilitate, clarify roles |
| **3. Norming** | Norms established, trust builds | Encourage, facilitate |
| **4. Performing** | Hiệu suất cao, self-managing | Delegate, recognize |
| **5. Adjourning** | Dự án kết thúc, team giải tán | Celebrate, transition |

## Team Building Techniques
| Technique | Ý nghĩa |
|---|---|
| **Co-location** | Tập trung team cùng địa điểm (War Room) |
| **Virtual Teams** | Team phân tán — cần ground rules, collaboration tools |
| **Training** | Formal/informal skill development |
| **Team-building Activities** | Strengthen relationships |
| **Recognition & Rewards** | Reinforce desired behaviors |
| **Ground Rules** | Clear expectations về behaviors |

## Resource Calendar
- Availability của resource: working hours, holidays, vacation, other commitments
- Input cho Estimate Activity Durations và Develop Schedule

## Pre-assignment
- Specific resources đã được committed TRƯỚC khi Acquire Resources
- Ex: listed in Project Charter, expert required by contract`,
      },
      {
        title: 'Resource: Motivation Theories & Conflict Resolution',
        description: 'Maslow, Herzberg, McGregor, McClelland, conflict resolution order',
        type: LessonType.text,
        order: 1,
        content: `# Resource: Motivation Theories & Conflict Management

## Motivation Theories — PMP Exam Essentials

### Maslow's Hierarchy of Needs (từ dưới lên)
1. **Physiological** — food, water, shelter (cơ bản nhất)
2. **Safety** — job security, safe environment
3. **Social/Love** — belonging, relationships
4. **Esteem** — recognition, achievement
5. **Self-Actualization** — realize full potential (cao nhất)
> Cần thỏa mãn nhu cầu thấp hơn trước khi focus vào cao hơn

### Herzberg's Two-Factor Theory
| | Hygiene Factors | Motivators |
|---|---|---|
| **Bao gồm** | Salary, job security, working conditions | Achievement, recognition, growth, responsibility |
| **Nếu thiếu** | Gây dissatisfaction | Không tạo motivation mạnh |
| **Nếu có** | Chỉ remove dissatisfaction | **Thực sự create motivation** |
> 💡 Tăng lương KHÔNG động lực hóa lâu dài (hygiene factor)

### McGregor Theory X vs Theory Y
| Theory X | Theory Y |
|---|---|
| Người lười, không muốn làm | Người tự giác, muốn làm tốt |
| Cần micromanage, control | Cần empower, delegate |
| Punishment-based | Trust-based |
> PMP ủng hộ **Theory Y** — build better teams through trust

### McClelland's Theory (Need for Achievement/Affiliation/Power)
- **nAch**: drive to excel, set challenging goals
- **nAff**: desire for friendly relationships, teamwork
- **nPow**: desire to influence others (institutional vs personal)

## Conflict Resolution Techniques (từ tốt nhất → kém nhất)
| # | Technique | Mô tả |
|---|---|---|
| 1 | **Collaborating/Problem Solving** ⭐ | Win-win, address root cause |
| 2 | **Compromising** | Give-and-take, partial win for both |
| 3 | **Smoothing/Accommodating** | Emphasize agreement, downplay conflict |
| 4 | **Forcing** | Win-lose, use authority |
| 5 | **Withdrawing/Avoiding** | Retreat, postpone resolution |

> **PMBOK ưa Collaborating nhất, Withdrawing kém nhất** (temporary fix only)

## Sources of Conflict (theo thứ tự phổ biến nhất)
1. **Schedules** (most common conflict source)
2. Project priorities
3. Resources
4. Technical opinions
5. Administrative procedures
6. Cost
7. **Personalities** (least common)

## Power Types (PM Influence)
| Type | Mô tả |
|---|---|
| **Formal/Legitimate** | Từ position trong tổ chức |
| **Reward** | Khả năng thưởng cho người khác |
| **Coercive/Penalty** | Khả năng phạt — kém effective |
| **Expert** | Knowledge và expertise — **best type** |
| **Referent** | Respect và admiration của người khác |`,
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 7. COMMUNICATIONS MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════════
  {
    code: 'communications',
    name: 'Communications Management',
    description: 'Channel formula, Push/Pull/Interactive, communication models, stakeholder info needs',
    icon: '📢',
    order: 7,
    skill: Skill.doc,
    lessons: [
      {
        title: 'Communications: Planning & Methods',
        description: 'Channel formula, 3 communication methods, Communication Management Plan',
        type: LessonType.text,
        order: 0,
        content: `# Communications Management — Planning & Methods

## 3 Quy Trình Communications Management
| Quy trình | Output |
|---|---|
| Plan Communications Management | Communications Management Plan |
| Manage Communications | Project Communications, OPA Updates |
| Monitor Communications | WPI, Change Requests |

## Communication Channels Formula
$$\\text{Channels} = \\frac{n(n-1)}{2}$$

| n (stakeholders) | Channels |
|---|---|
| 5 | 10 |
| 10 | 45 |
| 15 | 105 |
| 20 | 190 |

> 💡 **PM dành ~90% thời gian cho communication activities**

## 3 Communication Methods
| Method | Mô tả | Ví dụ |
|---|---|---|
| **Interactive** | 2-way, real-time | Meetings, phone calls, video conferences |
| **Push** | 1-way, gửi đến specific recipients | Emails, memos, reports, fax |
| **Pull** | Large audience tự lấy khi cần | Intranet, knowledge repos, e-learning |

## Communication Types
| Formal Written | Formal Verbal | Informal Written | Informal Verbal |
|---|---|---|---|
| Contracts, project charter, change requests | Presentations, speeches | Emails, texts, notes | Conversations, meetings |

**Khi nào dùng Formal Written**: legal matters, complex problems, contract data, change requests

## Communication Model (Sender-Receiver)
Sender → **Encode** → **Channel** → **Decode** → Receiver → **Feedback**

**Noise** = bất kỳ yếu tố nào làm distort message:
- Language barriers
- Cultural differences
- Technical jargon
- Distractions, emotional state

## Communications Management Plan Bao Gồm
- Who needs what information
- When và how often
- Responsible party
- Method/technology
- Format
- Escalation process
- Communication flow charts
- Glossary of terms

## Communication Requirements Analysis
Xác định **information needs** của stakeholders bằng cách xem xét:
- Organizational charts, stakeholder register
- Number và types of stakeholders
- Internal vs external communications
- Logistics (locations, time zones)
- Legal requirements`,
      },
      {
        title: 'Communications: Effective Execution & Virtual Teams',
        description: 'Active listening, meetings, virtual teams, cultural awareness',
        type: LessonType.text,
        order: 1,
        content: `# Communications: Execution & Best Practices

## Active Listening
Không chỉ **nghe** mà thực sự **hiểu**:
- Maintain eye contact
- Avoid interrupting
- Paraphrase để confirm: "Ý bạn là..."
- Ask clarifying questions
- Pay attention to non-verbal cues

> 💡 **Non-verbal communication** chiếm ~55-80% của total message (body language + tone)

## Effective Meetings
**Before**: Publish agenda, invite right people, share pre-reads  
**During**: Start on time, stay on topic, take notes, action items  
**After**: Distribute minutes với action items, owners, deadlines

## Information Overload
- Quá nhiều information → overwhelm → important messages bị buried
- Solution: Communication Requirements Analysis — **right info to right people**

## Virtual Teams Challenges & Solutions
| Challenge | Solution |
|---|---|
| Thiếu face-to-face communication | Regular video calls, collaboration tools |
| Cultural/time zone differences | Flexible scheduling, cultural awareness training |
| Building trust khó hơn | Team charter, team norms, virtual team-building |
| Isolation | Frequent check-ins, recognition |

## Cultural Awareness
- **Direct vs Indirect** communication cultures
- **High-context** (meaning in context/relationships): Japan, China vs **Low-context** (explicit words): USA, Germany
- Eye contact, silence, hierarchy perceptions khác nhau
- PM phải adapt communication style theo culture

## Feedback
- Xác nhận message đã được **received và understood** đúng
- Critical khi có language/cultural barriers
- Methods: verbal confirmation, follow-up email, questions

## Escalation Process (trong Communications Plan)
Định nghĩa:
- Loại issues cần escalate
- Khi nào escalate
- Escalate lên ai
- Expected response time

## Manage vs Monitor Communications
| Manage Communications | Monitor Communications |
|---|---|
| Executing: tạo và distribute thông tin | M&C: đảm bảo communications effective |
| Create project communications | Evaluate if info needs being met |
| Implement communication plan | Update plan nếu không effective |`,
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 8. RISK MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════════
  {
    code: 'risk',
    name: 'Risk Management',
    description: 'Identify → Qualitative → Quantitative → Response → Monitor — ETMAA & EESEA strategies',
    icon: '⚠️',
    order: 8,
    skill: Skill.doc,
    lessons: [
      {
        title: 'Risk: Identification & Analysis',
        description: 'Risk Register, P×I Matrix, EMV, Monte Carlo, Decision Tree',
        type: LessonType.text,
        order: 0,
        content: `# Risk Management — Identification & Analysis

## 7 Quy Trình Risk Management
| Quy trình | Output |
|---|---|
| Plan Risk Management | Risk Management Plan (methodology, RBS, P×I matrix) |
| Identify Risks | Risk Register, Risk Report |
| Perform Qualitative Risk Analysis | Risk Register updates (priority ratings) |
| Perform Quantitative Risk Analysis | Risk Register updates (EMV, probability distributions) |
| Plan Risk Responses | Risk Register updates (responses, owners), Contingency Plans |
| Implement Risk Responses | Change Requests |
| Monitor Risks | WPI, Change Requests |

## Risk Definitions
- **Risk**: uncertain event that, if occurs, has effect on project objectives (positive or negative)
- **Threat**: negative risk (tránh)
- **Opportunity**: positive risk (tận dụng)
- **Residual Risk**: risk còn lại SAU KHI response implemented
- **Secondary Risk**: risk mới nảy sinh từ việc implement risk response
- **Trigger**: warning sign rằng risk sắp xảy ra

## Risk Appetite vs Tolerance vs Threshold
| | Risk Appetite | Risk Tolerance | Risk Threshold |
|---|---|---|---|
| **Ý nghĩa** | Overall attitude toward risk | Acceptable variation range | Point triggering action |
| **Ví dụ** | "Conservative" | ±10% budget variance | SPI < 0.9 → escalate |

## Qualitative Risk Analysis
- **Probability × Impact Matrix**: assign P (0.1–0.9) × I (Very Low → Very High) = risk score
- Kết quả: Red (High), Yellow (Medium), Green (Low)
- **Phân loại**: không cần số liệu chính xác, nhanh và subjective

## Quantitative Risk Analysis
| Tool | Mô tả |
|---|---|
| **EMV** | Probability × Monetary Impact (threats = negative, opportunities = positive) |
| **Decision Tree** | Decisions + chance nodes, calculate total EMV per alternative |
| **Monte Carlo Simulation** | Thousands of iterations → probability distribution of outcomes |
| **Sensitivity Analysis** | Tornado diagram — xác định risk có impact lớn nhất |

**EMV Example**: P=30%, Impact=-$100,000 → EMV = **-$30,000** (contingency reserve)

## Risk Register (tạo trong Identify Risks, updated liên tục)
Nội dung:
- List of identified risks
- Potential risk owners
- Potential responses
- Probability/Impact ratings (added in Qualitative)
- EMV (added in Quantitative)
- Agreed responses & owners (added in Plan Responses)

## Risk Breakdown Structure (RBS)
Hierarchical grouping của risk categories:
- Level 1: All Project Risks
- Level 2: Technical, External, Organizational, PM
- Level 3: sub-categories (helps ensure comprehensive identification)`,
      },
      {
        title: 'Risk: Response Strategies & Monitoring',
        description: 'ETMAA (threats), EESEA (opportunities), Contingency vs Workaround, Risk Audit',
        type: LessonType.text,
        order: 1,
        content: `# Risk Management — Response Strategies

## Threat Response Strategies (ETMAA)
| Strategy | Cơ chế | Ví dụ |
|---|---|---|
| **Escalate** | Vượt PM scope → escalate lên sponsor/program | Risk ảnh hưởng cả program |
| **Avoid** | Eliminate threat hoặc protect project | Thay technology, extend schedule |
| **Transfer** | Chuyển risk sang 3rd party | Insurance, Fixed-Price contract |
| **Mitigate** | Giảm probability hoặc impact xuống mức acceptable | Testing thêm, prototype, training |
| **Accept** | Active (contingency plan) hoặc Passive (acknowledge) | Low priority risks |

## Opportunity Response Strategies (EESEA)
| Strategy | Cơ chế | Parallel với Threat |
|---|---|---|
| **Escalate** | Cơ hội vượt PM scope | ↔ Escalate |
| **Exploit** | Ensure opportunity occurs (assign best person) | ↔ Avoid |
| **Enhance** | Increase probability/impact của opportunity | ↔ Mitigate |
| **Share** | Partner với 3rd party để capitalize | ↔ Transfer |
| **Accept** | Benefit nếu occurs nhưng không chủ động theo đuổi | ↔ Accept |

## Contingency Plan vs Workaround vs Fallback Plan
| | Contingency Plan | Workaround | Fallback Plan |
|---|---|---|---|
| **Khi nào** | Prepared beforehand for identified risks | Developed ON THE SPOT when risk occurs | When contingency plan fails |
| **Pre-planned?** | ✅ Có | ❌ Không | ✅ Có (Plan C) |
| **Trigger** | Risk occurs (previously identified) | Unknown risk occurs | Primary response fails |

## Monitor Risks
| Activity | Mô tả |
|---|---|
| **Risk Audit** | Evaluate effectiveness of risk responses và risk management process |
| **Risk Reviews** | Regular review của Risk Register, identify new/changed risks |
| **Technical Performance Measurement** | Compare technical accomplishments to plan |
| **Reserve Analysis** | Compare contingency reserves to remaining risk |

## Risk Audit vs Risk Review
- **Risk Audit**: đánh giá **effectiveness** của risk management process (PROCESS evaluation)
- **Risk Review**: identify **new risks**, update existing risks (ongoing IDENTIFICATION)

## Key Relationships
| Từ | Sang |
|---|---|
| Risk Triggers | Activate Contingency Plan |
| Unknown Risk occurs | Workaround implemented |
| Contingency Plan fails | Fallback Plan activated |
| Risk realized | May become Issue (Issue Log) |
| Response implemented | Creates Secondary Risk (back to Risk Register) |

## Overall Project Risk
- Khác **Individual Risks**: là tổng hợp effect của tất cả uncertainties lên project
- Không đơn thuần là sum của individual risks (có correlations)
- Chịu ảnh hưởng của: exposure to individual threats/opportunities + overall uncertainty`,
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 9. PROCUREMENT MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════════
  {
    code: 'procurement',
    name: 'Procurement Management',
    description: 'Contract types, Make-or-Buy, SOW, Bidder Conference, Close Procurement',
    icon: '🤝',
    order: 9,
    skill: Skill.doc,
    lessons: [
      {
        title: 'Procurement: Contract Types & Planning',
        description: 'FFP, FPIF, CPFF, CPIF, T&M, Make-or-Buy, SOW',
        type: LessonType.text,
        order: 0,
        content: `# Procurement Management — Contract Types & Planning

## 3 Quy Trình Procurement Management
| Quy trình | Output |
|---|---|
| Plan Procurement Management | Procurement Management Plan, Procurement SOW, Bid Documents, Source Selection Criteria |
| Conduct Procurements | Selected Sellers, Agreements |
| Control Procurements | Closed Procurements, Change Requests |

## Contract Types — Risk Allocation
$$\\text{Buyer Risk} \\underbrace{\\gets\\qquad\\qquad\\qquad}_{\\text{CPFF \\enspace CPIF \\enspace T\\&M \\enspace FPIF \\enspace FFP}} \\text{Seller Risk}$$

| Contract Type | Mô tả | Risk Chịu bởi |
|---|---|---|
| **FFP** (Firm Fixed Price) | Giá cố định; seller chịu cost overrun | **Seller nhất** |
| **FPIF** (Fixed Price Incentive Fee) | Fixed + incentive nếu under target cost; có price ceiling | Mostly Seller |
| **CPIF** (Cost Plus Incentive Fee) | Actual costs + incentive nếu under target | Shared |
| **CPAF** (Cost Plus Award Fee) | Actual costs + discretionary award fee | Mostly Buyer |
| **CPFF** (Cost Plus Fixed Fee) | Actual costs + fixed fee (không đổi theo cost) | Mostly Buyer |
| **T&M** (Time & Material) | Per hour + materials; hybrid | **Shared/Buyer khi long** |

> 💡 **FFP = most risk to seller; CPFF = most risk to buyer**

## Make-or-Buy Analysis
Xem xét để quyết định tự làm (Make) hay thuê ngoài (Buy):
- **Make**: có expertise nội bộ, sensitive IP, want control, not commercially available
- **Buy**: cost competitive, capacity constraints, need specialized expertise, commodity items

## Procurement Documents
| Document | Khi nào dùng |
|---|---|
| **RFP** (Request for Proposal) | Complex/custom work, cần technical + price solution |
| **RFQ** (Request for Quotation) | Standard/commodity items, chỉ cần price |
| **IFB** (Invitation for Bid) | Formal sealed bids, government, lowest qualified bidder wins |

## Procurement SOW Types
- **SOW** (Statement of Work): describe WHAT exactly — deliverables, specs
- **PWS** (Performance Work Statement): focus on OUTCOMES — performance standards
- **SOO** (Statement of Objectives): only GOALS — let seller propose HOW

## Source Selection Criteria
Evaluation criteria được xác định TRƯỚC khi nhận proposals:
- Technical approach/capability
- Management approach
- Financial stability
- Past performance/references
- Price/cost
- Intellectual property rights`,
      },
      {
        title: 'Procurement: Conduct, Control & Close',
        description: 'Bidder Conference, Privity, Claims, Audits, Close Procurement',
        type: LessonType.text,
        order: 1,
        content: `# Procurement: Execution, Control & Closure

## Conduct Procurements
**Key Activities**:
1. Advertise procurement opportunity
2. Hold **Bidder Conference** (Vendor Conference)
3. Receive proposals/bids
4. Evaluate proposals (Source Selection Criteria)
5. Negotiate contract
6. Award contract (Agreement/Contract)

## Bidder Conference
- **Tất cả** potential bidders gặp Buyer cùng lúc
- Q&A được chia sẻ công bằng với TẤT CẢ (không ưu tiên ai)
- Clarify ambiguities trong procurement docs
- Đảm bảo **fair competition**

## Control Procurements — Activities
| Activity | Mô tả |
|---|---|
| **Procurement Performance Review** | Review seller schedule, cost, quality vs contract |
| **Inspection** | Verify deliverables meet contract requirements |
| **Audits** | Structured procurement efficiency review |
| **Claims Administration** | Handle disputed/contested changes |
| **Payment Systems** | Process invoices per payment milestones |

## Key Concepts
| Concept | Ý nghĩa |
|---|---|
| **Privity** | Legal relationship trực tiếp giữa parties ký hợp đồng. PM KHÔNG có privity với sub-contractors |
| **Force Majeure** | Điều khoản miễn trách nhiệm khi có sự kiện bất khả kháng (thiên tai, chiến tranh) |
| **Letter of Intent** | Không phải contract; cho phép seller start preparation trước khi contract ký |
| **Indemnification** | Một bên protect bên kia khỏi losses/liabilities |
| **Confidentiality** | NDA — không tiết lộ sensitive info |

## Claims Administration
Khi có **contested changes** (buyer và seller không đồng ý):
1. Negotiation (preferred)
2. Mediation
3. Arbitration
4. Litigation (last resort, most expensive)

## Close Procurements
- Buyer verifies tất cả deliverables được accepted
- Issues **formal written notice of closure** cho seller
- Documentation: 
  - Contract file (tất cả correspondence)
  - Acceptance documentation
  - Lessons learned
- Có thể xảy ra TRƯỚC Close Project nếu contract kết thúc sớm

## Contract Termination
| Type | Ý nghĩa |
|---|---|
| **Termination for Convenience** | Buyer cancel vì reasons riêng; seller được reimburse work done + overhead |
| **Termination for Cause/Default** | Seller vi phạm contract; buyer có thể seek damages |

> Dù project bị terminate sớm, phải **formally close** procurement và document!`,
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 10. STAKEHOLDER MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════════
  {
    code: 'stakeholder',
    name: 'Stakeholder Management',
    description: 'Identify, Power/Interest Grid, Engagement Levels, Manage & Monitor',
    icon: '🌟',
    order: 10,
    skill: Skill.doc,
    lessons: [
      {
        title: 'Stakeholder: Identification & Analysis',
        description: 'Stakeholder Register, Power/Interest Grid, Salience Model, Engagement Matrix',
        type: LessonType.text,
        order: 0,
        content: `# Stakeholder Management — Identification & Analysis

## 4 Quy Trình Stakeholder Management
| Quy trình | Process Group | Output |
|---|---|---|
| Identify Stakeholders | Initiating | Stakeholder Register |
| Plan Stakeholder Engagement | Planning | Stakeholder Engagement Plan |
| Manage Stakeholder Engagement | Executing | Change Requests |
| Monitor Stakeholder Engagement | M&C | WPI, Change Requests |

## Identify Stakeholders — TIMING
> **Càng sớm càng tốt**, lý tưởng nhất trong Initiating giai đoạn, trước hoặc đồng thời với Develop Project Charter

Tại sao quan trọng:
- Unidentified stakeholders có thể emerge later và disrupt project
- Early involvement = better requirements, smoother execution
- Stakeholder removal sau khi project started = costly changes

## Stakeholder Register — Nội dung
1. **Identification Info**: name, position, location, organization, contact
2. **Assessment Info**: requirements, expectations, potential impact, phase of greatest interest
3. **Classification**: internal/external, supporter/neutral/resistor, power/interest level

## Analysis Tools

### Power/Interest Grid
| | High Interest | Low Interest |
|---|---|---|
| **High Power** | **Manage Closely** | **Keep Satisfied** |
| **Low Power** | **Keep Informed** | **Monitor** |

### Salience Model (3 yếu tố)
- **Power**: ability to impose will
- **Urgency**: time-sensitive claims
- **Legitimacy**: appropriate involvement

Combination của 3 yếu tố tạo ra 7 stakeholder types (Definitive = có cả 3)

## 5 Stakeholder Engagement Levels
| Level | Mô tả |
|---|---|
| **Unaware** | Không biết project/impacts |
| **Resistant** | Biết nhưng phản đối |
| **Neutral** | Biết, không ủng hộ cũng không phản đối |
| **Supportive** | Biết project và ủng hộ |
| **Leading** | Biết, ủng hộ và chủ động thúc đẩy ⭐ |

## Stakeholder Engagement Assessment Matrix
- Ghi lại: **C** (Current level) và **D** (Desired level) cho mỗi stakeholder
- Gap (C ≠ D) = cần action
- Focus effort vào stakeholders có gap lớn nhất và power cao nhất`,
      },
      {
        title: 'Stakeholder: Engagement Strategies & Management',
        description: 'Manage vs Monitor, Resistant stakeholders, Issue Log, ground rules',
        type: LessonType.text,
        order: 1,
        content: `# Stakeholder: Engagement & Management Strategies

## Stakeholder Engagement Plan
Output của Plan Stakeholder Engagement. Bao gồm:
- Engagement strategies cho mỗi stakeholder/group
- Key messages cần communicate
- Methods để tăng support/giảm resistance
- Timing của engagement activities
- Metrics để đánh giá effectiveness

## Manage Stakeholder Engagement — Key Activities
| Activity | Mục đích |
|---|---|
| Communications | Theo Communications Management Plan |
| Conflict Resolution | Address concerns, find common ground |
| Issue Resolution | Track và resolve issues trong Issue Log |
| Change Management | Process change requests through PICC |
| Relationship Building | Build trust through transparency |

## Dealing with Resistant Stakeholders
**Move từ Resistant → Neutral/Supportive**:
1. **Understand root cause**: tại sao họ phản đối? (fear of change, competing priorities?)
2. **One-on-one meetings**: safer environment để express concerns
3. **Provide information**: benefits, mitigation of their concerns
4. **Involve in decisions**: quyết định ảnh hưởng đến họ
5. **Find shared interests**: common goal
6. Nếu cần → escalate lên sponsor

## Issue Log vs Risk Register
| | Issue Log | Risk Register |
|---|---|---|
| **Nội dung** | Issues đang xảy ra | Risks có thể xảy ra |
| **Status** | Active, In Progress, Resolved | Identified, Analyzing, Responding |
| **Khi nào** | Issue has materialized | Risk has not yet occurred |

> Issues thường xuất phát từ risks không được xử lý, hoặc từ stakeholder concerns

## Monitor Stakeholder Engagement
Liên tục đánh giá:
- Stakeholder relationships và engagement levels
- Effectiveness của communication và engagement strategies
- New/changed stakeholders
- Nếu strategies không hiệu quả → update Stakeholder Engagement Plan

## Key Interpersonal Skills cho Stakeholder Management
- **Active Listening**
- **Building Trust** (consistency + transparency)
- **Political Awareness** (formal/informal power structures)
- **Cultural Awareness** (tailor approach per culture)
- **Conflict Resolution**
- **Emotional Intelligence**

## Stakeholder Register Update Triggers
- New stakeholder identified
- Stakeholder exits project
- Engagement level changes
- Role/responsibility changes
- New information about interests discovered

## Ground Rules
- Clear expectations về acceptable behaviors
- Set TOGETHER by team → increases accountability
- Reduces conflicts (expectations clear from start)
- Examples: meeting punctuality, communication response times, decision-making process`,
      },
    ],
  },
];

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding PMP Learning Content (Part 3/3)\n');

  // 1. Tạo hoặc tìm Level PMP
  let pmpLevel = await prisma.level.findFirst({ where: { subject: Subject.PMP } });
  if (!pmpLevel) {
    pmpLevel = await prisma.level.create({
      data: {
        code: 'PMP',
        name: 'PMP Certification',
        description: 'Project Management Professional — PMBOK 6 Study Module',
        order: 99,
        subject: Subject.PMP,
      },
    });
    console.log(`✅ Created Level: PMP (id: ${pmpLevel.id})`);
  } else {
    console.log(`⏭  Level PMP already exists (id: ${pmpLevel.id})`);
  }

  let totalCategories = 0;
  let totalLessons = 0;

  // 2. Tạo Categories và Lessons
  for (const catDef of CATEGORIES) {
    // Tìm hoặc tạo category
    let category = await prisma.learningCategory.findFirst({
      where: { levelId: pmpLevel.id, name: catDef.name },
    });

    if (!category) {
      category = await prisma.learningCategory.create({
        data: {
          levelId: pmpLevel.id,
          skill: catDef.skill,
          name: catDef.name,
          description: catDef.description,
          icon: catDef.icon,
          order: catDef.order,
        },
      });
      process.stdout.write(`  ✅ Category: ${catDef.name}\n`);
      totalCategories++;
    } else {
      process.stdout.write(`  ⏭  Category exists: ${catDef.name}\n`);
    }

    // Tạo Lessons trong category
    for (const lessonDef of catDef.lessons) {
      const existingLesson = await prisma.learningLesson.findFirst({
        where: { categoryId: category.id, title: lessonDef.title },
      });
      if (!existingLesson) {
        await prisma.learningLesson.create({
          data: {
            categoryId: category.id,
            title: lessonDef.title,
            description: lessonDef.description,
            content: lessonDef.content,
            type: lessonDef.type,
            order: lessonDef.order,
          },
        });
        process.stdout.write(`      ✓ Lesson: ${lessonDef.title}\n`);
        totalLessons++;
      } else {
        process.stdout.write(`      ○ Lesson exists: ${lessonDef.title}\n`);
      }
    }
  }

  console.log(`\n📊 Kết quả Part 3:`);
  console.log(`   ✅ Categories tạo mới : ${totalCategories}`);
  console.log(`   ✅ Lessons tạo mới    : ${totalLessons}`);
  console.log(`\n🎉 Hoàn thành toàn bộ 3 phần seeding PMP!`);
  console.log(`\n📚 Tổng kết hệ thống PMP:`);
  console.log(`   • 10 Knowledge Areas + 5 Process Groups + 49 Processes (với đầy đủ ITTOs)`);
  console.log(`   • 225 câu hỏi thi thử (25 gốc + 200 mới)`);
  console.log(`   • 11 Categories học lý thuyết + 22 Bài học Markdown chi tiết`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
