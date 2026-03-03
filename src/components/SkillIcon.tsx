import { FaHeadphones, FaMicrophone, FaBookOpen, FaPencil, FaFileLines } from 'react-icons/fa6';
import type { IconType } from 'react-icons';

const SKILL_ICON_MAP: Record<string, IconType> = {
  nghe: FaHeadphones,
  noi: FaMicrophone,
  doc: FaBookOpen,
  viet: FaPencil,
};

interface SkillIconProps {
  skill: string;
  className?: string;
  size?: number;
}

export function SkillIcon({ skill, className, size = 18 }: SkillIconProps) {
  const Icon = SKILL_ICON_MAP[skill] ?? FaFileLines;
  return <Icon size={size} className={className} />;
}
