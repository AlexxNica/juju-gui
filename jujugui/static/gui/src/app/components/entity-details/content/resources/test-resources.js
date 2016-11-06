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

describe('EntityResources', function() {
  beforeAll(function(done) {
    // By loading this file it adds the component to the juju components.
    YUI().use('entity-resources', function() { done(); });
  });

  it('can display a loading spinner', function() {
    const renderer = jsTestUtils.shallowRender(
      <juju.components.EntityResources
        apiVersion="v5"
        charmId="cs:django"
        charmstoreURL="http://1.2.3.4/"
        getResources={sinon.stub()}
        pluralize={sinon.stub()} />, true);
    renderer.getMountedInstance().componentDidMount();
    const output = renderer.getRenderOutput();
    const expected = (
      <div>
        <div className="entity-resources__loading">
            <juju.components.Spinner />
        </div>
      </div>);
    assert.deepEqual(output, expected);
  });

  it('can display an empty list', function() {
    const renderer = jsTestUtils.shallowRender(
      <juju.components.EntityResources
        apiVersion="v5"
        charmId="cs:django"
        charmstoreURL="http://1.2.3.4/"
        getResources={sinon.stub().callsArgWith(1, null, [])}
        pluralize={sinon.stub()} />, true);
    renderer.getMountedInstance().componentDidMount();
    const output = renderer.getRenderOutput();
    const expected = (
      <div>
        {undefined}
      </div>);
    assert.deepEqual(output, expected);
  });

  it('can display a list of resources', function() {
    const resources = [{
      description: 'file1 desc',
      name: 'file1',
      path: 'file1.zip',
      revision: 5
    }, {
      description: 'file2 desc',
      name: 'file2',
      path: 'file2',
      revision: 2
    }];
    const renderer = jsTestUtils.shallowRender(
      <juju.components.EntityResources
        apiVersion="v5"
        charmId="cs:django"
        charmstoreURL="http://1.2.3.4/"
        getResources={sinon.stub().callsArgWith(1, null, resources)}
        pluralize={sinon.stub().returns('resources')} />, true);
    renderer.getMountedInstance().componentDidMount();
    const output = renderer.getRenderOutput();
    const expected = (
      <div>
        <div className="entity-resources section" id="files">
          <h3 className="section__title">
            {2}&nbsp;{'resources'}
          </h3>
          <ul className="section__list entity-files__listing">
            <li className="entity-files__file"
              key="file10">
              <a href="http://1.2.3.4/v5/django/resource/file1/5"
                target="_blank">
                {'file1'} {'(.zip)'}
              </a>
            </li>
            <li className="entity-files__file"
              key="file21">
              <a href="http://1.2.3.4/v5/django/resource/file2/2"
                target="_blank">
                {'file2'} {undefined}
              </a>
            </li>
          </ul>
        </div>
      </div>);
    assert.deepEqual(output, expected);
  });

  it('can abort the request when unmounting', function() {
    const abort = sinon.stub();
    const renderer = jsTestUtils.shallowRender(
      <juju.components.EntityResources
        apiVersion="v5"
        charmId="cs:django"
        charmstoreURL="http://1.2.3.4/"
        getResources={sinon.stub().returns({abort: abort})}
        pluralize={sinon.stub()} />, true);
    renderer.getMountedInstance().componentDidMount();
    renderer.unmount();
    assert.equal(abort.callCount, 1);
  });
});
