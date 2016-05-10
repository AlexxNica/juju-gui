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

chai.config.includeStack = true;
chai.config.truncateThreshold = 0;

describe('DeploymentInput', function() {

  beforeAll(function(done) {
    // By loading this file it adds the component to the juju components.
    YUI().use('deployment-input', function() { done(); });
  });

  it('can render', () => {
    var renderer = jsTestUtils.shallowRender(
      <juju.components.DeploymentInput
        disabled={false}
        label="Region"
        placeholder="us-central-1"
        required={true}
        ref="templateRegion"
        validate={[{
          regex: /\S+/,
          error: 'This field is required.'
        }]}
        value="default" />, true);
    var instance = renderer.getMountedInstance();
    var output = renderer.getRenderOutput();
    var expected = (
      <div className="deployment-input">
        <label className="deployment-input__label"
          htmlFor="Region">
          Region
        </label>
        <input className="deployment-input__field"
          defaultValue="default"
          disabled={false}
          id="Region"
          placeholder="us-central-1"
          required={true}
          onChange={instance.validate}
          ref="field"
          type="text" />
        {null}
      </div>
    );
    assert.deepEqual(output, expected);
  });

  it('can return the field value', () => {
    var renderer = jsTestUtils.shallowRender(
      <juju.components.DeploymentInput
        disabled={false}
        label="Region"
        placeholder="us-central-1"
        required={true}
        ref="templateRegion"
        validate={[{
          regex: /\S+/,
          error: 'This field is required.'
        }]}
        value="default" />, true);
    var instance = renderer.getMountedInstance();
    instance.refs = {field: {value: 'default'}};
    assert.equal(instance.getValue(), 'default');
  });

  it('can validate the form', () => {
    var renderer = jsTestUtils.shallowRender(
      <juju.components.DeploymentInput
        disabled={false}
        label="Region"
        placeholder="us-central-1"
        required={true}
        ref="templateRegion"
        validate={[{
          regex: /\S+/,
          error: 'This field is required.'
        }]} />, true);
    var instance = renderer.getMountedInstance();
    instance.refs = {field: {value: ''}};
    instance.validate();
    var output = renderer.getRenderOutput();
    var expected = (
      <ul className="deployment-input__errors">
        {[<li className="deployment-input__error"
          key="This field is required.">
          This field is required.
        </li>]}
      </ul>
    );
    assert.deepEqual(output.props.children[2], expected);
  });

  it('can validate the form when typing', () => {
    var renderer = jsTestUtils.shallowRender(
      <juju.components.DeploymentInput
        disabled={false}
        label="Region"
        placeholder="us-central-1"
        required={true}
        ref="templateRegion"
        validate={[{
          regex: /\S+/,
          error: 'This field is required.'
        }]} />, true);
    var instance = renderer.getMountedInstance();
    instance.refs = {field: {value: ''}};
    var output = renderer.getRenderOutput();
    output.props.children[1].props.onChange();
    output = renderer.getRenderOutput();
    var expected = (
      <ul className="deployment-input__errors">
        {[<li className="deployment-input__error"
          key="This field is required.">
          This field is required.
        </li>]}
      </ul>
    );
    assert.deepEqual(output.props.children[2], expected);
  });
});
