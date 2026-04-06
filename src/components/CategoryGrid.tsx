import type { TimeCategory } from '../types';
import { getTimeCategoryGroups, type TimeCategoryInfo } from '../utils/categories';

interface CategoryGridProps {
  selected?: TimeCategory | null;
  onSelect: (cat: TimeCategoryInfo) => void;
}

export default function CategoryGrid({ selected, onSelect }: CategoryGridProps) {
  const groups = getTimeCategoryGroups();

  return (
    <div className="space-y-4">
      {groups.map(group => (
        <div key={group.group}>
          <h3 className="text-xs uppercase tracking-wider text-text-muted mb-2 font-semibold">
            {group.group}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {group.categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => onSelect(cat)}
                className={`flex items-center gap-2 px-3 py-3 rounded-xl text-left text-sm font-medium transition-all min-h-[44px] ${
                  selected === cat.key
                    ? 'bg-gold text-forest-deep ring-2 ring-gold'
                    : 'bg-forest-deep text-text-light hover:bg-forest-deep/80 active:scale-[0.97]'
                }`}
              >
                <span className="text-base">{cat.icon}</span>
                <span className="leading-tight">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
