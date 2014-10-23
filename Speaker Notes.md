Speaker Notes:

5 minutes at a time

Lekha: brief "what is autoscale", existing testing, real-service backend
Glyph: generally, what's good about fakes? cf. stop mocking start testing
Lekha: first version of mimic, some of the solutions
Glyph: enhancements: plugin system, per-instance state
Lekha: mimic as a repository of known error conditions
Glyph: future enhancements: control of time, error injection
Lekha: call to action: why and how the openstack community should help

# Lekha

## Introduction ##

Introduction: Hi, I am Lekha Jeevan, a software developer in Test in Rackspace
and (glyph)

## What are we here to talk about? ##

Today we are going to talk about Mimic - an opensource framework that allows
for testing against for OpenStack and Rackspace APIs, how it is making testing
for products in Rackspace a cake walk and how it could potentially do the same
for your OpenStack-backed applications. Your contributions, will help us get
there.

## What Is Autoscale? ##

Rackspace Autoscale is a system which automates the process of getting the
right amount of compute capacity for an application, by creating (scaling up)
and deleting (scaling down) servers and associating them with load balancers.

In order to perform this task, Autoscale speaks to three back-end APIs:
Rackspace Identity for authentication and impersonation, Rackspace Cloud
Servers for provisioning and deleting servers, and Rackspace Cloud Load
Balancers for adding and removing servers to load balancers as they are created
and deleted.

Rackspace Identity is API-compatible with OpenStack Identity v2, Rackspace
Cloud Servers is powered by and API-compatible with OpenStack Compute, although
Rackspace Cloud Load Balancers is a custom API.

### as a QE ###

The development started, and I was the QE in the group, and I started writing
automated tests, in parallel to the development work. So, as autoscale was
interacting with so many other systems, testing it dint mean just testing
autoscale, but that if any of these systems it depended on didn't behave as
expected, autoscale did not crumble. But was consistent and able to handle
them.

### testing for autoscale ###

So, I had two kinds of tests, one was the functional tests, to test the API
contracts, verify the responses of the API calls given valid requests, or
malformed requests.

The other, was system integration tests. These were more complex tests, as they were going to be verifying the integration between Identity(keystone), Compute, Load balancers and Autoscale. For example, When a user created a scaling group, it will verify that the minimum number of servers on the group are provisioned successfully, as in the servers are active and they exist as nodes on the load balancers. Or if a server, went into an error state, that can happen, Autoscale was able to re-provision that server.

### issues with the tests, running against real services ###

All these tests were running against the real services. Servers could take over
a minute, ten minutes to provision and the tests would run that much
longer. Sometimes, the tests would fail due to random failures, like a server
would go into error state, where as the test was expecting it to go into an
active state. The tests for the negative scenarios, like actually testing how
autoscale would behave if the server went into an error state, could not be
tested. This is just not something that could be reproduced.

### more issues, flaky slow tests affecting developers and other teams ###

Well, the test coverage was improving as I continued to add tests, oblivious of
the time it was taking run the entire test suite! Now, we had started using
these tests as a gate in out merge pipeline. But the tests were running for so
long and were sometimes flaky. Nobody dared to run these tests locally! Not even me,
when I was adding more tests! Also, our peers from the compute and load
balancers teams, whose resources we were using up for our "Auto-scale" testing,
were _not_ happy! So much, so that, we were pretty glad, we were in a remote
office!

This had to change! we needed something! to save us from the slow and flaky
testing! 

# Glyph

## what's good about fakes? ##

When you're testing against a real service, you have to deal with the whole
spectrum of real failures which might come back from that service.  This is of
course important for validating a product, ensuring that it works as expected
in a realistic deployment environment, even if your colleagues on the compute 
and load balancer teams get mad at you.

But when you write code to interact with a service, you need to handle a wide
variety of error cases.

Your positive-path code - the code that submits a request and gets the response
that it expects - is going to get lots of testing in the real world.  Most
interactions with services are successful, and the operators of those services
always strive to make ever more of those interactions successful.  So most
likely, the positive-path code is going to get exercised all the time and you
will have plenty of opportunities to flush out bugs.

Your negative-path code, on the other hand, will only get invoked in production
when there's a real error.  If everything is going as planned, this should be
infrequent.

It's really important to get negative-path code right.  If everything is going
well, it's probably okay if your code has a couple of bugs.  You might be able
to manually work around them.

But if things are starting to fail with some regularity in your cloud, that is
exactly the time you want to make sure *your* system is behaving correctly:
accurately reporting the errors, measuring the statistics, and allowing you to
stay on top of incident management for your service.

When you test against a real service, you are probably testing against a
staging instance.  And, if your staging instance is typical, it probably
doesn't have as much hardware, or as many concurrent users, as your production
environment.  Every additional piece of harware or concurrent user is another
opportunity for failure, so that means your staging environment is probably
even less likely to fail.

I've been in the software industry for long enough now to remember where this
part of the talk would be the hardest part - the part where we try to sell the
idea that code coverage and automated testing is really important.  Luckily we
have moved on from the bad old days of the 90s, when most teams didn't have
build automation, and if they wanted it they might not even be able to afford
it.

Luckily today we are all somewhat more enlightened, and we know that testing is
important and full code coverage is important.  So when we write code like this:

(slide: try/except with code)

... we know that we need to write tests for this part:

(highlight 'except' part)

... by writing a mock for it.

The problem with the traditional definition of a mock is that each mock is
defined just for the specific test that it's mocking.

Let's take a specific example from OpenStack Compute.

In June of this year, OpenStack Compute
[introduced a bug](https://github.com/openstack/nova/commit/1a6d32b9690b4bff709dc83bcf4c2d3a65fd7c3e)
making it impossible to revoke a certificate.

(This is not a criticism of Nova itself;
[the bug was later fixed](https://github.com/openstack/nova/commit/96b39341d5a6ea91d825d979e2381b9949b26e27).)

The bug here is that `chdir` does not actually return a value.  Because these
tests construct their own mocks for `chdir`, we properly cover all the code,
but the code is not integrated with a system that is verified in any way
against what the real system (in this case, Python's chdir) does.

In this *specific* case, we might have simply tested against a real directory
structure in the file system, because relative to the value of testing against
a real implementation, creating a directory is not a terribly expensive
operation.

However, an OpenStack cloud is a significantly more complex system than `chdir`.
If you are developing an application that depends on OpenStack, creating a real 
cloud to test against is far too expensive and slow as Autoscale's experience shows.
Creating a one-off mock for every test is fast to get started with and fast to run, 
but is error prone and rapidily becomes a significant maintainance burden of its own 
right. Autoscale needed something that was quick to deploy, and lightweight to run 
like a mock, but realistic and usable in an integration scenario like a __real__ system.

This is were Mimic comes in.

# Lekha: first version of mimic, some of the solutions

Mimic was built as a stand-in service for Identity, Compute and Rackspace Load
balancers, the services that autoscale depends upon. That is, Mimic initially
implemented subsets for the endpoints for authentication, servers and load
balancers.

The essence of Mimic is pretending. When you ask it to create a server, it
pretends to create one or.. not. This is not like faking ot stubbing, when
Mimic pretends to build a server, it remembers the information about that
server and will tell you about it in the subsequent requests. Let me explain,
Mimic not only allows for happy path - positive testing, but also allows for
the corner cases, such as maybe a server going into an error state, or
building indefinitely or the service going down when trying to create a
server.

Mimic knows to do this using the metadata provided during the creation of the
object. It processes the metadata, and sets the state of the object
respectively. For example, setting a `metadata` of say `"server_building": 30`,
will make the server stay in building state for 30 seconds. Similarly, servers
can be made to go into error state on creation or even return an error 500 or
any response code and body during creation.

This makes writing tests easier, as these tests can be run against the real
services or against mimic, with no extra lines of code to reference the
mock. Now, when the behavior of the upstream system changes, you only need to
make a change in one place - Mimic - instead of once in every test that might
be mocking different behavior of the upstream system.

Mimic does not use any database to hold the state of the objects, it uses in
memory data structures. Mimic has minimal software dependencies - almost
entirely pure Python - and no service dependencies.  It is entirely
self-contained.

(Demo here?  "Look how easy it is to run Mimic....")

This was the first implementation of Mimic, we configured the autoscale cloud
cafe tests to run against mimic. This was easy as we just had to change the
Identity endpoint in the config files of autoscale and cloud cafe to Mimic's
identity endpoint. Mimic returned the service catalog, that contained endpoints
of the services it implemented i.e. Compute and Rackspace Load balancers.

Not only was this very easy to set up, but also reduced the test time exponentially. Earlier the functional tests would take 15 minutes, and now they ran in 30 seconds. The system integration tests would take 3 hours or more, cause if one of the servers in the test remained building longer than usual, then thats how much longer the tests ran. This went down to less than 3 minutes to complete!

Our dev vm are configured to run tests against Mimic, so developers get immediate feedback on the code being written and they can work offline without having to worry about up times of the upstream systems.

However, the first implementation of mimic had some flaws, it was fairly
Rackspace specific. It implemented only the services required by autoscale, and
they were all implemented as the core. It ran each service on a different port,
making it not scalable. It allowed for testing error scenarios, but only using
the metadata. This was not useful for all cases, especially for a UI system
like horizon that did not even allow for the metadata to be input.


# Lekha: mimic as a repository of known error conditions #

As we are testing a product we run into scenarios, that we normally do not
expect. We start off wanting to test positive and negative scenarios, but it is
just impossible to test the negative scenarios like a server going into an
error state cause we cant emulate such scenarios. However, we need to be able
handle such scenarios within our code and test them consistently.

As we were running integration tests for autoscale with compute, we began to
see some failures due to the server going into error state. We now had to have
a way to deal with it and test it consistently. Then we found out that the
servers could remain in building state for a long time, even up to an hour or
more. Autoscale could not possibly have a server provisioning for an
hour. Similarly, as we went on with this process we found many such error
conditions, that we began to handle within our code, making it more robust.

Now, Wont it be great if not every system that used compute as a dependency had
to go through this same cycle and have to find all the possible error
conditions in a system by experience and have to deal with them at the pace
that they occur.

What if we had a repository of all such known errors, that everyone contributes
to. So the next person using the plugin can use the existing ones, and ensure
there application behaves consistently irrespective of the errors, or add any
new ones to it.

Mimic is just that, a repository of all known responses including the error
responses.


# Lekha: call to action: why and how the openstack community should help

Mimic, can be the tool, where you do not have to stand up the entire dev stack
to understand how an OpenStack API behaves.

Mimic can be the tool which enables a OpenStack developer to get quick feedback on the code he/she is writing and not have to go through the gate multiple times to understand that.. maybe I should have handled that one error, that the upstream system decides to throw my way every now and then.

