'use client';
import Link from 'next/link';
import { FaArrowRight, FaArrowLeft, FaLayerGroup } from 'react-icons/fa6';

const KNOWLEDGE_AREAS = [
  {
    code: 'integration',
    name: 'Integration Management',
    nameVi: 'Quản lý Tích hợp',
    icon: '🔗',
    color: '#6C5CE7',
    processes: [
      { group: 'Initiating',   name: 'Develop Project Charter' },
      { group: 'Planning',     name: 'Develop Project Management Plan' },
      { group: 'Executing',    name: 'Direct and Manage Project Work' },
      { group: 'Executing',    name: 'Manage Project Knowledge' },
      { group: 'Monitoring',   name: 'Monitor and Control Project Work' },
      { group: 'Monitoring',   name: 'Perform Integrated Change Control' },
      { group: 'Closing',      name: 'Close Project or Phase' },
    ],
    keyPoints: [
      'Project Charter chính thức phê duyệt dự án và trao quyền cho PM',
      'Project Management Plan là tài liệu tổng hợp tất cả kế hoạch phụ',
      'Change Control Board phê duyệt/từ chối các thay đổi',
      'Lessons Learned được thu thập suốt dự án, không chỉ ở cuối',
    ],
  },
  {
    code: 'scope',
    name: 'Scope Management',
    nameVi: 'Quản lý Phạm vi',
    icon: '📋',
    color: '#0984E3',
    processes: [
      { group: 'Planning',   name: 'Plan Scope Management' },
      { group: 'Planning',   name: 'Collect Requirements' },
      { group: 'Planning',   name: 'Define Scope' },
      { group: 'Planning',   name: 'Create WBS' },
      { group: 'Monitoring', name: 'Validate Scope' },
      { group: 'Monitoring', name: 'Control Scope' },
    ],
    keyPoints: [
      'WBS (Work Breakdown Structure) phân chia công việc thành các gói nhỏ nhất (Work Packages)',
      'Scope Creep là việc phạm vi mở rộng không kiểm soát — cần tránh',
      'Validate Scope là khách hàng chấp nhận deliverables (không phải kiểm tra chất lượng)',
      'Requirements phải được thu thập từ stakeholders và được document hóa',
    ],
  },
  {
    code: 'schedule',
    name: 'Schedule Management',
    nameVi: 'Quản lý Thời gian',
    icon: '📅',
    color: '#00B894',
    processes: [
      { group: 'Planning',   name: 'Plan Schedule Management' },
      { group: 'Planning',   name: 'Define Activities' },
      { group: 'Planning',   name: 'Sequence Activities' },
      { group: 'Planning',   name: 'Estimate Activity Durations' },
      { group: 'Planning',   name: 'Develop Schedule' },
      { group: 'Monitoring', name: 'Control Schedule' },
    ],
    keyPoints: [
      'Critical Path Method (CPM): xác định chuỗi hoạt động dài nhất quyết định thời gian dự án',
      'Float/Slack: thời gian dự trữ của một hoạt động trước khi ảnh hưởng đến dự án',
      'Fast Tracking: thực hiện các hoạt động song song để rút ngắn tiến độ',
      'Crashing: bổ sung nguồn lực để rút ngắn tiến độ, nhưng tăng chi phí',
    ],
  },
  {
    code: 'cost',
    name: 'Cost Management',
    nameVi: 'Quản lý Chi phí',
    icon: '💰',
    color: '#F6AD55',
    processes: [
      { group: 'Planning',   name: 'Plan Cost Management' },
      { group: 'Planning',   name: 'Estimate Costs' },
      { group: 'Planning',   name: 'Determine Budget' },
      { group: 'Monitoring', name: 'Control Costs' },
    ],
    keyPoints: [
      'Earned Value Management (EVM): theo dõi hiệu quả chi phí và tiến độ',
      'CPI (Cost Performance Index) = EV/AC: > 1 là dưới ngân sách, < 1 là vượt ngân sách',
      'SPI (Schedule Performance Index) = EV/PV: > 1 là đúng tiến độ',
      'BAC (Budget at Completion): tổng ngân sách được phê duyệt cho dự án',
    ],
  },
  {
    code: 'quality',
    name: 'Quality Management',
    nameVi: 'Quản lý Chất lượng',
    icon: '⭐',
    color: '#E17055',
    processes: [
      { group: 'Planning',   name: 'Plan Quality Management' },
      { group: 'Executing',  name: 'Manage Quality' },
      { group: 'Monitoring', name: 'Control Quality' },
    ],
    keyPoints: [
      'Quality Assurance (QA): quy trình đảm bảo chất lượng — phòng ngừa lỗi',
      'Quality Control (QC): kiểm tra sản phẩm để phát hiện lỗi',
      'Cost of Quality bao gồm: Cost of Conformance (đào tạo, testing) và Cost of Nonconformance (rework, warranty)',
      'Gold Plating là thêm tính năng ngoài yêu cầu — không được khuyến khích trong PMBOK',
    ],
  },
  {
    code: 'resource',
    name: 'Resource Management',
    nameVi: 'Quản lý Nguồn lực',
    icon: '👥',
    color: '#A29BFE',
    processes: [
      { group: 'Planning',   name: 'Plan Resource Management' },
      { group: 'Planning',   name: 'Estimate Activity Resources' },
      { group: 'Executing',  name: 'Acquire Resources' },
      { group: 'Executing',  name: 'Develop Team' },
      { group: 'Executing',  name: 'Manage Team' },
      { group: 'Monitoring', name: 'Control Resources' },
    ],
    keyPoints: [
      'Tuckman Ladder: Forming → Storming → Norming → Performing → Adjourning',
      'Motivation Theories: Maslow, Herzberg, McGregor (Theory X/Y), McClelland',
      'RAM (Responsibility Assignment Matrix): xác định trách nhiệm cho từng thành viên',
      'Virtual Teams: cần quản lý đặc biệt về giao tiếp và hợp tác từ xa',
    ],
  },
  {
    code: 'communications',
    name: 'Communications Management',
    nameVi: 'Quản lý Truyền thông',
    icon: '📢',
    color: '#74B9FF',
    processes: [
      { group: 'Planning',   name: 'Plan Communications Management' },
      { group: 'Executing',  name: 'Manage Communications' },
      { group: 'Monitoring', name: 'Monitor Communications' },
    ],
    keyPoints: [
      'Số kênh giao tiếp = n(n-1)/2 (n là số thành viên)',
      'PM dành ~90% thời gian cho giao tiếp',
      'Communication Methods: Interactive, Push, Pull',
      'Stakeholder Communication Requirements phải được xác định trong Communication Plan',
    ],
  },
  {
    code: 'risk',
    name: 'Risk Management',
    nameVi: 'Quản lý Rủi ro',
    icon: '⚠️',
    color: '#FF7675',
    processes: [
      { group: 'Planning',   name: 'Plan Risk Management' },
      { group: 'Planning',   name: 'Identify Risks' },
      { group: 'Planning',   name: 'Perform Qualitative Risk Analysis' },
      { group: 'Planning',   name: 'Perform Quantitative Risk Analysis' },
      { group: 'Planning',   name: 'Plan Risk Responses' },
      { group: 'Executing',  name: 'Implement Risk Responses' },
      { group: 'Monitoring', name: 'Monitor Risks' },
    ],
    keyPoints: [
      'Risk có thể là cơ hội (positive) hoặc mối đe dọa (negative)',
      'Threat responses: Avoid, Transfer, Mitigate, Accept',
      'Opportunity responses: Exploit, Share, Enhance, Accept',
      'Risk Register: tài liệu ghi lại tất cả rủi ro đã xác định',
    ],
  },
  {
    code: 'procurement',
    name: 'Procurement Management',
    nameVi: 'Quản lý Mua sắm',
    icon: '🛒',
    color: '#55EFC4',
    processes: [
      { group: 'Planning',   name: 'Plan Procurement Management' },
      { group: 'Executing',  name: 'Conduct Procurements' },
      { group: 'Monitoring', name: 'Control Procurements' },
    ],
    keyPoints: [
      'Fixed-Price Contracts: rủi ro cao cho seller nếu chi phí tăng',
      'Cost-Reimbursable Contracts: buyer chịu rủi ro chi phí cao hơn dự kiến',
      'Time & Material: thường dùng cho hợp đồng nhân lực',
      'SOW (Statement of Work): mô tả chi tiết sản phẩm/dịch vụ cần mua',
    ],
  },
  {
    code: 'stakeholder',
    name: 'Stakeholder Management',
    nameVi: 'Quản lý Các bên liên quan',
    icon: '🤝',
    color: '#FD79A8',
    processes: [
      { group: 'Initiating', name: 'Identify Stakeholders' },
      { group: 'Planning',   name: 'Plan Stakeholder Engagement' },
      { group: 'Executing',  name: 'Manage Stakeholder Engagement' },
      { group: 'Monitoring', name: 'Monitor Stakeholder Engagement' },
    ],
    keyPoints: [
      'Power/Interest Grid: phân loại stakeholders theo quyền lực và mức độ quan tâm',
      'Stakeholder Register: ghi lại thông tin về tất cả stakeholders',
      'Unaware → Resistant → Neutral → Supportive → Leading: thang đo sự tham gia',
      'Identify Stakeholders phải thực hiện sớm nhất, ngay từ Initiating',
    ],
  },
];

const GROUP_COLORS: Record<string, string> = {
  Initiating: '#6C5CE7',
  Planning:   '#0984E3',
  Executing:  '#00B894',
  Monitoring: '#E17055',
  Closing:    '#FDCB6E',
};

export default function KnowledgeAreasPage() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/pmp"
              className="flex items-center gap-1.5 text-sm font-medium transition-all"
              style={{ color: 'var(--text-muted)' }}>
              <FaArrowLeft size={12} /> PMP
            </Link>
            <span style={{ color: 'var(--text-muted)' }}>›</span>
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Knowledge Areas</span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--text-primary)' }}>
                10 Knowledge Areas (PMBOK 6)
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Học từng Knowledge Area với quy trình, ITTO và các điểm mấu chốt cần nhớ.
              </p>
            </div>
            <Link href="/pmp/exam"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold text-white shrink-0"
              style={{ background: '#2b6cb0' }}>
              <FaLayerGroup size={13} /> Luyện thi PMP
            </Link>
          </div>
          {/* Process group legend */}
          <div className="flex flex-wrap gap-2 mt-4">
            {Object.entries(GROUP_COLORS).map(([name, color]) => (
              <span key={name} className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-xl"
                style={{ background: `${color}18`, color }}>
                <span className="h-2 w-2 rounded-full inline-block" style={{ background: color }} />
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {KNOWLEDGE_AREAS.map(ka => (
          <div key={ka.code} className="card border rounded-3xl overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            {/* KA Header */}
            <div className="p-5 pb-4" style={{ borderBottom: `3px solid ${ka.color}25` }}>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl">{ka.icon}</span>
                <div>
                  <h2 className="font-extrabold text-base leading-tight" style={{ color: 'var(--text-primary)' }}>
                    {ka.nameVi}
                  </h2>
                  <div className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>{ka.name}</div>
                </div>
                <span className="ml-auto text-xs font-bold px-2.5 py-1 rounded-xl"
                  style={{ background: `${ka.color}18`, color: ka.color }}>
                  {ka.processes.length} processes
                </span>
              </div>
            </div>

            {/* Processes */}
            <div className="px-5 py-3">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] mb-2" style={{ color: 'var(--text-muted)' }}>
                Quy trình
              </div>
              <div className="flex flex-col gap-1.5 mb-4">
                {ka.processes.map((p, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ background: GROUP_COLORS[p.group] ?? '#999' }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{p.name}</span>
                    <span className="ml-auto text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>{p.group}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Points */}
            <div className="px-5 pb-5">
              <div className="rounded-2xl p-4" style={{ background: 'var(--bg-muted)' }}>
                <div className="text-xs font-semibold uppercase tracking-[0.12em] mb-2" style={{ color: 'var(--text-muted)' }}>
                  Điểm mấu chốt
                </div>
                <div className="flex flex-col gap-2">
                  {ka.keyPoints.map((kp, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-xs mt-0.5 shrink-0 font-bold" style={{ color: ka.color }}>▸</span>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{kp}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
