import { useEffect, useState } from "react";
import {
  SchemaTable,
  FilterSection,
  PaginationControls,
  AddRowModal,
  EditRowModal,
  DeleteConfirmModal,
  DataTable,
} from "./dev";
import {
  useTableInspection,
  useDataManipulation,
  useAddRowModal,
  useEditRowModal,
  useDeleteConfirmModal,
  useAddRowHandler,
  useEditRowHandler,
} from "./dev/hooks";
import { Icon } from "./shared/Icon";

export default function DatabaseInspector() {
  // Custom hooks for state management
  const tableInspection = useTableInspection();
  const dataManipulation = useDataManipulation({
    data: tableInspection.data,
    itemsPerPage: 20,
  });
  const addRowModal = useAddRowModal();
  const editRowModal = useEditRowModal();
  const deleteConfirmModal = useDeleteConfirmModal();

  // Handler for adding rows
  const { addRow: addRowToTable } = useAddRowHandler({
    selectedTable: tableInspection.selectedTable,
    schema: tableInspection.schema,
    onSuccess: () => {
      addRowModal.closeAddModal();
      tableInspection.refetchData();
    },
  });

  // Handler for editing rows
  const { editRow: editRowInTable } = useEditRowHandler({
    selectedTable: tableInspection.selectedTable,
    schema: tableInspection.schema,
    onSuccess: () => {
      editRowModal.closeEditModal();
      tableInspection.refetchData();
    },
  });

  // Reset pagination when filter changes
  useEffect(() => {
    dataManipulation.resetPagination();
  }, [dataManipulation.filterText, dataManipulation.filterColumn]);

  const [tableSearch, setTableSearch] = useState("");

  const filteredTables = tableInspection.tables.filter((t) =>
    t.name.toLowerCase().includes(tableSearch.toLowerCase()),
  );

  return (
    <div className="min-h-screen pt-12 pb-24 relative overflow-x-hidden">
      {/* Aurora Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full -z-10 animate-pulse duration-[10s]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/10 blur-[100px] rounded-full -z-10 animate-pulse duration-[8s]" />

      <div className="max-w-[1600px] mx-auto px-6 relative z-10">
        {/* Header Section */}
        <header className="mb-12 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-cyan-400 border border-cyan-500/30 shadow-2xl shadow-cyan-500/10">
              <Icon name="Database" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Database <span className="text-cyan-400">Inspector</span>
              </h1>
              <p className="text-slate-500 text-sm font-medium">
                Real-time system data synchronization and record management.
              </p>
            </div>
          </div>
        </header>

        {tableInspection.error && (
          <div className="mb-8 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-red-400 flex items-center gap-3 animate-in fade-in zoom-in duration-300 mx-auto max-w-7xl">
            <Icon name="AlertTriangle" size={18} />
            <div className="font-bold text-xs uppercase tracking-widest">
              Sync Error: {tableInspection.error}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-8 items-start">
          {/* Sidebar - Table List */}
          <aside className="lg:sticky lg:top-8 lg:max-h-[calc(100vh-100px)] flex flex-col gap-4 animate-in slide-in-from-left-4 duration-700">
            <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.05] rounded-[32px] overflow-hidden flex flex-col h-full shadow-2xl">
              <div className="p-6 border-b border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500/70">
                    Tables
                  </h3>
                  <button
                    onClick={tableInspection.fetchTables}
                    className="p-2 text-slate-500 hover:text-cyan-400 transition-colors bg-white/5 rounded-lg border border-white/5"
                  >
                    <Icon name="RefreshCw" size={12} />
                  </button>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-600 group-focus-within:text-cyan-400 transition-colors">
                    <Icon name="Search" size={14} />
                  </div>
                  <input
                    type="text"
                    placeholder="Filter tables..."
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/5 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/30 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[500px] lg:max-h-none p-3 space-y-1 custom-scrollbar">
                {tableInspection.loading &&
                tableInspection.tables.length === 0 ? (
                  <div className="p-8 text-center space-y-3">
                    <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mx-auto" />
                    <p className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">
                      Syncing...
                    </p>
                  </div>
                ) : filteredTables.length === 0 ? (
                  <div className="p-8 text-center text-slate-600">
                    <p className="text-xs font-medium">No tables found</p>
                  </div>
                ) : (
                  filteredTables.map((table) => (
                    <button
                      key={table.name}
                      onClick={() =>
                        tableInspection.setSelectedTable(table.name)
                      }
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group/item ${
                        tableInspection.selectedTable === table.name
                          ? "bg-linear-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/10"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <Icon
                          name="Table"
                          size={14}
                          className={
                            tableInspection.selectedTable === table.name
                              ? "text-slate-900"
                              : "text-slate-600 group-hover/item:text-cyan-400"
                          }
                        />
                        <span className="text-xs font-bold truncate leading-none">
                          {table.name}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest ${
                          tableInspection.selectedTable === table.name
                            ? "bg-slate-950/20 text-slate-900"
                            : "bg-white/5 text-slate-600 border border-white/5"
                        }`}
                      >
                        {table.rowCount}
                      </span>
                    </button>
                  ))
                )}
              </div>
              <div className="p-4 border-t border-white/5 bg-white/[0.01]">
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest text-center">
                  Total Objects: {tableInspection.tables.length}
                </p>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="min-w-0 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            {tableInspection.selectedTable ? (
              <div className="space-y-8">
                {/* View Tabs */}
                <div className="flex gap-2">
                  <button
                    onClick={() => tableInspection.setViewTab("records")}
                    className={`px-6 py-3 text-sm font-bold tracking-tight rounded-2xl transition-all flex items-center gap-2 border ${
                      tableInspection.viewTab === "records"
                        ? "bg-white/[0.05] text-white border-cyan-500/30 shadow-2xl shadow-cyan-500/5"
                        : "text-slate-500 hover:text-slate-300 border-transparent hover:bg-white/[0.02]"
                    }`}
                  >
                    <Icon name="Activity" size={18} />
                    Records
                  </button>
                  <button
                    onClick={() => tableInspection.setViewTab("structure")}
                    className={`px-6 py-3 text-sm font-bold tracking-tight rounded-2xl transition-all flex items-center gap-2 border ${
                      tableInspection.viewTab === "structure"
                        ? "bg-white/[0.05] text-white border-cyan-500/30 shadow-2xl shadow-cyan-500/5"
                        : "text-slate-500 hover:text-slate-300 border-transparent hover:bg-white/[0.02]"
                    }`}
                  >
                    <Icon name="Layers" size={18} />
                    Structure
                  </button>
                </div>

                {/* Sub-sections */}
                <div className="animate-in fade-in zoom-in-95 duration-500">
                  {tableInspection.viewTab === "structure" && (
                    <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.05] rounded-[32px] overflow-hidden shadow-2xl">
                      <SchemaTable
                        selectedTable={tableInspection.selectedTable}
                        schema={tableInspection.schema}
                      />
                    </div>
                  )}

                  {tableInspection.viewTab === "records" && (
                    <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.05] rounded-[32px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 blur-[120px] -z-10" />

                      <div className="flex items-center justify-between mb-12 flex-wrap gap-8">
                        <div>
                          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3 leading-none">
                            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                              <Icon name="Database" size={18} />
                            </div>
                            {tableInspection.selectedTable}
                          </h2>
                          <p className="text-slate-500 text-xs mt-3 font-medium tracking-wide uppercase">
                            Table Dataset Manipulation
                          </p>
                        </div>
                        <div className="flex gap-4 items-center flex-wrap">
                          <div className="flex gap-3 p-1.5 bg-white/5 rounded-2xl border border-white/5 items-center">
                            <div className="flex items-center gap-2 px-3">
                              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                Limit
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="1000"
                                value={tableInspection.rowLimit}
                                onChange={tableInspection.handleRowLimitChange}
                                className="w-16 bg-transparent text-white font-bold text-sm focus:outline-none focus:text-cyan-400 transition-colors"
                              />
                            </div>
                            <div className="w-px h-6 bg-white/10" />
                            <button
                              onClick={tableInspection.refetchData}
                              disabled={tableInspection.loading}
                              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-[12px] text-xs font-bold transition-all disabled:opacity-50"
                            >
                              {tableInspection.loading ? (
                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mx-2" />
                              ) : (
                                "Fetch"
                              )}
                            </button>
                          </div>

                          <button
                            onClick={addRowModal.openAddModal}
                            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-cyan-500/20 active:scale-95 flex items-center gap-2"
                          >
                            <Icon name="Plus" size={16} /> New Record
                          </button>
                        </div>
                      </div>

                      {/* Filter Section */}
                      <FilterSection
                        schema={tableInspection.schema}
                        filterColumn={dataManipulation.filterColumn}
                        filterText={dataManipulation.filterText}
                        onFilterColumnChange={dataManipulation.setFilterColumn}
                        onFilterTextChange={dataManipulation.setFilterText}
                        onClearFilter={() => {
                          dataManipulation.setFilterText("");
                          dataManipulation.setFilterColumn(null);
                        }}
                        hasData={tableInspection.data.length > 0}
                      />

                      {tableInspection.loading ? (
                        <div className="text-center py-32 bg-white/[0.01] rounded-[24px] border border-dashed border-white/5">
                          <div className="w-12 h-12 border-4 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin mx-auto" />
                          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] mt-6">
                            Indexing...
                          </p>
                        </div>
                      ) : tableInspection.data.length > 0 ? (
                        <div className="space-y-10">
                          <DataTable
                            schema={tableInspection.schema}
                            paginatedData={dataManipulation.getPaginatedData()}
                            deleting={tableInspection.deleting}
                            onRequestDeleteRow={(rowId, rowData) => {
                              deleteConfirmModal.openDeleteConfirm(
                                rowId,
                                rowData,
                              );
                            }}
                            onEditRow={(rowId, rowData) => {
                              editRowModal.openEditModal(rowId, rowData);
                            }}
                          />

                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-10 border-t border-white/5">
                            <div className="flex items-center gap-4">
                              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                                Page {dataManipulation.currentPage} of{" "}
                                {dataManipulation.getTotalPages()} •{" "}
                                {dataManipulation.getFilteredData().length}{" "}
                                total
                              </p>
                            </div>
                            <PaginationControls
                              currentPage={dataManipulation.currentPage}
                              totalPages={dataManipulation.getTotalPages()}
                              onPageChange={dataManipulation.setCurrentPage}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-32 bg-white/[0.01] rounded-[32px] border border-dashed border-white/10 group hover:border-cyan-500/20 transition-colors">
                          <Icon
                            name="Search"
                            size={32}
                            className="mx-auto text-slate-700 mb-4"
                          />
                          <p className="text-slate-500 font-bold tracking-tight">
                            No matching records found.
                          </p>
                          <button
                            onClick={() => {
                              dataManipulation.setFilterText("");
                              dataManipulation.setFilterColumn(null);
                            }}
                            className="text-cyan-400 text-xs font-bold mt-4 underline underline-offset-4"
                          >
                            Clear criteria
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.05] rounded-[40px] p-32 text-center relative overflow-hidden group min-h-[600px] flex flex-col items-center justify-center">
                <div className="absolute inset-0 bg-linear-to-b from-transparent via-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="w-20 h-20 rounded-[28px] bg-linear-to-br from-white/10 to-transparent flex items-center justify-center text-4xl mb-8 border border-white/10 group-hover:scale-110 transition-all duration-700 shadow-2xl shadow-cyan-500/5">
                  <Icon
                    name="Database"
                    size={40}
                    className="text-cyan-500/20"
                  />
                </div>
                <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight">
                  Inspector Console
                </h2>
                <p className="text-slate-500 max-w-sm mx-auto leading-relaxed text-lg">
                  Select a data source from the sidebar to inspect its structure
                  and manage live records.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Add Row Modal */}
      <AddRowModal
        isOpen={addRowModal.showAddModal}
        selectedTable={tableInspection.selectedTable}
        schema={tableInspection.schema}
        formData={addRowModal.formData}
        loading={tableInspection.loading}
        onFormChange={addRowModal.handleFormChange}
        onAddRow={() => addRowToTable(addRowModal.formData)}
        onClose={addRowModal.closeAddModal}
      />

      {/* Edit Row Modal */}
      <EditRowModal
        isOpen={editRowModal.showEditModal}
        selectedTable={tableInspection.selectedTable}
        schema={tableInspection.schema}
        formData={editRowModal.formData}
        loading={tableInspection.loading}
        onFormChange={editRowModal.handleFormChange}
        onEditRow={() =>
          editRowInTable(editRowModal.editingRowId ?? "", editRowModal.formData)
        }
        onClose={editRowModal.closeEditModal}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteConfirmModal.isOpen}
        rowId={deleteConfirmModal.rowId}
        rowData={deleteConfirmModal.rowData}
        tableName={tableInspection.selectedTable}
        loading={tableInspection.deleting === deleteConfirmModal.rowId}
        onConfirm={() => {
          if (deleteConfirmModal.rowId !== null) {
            tableInspection.deleteRow(deleteConfirmModal.rowId);
            deleteConfirmModal.closeDeleteConfirm();
          }
        }}
        onCancel={deleteConfirmModal.closeDeleteConfirm}
      />
    </div>
  );
}
