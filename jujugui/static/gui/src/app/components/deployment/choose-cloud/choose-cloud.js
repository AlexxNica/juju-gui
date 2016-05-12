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

YUI.add('deployment-choose-cloud', function() {

  juju.components.DeploymentChooseCloud = React.createClass({

    propTypes: {
      changeState: React.PropTypes.func.isRequired,
      cloudData: React.PropTypes.object.isRequired,
      jem: React.PropTypes.object.isRequired,
      setDeploymentInfo: React.PropTypes.func.isRequired
    },

    getInitialState: function() {
      return {
        credentials: [],
        clouds: []
      };
    },

    componentWillMount: function() {
      this.props.jem.listTemplates((error, credentials) => {
        // XXX kadams54: This is basic error handling for the initial
        // implementation. It should be replaced with an error message for the
        // user in subsequent UI polish work.
        if (error) {
          console.error('Unable to list templates', error);
          return;
        }
        this.setState({credentials: credentials});
      });
      this.props.jem.listClouds((error, clouds) => {
        if (error) {
          console.error('Unable to list clouds', error);
          return;
        }
        this.setState({clouds: clouds});
      });
    },

    /**
      Generate the list of credentials.

      @method _generateCredentials
    */
    _generateCredentials: function() {
      var credentials = this.state.credentials;
      var components = [];
      credentials.forEach((credential, i) => {
        var path = credential.path;
        var parts = path.split('/');
        var owner = parts[0];
        var name = parts[1];
        var className = classNames(
          'deployment-choose-cloud__cloud-option',
          'deployment-choose-cloud__cloud-option--credential',
          'six-col',
          {'last-col': i % 2 === 1}
        );
        components.push(
          <li className={className}
            key={credential.path}
            onClick={this._handleCredentialClick.bind(this, credential.path)}>
            <span className="deployment-choose-cloud__cloud-option-title">
              <span className="deployment-choose-cloud__cloud-option-name">
                {name}
              </span>
              <span className="deployment-choose-cloud__cloud-option-owner">
                {owner}
              </span>
            </span>
          </li>);
      });
      return (
        <div>
          <h3 className="deployment-panel__section-title twelve-col">
            Saved cloud credentials
          </h3>
          <ul className="deployment-choose-cloud__list twelve-col">
            {components}
          </ul>
          <h3 className="deployment-panel__section-title twelve-col">
            Public clouds
          </h3>
        </div>);
    },

    /**
      Generate a list of cloud options.

      @method _generateCloudOptions
      @returns {Array} The collection of changes.
    */
    _generateCloudOptions: function() {
      var components = [];
      // XXX This is commented out here only for the DEMO and should be
      // removedshortly thereafter so we only display the clouds which we
      // have controllers for.
      //this.state.clouds.forEach((cloud, i) => {
      ['aws', 'azure', 'google'].forEach((cloud, i) => {
        var option = this.props.cloudData[cloud];
        var lastCol = i % 3 === 2 ? 'last-col' : '';
        var className = 'deployment-choose-cloud__cloud-option four-col ' +
          lastCol;
        components.push(
          <li className={className}
            key={option.id}
            onClick={this._handleCloudClick.bind(this, option.id)}>
            <span className="deployment-choose-cloud__cloud-option-image">
              <juju.components.SvgIcon
                height={option.svgHeight}
                name={option.id}
                width={option.svgWidth} />
            </span>
          </li>);
      });
      return (
        <ul className="deployment-choose-cloud__list twelve-col">
          {components}
        </ul>);
    },

    /**
      Generate the onboarding message for loading the available clouds.

      @method _generateCloudOnboarding
      @returns {Object} The onboarding message.
    */
    _generateCloudOnboarding: function() {
      return (
        <div className="deployment-panel__notice twelve-col">
          <juju.components.SvgIcon
            name="general-action-blue"
            size="16" />
          Fetching available clouds...
        </div>);
    },

    /**
      Handling clicking on a cloud option.

      @method _handleCloudClick
    */
    _handleCloudClick: function(id) {
      this.props.setDeploymentInfo('cloud', id);
      this.props.changeState({
        sectionC: {
          component: 'deploy',
          metadata: {
            activeComponent: `add-credentials-${id}`
          }
        }
      });
    },

    /**
      Handling clicking on an existing credential option.

      @method _handleCredentialClick
    */
    _handleCredentialClick: function(id) {
      this.props.setDeploymentInfo('templateName', id);
      this.props.changeState({
        sectionC: {
          component: 'deploy',
          metadata: {
            activeComponent: 'summary'
          }
        }
      });
    },

    /**
      Generate the onboarding if there are no credentials.

      @method _generateCredentialsOnboarding
    */
    _generateCredentialsOnboarding: function() {
      return (
        <div className="deployment-panel__notice twelve-col">
          <juju.components.SvgIcon
            name="general-action-blue"
            size="16" />
          Add a public cloud credential, and we can save it as an option
          for later use
        </div>);
    },

    render: function() {
      var credentialsLength = this.state.credentials.length;
      var cloudsLength = this.state.clouds.length;
      var title = credentialsLength === 0 ?
        'Choose cloud' : 'Choose cloud or saved credential';
      return (
        <div className="deployment-panel__child">
          <juju.components.DeploymentPanelContent
            title={title}>
            {(credentialsLength) ?
              this._generateCredentials() :
              this._generateCredentialsOnboarding()}
            {(cloudsLength) ?
              this._generateCloudOptions() :
              this._generateCloudOnboarding()}
            <div className="deployment-choose-cloud__download twelve-col">
              <juju.components.SvgIcon
                height="30"
                name="juju-logo"
                width="75" />
              Deploy manually using Juju to OpenStack, Vmware, MAAS, Joyent or
              locally to your computer
              <a className={'deployment-choose-cloud__download-button ' +
                'button--inline-neutral'}
                href="https://jujucharms.com/docs/stable/reference-releases"
                target="_blank">
                Download Juju
              </a>
            </div>
          </juju.components.DeploymentPanelContent>
        </div>
      );
    }
  });

}, '0.1.0', { requires: [
  'deployment-panel-content',
  'svg-icon'
]});
