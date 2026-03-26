import React from "react";
import { FaBookOpen, FaBolt, FaRetweet } from "react-icons/fa6";

export function SidebarSkillIcon({ skill }: { skill: string }) {
  if (skill === "flashcard") return <FaBookOpen className="text-pink-400" />;
  if (skill === "srs") return <FaRetweet className="text-orange-500" />;
  if (skill === "test") return <FaBolt className="text-blue-500" />;
  return null;
}
