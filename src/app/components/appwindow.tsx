import { colorSets } from "@/lib/colorsets";

export default function AppWindow({ color, children }: { color: number, children: React.ReactNode }) {
  const colorSet = colorSets[color];
  return (
    <div className={`${colorSet[0]} ${colorSet[1]} shadow-lg shadow-gray-200 rounded-xl p-5 w-full border ${colorSet[2]} relative h-full`}>
      <div className="flex items-center mb-4">
        <div className="w-3 h-3 bg-red-500 rounded-full mr-2 saturate-50"></div>
        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2 saturate-50"></div>
        <div className="w-3 h-3 bg-green-500 rounded-full saturate-50"></div>
      </div>
      {children}
    </div>
  );
}
