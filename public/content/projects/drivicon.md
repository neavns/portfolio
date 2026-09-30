# Drivicon — Building an Offline Multilingual Driving Theory App

## The idea

Preparing for the UK driving theory test is already a learning problem. For someone who isn’t comfortable reading English, it becomes a language problem too.

I built Drivicon, a cross-platform Flutter app designed to make theory-test practice more accessible to non-native English speakers.

The app combines practice questions, mock tests, explanations, progress tracking and road-sign references with support for 10+ languages.

I wanted the experience to work without relying on an internet connection or translating content on demand, so the application was designed to run almost entirely on the device.

## Offline by design

Drivicon doesn’t depend on a translation API or remote content service during normal use.

Questions, answers, explanations, translations and supporting content are bundled with the application. In the original implementation, the structured content was stored as JSON and imported into a local SQLite database on first launch. User preferences and lightweight application state are persisted separately using SharedPreferences.

There were a few reasons for this.

Driving-theory content changes relatively infrequently, while the same questions are accessed repeatedly. Requiring a network round trip — and potentially paying for translation — every time someone opened a question would have added cost and another failure mode without adding much value.

Keeping the core experience local also meant that practice and mock tests could continue without connectivity.

The trade-off is that content updates require an application/data update rather than appearing instantly, but for this product I considered that an acceptable constraint.

## Supporting 10+ languages without duplicating everything

One of the more interesting design problems was how to represent multilingual content.

The simplest approach would have been to maintain a separate copy of every question for every supported language. That would quickly create duplication and make the underlying content difficult to manage.

Instead, I kept the English content canonical.

Questions, answers, explanations and categories are stored normally, while translations live in a shared table identified by:

`entity → entity type → language → translated value`

Repository queries join the canonical records with their translations and use fallbacks when a translation isn’t available.

That means the same question can be requested in different languages without maintaining ten separate versions of the question bank.

More importantly, adding another language doesn’t require changing the application’s underlying content model.

## The 117-second first launch

The biggest performance problem appeared during database initialization.

On first launch, Drivicon read its bundled JSON dataset, normalized the content and seeded the local SQLite database.

My initial implementation inserted the data largely row by row.

On iOS, initialization took roughly 3 seconds.

On Android, in debug builds, it took as long as 117 seconds.

A two-minute first launch clearly wasn’t acceptable.

Rather than treating Android itself as the problem, I looked at what the application was actually doing during initialization.

There were thousands of related records — categories, questions, answers, explanations and their translations. The application had to parse and transform the source data before paying the additional cost of a large number of individual database operations.

I progressively changed the ingestion strategy.

First, I wrapped related inserts in database transactions and removed unnecessary waits around independent operations.

Android initialization dropped from approximately 117 seconds to 30 seconds.

I then changed translation ingestion to use multi-row SQL inserts, reducing the number of individual operations further.

The result:

- Android: ~117s → ~27s
- iOS: ~3s → ~1s

These measurements were taken in debug mode, so they weren’t intended as release-build benchmarks. What mattered was the relative improvement: the same dataset and development environment became dramatically faster after changing how I interacted with the database.

It was a useful lesson in performance work: sometimes the algorithm isn’t the bottleneck — the number and shape of I/O operations are.

**It also exposed a broader architectural question that I only fully appreciated afterwards: if the dataset is known before the application is built, why perform the transformation and database construction on the user’s device at all?**

## Keeping application state manageable

As the product grew, state started spanning several parts of the application: language, theme, onboarding, test progress, selected answers and translated content.

I used Provider to separate this into two broad areas.

AppConfigProvider owns application-level configuration such as language, theme and localized UI content, while AppStateProvider owns the active test experience and its question state.

That allowed screens to consume the state they needed without passing increasingly large sets of arguments through the widget hierarchy.

The architecture isn’t particularly exotic, and that’s intentional. For the size of the application, Provider gave me a straightforward state model without introducing more machinery than the product needed.

## Building one experience across two platforms

I built Drivicon as a shared Flutter application rather than maintaining separate iOS and Android implementations.

The interface includes custom question and answer components, mock-test flows, corrections, progress visualizations, language selection, onboarding, dark mode and supporting theory-test material.

I chose a shared visual language rather than trying to make the application look independently native to each platform.

That gave me one product and one component system to evolve while still being able to ship across both ecosystems.

For operational visibility, I integrated Sentry for crash reporting, user feedback and lightweight analytics rather than introducing several observability products before the application had justified them.

## Outcome

Drivicon became a functional cross-platform theory-test application supporting 10+ languages, with its core learning experience available entirely offline.

For me, the project was particularly valuable because it forced decisions across the entire product: data modelling, persistence, state management, UI architecture, performance, observability and the compromises required to make one application work well across two platforms.

Most of it was also built before AI-assisted coding became part of my workflow, so the architecture, UI and optimization work were largely implemented by hand.

## What I’d change today

The initialization optimizations improved performance substantially, but looking back, I was optimizing a piece of work that probably shouldn’t have been happening on the user’s device in the first place.

Drivicon’s question bank and translations are largely static and are already known when a version of the application is built. Instead of shipping the source JSON and turning it into a database on first launch, I would move that transformation into the build/content pipeline.

The source content could remain JSON because it is convenient to generate, inspect and maintain. A build-time script would validate and normalize that content, populate the SQLite schema, build the required indexes and produce a ready-to-use `drivicon.db`.

The application would then ship `drivicon.db` as an asset.

On first launch, instead of:

`JSON → parse → normalize → thousands of inserts → build SQLite database`

the application would effectively do:

`bundled drivicon.db → copy to writable storage → open database`

This moves the expensive and deterministic work from runtime to build time. It should make first launch substantially faster and, just as importantly, remove a large amount of initialization logic from the mobile application.

It would also give the content pipeline a stronger validation boundary. Missing translations, invalid relationships, duplicate identifiers or other content problems could be detected while producing drivicon.db, rather than while initializing the database on a user’s device.

If the content eventually needed to change independently of application releases, I’d evolve the same design rather than immediately abandoning it: ship a baseline database with the app and introduce versioned database or content updates separately.

With that approach, the raw multi-row SQL optimization I introduced at runtime would no longer be necessary in the application itself. Bulk inserts and transactions would still be useful, but they would belong in the build-time database generator, where performance work doesn’t affect application startup.

The project reinforced a principle that has appeared repeatedly in my work since: the simplest architecture is only simple if it also works under real constraints.

For Drivicon, those constraints weren’t millions of requests or distributed systems. They were a slow Android startup, ten languages, unreliable connectivity and a user who just wants to open the app and start learning.