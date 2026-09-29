# From AI Prototype to Production Agentic Workflow

## The problem

When I joined the AI Engineering team, one of my first projects was an experiment: could we take a Product Requirements Document and turn it into structured engineering work?

The idea was to give the system a PRD from Confluence, identify its requirements and affected services, gather relevant organizational and codebase context, and ultimately generate Jira epics and stories that engineers could refine and pick up.

For the initial proof of concept, I worked with another engineer and we had one week.

We built a working prototype.

It was enough to demonstrate the idea, but it also exposed how much harder the production problem would be.

## The first prototype

The POC used several specialized agents:

* a planner that decomposed the analysis into smaller tasks;
* an orchestrator that routed those tasks to the appropriate workers;
* specialized workers that retrieved organizational or codebase context;
* a reviewer that evaluated the accumulated information and decided whether further investigation was required.

The system could take a Confluence PRD, extract requirements, investigate relevant services and generate a proposed Jira structure.

It ran locally and relied on locally available dependencies, including a code knowledge graph.

Most importantly, it had no way to ask for help.

If a requirement was ambiguous or important information was missing, the system still had to produce an answer. It could gather more context, but ultimately it was forced to make a decision.

That became one of the biggest lessons from the prototype.

## From demo to production system

The prototype generated enough interest that we were asked to productionise it.

Another engineer joined the project and I took responsibility for leading delivery while remaining deeply involved in implementation. I managed the delivery roadmap, divided major areas of ownership across the team and built much of the core orchestration layer.

The production system used Python, LangGraph, PostgreSQL/pgvector, Redis/ElastiCache, SSE and React.

Rather than treating analysis as one large prompt, we broke it into explicit phases:

Extraction → Pre-analysis → Analysis → Generation

Extraction loaded the PRD. Pre-analysis identified requirements and potentially affected services. Analysis gathered additional organizational and codebase context. Generation transformed the accumulated understanding into proposed Jira epics and stories.

Each phase had its own responsibilities and evaluation step before the workflow could progress.

This gave us something the original prototype lacked: control over how the model arrived at an answer, rather than only control over the prompt we gave it.

## Building the harness around the model

My main technical responsibility was the orchestration layer.

I built the LangGraph workflow that defined the agents, tools, LLM interactions, state transitions and evaluation loops that moved an analysis through the system.

One of the most useful properties was checkpointing.

Workflow state was persisted to PostgreSQL at defined stages, allowing an analysis to be paused, inspected, resumed or retried without rerunning the entire process. That was useful operationally, but it was particularly valuable when developing a non-deterministic system: individual stages could be inspected and tested without repeatedly executing everything that came before them.

It also enabled one of the most important changes from the POC: human-in-the-loop analysis.

When the system determined that it didn’t have enough information to proceed confidently, it could interrupt the workflow, ask the user for clarification, persist its current state and continue once an answer arrived.

SSE streamed that progress back to the UI so users could see what the system was doing rather than waiting for an opaque process to finish.

## Giving the system access to the codebase

PRDs alone weren’t enough.

To produce useful engineering work, the system needed context about the software that would actually be changed.

The prototype relied on a locally running knowledge graph, which required cloning repositories onto developer machines. That clearly wasn’t viable for production.

Part of productionising the system therefore meant creating cloud infrastructure capable of indexing the organization’s repositories and exposing that information to the analysis workflow.

The orchestration layer could then retrieve codebase context alongside other organizational information during analysis rather than relying solely on what happened to be written in the PRD.

This was an important shift in how I thought about LLM applications: model capability mattered, but context quality and retrieval often mattered just as much.

## The uncomfortable part of a successful POC

The prototype was successful enough that expectations moved faster than our understanding of the problem.

Leadership had started discussing the tool with prospective users while we were still learning how difficult it was to evaluate and productionise. We were consequently working toward aggressive milestones while simultaneously designing the architecture, building infrastructure and trying to understand the quality of a non-deterministic system.

In hindsight, I would have pushed harder to separate “the prototype demonstrates potential” from “we know how to make this reliable.”

Traditional software usually gives you relatively deterministic acceptance criteria. Here, producing an output wasn’t enough. We needed to determine whether the output was complete, grounded in the available context and genuinely useful to an engineer.

That required an evaluation strategy, not just more implementation time.

## Outcome

We delivered the first production milestone, including the human-in-the-loop workflow, and saw an improvement in the quality of the analysis compared with the original prototype.

It still wasn’t where we wanted it to be.

I think that’s an important distinction. The project demonstrated that the workflow could gather context, reason across multiple stages, involve users when information was missing and produce structured engineering work. It did not demonstrate that AI could autonomously turn every PRD into production-ready tickets.

The remaining challenge was less about adding another agent or changing models and more about systematic evaluation: understanding where quality failed, measuring improvements and building the feedback loops needed to improve the system reliably.

## What I’d do differently

If I were starting the project again, I’d invest in evaluation much earlier.

Before expanding the architecture, I’d build a representative dataset of PRDs and expected outcomes, define what a good analysis means at each stage, and establish repeatable evaluations for requirements extraction, service identification, contextual grounding and ticket generation.

I’d also treat human intervention as a first-class part of the product from the beginning rather than something added during productionisation.

The biggest thing I took from the project was that the LLM was only one component of the system.

The difficult engineering was everything around it: retrieving the right context, managing state, handling uncertainty, giving humans control, observing what the system was doing and creating a way to evaluate whether its answers were actually getting better.