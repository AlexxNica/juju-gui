/*
This file is part of the Juju GUI, which lets users view and manage Juju
environments within a graphical interface (https://launchpad.net/juju-gui).
Copyright (C) 2015 Canonical Ltd.

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

describe('Account', () => {
  var acl, users;

  beforeAll((done) => {
    // By loading this file it adds the component to the juju components.
    YUI().use('account', () => { done(); });
  });

  beforeEach(() => {
    acl = {isReadOnly: sinon.stub().returns(false)};
    users = {
      charmstore: {
        user: 'test-owner',
        usernameDisplay: 'test owner'
      },
      jem: {
        user: 'jem-user'
      }
    };
  });

  it('renders the loading state', () => {
    var component = jsTestUtils.shallowRender(
      <juju.components.Account
        acl={acl}
        deleteTemplate={sinon.stub()}
        listTemplates={sinon.stub()}
        user={users.charmstore}
        users={users} />, true);
    var instance = component.getMountedInstance();
    var output = component.getRenderOutput();
    var links = [{
      label: '(Primary account)',
      type: 'light'
    }, {
      action: instance._handleSignOut,
      label: 'Sign out'
    }];
    var expected = (
      <juju.components.Panel
        instanceName="account"
        visible={true}>
        <div className="twelve-col">
          <div className="inner-wrapper">
            <juju.components.UserProfileHeader
              users={users}
              avatar=""
              links={links}
              username="test owner" />
            <h2 className="account__title twelve-col">
              Account management
            </h2>
            <h3 className="account__title2 twelve-col">
              Cloud credentials
              <ul className="account__title-links">
                <li className="account__title-link">
                  Add
                </li>
                <li className="account__title-bullet">
                  &nbsp;&bull;&nbsp;
                </li>
                <li className="account__title-link">
                  Edit defaults
                </li>
              </ul>
            </h3>
            <form className="twelve-col">
              <div className="six-col">
                <label className="deployment-panel__label"
                  htmlFor="default-credential">
                  Default credential
                </label>
                <input className="deployment-panel__input"
                  id="default-credential"
                  type="text" />
              </div>
              <div className="six-col last-col">
                <label className="deployment-panel__label"
                  htmlFor="default-region">
                  Default region
                </label>
                <input className="deployment-panel__input"
                  id="default-region"
                  type="text" />
              </div>
            </form>
            <ul className="user-profile__list twelve-col">
              <li className="user-profile__list-header twelve-col">
                <span className="user-profile__list-col three-col">
                  Credential name
                </span>
                <span className="user-profile__list-col three-col">
                  No. of models
                </span>
                <span className="user-profile__list-col three-col">
                  Owner
                </span>
                <span className="user-profile__list-col three-col last-col">
                  Provider
                </span>
              </li>
              <juju.components.Spinner />
              {undefined}
            </ul>
          </div>
        </div>
      </juju.components.Panel>
    );
    assert.deepEqual(output, expected);
  });

  it('renders the credentials', () => {
    var listTemplates = sinon.stub().callsArgWith(
      0, null, [{path: 'spinach/test-model'}]);
    var component = jsTestUtils.shallowRender(
      <juju.components.Account
        acl={acl}
        deleteTemplate={sinon.stub()}
        listTemplates={listTemplates}
        user={users.charmstore}
        users={users} />, true);
    var instance = component.getMountedInstance();
    instance.componentWillMount();
    var output = component.getRenderOutput();
    var credentials = output.props.children.props.children.props.children[4];
    var expected = (
      <ul className="user-profile__list twelve-col">
        <li className="user-profile__list-header twelve-col">
          <span className="user-profile__list-col three-col">
            Credential name
          </span>
          <span className="user-profile__list-col three-col">
            No. of models
          </span>
          <span className="user-profile__list-col three-col">
            Owner
          </span>
          <span className="user-profile__list-col three-col last-col">
            Provider
          </span>
        </li>
        {undefined}
        {[<juju.components.ExpandingRow
          classes={{
            'user-profile__entity': true,
            'user-profile__list-row': true
          }}
          key="spinach/test-model">
          <div>
            <span className="user-profile__list-col three-col">
              test-model
            </span>
            <span className="user-profile__list-col three-col">
              --
            </span>
            <span className="user-profile__list-col three-col">
              spinach
            </span>
            <span className="user-profile__list-col three-col last-col">
              --
            </span>
          </div>
          <div>
            <div className="expanding-row__expanded-header twelve-col">
              <div className="nine-col no-margin-bottom">
                test-model
              </div>
              <div className={'expanding-row__expanded-header-action ' +
                'three-col last-col no-margin-bottom'}>
                <juju.components.GenericButton
                  action={credentials.props.children[2][0].props.children[1]
                    .props.children[0].props.children[1].props.children[0]
                    .props.action}
                  disabled={false}
                  type='inline-base'
                  title="Destroy" />
                <juju.components.GenericButton
                  action={instance._handleEditCredential}
                  disabled={false}
                  type='inline-neutral'
                  title="Edit" />
              </div>
            </div>
            <div className={
              'expanding-row__expanded-content twelve-col ' +
              'no-margin-bottom'}>
              <ul className="user-profile__list twelve-col">
                <li className="user-profile__list-header twelve-col">
                  <span className="user-profile__list-col three-col">
                    Model
                  </span>
                  <span className="user-profile__list-col three-col">
                    Units
                  </span>
                  <span className="user-profile__list-col three-col">
                    Owner
                  </span>
                  <span className={
                    'user-profile__list-col three-col last-col'}>
                    Region
                  </span>
                </li>
                <li className="user-profile__list-row twelve-col">
                  <span className="user-profile__list-col three-col">
                    Callisto
                  </span>
                  <span className="user-profile__list-col three-col">
                    4
                  </span>
                  <span className="user-profile__list-col three-col">
                    Spinach
                  </span>
                  <span className={
                    'user-profile__list-col three-col last-col'}>
                    US (East)
                  </span>
                </li>
                <li className="user-profile__list-row twelve-col">
                  <span className="user-profile__list-col three-col">
                    Callisto
                  </span>
                  <span className="user-profile__list-col three-col">
                    4
                  </span>
                  <span className="user-profile__list-col three-col">
                    Spinach
                  </span>
                  <span className={
                    'user-profile__list-col three-col last-col'}>
                    US (East)
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </juju.components.ExpandingRow>]}
      </ul>);
    assert.deepEqual(credentials, expected);
  });

  it('disables the buttons if in read only mode', () => {
    var listTemplates = sinon.stub().callsArgWith(
      0, null, [{path: 'spinach/test-model'}]);
    acl.isReadOnly = sinon.stub().returns(true);
    var component = jsTestUtils.shallowRender(
      <juju.components.Account
        acl={acl}
        deleteTemplate={sinon.stub()}
        listTemplates={listTemplates}
        user={users.charmstore}
        users={users} />, true);
    var instance = component.getMountedInstance();
    instance.componentWillMount();
    var output = component.getRenderOutput();
    var buttons = output.props.children.props.children.props.children[4]
      .props.children[2][0].props.children[1].props.children[0]
      .props.children[1];
    var expected = (
      <div className={'expanding-row__expanded-header-action ' +
        'three-col last-col no-margin-bottom'}>
        <juju.components.GenericButton
          action={buttons.props.children[0]
            .props.action}
          disabled={true}
          type='inline-base'
          title="Destroy" />
        <juju.components.GenericButton
          action={instance._handleEditCredential}
          disabled={true}
          type='inline-neutral'
          title="Edit" />
      </div>);
    assert.deepEqual(buttons, expected);
  });

  it('will abort the requests when unmounting', function() {
    var abort = sinon.stub();
    var listTemplates = sinon.stub().returns({abort: abort});
    var renderer = jsTestUtils.shallowRender(
      <juju.components.Account
        acl={acl}
        deleteTemplate={sinon.stub()}
        listTemplates={listTemplates}
        user={users.charmstore}
        users={users} />, true);
    renderer.unmount();
    assert.equal(abort.callCount, 1);
  });

  it('can destroy a credential', function() {
    var listTemplates = sinon.stub().callsArgWith(
      0, null, [{path: 'spinach/test-model'}]);
    var deleteTemplate = sinon.stub();
    var renderer = jsTestUtils.shallowRender(
      <juju.components.Account
        acl={acl}
        deleteTemplate={deleteTemplate}
        listTemplates={listTemplates}
        user={users.charmstore}
        users={users} />, true);
    var instance = renderer.getMountedInstance();
    var output = renderer.getRenderOutput();
    output.props.children.props.children.props.children[4].props.children[2][0]
      .props.children[1].props.children[0].props.children[1].props.children[0]
      .props.action();
    assert.equal(deleteTemplate.callCount, 1);
    assert.deepEqual(deleteTemplate.args[0], [
      users.jem.user, 'test-model', instance._destroyCredentialCallback]);
  });

  it('updates the credentials when one is destroyed', function() {
    var listTemplates = sinon.stub().callsArgWith(
      0, null, [{path: 'spinach/test-model'}]);
    var deleteTemplate = sinon.stub().callsArg(2);
    var renderer = jsTestUtils.shallowRender(
      <juju.components.Account
        acl={acl}
        deleteTemplate={deleteTemplate}
        listTemplates={listTemplates}
        user={users.charmstore}
        users={users} />, true);
    var output = renderer.getRenderOutput();
    output.props.children.props.children.props.children[4].props.children[2][0]
      .props.children[1].props.children[0].props.children[1].props.children[0]
      .props.action();
    assert.equal(listTemplates.callCount, 2);
  });
});
