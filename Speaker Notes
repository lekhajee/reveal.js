Speaker Notes:

5 minutes at a time

Lekha: brief "what is autoscale", existing testing, real-service backend
Glyph: generally, what's good about fakes? cf. stop mocking start testing
Lekha: first version of mimic, some of the solutions
Glyph: enhancements: plugin system, per-instance state
Lekha: mimic as a repository of known error conditions
Glyph: future enhancements: control of time, error injection
Lekha: call to action: why and how the openstack community should help

# Lekha: brief "what is autoscale", existing testing, real-service backend (650 words below) #

Introduction: Hi, I am Lekha Jeevan , a software developer in Test in Rackspace and (glyph) 

## Brief on what the talk is, how it benefits us, how it will benefit OS and what they should do ##

Today we are going to talk about Mimic - an opensource mock framework (that allows for mocking of) for OpenStack and Rackspace APIS, how it is making testing for products in Rackspace a cake walk and how it could potentially do the same for OpenStack. Your contributions, will help us get there.

### what is autoscale ###
We are going to be taking a trip down memory lane, to 2013, when the Rackspace Autoscale product was initiated. It was a very exciting time for us, we were a bunch of developers, going to build this product from scratch. We had many design meetings. and then, some more. Eventually, we knew how we were going to build this. Here is a gist. There is a scaling group - it has some specifications such as minimums number of servers on the group, maximum number of servers that the group can have. It has associated policies, which a user can use to define, when to scale and by how much. Simple! 

### what are its dependencies ###
Ok, now to do this, we needed to be able to authenticate users to provision servers of their behalf and assign them to load balancers(if any) - well, thats easy. We were going to use Identity for Impersonation, Compute to scale up or scale down and assign them to Load balancers using the Rackspace load balancer API. Awesome, this is going to be so easy! Hmm, maybe it is or maybe it isn't. Lets see. 

### as a QE ###
The development started, and I was the QE in the group, and I started writing automated tests, in parallel to the development work. So, as autoscale was interacting with so many other systems, testing it dint mean just testing autoscale, but that if any of these systems it depended on dint behave as expected, autoscale did not crumble. But was consistent and able to handle them.

### testing for autoscale ###
So, I had two kinds of tests, one was the functional tests, to test the API contracts, verify the responses of the API calls given valid requests, or malformed requests.

The other, was system integration tests. These were more complex tests, as they were going to be verifying the integration between Identity(keystone), Compute, Load balancers and Autoscale. For example, When a user created a scaling group, it will verify that the minimum number of servers on the group are provisioned successfully, as in the servers are active and they exist as nodes on the load balancers. Or if a server, went into an error state, that can happen, Autoscale was able to re-provision that server.

### issues with the tests, running against real services ###
All these tests were running against the real services. Servers could take over a minute, ten minutes to provision and the tests would run that much longer. Sometimes, the tests would fail due to random failures, like a server would go into error state, where as the test was expecting it to go into an active state. The tests for the negative scenarios, like actually testing how autoscale would behave if the server went into an error state, could not be tested. This is just not something that could be reproduced.

### more issues, flaky slow tests affecting developers and other teams ###
Well, the test coverage was improving as I continued to add tests, oblivious of the time it was taking run the entire test suite! Now, we had started using these tests as a gate in out merge pipeline. But the tests were running for so long and were sometimes flaky. Nobody dared to run them locally! Not even me, when I was adding more tests! Also, our peers from the compute and load balancers teams, whose resources we were using up for our "Auto-scale" testing, were _not_ happy! So much, so that, we were pretty glad, we were in a remote office! 

This had to change! we needed mocks! to help us from the slow and flaky testing! So we started considering the existing ones.

# Glyph

# Lekha: first version of mimic, some of the solutions

Mimic was built as a mock framework for Identity, Compute and Rackspace Load balancers, the services autoscale depends upon. That is Mimic implements endpoints such as authentication, CRUD for servers, load balancers and nodes on load balancers. It does not return static responses irrespective of the requests. It processes the requests, populates a response template and holds the state of the object being created. Hence, resources appear to be provisioned immediately.. or not. Let me explain, Mimic not only allows for happy path - positive testing, but also allows for the corner cases, such as maybe a server going into an error state, or building indefinitely or the service going down when trying to create a server.

Mimic knows to do this using the metadata provided during the creation of the object. It processes the metadata, and sets the state of the object respectively. For example, setting a `metadata` of say `server_building: 30`, will make the server stay in building state for 30 seconds, similarly servers can be made to go into error state on creation or even return an error 500 or any response code and body during creation. 

This makes writing tests easier, as these tests can be run against the real services or against mimic, with no extra lines of code, to reference the mock. Even when the behavior of the upstream system changes, there will be no change to the test, but only to mimic , once!

Mimic does not use any database to hold the state of the objects, it uses in memory data structures. Mimic has minimal software dependencies and no service dependencies.

This was the first implementation of Mimic, we configured the autoscale cloud cafe tests to run against mimic. This was easy as we just had to change the Identity endpoint in the config files of autoscale and cloud cafe to Mimic's identity endpoint. Mimic returned the service catalog, that contained endpoints of the services it implemented i.e. Compute and Rackspace Load balancers.

Not only was this very easy to set up, but also reduced the test time exponentially. Earlier the functional tests would take 15 minutes, and now they ran in 30 seconds. The system integration tests would take 3 hours or more, cause if one of the servers in the test remained building longer than usual, then thats how much longer the tests ran. This went down to less than 3 minutes to complete!

Our dev vm are configured to run tests against Mimic, so developers get immediate feedback on the code being written and they can work offline without having to worry about up times of the upstream systems.

However, the first implementation of mimic had some flaws, it was fairly Rackspace specific. It implemented only the services required by autoscale, and they were all implemented as the core. It ran each service on a different port, making it not scalable. It allowed for testing error scenarios, but only using the metadata. This was not useful for all cases, especially for a UI system like horizon that did not even allow for the metadata to be input. 

===================================================================================================================================
Lekha: mimic as a repository of known error conditions
===================================================================================================================================
As we are testing a product we run into scenarios, that we normally do not expect. We start off wanting to test positive and negative scenarios, but it is just impossible to test the negative scenarios like a server going into an error state cause we cant emulate such scenarios. However, we need to be able handle such scenarios within our code and test them consistently. We 

As we were running integration tests for autoscale with compute, we began to see some failures due to the server going into error state. We now had to have a way to deal with it and test it consistently. Then we found out that the servers could remain in building state for a long time, even up to an hour or more. Autoscale could not possibly have a server provisioning for an hour. Similarly, as we went on with this process we found many such error conditions, that we began to handle within our code, making it more robust.

Now, Wont it be great if not every system that used compute as a dependency had to go through this same cycle and have to find all the possible error conditions in a system by experience and have to deal with them at the pace that they occur. 

What if we had a repository of all such known errors, that everyone contributes to. So the next person using the plugin can use the existing ones, and ensure there application behaves consistently irrespective of the errors, or add any new ones to it.

Mimic is just that, a repository of all known responses including the error responses. 


===================================================================================================================================
Lekha: call to action: why and how the openstack community should help
===================================================================================================================================
Mimic, can be the tool, where you do not have to stand up the entire dev stack to understand how an OpenStack API behaves. 

Mimic can be the tool which enables a OpenStack developer to get quick feedback on the code he/she is writing and not have to go through the gate multiple times to understand that.. maybe I should have handled that one error, that the upstream system decides to throw my way every now and then.

