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

describe('DeploymentCloud', function() {
  let acl, cloudList, getCloudProviderDetails;

  beforeAll(function(done) {
    // By loading this file it adds the component to the juju components.
    YUI().use('deployment-cloud', function() { done(); });
  });

  beforeEach(() => {
    acl = {isReadOnly: sinon.stub().returns(false)};
    getCloudProviderDetails = sinon.stub();
    getCloudProviderDetails.withArgs('gce').returns({
      id: 'google',
      showLogo: true,
      signupUrl: 'https://console.cloud.google.com/billing/freetrial',
      svgHeight: 33,
      svgWidth: 256,
      title: 'Google Compute Engine'
    });
    getCloudProviderDetails.withArgs('azure').returns({
      id: 'azure',
      showLogo: true,
      signupUrl: 'https://azure.microsoft.com/en-us/free/',
      svgHeight: 24,
      svgWidth: 204,
      title: 'Microsoft Azure'
    });
    getCloudProviderDetails.withArgs('ec2').returns({
      id: 'aws',
      showLogo: true,
      signupUrl: 'https://portal.aws.amazon.com/gp/aws/developer/' +
      'registration/index.html',
      svgHeight: 48,
      svgWidth: 120,
      title: 'Amazon Web Services'
    });
    cloudList = {
      'google': {
        name: 'google',
        cloudType: 'gce'
      },
      'azure': {
        name: 'azure',
        cloudType: 'azure'
      },
      'aws': {
        name: 'aws',
        cloudType: 'ec2'
      }
    };
  });

  it('can render', function() {
    var renderer = jsTestUtils.shallowRender(
      <juju.components.DeploymentCloud
        acl={acl}
        addNotification={sinon.stub()}
        cloud={null}
        controllerIsReady={sinon.stub().returns(true)}
        getCloudProviderDetails={getCloudProviderDetails}
        listClouds={sinon.stub().callsArgWith(0, null, cloudList)}
        setCloud={sinon.stub()} />, true);
    var output = renderer.getRenderOutput();
    var options = output.props.children[0].props.children;
    var expected = (
      <div>
        <ul className="deployment-cloud__list">
          <li className="deployment-cloud__cloud four-col"
            key="google"
            onClick={options[0].props.onClick}
            role="button"
            tabIndex="0">
            <span className="deployment-cloud__cloud-logo">
              <juju.components.SvgIcon
                height={33}
                name="google"
                width={256} />
            </span>
          </li>
          <li className="deployment-cloud__cloud four-col"
            key="azure"
            onClick={options[1].props.onClick}
            role="button"
            tabIndex="0">
            <span className="deployment-cloud__cloud-logo">
              <juju.components.SvgIcon
                height={24}
                name="azure"
                width={204} />
            </span>
          </li>
          <li className="deployment-cloud__cloud four-col last-col"
            key="aws"
            onClick={options[2].props.onClick}
            role="button"
            tabIndex="0">
            <span className="deployment-cloud__cloud-logo">
              <juju.components.SvgIcon
                height={48}
                name="aws"
                width={120} />
            </span>
          </li>
        </ul>
        {undefined}
      </div>);
    expect(output).toEqualJSX(expected);
  });

  it('can display the loading state', function() {
    var renderer = jsTestUtils.shallowRender(
      <juju.components.DeploymentCloud
        acl={acl}
        addNotification={sinon.stub()}
        cloud={null}
        controllerIsReady={sinon.stub().returns(true)}
        getCloudProviderDetails={getCloudProviderDetails}
        listClouds={sinon.stub()}
        setCloud={sinon.stub()} />, true);
    var output = renderer.getRenderOutput();
    var expected = (
      <div>
        <div className="deployment-cloud__loading">
          <juju.components.Spinner />
        </div>
        {undefined}
      </div>);
    expect(output).toEqualJSX(expected);
  });

  it('can render with a chosen cloud', function() {
    var renderer = jsTestUtils.shallowRender(
      <juju.components.DeploymentCloud
        acl={acl}
        addNotification={sinon.stub()}
        cloud={{name: 'google', cloudType: 'gce'}}
        controllerIsReady={sinon.stub().returns(true)}
        getCloudProviderDetails={getCloudProviderDetails}
        listClouds={sinon.stub().callsArgWith(0, null, {})}
        setCloud={sinon.stub()} />, true);
    var output = renderer.getRenderOutput();
    var expected = (
      <div>
        {undefined}
        <div className="deployment-cloud__chosen">
          <juju.components.SvgIcon
            height={33}
            name="google"
            width={256} />
        </div>
      </div>);
    expect(output).toEqualJSX(expected);
  });

  it('can select a cloud if there is only one', function() {
    cloudList = {
      'google': {name: 'google'}
    };
    const setCloud = sinon.stub();
    jsTestUtils.shallowRender(
      <juju.components.DeploymentCloud
        acl={acl}
        addNotification={sinon.stub()}
        cloud={null}
        controllerIsReady={sinon.stub().returns(true)}
        getCloudProviderDetails={getCloudProviderDetails}
        listClouds={sinon.stub().callsArgWith(0, null, cloudList)}
        setCloud={setCloud} />);
    assert.equal(setCloud.callCount, 1);
    assert.deepEqual(setCloud.args[0][0], {
      name: 'google'
    });
  });

  it('can select a cloud', function() {
    var setCloud = sinon.stub();
    var renderer = jsTestUtils.shallowRender(
      <juju.components.DeploymentCloud
        acl={acl}
        addNotification={sinon.stub()}
        cloud={null}
        controllerIsReady={sinon.stub().returns(true)}
        getCloudProviderDetails={getCloudProviderDetails}
        listClouds={sinon.stub().callsArgWith(0, null, cloudList)}
        setCloud={setCloud} />, true);
    var output = renderer.getRenderOutput();
    output.props.children[0].props.children[0].props.onClick();
    assert.equal(setCloud.callCount, 1);
    assert.deepEqual(setCloud.args[0][0], {
      name: 'google',
      cloudType: 'gce'
    });
  });

  it('can render', function() {
    const addNotification = sinon.stub();
    jsTestUtils.shallowRender(
      <juju.components.DeploymentCloud
        acl={acl}
        addNotification={addNotification}
        cloud={null}
        controllerIsReady={sinon.stub().returns(true)}
        getCloudProviderDetails={getCloudProviderDetails}
        listClouds={sinon.stub().callsArgWith(0, 'Uh oh!', null)}
        setCloud={sinon.stub()} />);
    assert.equal(addNotification.callCount, 1);
    assert.deepEqual(addNotification.args[0][0], {
      title: 'unable to list clouds',
      message: 'unable to list clouds: Uh oh!',
      level: 'error'
    });
  });
});
