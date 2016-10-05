/*
This file is part of the Juju GUI, which lets users view and manage Juju
environments within a graphical interface (https://launchpad.net/juju-gui).
Copyright (C) 2016 Canonical Ltd.

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

var juju = {components: {}}; // eslint-disable-line no-unused-vars

chai.config.includeStack = true;
chai.config.truncateThreshold = 0;

describe('DeploymentCredentialAdd', function() {
  var acl, providers;

  beforeAll(function(done) {
    // By loading this file it adds the component to the juju components.
    YUI().use('deployment-credential-add', function() { done(); });
  });

  beforeEach(() => {
    acl = {isReadOnly: sinon.stub().returns(false)};
    providers = {
      gce: {
        id: 'google',
        showLogo: true,
        signupUrl: 'https://console.cloud.google.com/billing/freetrial',
        svgHeight: 33,
        svgWidth: 256,
        title: 'Google Compute Engine',
        forms: {
          oauth2: [{
            id: 'client-id',
            title: 'Client ID'
          }, {
            id: 'client-email',
            required: true,
            title: 'Client e-mail address'
          }, {
            id: 'private-key',
            title: 'Private key',
            multiLine: true,
            unescape: true
          }, {
            id: 'project-id',
            required: false,
            title: 'Project ID'
          }],
          jsonfile: [{
            id: 'file',
            title: 'Google Compute Engine project credentials .json file',
            json: true
          }]
        },
        message: 'a message'
      }
    };
  });

  it('can render without a cloud', function() {
    var cloud = providers['gce'];
    var close = sinon.stub();
    var renderer = jsTestUtils.shallowRender(
    <juju.components.DeploymentCredentialAdd
        acl={acl}
        updateCloudCredential={sinon.stub()}
        close={close}
        cloud={null}
        providers={providers}
        generateCloudCredentialName={sinon.stub()}
        getCredentials={sinon.stub()}
        setCredential={sinon.stub()}
        user="user-admin"
        validateForm={sinon.stub()} />, true);
    var instance = renderer.getMountedInstance();
    var output = renderer.getRenderOutput();
    var expected = (
      <div className="deployment-credential-add twelve-col">
        <h4>Create new Google Compute Engine credential</h4>
        <div className="twelve-col deployment-credential-add__signup">
          <a href={cloud.signupUrl}
            target="_blank">
            Sign up for {'Google Compute Engine'}
            &nbsp;
            <juju.components.SvgIcon
              name="external-link-16"
              size="12" />
          </a>
        </div>
        <form className="twelve-col">
          <div className="six-col last-col">
            <juju.components.GenericInput
              disabled={false}
              label="Project ID (credential name)"
              placeholder="cred-1"
              required={true}
              ref="credentialName"
              validate={[{
                regex: /\S+/,
                error: 'This field is required.'
              }, {
                regex: /^[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?$/,
                error: 'This field must only contain upper and lowercase ' +
                  'letters, numbers, and hyphens. It must not start or ' +
                  'end with a hyphen.'
              }]} />
          </div>
          <h3 className="deployment-panel__section-title twelve-col">
            Enter credentials
          </h3>
          <div className="deployment-credential-add__credentials">
            <div className="six-col">
              a message
              <juju.components.InsetSelect
                disabled={false}
                label="Authentication type"
                onChange={instance._handleAuthChange}
                options={[{
                  label: 'oauth2',
                  value: 'oauth2'
                }, {
                  label: 'jsonfile',
                  value: 'jsonfile'
                }]} />
              {[<juju.components.GenericInput
                disabled={false}
                key="client-id"
                label="Client ID"
                required={true}
                ref="client-id"
                validate={[{
                  regex: /\S+/,
                  error: 'This field is required.'
                }]} />,
              <juju.components.GenericInput
                disabled={false}
                key="client-email"
                label="Client e-mail address"
                required={true}
                ref="client-email"
                validate={[{
                  regex: /\S+/,
                  error: 'This field is required.'
                }]} />,
              <juju.components.StringConfig
                disabled={false}
                key={"private-key"}
                option={{key: 'Private key'}}
                ref={"private-key"} />,
              <juju.components.GenericInput
                disabled={false}
                key="project-id"
                label="Project ID"
                required={false}
                ref="project-id"
                validate={undefined} />]}
            </div>
            <div className="deployment-flow__notice six-col last-col">
              <p className="deployment-flow__notice-content">
                <juju.components.SvgIcon
                  name="general-action-blue"
                  size="16" />
                Credentials are stored securely on our servers and we will
                notify you by email whenever they are used. See where they are
                used and manage or remove them via the account page.
              </p>
            </div>
          </div>
        </form>
        <div className="prepend-six six-col last-col">
          <juju.components.ButtonRow
            buttons={[{
              action: close,
              title: 'Cancel',
              type: 'neutral'
            }, {
              action: instance._handleAddCredentials,
              submit: true,
              title: 'Add cloud credential',
              type: 'positive'
            }]} />
        </div>
      </div>);
    assert.deepEqual(output, expected);
  });

  it('can render credential fields for a cloud', function() {
    var cloud = providers['gce'];
    var close = sinon.stub();
    var renderer = jsTestUtils.shallowRender(
    <juju.components.DeploymentCredentialAdd
        acl={acl}
        updateCloudCredential={sinon.stub()}
        close={close}
        cloud={{name: 'google', cloudType: 'gce'}}
        providers={providers}
        generateCloudCredentialName={sinon.stub()}
        getCredentials={sinon.stub()}
        setCredential={sinon.stub()}
        user="user-admin"
        validateForm={sinon.stub()} />, true);
    var instance = renderer.getMountedInstance();
    var output = renderer.getRenderOutput();
    var expected = (
      <div className="deployment-credential-add twelve-col">
        <h4>Create new Google Compute Engine credential</h4>
        <div className="twelve-col deployment-credential-add__signup">
          <a href={cloud.signupUrl}
            target="_blank">
            Sign up for {'Google Compute Engine'}
            &nbsp;
            <juju.components.SvgIcon
              name="external-link-16"
              size="12" />
          </a>
        </div>
        <form className="twelve-col">
          <div className="six-col last-col">
            <juju.components.GenericInput
              disabled={false}
              label="Project ID (credential name)"
              placeholder="cred-1"
              required={true}
              ref="credentialName"
              validate={[{
                regex: /\S+/,
                error: 'This field is required.'
              }, {
                regex: /^[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?$/,
                error: 'This field must only contain upper and lowercase ' +
                  'letters, numbers, and hyphens. It must not start or ' +
                  'end with a hyphen.'
              }]} />
          </div>
          <h3 className="deployment-panel__section-title twelve-col">
            Enter credentials
          </h3>
          <div className="deployment-credential-add__credentials">
            <div className="six-col">
              a message
              <juju.components.InsetSelect
                disabled={false}
                label="Authentication type"
                onChange={instance._handleAuthChange}
                options={[{
                  label: 'oauth2',
                  value: 'oauth2'
                }, {
                  label: 'jsonfile',
                  value: 'jsonfile'
                }]} />
              {[<juju.components.GenericInput
                disabled={false}
                key="client-id"
                label="Client ID"
                required={true}
                ref="client-id"
                validate={[{
                  regex: /\S+/,
                  error: 'This field is required.'
                }]} />,
              <juju.components.GenericInput
                disabled={false}
                key="client-email"
                label="Client e-mail address"
                required={true}
                ref="client-email"
                validate={[{
                  regex: /\S+/,
                  error: 'This field is required.'
                }]} />,
              <juju.components.StringConfig
                disabled={false}
                key={"private-key"}
                option={{key: 'Private key'}}
                ref={"private-key"} />,
              <juju.components.GenericInput
                disabled={false}
                key="project-id"
                label="Project ID"
                required={false}
                ref="project-id"
                validate={undefined} />]}
            </div>
            <div className="deployment-flow__notice six-col last-col">
              <p className="deployment-flow__notice-content">
                <juju.components.SvgIcon
                  name="general-action-blue"
                  size="16" />
                Credentials are stored securely on our servers and we will
                notify you by email whenever they are used. See where they are
                used and manage or remove them via the account page.
              </p>
            </div>
          </div>
        </form>
        <div className="prepend-six six-col last-col">
          <juju.components.ButtonRow
            buttons={[{
              action: close,
              title: 'Cancel',
              type: 'neutral'
            }, {
              action: instance._handleAddCredentials,
              submit: true,
              title: 'Add cloud credential',
              type: 'positive'
            }]} />
        </div>
      </div>);
    assert.deepEqual(output, expected);
  });

  it('can render a cloud with a json field', function() {
    var cloud = providers['gce'];
    var close = sinon.stub();
    var renderer = jsTestUtils.shallowRender(
    <juju.components.DeploymentCredentialAdd
        acl={acl}
        updateCloudCredential={sinon.stub()}
        close={close}
        cloud={{name: 'google', cloudType: 'gce'}}
        providers={providers}
        generateCloudCredentialName={sinon.stub()}
        getCredentials={sinon.stub()}
        setCredential={sinon.stub()}
        user="user-admin"
        validateForm={sinon.stub()} />, true);
    var instance = renderer.getMountedInstance();
    instance.setState({authType: 'jsonfile'});
    var output = renderer.getRenderOutput();
    var expected = (
      <div className="deployment-credential-add twelve-col">
        <h4>Create new Google Compute Engine credential</h4>
        <div className="twelve-col deployment-credential-add__signup">
          <a href={cloud.signupUrl}
            target="_blank">
            Sign up for {'Google Compute Engine'}
            &nbsp;
            <juju.components.SvgIcon
              name="external-link-16"
              size="12" />
          </a>
        </div>
        <form className="twelve-col">
          <div className="six-col last-col">
            <juju.components.GenericInput
              disabled={false}
              label="Project ID (credential name)"
              placeholder="cred-1"
              required={true}
              ref="credentialName"
              validate={[{
                regex: /\S+/,
                error: 'This field is required.'
              }, {
                regex: /^[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?$/,
                error: 'This field must only contain upper and lowercase ' +
                  'letters, numbers, and hyphens. It must not start or ' +
                  'end with a hyphen.'
              }]} />
          </div>
          <h3 className="deployment-panel__section-title twelve-col">
            Enter credentials
          </h3>
          <div className="deployment-credential-add__credentials">
            <div className="six-col">
              a message
              <juju.components.InsetSelect
                disabled={false}
                label="Authentication type"
                onChange={instance._handleAuthChange}
                options={[{
                  label: 'oauth2',
                  value: 'oauth2'
                }, {
                  label: 'jsonfile',
                  value: 'jsonfile'
                }]} />
                {[
                  <div className="deployment-credential-add__upload" key="file">
                    <juju.components.FileField
                      accept=".json"
                      disabled={false}
                      key="file"
                      label="Upload Google Compute Engine .json auth-file"
                      required={true}
                      ref="file" />
                  </div>
                ]}
            </div>
            <div className="deployment-flow__notice six-col last-col">
              <p className="deployment-flow__notice-content">
                <juju.components.SvgIcon
                  name="general-action-blue"
                  size="16" />
                Credentials are stored securely on our servers and we will
                notify you by email whenever they are used. See where they are
                used and manage or remove them via the account page.
              </p>
            </div>
          </div>
        </form>
        <div className="prepend-six six-col last-col">
          <juju.components.ButtonRow
            buttons={[{
              action: close,
              title: 'Cancel',
              type: 'neutral'
            }, {
              action: instance._handleAddCredentials,
              submit: true,
              title: 'Add cloud credential',
              type: 'positive'
            }]} />
        </div>
      </div>);
    assert.deepEqual(output, expected);
  });

  it('can disable controls when read only', function() {
    acl.isReadOnly = sinon.stub().returns(true);
    var cloud = providers['gce'];
    var close = sinon.stub();
    var renderer = jsTestUtils.shallowRender(
    <juju.components.DeploymentCredentialAdd
        acl={acl}
        updateCloudCredential={sinon.stub()}
        close={close}
        cloud={{name: 'google', cloudType: 'gce'}}
        providers={providers}
        generateCloudCredentialName={sinon.stub()}
        getCredentials={sinon.stub()}
        setCredential={sinon.stub()}
        user="user-admin"
        validateForm={sinon.stub()} />, true);
    var instance = renderer.getMountedInstance();
    var output = renderer.getRenderOutput();
    var expected = (
      <div className="deployment-credential-add twelve-col">
        <h4>Create new Google Compute Engine credential</h4>
        <div className="twelve-col deployment-credential-add__signup">
          <a href={cloud.signupUrl}
            target="_blank">
            Sign up for {'Google Compute Engine'}
            &nbsp;
            <juju.components.SvgIcon
              name="external-link-16"
              size="12" />
          </a>
        </div>
        <form className="twelve-col">
          <div className="six-col last-col">
            <juju.components.GenericInput
              disabled={true}
              label="Project ID (credential name)"
              placeholder="cred-1"
              required={true}
              ref="credentialName"
              validate={[{
                regex: /\S+/,
                error: 'This field is required.'
              }, {
                regex: /^[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?$/,
                error: 'This field must only contain upper and lowercase ' +
                  'letters, numbers, and hyphens. It must not start or ' +
                  'end with a hyphen.'
              }]} />
          </div>
          <h3 className="deployment-panel__section-title twelve-col">
            Enter credentials
          </h3>
          <div className="deployment-credential-add__credentials">
            <div className="six-col">
              a message
              <juju.components.InsetSelect
                disabled={true}
                label="Authentication type"
                onChange={instance._handleAuthChange}
                options={[{
                  label: 'oauth2',
                  value: 'oauth2'
                }, {
                  label: 'jsonfile',
                  value: 'jsonfile'
                }]} />
              {[<juju.components.GenericInput
                disabled={true}
                key="client-id"
                label="Client ID"
                required={true}
                ref="client-id"
                validate={[{
                  regex: /\S+/,
                  error: 'This field is required.'
                }]} />,
              <juju.components.GenericInput
                disabled={true}
                key="client-email"
                label="Client e-mail address"
                required={true}
                ref="client-email"
                validate={[{
                  regex: /\S+/,
                  error: 'This field is required.'
                }]} />,
              <juju.components.StringConfig
                disabled={true}
                key={"private-key"}
                option={{key: 'Private key'}}
                ref={"private-key"} />,
              <juju.components.GenericInput
                disabled={true}
                key="project-id"
                label="Project ID"
                required={false}
                ref="project-id"
                validate={undefined} />]}
            </div>
            <div className="deployment-flow__notice six-col last-col">
              <p className="deployment-flow__notice-content">
                <juju.components.SvgIcon
                  name="general-action-blue"
                  size="16" />
                Credentials are stored securely on our servers and we will
                notify you by email whenever they are used. See where they are
                used and manage or remove them via the account page.
              </p>
            </div>
          </div>
        </form>
        <div className="prepend-six six-col last-col">
          <juju.components.ButtonRow
            buttons={[{
              action: close,
              title: 'Cancel',
              type: 'neutral'
            }, {
              action: instance._handleAddCredentials,
              submit: true,
              title: 'Add cloud credential',
              type: 'positive'
            }]} />
        </div>
      </div>);
    assert.deepEqual(output, expected);
  });

  it('can add the credentials', function() {
    var updateCloudCredential = sinon.stub().callsArg(3);
    const getCredentials = sinon.stub();
    var renderer = jsTestUtils.shallowRender(
      <juju.components.DeploymentCredentialAdd
          acl={acl}
          updateCloudCredential={updateCloudCredential}
          close={sinon.stub()}
          cloud={{name: 'google', cloudType: 'gce'}}
          providers={providers}
          generateCloudCredentialName={sinon.stub().returns('new@test')}
          getCredentials={getCredentials}
          setCredential={sinon.stub()}
          user="user-admin"
          validateForm={sinon.stub().returns(true)} />, true);
    var instance = renderer.getMountedInstance();
    instance.refs = {
      'credentialName': {
        validate: sinon.stub().returns(true),
        getValue: sinon.stub().returns('new@test')
      },
      'client-id': {
        validate: sinon.stub().returns(true),
        getValue: sinon.stub().returns('client id')
      },
      'client-email': {
        validate: sinon.stub().returns(true),
        getValue: sinon.stub().returns('client email')
      },
      'private-key': {
        validate: sinon.stub().returns(true),
        getValue: sinon.stub().returns('private key')
      },
      'project-id': {
        getValue: sinon.stub().returns('project id')
      }
    };
    instance._handleAddCredentials();
    assert.equal(updateCloudCredential.callCount, 1);
    const args = updateCloudCredential.args[0];
    assert.equal(args[0], 'new@test');
    assert.equal(args[1], 'oauth2');
    assert.deepEqual(args[2], {
      'client-id': 'client id',
      'client-email': 'client email',
      'private-key': 'private key',
      'project-id': 'project id'
    });
    assert.equal(getCredentials.callCount, 1);
    assert.equal(getCredentials.args[0][0], 'new@test');
  });

  it('properly unescapes necessary fields', function() {
    const updateCloudCredential = sinon.stub();
    const renderer = jsTestUtils.shallowRender(
    <juju.components.DeploymentCredentialAdd
        acl={acl}
        updateCloudCredential={updateCloudCredential}
        close={sinon.stub()}
        cloud={{name: 'google', cloudType: 'gce'}}
        providers={providers}
        generateCloudCredentialName={sinon.stub()}
        getCredentials={sinon.stub()}
        setCredential={sinon.stub()}
        user="user-admin"
        validateForm={sinon.stub().returns(true)} />, true);
    const instance = renderer.getMountedInstance();
    instance.setState({authType: 'oauth2'});
    instance.refs = {
      'credentialName': {
        validate: sinon.stub().returns(true),
        getValue: sinon.stub().returns('new@test')
      },
      'client-id': {
        validate: sinon.stub().returns(true),
        getValue: sinon.stub().returns('client id')
      },
      'client-email': {
        validate: sinon.stub().returns(true),
        getValue: sinon.stub().returns('client email')
      },
      'private-key': {
        validate: sinon.stub().returns(true),
        getValue: sinon.stub().returns('foo%20\\n')
      },
      'project-id': {
        validate: sinon.stub().returns(true),
        getValue: sinon.stub().returns('project id')
      }
    };
    instance._handleAddCredentials();
    assert.equal(updateCloudCredential.callCount, 1);
    assert.equal(updateCloudCredential.args[0][2]['private-key'], 'foo \n');
  });

  it('does not submit the form if there are validation errors', function() {
    var updateCloudCredential = sinon.stub();
    var renderer = jsTestUtils.shallowRender(
      <juju.components.DeploymentCredentialAdd
          acl={acl}
          updateCloudCredential={updateCloudCredential}
          close={sinon.stub()}
          cloud={{name: 'google', cloudType: 'gce'}}
          providers={providers}
          generateCloudCredentialName={sinon.stub()}
          getCredentials={sinon.stub()}
          setCredential={sinon.stub()}
          user="user-admin"
          validateForm={sinon.stub().returns(false)} />, true);
    var instance = renderer.getMountedInstance();
    instance._handleAddCredentials();
    assert.equal(updateCloudCredential.callCount, 0);
  });
});
