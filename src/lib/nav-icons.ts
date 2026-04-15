/**
 * Icon registry for NavMenuItem.iconName field.
 * Only import icons actually used (or likely to be used) in nav menus.
 */
import {
  FaBookOpen, FaBookmark, FaPenNib, FaHeadphones, FaCompass,
  FaLayerGroup, FaNewspaper, FaGraduationCap, FaStar, FaChartBar,
  FaPencil, FaFont, FaBolt, FaHouse, FaMagnifyingGlass, FaListCheck,
  FaClipboardList, FaBook, FaUsers, FaGear, FaFire, FaRegLightbulb,
  FaArrowRight, FaPlus, FaCircleCheck,
} from 'react-icons/fa6';
import type { IconType } from 'react-icons';

export const ICON_REGISTRY: Record<string, IconType> = {
  FaBookOpen,
  FaBookmark,
  FaPenNib,
  FaHeadphones,
  FaCompass,
  FaLayerGroup,
  FaNewspaper,
  FaGraduationCap,
  FaStar,
  FaChartBar,
  FaPencil,
  FaFont,
  FaBolt,
  FaHouse,
  FaMagnifyingGlass,
  FaListCheck,
  FaClipboardList,
  FaBook,
  FaUsers,
  FaGear,
  FaFire,
  FaRegLightbulb,
  FaArrowRight,
  FaPlus,
  FaCircleCheck,
};

export const ICON_OPTIONS = Object.keys(ICON_REGISTRY);

export function getIcon(name: string): IconType {
  return ICON_REGISTRY[name] ?? FaBookOpen;
}
