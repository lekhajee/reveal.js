

# Mimic Presentation

## How did Mimic come to be?

(Lekha)

- rackspace autoscale

  - overview

    - open source, not open stack

    - uses openstack APIs

  - testing requirements

    - set up autoscale against compute, identity, load balancers

    - originally set up against *real* compute

    - problems: slow, unreliable, expensive

- we tested, what happened?

  - realistic testing

  - development slowed down

    - developers waiting for our "gate"

    - spurious failures: when any back-end service failed

    - spurious successes: unable to reproduce failures when back-end service
      started working again

  - service providers got mad ("why are you taking down compute")

- why didn't you just...

  - run the tests repeatedly until you get a success?

    - this doesn't tell us that our failure cases are *working*

  - write more unit tests?

    - we already had unit test coverage, this is for integration testing

  - use...

    - VCR? - we needed more than static responses

    - (maybe more of these)

- solution: first version of mimic

  - hard-coded mock of identity, load balancers, and compute

  - fairly rackspace specific

  - fast

    - fast to set up: few software dependencies, no service dependencies

    - minimal resources: no database, no storage beyond "state of the world"

    - fast to run: resources appear to provision (or not) instantly, no
      computation

  - implemented some error conditions:

    - server metadata passed from tests -> autoscale -> compute or mimic

      - inert when sent to regular compute

      - triggered specific errors within mimic

        - specify time for server "building" status

        - specify whether "building" goes to "active" or "error"

        - specify an alternate response message and code

    - success even when the real service isn't succeeding

      - sometimes datacenters go down, it's sad but true, we should be able to
        continue development without bothering the already-stressed ops people

(Glyph)

- issues with first version

  - hard-coded approach

- plugins

- time passing

  - servers take a long time to build



-----

5 minutes at a time

Lekha: brief "what is autoscale", existing testing, real-service backend
Glyph: generally, what's good about fakes? cf. stop mocking start testing
Lekha: first version of mimic, some of the solutions
Glyph: enhancements: plugin system, per-instance state
Lekha: mimic as a repository of known error conditions
Glyph: future enhancements: control of time, error injection
Lekha: call to action: why and how the openstack community should help
