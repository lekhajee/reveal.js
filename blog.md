 # About me at Rackspace 
  I am a software Developer in Test III and have been with Rackspace since 2011. I started off with writing automated selenium tests for legacy Control Panel, now replaced by [Reach](https://mycloud.rackspacecloud.com). Later grabbed the oppurtunity to venture into the world of API testing, for the Cloud Integration team, for services such as Sign Up, Accounts and Billing. Intrigued by Billing, continued with testing billing for Compute and Cloud Block Storage. Life happened, moved from the San Antonio office to the San Francisco office. Soon joined the AutoScale team, worked for over a year and half writing tests and setting up the test infrastructure for AutoScale. Currently am on the Monitoring team and getting ramped up. 


 # Mimic - Mocks not driven by tests

 AutoScale allows users to automate scaling servers up or down based on the traffic load, or a schedule. To do so AutoScale depends on other services such as Identity (for authentication and impersonation), Compute (to scale servers up or down) and Load Balancers (to load balance the servers created) and AutoScale can be successful product, only if all of the services it relies on are functional and reliable at all instances.

 I had taken up the task of writing tests for AutoScale and had envisioned writing postive and negtaive tests the following categories of tests,

 - Functional tests - to verify the API contracts (Eg.: verifies the responses of all the API calls)
 - System Integration tests - to verify the integration between Autoscale and its dependent systems (Eg.: User requested to scale up by 2 servers. Were the 2 servers built successfully and assigned to a Load balancer)

The functional tests were straight forward. And everything was going well with writing the system integration tests, except when it came to writing negative tests. There was no way to simulate the error conditions. So, such negative tests looked like [this](https://github.com/rackerlabs/otter/blob/master/autoscale_cloudroast/test_repo/autoscale/system/group/test_system_group_negative.py#L109-114),

```
def test_system_create_delete_scaling_group_server_building_indefinitely(self):
        """
        Verify create delete scaling group when servers remain in 'build' state
        indefinitely
        """
        pass
```
I continued to write other tests, verifying the tests against the dependent systems, to ensure the tests were not flaky. However, as the test coverage grew, and test werr being run as part of the CI/CD process, we began to notice the following,
- Tests were taking very long to complete (due to server build times, internet etc)
- Tests would begin to fail, not because of AutoScale but because it ran into an error condition in one of the dependent systems. And there was no way to simulate such error conditions to be able to deal with it within the AutoScale code base.
- We were using up way too many resources (well, its AutoScale!)
- Tests were becoming a burden and nobody fancied running them during development (including me, when developing more tests!)












