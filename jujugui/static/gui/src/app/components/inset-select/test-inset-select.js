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

describe('InsetSelect', function() {

  beforeAll(function(done) {
    // By loading this file it adds the component to the juju components.
    YUI().use('inset-select', function() { done(); });
  });

  it('can render', () => {
    var renderer = jsTestUtils.shallowRender(
      <juju.components.InsetSelect
        label="Spork!"
        options={[{
          label: 'Splade!',
          value: 'splade'
        }]} />, true);
    var instance = renderer.getMountedInstance();
    var output = renderer.getRenderOutput();
    var expected = (
      <div className='inset-select inset-select--spork'>
        <label className="inset-select__label"
          htmlFor="Spork!">
          Spork!
        </label>
        <select className="inset-select__field"
          defaultValue={undefined}
          disabled={undefined}
          id="Spork!"
          onChange={instance._callOnChange}
          required={undefined}
          ref="field">
          {[<option
            key="splade0"
            value="splade">
            Splade!
          </option>]}
        </select>
      </div>);
    expect(output).toEqualJSX(expected);
  });

  it('can return the field value', () => {
    var renderer = jsTestUtils.shallowRender(
      <juju.components.InsetSelect
        label="Spork!"
        options={[{
          label: 'Splade!',
          value: 'splade'
        }]} />, true);
    var instance = renderer.getMountedInstance();
    instance.refs = {field: {value: 'default'}};
    assert.equal(instance.getValue(), 'default');
  });

  it('can set the field value', () => {
    var renderer = jsTestUtils.shallowRender(
      <juju.components.InsetSelect
        label="Spork!"
        options={[{
          label: 'Splade!',
          value: 'splade'
        }]} />, true);
    var instance = renderer.getMountedInstance();
    instance.refs = {field: {value: 'default'}};
    instance.setValue('new');
    assert.equal(instance.getValue(), 'new');
  });

  it('can pass the field value to a supplied onChange method', () => {
    var onChange = sinon.stub();
    var renderer = jsTestUtils.shallowRender(
      <juju.components.InsetSelect
        label="Spork!"
        onChange={onChange}
        options={[{
          label: 'Splade!',
          value: 'splade'
        }]} />, true);
    var instance = renderer.getMountedInstance();
    var output = renderer.getRenderOutput();
    instance.refs = {field: {value: 'new'}};
    output.props.children[1].props.onChange();
    assert.equal(onChange.callCount, 1);
    assert.equal(onChange.args[0][0], 'new');
  });

  it('allows the label to be optional', () => {
    var renderer = jsTestUtils.shallowRender(
      <juju.components.InsetSelect
        options={[{
          label: 'Splade!',
          value: 'splade'
        }]} />, true);
    var instance = renderer.getMountedInstance();
    var output = renderer.getRenderOutput();
    var expected = (
      <div className='inset-select'>
        {undefined}
        <select className="inset-select__field"
          defaultValue={undefined}
          disabled={undefined}
          id={undefined}
          onChange={instance._callOnChange}
          required={undefined}
          ref="field">
          {[<option
            key="splade0"
            value="splade">
            Splade!
          </option>]}
        </select>
      </div>);
    expect(output).toEqualJSX(expected);
  });
});
