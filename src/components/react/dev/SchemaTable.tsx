import type { ColumnInfo } from "./types";

interface SchemaTableProps {
  selectedTable: string | null;
  schema: ColumnInfo[];
}

export function SchemaTable({ selectedTable, schema }: SchemaTableProps) {
  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Schema: <span className="text-cyan-400 font-display">{selectedTable}</span>
        </h2>
      </div>

      {schema.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-white/5 bg-white/[0.01]">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                  Column
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                  Type
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                  Default
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                  Constraints
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {schema.map((col) => (
                <tr
                  key={col.cid}
                  className="group hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-slate-200 text-sm">
                    <div className="flex items-center gap-2">
                       {col.pk && <span className="text-amber-400">🔑</span>} 
                       <span className={col.pk ? 'text-cyan-400 font-bold' : ''}>{col.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm font-medium">{col.type}</td>
                  <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                    {col.dflt_value ? (
                      <span className="text-slate-300 bg-white/5 px-2 py-1 rounded-md">{col.dflt_value}</span>
                    ) : (
                      <span className="text-slate-600 italic">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {(!!col.pk || !!col.notnull) && (
                      <div className="flex gap-2 flex-wrap">
                        {!!col.pk && (
                          <span className="px-2 py-1 bg-cyan-500/10 text-cyan-500 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-cyan-500/20">
                            PK
                          </span>
                        )}
                        {!!col.notnull && (
                          <span className="px-2 py-1 bg-red-500/10 text-red-500 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-red-500/20">
                            NOT NULL
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
          <p className="text-slate-500 font-medium tracking-tight">No schema available for this table.</p>
        </div>
      )}
    </div>
  );
}
