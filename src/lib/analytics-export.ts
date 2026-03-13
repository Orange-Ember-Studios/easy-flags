/**
 * Analytics Export Utilities
 * Handle CSV and JSON export of analytics data
 */

export function exportToCSV(data: unknown, filename: string): void {
  try {
    const csvContent = convertToCSV(data);
    downloadFile(csvContent, filename, "text/csv");
  } catch (error) {
    console.error("CSV export failed:", error);
    throw new Error("Failed to export CSV");
  }
}

export function exportToJSON(data: unknown, filename: string): void {
  try {
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, filename, "application/json");
  } catch (error) {
    console.error("JSON export failed:", error);
    throw new Error("Failed to export JSON");
  }
}

function downloadFile(
  content: string,
  filename: string,
  contentType: string
): void {
  const blob = new Blob([content], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

function convertToCSV(data: unknown): string {
  if (!data) return "";

  if (Array.isArray(data)) {
    if (data.length === 0) return "";

    // Get headers from first object
    const firstItem = data[0];
    if (typeof firstItem !== "object" || firstItem === null) {
      return data.join(",");
    }

    const headers = Object.keys(firstItem);
    const csvHeaders = headers.map((h) => `"${h}"`).join(",");

    const csvRows = data.map((item) => {
      if (typeof item !== "object" || item === null) {
        return `"${item}"`;
      }

      return headers
        .map((header) => {
          const value = (item as Record<string, unknown>)[header];
          // Escape quotes and wrap in quotes
          const stringValue = String(value || "").replace(/"/g, '""');
          return `"${stringValue}"`;
        })
        .join(",");
    });

    return [csvHeaders, ...csvRows].join("\n");
  }

  // If data is an object, convert to single row
  if (typeof data === "object" && data !== null) {
    const headers = Object.keys(data);
    const csvHeaders = headers.map((h) => `"${h}"`).join(",");
    const csvValues = headers
      .map((header) => {
        const value = (data as Record<string, unknown>)[header];
        const stringValue = String(value || "").replace(/"/g, '""');
        return `"${stringValue}"`;
      })
      .join(",");
    return [csvHeaders, csvValues].join("\n");
  }

  return `"${String(data)}"`;
}
