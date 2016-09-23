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

describe('DeploymentCredential', function() {
  var acl, cloud, clouds, credentials, regions, tags, user;

  beforeAll(function(done) {
    // By loading this file it adds the component to the juju components.
    YUI().use('deployment-credential', function() { done(); });
  });

  beforeEach(() => {
    acl = {isReadOnly: sinon.stub().returns(false)};
    regions = [{name: 'test-region'}];
    cloud = {id: 'azure', id: 'azure', regions: regions};
    clouds = {cloud: 'one'};
    credentials = {
      'lxd_admin@local_default': {
        name: 'lxd_admin@local_default'
      }
    };
    tags = [{tags: ['lxd_admin@local_default']}];
    user = 'user-admin';
  });

  it('can display a loader when loading regions and credentials', function() {
    var renderer = jsTestUtils.shallowRender(
      <juju.components.DeploymentCredential
        acl={acl}
        updateCloudCredential={sinon.stub()}
        cloud={cloud}
        clouds={clouds}
        editable={true}
        getCloudCredentials={sinon.stub()}
        getCloudCredentialNames={sinon.stub()}
        setCredential={sinon.stub()}
        setRegion={sinon.stub()}
        user={user}
        validateForm={sinon.stub()} />, true);
    var output = renderer.getRenderOutput();
    var expected = (
      <div>
        <div className="deployment-credential__loading">
          <juju.components.Spinner />
        </div>
      </div>);
    assert.deepEqual(output, expected);
  });

  it('can render with a cloud', function() {
    var updateCloudCredential = sinon.stub();
    var setCredential = sinon.stub();
    var setRegion = sinon.stub();
    var validateForm = sinon.stub();
    const generateCloudCredentialName = sinon.stub();
    var renderer = jsTestUtils.shallowRender(
      <juju.components.DeploymentCredential
        acl={acl}
        updateCloudCredential={updateCloudCredential}
        cloud={cloud}
        clouds={clouds}
        editable={true}
        generateCloudCredentialName={generateCloudCredentialName}
        getCloudCredentials={sinon.stub().callsArgWith(1, null, [])}
        getCloudCredentialNames={
          sinon.stub().callsArgWith(1, null, tags)}
        setCredential={setCredential}
        setRegion={setRegion}
        user={user}
        validateForm={validateForm} />, true);
    var instance = renderer.getMountedInstance();
    var output = renderer.getRenderOutput();
    var expected = (
      <div>
        <juju.components.ExpandingRow
          classes={{'twelve-col': true}}
          clickable={false}
          expanded={true}>
          {undefined}
          <juju.components.DeploymentCredentialAdd
            acl={acl}
            updateCloudCredential={updateCloudCredential}
            close={instance._toggleAdd}
            cloud={cloud}
            clouds={clouds}
            generateCloudCredentialName={generateCloudCredentialName}
            getCredentials={instance._getCredentials}
            region={undefined}
            regions={regions}
            setCredential={setCredential}
            setRegion={setRegion}
            user={user}
            validateForm={validateForm}/>
        </juju.components.ExpandingRow>
      </div>);
    assert.deepEqual(output, expected);
  });

  it('can render when not editable', function() {
    var updateCloudCredential = sinon.stub();
    var setCredential = sinon.stub();
    var setRegion = sinon.stub();
    var validateForm = sinon.stub();
    var renderer = jsTestUtils.shallowRender(
      <juju.components.DeploymentCredential
        acl={acl}
        updateCloudCredential={updateCloudCredential}
        cloud={cloud}
        clouds={clouds}
        credential="lxd_admin@local_default"
        editable={false}
        generateCloudCredentialName={sinon.stub()}
        getCloudCredentials={sinon.stub().callsArgWith(1, null, credentials)}
        getCloudCredentialNames={
          sinon.stub().callsArgWith(1, null, tags)}
        region="north-north-west"
        setCredential={setCredential}
        setRegion={setRegion}
        user={user}
        validateForm={validateForm} />, true);
    var instance = renderer.getMountedInstance();
    var output = renderer.getRenderOutput();
    var expected = (
      <div>
        <juju.components.ExpandingRow
          classes={{'twelve-col': true}}
          clickable={false}
          expanded={false}>
          <form className="deployment-credential__form">
            <div className="prepend-two four-col">
              <juju.components.InsetSelect
                disabled={false}
                label="Credential"
                onChange={instance._handleCredentialChange}
                options={[{
                  label: 'lxd_admin@local_default',
                  value: 'lxd_admin@local_default'
                }, {
                  label: 'Add credential...',
                  value: 'add-credential'
                }]}
                ref="credential"
                value="lxd_admin@local_default" />
            </div>
            <div className="four-col">
              <juju.components.InsetSelect
                disabled={true}
                label="Region"
                onChange={setRegion}
                options={[{
                  label: 'north-north-west',
                  value: 'north-north-west'
                }]}
                value="north-north-west" />
            </div>
          </form>
          {undefined}
        </juju.components.ExpandingRow>
      </div>);
    assert.deepEqual(output, expected);
  });

  it('can render without a cloud', function() {
    var updateCloudCredential = sinon.stub();
    var setCredential = sinon.stub();
    var setRegion = sinon.stub();
    var validateForm = sinon.stub();
    const generateCloudCredentialName = sinon.stub();
    var renderer = jsTestUtils.shallowRender(
      <juju.components.DeploymentCredential
        acl={acl}
        updateCloudCredential={updateCloudCredential}
        cloud={null}
        clouds={clouds}
        editable={true}
        generateCloudCredentialName={generateCloudCredentialName}
        getCloudCredentials={sinon.stub().callsArgWith(1, null, {})}
        getCloudCredentialNames={
          sinon.stub().callsArgWith(1, null, [])}
        setCredential={setCredential}
        setRegion={setRegion}
        user={user}
        validateForm={validateForm} />, true);
    var instance = renderer.getMountedInstance();
    var output = renderer.getRenderOutput();
    var expected = (
      <div>
        <juju.components.ExpandingRow
          classes={{'twelve-col': true}}
          clickable={false}
          expanded={true}>
          {undefined}
          <juju.components.DeploymentCredentialAdd
            acl={acl}
            updateCloudCredential={updateCloudCredential}
            close={instance._toggleAdd}
            cloud={null}
            clouds={clouds}
            generateCloudCredentialName={generateCloudCredentialName}
            getCredentials={instance._getCredentials}
            region={undefined}
            regions={[]}
            setCredential={setCredential}
            setRegion={setRegion}
            user={user}
            validateForm={validateForm} />
        </juju.components.ExpandingRow>
      </div>);
    assert.deepEqual(output, expected);
  });

  it('can show existing credentials', function() {
    var setCredential = sinon.stub();
    var setRegion = sinon.stub();
    var renderer = jsTestUtils.shallowRender(
      <juju.components.DeploymentCredential
        acl={acl}
        updateCloudCredential={sinon.stub()}
        cloud={cloud}
        clouds={clouds}
        editable={true}
        generateCloudCredentialName={sinon.stub()}
        getCloudCredentials={sinon.stub().callsArgWith(1, null, credentials)}
        getCloudCredentialNames={
          sinon.stub().callsArgWith(1, null, tags)}
        setCredential={setCredential}
        setRegion={setRegion}
        user={user}
        validateForm={sinon.stub()} />, true);
    var instance = renderer.getMountedInstance();
    var output = renderer.getRenderOutput();
    var expected = (
      <div>
        <juju.components.ExpandingRow
          classes={{'twelve-col': true}}
          clickable={false}
          expanded={false}>
          <form className="deployment-credential__form">
            <div className="prepend-two four-col">
              <juju.components.InsetSelect
                disabled={false}
                label="Credential"
                onChange={instance._handleCredentialChange}
                options={[{
                  label: 'lxd_admin@local_default',
                  value: 'lxd_admin@local_default'
                }, {
                  label: 'Add credential...',
                  value: 'add-credential'
                }]}
                ref="credential"
                value={undefined} />
            </div>
            <div className="four-col">
              <juju.components.InsetSelect
                disabled={false}
                label="Region"
                onChange={setRegion}
                options={[{
                  label: 'test-region',
                  value: 'test-region'
                }]}
                value={undefined} />
            </div>
          </form>
          {undefined}
        </juju.components.ExpandingRow>
      </div>);
    assert.deepEqual(output, expected);
  });

  it('selects an initial credential', function() {
    var setCredential = sinon.stub();
    var setRegion = sinon.stub();
    jsTestUtils.shallowRender(
      <juju.components.DeploymentCredential
        acl={acl}
        updateCloudCredential={sinon.stub()}
        cloud={cloud}
        clouds={clouds}
        editable={true}
        generateCloudCredentialName={sinon.stub()}
        getCloudCredentials={sinon.stub().callsArgWith(1, null, credentials)}
        getCloudCredentialNames={
          sinon.stub().callsArgWith(1, null, tags)}
        setCredential={setCredential}
        setRegion={setRegion}
        user={user}
        validateForm={sinon.stub()} />, true);
    assert.equal(setCredential.callCount, 1);
    assert.equal(setCredential.args[0][0], 'lxd_admin@local_default');
  });

  it('can select a credential after loading the list of creds', function() {
    var setCredential = sinon.stub();
    var setRegion = sinon.stub();
    credentials['new@test'] = {
      name: 'new@test'
    };
    const renderer = jsTestUtils.shallowRender(
      <juju.components.DeploymentCredential
        acl={acl}
        updateCloudCredential={sinon.stub()}
        cloud={cloud}
        clouds={clouds}
        editable={true}
        generateCloudCredentialName={sinon.stub()}
        getCloudCredentials={sinon.stub().callsArgWith(1, null, credentials)}
        getCloudCredentialNames={
          sinon.stub().callsArgWith(1, null, tags)}
        setCredential={setCredential}
        setRegion={setRegion}
        user={user}
        validateForm={sinon.stub()} />, true);
    const instance = renderer.getMountedInstance();
    instance.refs = {credential: {setValue: sinon.stub()}};
    instance._getCredentials('new@test');
    assert.equal(setCredential.callCount, 2);
    assert.equal(setCredential.args[1][0], 'new@test');
    assert.equal(instance.refs.credential.setValue.callCount, 1);
    assert.equal(instance.refs.credential.setValue.args[0][0], 'new@test');
  });

  it('can disable controls when read only', function() {
    acl.isReadOnly = sinon.stub().returns(true);
    var setCredential = sinon.stub();
    var setRegion = sinon.stub();
    var renderer = jsTestUtils.shallowRender(
      <juju.components.DeploymentCredential
        acl={acl}
        updateCloudCredential={sinon.stub()}
        cloud={cloud}
        clouds={clouds}
        editable={true}
        generateCloudCredentialName={sinon.stub()}
        getCloudCredentials={sinon.stub().callsArgWith(1, null, credentials)}
        getCloudCredentialNames={sinon.stub().callsArgWith(1, null, tags)}
        setCredential={setCredential}
        setRegion={setRegion}
        user={user}
        validateForm={sinon.stub()} />, true);
    var instance = renderer.getMountedInstance();
    var output = renderer.getRenderOutput();
    var expected = (
      <div>
        <juju.components.ExpandingRow
          classes={{'twelve-col': true}}
          clickable={false}
          expanded={false}>
          <form className="deployment-credential__form">
            <div className="prepend-two four-col">
              <juju.components.InsetSelect
                disabled={true}
                label="Credential"
                onChange={instance._handleCredentialChange}
                options={[{
                  label: 'lxd_admin@local_default',
                  value: 'lxd_admin@local_default'
                }, {
                  label: 'Add credential...',
                  value: 'add-credential'
                }]}
                ref="credential"
                value={undefined} />
            </div>
            <div className="four-col">
              <juju.components.InsetSelect
                disabled={true}
                label="Region"
                onChange={setRegion}
                options={[{
                  label: 'test-region',
                  value: 'test-region'
                }]}
                value={undefined} />
            </div>
          </form>
          {undefined}
        </juju.components.ExpandingRow>
      </div>);
    assert.deepEqual(output, expected);
  });

  it('can navigate to the add credentials form', function() {
    var updateCloudCredential = sinon.stub();
    var setCredential = sinon.stub();
    var setRegion = sinon.stub();
    var validateForm = sinon.stub();
    const generateCloudCredentialName = sinon.stub();
    var renderer = jsTestUtils.shallowRender(
      <juju.components.DeploymentCredential
        acl={acl}
        updateCloudCredential={updateCloudCredential}
        cloud={cloud}
        clouds={clouds}
        editable={true}
        generateCloudCredentialName={generateCloudCredentialName}
        getCloudCredentials={sinon.stub().callsArgWith(1, null, credentials)}
        getCloudCredentialNames={
          sinon.stub().callsArgWith(1, null, tags)}
        setCredential={setCredential}
        setRegion={setRegion}
        user={user}
        validateForm={validateForm} />, true);
    var instance = renderer.getMountedInstance();
    instance._handleCredentialChange('add-credential');
    var output = renderer.getRenderOutput();
    var expected = (
      <div>
        <juju.components.ExpandingRow
          classes={{'twelve-col': true}}
          clickable={false}
          expanded={true}>
          {undefined}
          <juju.components.DeploymentCredentialAdd
            acl={acl}
            updateCloudCredential={updateCloudCredential}
            close={instance._toggleAdd}
            cloud={cloud}
            clouds={clouds}
            generateCloudCredentialName={generateCloudCredentialName}
            getCredentials={instance._getCredentials}
            region={undefined}
            regions={regions}
            setCredential={setCredential}
            setRegion={setRegion}
            user={user}
            validateForm={validateForm}/>
        </juju.components.ExpandingRow>
      </div>);
    assert.deepEqual(output, expected);
  });
});
