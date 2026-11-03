import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { supabase } from "@/lib/supabase";
import { formatNumber } from "@/lib/format";

// Known deliberately injected issue events, from the dataset's README (seed 20261101)
const KNOWN_ISSUES = 228;

const TABLES: { name: string; about: string }[] = [
  { name: "customers", about: "Region, segment, signup date" },
  { name: "products", about: "Category, list price, unit cost" },
  { name: "orders", about: "Date, channel, status, shipping region" },
  { name: "order_lines", about: "Quantity, unit price, discount" },
  { name: "payments", about: "Amount, status, method" },
  { name: "returns", about: "Reason, refund amount" },
  { name: "stores", about: "Region, store type" },
  { name: "regional_targets", about: "Monthly revenue target by region" },
];

type CountRow = { table_name: string; row_count: number };

export default function Page() {
  return (
    <main className="wide">
      <nav className="topnav">
        <span className="brand">
          IE NYC Retail <span>/ Data Quality</span>
        </span>
        <span className="links">
          <a href="#dashboard">Dashboard</a>
          <a href="#data">Data</a>
          <a href="#roadmap">Roadmap</a>
          <Link href="/olist">Olist story</Link>
        </span>
      </nav>

      <header>
        <p className="eyebrow">Data Visualization &amp; Storytelling · IE NYC</p>
        <h1>Data quality you can see before you trust the numbers</h1>
        <p className="lede">
          A monitoring view for a synthetic retail dataset with deliberately injected issues:
          invalid dates, orphan keys, inconsistent categories, negative quantities, invalid
          discounts, and payment discrepancies.
        </p>
      </header>

      <Suspense fallback={<p className="notice">Loading row counts from Supabase…</p>}>
        <RawData />
      </Suspense>

      <section id="dashboard" className="block">
        <h2>Quality dashboard</h2>
        <p className="sub">
          Reserved space. Checks will populate these panels once the Silver layer is built.
        </p>
        <div className="dash" aria-label="Quality dashboard placeholder">
          <div className="dash-head">
            <strong>Overview</strong>
            <span className="status">Coming soon: not yet connected</span>
          </div>
          <div className="kpis">
            {["Rows checked", "Issues found", "Clean rows", "Revenue at risk"].map((label) => (
              <div className="kpi" key={label}>
                <div className="tile-label">{label}</div>
                <div className="kpi-empty">—</div>
              </div>
            ))}
          </div>
          <div className="panels">
            <div className="panel">Issues by type and table (chart placeholder)</div>
            <div className="panel">Share of clean vs. flagged rows (chart placeholder)</div>
            <div className="panel panel-wide">Flagged records: drill-down table (placeholder)</div>
          </div>
        </div>
      </section>

      <section id="roadmap" className="block">
        <h2>Roadmap</h2>
        <ol className="steps">
          <li className="done">
            <strong>Import raw data</strong>
            <span>Eight tables loaded into Supabase, verified against source checksums.</span>
          </li>
          <li className="done">
            <strong>Publish landing page</strong>
            <span>This page, with row counts read live from Supabase.</span>
          </li>
          <li>
            <strong>Build Silver layer</strong>
            <span>Typed, cleaned tables with every issue flagged rather than silently fixed.</span>
          </li>
          <li>
            <strong>Connect the dashboard</strong>
            <span>Live quality metrics and charts in the space above.</span>
          </li>
          <li>
            <strong>Gold layer and insights</strong>
            <span>Revenue vs. regional targets, built on trusted data only.</span>
          </li>
        </ol>
      </section>

      <footer>
        Synthetic training data (seed 20261101). Row counts are read live from Supabase (function{" "}
        <code>raw_table_counts</code>). Earlier project:{" "}
        <Link href="/olist">How a Brazilian marketplace grew</Link>.
      </footer>
    </main>
  );
}

async function RawData() {
  // Always read at request time, so new rows in Supabase show up without a redeploy
  await connection();

  if (!supabase) {
    return (
      <p className="notice">
        Supabase is not connected yet. Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
        <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, then redeploy.
      </p>
    );
  }

  const { data, error } = await supabase.rpc("raw_table_counts");

  if (error) return <p className="notice">Could not load row counts: {error.message}</p>;

  const counts = new Map((data as CountRow[]).map((r) => [r.table_name, Number(r.row_count)]));
  const total = [...counts.values()].reduce((sum, n) => sum + n, 0);

  return (
    <>
      <section className="tiles">
        <div className="tile">
          <div className="tile-label">Raw tables in Supabase</div>
          <div className="tile-value">{counts.size}</div>
        </div>
        <div className="tile">
          <div className="tile-label">Rows imported as-is</div>
          <div className="tile-value">{formatNumber(total)}</div>
          <div className="tile-note">live count</div>
        </div>
        <div className="tile">
          <div className="tile-label">Known injected issue events</div>
          <div className="tile-value">{KNOWN_ISSUES}</div>
          <div className="tile-note">per dataset README</div>
        </div>
        <div className="tile">
          <div className="tile-label">Pipeline</div>
          <div className="tile-value">3 layers</div>
          <div className="tile-note">Raw → Silver → Gold</div>
        </div>
      </section>

      <section id="data" className="block">
        <h2>Source data</h2>
        <p className="sub">
          All columns stored as TEXT in the <code>raw</code> schema, so malformed values are
          preserved exactly.
        </p>
        <div className="tables">
          {TABLES.map((t) => (
            <div className="tile" key={t.name}>
              <div className="table-head">
                <code>{t.name}</code>
                <span className="tile-note">{formatNumber(counts.get(t.name) ?? 0)}</span>
              </div>
              <div className="tile-label">{t.about}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
