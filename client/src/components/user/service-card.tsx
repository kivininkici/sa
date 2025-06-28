import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface ServiceCardProps {
  name: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  isSelected: boolean;
  onClick: () => void;
}

export default function ServiceCard({
  name,
  description,
  icon: Icon,
  iconColor,
  isSelected,
  onClick,
}: ServiceCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-colors ${
        isSelected
          ? "border-blue-500 bg-slate-700"
          : "border-slate-600 hover:border-blue-500"
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 ${iconColor} rounded-lg flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-medium text-slate-50">{name}</h4>
            <p className="text-sm text-slate-400">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
