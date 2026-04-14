# State Directory

Runtime data that changes between cron runs. NOT bootstrap — only accessed via semantic search or direct reads.

- `last-scrape.json` — timestamp of last event scrape
- `sync-status.json` — Shopify/Square/WooCommerce sync state
- `outreach-queue.json` — pending claim outreach emails
