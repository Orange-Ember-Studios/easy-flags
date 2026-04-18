import { Icon } from "../shared/Icon";
import type { ColumnInfo } from "./types";

interface SchemaTableProps {
  selectedTable: string | null;
  schema: ColumnInfo[];
}

export function SchemaTable({ selectedTable, schema }: SchemaTableProps) {
  return (
    <div className="p-10">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
          <Icon name="Layers" size={20} />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Structural Schema:{" "}
          <span className="bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent font-mono ml-2">
            {selectedTable}
          </span>
        </h2>
      </div>

      {schema.length > 0 ? (
        <div className="overflow-x-auto rounded-3xl border border-white/[0.05] bg-white/[0.01] backdrop-blur-3xl shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.03] border-b border-white/[0.05]">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Column Name
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Data Type
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Default Value
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Constraints
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {schema.map((col) => (
                <tr
                  key={col.cid}
                  className="group hover:bg-white/[0.02] transition-colors duration-300"
                >
                  <td className="px-8 py-5 font-mono text-slate-200 text-xs">
                    <div className="flex items-center gap-3">
                      {!!col.pk && (
                        <span className="text-amber-400 animate-pulse">🔑</span>
                      )}
                      <span
                        className={`${col.pk ? "text-cyan-400 font-bold" : "group-hover:text-white transition-colors"}`}
                      >
                        {col.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-white/[0.05] rounded-lg text-slate-400 text-[10px] font-bold uppercase tracking-widest border border-white/[0.05]">
                      {col.type}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-slate-400 font-mono text-[10px]">
                    {col.dflt_value ? (
                      <span className="text-slate-300 bg-cyan-500/5 px-2.5 py-1 rounded-md border border-cyan-500/10">
                        {col.dflt_value}
                      </span>
                    ) : (
                      <span className="text-slate-700 italic">-</span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-slate-400">
                    {(!!col.pk || !!col.notnull) && (
                      <div className="flex gap-2 flex-wrap">
                        {!!col.pk && (
                          <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
                            Primary Key
                          </span>
                        )}
                        {!!col.notnull && (
                          <span className="px-3 py-1 bg-red-500/10 text-red-500 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border border-red-500/20">
                            Required
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
          <p className="text-slate-500 font-medium tracking-tight">
            No schema available for this table.
          </p>
        </div>
      )}
    </div>
  );
}
