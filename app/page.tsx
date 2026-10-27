import { Suspense } from "react";
import { connection } from "next/server";
import { supabase } from "@/lib/supabase";
import { formatMonth, formatNumber, type MonthRow } from "@/lib/format";
import OrdersChart from "./orders-chart";

// The Olist export starts in Sep 2016 and trails off in Sep/Oct 2018 with only a
// handful of orders. Those partial months would look like a crash, so they are left out.
const FIRST_MONTH = "2017-01-01";
const LAST_MONTH = "2018-08-01";

export default function Page() {
  return (
    <main>
      <header>
        <p className="eyebrow">Data Visualization &amp; Storytelling</p>
        <h1>How a Brazilian marketplace grew, month by month</h1>
        <p className="lede">
          Olist connects small Brazilian shops to the big e-commerce sites. Its public dataset
          holds every order placed through the platform. Counted by month, those orders show a
          business that kept growing, with one month standing far above the rest.
        </p>
      </header>

      <Suspense fallback={<p className="notice">Loading orders from Supabase…</p>}>
        <Dashboard />
      </Suspense>

      <footer>
        Source: Olist Brazilian E-Commerce Public Dataset (Kaggle), 99,441 orders. Data is read
        live from Supabase (view <code>orders_per_month</code>).
      </footer>
    </main>
  );
}

async function Dashboard() {
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

  const { data, error } = await supabase
    .from("orders_per_month")
    .select("month, orders")
    .gte("month", FIRST_MONTH)
    .lte("month", LAST_MONTH)
    .order("month");

  if (error) return <p className="notice">Could not load data: {error.message}</p>;
  if (!data?.length) return <p className="notice">The view orders_per_month returned no rows.</p>;

  const rows = data as MonthRow[];
  const first = rows[0];
  const last = rows[rows.length - 1];
  const peak = rows.reduce((a, b) => (b.orders > a.orders ? b : a));
  const total = rows.reduce((sum, r) => sum + r.orders, 0);

  return (
    <>
      <section className="tiles">
        <div className="tile">
          <div className="tile-label">Orders, {formatMonth(first.month)} – {formatMonth(last.month)}</div>
          <div className="tile-value">{formatNumber(total)}</div>
        </div>
        <div className="tile">
          <div className="tile-label">Busiest month</div>
          <div className="tile-value">{formatMonth(peak.month)}</div>
          <div className="tile-note">{formatNumber(peak.orders)} orders</div>
        </div>
        <div className="tile">
          <div className="tile-label">Monthly orders, first vs. last month</div>
          <div className="tile-value">{(last.orders / first.orders).toFixed(1)}×</div>
          <div className="tile-note">
            {formatNumber(first.orders)} → {formatNumber(last.orders)}
          </div>
        </div>
      </section>

      <figure>
        <figcaption>
          <h2>Orders per month</h2>
          <p>
            The peak, {formatMonth(peak.month)}
            {peak.month.startsWith("2017-11") ? " (the month of Black Friday)" : ""}, is the
            highest point in the series.
          </p>
        </figcaption>
        <OrdersChart data={rows} peak={peak} />
        <details>
          <summary>Show data as a table</summary>
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Orders</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.month}>
                  <td>{formatMonth(r.month)}</td>
                  <td>{formatNumber(r.orders)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </figure>
    </>
  );
}
