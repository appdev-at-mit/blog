import { colorSets } from "@/lib/colorsets";

export default function Badges({
  tags,
  color,
}: {
  tags: string[];
  color: number;
}) {
  const colorSet = colorSets[color];
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, index) => (
        <span
          key={index}
          className={`inline-block ${colorSet[1]} ${colorSet[0]} border ${colorSet[2]} px-0.5 py-0.5 rounded-md text-xs font-mono`}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
