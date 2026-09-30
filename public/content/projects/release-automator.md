# Taking an Internal Tool from One Team to ~75% Adoption

## The problem

Releasing software involved a surprising amount of administration.

For every production release, engineers had to create a Jira release ticket, find and link the work being deployed, record the relevant changes, fill in deployment metadata and eventually create the corresponding GitLab release.

None of these steps were particularly difficult. Together, they took roughly 10–20 minutes per release and were repeated across engineering teams every day.

A year or two after joining the company, I discovered that an engineer had built a small Slack bot to automate parts of this process. It was a side project, used by a single team, and its creator was preparing to leave the company.

I liked the idea enough that I asked them to onboard me and took ownership of it.

## Growing a side project

Release Automator wasn’t part of my assigned product work.

I became its sole maintainer and worked on it whenever I had capacity alongside my main responsibilities.

Initially, there were limits to what I could do. Our CI/CD environment was based on an ageing version of GoCD, and the tool itself needed significant work. I continued maintaining and improving it, but adoption remained relatively limited.

The opportunity to rethink it came when the company migrated its CI/CD infrastructure to GitLab.

I used that transition to rebuild Release Automator around the new workflow.

The core idea remained intentionally simple: an engineer could initiate a release through Slack and the tool would take care of the repetitive coordination around it.

It could:

* create the release ticket in Jira;
* identify and link the merge requests included in the release;
* link the associated Jira tickets;
* populate team, department and deployment metadata;
* create the corresponding tagged release in GitLab.

What previously required moving between systems and manually assembling release information could now be initiated through a short guided workflow.

## Rebuilding it with AI

I rewrote the service from C# to Node.js, using AI extensively during implementation.

This was before AI-assisted development had become part of my day-to-day engineering work, and the project became a useful experiment in how much development could be accelerated without delegating the engineering decisions themselves.

Over roughly a month, I rebuilt the service, added new functionality, improved its performance and simplified the onboarding process for teams.

The rewrite wasn’t valuable because it changed programming languages. It was valuable because it removed much of the friction that had prevented a useful internal tool from spreading beyond its original users.

## Adoption was the real challenge

Building the automation was only part of the problem.

An internal tool creates very little value if engineers don’t use it.

Alongside the service, I built a Dynatrace observability dashboard to track usage, adoption and failures. This gave me visibility into which teams were using Release Automator, how frequently it was being used and whether releases were completing successfully.

That became particularly useful as adoption increased. Rather than relying only on user feedback, I could see how the tool was being used across engineering and identify failures or areas of friction.

After releasing the rebuilt version, I shared it with the existing Release Automator community. Adoption accelerated significantly.

It eventually grew to the point where around 75% of engineering teams were using it regularly, with senior managers also beginning to promote it internally.

I started receiving messages from engineers and managers about the time it was saving them, as well as public recognition from senior managers and directors.

Nobody had assigned the project to me, and I remained its sole developer while continuing my normal product work.

The bigger opportunity

Release Automator stopped short of the part I ultimately wanted to automate: the deployment itself.

My proposed workflow was to take the release that had already been assembled, wait for approval from an authorized person, and then allow the system to trigger the production deployment.

I designed the workflow, created architecture diagrams and discussed the idea with senior engineering leadership, who were supportive of the direction.

It wasn’t implemented while I owned the project, so I don’t count it as part of the system’s impact. But it represented the natural next step: moving from automating the administration around a release toward orchestrating the release itself.

Outcome

Release Automator grew from a side project used by one team into tooling used regularly by roughly three quarters of engineering teams.

The observability dashboard also gave me a way to quantify that usage. In one of the last months I measured, Release Automator handled around 400 releases.

I estimated that the manual process it replaced typically took an engineer around 10–20 minutes per release. At that volume, that represents approximately **67–133** hours of repetitive engineering work avoided in a single month, or roughly 100 hours using the midpoint of that estimate.

Those numbers are estimates rather than a direct measurement of engineering time saved, but they helped put the scale of the automation into perspective: something that began as a side project for one team had become part of the regular release workflow across much of engineering.

More importantly, the project showed me something about internal platforms: the hard part isn’t always building the automation. It’s making the easiest path the automated one.
