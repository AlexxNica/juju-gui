'use strict';

describe('SubApplication App Extension', function() {
  var Y, juju, app, mocks;

  before(function(done) {
    Y = YUI(GlobalConfig).use(['juju-routing',
                               'juju-gui'],
    function(Y) {
      juju = Y.namespace('juju');
      done();
    });
  });

  beforeEach(function() {
    app = new juju.App();

    mocks = {
      subAppProperty: {
        type: 'mock.subapp',
        config: {}
      },
      subAppRoutes: [
        { path: '/', callbacks: 'showRootView', namespace: 'charmStore' },
        { path: '/charm/:id', callbacks: 'showCharmDetailView',
            namespace: 'charmStore' },
      ],
      parentAppRoutes: [
        { path: '*', callbacks: 'check_user_credentials' },
        { path: '*', callbacks: 'show_notifications_view' },
        { path: '/charms/', callbacks: 'show_charm_collection' },
        { path: '/charms/*charm_store_path/', callbacks: 'show_charm' },
      ]
    };

    function subAppMock() {}
    subAppMock.prototype.getSubAppRoutes = function() {
      return mocks.subAppRoutes;
    };
    subAppMock.prototype.get = function(attribute) {
      if (attribute === 'urlNamespace') { return 'charmStore'; }
    };
    Y.namespace('mock').subapp = subAppMock;
  });

  it('should add subapps to the parent app', function() {
    app.set('routes', mocks.parentAppRoutes);
    app.addSubApp(mocks.subAppProperty.type, mocks.subAppProperty.config);
    var subapps = app.get('subApps');
    assert(typeof subapps.charmStore === 'object');
  });

  it('should extract the routes from the subapp', function() {
    app.set('subApps', [new Y.mock.subapp()]);
    assert.deepEqual(app._extractRoutes(), mocks.subAppRoutes,
      'Routes do not match');
  });

  it('should augment the parent routes with the subapp routes',
    function() {
      var augmentedRoutes, numberOfRoutes;

      numberOfRoutes = mocks.subAppRoutes.length + mocks.parentAppRoutes.length;
      app.set('routes', mocks.parentAppRoutes);

      augmentedRoutes = app._augmentRoutes(mocks.subAppRoutes),

      assert.equal(augmentedRoutes.length, numberOfRoutes,
        'Number of routes does not match');
  });

});
