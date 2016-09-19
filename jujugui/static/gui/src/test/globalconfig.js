var juju = {
  utils: {},
  components: {}
};
var flags = {};
var zip = {};
var GlobalConfig = {
  combine: true,
  base: '/dev/combo?/app/assets/javascripts/yui/',
  comboBase: '/dev/combo?',
  maxURLLenght: 1300,
  root: 'app/assets/javascripts/yui/',
  groups: {
    app: {
        //combine: true,
        base: "/dev/combo?app/",
        comboBase: "/dev/combo?",
        root: 'app/',
        filter: 'raw',
        // From modules.js
        modules: YUI_MODULES,
    },
  }
};

GlobalConfig.test_url = window.location.protocol + '//' + window.location.host + "/base/jujugui/static/gui/src/test/";

var origBeforeEach = Mocha.Suite.prototype.beforeEach;
var origAfterEach = Mocha.Suite.prototype.afterEach;
Mocha.Suite.prototype.beforeEach = function(title, fn) {
  this.ctx._cleanups = [];
  origBeforeEach.call(this, title, fn);
};

Mocha.Suite.prototype.afterEach = function(func) {
  const newAfterEach = function(done) {
    let doneCalled = false;
    const doneWrapper = () => {
      done();
      doneCalled = true;
    };
    if (this._cleanups && this._cleanups.length) {
      while (this._cleanups.length > 0) {
        // Run the clean up method after popping it off the stack.
        this._cleanups.pop()();
      }
      this._cleanups = [];
    }
    func.call(this, doneWrapper);
    if (!doneCalled) {
      done();
    }
  }
  origAfterEach.call(this, newAfterEach);
};

var assert = chai.assert,
    expect = chai.expect,
    should = chai.should();
