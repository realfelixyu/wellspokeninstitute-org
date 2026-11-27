import { archiveUrl, credit, leadingRatings } from "@/data/speakingImportance";

export const dynamic = "force-static";

export function GET() {
  const rows = [
    ["Shared rank (Speaking importance)", "O*NET-SOC code", "Occupation", "Speaking importance (1-5)", "Source archive", "Attribution", "License"],
    ...leadingRatings.map(row => [row.rank, row.code, row.title, row.importance.toFixed(2), archiveUrl, credit, "https://creativecommons.org/licenses/by/4.0/"]),
  ];
  const csv = rows.map(row => row.map(value => '"' + String(value).replaceAll('"', '""') + '"').join(",")).join("\r\n") + "\r\n";
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8" } });
}
