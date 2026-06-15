# Munchr Use Cases: Deep Research, Product Strategy, and Opportunity Map

**Prepared for:** Munchr / Duke vending discovery project  
**Date:** June 14, 2026  
**Format:** Markdown research document  
**Purpose:** Identify, organize, and deeply explain the possible use cases for Munchr as a student-facing vending discovery app, a campus convenience tool, and an operator-facing vending demand intelligence platform.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Core Thesis](#2-core-thesis)
3. [What Existing Vending Software Already Does](#3-what-existing-vending-software-already-does)
4. [Where Existing Vending Software Is Weak](#4-where-existing-vending-software-is-weak)
5. [Munchr's Strategic Position](#5-munchrs-strategic-position)
6. [Stakeholder Map](#6-stakeholder-map)
7. [Full Use Case Catalog](#7-full-use-case-catalog)
8. [Student-Facing Use Cases](#8-student-facing-use-cases)
9. [Operator-Facing Use Cases](#9-operator-facing-use-cases)
10. [University-Facing Use Cases](#10-university-facing-use-cases)
11. [Vending Technology Partner Use Cases](#11-vending-technology-partner-use-cases)
12. [Data Products Munchr Can Create](#12-data-products-munchr-can-create)
13. [Analytics Dashboard Use Cases](#13-analytics-dashboard-use-cases)
14. [Recommendation Engine Use Cases](#14-recommendation-engine-use-cases)
15. [Inventory and Telemetry Integration Use Cases](#15-inventory-and-telemetry-integration-use-cases)
16. [Search-to-Sale Attribution Use Cases](#16-search-to-sale-attribution-use-cases)
17. [Pilot Use Cases for Duke](#17-pilot-use-cases-for-duke)
18. [Commercialization Use Cases](#18-commercialization-use-cases)
19. [Product Roadmap by Use Case Priority](#19-product-roadmap-by-use-case-priority)
20. [Data Model Implications](#20-data-model-implications)
21. [Privacy, Security, and Trust Use Cases](#21-privacy-security-and-trust-use-cases)
22. [Risks, Limitations, and Mitigations](#22-risks-limitations-and-mitigations)
23. [Example Reports Munchr Could Generate](#23-example-reports-munchr-could-generate)
24. [Recommended MVP Scope](#24-recommended-mvp-scope)
25. [Long-Term Vision](#25-long-term-vision)
26. [Research Sources](#26-research-sources)

---

# 1. Executive Summary

Munchr can fit into the vending ecosystem as a **consumer-facing demand capture layer** and an **operator-facing demand intelligence layer**.

Traditional vending management systems are built around the machine and the operator. They help answer questions like:

- What sold?
- Which machine needs service?
- Which route should a driver take?
- Which products need to be pre-kitted?
- Which machines have outages, errors, or low inventory?
- Which products generated revenue?

Munchr can answer a different set of questions:

- What did students search for?
- What did they want but fail to find?
- Where did demand appear geographically?
- Which buildings have demand that is not being served?
- Which products are searched for but not stocked nearby?
- Which machines receive high interest but low engagement?
- Which products may sell more if moved to different machines?
- Which products are popular during finals, late nights, basketball games, move-in, or exam periods?

The deepest insight is this:

> **Sales data only records fulfilled demand. Munchr can capture unfulfilled demand.**

This makes Munchr complementary to existing vending software. The goal should not be to replace Cantaloupe Seed, Nayax Core/MoMa, Parlevel, VendMAX, Televend, VendSoft, or an operator's internal system. Instead, Munchr should sit above or beside those systems as a **demand intelligence interface** that begins with a useful student app.

The product's strongest near-term path is:

1. Keep improving the student-facing vending search app.
2. Instrument every search, click, no-result event, and directions action.
3. Build an internal analytics layer.
4. Convert that analytics into a simple operator dashboard and weekly report.
5. Add manual/CSV inventory ingestion.
6. Run a small Duke pilot.
7. Use pilot data to demonstrate whether search behavior can improve stocking decisions.
8. Later integrate with vending management systems, telemetry providers, or operator exports.

In short:

> **Munchr is not just a vending machine finder. Munchr is a demand sensor network for campus vending.**

---

# 2. Core Thesis

## 2.1 The vending software market is machine-centric

Most vending technology starts from the machine. Modern systems ingest data from vending machines, payment readers, telemetry devices, route drivers, and warehouse workflows. They help operators optimize routes, reduce stockouts, reconcile cash, pre-kit products, monitor machine health, and update prices remotely.

This is valuable, but it reflects only the operator's side of the world.

A vending operator may know that Machine A sold 24 Celsius cans this week. But the operator may not know that students searched for Celsius 150 times near a different building where no machine carried Celsius. That invisible demand is the core opportunity.

## 2.2 Munchr is student-centric

Munchr begins from the student's intent:

- “Where is the nearest vending machine?”
- “Where can I get Celsius?”
- “Does the Bryan Center machine have Pop-Tarts?”
- “Which machine near Perkins has Diet Coke?”
- “I am in Gross Hall late at night. What is nearby?”

Those intent signals are valuable because they exist before a sale happens. They can reveal missing products, poor placement, stale inventory, and convenience gaps.

## 2.3 The best product is two-sided

The strongest Munchr product is two-sided:

### Side 1: Student-facing utility

Students get:

- Machine discovery
- Product search
- Location-aware recommendations
- Inventory browsing
- Directions
- Eventually prices, nutrition, allergens, caffeine, dietary tags, product images, and freshness labels

### Side 2: Operator-facing analytics

Operators get:

- Search demand
- Building-level demand
- Unmet demand
- No-result searches
- Stale inventory signals
- Search-to-sale correlation
- Product placement recommendations
- Restock and par-level insights
- Seasonal demand reports

The student app is the wedge. The operator dashboard is the business.

---

# 3. What Existing Vending Software Already Does

Munchr should be built with a clear understanding of what existing operator software already provides. This is important because the best strategy is not to rebuild the entire vending management stack.

## 3.1 Common software category names

The software used by vending operators is usually called one or more of the following:

- Vending Management System, or VMS
- Telemetry platform
- Cashless management platform
- Remote vending monitoring software
- Route management software
- Pre-kitting software
- Warehouse and vending inventory management software
- Unattended retail management platform

## 3.2 Common vendors and tools

### Cantaloupe Seed / Seed Pro / Seed Cashless+

Cantaloupe positions Seed Pro as an enterprise vending management system that helps operators determine where to go, when to go, and what to take. It supports route optimization, pre-kitting, operational insights, and broader vending management workflows. Seed Cashless+ is marketed toward smaller or growing operators and includes machine depletion alerts, machine-level pre-kitting, and real-time alerts.

Important implication for Munchr:

> Operators using Cantaloupe may already have strong internal visibility into sales, machine depletion, route planning, and restock needs. Munchr should not compete on those features first. Munchr should complement them with student demand data.

### Canteen iVend + Cantaloupe Seed Pro

Canteen has publicly described an integration between Seed Pro and iVend, its proprietary vending management software. The integration is described as improving real-time reporting, service schedules, restock preparation, and technician dispatching.

Important implication for Munchr:

> If Duke's vending operator is Canteen or a Compass Group-related entity, there may already be a sophisticated internal VMS. Munchr's value is not “give them a dashboard.” It is “give them a new type of demand signal they do not already have.”

### Nayax Core / Nayax MoMa

Nayax provides cashless payment systems, telemetry, and management tools. Nayax MoMa is a mobile app that brings Nayax Core management functions to a smartphone. Nayax also documents DEX audit information, including sales, product stock levels, and machine events.

Important implication for Munchr:

> If a machine has Nayax readers, the operator may already have access to transaction data, inventory-related data, machine status, and mobile management workflows. Munchr can provide search intent and campus demand context around that data.

### Parlevel VMS

Parlevel's VMS emphasizes dynamic routing, pre-kitting, warehouse management, merchandising tools, and the ability to decide which machines need service based on sold-outs, inventory levels, money to collect, and other factors.

Important implication for Munchr:

> Parlevel-like systems optimize how operators serve machines. Munchr can help operators decide what products should be in those machines in the first place.

### VendMAX / CPI

VendMAX is positioned as a mature vending management system with route driver and service technician mobile applications, real-time alerts, over-the-air planogram and price updates, and third-party integrations.

Important implication for Munchr:

> Operators may already have planogram management and price updates. Munchr should focus on demand-informed planogram recommendations, not just planogram editing.

### VendSoft

VendSoft emphasizes inventory across warehouse, trucks, and machines; pick lists; route optimization; and profit per machine.

Important implication for Munchr:

> Smaller operators may not have enterprise systems, but they still often need route, inventory, and profit management. Munchr's CSV-first integration path could be attractive to this segment.

### Televend, Vendon, VendingMetrics, VendingTracker, and others

Other platforms provide telemetry, inventory visibility, route planning, monitoring, sales dashboards, and related operator workflows.

Important implication for Munchr:

> There are many machine-side platforms. Munchr should be integration-friendly rather than vendor-specific.

## 3.3 Core incumbent capabilities

Existing vending operator systems commonly provide:

| Capability | What it means | Should Munchr rebuild this? |
|---|---|---|
| Sales reporting | Revenue and vend counts by machine/product/time | No, ingest if available |
| Inventory tracking | Estimated or telemetry-based stock levels | Partially, only as needed for student search |
| Dynamic routing | Decide which machines drivers should visit | No, maybe provide demand inputs later |
| Pre-kitting | Tell drivers/warehouse what to bring | No, maybe provide demand-based recommendations later |
| Machine health | Offline, jammed, power issue, payment issue alerts | No, ingest status if available |
| Cash reconciliation | Cash collected vs. meters/sales | No |
| Remote price changes | Update prices across machines | No |
| Planogram management | Track slot/product layout | Partially, for search and recommendations |
| Warehouse inventory | Product movement from warehouse to truck to machine | No |
| Driver apps | Mobile app for restocking and service | No |
| Operator reports | Sales, margin, inventory, route reports | Partially, but only demand-focused |

The key point:

> **Munchr should not try to become a general-purpose vending management system before it has won the demand-intelligence niche.**

---

# 4. Where Existing Vending Software Is Weak

Existing vending systems are powerful, but they have blind spots. Munchr should focus on these gaps.

## 4.1 They see sales, not failed intent

A vending operator can see that a product did not sell. But that does not necessarily mean students did not want it.

Possible explanations for low sales:

- Product was not stocked in the right building
- Machine was too far away
- Product was sold out
- Inventory data was stale
- Machine was hard to find
- Machine was offline
- Product was in a machine students did not know existed
- Students searched for an alias that did not match the product name
- Students wanted the product at a different time of day

Munchr can reveal many of these cases.

## 4.2 They do not capture nearby demand that walks away

If a student searches for “protein bar” in Gross Hall and no nearby machine carries one, no transaction happens. Traditional sales data records nothing.

Munchr can record:

- Query: protein bar
- Location context: Gross Hall area
- Result count: 0 or low
- Nearest match distance: far
- Time: late night / weekday / finals week
- Follow-up action: no machine click, or click to a far machine

This is extremely valuable because it captures demand that would otherwise disappear.

## 4.3 They may not know why a machine underperforms

A machine might underperform because:

- Wrong product mix
- Poor location visibility
- Nearby students want different products
- Dining hours nearby changed
- Machine inventory is stale
- Payment reader issues discourage users
- Students do not know the machine exists

Munchr can help distinguish these cases by comparing search demand, machine views, directions clicks, and sales if available.

## 4.4 They may not capture student language

Operators think in SKUs, brands, planograms, selection IDs, and product names. Students search casually:

- hot cheetos
- celsius
- monster
- protein shake
- pop tarts
- chips
- diet coke
- red bull
- oreos
- gum
- water
- something healthy
- late night snack

Munchr can become the translation layer between natural student language and operator SKU/product catalogs.

## 4.5 They may optimize routes without optimizing demand

VMS tools can tell drivers which machines to service. But if the product mix is wrong, route efficiency only solves part of the problem.

Munchr can feed a new kind of signal into product mix decisions:

> “Students near this building repeatedly search for products not carried by the nearest machines.”

## 4.6 They may lack campus-specific context

Vending software may know machine locations but not the lived student context:

- Which buildings are academic vs. residential
- Which buildings have late-night study traffic
- Which machines are near gyms
- Which locations spike during finals
- Which locations spike before basketball games
- Which machines are near dining halls that close early
- Which buildings have high caffeine demand
- Which dorms have late-night snack demand

Munchr can encode campus context in ways generic vending software may not.

---

# 5. Munchr's Strategic Position

## 5.1 Best category definition

Munchr should not be described only as:

> A vending machine map.

That undersells the product.

Better category definitions:

- Campus vending search
- Vending demand intelligence
- Consumer discovery layer for unattended retail
- Search-to-stock analytics platform
- Campus convenience intelligence platform
- Student demand sensor for vending operators

Best concise positioning:

> **Munchr helps campus vending operators understand what students want, where they want it, and whether existing machines are stocked to meet that demand.**

## 5.2 Product wedge

The wedge is:

1. Students want to find snacks and drinks.
2. Munchr helps them search vending inventory.
3. Their searches create demand data.
4. Operators can use that demand data to improve stocking.
5. Better stocking improves student trust.
6. More trust leads to more usage.
7. More usage creates better demand data.

This is the data flywheel.

```text
Students search
    ↓
Munchr captures intent
    ↓
Operators improve inventory/product placement
    ↓
Student results become more accurate and useful
    ↓
More students use Munchr
    ↓
Demand data becomes stronger
```

## 5.3 Product moat possibilities

Munchr's moat will not come from a map alone. A map can be copied.

Potential moats:

- Historical campus demand data
- Student search behavior by building and time
- Product alias database specific to student language
- Relationships with universities/operators
- Integration with operator inventory feeds
- Search-to-sale attribution datasets
- Proven product placement recommendations
- Campus-by-campus deployment playbook
- Student distribution and brand recognition

## 5.4 Why campus is a strong initial market

Campuses are attractive because:

- Dense foot traffic
- Repeat users
- Predictable buildings and routines
- Students often move around without cars
- Late-night demand exists
- Dining options have limited hours
- Finals and events create demand spikes
- Operators may serve many machines under one campus contract
- Universities care about student convenience
- Student-built products can gain grassroots adoption

---

# 6. Stakeholder Map

Munchr has multiple stakeholders. Each one has different use cases.

## 6.1 Students

Students want:

- Convenience
- Speed
- Accurate results
- Nearby options
- Product discovery
- Avoiding wasted walks
- Knowing what is open/available late
- Finding specific drinks/snacks

## 6.2 Vending operators

Operators want:

- More revenue
- Fewer stockouts
- Better product placement
- Better route efficiency
- Higher machine profitability
- Better campus contract performance
- Evidence for product decisions
- Fewer complaints
- Better service levels

## 6.3 University administrators

University stakeholders may include dining, auxiliary services, student affairs, facilities, OIT, and campus life.

They want:

- Improved student experience
- Reliable food/beverage access
- Accessibility and convenience
- Better contract oversight
- Reduced complaints
- Data on campus needs
- Potential sustainability benefits from better routing

## 6.4 Vending technology companies

Telemetry/VMS companies want:

- Better consumer-facing experiences
- Differentiated analytics
- Data that complements machine telemetry
- Integrations that increase operator value
- Possible partner ecosystem expansion

## 6.5 Product manufacturers and brands

Later, brands could care about:

- Campus demand for specific SKUs
- Product launch testing
- Regional/student trends
- Demand before sales
- Performance by location type
- Sampling and promotion targeting

This is not the first buyer, but it could become a future use case.

---

# 7. Full Use Case Catalog

This section lists the full universe of use cases. Later sections explain them in more detail.

## 7.1 Student use cases

1. Find the nearest vending machine
2. Search for a specific snack or drink
3. Search by category
4. Search by dietary need
5. Search by caffeine/protein/nutrition attribute
6. Browse a building's vending options
7. Browse a specific machine's inventory
8. Get directions to a machine
9. Avoid walking to machines that likely do not have the desired product
10. Find late-night food/drink options
11. Find vending options near a class, dorm, gym, library, or event venue
12. Compare prices if available
13. See freshness/confidence of inventory
14. Report incorrect inventory
15. Request a product
16. Save favorite products
17. Save favorite machines
18. Receive optional restock/product alerts
19. Discover new products
20. Filter by payment type if known
21. Filter by machine type, such as snack, drink, combo, coffee, frozen, fresh food
22. Accessibility-aware machine discovery
23. Event-aware vending discovery
24. Finals-week study snack discovery
25. Gym-oriented product discovery

## 7.2 Operator use cases

1. Product search demand analytics
2. No-result search analysis
3. Building-level demand analysis
4. Product placement recommendations
5. Stockout inference from search behavior
6. Inventory freshness monitoring
7. Machine-level engagement analytics
8. Search-to-machine view funnel
9. Search-to-directions funnel
10. Search-to-sale attribution if sales data is available
11. Lost demand estimation
12. Product alias intelligence
13. Seasonal demand planning
14. Time-of-day demand planning
15. Late-night demand analysis
16. Finals/weekend/game-day demand analysis
17. New product testing
18. Product replacement recommendations
19. Par-level recommendations
20. Restock frequency recommendations
21. Machine relocation/addition recommendations
22. Contract performance reporting
23. Complaint reduction and service validation
24. Route prioritization signal enhancement
25. Merchandising validation
26. Price sensitivity testing if prices and sales are available
27. Operator weekly reports
28. Multi-campus comparison
29. Account/customer reporting
30. Campus-specific product assortment planning

## 7.3 University use cases

1. Improve student convenience
2. Reduce food-access friction after dining hours
3. Identify underserved buildings
4. Evaluate vending contract performance
5. Support student wellness through healthier product visibility
6. Monitor demand for dietary/allergen-friendly options
7. Understand campus movement and convenience needs without invasive tracking
8. Inform placement of future machines
9. Support sustainability if route visits become better targeted
10. Provide student-built innovation story
11. Reduce student complaints about empty or hidden machines
12. Improve accessibility of vending information
13. Support campus events and finals periods

## 7.4 Technology partner use cases

1. Add consumer discovery to machine telemetry
2. Add demand-side analytics to VMS platforms
3. Create API-driven inventory search experiences
4. Improve planogram recommendations with search demand
5. Provide operators with a modern campus-facing interface
6. Test search-to-sale attribution on top of payment data
7. Build a partner marketplace integration

## 7.5 Brand/manufacturer use cases

1. Identify student demand by product
2. Compare searched demand vs. actual sales
3. Test new products on campuses
4. Measure promotional lift from in-app placement
5. Identify buildings where a product should be stocked
6. Understand category trends among students
7. Support sampling/promo campaigns

---

# 8. Student-Facing Use Cases

## 8.1 Find the nearest vending machine

### User story

As a student, I want to find the nearest vending machine so that I can quickly get a snack or drink without wandering around campus.

### Problem

Students often know vending machines exist but do not know exactly where they are. Campus buildings can be large, vending machines may be hidden in basements or side hallways, and students may not know which buildings have machines.

### Munchr solution

Munchr shows nearby machines based on the user's approximate location or selected building.

### Required data

- Machine latitude/longitude
- Building ID
- Floor or location description
- Machine type
- Machine status if available

### MVP version

Show machine list sorted by distance.

### Advanced version

Show indoor location instructions:

- “First floor near the lobby”
- “Basement across from the elevators”
- “Near the Bryan Center walkway entrance”

### Operator value

More machine visibility can increase traffic to machines students did not know about.

---

## 8.2 Search for a specific product

### User story

As a student, I want to search “Celsius” or “Pop-Tarts” and see which machines carry it.

### Problem

Students usually care about a specific product or category, not merely the existence of a vending machine.

### Munchr solution

Munchr indexes product names, aliases, categories, and machine inventories so students can search naturally.

### Required data

- Product catalog
- Product aliases
- Machine inventory
- Inventory freshness
- Product-machine relationships

### MVP version

Return machines that list the product.

### Advanced version

Rank results by:

- Distance
- Inventory confidence
- Last update time
- Product popularity
- Machine status
- User's current building

### Operator value

Every product search becomes a demand signal.

---

## 8.3 Search by category

### User story

As a student, I want to search “energy drink,” “chips,” “protein,” “candy,” or “water” without knowing the exact brand.

### Problem

Students may not know the exact product name. They may only know what type of item they want.

### Munchr solution

Create category and subcategory tags:

- Energy drinks
- Soda
- Water
- Coffee
- Chips
- Candy
- Cookies
- Protein bars
- Protein shakes
- Gum/mints
- Healthy snacks
- Fresh food

### Required data

- Product categories
- Product aliases
- Search normalization

### Operator value

Category demand can guide assortment even when exact SKU demand is fragmented.

Example:

> If many students search “protein” near Wilson Gym, the operator may stock more protein bars or shakes in nearby machines.

---

## 8.4 Search by dietary need

### User story

As a student, I want to find vegan, gluten-free, nut-free, low-sugar, halal, kosher, or dairy-free options.

### Problem

Vending inventory is usually opaque. Students with dietary needs may not know which machines contain acceptable products.

### Munchr solution

Add dietary tags to products and allow filters.

### Required data

- Product-level nutrition/allergen metadata
- Dietary tags
- Confidence levels for metadata

### MVP version

Use manually curated tags for common products.

### Advanced version

Use UPC/product databases, manufacturer nutrition data, and operator product catalogs.

### University value

This supports student wellness, inclusivity, and accessibility.

### Risk

Dietary/allergen information must be presented carefully. Munchr should link to manufacturer data and avoid making medical guarantees.

---

## 8.5 Search by caffeine, protein, calories, or nutrition attributes

### User story

As a student, I want to find a drink with caffeine, a high-protein snack, or a lower-calorie option.

### Problem

Students often search by need state rather than product name.

Examples:

- “Need caffeine before exam”
- “Protein after gym”
- “Low sugar drink”
- “Healthy snack”

### Munchr solution

Add structured product attributes:

- Caffeine mg
- Protein grams
- Calories
- Sugar grams
- Serving size
- Category

### Operator value

This creates a richer demand profile than SKU-level search alone.

Example:

> Wilson Gym may show high protein-related demand, while Perkins may show high caffeine-related demand.

---

## 8.6 Browse a building's vending options

### User story

As a student in Perkins, I want to see all vending machines in or near Perkins.

### Problem

Students often orient around buildings rather than exact GPS.

### Munchr solution

Let users select a building and see:

- Machines inside the building
- Machines nearby
- Machine types
- Inventory
- Popular products in that building

### Operator value

Building-level views become a proxy for location demand.

---

## 8.7 Browse a specific machine's inventory

### User story

As a student, I want to open a machine page and see what it likely contains.

### Problem

Students do not want to walk to a machine only to find it lacks what they need.

### Munchr solution

Each machine page shows:

- Product list
- Product categories
- Prices if available
- Inventory freshness
- Confidence labels
- Last updated time
- Report issue button
- Directions button

### Operator value

Machine views indicate interest in specific machines and buildings.

---

## 8.8 Get directions to a machine

### User story

As a student, I want directions to the machine carrying the product I want.

### Problem

Even if students know a machine exists, they may not know how to get there.

### Munchr solution

Add a directions button that opens Apple Maps, Google Maps, or campus map instructions.

### Required event tracking

- directions_clicked
- product_id if directions followed a product search
- machine_id
- building_id
- approximate location context

### Operator value

Directions clicks are high-intent demand signals.

---

## 8.9 Avoid wasted walks

### User story

As a student, I want to avoid walking to a machine that is probably out of stock or does not have the product.

### Problem

A failed vending trip is frustrating and decreases future trust.

### Munchr solution

Use inventory confidence labels:

- Likely in stock
- Low stock
- May be out of stock
- Inventory updated today
- Inventory updated yesterday
- Inventory unknown

### Operator value

If students avoid stale or empty machines, operators have stronger incentive to share inventory data.

---

## 8.10 Report incorrect inventory

### User story

As a student, I want to report that a product is missing, sold out, or incorrectly listed.

### Problem

Inventory data can become stale, especially if it is manually maintained or imported infrequently.

### Munchr solution

Add lightweight feedback:

- “Product not here”
- “Machine out of order”
- “Product sold out”
- “Machine moved”
- “Wrong location”
- “Price wrong”

### Required safeguards

- Rate limiting
- Confidence scoring
- Multiple reports before changing public inventory
- Admin review for suspicious reports

### Operator value

Crowdsourced reports can flag stale inventory or service issues faster than scheduled visits.

---

## 8.11 Request a product

### User story

As a student, I want to request that a product be stocked in a nearby machine.

### Problem

Operators may not know what students want unless it is already stocked and selling.

### Munchr solution

Allow students to request products, either explicitly or implicitly through search behavior.

### Use case variants

- Explicit request: “I want Celsius in Gross Hall.”
- Implicit request: repeated searches for Celsius near Gross Hall with no result.

### Operator value

Product requests can become a demand forecast input.

---

## 8.12 Save favorite products and machines

### User story

As a student, I want to save my favorite products or machines.

### Problem

Repeat users often search for the same things.

### Munchr solution

Allow optional favorites without requiring invasive accounts.

### Privacy-first implementation

- Store favorites locally in browser storage initially
- Optional account later
- Avoid tying searches to student identity unless necessary

### Operator value

Aggregated favorite counts can signal product loyalty.

---

## 8.13 Restock or availability alerts

### User story

As a student, I want to know when my favorite product is available again nearby.

### Problem

Students may repeatedly check for popular items.

### Munchr solution

Optional alerts:

- “Celsius is likely available near Perkins.”
- “The Bryan Center machine was updated today.”
- “A machine near you now lists Pop-Tarts.”

### Risk

Notifications can become annoying. This should be optional and probably not part of the first MVP.

---

## 8.14 Discover new products

### User story

As a student, I want to see what's available near me even if I do not know what to search.

### Problem

Vending can be exploratory. Students may be hungry but undecided.

### Munchr solution

Add browse experiences:

- Popular near you
- Newly added
- High caffeine
- Protein options
- Under $2
- Late-night favorites
- Finals week snacks

### Operator value

Discovery can increase sales for products students did not initially search for.

---

## 8.15 Event-aware vending discovery

### User story

As a student near Cameron, Wilson, or another event venue, I want convenient options before or after an event.

### Problem

Campus demand changes dramatically around events.

### Munchr solution

Use event calendars or manual campus context to highlight nearby machines during events.

### Operator value

Event-aware reports could show demand spikes tied to games, concerts, move-in, or finals.

---

# 9. Operator-Facing Use Cases

## 9.1 Product search demand analytics

### Operator question

What products are students searching for most?

### Munchr answer

Show search volume by:

- Product
- Category
- Brand
- Building
- Time of day
- Day of week
- Academic period
- Result status

### Example dashboard card

```text
Top searched products, last 14 days:
1. Celsius — 412 searches
2. Pop-Tarts — 231 searches
3. Diet Coke — 198 searches
4. Hot Cheetos — 174 searches
5. Red Bull — 161 searches
```

### Why this matters

Searches show demand even when no sale occurs.

---

## 9.2 No-result search analysis

### Operator question

What are students searching for that they cannot find?

### Munchr answer

Track searches where:

- Result count is zero
- No nearby result exists
- Only stale inventory results exist
- User abandons after search
- User searches the same thing repeatedly

### Example insight

```text
Gross Hall had 74 searches for protein drinks in the last month.
No machine within a convenient distance listed a protein drink.
```

### Why this matters

No-result searches are lost demand.

---

## 9.3 Building-level demand analysis

### Operator question

Which buildings have the highest demand, and what do students want there?

### Munchr answer

For each building, show:

- Total searches
- Top products
- Top categories
- No-result rate
- Average distance to result
- Time-of-day demand
- Nearby machines

### Example insight

```text
Perkins/Bostock demand is caffeine-heavy after 7 PM.
Wilson Gym demand is protein-heavy from 4 PM to 9 PM.
Dorm-area demand is snack-heavy from 10 PM to 1 AM.
```

### Why this matters

Product placement should vary by building context.

---

## 9.4 Product placement recommendations

### Operator question

Which products should go in which machines?

### Munchr answer

Recommend product placements using rules such as:

```text
If product searches are high in a building
AND nearby machines do not stock the product
AND there is a machine with low-demand products nearby
THEN recommend adding the product to that machine.
```

### Example recommendation

```text
Add Celsius or another energy drink to the Gross Hall machine.
Rationale: 126 energy drink searches near Gross Hall in 30 days; no nearby high-confidence match; nearest result is 0.4 miles away.
```

### Why this matters

This is one of the most monetizable Munchr use cases.

---

## 9.5 Stockout inference from search behavior

### Operator question

Could a product be out of stock even though our system says it is available?

### Munchr answer

Detect suspicious patterns:

- Product has high searches
- Product page gets clicks
- Directions clicks happen
- Shortly afterward, users report missing product
- Search repeats continue
- Sales do not occur if sales data is available

### Example signal

```text
Machine B says Celsius is available, but 6 users reported it missing and no Celsius sales occurred after 18 directions clicks.
Possible stockout or stale inventory.
```

### Why this matters

Inventory records can be inaccurate. Search behavior can be an external validation signal.

---

## 9.6 Inventory freshness monitoring

### Operator question

Which machines have stale inventory data?

### Munchr answer

Track last inventory update by machine and source:

- Manual update
- CSV import
- Telemetry API
- Student report
- Sales-adjusted inference

### Example dashboard

```text
Machines with stale inventory:
- Perkins 1: last updated 6 days ago
- Bryan Center 2: last updated 4 days ago
- Wilson Gym 1: last updated 9 days ago
```

### Why this matters

If inventory is stale, student trust falls. Operators benefit from knowing where data quality is weak.

---

## 9.7 Machine-level engagement analytics

### Operator question

Which machines are students viewing or navigating to?

### Munchr answer

Show:

- Machine page views
- Product-driven machine views
- Directions clicks
- Searches resolved by machine
- View-to-directions rate
- Demand by product for each machine

### Example insight

```text
Bryan Center Machine 3 receives many views but low directions clicks.
Students may be browsing but not finding desired products.
```

### Why this matters

Machine engagement can reveal visibility, product mix, or location issues.

---

## 9.8 Lost demand estimation

### Operator question

How much potential demand are we missing?

### Munchr answer

Estimate lost demand using no-result searches, far-away results, stale inventory, and search abandonment.

### Basic metric

```text
Lost demand event = a product/category search where no convenient high-confidence result exists.
```

### Advanced metric

```text
Estimated lost revenue = lost demand events × assumed conversion rate × average product price
```

### Example

```text
Energy drink lost demand near Perkins:
- 180 high-intent searches
- 42% no convenient result
- Assumed conversion: 8–15%
- Average price: $3.50
- Estimated missed revenue: $21–$47 over period
```

### Why this matters

Operators care about revenue. Lost demand translates Munchr data into commercial language.

---

## 9.9 Product alias intelligence

### Operator question

How do students refer to products?

### Munchr answer

Aggregate query aliases:

- “hot cheetos” → Cheetos Flamin' Hot
- “pop tarts” → Pop-Tarts
- “celsius” → Celsius Energy Drink
- “monster” → Monster Energy
- “protein shake” → Core Power / Premier Protein
- “diet coke” → Diet Coke
- “sour candy” → Sour Patch Kids, Skittles Sour, etc.

### Why this matters

Operator catalogs are SKU-oriented. Student searches are language-oriented. Munchr can bridge the gap.

---

## 9.10 Seasonal demand planning

### Operator question

How does demand change during finals, move-in, basketball season, or holidays?

### Munchr answer

Compare periods:

- Normal weeks vs. finals
- Daytime vs. late night
- Weekdays vs. weekends
- Game days vs. non-game days
- Move-in vs. regular semester

### Example insight

```text
During finals week, caffeine searches increased 68% and late-night snack searches increased 41% around Perkins/Bostock.
```

### Why this matters

Operators can stock proactively before demand spikes.

---

## 9.11 New product testing

### Operator question

Should we add this new product to campus machines?

### Munchr answer

Use Munchr to measure demand before and after placement.

### Possible test design

1. Track baseline searches for product/category.
2. Add product to selected machines.
3. Track search result availability.
4. Track machine views and directions clicks.
5. If sales data is available, compare sales lift.
6. Compare with control buildings.

### Why this matters

Munchr can support low-cost experimentation.

---

## 9.12 Product replacement recommendations

### Operator question

Which low-performing products should be replaced?

### Munchr answer

Combine sales data and search demand:

| Sales | Search demand | Interpretation |
|---|---|---|
| High sales | High search | Keep/increase stock |
| High sales | Low search | Impulse purchase or hidden demand |
| Low sales | High search | Stockout, poor placement, or search-to-sale issue |
| Low sales | Low search | Candidate for replacement |

### Why this matters

Search data helps distinguish a product that is genuinely unwanted from one that is poorly placed or frequently unavailable.

---

## 9.13 Par-level recommendations

### Operator question

How much of each product should be stocked?

### Munchr answer

Use sales data if available, plus search pressure during out-of-stock periods.

### Simple rule

```text
If a product repeatedly sells out and searches continue afterward, recommend increasing par level.
```

### Why this matters

Sales alone may underestimate demand because stockouts cap sales.

---

## 9.14 Machine relocation or addition recommendations

### Operator question

Where should we add or move machines?

### Munchr answer

Identify buildings with:

- High search volume
- High no-result rates
- Long average distance to results
- Limited current machine coverage
- Strong late-night demand

### Example recommendation

```text
Consider adding a machine or expanding assortment near Gross Hall.
The building shows high late-night demand and above-average distance to relevant products.
```

### Why this matters

Machine placement is capital-intensive. Munchr can provide evidence for placement decisions.

---

## 9.15 Contract performance reporting

### Operator question

How can we show the university we are improving service?

### Munchr answer

Generate reports showing:

- Student usage
- Improved product availability
- Reduced no-result rates
- Added products based on student demand
- Faster response to stockouts or reports
- Building coverage improvements

### Why this matters

Campus vending contracts are relationship-driven. Better reporting can help operators retain or win accounts.

---

## 9.16 Campus-specific assortment planning

### Operator question

What product mix should this campus have?

### Munchr answer

Aggregate demand across campus:

- Top categories
- Health-oriented demand
- Energy/caffeine demand
- Late-night snacks
- Gym-oriented demand
- Dorm-oriented demand
- Price sensitivity if available

### Why this matters

Duke demand may differ from another university, hospital, or office. Munchr can make assortment local.

---

# 10. University-Facing Use Cases

## 10.1 Improve student experience

### University question

Can vending be easier and more transparent for students?

### Munchr answer

Yes. A searchable vending inventory app reduces friction and supports student convenience.

### Evidence to collect

- Student searches
- Repeat users
- Directions clicks
- Feedback reports
- Survey responses

---

## 10.2 Identify underserved buildings

### University question

Are some campus areas poorly served by vending?

### Munchr answer

Show buildings with:

- High demand
- Low machine coverage
- Long average distance to products
- High no-result rates
- Late-night demand but limited options

---

## 10.3 Support after-hours food access

### University question

What happens when dining halls are closed?

### Munchr answer

Track late-night searches and nearby machine availability.

### Example report

```text
Between 10 PM and 2 AM, searches concentrate around libraries and residence halls. Top late-night categories: energy drinks, chips, candy, water, protein snacks.
```

---

## 10.4 Accessibility and wayfinding

### University question

Can students find machines more easily, including students with accessibility needs?

### Munchr answer

Add location descriptions, floor info, elevator proximity, and accessible-route notes where available.

---

## 10.5 Vending contract oversight

### University question

Is the operator meeting student needs?

### Munchr answer

Provide aggregate metrics:

- Inventory freshness
- Machine availability
- Product availability
- Student complaints/reports
- Unmet demand
- Response improvements over time

### Important caution

Munchr should be careful not to position itself as adversarial to operators. The better pitch is:

> “We help the university and operator jointly improve campus convenience.”

---

## 10.6 Health and wellness visibility

### University question

Can students more easily find healthier or dietary-friendly options?

### Munchr answer

Add tags for healthier snacks, water, low-sugar drinks, protein options, and dietary needs.

### Caution

Do not make medical claims. Use “may fit” or “tagged as” language and link to product information.

---

# 11. Vending Technology Partner Use Cases

## 11.1 Consumer discovery layer for VMS platforms

VMS platforms are often built for operators, not students. Munchr can become the consumer-facing interface that sits above their inventory data.

### Partner value

- Better operator value proposition
- Modern mobile/web user experience
- Campus-specific consumer app
- New analytics layer

## 11.2 Demand-side analytics add-on

Telemetry providers know sales and inventory. Munchr adds pre-purchase search intent.

### Integration value

```text
Telemetry sales + Munchr search = demand fulfillment analytics
```

## 11.3 Planogram recommendation enhancement

Existing systems may support planogram updates. Munchr can help recommend what changes should be made based on demand.

## 11.4 Search-to-sale attribution

If Munchr search events can be linked with telemetry sales windows, partners can provide a new analytics product:

```text
User searched for Celsius near Machine 12
↓
User clicked directions
↓
Celsius sale occurred at Machine 12 within 10 minutes
↓
Likely search-assisted purchase
```

This does not prove exact user purchase, but it supports aggregate attribution.

---

# 12. Data Products Munchr Can Create

## 12.1 Campus demand index

A normalized score showing demand by building, category, and time.

Example:

```text
Perkins caffeine demand index: 92/100
Wilson protein demand index: 88/100
Dorm late-night snack demand index: 84/100
```

## 12.2 Unmet demand score

A score representing demand not served by nearby inventory.

Inputs:

- Search volume
- No-result rate
- Distance to nearest result
- Inventory freshness
- Machine status
- Directions abandonment

## 12.3 Inventory trust score

A score showing how reliable a machine's inventory data appears.

Inputs:

- Last update time
- Source quality
- Student reports
- Sales consistency
- Telemetry availability

## 12.4 Product opportunity score

A score estimating where a product should be added.

Inputs:

- Product search volume
- Category search volume
- Nearby availability
- Current machine product mix
- Sales if available
- Time-of-day demand

## 12.5 Machine opportunity score

A score identifying machines where assortment changes could improve performance.

Inputs:

- Machine views
- Searches resolved by machine
- Directions clicks
- No-result demand nearby
- Inventory freshness
- Sales if available

## 12.6 Seasonal stocking report

A report showing how stock should change for:

- Finals
- Move-in
- Game days
- Summer sessions
- Exam weeks
- Orientation
- Weather patterns if relevant

## 12.7 Search alias database

A map from student language to products/SKUs.

Example:

```text
"hot chips" → Cheetos Flamin' Hot, Takis, Doritos Flamas
"energy" → Celsius, Red Bull, Monster
"protein" → Quest Bar, Core Power, Clif Builder's
```

---

# 13. Analytics Dashboard Use Cases

## 13.1 Dashboard page: Overview

### Audience

Operator manager, campus account manager, Munchr admin.

### Metrics

- Total searches
- Unique users/sessions
- Machine views
- Directions clicks
- No-result searches
- Top products
- Top buildings
- Top categories
- Inventory freshness
- Machines with high demand nearby

### Key question answered

Is Munchr generating meaningful demand data?

---

## 13.2 Dashboard page: Product Demand

### Metrics

- Product search count
- Search trend
- Search by building
- Search by hour
- Search result success rate
- Machines carrying product
- No-result rate
- Directions clicks for product

### Key question answered

Which products do students want, and where?

---

## 13.3 Dashboard page: Building Demand

### Metrics

- Search volume by building
- Top products per building
- Top categories per building
- No-result rate
- Average distance to nearest result
- Late-night demand

### Key question answered

Which campus areas are underserved or mis-stocked?

---

## 13.4 Dashboard page: Machine Performance

### Metrics

- Machine page views
- Directions clicks
- Products driving traffic
- Inventory freshness
- Search-to-view rate
- View-to-directions rate
- Sales if available

### Key question answered

Which machines are attracting attention, and which are failing to convert interest?

---

## 13.5 Dashboard page: Unmet Demand

### Metrics

- No-result searches
- Far-away result searches
- Searches with only stale inventory
- Products repeatedly unavailable nearby
- Buildings with unmet demand

### Key question answered

Where is demand being lost?

---

## 13.6 Dashboard page: Recommendations

### Recommendation types

- Add product
- Increase stock
- Replace product
- Move product
- Add machine
- Refresh inventory
- Investigate stockout
- Update product alias

### Key question answered

What should the operator do next?

---

# 14. Recommendation Engine Use Cases

Start with explainable rules. Do not begin with black-box AI.

## 14.1 Add product recommendation

### Rule

```text
If product/category searches in a building exceed threshold
AND no nearby machine carries the product/category
THEN recommend adding product/category to nearest high-traffic machine.
```

## 14.2 Increase par level recommendation

### Rule

```text
If product has high sales
AND stockout reports or post-stockout searches continue
THEN recommend increasing par level.
```

## 14.3 Replace product recommendation

### Rule

```text
If product has low sales
AND low search demand
AND occupies limited slot capacity
THEN recommend testing replacement with high-demand product.
```

## 14.4 Refresh inventory recommendation

### Rule

```text
If inventory data is stale
AND the machine has recent views or directions clicks
THEN recommend refreshing inventory data.
```

## 14.5 Investigate stockout recommendation

### Rule

```text
If product is listed as available
AND users repeatedly report it missing
OR sales stop despite high directions clicks
THEN recommend investigating stockout or inventory mismatch.
```

## 14.6 Seasonal stocking recommendation

### Rule

```text
If product/category searches spike during a known academic period
THEN recommend increasing stock before that period next cycle.
```

## 14.7 Product alias recommendation

### Rule

```text
If many no-result searches are semantically close to existing products
THEN recommend adding alias mapping.
```

Example:

```text
Many users searched "hot chips". Existing products include Cheetos Flamin' Hot and Takis. Add alias mapping.
```

---

# 15. Inventory and Telemetry Integration Use Cases

## 15.1 Manual inventory management

### Use case

Munchr admin manually updates product availability.

### Best for

- Early MVP
- Small pilot
- Limited machine count

### Limitations

- Labor-intensive
- Stale data risk
- Lower trust

## 15.2 Operator CSV import

### Use case

Operator exports machine/product/inventory/sales data and uploads to Munchr.

### Best for

- Pilot with real operator data
- No API access yet
- Fast validation

### Required features

- Column mapping
- Machine matching
- Product matching
- Alias matching
- Error handling
- Import history
- Preview before commit

## 15.3 Scheduled CSV or SFTP import

### Use case

Operator exports data daily or weekly to a folder; Munchr imports automatically.

### Best for

- Semi-automated pilots
- Operators with limited API support

## 15.4 API integration

### Use case

Munchr connects directly to operator/VMS/telemetry systems.

### Best for

- Mature pilots
- Paid contracts
- Multi-campus scaling

### Required architecture

Provider-specific connectors should normalize into internal tables.

```text
Provider API / CSV / Manual Entry
    ↓
Raw payload storage
    ↓
Normalizer
    ↓
Munchr machine/product/inventory/sales schema
    ↓
Student app + operator analytics
```

## 15.5 DEX/MDB-aware integration

Munchr probably should not connect directly to machine hardware early. However, it should understand how operator systems get data.

### DEX

DEX is used to collect audit and event data from vending machines, including sales, product movement, meter readings, and machine events.

### MDB

MDB is a vending machine communication standard used by peripherals such as cashless readers, bill validators, coin mechanisms, and telemetry devices.

### Munchr implication

Munchr should not try to build machine hardware first. Instead, it should ingest normalized output from systems that already handle DEX/MDB.

---

# 16. Search-to-Sale Attribution Use Cases

## 16.1 Weak conversion

### Definition

A user searches for a product and clicks a machine carrying that product.

### Example

```text
Search: Celsius
Click: Bryan Center Machine 2
```

### Confidence

Low to medium.

### Value

Shows product-machine interest.

## 16.2 Medium conversion

### Definition

A user searches, clicks directions, and appears near the machine shortly afterward, using approximate location only.

### Confidence

Medium, but privacy-sensitive.

### Privacy recommendation

Avoid precise location trails. Use coarse zones or event-level proximity only if necessary and disclosed.

## 16.3 Strong aggregate conversion

### Definition

A user searches and clicks directions; a matching product sale occurs at that machine shortly afterward.

### Example

```text
10:02 PM: User searches Celsius near Perkins
10:03 PM: User clicks directions to Bryan Center Machine 2
10:09 PM: Celsius sale recorded at Bryan Center Machine 2
```

### Confidence

Medium at individual level, stronger in aggregate.

### Recommended language

Use:

- likely conversion
- attributed sale
- search-assisted sale
- search-to-sale correlation

Avoid:

- guaranteed conversion
- this exact user bought it
- perfect attribution

## 16.4 Search-to-sale lift experiments

### Experiment design

1. Pick machines/buildings.
2. Track baseline search and sales data.
3. Add product or improve inventory accuracy.
4. Track changes in searches, directions, and sales.
5. Compare against control locations.

### Output

```text
After adding Celsius to Machine X, no-result searches near Building Y decreased by 42%, and energy drink sales increased by 18% compared with baseline.
```

---

# 17. Pilot Use Cases for Duke

## 17.1 Duke MVP pilot thesis

At Duke, Munchr should test whether student search behavior creates useful operator insights.

The pilot does not need perfect telemetry. It needs enough data to prove that:

1. Students search for vending products.
2. Searches vary by building and time.
3. Some searches fail or show unmet demand.
4. Operators can make stocking decisions from that information.

## 17.2 Recommended pilot scope

- 10–25 machines
- 4–8 weeks
- Student app live
- Manual or CSV inventory updates
- Event tracking enabled
- Weekly operator report
- Final pilot report

## 17.3 Minimum data needed

- Machine list
- Machine locations
- Building/floor descriptions
- Product list per machine
- Last inventory update timestamp

## 17.4 Better data

- Slot-level inventory
- Prices
- Sales by machine/product/time
- Restock events
- Stockout events
- Machine status

## 17.5 Weekly pilot report use cases

Each weekly report should include:

- Total searches
- Top searched products
- Top searched categories
- Top buildings
- No-result searches
- Products searched but unavailable nearby
- Machines with high views
- Machines with stale inventory
- Suggested stocking actions

## 17.6 Pilot success metrics

Possible goals:

- 500+ searches
- 100+ machine views
- 50+ directions clicks
- Top 10 product demand list
- Top 5 unmet-demand buildings
- 3–5 actionable recommendations
- Operator says at least one recommendation is useful
- One product placement or inventory process change tested

## 17.7 Most valuable Duke-specific analyses

### Libraries

Likely use cases:

- Late-night caffeine
- Study snacks
- Water
- Quick sugar/candy

### Gyms

Likely use cases:

- Protein drinks
- Protein bars
- Water
- Sports drinks

### Residence halls

Likely use cases:

- Late-night snacks
- Candy
- Drinks
- Breakfast items

### Academic buildings

Likely use cases:

- Between-class drinks
- Coffee/energy drinks
- Quick snacks

### Event areas

Likely use cases:

- Game-day snacks/drinks
- Crowd-driven demand spikes

---

# 18. Commercialization Use Cases

## 18.1 Operator SaaS

### Buyer

Campus vending operator.

### Product

Demand dashboard + student discovery app + reports.

### Value

Increase sales and reduce missed demand.

### Possible pricing

- Pilot: free to $1,000 fixed fee
- SaaS: $500–$2,000/month per campus
- Per-machine: $5–$20/month per machine

## 18.2 University subscription

### Buyer

University auxiliary services, dining, student affairs, campus life.

### Product

Student convenience platform + aggregate demand reports.

### Value

Improve student experience and food access.

## 18.3 VMS/telemetry partner add-on

### Buyer

Cantaloupe, Nayax, Parlevel-like provider, or regional VMS provider.

### Product

Consumer discovery and demand analytics integration.

### Value

Differentiate their platform with demand-side data.

## 18.4 Operator consulting/reporting

### Buyer

Small to mid-sized operators.

### Product

Monthly demand reports and product placement recommendations.

### Value

Lower-touch than full SaaS; easier early monetization.

## 18.5 Brand insights

### Buyer

CPG brands.

### Product

Aggregated, anonymized product demand insights.

### Value

Understand student demand before/without full retail sales visibility.

### Caution

This should be a later opportunity. Student trust and operator trust come first.

---

# 19. Product Roadmap by Use Case Priority

## 19.1 Priority 0: Foundations

Must have:

- Clean machine database
- Clean product database
- Product aliases
- Basic inventory status
- Mobile-friendly search
- Building search
- Location-aware nearest machine

## 19.2 Priority 1: Event tracking

Track:

- search_performed
- no_results_returned
- product_clicked
- machine_clicked
- inventory_viewed
- directions_clicked
- building_filter_used
- category_filter_used
- location_permission_enabled
- location_permission_denied

## 19.3 Priority 2: Internal analytics

Build internal views for:

- Top searches
- Top buildings
- No-result queries
- Machine clicks
- Directions clicks
- Search funnel

## 19.4 Priority 3: Operator dashboard MVP

Pages:

- Overview
- Product demand
- Building demand
- Machine performance
- Unmet demand
- Recommendations

## 19.5 Priority 4: Inventory ingestion

Build:

- Manual admin editor
- CSV import
- Product matching
- Machine matching
- Import history
- Inventory confidence labels

## 19.6 Priority 5: Pilot reporting

Generate:

- Weekly report
- Final report
- Recommendation list
- Case study template

## 19.7 Priority 6: Sales data integration

If operator shares sales data:

- Sales event table
- Search-to-sale windows
- Product-level conversion
- Attributed sales report
- Stockout-adjusted demand estimates

## 19.8 Priority 7: API integrations

Build provider interface for:

- Cantaloupe-like exports/APIs
- Nayax-like exports/APIs
- Parlevel-like exports/APIs
- VendSoft-like exports/APIs
- Generic CSV/SFTP

---

# 20. Data Model Implications

## 20.1 Core entities

Munchr should eventually support:

- operators
- campuses
- buildings
- machines
- machine_slots
- products
- product_aliases
- inventory_snapshots
- search_events
- product_click_events
- machine_view_events
- directions_click_events
- location_events
- student_reports
- restock_events
- sales_events
- telemetry_integrations
- raw_import_payloads
- operator_users

## 20.2 Event data

Every search event should include:

- event_id
- anonymous_user_id
- session_id
- event_type
- timestamp
- campus_id
- query
- normalized_query
- product_id if matched
- category if matched
- result_count
- nearest_result_distance
- building_context
- approximate_location_zone
- device_type
- referrer

## 20.3 Inventory snapshot data

Inventory should be historical, not just current.

Fields:

- inventory_snapshot_id
- machine_id
- slot_id
- product_id
- quantity_estimate
- capacity
- status
- source
- timestamp
- confidence_score
- raw_payload_id

## 20.4 Product alias data

Fields:

- alias_id
- alias_text
- normalized_alias_text
- product_id
- confidence
- source

Sources:

- manual
- user search
- admin mapping
- import
- semantic suggestion

## 20.5 Sales event data

If available:

- sales_event_id
- machine_id
- product_id
- slot_id
- sale_timestamp
- price
- quantity_sold
- payment_type
- external_transaction_id
- raw_payload_id

---

# 21. Privacy, Security, and Trust Use Cases

## 21.1 Student privacy

Munchr should avoid collecting more location data than necessary.

Recommended approach:

- Use anonymous session IDs
- Store approximate building/zone context
- Avoid precise location trails
- Avoid student names/emails unless accounts become necessary
- Make privacy language clear
- Allow use without login

## 21.2 Operator data security

Operator data may include sales, revenue, machine locations, product performance, and route information.

Required safeguards:

- Authentication for operator dashboard
- Role-based access
- Campus/operator-level data isolation
- Secure CSV upload
- Import logs
- No public exposure of sales data

## 21.3 Trust in inventory accuracy

Do not overpromise.

Use labels:

- Likely in stock
- Low stock
- May be out of stock
- Inventory unknown
- Updated today
- Updated 3 days ago

Avoid:

- Definitely in stock
- Guaranteed available

## 21.4 Trust with operators

Operators may worry Munchr exposes failures. Position Munchr as an improvement tool, not a complaint platform.

Better framing:

> “Munchr helps identify unmet demand and improve product placement.”

Avoid framing:

> “Munchr shows where the operator is failing.”

---

# 22. Risks, Limitations, and Mitigations

## 22.1 Risk: Students do not use it enough

### Mitigation

- QR codes on or near machines
- Student group partnerships
- Duke channels
- Better mobile UX
- Product images
- Fast search
- Late-night/finals campaigns

## 22.2 Risk: Inventory data is stale

### Mitigation

- Confidence labels
- Last updated timestamps
- Student reports
- Manual admin updates
- CSV imports
- Telemetry integration later

## 22.3 Risk: Operators already have software

### Mitigation

Do not compete directly with VMS. Sell demand intelligence.

## 22.4 Risk: Operator data access is hard

### Mitigation

Start with manual and CSV. Do not require API access for pilot.

## 22.5 Risk: Attribution is imperfect

### Mitigation

Use aggregate language:

- likely conversion
- search-assisted sale
- correlation
- estimated lost demand

## 22.6 Risk: Product recommendations are not trusted

### Mitigation

Start with simple rules and show the rationale behind every recommendation.

## 22.7 Risk: Scope creep

### Mitigation

Do not build hardware, route optimization, payment processing, or full VMS features first.

---

# 23. Example Reports Munchr Could Generate

## 23.1 Weekly operator report

```markdown
# Munchr Weekly Operator Report

## Summary
- 812 total searches
- 217 machine views
- 104 directions clicks
- 29% no-result or no-nearby-result rate

## Top Products
1. Celsius — 132 searches
2. Pop-Tarts — 88 searches
3. Diet Coke — 74 searches
4. Hot Cheetos — 63 searches
5. Red Bull — 59 searches

## Top Buildings
1. Perkins/Bostock
2. Bryan Center
3. Wilson Gym
4. Gross Hall
5. West Union area

## Unmet Demand
- Protein drinks near Wilson Gym: 44 searches, no high-confidence nearby result
- Celsius near Perkins: 61 searches, nearest high-confidence result 0.3 miles away
- Pop-Tarts near dorm areas: 37 searches, stale inventory only

## Recommendations
1. Add energy drinks to one additional machine near Perkins/Bostock.
2. Test protein drinks/bars near Wilson Gym.
3. Refresh inventory for Bryan Center Machine 2.
4. Add aliases for "hot chips" and "protein shake".
```

## 23.2 Final pilot report

Sections:

- Pilot scope
- Data collected
- Student usage
- Product demand
- Building demand
- Unmet demand
- Inventory accuracy observations
- Recommendations tested
- Results
- Operator feedback
- Next steps

## 23.3 Product placement recommendation report

```markdown
# Product Placement Recommendation: Celsius near Perkins

## Finding
Celsius was the most searched energy drink near Perkins/Bostock over the pilot period.

## Evidence
- 126 searches in 30 days
- 48% had no convenient high-confidence result
- Search volume peaked 8 PM–1 AM
- Existing nearby machines had stale inventory or did not list Celsius

## Recommendation
Add Celsius to one machine in or near Perkins/Bostock for a two-week test.

## Success Metrics
- Reduction in no-result Celsius searches
- Increase in directions clicks to updated machine
- Sales lift if sales data available
- Student feedback reports
```

---

# 24. Recommended MVP Scope

## 24.1 What to build now

Build:

1. Search event tracking
2. No-result tracking
3. Machine click tracking
4. Directions click tracking
5. Product aliases
6. Inventory freshness labels
7. Internal analytics dashboard
8. Weekly report generator
9. Manual inventory editor
10. CSV import prototype

## 24.2 What to avoid now

Avoid:

- Building vending hardware
- Replacing operator VMS
- Payment processing
- Driver route app
- Warehouse management
- Complex AI recommendations
- Exact user tracking
- Overpromising real-time inventory

## 24.3 Best MVP operator pitch

> Munchr is a student-facing vending search app that also gives operators a weekly demand report showing what students searched for, where demand was unmet, and which product placement changes may increase sales.

## 24.4 Best MVP university pitch

> Munchr improves campus convenience by helping students find vending machines and available snacks/drinks, while giving Duke aggregate insight into where vending demand is highest.

---

# 25. Long-Term Vision

Munchr can become the intelligence layer for campus unattended retail.

## 25.1 Stage 1: Vending discovery

Students find machines and products.

## 25.2 Stage 2: Demand analytics

Operators see searches, failed searches, and building-level demand.

## 25.3 Stage 3: Inventory integration

Munchr ingests inventory and sales data from operator systems.

## 25.4 Stage 4: Search-to-sale intelligence

Munchr connects intent to purchases in aggregate.

## 25.5 Stage 5: Campus convenience platform

Munchr expands beyond vending into:

- Micro markets
- Campus convenience stores
- Grab-and-go fridges
- Coffee machines
- Laundry/vending-adjacent campus utilities
- Event-based concessions

## 25.6 North Star

> Munchr should become the platform that tells campus retailers what students want, where they want it, whether inventory is available, and how to close the gap between demand and fulfillment.

---

# 26. Research Sources

This document was informed by the original Munchr roadmap provided by the user, plus public information about vending management systems, telemetry, DEX/MDB, and campus/unattended retail operations.

## 26.1 Existing Munchr roadmap

- `Munchr_Detailed_Business_and_Technical_Roadmap.md`, user-provided project roadmap. Key thesis: Munchr should evolve from a student-facing vending discovery app into a two-sided platform that captures student demand and helps operators understand unmet demand, stockouts, product trends, and search-to-sale conversion.

## 26.2 Vending management systems and operator software

- Cantaloupe Seed Pro: https://www.cantaloupe.com/products/software/seed-pro/
- Cantaloupe Seed Cashless+: https://www.cantaloupe.com/products/software/seed-cashless-plus/
- Cantaloupe Remote Price Change: https://www.cantaloupe.com/products/software/seed-pro/remote-price-change/
- Canteen/Cantaloupe integration: https://www.canteen.com/news/canteen-cantaloupe-new-partnership-means/
- Canteen Seed Pro/iVend deployment coverage: https://www.vendingmarketwatch.com/technology/news/12262449/canteen-to-deploy-cantaloupe-systems-seedtm-pro-across-all-branches
- Nayax MoMa: https://www.nayax.com/solution/moma/
- Nayax Vending Management System: https://www.nayax.com/solution/vending-management-system/
- Nayax MoMa Getting Started: https://nayax-u.nayax.com/article/mo-ma-getting-started-9993
- Nayax DEX overview: https://nayax-u.nayax.com/scenario/overview-of-dex-administration-operations-906
- Parlevel VMS: https://www.parlevelsystems.com/vms/
- CPI VendMAX: https://www.cranepi.com/en/products/self-service-solutions/vending-software/vendmax
- VendSoft: https://www.vendsoft.com/
- VendingMetrics: https://vendingmetrics.com/
- Vendon Cloud: https://vendon.net/products/vendon-cloud/

## 26.3 DEX, MDB, and telemetry context

- VMFS DEX/MDB guide: https://vmfsusa.com/blogs/business/mdb-dex-vending-machines
- Nayax DEX glossary: https://www.nayax.com/glossary/dex/
- Greater Vending MDB/DEX standards explainer: https://greatervending.com/learn/mdb-dex-vending-standards/
- Greater Vending telemetry and remote monitoring explainer: https://greatervending.com/learn/telemetry-remote-monitoring/
- VendSoft DEX article: https://www.vendsoft.com/dex-transform-your-vending-machine-business/
- VendingTracker DEX explainer: https://vendingtracker.com/resources/blog/dex-data-vending-machines

## 26.4 Industry and campus context

- NAMA Foundation Industry Census: https://namanow.org/foundation/census/
- NAMA economic impact report: https://namanow.org/report-economic-impact-convenience-services/
- Compass Group USA education and Canteen context: https://www.compass-usa.com/our-companies/education/
- Canteen education vending services: https://www.canteen.com/education/
- Vending services for colleges and universities: https://vendingexchange.com/vending-for-colleges/vending-services-for-colleges-and-universities

---

# Final Strategic Takeaway

The most important decision is to keep Munchr focused.

Do not build a generic vending management system first. Do not build hardware first. Do not compete directly with the systems operators already use for telemetry, routing, pre-kitting, price changes, and cash reconciliation.

Instead, build the missing layer:

> **Student intent → unmet demand → better stocking decisions.**

That is the use case cluster where Munchr is most differentiated, easiest to pilot, and most likely to become commercially valuable.
