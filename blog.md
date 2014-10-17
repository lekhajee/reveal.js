## Mimic - Mocks not driven by tests

### Why am I writing this?

  I was a QE on the Rackspace Auto Scale team and would like to take you through the experiences and learnings I have had with testing Auto Scale, and how the ability to test it improved drastically using Mimic.

### What is Rackspace Auto Scale?

 [Rackspace Auto Scale](http://docs.rackspace.com/cas/api/v1.0/autoscale-devguide/content/Overview.html) is a web service that allows users to automate scaling servers up or down based on user defined conditions, or a schedule. To do so, Auto Scale depends on other services such as [Identity](http://docs.rackspace.com/auth/api/v2.0/auth-client-devguide/content/Overview-d1e65.html) - for authentication and impersonation, [OpenStack Compute](http://docs.rackspace.com/servers/api/v2/cs-devguide/content/ch_preface.html) - to scale servers up or down and [Load Balancers](http://docs.rackspace.com/loadbalancers/api/v1.0/clb-devguide/content/Overview-d1e82.html) - to load balance the servers created.  

### What's so hard about testing Auto Scale?

 Successfully testing Auto Scale meant testing not just the features of Auto Scale itself, but that it is consistent irrespective of any failures in the upstream systems. I had taken up the task of writing tests for Auto Scale and had envisioned writing positive and negative Functional and System Integration tests. 


### More about the Auto Scale test suite

 Functional tests to validate the API contracts and behavior of Auto Scale. An example of a positive functional test is, to verify that the [create scaling group](http://docs.rackspace.com/cas/api/v1.0/autoscale-devguide/content/POST_createGroup_v1.0__tenantId__groups_autoscale-groups.html) API call returns the expected response and that a scaling group is successfully created. An example of a negative functional test is, to verify that, create scaling group results in a response code 400, when the minimum servers specification(minEntities) for the group is set to greater than the maximum servers allowed(maxEntities).

 System Integration tests to validate the integration between Auto Scale and its dependent systems. An example of a positive System Integration tests is, to verify that when a user creates a scaling group and scales up by two servers, the servers are created successfully and assigned to the desired load balancers. An example of a negative System Integration test, is to verify the behavior of Auto Scale when a server being created goes into an error state.

Automating the positive and negative functional tests was simple and straight forward. However, the positive system integration tests were slow and flaky because of the time it took to provision an instance, or, due to network issues. Also, there was no way to automate the negative system integration tests, as it was impossible to simulate the dependent systems' error conditions. Hence, such negative tests began to look like this,

```
def test_system_create_delete_scaling_group_all_servers_error(self):
        """
        Verify create delete scaling group when all the servers go into
        error state
        """
        pass
```

### EVERYTHING IS SO SLOW!!!

I continued to write tests and I was happy as our test coverage was improving. Soon they were integrated as a gate, in our CI/CD process. But, this began to slow down the merge pipeline as the test suite would take over 3 hours to complete and was often unreliable. It would fail whenever it came across an irreproducible error in a dependent system, such as, a server going into an error state or remaining in a build state indefinitely. Also, the teams owning the dependent services were alarmed, by the sudden splurge in our usage of their resources, and had begun to complain (well, its autoscale!). 

The tests were not helping and instead had become a burden. Nobody fancied running them locally during development (including me - when developing more tests!). 

This needed to change! We needed feedback within a few minutes and not hours, without compromising on the test coverage. We needed a way to be able to reproduce the upstream failures and reliably verify that Auto Scale can handle such failures. And this needed to be done in a cost efficient manner, without using up all the resources of the upstream systems for our testing purposes.

### And Now: A New Dawn, A New Hope

All of these factors led me to write [Mimic](https://github.com/rackerlabs/mimic), an API-compatible mock service for Identity, OpenStack Compute and Load Balancers. Mimic provides dynamic, stateful responses based on templates of expected behavior for the supported services. It is backed by in-memory data structures rather than a potentially expensive database and is easy to set up, and speeds up the feedback. Mimic eliminates the use of production resources for testing, enables offline development and is cost and time efficient. Also, Mimic supports error injection by analyzing the [`metadata`](http://docs.rackspace.com/servers/api/v2/cs-devguide/content/Server_Metadata-d1e2529.html) sent within the json request body while [creating a server](http://docs.rackspace.com/servers/api/v2/cs-devguide/content/CreateServers.html) or [load balancer](http://docs.rackspace.com/loadbalancers/api/v1.0/clb-devguide/content/POST_createLoadBalancer_v1.0__account__loadbalancers_load-balancers.html), and generates various error conditions.

We now have integrated Mimic within our development environment as well as in our CI/CD process and have tests running against it. By doing so, test run time has reduced exponentially. To be precise, it has gone from being over 3 hours to less than 3 minutes!! Our test coverage of the negative system integration tests went up, as we are able to replicate various error conditions. Everybody is happy to run tests frequently and get immediate feedback. The teams from the dependent services are happy to know that we are not using up their resources at a large scale, for testing purposes.

### Why is this different from other mock services?

Also, unlike other mock frameworks, using Mimic does not involve including many extra lines of code that crowd the tests. Tests just need to pass in the `metadata`, only in case of a negative scenario, and mimic will process and return the expected response. This makes test code easy to read and understand.
Also, changes in upstream system's behaviors, do not alter the tests. 

Mimic has only grown since I first wrote it for the purposes of Auto Scale testing. Thanks to Glyph Lefkowitz and Ying Li, it now has a plugin architecture allowing others to implement mocks of other Rackspace and Openstack API services. It allows for control of time! has a 100% test coverage, and so much more. Check it out at https://github.com/rackerlabs/mimic.

### Onwards!

Our goal now is to find more use cases for its use, make testing API services painless and efficient. We welcome contributions, feedback, thoughts and ideas. Come join us develop Mimic, or talk to us on ##mimic on irc.freenode.net.
