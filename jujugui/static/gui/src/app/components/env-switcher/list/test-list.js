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
var testUtils = React.addons.TestUtils;

chai.config.includeStack = true;
chai.config.truncateThreshold = 0;

describe('EnvList', function() {

  beforeAll(function(done) {
    // By loading these files it makes their classes available in the tests.
    YUI().use('env-list', function() { done(); });
  });

  it('renders a list of environments', function() {
    const models = [
      {uuid: 'model-uuid-1', name: 'model-name-1', owner: 'who@external'},
      {uuid: 'model-uuid-2', name: 'model-name-2', owner: 'dalek@external'}
    ];
    const renderer = jsTestUtils.shallowRender(
      <juju.components.EnvList
        authDetails={{user: 'who@external', rootUserName: 'who'}}
        envs={models}
        handleEnvClick={sinon.stub()}
        showProfile={sinon.stub()}
      />, true);
    const instance = renderer.getMountedInstance();
    const output = renderer.getRenderOutput();
    assert.deepEqual(output.props.children[0].props.children, [
      <li className="env-list__environment"
        role="menuitem"
        tabIndex="0"
        data-id={models[0].uuid}
        data-name={models[0].name}
        onClick={instance._handleModelClick}
        key={models[0].uuid}>
        {models[0].name}
      </li>,
      <li className="env-list__environment"
        role="menuitem"
        tabIndex="0"
        data-id={models[1].uuid}
        data-name={models[1].name}
        onClick={instance._handleModelClick}
        key={models[1].uuid}>
        {'dalek/model-name-2'}
      </li>
    ]);
  });

  it('displays a message if there are no models', function() {
    const output = jsTestUtils.shallowRender(
      <juju.components.EnvList
        authDetails={{user: 'who@external', rootUserName: 'who'}}
        envs={[]}
        handleEnvClick={sinon.stub()}
        showProfile={sinon.stub()} />);
    assert.deepEqual(output.props.children[0].props.children,
      <li className="env-list__environment" key="none">
        No models available, click below to view your profile and create a new
        model.
      </li>);
  });

  it('clicking an env calls the handleEnvClick prop', function() {
    const models = [{uuid: 'abc123', name: 'the name', owner: 'who@external'}];
    const handleEnvClick = sinon.stub();
    const getAttribute = sinon.stub();
    getAttribute.withArgs('data-id').returns('abc123');
    getAttribute.withArgs('data-name').returns('the name');
    const output = jsTestUtils.shallowRender(
      <juju.components.EnvList
        authDetails={{user: 'who@external', rootUserName: 'who'}}
        envs={models}
        handleEnvClick={handleEnvClick}
        showProfile={sinon.stub()} />);
    output.props.children[0].props.children[0].props.onClick({
      currentTarget: {
        getAttribute: getAttribute
      }
    });
    assert.equal(handleEnvClick.callCount, 1);
  });

  it('showProfile call is made when clicking on buttonRow button', function() {
    const showProfile = sinon.stub();
    const models = [{uuid: 'abc123', name: 'the name', owner: 'who@external'}];
    const component = testUtils.renderIntoDocument(
      <juju.components.EnvList
        authDetails={{user: 'who@external', rootUserName: 'who'}}
        envs={models}
        handleEnvClick={sinon.stub()}
        showProfile={showProfile} />);
    testUtils.Simulate.click(
        ReactDOM.findDOMNode(component)
                .querySelector('.button--neutral'));
    assert.equal(showProfile.callCount, 1);
  });

});
