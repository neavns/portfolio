# Nocturn — Building an AI Night-Out Planner

## The idea

Planning a night out often means stitching together information from several places: maps for venues, event listings for what’s happening, reviews for atmosphere, and another map again to work out whether everything is realistically reachable.

I started building Nocturn to explore a simpler interaction:

Describe the night you want. Get a plan you could actually follow.

The first version focuses on Shoreditch, London. A user can ask for something like _“rooftop drinks, dinner, then house music”_ and receive three distinct itineraries built around real places and events, including suggested timings, map locations and walking-friendly sequencing.

The product is intentionally narrow. Rather than trying to become another general recommendation engine, the MVP is testing one question: will people trust an AI-generated itinerary enough to actually use it for a night out?

## Making AI recommend reality

The biggest constraint I set for Nocturn was that the model shouldn’t be free to invent the night.

A hallucinated answer in a chatbot can be annoying. A hallucinated bar that someone walks twenty minutes to find is much worse.

So Nocturn doesn’t ask an LLM to generate an itinerary from its own knowledge.

Instead, planning is a pipeline.

The user’s request first passes through validation and intent extraction, turning free-form language into structured information such as location, categories, timing and preferences.

Deterministic code then converts that intent into retrieval queries. Real venue candidates are retrieved through Google Places, while live events can be retrieved from a separately maintained event index using geographic, temporal and semantic filters.

Only after real candidates have been retrieved and ranked does an LLM get involved again to assemble and explain the final itinerary.

In simplified form:

Prompt → Intent → Retrieval → Ranking → Itinerary

The distinction is important: AI interprets the request and presents the result; retrieved data establishes what actually exists.

## Ranking a feeling

Retrieval turned out to be only half the problem.

Someone asking for _“somewhere quiet for cocktails before jazz”_ isn’t simply asking for the nearest bar with a high Google rating.

Nocturn therefore builds a candidate pool and ranks places against several signals, including category relevance, location, rating, availability, budget and modifiers extracted from the user’s request.

For events, embeddings provide another signal. Event descriptions are embedded and semantically matched against the user’s intent, then combined with harder constraints such as geography and time.

The aim isn’t to let vector similarity decide the night. It’s to combine fuzzy concepts like vibe with deterministic constraints like distance and opening time.

That has been one of the more interesting problems in the project: translating subjective human language into something a retrieval system can actually reason over.

## Keeping an AI product economically boring

Location APIs can become expensive quickly if every interaction triggers another external request.

For an MVP, I didn’t want sophisticated infrastructure before I knew whether people wanted the product, so I built a relatively simple caching strategy in Supabase.

Places searches are cached by geographic area and intent with short expiration windows. Venue details can live longer, while each generated plan keeps its candidate pool so subsequent refinements can work from the places we’ve already retrieved.

That means a request such as _“make the second plan cheaper”_ doesn’t necessarily require rebuilding the entire search from scratch.

I’ve taken a similar approach elsewhere in the product. Rather than immediately building a full server-side travel-time pipeline, the current version relies on Google Maps for directions where appropriate.

The principle has been consistent: spend complexity only where the MVP needs it.

## Designing refinement, not regeneration

One interaction I’ve been particularly interested in is refinement.

If a user likes most of an itinerary but dislikes one venue, generating an entirely new night isn’t necessarily the right response.

Nocturn keeps the candidate set associated with a generation so that refinements can operate against known alternatives. This makes it possible to change part of a plan while preserving the parts that already work.

It’s a small architectural choice, but an important product one: the goal is for the system to feel like it’s editing a plan with the user, rather than forgetting everything and rolling the dice again.

## Building the product around the experiment

Nocturn is deliberately web-first and doesn’t require an account for the initial experience.

The current system includes anonymous sessions, plan generation and refinement, map-based exploration, analytics instrumentation, shareable read-only plans, privacy-conscious deletion flows, event ingestion and administration tooling.

The stack is intentionally conventional around the AI components: React/Vite, Node.js/Express, Supabase/PostgreSQL, pgvector and external location/mapping services, with LLMs and embeddings used for the parts of the workflow where semantic interpretation is genuinely useful.

Analytics are part of the architecture because the MVP isn’t finished when the itinerary renders. I want to understand whether users refine plans, share them, abandon them or actually find the generated result useful.

## The problems I’m still solving

Nocturn is a work in progress, and some of its hardest problems aren’t solved yet.

Opening-hours data can be incomplete. _“Vibe”_ is inherently subjective. Three independently good itineraries can still feel disappointingly similar. Vendor APIs create both cost and dependency constraints. Live event data introduces another layer of freshness and quality problems.

And ultimately, good offline recommendations are difficult to evaluate from software alone.

Those aren’t details I want to hide behind an AI-generated interface. They’re the problems the MVP is intended to expose.

## Where it stands

The core planning experience is working: a user can describe a night, the system can interpret the request, retrieve real candidates, rank them and construct multiple plans that can then be explored and refined.

I’m currently expanding the retrieval layer beyond venue discovery so that live events can participate directly in planning, using semantic matching alongside location and time constraints.

The larger idea remains deliberately unproven.

Nocturn isn’t interesting to me because an LLM can generate an itinerary. That’s relatively easy.

The interesting question is whether I can build enough retrieval, ranking, grounding and product UX around the model that someone would trust the result enough to leave the house and follow it.