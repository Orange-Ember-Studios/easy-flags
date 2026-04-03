import type { ColumnInfo } from "./types";

interface FilterSectionProps {
  schema: ColumnInfo[];
  filterColumn: string | null;
  filterText: string;
  onFilterColumnChange: (column: string | null) => void;
  onFilterTextChange: (text: string) => void;
  onClearFilter: () => void;
  hasData: boolean;
}

export function FilterSection({
  schema,
  filterColumn,
  filterText,
  onFilterColumnChange,
  onFilterTextChange,
  onClearFilter,
  hasData,
}: FilterSectionProps) {
  if (!hasData) return null;

  return (
    <div className="flex gap-4 items-center mb-8 pb-8 border-b border-white/5 flex-wrap">
      <div className="flex items-center gap-3">
        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">
          🔍 Filter:
        </label>
        <select
          value={filterColumn || ""}
          onChange={(e) => onFilterColumnChange(e.target.value || null)}
          className="px-3 py-1.5 bg-white/5 border border-white/10 text-slate-300 rounded-xl text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
        >
          <option value="">All columns</option>
          {schema.map((col) => (
            <option key={col.name} value={col.name}>
              {col.name}
            </option>
          ))}
        </select>
      </div>
      <input
        type="text"
        value={filterText}
        onChange={(e) => onFilterTextChange(e.target.value)}
        placeholder="Search records..."
        className="flex-1 min-w-[200px] px-4 py-1.5 bg-white/5 border border-white/10 text-slate-300 rounded-xl text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
      />
      {(filterText || filterColumn) && (
        <button
          onClick={onClearFilter}
          className="btn-secondary !text-xs !py-1.5 !px-4 border-white/10"
        >
          ✕ Clear
        </button>
      )}
    </div>
  );
}
