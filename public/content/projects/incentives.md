# Building an Incentives Experimentation Platform

## The problem

The company wanted a way to use targeted incentives as a trading lever: when a customer received an insurance quote, we could selectively offer a small reward — typically a £10–£20 Amazon voucher — to encourage conversion.

I joined while the system was still relatively early in its development, which gave me the opportunity to help shape both the implementation and how the platform evolved.

The service was built with .NET and MongoDB, with Kafka events used to communicate when incentives were presented or allocated.

## From rules to experimentation

The first version of the system was intentionally simple.

When a customer requested a quote, their details were evaluated against campaign rules such as age, claims history and other eligibility criteria. If they qualified, the system allocated an incentive which would only be fulfilled once the corresponding sale had been confirmed.

Over time, we moved the targeting decision outside the service.

Instead of maintaining increasingly complex eligibility rules ourselves, we integrated models developed by our data science team to determine whether an incentive should be presented.

That changed the responsibility of our platform.

Rather than trying to decide who should receive an incentive, it increasingly became the infrastructure around the decision: managing campaigns, allocating incentives, tracking outcomes and supporting A/B tests across different models and incentive values.

This separation allowed targeting to evolve independently while keeping the product and experimentation concerns within the incentives platform.

## Removing friction we had learned to tolerate

One operational problem was how campaigns were managed.

Campaign definitions lived as static files in the repository. Even a relatively small campaign change therefore had to go through the engineering workflow rather than being managed directly by the people running the campaigns.

I raised the issue, but building campaign-management tooling wasn’t considered a priority. The additional turnaround time was considered acceptable.

Rather than continuing to debate it, I put together a simple UI in our staging environment to demonstrate what an alternative could look like.

It allowed campaigns to be managed directly rather than through repository changes. Once the PM could actually use the workflow rather than discussing it abstractly, the value became much clearer.

That experience changed how I approach internal tooling: sometimes a small working prototype communicates the value of an idea better than another round of discussion.

## Finding a hidden database problem

The platform also needed to support customers’ data-deletion requests.

An internal API allowed another service to request deletion of incentives associated with a customer. While looking through our monitoring, I noticed an unusual pattern: memory usage periodically spiked overnight, around the same time these deletion requests were being processed.

I traced the behaviour through the service and reproduced it locally.

The lookup performed a case-insensitive email search using a regular expression. Although the collection had an index on email, the regex query couldn’t make effective use of that standard index and was causing MongoDB to scan the collection.

I replaced the indexing strategy with a collation-aware index for case-insensitive lookups and removed the previous index.

It was a relatively small change, but a useful reminder that having an index doesn’t necessarily mean your query is using it.

## Outcome

The platform became a trading lever the business could use to run targeted incentive campaigns on demand, helping it respond to market conditions and experiment with ways of improving conversion.

As the system evolved, the business could test different incentive values and targeting models rather than relying on a single fixed strategy. The engineering platform wasn’t responsible for deciding the commercial strategy; its job was to make those strategies possible to run, measure and change.

## What I’d improve

The biggest opportunity would have been to continue reducing the operational work surrounding the core decision engine.

The targeting itself had become increasingly sophisticated through ML models, but parts of the surrounding lifecycle — campaign management and fulfilment in particular — still relied on humans.

I’d continue moving those workflows toward self-service and automation, while keeping humans able to inspect and intervene when necessary.
