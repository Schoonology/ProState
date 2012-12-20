var choice = require('../'),
    expect = require('chai').expect

describe('Actor', function () {
  beforeEach(function () {
    this.begun = false
    this.ended = false

    this.actor = choice.createActor({
      Test: {
        begin: function () {
          this.begun = true
        },
        end: function () {
          this.ended = true
        },
        method: function () {
          this.methodCalled = true
        }
      }
    })
    this.actor.methodCalled = false
  })

  it('should start at the "null" state', function () {
    expect(this.begun).to.be.false
    expect(this.actor.state).to.be.null
    expect(this.actor.method).to.not.exist
  })

  describe('goToState', function () {
    it('should transition to the new state', function () {
      this.actor.goToState('Test')

      expect(this.actor.state).to.equal('Test')
    })

    it('should inject the state\'s methods', function () {
      this.actor.goToState('Test')

      expect(this.actor.method).to.exist
    })

    it('should allow going back to the "null" state', function () {
      this.actor.goToState('Test')

      expect(this.actor.state).to.equal('Test')
      expect(this.actor.method).to.exist

      this.actor.goToState(null)

      expect(this.actor.state).to.equal(null)
      expect(this.actor.method).to.not.exist
    })

    it('should run any "begin" handlers', function () {
      this.actor.goToState('Test')

      expect(this.begun).to.be.true
    })

    it('should run any "end" handlers', function () {
      this.actor.goToState('Test')

      expect(this.ended).to.be.false

      this.actor.goToState(null)

      expect(this.ended).to.be.true
    })

    it('should not re-transition to the new state', function () {
      this.actor.goToState('Test')

      // Make some mutations that would be reset by re-injection
      delete this.actor.method
      this.begun = false
      this.ended = false

      this.actor.goToState('Test')

      expect(this.actor.state).to.equal('Test')
      expect(this.actor.method).to.not.exist
      expect(this.begun).to.be.false
      expect(this.ended).to.be.false
    })

    it('should fail gracefully', function () {
      this.actor.goToState('Fail')

      expect(this.actor.state).to.equal('Fail')
      expect(this.actor.method).to.not.exist
      expect(this.begun).to.be.false
      expect(this.ended).to.be.false
    })
  })

  describe('state', function () {
    it('should allow setting the current state', function () {
      this.actor.state = 'Test'

      expect(this.actor.state).to.equal('Test')
      expect(this.actor.method).to.exist

      this.actor.state = null

      expect(this.actor.state).to.equal(null)
      expect(this.actor.method).to.not.exist
    })
  })
})
