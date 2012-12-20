function Actor(states) {
  if (!(this instanceof Actor)) {
    return new Actor(states)
  }

  this._states = {}
  this._currentState = null
  this._injected = []

  Object.defineProperty(this, 'state', {
    get: function () {
      return this._currentState ? this._currentState.name : null
    },
    set: function (name) {
      this.goToState(name)
    }
  })

  this.defineStates(states)
  // TODO: isInState(name).
  // TODO: pushState & popState, 'pushed', 'popped', 'continued'.
  // TODO: ignores list.
}
Actor.createActor = Actor

Actor.prototype.begin = begin
function begin(previousState) {
}

Actor.prototype.end = end
function end(nextState) {
}

Actor.prototype._injectStateMethods = _injectStateMethods
function _injectStateMethods(state) {
  var self = this

  self._injected.forEach(function (key) {
    delete self[key]
  })

  if (!state) {
    self._injected = []
    return
  }

  self._injected = state.keys
  state.keys.forEach(function (key) {
    self[key] = state.props[key]
  })
}

Actor.prototype.goToState = goToState
function goToState(name) {
  var previousState = this._currentState,
      nextState = this._states[name] || null

  if (previousState === nextState) {
    // TODO: bForceEvents?
    return this
  }

  if (previousState) {
    this.end(nextState ? nextState.name : null)
  }

  this._currentState = nextState
  this._injectStateMethods(nextState)

  if (!nextState) {
    // TODO: Throw?
    return this
  }

  this.begin(previousState ? previousState.name : null)
  return this
}

Actor.prototype.defineStates = defineStates
function defineStates(obj) {
  var self = this

  if (!obj) {
    return self
  }

  Object.keys(obj).forEach(function (key) {
    self.defineState(key, obj[key])
  })

  return self
}

Actor.prototype.defineState = defineState
function defineState(name, obj) {
  var self = this
    , state = self._states[name]

  if (!obj) {
    if (state) {
      self._states[name] = null
    }

    return self
  }

  if (!state) {
    self._states[name] = state = {
      name: name,
      keys: [],
      props: {
        begin: function () {},
        end: function () {}
      }
    }
  }

  Object.keys(obj).forEach(function (key) {
    if (typeof obj[key] === 'function') {
      state.keys.push(key)
      state.props[key] = obj[key]
    }
  })

  return self
}

module.exports = Actor
