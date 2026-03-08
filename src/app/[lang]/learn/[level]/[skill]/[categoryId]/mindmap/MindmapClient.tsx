'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  Node, Edge, Background, Controls, MiniMap,
  Handle, Position, NodeProps, BackgroundVariant,
  useNodesState, useEdgesState, ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import Link from 'next/link';
import {
  FaArrowLeft, FaXmark, FaChevronRight, FaChevronDown,
  FaCircleDot, FaArrowsLeftRight, FaArrowsUpDown,
} from 'react-icons/fa6';

export type LayoutDir = 'lr' | 'tb' | 'radial';

export interface MindmapItem {
  id: string; term: string; pronunciation: string | null;
  meanings: { language: string; meaning: string }[]; type: string;
}
export interface MindmapLesson {
  id: string; title: string; type: string; items: MindmapItem[];
}
export interface MindmapCategory {
  id: string; name: string; skill: string; level: string;
}
interface Props {
  category: MindmapCategory; lessons: MindmapLesson[];
  level: string; skill: string;
}

//  Theme 
const T = {
  bg: '#0F1117',
  surface: '#1A1D2E',
  surfaceHover: '#22263A',
  border: '#2D3251',
  root: '#4F46E5',
  rootText: '#fff',
  muted: '#6B7280',
  text: '#E5E7EB',
  textDim: '#9CA3AF',
};

const LESSON_ACCENT: Record<string, string> = {
  vocab: '#3B82F6', grammar: '#8B5CF6', audio: '#10B981', text: '#64748B',
};
const ITEM_ACCENT: Record<string, { border: string; glyph: string }> = {
  vocab:     { border: '#3B82F6', glyph: '#60A5FA' },
  character: { border: '#EF4444', glyph: '#F87171' },
  grammar:   { border: '#8B5CF6', glyph: '#A78BFA' },
  example:   { border: '#10B981', glyph: '#34D399' },
  phrase:    { border: '#F59E0B', glyph: '#FBBF24' },
  tone:      { border: '#06B6D4', glyph: '#22D3EE' },
  idiom:     { border: '#7C3AED', glyph: '#A78BFA' },
};

const HS: React.CSSProperties = { background: 'transparent', border: 'none', width: 1, height: 1 };

//  Root node 
function RootNode({ data }: NodeProps) {
  return (
    <div style={{
      background: T.root, color: T.rootText,
      borderRadius: 12, padding: '12px 22px',
      fontSize: 14, fontWeight: 700,
      boxShadow: '0 0 0 1px rgba(255,255,255,0.1), 0 8px 32px rgba(79,70,229,0.5)',
      minWidth: 140, textAlign: 'center', userSelect: 'none',
    }}>
      <Handle type="source" position={Position.Right}  id="r" style={HS} />
      <Handle type="source" position={Position.Bottom} id="b" style={HS} />
      <div style={{ fontSize: 10, opacity: 0.65, marginBottom: 4, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Chủ đề</div>
      {data.label}
    </div>
  );
}

//  Lesson node 
function LessonNode({ data }: NodeProps) {
  const accent = LESSON_ACCENT[data.type] ?? LESSON_ACCENT.text;
  const isCollapsed: boolean = data.collapsed ?? false;
  return (
    <div style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderLeft: `3px solid ${accent}`,
      borderRadius: 8, padding: '9px 14px',
      fontSize: 12, fontWeight: 600, color: T.text,
      minWidth: 150, maxWidth: 190,
      boxShadow: '0 2px 12px rgba(0,0,0,0.35)',
      userSelect: 'none', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 7,
    }}>
      <Handle type="target" position={Position.Left}   id="l" style={HS} />
      <Handle type="target" position={Position.Top}    id="t" style={HS} />
      <Handle type="source" position={Position.Right}  id="r" style={HS} />
      <Handle type="source" position={Position.Bottom} id="b" style={HS} />
      <div style={{ flex: 1, lineHeight: 1.35 }}>{data.label}</div>
      {data.count > 0 && (
        <span style={{
          fontSize: 10, color: T.muted, background: T.bg,
          borderRadius: 12, padding: '1px 6px', flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 3,
        }}>
          {isCollapsed ? <FaChevronRight size={8} /> : <FaChevronDown size={8} />}
          {data.count}
        </span>
      )}
    </div>
  );
}

//  Item node 
function ItemNode({ data }: NodeProps) {
  const ac = ITEM_ACCENT[data.type] ?? ITEM_ACCENT.vocab;
  const meaning: string = data.meanings?.[0]?.meaning ?? '';
  return (
    <div style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderLeft: `2px solid ${ac.border}`,
      borderRadius: 6, padding: '6px 11px',
      minWidth: 120, maxWidth: 160,
      boxShadow: '0 1px 8px rgba(0,0,0,0.3)',
      userSelect: 'none', cursor: 'pointer',
      transition: 'border-color 0.15s',
    }}>
      <Handle type="target" position={Position.Left}  id="l" style={HS} />
      <Handle type="target" position={Position.Top}   id="t" style={HS} />
      <div style={{ fontWeight: 800, color: ac.glyph, fontSize: 16, fontFamily: '"Noto Sans JP", serif', lineHeight: 1.1 }}>
        {data.japanese}
      </div>
      {data.reading && (
        <div style={{ color: T.textDim, fontSize: 10, marginTop: 2 }}>{data.reading}</div>
      )}
      <div style={{
        color: T.muted, fontSize: 10, marginTop: 4, lineHeight: 1.4,
        borderTop: `1px solid ${T.border}`, paddingTop: 4,
      }}>
        {meaning.length > 30 ? meaning.slice(0, 28) + '' : meaning}
      </div>
    </div>
  );
}

const nodeTypes = { rootNode: RootNode, lessonNode: LessonNode, itemNode: ItemNode };

//  Tree layout: LR 
const COL_ROOT = 0;
const COL_LESSON = 240;
const COL_ITEM = 470;
const ITEM_H = 70;    // vertical slot per item node
const LESSON_PAD = 20; // extra padding between lesson groups

function buildLR(
  category: MindmapCategory,
  lessons: MindmapLesson[],
  collapsed: Set<string>,
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // First pass: compute total height needed
  let totalHeight = 0;
  const lessonMeta: { lesson: MindmapLesson; startY: number; height: number }[] = [];

  for (const lesson of lessons) {
    const isCollapsed = collapsed.has(lesson.id);
    const itemCount = isCollapsed ? 0 : Math.min(lesson.items.length, 10);
    const h = isCollapsed ? ITEM_H : Math.max(ITEM_H, itemCount * ITEM_H);
    lessonMeta.push({ lesson, startY: totalHeight, height: h });
    totalHeight += h + LESSON_PAD;
  }
  totalHeight -= LESSON_PAD;

  const centerY = totalHeight / 2;

  // Root node
  nodes.push({
    id: 'root', type: 'rootNode',
    position: { x: COL_ROOT, y: centerY - 28 },
    data: { label: category.name },
  });

  lessonMeta.forEach(({ lesson, startY, height }) => {
    const isCollapsed = collapsed.has(lesson.id);
    const lessonCY = startY + height / 2;

    nodes.push({
      id: `les-${lesson.id}`, type: 'lessonNode',
      position: { x: COL_LESSON, y: lessonCY - 24 },
      data: { label: lesson.title, type: lesson.type, count: lesson.items.length, collapsed: isCollapsed },
    });
    edges.push({
      id: `e-root-${lesson.id}`,
      source: 'root', sourceHandle: 'r',
      target: `les-${lesson.id}`, targetHandle: 'l',
      type: 'smoothstep',
      style: { stroke: '#4F46E5', strokeWidth: 1.5, opacity: 0.7 },
    });

    if (!isCollapsed) {
      const visible = lesson.items.slice(0, 10);
      const itemCount = visible.length;
      visible.forEach((item, ii) => {
        const itemY = startY + (ii / Math.max(1, itemCount - 1)) * (height - ITEM_H * 0.8);
        nodes.push({
          id: `item-${item.id}`, type: 'itemNode',
          position: { x: COL_ITEM, y: itemY },
          data: item,
        });
        edges.push({
          id: `e-${lesson.id}-${item.id}`,
          source: `les-${lesson.id}`, sourceHandle: 'r',
          target: `item-${item.id}`, targetHandle: 'l',
          type: 'smoothstep',
          style: { stroke: LESSON_ACCENT[lesson.type] ?? '#64748B', strokeWidth: 1, opacity: 0.45 },
        });
      });

      const extra = lesson.items.length - 10;
      if (extra > 0) {
        const moreY = startY + height - 12;
        nodes.push({
          id: `more-${lesson.id}`, type: 'default',
          position: { x: COL_ITEM + 5, y: moreY },
          data: { label: `+${extra} more` },
          style: {
            background: T.surface, border: `1px dashed ${T.border}`,
            borderRadius: 20, fontSize: 10, color: T.muted,
            padding: '2px 10px', fontWeight: 600, width: 'auto',
          },
        });
        edges.push({
          id: `e-${lesson.id}-more`,
          source: `les-${lesson.id}`, target: `more-${lesson.id}`,
          style: { stroke: T.border, strokeWidth: 1, strokeDasharray: '4 3' },
        });
      }
    }
  });

  return { nodes, edges };
}

//  Tree layout: TB 
function buildTB(
  category: MindmapCategory,
  lessons: MindmapLesson[],
  collapsed: Set<string>,
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const ROW_ROOT = 0;
  const ROW_LESSON = 140;
  const ROW_ITEM = 280;
  const LESSON_W = 200;
  const ITEM_W = 155;
  const ITEM_PAD = 12;

  let totalWidth = 0;
  type LMeta = { lesson: MindmapLesson; startX: number; width: number };
  const lessonMeta: LMeta[] = [];

  for (const lesson of lessons) {
    const isCollapsed = collapsed.has(lesson.id);
    const itemCount = isCollapsed ? 0 : Math.min(lesson.items.length, 8);
    const w = isCollapsed ? LESSON_W : Math.max(LESSON_W, itemCount * (ITEM_W + ITEM_PAD) - ITEM_PAD);
    lessonMeta.push({ lesson, startX: totalWidth, width: w });
    totalWidth += w + 24;
  }
  totalWidth -= 24;

  const centerX = totalWidth / 2;

  nodes.push({
    id: 'root', type: 'rootNode',
    position: { x: centerX - 70, y: ROW_ROOT },
    data: { label: category.name },
  });

  lessonMeta.forEach(({ lesson, startX, width }) => {
    const isCollapsed = collapsed.has(lesson.id);
    const lessonCX = startX + width / 2;

    nodes.push({
      id: `les-${lesson.id}`, type: 'lessonNode',
      position: { x: lessonCX - 80, y: ROW_LESSON },
      data: { label: lesson.title, type: lesson.type, count: lesson.items.length, collapsed: isCollapsed },
    });
    edges.push({
      id: `e-root-${lesson.id}`,
      source: 'root', sourceHandle: 'b',
      target: `les-${lesson.id}`, targetHandle: 't',
      type: 'smoothstep',
      style: { stroke: '#4F46E5', strokeWidth: 1.5, opacity: 0.7 },
    });

    if (!isCollapsed) {
      const visible = lesson.items.slice(0, 8);
      visible.forEach((item, ii) => {
        const itemX = startX + ii * (ITEM_W + ITEM_PAD);
        nodes.push({
          id: `item-${item.id}`, type: 'itemNode',
          position: { x: itemX, y: ROW_ITEM },
          data: item,
        });
        edges.push({
          id: `e-${lesson.id}-${item.id}`,
          source: `les-${lesson.id}`, sourceHandle: 'b',
          target: `item-${item.id}`, targetHandle: 't',
          type: 'smoothstep',
          style: { stroke: LESSON_ACCENT[lesson.type] ?? '#64748B', strokeWidth: 1, opacity: 0.45 },
        });
      });

      const extra = lesson.items.length - 8;
      if (extra > 0) {
        nodes.push({
          id: `more-${lesson.id}`, type: 'default',
          position: { x: startX + width - 50, y: ROW_ITEM + 10 },
          data: { label: `+${extra}` },
          style: { background: T.surface, border: `1px dashed ${T.border}`, borderRadius: 20, fontSize: 10, color: T.muted, padding: '2px 8px', fontWeight: 600, width: 'auto' },
        });
        edges.push({
          id: `e-${lesson.id}-more`,
          source: `les-${lesson.id}`, target: `more-${lesson.id}`,
          style: { stroke: T.border, strokeWidth: 1, strokeDasharray: '4 3' },
        });
      }
    }
  });

  return { nodes, edges };
}

//  Radial layout 
function buildRadial(
  category: MindmapCategory,
  lessons: MindmapLesson[],
  collapsed: Set<string>,
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const LR = 320, IR = 200;
  const AO = -Math.PI / 2;

  nodes.push({ id: 'root', type: 'rootNode', position: { x: 0, y: 0 }, data: { label: category.name } });
  if (lessons.length === 0) return { nodes, edges };

  lessons.forEach((lesson, li) => {
    const angle = AO + (li / lessons.length) * 2 * Math.PI;
    const lx = LR * Math.cos(angle);
    const ly = LR * Math.sin(angle);
    const isCollapsed = collapsed.has(lesson.id);

    nodes.push({
      id: `les-${lesson.id}`, type: 'lessonNode',
      position: { x: lx - 80, y: ly - 24 },
      data: { label: lesson.title, type: lesson.type, count: lesson.items.length, collapsed: isCollapsed },
    });
    edges.push({
      id: `e-root-${lesson.id}`, source: 'root', target: `les-${lesson.id}`,
      type: 'smoothstep', style: { stroke: '#4F46E5', strokeWidth: 1.5, opacity: 0.7 },
    });

    if (!isCollapsed) {
      const visible = lesson.items.slice(0, 8);
      const itemCount = visible.length;
      visible.forEach((item, ii) => {
        const spread = Math.max(0.4, Math.min(Math.PI * 0.7, itemCount * 0.2));
        const ia = angle - spread / 2 + (itemCount > 1 ? ii / (itemCount - 1) * spread : 0);
        nodes.push({
          id: `item-${item.id}`, type: 'itemNode',
          position: { x: lx + IR * Math.cos(ia) - 65, y: ly + IR * Math.sin(ia) - 40 },
          data: item,
        });
        edges.push({
          id: `e-${lesson.id}-${item.id}`,
          source: `les-${lesson.id}`, target: `item-${item.id}`,
          type: 'smoothstep', style: { stroke: LESSON_ACCENT[lesson.type] ?? '#64748B', strokeWidth: 1, opacity: 0.45 },
        });
      });
    }
  });

  return { nodes, edges };
}

function buildLayout(
  category: MindmapCategory,
  lessons: MindmapLesson[],
  dir: LayoutDir,
  collapsed: Set<string>,
) {
  if (dir === 'tb')     return buildTB(category, lessons, collapsed);
  if (dir === 'radial') return buildRadial(category, lessons, collapsed);
  return buildLR(category, lessons, collapsed);
}

//  Item detail popup 
function ItemDetailPopup({ item, onClose }: { item: MindmapItem; onClose: () => void }) {
  const ac = ITEM_ACCENT[item.type] ?? ITEM_ACCENT.vocab;
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div
        style={{ background: T.surface, border: `1px solid ${ac.border}`, borderRadius: 16, padding: '28px 32px', minWidth: 300, maxWidth: 400, boxShadow: `0 0 0 1px ${ac.border}33, 0 24px 64px rgba(0,0,0,0.6)`, position: 'relative' }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: T.bg, border: `1px solid ${T.border}`, borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: T.muted }}>
          <FaXmark size={11} />
        </button>
        <div style={{ fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 20, marginBottom: 14, display: 'inline-block', background: T.bg, color: ac.glyph, border: `1px solid ${ac.border}`, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {item.type}
        </div>
        <div style={{ fontSize: 40, fontWeight: 800, color: ac.glyph, fontFamily: '"Noto Sans JP", serif', lineHeight: 1.1, marginBottom: 6 }}>
          {item.term}
        </div>
        {item.pronunciation && (
          <div style={{ fontSize: 18, color: T.textDim, marginBottom: 12, fontFamily: '"Noto Sans JP", serif' }}>{item.pronunciation}</div>
        )}
        <div style={{ height: 1, background: T.border, margin: '12px 0' }} />
        <div style={{ fontSize: 16, color: T.text, lineHeight: 1.65, fontWeight: 500 }}>{item.meanings?.[0]?.meaning ?? ''}</div>
      </div>
    </div>
  );
}

//  Main 
function MindmapInner({ category, lessons, level, skill }: Props) {
  const [filterType,   setFilterType]   = useState('all');
  const [layoutDir,    setLayoutDir]    = useState<LayoutDir>('lr');
  const [collapsed,    setCollapsed]    = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<MindmapItem | null>(null);

  const filteredLessons = useMemo(
    () => filterType === 'all' ? lessons : lessons.filter(l => l.type === filterType),
    [lessons, filterType],
  );

  const layout = useMemo(
    () => buildLayout(category, filteredLessons, layoutDir, collapsed),
    [category, filteredLessons, layoutDir, collapsed],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layout.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layout.edges);

  useEffect(() => {
    setNodes(layout.nodes);
    setEdges(layout.edges);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.type === 'lessonNode') {
      const lessonId = node.id.replace(/^les-/, '');
      setCollapsed(prev => {
        const next = new Set(prev);
        if (next.has(lessonId)) next.delete(lessonId); else next.add(lessonId);
        return next;
      });
    } else if (node.type === 'itemNode') {
      setSelectedItem(node.data as MindmapItem);
    }
  }, []);

  const lessonTypes = useMemo(() => [...new Set(lessons.map(l => l.type))], [lessons]);
  const totalItems  = lessons.reduce((s, l) => s + l.items.length, 0);

  const LAYOUT_BTNS: { dir: LayoutDir; icon: React.ReactNode; label: string }[] = [
    { dir: 'lr',     icon: <FaArrowsLeftRight size={10} />, label: 'LR' },
    { dir: 'tb',     icon: <FaArrowsUpDown    size={10} />, label: 'TB' },
    { dir: 'radial', icon: <FaCircleDot       size={10} />, label: 'Xoay' },
  ];

  const btnStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 4,
    padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
    border: `1px solid ${active ? '#4F46E5' : T.border}`,
    cursor: 'pointer', background: active ? '#4F46E5' : T.surface,
    color: active ? '#fff' : T.textDim, transition: 'all 0.15s',
  });

  const filterBtnStyle = (active: boolean, type: string): React.CSSProperties => {
    const accent = LESSON_ACCENT[type];
    return {
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
      border: `1px solid ${active && accent ? accent : T.border}`,
      cursor: 'pointer',
      background: active ? (accent ? accent + '22' : T.surface) : 'transparent',
      color: active ? (accent ?? T.text) : T.muted,
      transition: 'all 0.15s',
    };
  };

  const divider = <div style={{ width: 1, height: 16, background: T.border }} />;

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 56px)', position: 'relative', background: T.bg }}>

      {/*  Top bar  */}
      <div style={{
        position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
        zIndex: 20, display: 'flex', alignItems: 'center', gap: 8,
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: 10, padding: '7px 14px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)', pointerEvents: 'all',
        maxWidth: 'calc(100vw - 260px)', flexWrap: 'wrap',
      }}>
        {/* Layout */}
        {LAYOUT_BTNS.map(b => (
          <button key={b.dir} onClick={() => { setLayoutDir(b.dir); setCollapsed(new Set()); }} style={btnStyle(layoutDir === b.dir)}>
            {b.icon}{b.label}
          </button>
        ))}
        {divider}
        {/* Filter */}
        {(['all', ...lessonTypes]).map(t => (
          <button key={t} onClick={() => setFilterType(t)} style={filterBtnStyle(filterType === t, t)}>
            {t === 'all' ? 'Tất cả' : t}
          </button>
        ))}
        {divider}
        {/* Back */}
        <Link href={`/learn/${level}/${skill}/${category.id}`} style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 11, color: T.muted, textDecoration: 'none',
          padding: '4px 8px', borderRadius: 6,
          border: `1px solid ${T.border}`, background: T.bg,
        }}>
          <FaArrowLeft size={10} /> Quay lại
        </Link>
      </div>

      {/*  Stats panel  */}
      <div style={{
        position: 'absolute', top: 12, right: 12, zIndex: 20,
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: 10, padding: '10px 14px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        fontSize: 11, display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        <div style={{ color: '#818CF8', fontWeight: 700, fontSize: 12, marginBottom: 2 }}>{category.name}</div>
        <div style={{ color: T.textDim }}>N{category.level}  {category.skill}</div>
        <div style={{ color: T.textDim }}>{lessons.length} bài học</div>
        <div style={{ color: T.textDim }}>{totalItems} từ vựng</div>
        <div style={{ height: 1, background: T.border, margin: '4px 0' }} />
        <div style={{ color: T.muted, fontSize: 10 }}>Click bài  thu/mở</div>
        <div style={{ color: T.muted, fontSize: 10 }}>Click từ  chi tiết</div>
      </div>

      {/*  ReactFlow  */}
      <ReactFlow
        nodes={nodes} edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2, minZoom: 0.15, maxZoom: 1.5 }}
        minZoom={0.1} maxZoom={3}
        nodesConnectable={false}
        nodesDraggable={true}
        elementsSelectable={true}
        panOnDrag={[1, 2]}
        zoomOnScroll={true}
        zoomOnPinch={true}
        preventScrolling={true}
        attributionPosition="bottom-right"
        proOptions={{ hideAttribution: false }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#1E2035" />
        <Controls
          position="bottom-right"
          style={{ marginBottom: 100, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8 }}
          showInteractive={false}
        />
        <MiniMap
          nodeColor={n => {
            if (n.type === 'rootNode')   return '#4F46E5';
            if (n.type === 'lessonNode') return LESSON_ACCENT[n.data?.type] ?? '#64748B';
            if (n.type === 'itemNode')   return ITEM_ACCENT[n.data?.type]?.border ?? '#3B82F6';
            return T.border;
          }}
          maskColor="rgba(0,0,0,0.55)"
          style={{
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: 8, bottom: 12, right: 12,
          }}
          zoomable pannable
        />
      </ReactFlow>

      {/*  Empty state  */}
      {filteredLessons.length === 0 && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          zIndex: 30, background: T.surface, border: `1px solid ${T.border}`,
          borderRadius: 14, padding: '28px 36px', textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.5 }}></div>
          <div style={{ fontWeight: 600, color: T.textDim, marginBottom: 12 }}>
            Không có bài học loại &ldquo;{filterType}&rdquo;
          </div>
          <button onClick={() => setFilterType('all')} style={{
            padding: '6px 18px', borderRadius: 8, border: 'none',
            background: '#4F46E5', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600,
          }}>
            Xem tất cả
          </button>
        </div>
      )}

      {selectedItem && (
        <ItemDetailPopup item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
}

export default function MindmapClient(props: Props) {
  return (
    <ReactFlowProvider>
      <MindmapInner {...props} />
    </ReactFlowProvider>
  );
}