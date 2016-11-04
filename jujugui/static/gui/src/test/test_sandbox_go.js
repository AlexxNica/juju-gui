/*
This file is part of the Juju GUI, which lets users view and manage Juju
environments within a graphical interface (https://launchpad.net/juju-gui).
Copyright (C) 2012-2013 Canonical Ltd.

This program is free software: you can redistribute it and/or modify it under
the terms of the GNU Affero General Public License version 3, as published by
the Free Software Foundation.

This program is distributed in the hope that it will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranties of MERCHANTABILITY,
SATISFACTORY QUALITY, or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero
General Public License for more details.

You should have received a copy of the GNU Affero General Public License along
with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

'use strict';

(function() {

  describe('sandbox.JujuAPI', function() {
    var requires = [
      'jsyaml', 'juju-env-sandbox', 'environment-change-set',
      'juju-tests-factory', 'juju-controller-api', 'juju-env-api',
      'juju-models', 'promise'
    ];
    var client, controllerAPI, env, ecs, environmentsModule, factory, juju,
        sandboxModule, state, ns;

    before(function(done) {
      YUI(GlobalConfig).use(requires, function(Y) {
        sandboxModule = Y.namespace('juju.environments.sandbox');
        environmentsModule = Y.namespace('juju.environments');
        factory = Y.namespace('juju-tests.factory');
        ns = Y.namespace('juju');
        done();
      });
    });

    beforeEach(function() {
      state = factory.makeFakeBackend();
      juju = new sandboxModule.GoJujuAPI({
        state: state,
        socket_url: 'socket url'
      });
      client = new sandboxModule.ClientConnection({juju: juju});
      ecs = new ns.EnvironmentChangeSet({db: state.db});
      controllerAPI = new ns.ControllerAPI({conn: client, ecs: ecs});
      env = new environmentsModule.GoEnvironment({conn: client, ecs: ecs});
      var facades = sandboxModule.facades.reduce(function(collected, facade) {
        collected[facade.name] = facade.versions;
        return collected;
      }, {});
      controllerAPI.set('facades', facades);
      env.set('facades', facades);
    });

    afterEach(function() {
      // We need to clear any credentials stored in sessionStorage.
      const destroyAPI = api => {
        if (api.get('connected')) {
          api.close();
        }
        api.setCredentials(null);
        api.destroy();
      };
      destroyAPI(controllerAPI);
      destroyAPI(env);
      client.destroy();
      juju.destroy();
      state.destroy();
    });

    it('opens successfully.', function() {
      assert.isFalse(juju.connected);
      assert.isUndefined(juju.get('client'));
      client.open();
      assert.isTrue(juju.connected);
      assert.strictEqual(juju.get('client'), client);
    });

    it('ignores "open" when already open to same client.', function() {
      client.receive = function() {
        assert.ok(false, 'The receive method should not be called.');
      };
      // Whitebox test: duplicate "open" state.
      juju.connected = true;
      juju.set('client', client);
      // This is effectively a re-open.
      client.open();
      // The assert.ok above is the verification.
    });

    it('refuses to open if already open to another client.', function() {
      // This is a simple way to make sure that we don't leave multiple
      // setInterval calls running.  If for some reason we want more
      // simultaneous clients, that's fine, though that will require
      // reworking the delta code generally.
      juju.connected = true;
      juju.set('client', {receive: function() {
        assert.ok(false, 'The receive method should not have been called.');
      }});
      assert.throws(
          client.open.bind(client),
          'INVALID_STATE_ERR : Connection is open to another client.');
    });

    it('closes successfully.', function() {
      client.open();
      assert.isTrue(juju.connected);
      assert.notEqual(juju.get('client'), undefined);
      client.close();
      assert.isFalse(juju.connected);
      assert.isUndefined(juju.get('client'));
    });

    it('ignores "close" when already closed.', function() {
      // This simply shows that we do not raise an error.
      juju.close();
    });

    it('can dispatch on received information.', function(done) {
      var data = {type: 'TheType', request: 'TheRequest'};
      juju.handleTheTypeTheRequest = function(received) {
        assert.notStrictEqual(received, data);
        assert.deepEqual(received, data);
        done();
      };
      client.open();
      client.send(JSON.stringify(data));
    });

    it('refuses to dispatch when closed.', function() {
      assert.throws(
          juju.receive.bind(juju, {}),
          'INVALID_STATE_ERR : Connection is closed.'
      );
    });

    // Ensure the log in process with the given username and password either
    // succeeds or fails based on the given expectSuccess argument.
    const checkLogin = (done, username, password, expectSuccess) => {
      client.onmessage = function(received) {
        let expectedData = {
          'request-id': 42,
          error: 'invalid username or password'
        };
        if (expectSuccess) {
          expectedData = {
            'request-id': 42,
            response: {
              facades: sandboxModule.facades,
              'controller-tag': 'controller-demonstration-controller-uuid',
              'model-tag': 'model-demonstration-model-uuid',
              'user-info': {
                'controller-access': 'superuser',
                'model-access': 'admin'
              }
            }
          };
        }
        assert.deepEqual(JSON.parse(received.data), expectedData);
        assert.strictEqual(state.get('authenticated'), expectSuccess);
        done();
      };
      state.logout();
      assert.strictEqual(state.get('authenticated'), false);
      client.open();
      const data = {
        'request-id': 42,
        type: 'Admin',
        request: 'Login',
        params: {'auth-tag': 'user-' + username, credentials: password}
      };
      client.send(JSON.stringify(data));
    };

    it('can log in', done => {
      checkLogin(done, 'admin@local', 'password', true);
    });

    it('can log in (without local postfix)', done => {
      checkLogin(done, 'admin', 'password', true);
    });

    it('fails to log in', done => {
      checkLogin(done, 'admin', 'wrong-password', false);
    });

    it('can log in (environment integration).', function(done) {
      state.logout();
      env.after('login', function() {
        assert.strictEqual(env.userIsAuthenticated, true);
        assert.strictEqual(env.get('controllerAccess'), 'superuser');
        assert.strictEqual(env.get('modelAccess'), 'admin');
        done();
      });
      env.connect();
      env.setCredentials({user: 'admin', password: 'password'});
      env.login();
    });

    it('can return model information.', function(done) {
      // See FakeBackend's initialization for these default values.
      var data = {
        type: 'Client',
        request: 'ModelInfo',
        'request-id': 42
      };
      client.onmessage = function(received) {
        var expected = {
          'request-id': 42,
          response: {
            'provider-type': state.get('providerType'),
            'default-series': state.get('defaultSeries'),
            name: 'sandbox',
            'owner-tag': 'user-admin@local',
            'cloud-tag': 'cloud-demonstration',
            'cloud-credential-tag':
              'cloudcred-demonstration_admin@local_demonstration',
            'cloud-region': 'demo-west'}};
        assert.deepEqual(JSON.parse(received.data), expected);
        done();
      };
      client.open();
      client.send(JSON.stringify(data));
    });

    it('returns ModelGet responses', function(done) {
      var data = {
        'request-id': 42,
        type: 'Client',
        request: 'ModelGet'
      };
      client.onmessage = function(received) {
        var expected = {
          'request-id': 42,
          response: {
            config: {'maas-server': state.get('maasServer')}
          }
        };
        assert.deepEqual(JSON.parse(received.data), expected);
        done();
      };
      client.open();
      client.send(JSON.stringify(data));
    });

    it('can start the AllWatcher', function(done) {
      var data = {
        type: 'Client',
        request: 'WatchAll',
        params: {},
        'request-id': 1066
      };
      client.onmessage = function(received) {
        var receivedData = JSON.parse(received.data);
        assert.equal(receivedData.response.AllWatcherId, 42);
        assert.equal(receivedData['request-id'], 1066);
        assert.isUndefined(client.get('juju').get('nextRequestId'));
        done();
      };
      client.open();
      client.send(JSON.stringify(data));
    });

    it('can listen for deltas with Next', function(done) {
      client.get('juju').set('deltaInterval', 50);
      var data = {
        type: 'AllWatcher',
        request: 'Next',
        params: {},
        'request-id': 1067
      };
      state.deploy('cs:precise/wordpress-27', function() {});
      client.onmessage = function(received) {
        var receivedData = JSON.parse(received.data);
        assert.equal(receivedData['request-id'], 1067);
        assert.isNotNull(receivedData.response.deltas);
        var deltas = receivedData.response.deltas;
        assert.equal(deltas.length, 3);
        assert.deepEqual(deltas.map(function(delta) {
          return delta[0];
        }), ['application', 'machine', 'unit']);
        done();
      };
      client.open();
      client.send(JSON.stringify(data));
    });

    it('structures deltas properly', function(done) {
      client.get('juju').set('deltaInterval', 50);
      var data = {
        type: 'AllWatcher',
        request: 'Next',
        params: {},
        'request-id': 1067
      };
      state.deploy('cs:precise/wordpress-27', function() {});
      client.onmessage = function(received) {
        var receivedData = JSON.parse(received.data);
        var deltas = receivedData.response.deltas;
        assert.equal(deltas.length, 3);
        var applicationChange = deltas[0];
        var machineChange = deltas[1];
        var unitChange = deltas[2];
        assert.deepEqual(applicationChange, [
          'application', 'change', {
            name: 'wordpress',
            exposed: false,
            'charm-url': 'cs:precise/wordpress-27',
            life: 'alive',
            config: {
              debug: 'no',
              engine: 'nginx',
              tuning: 'single',
              'wp-content': ''
            },
            constraints: {},
            subordinate: false
          }], 'applicationChange'
        );
        assert.deepEqual(machineChange, [
          'machine', 'change', {
            id: '0',
            addresses: [],
            'instance-id': 'fake-instance',
            'agent-status': {
              current: 'started',
            },
            jobs: ['JobHostUnits'],
            life: 'alive',
            series: 'precise',
            'hardware-characteristics': {
              arch: 'amd64',
              'cpu-cores': 1,
              'cpu-power': 100,
              mem: 1740,
              'root-disk': 8192
            },
            'supported-containers': ['lxc', 'kvm'],
            'supported-containers-known': true
          }], 'machineChange'
        );
        assert.deepEqual(unitChange, [
          'unit', 'change', {
            name: 'wordpress/0',
            application: 'wordpress',
            series: 'precise',
            'charm-url': 'cs:precise/wordpress-27',
            'machine-id': '0',
            'agent-status': {
              current: 'idle',
              message: '',
              data: {}
            },
            'workload-status': {
              current: 'idle',
              message: '',
              data: {}
            },
            subordinate: false
          }], 'unitChange'
        );
        done();
      };
      client.open();
      client.send(JSON.stringify(data));
    });

    it('can deploy', function(done) {
      // We begin logged in.  See utils.makeFakeBackend.
      var data = {
        type: 'Application',
        request: 'Deploy',
        version: 2,
        params: {applications: [{
          'charm-url': 'cs:precise/wordpress-27',
          application: 'kumquat',
          'config-yaml': 'engine: apache',
          'num-units': 2
        }]},
        'request-id': 42
      };
      client.onmessage = function(received) {
        var receivedData = JSON.parse(received.data);
        assert.equal(receivedData['request-id'], data['request-id']);
        assert.isUndefined(receivedData.error);
        assert.isObject(
            state.db.charms.getById('cs:precise/wordpress-27'));
        var application = state.db.services.getById('kumquat');
        assert.isObject(application);
        assert.equal(application.get('charm'), 'cs:precise/wordpress-27');
        assert.deepEqual(application.get('config'), {
          debug: 'no',
          engine: 'apache',
          tuning: 'single',
          'wp-content': ''
        });
        var units = application.get('units').toArray();
        assert.lengthOf(units, 2);
        done();
      };
      client.open();
      client.send(JSON.stringify(data));
    });

    it('can deploy (environment integration).', function(done) {
      env.connect();
      // We begin logged in.  See utils.makeFakeBackend.
      const callback = function(err, applicationName, charmURL) {
        assert.strictEqual(err, null);
        assert.strictEqual(applicationName, 'kumquat');
        assert.strictEqual(charmURL, 'cs:precise/mediawiki-18');
        const application = state.db.services.getById(applicationName);
        assert.equal(application.get('charm'), 'cs:precise/mediawiki-18');
        assert.deepEqual(application.get('config'), {
          admins: '',
          debug: false,
          logo: 'test logo',
          name: 'Please set name of wiki',
          server_address: '',
          use_suffix: true,
          skin: 'vector'
        });
        done();
      };
      env.deploy({
        charmURL: 'cs:precise/mediawiki-18',
        applicationName: 'kumquat',
        series: 'precise',
        config: {logo: 'test logo'},
        numUnits: 1
      }, callback, {immediate: true});
    });

    it('can deploy with constraints', function(done) {
      const constraints = {
        'cpu-cores': 1,
        'cpu-power': 0,
        mem: '512M',
        arch: 'i386'
      };
      env.connect();
      // We begin logged in.  See utils.makeFakeBackend.
      const callback = function(_, applicationName) {
        const application = state.db.services.getById(applicationName);
        assert.deepEqual(application.get('constraints'), {
          'cpu-cores': 1,
          'cpu-power': 0,
          mem: 512,
          arch: 'i386'
        });
        done();
      };
      env.deploy({
        charmURL: 'cs:precise/wordpress-27',
        applicationName: 'kumquat',
        series: 'precise',
        config: {llama: 'pajama'},
        constraints: constraints,
        numUnits: 1
      }, callback, {immediate: true});
    });

    it('can communicate errors after attempting to deploy', function(done) {
      env.connect();
      state.deploy('cs:precise/wordpress-27', function() {});
      const callback = function(err) {
        assert.strictEqual(
          err, 'An application with this name already exists (wordpress).');
        done();
      };
      env.deploy({
        charmURL: 'cs:precise/wordpress-27',
        applicationName: 'wordpress',
        series: 'precise',
        numUnits: 1
      }, callback, {immediate: true});
    });

    it('can add machines', function(done) {
      state.db.machines.add({id: '0'});
      var request = {
        type: 'Client',
        request: 'AddMachines',
        params: {
          params: [
            {},
            {'parent-id': '0', 'container-type': 'lxc'},
            {'container-type': 'kvm'}
          ]
        },
        'request-id': 42
      };
      client.onmessage = function(response) {
        var data = JSON.parse(response.data);
        assert.isUndefined(data.error);
        assert.strictEqual(data['request-id'], 42);
        var expectedMachines = [
          {machine: '1', error: null},
          {machine: '0/lxc/0', error: null},
          {machine: '2/kvm/0', error: null}
        ];
        assert.deepEqual(data.response.machines, expectedMachines);
        done();
      };
      client.open();
      client.send(JSON.stringify(request));
    });

    it('can add machines (environment integration)', function(done) {
      state.db.machines.add([{id: '1'}, {id: '1/kvm/2'}]);
      var callback = function(response) {
        assert.isUndefined(response.err);
        var expectedMachines = [
          {name: '2', err: null},
          {name: '1/kvm/2/lxc/0', err: null}
        ];
        assert.deepEqual(response.machines, expectedMachines);
        done();
      };
      env.connect();
      env.addMachines(
          [{}, {parentId: '1/kvm/2', containerType: 'lxc'}],
          callback, {immediate: true});
    });

    it('can report errors occurred while adding machines', function(done) {
      var callback = function(response) {
        assert.isUndefined(response.err);
        var expectedMachines = [
          {name: '', err: 'parent machine specified without container type'},
          {name: '', err: 'cannot add a new machine: machine 42 not found'}
        ];
        assert.deepEqual(response.machines, expectedMachines);
        done();
      };
      env.connect();
      env.addMachines(
          [{parentId: '47'}, {parentId: '42', containerType: 'lxc'}],
          callback, {immediate: true});
    });

    it('can destroy machines', function(done) {
      state.db.machines.add([{id: '1'}, {id: '2/lxc/0'}]);
      var request = {
        type: 'Client',
        request: 'DestroyMachines',
        params: {'machine-names': ['1', '2/lxc/0'], force: false},
        'request-id': 42
      };
      client.onmessage = function(response) {
        var data = JSON.parse(response.data);
        assert.isUndefined(data.error);
        assert.strictEqual(data['request-id'], 42);
        done();
      };
      client.open();
      client.send(JSON.stringify(request));
    });

    it('can destroy machines (environment integration)', function(done) {
      state.db.machines.add([{id: '0'}, {id: '1/kvm/2'}]);
      var callback = function(response) {
        assert.isUndefined(response.err);
        assert.deepEqual(response.names, ['0', '1/kvm/2']);
        done();
      };
      env.connect();
      env.destroyMachines(
          ['0', '1/kvm/2'], false, callback, {immediate: true});
    });

    it('can report errors occurred while destroying machines', function(done) {
      var callback = function(response) {
        assert.strictEqual(
            response.err,
            'no machines were destroyed: machine 42 does not exist');
        assert.deepEqual(response.names, ['42']);
        done();
      };
      env.connect();
      env.destroyMachines(['42'], false, callback, {immediate: true});
    });

    it('can destroy an application', function(done) {
      state.deploy('cs:precise/wordpress-27', function() {
        var data = {
          type: 'Application',
          request: 'Destroy',
          params: {application: 'wordpress'},
          'request-id': 42
        };
        client.onmessage = function(received) {
          var receivedData = JSON.parse(received.data);
          assert.equal(receivedData['request-id'], data['request-id']);
          assert.isUndefined(receivedData.error);
          assert.equal(state.db.services.size(), 0);
          assert.isNull(state.db.services.getById('wordpress'));
          done();
        };
        client.open();
        client.send(JSON.stringify(data));
      });
    });

    it('can destroy an application (environment integration)', function(done) {
      env.connect();
      state.deploy('cs:precise/wordpress-27', function() {
        var callback = function(result) {
          assert.isUndefined(result.err);
          assert.equal(state.db.services.size(), 0);
          assert.isNull(state.db.services.getById('wordpress'));
          done();
        };
        env.destroyApplication('wordpress', callback, {immediate: true});
      });
    });

    it('can remove a unit', function(done) {
      state.deploy('cs:precise/wordpress-27', function() {
        var data = {
          type: 'Application',
          request: 'DestroyUnits',
          params: {
            'unit-names': 'wordpress/0'
          },
          'request-id': 42
        };
        client.onmessage = function(received) {
          var receivedData = JSON.parse(received.data);
          assert.equal(receivedData['request-id'], data['request-id']);
          // fakebackend defaults error and warning to [] which carries
          // through.
          assert.isUndefined(receivedData.error);
          assert.equal(state.db.services.item(0).get('units').size(), 0);
          done();
        };
        client.open();
        client.send(JSON.stringify(data));
      });
    });

    it('can remove a unit (environment integration)', function(done) {
      env.connect();
      state.deploy('cs:precise/wordpress-27', function() {
        var callback = function(result) {
          // fakebackend defaults error and warning to [] which carries
          // through.
          assert.isUndefined(result.err);
          assert.equal(state.db.services.item(0).get('units').size(), 0);
          done();
        };
        env.remove_units('wordpress/0', callback, {immediate: true});
      });
    });

    it('can get a charm', function(done) {
      var data = {
        type: 'Charms',
        request: 'CharmInfo',
        params: {'url': 'cs:precise/wordpress-27'},
        'request-id': 42
      };
      client.onmessage = function(received) {
        var receivedData = JSON.parse(received.data);
        assert.isUndefined(receivedData.error);
        assert.isObject(receivedData.response);
        done();
      };
      client.open();
      client.send(JSON.stringify(data));
    });

    it('can set annotations', function(done) {
      generateApplications(function() {
        var data = {
          type: 'Annotations',
          request: 'Set',
          params: {
            annotations: [{
              entity: 'application-wordpress',
              annotations: {'foo': 'bar'}
            }]
          },
          'request-id': 42
        };
        client.onmessage = function(received) {
          var receivedData = JSON.parse(received.data);
          assert.isUndefined(receivedData.error);
          assert.deepEqual(receivedData.response, {});
          done();
        };
        client.open();
        client.send(JSON.stringify(data));
      });
    });

    it('can get a charm (environment integration)', function(done) {
      env.connect();
      var callback = function(result) {
        assert.strictEqual(result.err, undefined);
        assert.isObject(result.result);
        done();
      };
      env.get_charm('cs:precise/wordpress-27', callback);
    });

    it('can communicate errors in getting a charm', function(done) {
      env.connect();
      var callback = function(result) {
        assert.isUndefined(result.result);
        assert.equal(result.err, 'Error interacting with the charmstore API.');
        done();
      };
      env.get_charm('cs:precise/notarealcharm-15', callback);
    });

    it('can successfully get an application and its config', function(done) {
      env.connect();
      state.deploy('cs:precise/mediawiki-15', function() {});
      var callback = function(result) {
        assert.deepEqual(
            result.result.config, {
              admins: '',
              debug: false,
              logo: '',
              name: 'Please set name of wiki',
              server_address: '',
              skin: 'vector',
              use_suffix: true
            }
        );
        // We also make sure that we get some object of data for constraints.
        assert.deepEqual(result.result.constraints, {});
        done();
      };
      env.getApplicationConfig('mediawiki', callback);
    });

    it('can set constraints', function(done) {
      state.deploy('cs:precise/wordpress-27', function() {
        var data = {
          type: 'Application',
          request: 'Update',
          params: {
            application: 'wordpress',
            constraints: {mem: '2'}
          },
          'request-id': 42
        };
        client.onmessage = function(received) {
          var receivedData = JSON.parse(received.data);
          assert.isUndefined(receivedData.error);
          var application = state.db.services.getById('wordpress');
          assert.equal(application.get('constraintsStr'), 'mem=2');
          assert.equal(application.get('constraints').mem, 2);
          done();
        };
        client.open();
        client.send(JSON.stringify(data));
      });
    });

    it('can set constraints (environment integration)', function(done) {
      env.connect();
      state.deploy('cs:precise/wordpress-27', function() {
        var callback = function(result) {
          assert.isUndefined(result.err);
          var application = state.db.services.getById('wordpress');
          assert.equal(application.get('constraintsStr'), 'mem=2');
          assert.equal(application.get('constraints').mem, 2);
          done();
        };
        env.updateApplication(
          'wordpress', {constraints: {mem: '2'}}, callback);
      });
    });

    it('can set config', function(done) {
      state.deploy('cs:precise/wordpress-27', function() {
        var data = {
          type: 'Application',
          request: 'Update',
          params: {
            application: 'wordpress',
            settings: {engine: 'apache'}
          },
          'request-id': 42
        };
        client.onmessage = function(received) {
          var receivedData = JSON.parse(received.data);
          assert.isUndefined(receivedData.error);
          var application = state.db.services.getById('wordpress');
          assert.deepEqual(application.get('config'), {
            debug: 'no',
            engine: 'apache',
            tuning: 'single',
            'wp-content': ''
          });
          done();
        };
        client.open();
        client.send(JSON.stringify(data));
      });
    });

    it('can set config (environment integration)', function(done) {
      env.connect();
      state.deploy('cs:precise/wordpress-27', function() {
        var callback = function(result) {
          assert.isUndefined(result.err);
          var application = state.db.services.getById('wordpress');
          assert.deepEqual(application.get('config'), {
            debug: 'no',
            engine: 'apache',
            tuning: 'single',
            'wp-content': ''
          });
          done();
        };
        env.set_config(
          'wordpress', {engine: 'apache'}, callback, {immediate: true});
      });
    });

    it('can resolve a unit', function(done) {
      state.deploy('cs:precise/wordpress-27', function() {
        state.db.services.getById('wordpress')
          .get('units').getById('wordpress/0')
          .agent_state = 'error';
        var data = {
          type: 'Client',
          request: 'Resolved',
          params: {'unit-name': 'wordpress/0'},
          'request-id': 42
        };
        client.onmessage = function(received) {
          var receivedData = JSON.parse(received.data);
          // Running resolved on fakebackend for just a unit does not do
          // anything much, as no hooks were run in starting the unit.
          // Additionally, resolved does not actually clear the unit error,
          // as that would be done by the hooks.  Since no change actually
          // takes place, we simply need to ensure that no error occurred.
          assert.isUndefined(receivedData.error);
          done();
        };
        client.open();
        client.send(JSON.stringify(data));
      });
    });

    it('can resolve a unit (environment integration)', function(done) {
      env.connect();
      state.deploy('cs:precise/wordpress-27', function() {
        state.db.services.getById('wordpress')
          .get('units').getById('wordpress/0')
          .agent_state = 'error';
        var callback = function(result) {
          // See note above on resolving in a fakebackend.
          assert.isUndefined(result.err);
          done();
        };
        env.resolved('wordpress/0', undefined, false, callback);
      });
    });

    it('can set a charm.', function(done) {
      state.deploy('cs:precise/wordpress-27', function() {});
      var data = {
        type: 'Application',
        request: 'Update',
        params: {
          application: 'wordpress',
          'charm-url': 'cs:precise/mediawiki-18',
        },
        'request-id': 42
      };
      client.onmessage = function(received) {
        var receivedData = JSON.parse(received.data);
        assert.isUndefined(receivedData.err);
        var application = state.db.services.getById('wordpress');
        assert.equal(application.get('charm'), 'cs:precise/mediawiki-18');
        done();
      };
      client.open();
      client.send(JSON.stringify(data));
    });

    it('can set a charm (environment integration).', function(done) {
      env.connect();
      state.deploy('cs:precise/wordpress-27', function() {});
      var cb = function(result) {
        assert.isUndefined(result.err);
        var application = state.db.services.getById('wordpress');
        assert.equal(application.get('charm'), 'cs:precise/mediawiki-18');
        done();
      };
      env.setCharm('wordpress', 'cs:precise/mediawiki-18', false, false, cb);
    });

    /**
      Generates the applications required for some tests. After the
      applications have been generated it will call the supplied callback.

      This interacts directly with the fakebackend bypassing the environment.
      The test "can add additional units" tests this code directly so as long
      as it passes you can consider this method valid.

      @method generateApplications
      @param {Function} callback The callback to call after the applications
        have been generated.
    */
    function generateApplications(callback) {
      state.deploy('cs:precise/wordpress-27', function(application) {
        var data = {
          type: 'Application',
          request: 'AddUnits',
          params: {
            application: 'wordpress',
            'num-units': 2
          }
        };
        state.nextChanges();
        client.onmessage = function(received) {
          // After done generating the applications...
          callback(received);
        };
        client.open();
        client.send(JSON.stringify(data));
      });
    }

    /**
      Same as generateApplications but uses the environment integration
      methods. Should be considered valid if "can add additional units
      (integration)" test passes.

      @method generateIntegrationApplications
      @param {Function} callback The callback to call after the applications
        have been generated.
    */
    function generateIntegrationApplications(callback) {
      const localCb = function(err) {
        assert.strictEqual(err, null);
        env.add_unit('kumquat', 2, null, function(data) {
          // After finished generating integrated applications.
          callback(data);
        }, {immediate: true});
      };
      env.connect();
      env.deploy({
        charmURL: 'cs:precise/wordpress-27',
        applicationName: 'kumquat',
        series: 'precise',
        config: {llama: 'pajama'},
        numUnits: 1
      }, localCb, {immediate: true});
    }

    /**
      Generates the applications and then exposes them for the un/expose tests.
      After they have been exposed it calls the supplied callback.

      This interacts directly with the fakebackend bypassing the environment
      and should be considered valid if "can expose an application" test
      passes.

      @method generateAndExposeApplication
      @param {Function} callback The callback to call after the applications
        have been generated.
    */
    function generateAndExposeApplication(callback) {
      state.deploy('cs:precise/wordpress-27', function(data) {
        var command = {
          type: 'Application',
          request: 'Expose',
          params: {application: data.application.get('name')}
        };
        state.nextChanges();
        client.onmessage = function(rec) {
          callback(rec);
        };
        client.open();
        client.send(JSON.stringify(command));
      }, { unitCount: 1 });
    }

    /**
      Same as generateAndExposeApplication but uses the environment integration
      methods. Should be considered valid if "can expose an application
      (integration)" test passes.

      @method generateAndExposeIntegrationApplication
      @param {Function} callback The callback to call after the applications
        have been generated.
    */
    function generateAndExposeIntegrationApplication(callback) {
      const localCb = function(err, applicationName) {
        assert.strictEqual(err, null);
        env.expose(applicationName, function(rec) {
          callback(rec);
        }, {immediate: true});
      };
      env.connect();
      env.deploy({
        charmURL: 'cs:precise/wordpress-27',
        applicationName: 'kumquat',
        series: 'precise',
        config: {llama: 'pajama'},
        numUnits: 1
      }, localCb, {immediate: true});
    }

    it('can add additional units', function(done) {
      function testForAddedUnits(received) {
        var application = state.db.services.getById('wordpress'),
            units = application.get('units').toArray(),
            data = JSON.parse(received.data),
            mock = {response: {units: ['wordpress/1', 'wordpress/2']}};
        // Do we have enough total units?
        assert.lengthOf(units, 3);
        // Does the response object contain the proper data?
        assert.deepEqual(data, mock);
        // Error is undefined.
        assert.isUndefined(data.error);
        done();
      }
      // Generate the default applications and add units.
      generateApplications(testForAddedUnits);
    });

    it('throws an error when adding units to an invalid application',
        function(done) {
          state.deploy('cs:precise/wordpress-27', function(application) {
            var data = {
              type: 'Application',
              request: 'AddUnits',
              params: {
                application: 'no-application',
                'num-units': 2
              }
            };
            state.nextChanges();
            client.onmessage = function() {
              client.onmessage = function(received) {
                var data = JSON.parse(received.data);

                // If there is no error data.err will be undefined
                assert.equal(true, !!data.error);
                done();
              };
              client.send(JSON.stringify(data));
            };
            client.open();
            client.onmessage();
          });
        }
    );

    it('can add additional units (integration)', function(done) {
      function testForAddedUnits(data) {
        var application = state.db.services.getById('kumquat'),
            units = application.get('units').toArray();
        assert.lengthOf(units, 3);
        done();
      }
      generateIntegrationApplications(testForAddedUnits);
    });

    it('can expose an application', function(done) {
      function checkExposedApplication(rec) {
        var applicationName = 'wordpress';
        var data = JSON.parse(rec.data),
            mock = {response: {}};
        var application = state.db.services.getById(applicationName);
        assert.equal(application.get('exposed'), true);
        assert.deepEqual(data, mock);
        done();
      }
      generateAndExposeApplication(checkExposedApplication);
    });

    it('can expose an application (integration)', function(done) {
      function checkExposedApplication(rec) {
        var application = state.db.services.getById('kumquat');
        assert.equal(application.get('exposed'), true);
        // The Go API does not set a result value.  That is OK as
        // it is never used.
        assert.isUndefined(rec.result);
        done();
      }
      generateAndExposeIntegrationApplication(checkExposedApplication);
    });

    it('fails silently when exposing an exposed application', function(done) {
      function checkExposedApplication(rec) {
        var applicationName = 'wordpress',
            data = JSON.parse(rec.data),
            application = state.db.services.getById(applicationName),
            command = {
              type: 'Application',
              request: 'Expose',
              params: {application: applicationName}
            };
        state.nextChanges();
        client.onmessage = function(rec) {
          assert.equal(data.err, undefined);
          assert.equal(application.get('exposed'), true);
          done();
        };
        client.send(JSON.stringify(command));
      }
      generateAndExposeApplication(checkExposedApplication);
    });

    it('fails with error when exposing an invalid application name',
        function(done) {
          state.deploy('cs:precise/wordpress-27', function(data) {
            var command = {
              type: 'Application',
              request: 'Expose',
              params: {application: 'foobar'}
            };
            state.nextChanges();
            client.onmessage = function(rec) {
              var data = JSON.parse(rec.data);
              assert.equal(data.error,
                 '"foobar" is an invalid application name.');
              done();
            };
            client.open();
            client.send(JSON.stringify(command));
          }, { unitCount: 1 });
        }
    );

    it('can unexpose an application', function(done) {
      function unexposeApplication(rec) {
        var applicationName = 'wordpress',
            command = {
              type: 'Application',
              request: 'Unexpose',
              params: {application: applicationName}
            };
        state.nextChanges();
        client.onmessage = function(rec) {
          var data = JSON.parse(rec.data),
              application = state.db.services.getById('wordpress'),
              mock = {response: {}};
          assert.equal(application.get('exposed'), false);
          assert.deepEqual(data, mock);
          done();
        };
        client.send(JSON.stringify(command));
      }
      generateAndExposeApplication(unexposeApplication);
    });

    it('can unexpose an application (integration)', function(done) {
      var applicationName = 'kumquat';
      function unexposeApplication(rec) {
        function localCb(rec) {
          var application = state.db.services.getById(applicationName);
          assert.equal(application.get('exposed'), false);
          // No result from Go unexpose.
          assert.isUndefined(rec.result);
          done();
        }
        env.unexpose(applicationName, localCb, {immediate: true});
      }
      generateAndExposeIntegrationApplication(unexposeApplication);
    });

    it('fails silently when unexposing a not exposed application',
        function(done) {
          var applicationName = 'wordpress';
          state.deploy('cs:precise/wordpress-27', function(data) {
            var command = {
              type: 'Application',
              request: 'Unexpose',
              params: {application: applicationName}
            };
            state.nextChanges();
            client.onmessage = function(rec) {
              var data = JSON.parse(rec.data),
                  application = state.db.services.getById(applicationName);
              assert.equal(application.get('exposed'), false);
              assert.equal(data.err, undefined);
              done();
            };
            client.open();
            client.send(JSON.stringify(command));
          }, { unitCount: 1 });
        }
    );

    it('fails with error when unexposing an invalid application name',
        function(done) {
          function unexposeApplication(rec) {
            var command = {
              type: 'Application',
              request: 'Unexpose',
              params: {application: 'foobar'}
            };
            state.nextChanges();
            client.onmessage = function(rec) {
              var data = JSON.parse(rec.data);
              assert.equal(
                data.error, '"foobar" is an invalid application name.');
              done();
            };
            client.send(JSON.stringify(command));
          }
          generateAndExposeApplication(unexposeApplication);
        }
    );

    it('can add a relation', function(done) {
      // We begin logged in.  See utils.makeFakeBackend.
      state.deploy('cs:precise/wordpress-27', function() {
        state.deploy('cs:precise/mysql-26', function() {
          var data = {
            'request-id': 42,
            type: 'Application',
            request: 'AddRelation',
            params: {
              endpoints: ['wordpress:db', 'mysql:db']
            }
          };
          client.onmessage = function(received) {
            var recData = JSON.parse(received.data);
            assert.equal(recData['request-id'], data['request-id']);
            assert.equal(recData.error, undefined);
            assert.isObject(
                state.db.relations.getById('wordpress:db mysql:db'));
            var recEndpoints = recData.response.endpoints;
            assert.equal(recEndpoints.wordpress.name, 'db');
            assert.equal(recEndpoints.wordpress.scope, 'global');
            assert.equal(recEndpoints.mysql.name, 'db');
            assert.equal(recEndpoints.mysql.scope, 'global');
            done();
          };
          client.open();
          client.send(JSON.stringify(data));
        });
      });
    });

    it('can add a relation (integration)', function(done) {
      env.connect();
      env.deploy({
        charmURL: 'cs:precise/wordpress-27',
        applicationName: 'wordpress',
        numUnits: 1
      }, function() {
        env.deploy({
          charmURL: 'cs:precise/mysql-26',
          applicationName: 'mysql',
          numUnits: 1
        }, function() {
          const endpointA = ['wordpress', {name: 'db', role: 'client'}];
          const endpointB = ['mysql', {name: 'db', role: 'server'}];
          env.add_relation(endpointA, endpointB, function(recData) {
            assert.equal(recData.err, undefined);
            assert.equal(recData.endpoint_a, 'wordpress:db');
            assert.equal(recData.endpoint_b, 'mysql:db');
            assert.isObject(recData.result);
            assert.isObject(
              state.db.relations.getById('wordpress:db mysql:db'));
            done();
          }, {immediate: true});
        }, {immediate: true});
      }, {immediate: true});
    });

    it('is able to add a relation with a subordinate app', function(done) {
      state.deploy('cs:precise/wordpress-27', function() {
        state.deploy('cs:precise/puppet-5', function(application) {
          var data = {
            'request-id': 42,
            type: 'Application',
            request: 'AddRelation',
            params: {
              endpoints: ['wordpress:juju-info', 'puppet:juju-info']
            }
          };
          client.onmessage = function(received) {
            var recData = JSON.parse(received.data);
            assert.equal(recData['request-id'], data['request-id']);
            assert.equal(recData.error, undefined);
            var recEndpoints = recData.response.endpoints;
            assert.equal(recEndpoints.wordpress.name, 'juju-info');
            assert.equal(recEndpoints.wordpress.scope, 'container');
            assert.equal(recEndpoints.puppet.name, 'juju-info');
            assert.equal(recEndpoints.puppet.scope, 'container');
            done();
          };
          client.open();
          client.send(JSON.stringify(data));
        });
      });
    });

    it('throws an error if only one endpoint is supplied', function(done) {
      // We begin logged in.  See utils.makeFakeBackend.
      state.deploy('cs:precise/wordpress-27', function() {
        var data = {
          'request-id': 42,
          type: 'Application',
          request: 'AddRelation',
          params: {
            endpoints: ['wordpress:db']
          }
        };
        client.onmessage = function(received) {
          var recData = JSON.parse(received.data);
          assert.equal(recData['request-id'], data['request-id']);
          assert.equal(recData.error,
              'Two string endpoint names required to establish a relation');
          done();
        };
        client.open();
        client.send(JSON.stringify(data));
      });
    });

    it('throws an error if endpoints are not relatable', function(done) {
      // We begin logged in.  See utils.makeFakeBackend.
      state.deploy('cs:precise/wordpress-27', function() {
        var data = {
          'request-id': 42,
          type: 'Application',
          request: 'AddRelation',
          params: {
            endpoints: ['wordpress:db', 'mysql:foo']
          }
        };
        client.onmessage = function(received) {
          var recData = JSON.parse(received.data);
          assert.equal(recData['request-id'], data['request-id']);
          assert.equal(recData.error, 'Charm not loaded.');
          done();
        };
        client.open();
        client.send(JSON.stringify(data));
      });
    });

    it('can remove a relation', function(done) {
      // We begin logged in.  See utils.makeFakeBackend.
      var relation = ['wordpress:db', 'mysql:db'];
      state.deploy('cs:precise/wordpress-27', function() {
        state.deploy('cs:precise/mysql-26', function() {
          state.addRelation(relation[0], relation[1]);
          var data = {
            'request-id': 42,
            type: 'Application',
            request: 'DestroyRelation',
            params: {
              endpoints: relation
            }
          };
          client.onmessage = function(received) {
            var recData = JSON.parse(received.data);
            assert.equal(recData['request-id'], data['request-id']);
            assert.equal(recData.error, undefined);
            done();
          };
          client.open();
          client.send(JSON.stringify(data));
        });
      });
    });

    it('can remove a relation(integration)', function(done) {
      env.connect();
      env.deploy({
        charmURL: 'cs:precise/wordpress-27',
        applicationName: 'wordpress',
        numUnits: 1
      }, function() {
        env.deploy({
          charmURL: 'cs:precise/mysql-26',
          applicationName: 'mysql',
          numUnits: 1
        }, function() {
          const endpointA = ['wordpress', {name: 'db', role: 'client'}];
          const endpointB = ['mysql', {name: 'db', role: 'server'}];
          env.add_relation(endpointA, endpointB, function() {
            env.remove_relation(
              endpointA, endpointB, function(recData) {
                assert.equal(recData.err, undefined);
                assert.equal(recData.endpoint_a, 'wordpress:db');
                assert.equal(recData.endpoint_b, 'mysql:db');
                done();
              }, {immediate: true});
          }, {immediate: true});
        }, {immediate: true});
      }, {immediate: true});
    });

    describe('Resources facade', function() {
      it('adds pending resources', function(done) {
        const resources = [
          {Name: 'res1', File: 'res1.tgz'},
          {Name: 'res2', File: 'res2.tgz'}
        ];
        env.connect();
        env.addPendingResources({
          applicationName: 'wordpress',
          charmURL: 'wordpress-42',
          channel: 'stable',
          resources: resources
        }, (err, ids) => {
          assert.strictEqual(err, null);
          assert.deepEqual(ids, {
            res1: 'res1-pending-id',
            res2: 'res2-pending-id'
          });
          done();
        });
      });
    });

    describe('Cloud facade', function() {
      it('can list available clouds', function(done) {
        client.onmessage = function(received) {
          const data = JSON.parse(received.data);
          assert.deepEqual(data, {
            'request-id': 42,
            response: {
              clouds: {
                'cloud-demonstration': {
                  'auth-types': ['empty'],
                  regions: [{name: 'localhost'}],
                  type: 'demonstration'
                }
              }
            }
          });
          done();
        };
        client.open();
        client.send(JSON.stringify({
          'request-id': 42,
          type: 'Cloud',
          request: 'Clouds',
          params: {}
        }));
      });

      it('can retrieve clouds by tag', function(done) {
        client.onmessage = function(received) {
          const data = JSON.parse(received.data);
          assert.deepEqual(data, {
            'request-id': 42,
            response: {
              results: [{
                error: {message: 'cloud cloud-no-such not found'}
              }, {
                cloud: {
                  'auth-types': ['empty'],
                  regions: [{name: 'localhost'}],
                  type: 'demonstration'
                }
              }]
            }
          });
          done();
        };
        client.open();
        client.send(JSON.stringify({
          'request-id': 42,
          type: 'Cloud',
          request: 'Cloud',
          params: {entities: [
            {tag: 'cloud-no-such'},
            {tag: 'cloud-demonstration'},
          ]}
        }));
      });

      it('returns no results for no cloud tags', function(done) {
        client.onmessage = function(received) {
          const data = JSON.parse(received.data);
          assert.deepEqual(data, {
            'request-id': 47,
            response: {results: []}
          });
          done();
        };
        client.open();
        client.send(JSON.stringify({
          'request-id': 47,
          type: 'Cloud',
          request: 'Cloud',
          params: {entities: []}
        }));
      });

      it('can return the default cloud tag', function(done) {
        client.onmessage = function(received) {
          const data = JSON.parse(received.data);
          assert.deepEqual(data, {
            'request-id': 1,
            response: {result: 'cloud-demonstration'}
          });
          done();
        };
        client.open();
        client.send(JSON.stringify({
          'request-id': 1,
          type: 'Cloud',
          request: 'DefaultCloud',
          params: {}
        }));
      });

      it('can retrieve tags for credentials', function(done) {
        client.onmessage = function(received) {
          const data = JSON.parse(received.data);
          assert.deepEqual(data, {
            'request-id': 42,
            response: {
              results: [{
                error: {message: 'invalid user tag provided: user-no-such'}
              }, {
                error: {message: 'invalid cloud tag provided: cloud-no-such'}
              }, {
                result: ['cloudcred-demonstration_admin@local_demonstration']
              }]
            }
          });
          done();
        };
        client.open();
        client.send(JSON.stringify({
          'request-id': 42,
          type: 'Cloud',
          request: 'UserCredentials',
          params: {'user-clouds': [
            {'user-tag': 'user-no-such', 'cloud-tag': 'cloud-demonstration'},
            {'user-tag': 'user-admin@local', 'cloud-tag': 'cloud-no-such'},
            {'user-tag': 'user-admin', 'cloud-tag': 'cloud-demonstration'},
          ]}
        }));
      });

      it('returns no results for no user/cloud pairs', function(done) {
        client.onmessage = function(received) {
          const data = JSON.parse(received.data);
          assert.deepEqual(data, {
            'request-id': 47,
            response: {results: []}
          });
          done();
        };
        client.open();
        client.send(JSON.stringify({
          'request-id': 47,
          type: 'Cloud',
          request: 'UserCredentials',
          params: {'user-clouds': []}
        }));
      });

      it('can retrieve credentials by tag', function(done) {
        client.onmessage = function(received) {
          const data = JSON.parse(received.data);
          assert.deepEqual(data, {
            'request-id': 42,
            response: {
              results: [{
                error: {message: 'credentials cloudcred-no-such not found'}
              }, {
                result: {
                  'auth-type': 'empty',
                  attrs: {engine: 'JavaScript'},
                  redacted: ['bad-parts']
                }
              }]
            }
          });
          done();
        };
        client.open();
        client.send(JSON.stringify({
          'request-id': 42,
          type: 'Cloud',
          request: 'Credential',
          params: {entities: [
            {tag: 'cloudcred-no-such'},
            {tag: 'cloudcred-demonstration_admin@local_demonstration'},
          ]}
        }));
      });

      it('returns no results for no credential tags', function(done) {
        client.onmessage = function(received) {
          const data = JSON.parse(received.data);
          assert.deepEqual(data, {
            'request-id': 47,
            response: {results: []}
          });
          done();
        };
        client.open();
        client.send(JSON.stringify({
          'request-id': 47,
          type: 'Cloud',
          request: 'Credential',
          params: {entities: []}
        }));
      });

      it('can create/update credentials', function(done) {
        client.onmessage = function(received) {
          // The expected response is returned.
          const data = JSON.parse(received.data);
          assert.deepEqual(data, {
            'request-id': 42,
            response: {
              results: [
                {error: {message: 'bad-wolf is not a valid tag'}},
                {},
                {}
              ]
            }
          });
          controllerAPI.connect();
          // The new credential has been added, in addition to the initial one.
          const pairs = [['admin@local', 'demonstration']];
          controllerAPI.getCloudCredentialNames(pairs, (err, results) => {
            assert.strictEqual(err, null);
            const names = [
              'demonstration_admin@local_demonstration',
              'new-one'
            ];
            assert.deepEqual(results[0].names.sort(), names);
            // The data for both credentials has been properly set.
            controllerAPI.getCloudCredentials(names, (err, results) => {
              assert.strictEqual(err, null);
              assert.deepEqual(
                results['demonstration_admin@local_demonstration'], {
                  authType: 'empty',
                  attrs: {answer: '42'},
                  redacted: []
                }
              );
              assert.deepEqual(
                results['new-one'], {
                  authType: 'oauth2',
                  attrs: {number: '47'},
                  redacted: []
                }
              );
              done();
            });
          });
        };
        client.open();
        client.send(JSON.stringify({
          'request-id': 42,
          type: 'Cloud',
          request: 'UpdateCredentials',
          params: {credentials: [{
            tag: 'bad-wolf',
            credential: {'auth-type': 'empty', attrs: {}}
          }, {
            tag: 'cloudcred-demonstration_admin@local_demonstration',
            credential: {'auth-type': 'empty', attrs: {answer: '42'}}
          }, {
            tag: 'cloudcred-new-one',
            credential: {'auth-type': 'oauth2', attrs: {number: '47'}}
          }]}
        }));
      });

      it('returns no results while updating credentials', function(done) {
        client.onmessage = function(received) {
          const data = JSON.parse(received.data);
          assert.deepEqual(data, {
            'request-id': 47,
            response: {results: []}
          });
          done();
        };
        client.open();
        client.send(JSON.stringify({
          'request-id': 47,
          type: 'Cloud',
          request: 'UpdateCredentials',
          params: {credentials: []}
        }));
      });

      it('can revoke credentials', function(done) {
        client.onmessage = function(received) {
          const data = JSON.parse(received.data);
          assert.deepEqual(data, {
            'request-id': 42,
            response: {
              results: [
                {error: {message: 'bad-wolf is not a valid tag'}},
                {},
                {}
              ]
            }
          });
          controllerAPI.connect();
          // The initial credential has been removed.
          const pairs = [['admin@local', 'demonstration']];
          controllerAPI.getCloudCredentialNames(pairs, (err, results) => {
            assert.strictEqual(err, null);
            assert.deepEqual(results[0].names, []);
            done();
          });
        };
        client.open();
        client.send(JSON.stringify({
          'request-id': 42,
          type: 'Cloud',
          request: 'RevokeCredentials',
          params: {entities: [{
            tag: 'bad-wolf',
          }, {
            tag: 'cloudcred-demonstration_admin@local_demonstration',
          }, {
            tag: 'cloudcred-no-such'
          }]}
        }));
      });

      it('returns no results while revoking credentials', function(done) {
        client.onmessage = function(received) {
          const data = JSON.parse(received.data);
          assert.deepEqual(data, {
            'request-id': 47,
            response: {results: []}
          });
          done();
        };
        client.open();
        client.send(JSON.stringify({
          'request-id': 47,
          type: 'Cloud',
          request: 'RevokeCredentials',
          params: {entities: []}
        }));
      });
    });

  });

})();
