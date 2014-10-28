Speaker Notes:

5 minutes at a time

Lekha: brief "what is autoscale", existing testing, real-service backend
Glyph: generally, what's good about fakes? cf. stop mocking start testing
Lekha: first version of mimic, some of the solutions
Glyph: enhancements: plugin system, per-instance state
Lekha: mimic as a repository of known error conditions
Glyph: future enhancements: control of time, error injection
Lekha: call to action: why and how the openstack community should help

# Glyph

# Lekha: first version of mimic, some of the solutions


# Glyph


# Lekha: mimic as a repository of known error conditions #

# Lekha: call to action: why and how the openstack community should help

Mimic, can be the tool, where you do not have to stand up the entire dev stack
to understand how an OpenStack API behaves.

Mimic can be the tool which enables an OpenStack developer to get quick
feedback on the code he/she is writing and not have to go through the gate
multiple times to understand that, maybe I should have handled that one
error, that the upstream system decides to throw my way every now and then.


# deadcode
when the behavior of the upstream system changes, you only
need to make a change in one place - Mimic - instead of once in every test
that might be mocking different behavior of the upstream system.

This made it relatively straightforward to move from a model where that service
catalog was hard-coded based on a specific port-number offset for each service,
to one where a custom URL path was generated for each service.  Initially,
these were simply long opaque UUIDs per service, but Mimic now includes the
name of the endpoint in addition to a small random key, so that the URIs are
both unique and readable for debugging purposes.
