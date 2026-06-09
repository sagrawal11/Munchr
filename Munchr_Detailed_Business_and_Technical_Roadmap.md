# Munchr: Detailed Business and Technical Roadmap

## Executive Summary

Munchr is a web application that helps Duke students find vending machines on campus, search for specific snacks or drinks, and locate the nearest vending option using location services. The current app already solves a real user problem: students often do not know where vending machines are, what each machine contains, or where to find a specific product.

The larger business opportunity is to turn Munchr from a student-facing vending discovery app into a two-sided platform:

1. **For students and campus users**: a fast, searchable, location-aware inventory discovery tool.
2. **For vending operators**: an analytics and inventory intelligence platform that shows demand, stockouts, product trends, building-level performance, and eventually search-to-sale conversion.

The core insight is:

> Sales data only shows what people bought. Munchr can show what people wanted but could not find.

That insight is valuable because vending operators usually know what sold, but they may not know what students searched for, where demand was unmet, or which products could sell better if placed in different machines.

Your dream version is feasible: Munchr can eventually integrate with vending machine telemetry systems or operator inventory platforms to automatically update machine inventory and generate operator analytics. The correct path is to build this in stages: first instrument user behavior, then build an operator dashboard, then add manual or CSV-based inventory ingestion, and finally pursue direct integrations with vending telemetry providers or vending management systems.

---

# 1. What Munchr Should Become

## Current Product

The current version of Munchr appears to be a student-facing utility that includes:

- Campus vending machine locations
- Search by snack or drink
- Search by machine/building
- Inventory browsing
- Location services for nearest machines
- Mobile-friendly access

This is already useful, but it is not yet the strongest business product.

## Future Product

The stronger version is:

> Munchr is a campus vending intelligence platform that connects student demand, real-time inventory, and operator analytics.

In that version, Munchr provides:

### Student-Facing Features

- Search for snacks/drinks across campus
- See which machines currently have a product
- See approximate inventory freshness
- Find nearest vending machine
- Get directions to a machine
- Browse machine contents
- Possibly view prices, dietary tags, allergens, caffeine, protein, etc.

### Operator-Facing Features

- Product search demand analytics
- Building-level demand trends
- Time-of-day and seasonal trends
- Stockout detection
- Search-to-sale attribution
- Product placement recommendations
- Machine performance dashboards
- Inventory freshness monitoring
- Restock recommendations
- Lost-demand reports

---

# 2. Why This Could Be Commercially Valuable

Vending operators already have some sales and inventory data, especially if their machines use modern telemetry and cashless payment systems. However, sales data has a major blind spot.

Sales data answers:

- What sold?
- Where did it sell?
- When did it sell?
- How much revenue did it generate?

Munchr can answer additional questions:

- What did students search for?
- What products were in demand but unavailable?
- Which buildings have unmet demand?
- Which products are popular during finals, move-in, basketball season, late nights, or exam periods?
- Which machines are visible in search but not converting?
- Which machines are hidden opportunities because students nearby are searching for products they do not contain?

This means Munchr can become a demand intelligence layer, not just a vending locator.

## Strongest Value Proposition

For operators:

> Munchr helps vending operators increase sales and reduce missed demand by showing what students want, where they want it, and whether machines are stocked to meet that demand.

For universities:

> Munchr improves campus convenience and student experience by making vending inventory searchable, location-aware, and easier to use.

For smart vending companies:

> Munchr provides a consumer-facing discovery and analytics layer that can sit on top of existing vending telemetry infrastructure.

---

# 3. Ideal Long-Term System Architecture

The ideal long-term system looks like this:

```text
Student App
   ↓
Searches, machine views, location requests, directions clicks
   ↓
Munchr Event Tracking Layer
   ↓
Demand Analytics Database
   ↓
Operator Dashboard

Vending Machines / Telemetry Provider / Operator System
   ↓
Inventory and Sales Data
   ↓
Munchr Ingestion Service
   ↓
Inventory Database + Sales Attribution Engine
   ↓
Student App + Operator Dashboard
```

The key is to connect two kinds of data:

1. **Demand-side data** from Munchr users.
2. **Supply-side data** from machines/operators.

The value comes from comparing them.

---

# 4. Technical Development Roadmap

## Phase 1: Instrument the Existing App

Before building integrations, start collecting product usage data.

You need to know:

- Are students using the app?
- What are they searching for?
- Which machines are they clicking?
- Which buildings generate demand?
- Which searches return no useful result?
- Which searches lead to directions or machine views?

### Events to Track Immediately

Track these events:

```text
search_performed
product_clicked
machine_clicked
nearest_machine_requested
location_permission_enabled
location_permission_denied
directions_clicked
inventory_viewed
building_filter_used
category_filter_used
no_results_returned
```

### Recommended Event Fields

Each event should include:

```text
event_id
anonymous_user_id
session_id
event_type
timestamp
campus
query
normalized_query
product_id
machine_id
building_id
user_location_geohash_or_approximate_zone
device_type
browser
referrer
result_count
```

### Privacy Note

Do not collect more precise location data than needed. For analytics, building-level location or rounded coordinates are usually enough. Avoid storing exact student location trails unless absolutely necessary.

Recommended approach:

- Store approximate location using a geohash or rounded latitude/longitude.
- Use session IDs instead of personally identifiable user accounts.
- Make privacy language clear.
- Avoid storing names, emails, or student IDs unless there is a clear reason.

### Output of Phase 1

At the end of Phase 1, you should be able to say:

```text
In the last 14 days:
- X users visited Munchr
- Y searches were performed
- Z machine pages were viewed
- A directions clicks occurred
- The top searched products were Celsius, Pop-Tarts, Cheez-Its, etc.
- B% of searches had no matching result nearby
```

This is the first proof that Munchr has real usage.

---

## Phase 2: Improve the Data Model

Your current app may store inventory in a simple way, such as:

```text
machine has product
```

For the business version, you need a more robust data model.

### Core Entities

Recommended database entities:

```text
operators
campuses
buildings
machines
machine_slots
products
product_aliases
inventory_snapshots
search_events
machine_view_events
directions_click_events
location_events
purchase_conversion_events
restock_events
telemetry_integrations
sales_events
operator_users
```

### Machine Table

Fields:

```text
machine_id
operator_id
campus_id
building_id
machine_name
machine_type
latitude
longitude
floor
location_description
external_machine_id
status
created_at
updated_at
```

### Product Table

Fields:

```text
product_id
name
brand
category
subcategory
size
barcode_or_upc
sku
aliases
caffeine_mg
protein_g
calories
dietary_tags
image_url
created_at
updated_at
```

### Product Aliases

This is important because users will search casually.

Examples:

```text
"hot cheetos" → "Cheetos Flamin' Hot"
"celsius" → "Celsius Energy Drink"
"protein shake" → "Fairlife Core Power"
"pop tarts" → "Pop-Tarts"
```

Fields:

```text
alias_id
product_id
alias_text
created_at
```

### Inventory Snapshot Table

Do not just store current inventory. Store snapshots over time.

Fields:

```text
inventory_snapshot_id
machine_id
slot_id
product_id
quantity_estimate
capacity
status
source
timestamp
confidence_score
raw_payload_id
```

Possible statuses:

```text
in_stock
low_stock
out_of_stock
unknown
```

Possible sources:

```text
manual
csv_upload
operator_api
telemetry_api
student_report
inferred
```

### Sales Event Table

Eventually, if you get sales data:

```text
sales_event_id
machine_id
product_id
slot_id
price
quantity_sold
sale_timestamp
payment_type
external_transaction_id
raw_payload_id
```

---

## Phase 3: Build an Operator Dashboard MVP

This is the first truly sellable version of Munchr.

The dashboard should be simple but powerful.

### Page 1: Overview

Metrics:

- Total searches
- Total machine views
- Total directions clicks
- Top searched products
- Top searched buildings
- Searches with no result
- Estimated conversions
- Machines with stale inventory

### Page 2: Product Demand

For each product:

- Total searches
- Searches by building
- Searches by time of day
- Searches by week/month
- Search growth over time
- Machines carrying the product
- Machines not carrying the product but near high demand
- No-result searches

Example insight:

```text
Celsius was searched 420 times during finals week.
38% of those searches had no in-stock result within a convenient distance.
Demand was highest near Perkins/Bostock, Bryan Center, and Wilson.
```

### Page 3: Machine Performance

For each machine:

- Machine views
- Directions clicks
- Products driving views
- Inventory freshness
- Estimated stockouts
- Search-to-view rate
- View-to-directions rate
- Sales if available

Example insight:

```text
The Bryan Center machine gets high traffic but has repeated no-result searches for energy drinks after 8 PM.
```

### Page 4: Building-Level Demand

For each building:

- Top searched products
- Search volume by time of day
- Nearby machines
- Products unavailable nearby
- Potential stocking recommendations

Example insight:

```text
Gross Hall has high late-night snack search volume, but few nearby vending options with high-protein products.
```

### Page 5: Unmet Demand

This is one of the most important pages.

Show:

- Searches with zero results
- Searches where nearest match is far away
- Searches where machine inventory was stale
- Products searched repeatedly but not stocked nearby

Example metric:

```text
Lost demand = searches for a product where no nearby in-stock option existed.
```

### Page 6: Recommendations

Start with simple rules, not complex AI.

Possible recommendation rules:

```text
If a product is searched often in a building but not stocked nearby, recommend adding it to the nearest machine.

If a product gets high searches but low conversion, check stock accuracy or machine visibility.

If a product repeatedly sells out, increase par level or restock frequency.

If a machine has high views but low sales, evaluate product mix or payment issues.

If a product has no searches and low sales, consider replacing it.
```

---

## Phase 4: Inventory Ingestion

Before getting official telemetry API access, build flexible ingestion options.

### Ingestion Option 1: Manual Admin Editor

Build an internal page where you or an operator can update:

- Machine products
- Product quantities
- Product availability
- Prices
- Last restocked time

This is not scalable long-term, but it is excellent for pilots.

### Ingestion Option 2: CSV Upload

Operators may be able to export inventory or sales data from their vending management system. Build CSV import early.

CSV columns to support:

```text
machine_id
machine_name
building
location
slot_id
selection_id
product_name
sku
upc
quantity
capacity
price
last_restocked_at
last_sold_at
sales_count
revenue
```

You should support messy data. Operator exports may not be clean.

Features to build:

- Column mapping
- Product matching
- Machine matching
- Duplicate detection
- Import preview
- Error report
- Import history

### Ingestion Option 3: Scheduled CSV or SFTP Import

Once CSV works manually, automate it.

Possible flow:

```text
Operator system exports CSV daily
↓
CSV uploaded to secure folder or SFTP
↓
Munchr import job runs nightly
↓
Inventory snapshots updated
↓
Dashboard refreshes
```

### Ingestion Option 4: API Integrations

This is the long-term goal.

Possible integration categories:

- Vending telemetry provider APIs
- Cashless payment provider APIs
- Vending management system APIs
- Operator internal APIs

You should design your backend so each provider can be added as a connector.

Suggested structure:

```text
/integrations
  /providers
    cantaloupe.ts
    nayax.ts
    vendsoft.ts
    csv.ts
    manual.ts
  /normalizers
    normalizeMachine.ts
    normalizeProduct.ts
    normalizeInventory.ts
    normalizeSales.ts
  /jobs
    syncInventory.ts
    syncSales.ts
    refreshAnalytics.ts
```

The rest of your app should not care where the data came from. Everything should be normalized into your internal schema.

---

# 5. Real-Time Inventory Strategy

## Levels of Inventory Accuracy

You can present inventory confidence to users.

### Level 1: Manual Inventory

```text
Updated manually by Munchr or operator.
Accuracy: low to medium.
```

### Level 2: Recent Operator Export

```text
Updated from operator CSV or report.
Accuracy: medium.
```

### Level 3: Telemetry-Based Inventory

```text
Updated from vending telemetry or inventory system.
Accuracy: high.
```

### Level 4: Sales-Adjusted Inventory

```text
Inventory starts from restock quantity and decrements with sales events.
Accuracy: high, assuming telemetry is reliable.
```

## User-Facing Inventory Labels

Avoid overpromising. Use labels such as:

```text
Likely in stock
Low stock
May be out of stock
Inventory updated 2 hours ago
Inventory updated yesterday
Inventory unknown
```

This is safer than saying “definitely in stock” unless you truly know.

---

# 6. Conversion Rate Strategy

Conversion tracking is powerful but tricky.

## Weak Conversion

A weak conversion is when a user takes a high-intent action.

Examples:

```text
User searches "Celsius"
↓
Clicks a machine carrying Celsius
```

or:

```text
User searches "Celsius"
↓
Clicks directions to a machine carrying Celsius
```

This does not prove a sale, but it shows intent.

## Medium Conversion

A medium conversion uses approximate location.

Example:

```text
User searches "Celsius"
↓
Clicks a machine
↓
Later appears near that machine within 20 minutes
```

This suggests a likely machine visit, but still does not prove purchase.

## Strong Conversion

Strong conversion requires sales data.

Example:

```text
User searches "Celsius"
↓
Clicks directions to Bryan Center machine
↓
Telemetry shows Celsius sold from that machine within 10 minutes
```

This still may not prove the exact user bought it, but it supports search-to-sale attribution.

## Recommended Wording

Use careful language:

- “Estimated conversion”
- “Attributed sales”
- “Search-to-sale correlation”
- “Likely conversion”
- “Post-search sales lift”

Avoid saying:

- “Guaranteed conversion”
- “This exact user purchased”
- “Perfect attribution”

---

# 7. Analytics Metrics to Build

## Student Demand Metrics

```text
total_searches
unique_searchers
searches_per_session
top_queries
top_products
top_categories
top_buildings
searches_by_hour
searches_by_day
searches_by_week
searches_during_finals
searches_during_move_in
searches_during_game_days
```

## Product Metrics

```text
product_search_count
product_view_count
machine_clicks_for_product
directions_clicks_for_product
no_result_count
nearest_machine_average_distance
stockout_count
estimated_conversion_rate
sales_after_search
```

## Machine Metrics

```text
machine_views
directions_clicks
searches_resolved_by_machine
products_driving_machine_views
inventory_freshness
stockout_frequency
sales_count
revenue
view_to_directions_rate
search_to_machine_click_rate
```

## Building Metrics

```text
building_search_volume
top_products_by_building
unmet_demand_by_building
machine_coverage_score
average_distance_to_result
late_night_demand
demand_by_season
```

## Operator Metrics

```text
estimated_lost_revenue
stockout_risk
restock_priority_score
product_mix_score
machine_opportunity_score
```

---

# 8. Recommendation Engine Ideas

Start simple. You do not need machine learning at first.

## Rule-Based Recommendations

### Add Product Recommendation

```text
If product_searches_in_building are high
AND nearby_machines_with_product are low
THEN recommend adding product to nearby machine.
```

### Increase Restock Recommendation

```text
If product sells out often
AND search demand remains high after stockout
THEN recommend higher par level or more frequent restocking.
```

### Replace Product Recommendation

```text
If product has low sales
AND low search demand
AND takes up slot space
THEN recommend replacing it with high-demand product.
```

### Machine Placement Recommendation

```text
If building has high search volume
AND average distance to relevant machine is high
THEN recommend adding or relocating machine.
```

### Seasonal Recommendation

```text
If product demand spikes during finals
THEN recommend increasing stock before finals week.
```

Example:

```text
Energy drink searches increased 68% during finals week. Consider increasing Celsius, Red Bull, and Monster stock in Perkins/Bostock, Bryan Center, and Wilson from April 25 to May 6.
```

---

# 9. Business Development Roadmap

## Immediate Goal

Your immediate business goal is not to sell the company.

Your immediate business goal is:

> Get one operator or university partner to pilot Munchr with real vending inventory and/or sales data.

That pilot gives you:

- Legitimacy
- Real data
- Testimonials
- Case study
- Product feedback
- Potential revenue
- Investor/buyer credibility

## Best Initial Customer

The best initial customer is likely a vending operator, not the university.

Why?

Operators care about:

- More sales
- Better stocking
- Faster restocking
- Better product mix
- Reducing lost revenue
- Winning/renewing campus contracts

Universities care too, but they often move slowly and may not directly control the vending operation.

## Likely Buyer Types

### 1. Vending Operators

Most likely buyer.

Examples:

- Canteen
- Regional vending companies
- Campus vending operators
- Operators contracted by universities, hospitals, airports, offices, etc.

Pitch:

> Munchr helps you increase sales by making inventory discoverable and showing unmet demand.

### 2. Universities

Good secondary buyer.

Pitch:

> Munchr improves student experience and campus convenience.

### 3. Vending Technology Companies

Potential partner or acquirer.

Pitch:

> Munchr adds a modern consumer discovery layer and demand analytics interface on top of vending telemetry.

### 4. Foodservice Companies

Possible later buyer.

Examples:

- Compass Group
- Aramark
- Sodexo

Pitch:

> Munchr extends campus retail intelligence beyond dining halls and into unattended retail.

---

# 10. Outreach Plan

## Who to Contact First

Start with people close to Duke.

Possible targets:

- Duke Stores vending contact
- Duke Dining leadership
- Duke Student Affairs
- Duke Innovation & Entrepreneurship
- Duke OIT innovation contacts
- Campus facilities or auxiliary services
- Canteen regional manager
- Compass Group/Canteen innovation or campus accounts team

## Best Outreach Angle

Do not say:

> I built an app and want to sell it.

Say:

> I built a student-facing vending discovery app that can generate demand analytics for operators. I’d like to explore a small pilot using Duke vending data to understand whether student search behavior can improve stocking and sales.

## What to Ask For

Ask for a conversation, not a purchase.

Good ask:

```text
Would you be open to a 20-minute conversation where I can show the current app and get your feedback on whether a pilot would be useful?
```

## What You Need From Them

For a pilot, you ideally need:

```text
machine list
machine locations
product list
inventory export
sales export
restock timestamps
operator feedback
permission to run student-facing app
```

If they cannot give API access, ask for CSV exports.

---

# 11. Outreach Email Template

Subject: Student-built vending discovery app for Duke pilot

```text
Hi [Name],

I’m a Duke student and built Munchr, a web app that helps students find vending machines on campus, search what snacks and drinks are available, and locate the nearest machine.

I’m now expanding it into an operator-facing analytics tool that can show product demand trends, popular searches by building and time period, unmet demand, and eventually search-to-sale conversion when connected with vending inventory or telemetry data.

I’d love to explore a small pilot with Duke’s vending operation. The goal would be simple: use Munchr’s student search data plus vending inventory or sales data to identify which products are most in demand, where stockouts may be happening, and where product mix could be improved.

Would you be open to a 20-minute conversation? I can show the current app and a prototype dashboard.

Best,
[Your Name]
```

---

# 12. Follow-Up Email Template

Subject: Following up on Munchr vending pilot idea

```text
Hi [Name],

I wanted to follow up on my note about Munchr, the student-built vending discovery app for Duke.

The reason I think this could be useful for operators is that vending sales data shows what people bought, but Munchr can also show what students searched for and could not find. That could help identify missed demand, stockout issues, and opportunities to improve product placement.

I’d be grateful for even a short conversation to get your feedback. If helpful, I can keep the pilot very lightweight: a limited set of machines, basic inventory data, and a short weekly analytics report.

Best,
[Your Name]
```

---

# 13. LinkedIn / Short Message Template

```text
Hi [Name], I’m a Duke student and built Munchr, a web app that helps students find vending machines and search available snacks/drinks on campus. I’m exploring whether it could help vending operators understand student demand, stockouts, and product placement opportunities. Would you be open to a quick conversation or able to point me to the right person?
```

---

# 14. Meeting Script

## Opening

```text
Thanks for taking the time. I built Munchr because students often don’t know where vending machines are or what’s in them. The app lets users search for snacks, view machines, and find the closest option.

What I’m exploring now is whether the search data generated by students could be useful for vending operators — especially for understanding unmet demand, stockouts, and product mix opportunities.
```

## Show Current App

Demo:

1. Search for a product.
2. Show matching machines.
3. Turn on location/nearest machine.
4. Browse machine inventory.
5. Explain how each action can become analytics.

## Explain Operator Value

```text
Sales data shows what people bought. Munchr can show what people wanted, including products they searched for but couldn’t find nearby.
```

## Pilot Ask

```text
I’d love to test this with a small pilot. It could start with a limited number of machines and a weekly report showing top searches, unmet demand, and possible product placement recommendations.
```

## Questions to Ask Them

Ask:

```text
How do you currently track machine inventory?
Do your machines use telemetry or a vending management system?
Can you export product, inventory, or sales data?
How often do you restock machines?
How do you decide which products go in which machines?
What are the biggest pain points in campus vending?
Do stockouts happen often?
Are there products students frequently request?
Would demand data by building be useful?
What would make this valuable enough to pay for?
```

---

# 15. Pilot Proposal

## Pilot Length

Recommended pilot length:

```text
4 to 8 weeks
```

## Pilot Scope

Start small:

```text
10 to 25 vending machines
1 campus
manual or CSV inventory updates
weekly operator analytics report
student-facing app remains live
```

## Pilot Goals

The pilot should answer:

1. Do students use Munchr?
2. What products do they search for?
3. Where is demand highest?
4. What searches fail because products are unavailable?
5. Can operator inventory/sales data improve the app?
6. Can Munchr generate useful stocking recommendations?

## Pilot Deliverables

Deliver:

```text
student-facing vending search app
operator dashboard prototype
weekly analytics report
unmet demand summary
product recommendations
machine-level performance summary
final pilot report
```

## Data Needed

Minimum data:

```text
machine locations
machine product lists
basic inventory availability
```

Better data:

```text
sales by machine/product/time
restock events
slot-level inventory
prices
telemetry updates
```

## Pilot Success Metrics

Possible success metrics:

```text
500+ student searches
100+ machine views
50+ directions clicks
identification of top 10 high-demand products
identification of top 5 unmet-demand buildings
at least 3 actionable stocking recommendations
operator says dashboard/report is useful
```

---

# 16. Pricing Strategy

Do not lead with pricing in the first conversation. First validate the value.

Possible pricing models:

## Pilot Pricing

Options:

```text
Free pilot in exchange for data access and testimonial
$250-$500/month pilot
$1,000 fixed pilot fee
```

For your first pilot, free or cheap is fine if you get:

- Real data
- Feedback
- Permission to use results in a case study
- Testimonial if successful

## Campus SaaS Pricing

Possible pricing:

```text
$500-$2,000/month per campus
```

## Per-Machine Pricing

Possible pricing:

```text
$5-$20/month per machine
```

Example:

```text
100 machines x $10/month = $1,000/month
```

## Enterprise Pricing

For larger operators:

```text
custom annual contract
multi-campus pricing
integration fee
analytics dashboard fee
```

Possible structure:

```text
$5,000-$25,000/year depending on machine count and integrations
```

---

# 17. What Not to Do Yet

## Do Not Build Hardware First

Avoid trying to connect directly to machines with your own device unless an operator specifically wants that.

Reasons:

- Hardware maintenance is hard.
- Machines vary widely.
- Operators may not allow modifications.
- Liability increases.
- Deployment becomes slow.
- Software integration is cleaner and more scalable.

## Do Not Overbuild AI

Do not start with a complex AI recommendation system.

Start with:

- Clear analytics
- Simple rules
- Actionable reports

Operators will trust simple, explainable recommendations more than black-box AI.

## Do Not Pitch as Just a Student App

A student app is nice. Operator intelligence is sellable.

Do not say:

```text
I made a vending machine map.
```

Say:

```text
I built a vending demand intelligence platform that starts with student-facing search.
```

## Do Not Promise Perfect Real-Time Accuracy Too Early

Until telemetry integration is live, use careful wording:

- likely in stock
- recently updated
- low confidence
- inventory may vary

---

# 18. Product Positioning

## Simple Positioning

```text
Munchr helps campus vending operators understand what students want and where they want it.
```

## More Technical Positioning

```text
Munchr connects consumer search behavior with vending inventory and sales data to reveal unmet demand, stockout risk, and product placement opportunities.
```

## Student-Facing Tagline

```text
Find the snacks you want, wherever you are on campus.
```

## Operator-Facing Tagline

```text
Know what students want before they walk away.
```

## Best One-Sentence Pitch

```text
Munchr is a campus vending intelligence platform that helps students find snacks and helps operators stock the right products in the right places.
```

---

# 19. Suggested Pitch Deck Outline

Create a short 6-8 slide deck.

## Slide 1: Title

```text
Munchr
Campus vending search and demand intelligence
```

## Slide 2: Problem

```text
Students do not know where vending machines are or what they contain.
Operators know what sold, but not what students searched for and could not find.
```

## Slide 3: Current Product

Show screenshots:

- Search
- Machine map
- Machine inventory
- Nearest machine

## Slide 4: Operator Opportunity

```text
Munchr can reveal product demand, unmet searches, building-level trends, and stockout opportunities.
```

## Slide 5: Data Flywheel

```text
Students search
↓
Munchr captures demand
↓
Operators improve stocking
↓
Inventory becomes more accurate
↓
Students trust and use Munchr more
↓
More demand data
```

## Slide 6: Pilot Proposal

```text
4-8 week pilot
10-25 machines
student app + operator dashboard
weekly analytics report
```

## Slide 7: What We Need

```text
machine list
product list
inventory or sales export
operator feedback
```

## Slide 8: Next Step

```text
20-minute pilot discussion
```

---

# 20. Suggested Weekly Execution Plan

## Week 1

Technical:

- Add event tracking.
- Track searches, machine clicks, directions clicks.
- Create anonymous sessions.
- Build basic analytics database tables.

Business:

- Make list of 20 possible contacts.
- Draft outreach email.
- Ask Duke mentors/professors for warm introductions.
- Create simple one-page pilot summary.

## Week 2

Technical:

- Build basic internal analytics page.
- Show top searches and top machines.
- Add no-results tracking.
- Add inventory freshness fields.

Business:

- Send first 5-10 outreach emails.
- Contact Duke Innovation & Entrepreneurship.
- Contact Duke Stores/Dining.
- Identify vending operator contacts.

## Week 3

Technical:

- Build operator dashboard MVP.
- Add product demand page.
- Add machine performance page.
- Add unmet demand page.

Business:

- Conduct first meetings.
- Ask what vending systems/operators use.
- Ask whether CSV exports are possible.
- Refine pitch based on feedback.

## Week 4

Technical:

- Build CSV import.
- Build product matching/aliasing.
- Build import history.
- Start generating weekly analytics reports.

Business:

- Propose pilot structure.
- Ask for limited data access.
- Offer free/cheap 4-8 week pilot.
- Try to secure one official pilot partner.

## Month 2

Technical:

- Improve dashboard.
- Add recommendations engine.
- Add inventory confidence scoring.
- Add sales/import data if available.

Business:

- Run pilot.
- Send weekly report.
- Collect feedback.
- Document outcomes.

## Month 3

Technical:

- Build API connector architecture.
- Begin exploring telemetry provider integrations.
- Add stronger conversion attribution.

Business:

- Turn pilot into case study.
- Ask for testimonial.
- Approach second campus/operator.
- Begin discussing paid contract.

---

# 21. Technical Checklist

## Analytics Checklist

- [ ] Track searches
- [ ] Track no-result searches
- [ ] Track machine clicks
- [ ] Track product clicks
- [ ] Track directions clicks
- [ ] Track location permission events
- [ ] Track approximate user location or building context
- [ ] Create anonymous user/session IDs
- [ ] Build event table
- [ ] Build dashboard metrics queries

## Inventory Checklist

- [ ] Add inventory snapshots
- [ ] Add inventory source field
- [ ] Add inventory confidence score
- [ ] Add last-updated timestamp
- [ ] Add manual update tool
- [ ] Add CSV import
- [ ] Add product matching
- [ ] Add machine matching
- [ ] Add import history
- [ ] Add stale inventory warnings

## Operator Dashboard Checklist

- [ ] Overview page
- [ ] Product demand page
- [ ] Machine performance page
- [ ] Building demand page
- [ ] Unmet demand page
- [ ] Recommendations page
- [ ] Exportable weekly report
- [ ] Role-based operator login

## Integration Checklist

- [ ] Define provider interface
- [ ] Build CSV provider
- [ ] Build manual provider
- [ ] Research telemetry providers
- [ ] Identify operator vending system
- [ ] Ask for API docs or exports
- [ ] Build scheduled sync jobs
- [ ] Store raw payloads
- [ ] Normalize machine/product/sales data

## Privacy/Security Checklist

- [ ] Avoid storing precise unnecessary location data
- [ ] Use anonymous session IDs
- [ ] Add privacy policy
- [ ] Secure operator dashboard
- [ ] Add authentication
- [ ] Restrict operator data by account
- [ ] Avoid exposing sales data publicly
- [ ] Log admin changes

---

# 22. Business Checklist

## Outreach Checklist

- [ ] Build target contact list
- [ ] Draft email
- [ ] Draft short LinkedIn message
- [ ] Ask for warm introductions
- [ ] Email Duke Stores/Dining
- [ ] Email Duke I&E contacts
- [ ] Find Canteen/regional vending contact
- [ ] Follow up after 5-7 days

## Meeting Checklist

- [ ] Demo current app
- [ ] Show mock dashboard
- [ ] Ask about current inventory system
- [ ] Ask about telemetry/payment provider
- [ ] Ask about pain points
- [ ] Ask about export/API access
- [ ] Ask what metrics would matter
- [ ] Ask what would make this worth paying for

## Pilot Checklist

- [ ] Define pilot scope
- [ ] Define machine count
- [ ] Define data needed
- [ ] Define weekly report format
- [ ] Define success metrics
- [ ] Define pilot length
- [ ] Get permission/test data
- [ ] Run pilot
- [ ] Collect feedback
- [ ] Create final report
- [ ] Ask for testimonial

---

# 23. Key Risks and How to Handle Them

## Risk 1: Inventory Data Is Hard to Access

Mitigation:

- Start with manual updates.
- Build CSV import.
- Ask for exports before API access.
- Make dashboard valuable even with partial data.

## Risk 2: Inventory Is Not Accurate Enough

Mitigation:

- Show freshness timestamps.
- Use confidence labels.
- Avoid promising perfect availability.
- Improve accuracy over time with telemetry.

## Risk 3: Operators Are Slow to Respond

Mitigation:

- Use warm introductions.
- Start with university contacts.
- Approach regional operators.
- Keep ask small: feedback, not purchase.

## Risk 4: Students Do Not Use It Enough

Mitigation:

- Promote through Duke channels.
- Add QR codes near machines.
- Partner with student groups.
- Improve mobile speed.
- Add product images and better search.

## Risk 5: Buyers See It as a Small Student Project

Mitigation:

- Show metrics.
- Show dashboard.
- Use business language.
- Focus on demand intelligence and revenue lift.
- Present a pilot proposal.

---

# 24. The Most Important Metrics to Prove

To make Munchr sellable, prove these:

## Usage

```text
Students actually use the app.
```

Metrics:

- unique users
- searches
- repeat users
- machine views
- directions clicks

## Demand

```text
Students search for specific products often enough to generate useful insights.
```

Metrics:

- top product searches
- searches by building
- searches by time period
- seasonal spikes

## Unmet Demand

```text
Students search for products that are unavailable or inconveniently located.
```

Metrics:

- no-result searches
- far-away result searches
- stale inventory searches

## Operator Value

```text
The data leads to actionable stocking decisions.
```

Metrics:

- recommended product changes
- stockout detection
- product placement opportunities
- possible revenue lift

---

# 25. Final Recommendation

Start both technical development and business outreach immediately, but do not let one block the other.

Your priority order should be:

1. Add analytics tracking.
2. Build a simple operator dashboard.
3. Create a pilot one-pager/deck.
4. Start outreach to Duke/Canteen/operator contacts.
5. Build CSV inventory import.
6. Run a small pilot.
7. Use pilot data to pursue integrations and paid contracts.

The most important thing is to move from:

```text
Cool student app
```

to:

```text
Operator intelligence platform with real demand data
```

That is the version someone might pay for, pilot, partner with, or eventually acquire.

---

# 26. One-Sentence North Star

> Munchr should become the platform that tells vending operators what students want, where they want it, whether machines are stocked to meet that demand, and how product placement can improve sales.

