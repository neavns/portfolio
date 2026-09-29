# Building a Recommendation Delivery System

## The problem

Our data science team generated personalized customer recommendations every week, producing a **20–30GB+** JSON file containing roughly 50–70 million recommendations and uploading it to S3.

We needed to turn that output into something our web and mobile applications could serve to customers reliably.

The constraints made the ingestion side interesting: the dataset couldn’t fit into the service’s allocated memory, writes couldn’t significantly affect customer-facing reads, and new recommendations needed to become available within **24 hours**.

I wasn’t a senior engineer at the time, but I worked closely with the senior engineer on the project and was heavily involved in designing and implementing both sides of the system.

## The design

We separated the system into two services:

* **Extractor** — an internal Node.js service responsible for ingesting the weekly dataset.
* **Recommendations API** — a small, read-only service responsible for serving recommendations to customer-facing applications.

The extractor streamed the file from S3 rather than loading it into memory. Recommendations were transformed and grouped by customer as they were processed, then written to MongoDB using throttled bulk operations.

Grouping on write was intentional. A customer could only have a small number of recommendations, so storing them together allowed the API to retrieve everything for a customer with a single database read rather than reconstructing the result on every request.

The customer-facing API was deliberately simple: read-only, cacheable and horizontally scalable.

## Choosing simplicity over distributed processing

At 50–70 million recommendations per run, there were several ways we could have approached ingestion.

We considered distributed processing, but our workload was unusual: despite the size of each dataset, we only received one file per week and had 24 hours to make the recommendations available.

A queue-and-worker architecture or a framework such as Spark could have increased throughput, but would also have introduced additional infrastructure, coordination, idempotency and more complex failure handling.

Instead, we chose a singleton streaming process.

A typical 20–30GB file took around 8–9 hours to process. That wasn’t particularly fast, but it comfortably satisfied the 24-hour requirement.

The trade-off was deliberate: we optimized for the requirement rather than maximum throughput.

## Designing an escape hatch

One decision I pushed for was exposing operational controls for the extractor.

Alongside its scheduled execution, I added internal endpoints for inspecting available files and processing state, as well as manually starting, stopping and recovering ingestion.

That proved useful when a production failure caused a partially processed file to be incorrectly recorded as complete. The scheduler would no longer pick it up automatically.

Because the operational API already existed, we could correct the processing metadata and manually rerun the ingestion instead of relying on an improvised recovery process.

It reinforced something I now consider when designing automated systems: the failure path deserves an interface too.

## A mistake that changed how I build software

I also made one decision on this project that I wouldn’t repeat.

Because the recommendation format was relatively simple, I wrote a custom streaming JSON parser. It worked throughout our tests, but in production we occasionally saw parsing failures that I couldn’t reproduce locally.

After verifying the source files with another parser, it became clear that my implementation was the problem.

I replaced it with a mature, widely used library rather than continuing to debug my own implementation.

There was little business value in owning a JSON parser. I had introduced risk into an otherwise straightforward part of the system simply because building it myself seemed manageable.

Since then, I’ve been much more deliberate about distinguishing between problems where custom engineering creates value and solved problems where mature tooling is the better engineering decision.

## Outcome

The system went on to process the new recommendation dataset every week and make it available to our customer-facing applications with very little manual intervention.

For me, that was also validation of the architectural trade-off. We didn’t build the fastest or most sophisticated ingestion platform; we built one that could process tens of millions of recommendations within the required window and operate largely unattended.

## What I’d change today

I wouldn’t fundamentally redesign the system.

Processing 50–70 million recommendations in 8–9 hours was well within our 24-hour requirement, so the singleton architecture remained a reasonable trade-off.

The main weakness was recovery. If ingestion failed sufficiently far into a file, processing had to restart. Today I’d prefer a resumable exchange format such as NDJSON combined with durable checkpointing and idempotent writes, allowing processing to resume from a known position rather than starting from the beginning.

I’d also investigate bounded concurrency within the existing process before introducing distributed infrastructure.

Only if file sizes, frequency or delivery requirements changed enough that this architecture stopped meeting its targets would I consider moving towards distributed processing.

For the workload we actually had, not building the more sophisticated system was part of the design.