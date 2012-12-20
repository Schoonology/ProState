var Actor = require('./actor')

module.exports = {
  Actor: Actor,
  createActor: Actor.createActor,
  check: function check() {
    // Blame [@CrabDude](https://github.com/CrabDude) and [@kabriel](https://github.com/kabriel).
    require('child_process').spawn('npm', ['test'], {
      cwd: require('path').resolve(__dirname, '..')
    }).on('exit', function (code) {
      if (code === 0) {
        console.log('Your ProState is in good health.')
      } else {
        console.log('Your ProState needs medical attention. Please see a physician at your earliest convenience.')
      }
    })
  }
}
