var choice = require('../'),
    util = require('util'),
    expect = require('chai').expect

describe('Actor', function () {
  beforeEach(function () {
    var self = this

    self.begun = false
    self.ended = false

    self.actor = choice.createActor({
      Test: {
        begin: function (previousState) {
          self.begun = true
          this.previousState = previousState
        },
        end: function (nextState) {
          self.ended = true
          this.nextState = nextState
        },
        method: function () {
          this.methodCalled = true
        }
      },
      Empty: {}
    })
    self.actor.methodCalled = false

    self.MyActor = function MyActor() {
      choice.Actor.call(this)

      this.overrideCalled = false
      this.defineState('Override', {
        method: function () {
          this.overrideCalled = true
          return 'Overridden!'
        }
      })
    }
    util.inherits(self.MyActor, choice.Actor)

    self.MyActor.prototype.method = function() {
      return 'No Override'
    };
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

    it('should preserve this in injected methods', function () {
      this.actor.goToState('Test')

      this.actor.method()

      expect(this.actor.methodCalled).to.be.true
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

    it('should pass the previous state name to "begin"', function () {
      this.actor.goToState('Test')

      expect(this.actor.previousState).to.equal(null)

      this.actor.goToState('Empty')
      this.actor.goToState('Test')

      expect(this.actor.previousState).to.equal('Empty')
    })

    it('should pass the next state name to "end"', function () {
      this.actor.goToState('Test')
      this.actor.goToState('Empty')

      expect(this.actor.nextState).to.equal('Empty')

      this.actor.goToState('Test')
      this.actor.goToState(null)

      expect(this.actor.nextState).to.equal(null)
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

      expect(this.actor.state).to.equal(null)
      expect(this.actor.method).to.not.exist
      expect(this.begun).to.be.false
      expect(this.ended).to.be.false

      this.actor.goToState('Test')
      this.actor.goToState('Fail')

      expect(this.actor.previousState).to.equal(null)
      expect(this.actor.nextState).to.equal(null)
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

  describe('prototype', function () {
    it('should use the prototype methods as the defaults', function () {
      var myActor = new this.MyActor()

      expect(myActor instanceof choice.Actor).to.be.true
      expect(myActor.state).to.equal(null)
      expect(myActor.method()).to.equal('No Override')
      expect(myActor.overrideCalled).to.be.false

      myActor.state = 'Override'

      expect(myActor.state).to.equal('Override')
      expect(myActor.method()).to.equal('Overridden!')
      expect(myActor.overrideCalled).to.be.true
    })
  })
})
