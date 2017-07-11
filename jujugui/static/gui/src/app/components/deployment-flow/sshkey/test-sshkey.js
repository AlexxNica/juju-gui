/*
This file is part of the Juju GUI, which lets users view and manage Juju
environments within a graphical interface (https://launchpad.net/juju-gui).
Copyright (C) 2017 Canonical Ltd.

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

describe('DeploymentSSHKey', function() {
  let setSSHKey;
  let githubSSHKeys;

  beforeAll(function(done) {
    // By loading this file it adds the component to the juju components.
    YUI().use('deployment-ssh-key', function() {
      done();
    });
  });

  beforeEach(() => {
    setSSHKey = sinon.stub();
    githubSSHKeys = sinon.stub();
  });

  // Render the component and return the instance and the output.
  const render = (cloudType, _githubSSHKeys) => {
    let cloud = null;
    if (cloudType) {
      cloud = {cloudType: cloudType};
    }
    const renderer = jsTestUtils.shallowRender(
      <juju.components.DeploymentSSHKey
        cloud={cloud}
        githubSSHKeys={_githubSSHKeys || githubSSHKeys}
        setSSHKey={setSSHKey}
      />, true);
    return {
      instance: renderer.getMountedInstance(),
      output: renderer.getRenderOutput(),
      renderer: renderer
    };
  };

  it('does not render without a cloud', function() {
    const comp = render(null);
    assert.strictEqual(comp.output, null);
  });

  it('renders with a cloud', function() {
    const comp = render('aws');
    const expectedOutput = (
      <div className="deployment-ssh-key">
        <p>
          Keys will allow you SSH access to the machines
          provisioned by Juju for this model.
        </p>
        {false}
        {false}
        <div className="twelve-col no-margin-bottom">
          <div className="three-col no-margin-bottom">
            <juju.components.InsetSelect
              disabled={false}
              ref="sshSource"
              label="Source"
              onChange={comp.instance._handleSourceChange.bind(comp.instance)}
              options={[
                {
                  label: 'GitHub',
                  value: 'github'
                },
                {
                  label: 'Manual',
                  value: 'manual'
                }
              ]} />
          </div>
          <div className="three-col last-col no-margin-bottom">
            <juju.components.GenericInput
              ref="githubUsername"
              autocomplete
              key="githubUsername"
              label="GitHub username"
              onKeyUp={comp.instance._onGithubUsernameInputKey.bind(comp.instance)}
              type="text"
              validate={undefined} />
          </div>
          <div className="right">
            <juju.components.GenericButton
              action={comp.instance._onSSHKeyInputKey.bind(comp.instance)}
              disabled
              title="Add Keys"
              type="positive" />
          </div>
        </div>
      </div>
    );
    expect(comp.output).toEqualJSX(expectedOutput);
  });

  it('renders with azure', function() {
    const comp = render('azure');
    const expectedOutput = (
      <div className="deployment-ssh-key">
        <p>
          Keys will allow you SSH access to the machines provisioned on Azure.
        </p>
        {false}
        {false}
        <div className="twelve-col no-margin-bottom">
          <div className="three-col no-margin-bottom">
            <juju.components.InsetSelect
              ref="sshSource"
              label="Source"
              onChange={comp.instance._handleSourceChange.bind(comp.instance)}
              options={[
                {
                  label: 'GitHub',
                  value: 'github'
                },
                {
                  label: 'Manual',
                  value: 'manual'
                }
              ]} />
          </div>
          <div className="three-col last-col no-margin-bottom">
            <juju.components.GenericInput
              ref="githubUsername"
              autocomplete
              label="GitHub username"
              onKeyUp={comp.instance._onGithubUsernameInputKey.bind(comp.instance)}
              required
              type="text"
              validate={[
                {
                  error: 'This field is required.',
                  regex: {}
                }
              ]} />
          </div>
          <div className="right">
            <juju.components.GenericButton
              action={comp.instance._onSSHKeyInputKey.bind(comp.instance)}
              disabled
              title="Add Keys"
              type="positive" />
          </div>
        </div>
      </div>
    );
    expect(comp.output).toEqualJSX(expectedOutput);
  });

  describe('github', () => {
    it('shows an error if no keys found', () => {
      const comp = render('aws');
      comp.instance._handleAddGithubKeys(null, []);
      const output = comp.renderer.getRenderOutput();
      expect(output.props.children[2]).toEqualJSX(
        <juju.components.Notification
          content={<span><b>Error:</b>
            <span>No keys found.
              <a className="link" href="https://github.com/settings/keys"
                target="_blank">Create an SSH Key</a>.
            </span>
          </span>}
          type="negative" />);
    });

    it('shows an error if user not found', () => {
      const comp = render('aws');
      comp.instance._handleAddGithubKeys('Not Found', {
        message: 'Not Found'
      });
      const output = comp.renderer.getRenderOutput();
      expect(output.props.children[2]).toEqualJSX(
        <juju.components.Notification
          content={(<span><b>Error:</b> Not Found</span>)}
          type="negative" />);
    });

    it ('creates a table if keys present', () => {
      const comp = render('aws');
      comp.instance.refs = {
        githubUsername: {
          focus: sinon.stub(),
          setValue: sinon.stub()
        }
      };
      comp.instance._handleAddGithubKeys(null, [
        {id: 1, type: 'ssh-rsa', body: 'thekey', text: 'ssh-rsa thekey'}
      ]);
      const output = comp.renderer.getRenderOutput();
      expect(output.props.children[1]).toEqualJSX(
        <ul className="deployment-machines__list clearfix">
          <li className="deployment-flow__row-header twelve-col">
            <div className="two-col">Type</div>
            <div className="ten-col last-col">Key</div>
          </li>
          <li className="deployment-flow__row twelve-col">
            <div className="two-col">ssh-rsa</div>
            <div className="nine-col added-keys__key-value" title="thekey">
              thekey...thekey
            </div>
            <div className="one-col last-col">
              <span className="added-keys__key-remove right"
                onClick={comp.instance._removeKey.bind(comp.instance)}
                role="button"
                title="Remove key">
                <juju.components.SvgIcon name="close_16" size="16" />
              </span>
            </div>
          </li>
        </ul>
      );
    });

    it('stores the first SSH key', function() {
      const comp = render('gce');
      comp.instance.refs = {
        githubUsername: {
          focus: sinon.stub(),
          setValue: sinon.stub()
        }
      };
      comp.instance._handleAddGithubKeys(null, [
        {id: 1, type: 'ssh-rsa', body: 'thekey', text: 'ssh-rsa thekey'}
      ]);
      expect(comp.instance.props.setSSHKey.callCount).toEqual(1);
      expect(comp.instance.props.setSSHKey.args[0][0]).toEqual('ssh-rsa thekey');
    });
  });

  it('changes source and disables the button', function() {
    const comp = render('aws');
    comp.instance.refs = {sshSource: {getValue: () => 'manual'}};
    comp.instance._handleSourceChange();
    expect(comp.instance.state.addSource).toEqual('manual');
    expect(comp.instance.state.buttonDisabled).toEqual(true);
  });

  describe('manual', () => {
    let comp;
    beforeEach(() => {
      comp = render('gce');
      comp.instance.refs = {
        sshSource: {getValue: () => 'manual'},
        sshKey: {
          setValue: () => sinon.stub(),
          focus: () => sinon.stub(),
          getValue: () => 'ssh-rsa thekey'
        }
      };
      comp.instance.setState({buttonDisabled: false});
    });

    it('stores the SSH key', function() {
      comp.instance._handleAddMoreKeys.call(comp.instance);
      expect(comp.instance.props.setSSHKey.callCount).toEqual(1);
      expect(comp.instance.props.setSSHKey.args[0][0]).toEqual('ssh-rsa thekey');
    });

    it ('shows a table if keys present', () => {
      comp.instance._handleAddMoreKeys.call(comp.instance);
      const output = comp.renderer.getRenderOutput();
      expect(output.props.children[1]).toEqualJSX(
        <ul className="deployment-machines__list clearfix">
          <li className="deployment-flow__row-header twelve-col">
            <div className="two-col">Type</div>
            <div className="ten-col last-col">Key</div>
          </li>
          <li className="deployment-flow__row twelve-col">
            <div className="two-col">ssh-rsa</div>
            <div className="nine-col added-keys__key-value" title="thekey">
              thekey...thekey
            </div>
            <div className="one-col last-col">
              <span className="added-keys__key-remove right"
                onClick={comp.instance._removeKey.bind(comp.instance)}
                role="button"
                title="Remove key">
                <juju.components.SvgIcon name="close_16" size="16" />
              </span>
            </div>
          </li>
        </ul>
      );
    });
  });

});
