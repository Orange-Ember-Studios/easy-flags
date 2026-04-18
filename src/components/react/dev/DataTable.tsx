import type { ColumnInfo } from "./types";
import { Icon } from "../shared/Icon";

interface DataTableProps {
  schema: ColumnInfo[];
  paginatedData: Record<string, unknown>[];
  deleting: string | number | null;
  onRequestDeleteRow: (
    rowId: string | number,
    rowData: Record<string, unknown>,
  ) => void;
  onEditRow: (rowId: string | number, rowData: Record<string, string>) => void;
}

export function DataTable({
  schema,
  paginatedData,
  deleting,
  onRequestDeleteRow,
  onEditRow,
}: DataTableProps) {
  return (
    <div className="overflow-x-auto bg-white/[0.01] rounded-[24px] border border-white/[0.05] relative group/table">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-white/[0.03] border-b border-white/[0.05]">
            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 w-32">
              Actions
            </th>
            {schema.map((col) => (
              <th
                key={col.name}
                className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 whitespace-nowrap"
              >
                <div className="flex items-center gap-2">
                  <span className={col.pk ? 'text-cyan-400' : ''}>{col.name}</span>
                  {!!col.pk && (
                    <span className="text-[9px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/20 font-black">
                      PK
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.03]">
          {paginatedData.map((row, idx) => {
            const primaryKeyColumn = schema.find((c) => c.pk);
            const rowId = (
              primaryKeyColumn ? row[primaryKeyColumn.name] : idx
            ) as string | number;

            return (
              <tr
                key={idx}
                className="group/row hover:bg-white/[0.02] transition-colors duration-300"
              >
                <td className="px-8 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const rowData: Record<string, string> = {};
                        schema.forEach((col) => {
                          rowData[col.name] = String(row[col.name] ?? "");
                        });
                        onEditRow(rowId, rowData);
                      }}
                      className="p-2.5 text-blue-400 bg-blue-500/10 rounded-xl hover:bg-blue-500/20 transition-all border border-blue-500/20 hover:scale-105 active:scale-95"
                      title="Edit Row"
                    >
                      <Icon name="Edit" size={16} />
                    </button>
                    <button
                      onClick={() => {
                        const rowData: Record<string, unknown> = {};
                        schema.forEach((col) => {
                          rowData[col.name] = row[col.name] || null;
                        });
                        onRequestDeleteRow(rowId, rowData);
                      }}
                      disabled={deleting === rowId}
                      className="p-2.5 text-red-400 bg-red-500/10 rounded-xl hover:bg-red-500/20 transition-all border border-red-500/20 disabled:opacity-50 hover:scale-105 active:scale-95"
                      title="Delete Row"
                    >
                      {deleting === rowId ? (
                        <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Icon name="Trash" size={16} />
                      )}
                    </button>
                  </div>
                </td>
                {schema.map((col) => (
                  <td
                    key={col.name}
                    className="px-8 py-4 text-slate-300 max-w-sm overflow-hidden text-ellipsis font-mono text-xs border-r border-white/0 group-hover/row:border-white/[0.02]"
                    title={String(row[col.name] ?? "")}
                  >
                    {row[col.name] !== null && row[col.name] !== undefined ? (
                      <span className={`${col.pk ? 'text-cyan-400 font-bold' : 'group-hover/row:text-white transition-colors'}`}>
                        {typeof row[col.name] === "object"
                          ? JSON.stringify(row[col.name])
                          : String(row[col.name])}
                      </span>
                    ) : (
                      <span className="text-slate-700 italic text-[10px] font-sans">null</span>
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
