"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus, Star } from "lucide-react";

interface SkillCriterion {
  name: string;
  weight: number;
}

interface SkillTagInputProps {
  skills: SkillCriterion[];
  onChange: (skills: SkillCriterion[]) => void;
}

const weightColors: Record<number, string> = {
  1: "bg-blue-100 text-blue-700 border-blue-200",
  2: "bg-green-100 text-green-700 border-green-200",
  3: "bg-yellow-100 text-yellow-700 border-yellow-200",
  4: "bg-orange-100 text-orange-700 border-orange-200",
  5: "bg-red-100 text-red-700 border-red-200",
};

const weightLabels: Record<number, string> = {
  1: "Nice to have",
  2: "Low",
  3: "Medium",
  4: "High",
  5: "Must have",
};

function Stars({ count }: { count: number }) {
  return (
    <span className="inline-flex gap-px">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-2.5 w-2.5 ${i < count ? "fill-current" : "opacity-30"}`}
        />
      ))}
    </span>
  );
}

export function SkillTagInput({ skills, onChange }: SkillTagInputProps) {
  const [skillName, setSkillName] = useState("");
  const [weight, setWeight] = useState("3");

  const addSkill = () => {
    if (skillName.trim() && !skills.some((s) => s.name.toLowerCase() === skillName.trim().toLowerCase())) {
      onChange([...skills, { name: skillName.trim(), weight: parseInt(weight) }]);
      setSkillName("");
      setWeight("3");
    }
  };

  const removeSkill = (index: number) => {
    onChange(skills.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 mb-1.5">
        {skills.map((skill, i) => (
          <Badge
            key={i}
            variant="outline"
            className={`gap-1 pr-1 ${weightColors[skill.weight] || ""}`}
          >
            {skill.name}
            <Stars count={skill.weight} />
            <button
              type="button"
              onClick={() => removeSkill(i)}
              className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={skillName}
          onChange={(e) => setSkillName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSkill();
            }
          }}
          placeholder="Skill name"
          className="h-9 flex-1"
        />
        <Select value={weight} onValueChange={setWeight}>
          <SelectTrigger className="w-32 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5].map((w) => (
              <SelectItem key={w} value={String(w)}>
                <span className="flex items-center gap-1.5">
                  <Stars count={w} />
                  <span className="text-xs">{weightLabels[w]}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          size="sm"
          onClick={addSkill}
          className="h-9 px-3 bg-[#16A34A] hover:bg-[#16A34A]/80"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
