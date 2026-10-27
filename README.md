# Data Visualization & Storytelling

A small dashboard on the Olist Brazilian e-commerce dataset: orders per month,
read live from Supabase and drawn with Recharts. Built with Next.js, deployed on Vercel.

## Data

`olist_orders_dataset.csv` is imported into the Supabase table `orders`. The app reads
a monthly summary from a view (the Supabase API returns at most 1,000 rows per request,
so the counting happens in the database):

```sql
create policy "public read" on orders for select using (true);

create view orders_per_month with (security_invoker = true) as
select date_trunc('month', order_purchase_timestamp)::date as month,
       count(*)::int as orders
from orders
group by 1
order by 1;
```

## Run locally

```bash
cp .env.example .env.local   # fill in URL and anon key from Supabase → Project Settings → API
npm install
npm run dev
```

## Deploy

Import the repo in Vercel and set the same two environment variables
(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Every push to `main` redeploys.
