import { CheckCircle, Briefcase, SlidersHorizontal } from "lucide-react";

const stepIcons = [CheckCircle, Briefcase, SlidersHorizontal];

export function StepIndicator({
  step,
  totalSteps = 3,
  activeColor = "#16A34A",
  bgColor = "#BBF7D0",
}: {
  step: number;
  totalSteps?: number;
  activeColor?: string;
  bgColor?: string;
}) {
  const clampedStep = Math.min(step, totalSteps);
  const progress = totalSteps > 1 ? ((clampedStep - 1) / (totalSteps - 1)) * 100 : 100;

  return (
    <div className="flex items-center w-full justify-center py-4">
      <div className="relative w-[60%] flex items-center">
        {/* Background line */}
        <div className="absolute inset-0 flex items-center">
          <div
            className="w-full h-1.5 rounded-full"
            style={{ background: bgColor }}
          ></div>
        </div>
        {/* Progress line */}
        <div className="absolute inset-0 flex items-center">
          <div
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              background: activeColor,
              width: `${progress}%`,
            }}
          ></div>
        </div>
        {/* Circles/icons */}
        <div className="relative w-full flex items-center justify-between">
          {stepIcons.slice(0, totalSteps).map((Icon, i) => (
            <div
              key={i}
              className="flex items-center justify-center w-8 h-8 rounded-full"
              style={{
                background: clampedStep >= i + 1 ? activeColor : bgColor,
              }}
            >
              <Icon className="w-4 h-4 text-white" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
