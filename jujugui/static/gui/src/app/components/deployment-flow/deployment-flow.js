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

YUI.add('deployment-flow', function() {

  juju.components.DeploymentFlow = React.createClass({
    propTypes: {
      acl: React.PropTypes.object.isRequired,
      changeState: React.PropTypes.func.isRequired,
      changes: React.PropTypes.object.isRequired,
      changesFilterByParent: React.PropTypes.func.isRequired,
      cloud: React.PropTypes.object,
      credential: React.PropTypes.string,
      deploy: React.PropTypes.func.isRequired,
      generateAllChangeDescriptions: React.PropTypes.func.isRequired,
      generateCloudCredentialTag: React.PropTypes.func.isRequired,
      getCloudCredentials: React.PropTypes.func.isRequired,
      getTagsForCloudCredentials: React.PropTypes.func.isRequired,
      groupedChanges: React.PropTypes.object.isRequired,
      listBudgets: React.PropTypes.func.isRequired,
      listClouds: React.PropTypes.func.isRequired,
      listPlansForCharm: React.PropTypes.func.isRequired,
      modelCommitted: React.PropTypes.bool,
      modelName: React.PropTypes.string.isRequired,
      region: React.PropTypes.string,
      servicesGetById: React.PropTypes.func.isRequired,
      updateCloudCredential: React.PropTypes.func.isRequired,
      user: React.PropTypes.string,
      withPlans: React.PropTypes.bool
    },

    CLOUDS: {
      'cloud-google': {
        id: 'cloud-google',
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
            title: 'Client e-mail address'
          }, {
            id: 'private-key',
            title: 'Client secret'
          }, {
            id: 'project-id',
            title: 'Project ID'
          }],
          jsonfile: [{
            id: 'file',
            title: 'Google Compute Engine project credentials .json file',
            json: true
          }]
        },
        message: (
          <p>
            The GCE provider uses OAauth to Authenticate. This requires that
            you set it up and get the relevant credentials. For more
            information see
            &nbsp;<a className="deployment-panel__link"
              href={'https://cloud.google.com/copmute/dosc/api/how-tos/' +
                'authorization'}
              target="_blank">
              https://cloud.google.com/copmute/dosc/api/how-tos/
              authorization
            </a>.
            The key information can be downloaded as a JSON file, or copied
            from
            &nbsp;<a className="deployment-panel__link"
              href={'https://console.developers.google.com/project/apiui/' +
                'credential'}
              target="_blank">
              https://console.developers.google.com/project/apiui/credential
            </a>.
          </p>)
      },
      'cloud-azure': {
        id: 'cloud-azure',
        showLogo: true,
        signupUrl: 'https://azure.microsoft.com/en-us/free/',
        svgHeight: 24,
        svgWidth: 204,
        title: 'Microsoft Azure',
        forms: {
          userpass: [{
            id: 'application-id',
            title: 'Azure Active Directory application ID'
          }, {
            id: 'subscription-id',
            title: 'Azure subscription ID'
          }, {
            id: 'tenant-id',
            title: 'Azure Active Directory tenant ID'
          }, {
            id: 'application-password',
            title: 'Azure Active Directory application password'
          }]
        },
        message: (
          <p>
            The following fields require your Windows Azure management
            information. For more information please see:&nbsp;
            <a className="deployment-panel__link"
              href="https://msdn.microsoft.com/en-us/library/windowsazure"
              target="_blank">
              https://msdn.microsoft.com/en-us/library/windowsazure
            </a>
            &nbsp;for details.
          </p>)
      },
      'cloud-aws': {
        id: 'cloud-aws',
        showLogo: true,
        signupUrl: 'https://portal.aws.amazon.com/gp/aws/developer/' +
        'registration/index.html',
        svgHeight: 48,
        svgWidth: 120,
        title: 'Amazon Web Services',
        forms: {
          'access-key': [{
            id: 'access-key',
            title: 'The EC2 access key'
          }, {
            id: 'secret-key',
            title: 'The EC2 secret key'
          }]
        },
        message: (
          <p>
            You can obtain your AWS credentials at:<br />
            <a className="deployment-panel__link"
              href={'https://console.aws.amazon.com/iam/home?region=' +
                'eu-west-1#security_credential'}
              target="_blank">
              https://console.aws.amazon.com/iam/home?region=eu-west-1#
              security_credential
            </a>
          </p>)
      },
      'cloud-openstack': {
        id: 'cloud-openstack',
        showLogo: false,
        title: 'OpenStack',
        forms: {
          userpass: [{
            id: 'username',
            title: 'Username'
          }, {
            id: 'password',
            title: 'Password'
          }, {
            id: 'tenant-name',
            title: 'Tenant name'
          }, {
            id: 'domain-name',
            title: 'Domain name'
          }],
          'access-key': [{
            id: 'access-key',
            title: 'Access key'
          }, {
            id: 'secret-key',
            title: 'Secret key'
          }, {
            id: 'tenant-name',
            title: 'Tenant name'
          }]
        }
      },
      'cloud-cloudsigma': {
        id: 'cloud-cloudsigma',
        showLogo: false,
        title: 'CloudSigma',
        forms: {
          userpass: [{
            id: 'username',
            title: 'Username'
          }, {
            id: 'password',
            title: 'Password'
          }]
        }
      },
      'cloud-joyent': {
        id: 'cloud-joyent',
        showLogo: false,
        title: 'Joyent',
        forms: {
          userpass: [{
            id: 'sdc-user',
            title: 'SmartDataCenter user ID'
          }, {
            id: 'sdc-key-id',
            title: 'SmartDataCenter key ID'
          }, {
            id: 'private-key',
            title: 'Private key used to sign requests'
          }, {
            id: 'algorithm',
            title: 'Algorithm used to generate the private key'
          }]
        }
      },
      'cloud-maas': {
        id: 'cloud-maas',
        showLogo: false,
        title: 'MAAS',
        forms: {
          oauth1: [{
            id: 'maas-oauth',
            title: 'OAuth/API-key credentials for MAAS'
          }]
        }
      },
      'cloud-rackspace': {
        id: 'cloud-rackspace',
        showLogo: false,
        title: 'Rackspace',
        forms: {
          userpass: [{
            id: 'username',
            title: 'Username'
          }, {
            id: 'password',
            title: 'Password'
          }, {
            id: 'tenant-name',
            title: 'Tenant name'
          }, {
            id: 'domain-name',
            title: 'Domain name'
          }],
          'access-key': [{
            id: 'access-key',
            title: 'Access key'
          }, {
            id: 'secret-key',
            title: 'Secret key'
          }, {
            id: 'tenant-name',
            title: 'Tenant name'
          }]
        }
      },
      'cloud-vsphere': {
        id: 'cloud-vsphere',
        showLogo: false,
        title: 'vSphere',
        forms: {
          userpass: [{
            id: 'username',
            title: 'Username'
          }, {
            id: 'password',
            title: 'Password'
          }]
        }
      },
      local: {
        id: 'local',
        showLogo: false,
        title: 'Local'
      }
    },

    getInitialState: function() {
      // Set up the cloud, credential and region from props, as if they exist at
      // mount they can't be changed.
      return {
        cloud: this.props.cloud || null,
        credential: this.props.credential || null,
        region: this.props.region || null,
        showChangelogs: false
      };
    },

    /**
      Use the props and state to figure out if a section should be visible,
      disabled or completed.

      @method _getSectionStatus
      @param {String} section The name of the section you want data for.
      @returns {Object} The object with completed, disabled and visible params.
    */
    _getSectionStatus: function(section) {
      var completed;
      var disabled;
      var visible;
      var hasCloud = !!this.state.cloud;
      var hasCredential = !!this.state.credential;
      var mode = this.props.modelCommitted ? 'commit' : 'deploy';
      var includesPlans = this.props.withPlans;
      const groupedChanges = this.props.groupedChanges;
      switch (section) {
        case 'cloud':
          completed = hasCloud && hasCredential;
          disabled = false;
          visible = true;
          break;
        case 'credential':
          completed = false;
          disabled = !hasCloud;
          visible = true;
          break;
        case 'machines':
          const addMachines = groupedChanges._addMachines;
          completed = false;
          disabled = !hasCloud || !hasCredential;
          visible = addMachines && Object.keys(addMachines).length > 0;
          break;
        case 'services':
          const deploys = groupedChanges._deploy;
          completed = false;
          disabled = !hasCloud || !hasCredential;
          visible = deploys && Object.keys(deploys).length > 0;
          break;
        case 'budget':
          completed = false;
          disabled = !hasCloud || !hasCredential;
          visible = includesPlans;
          break;
        case 'changes':
          completed = false;
          disabled = !hasCloud || !hasCredential;
          visible = true;
          break;
        case 'agreements':
          completed = false;
          disabled = false;
          visible = mode === 'deploy';
          break;
      }
      return {
        completed: completed,
        disabled: disabled,
        visible: visible
      };
    },

    /**
      Store the selected cloud in state.

      @method _setCloud
      @param {String} cloud The selected cloud.
    */
    _setCloud: function(cloud) {
      this.setState({cloud: cloud});
    },

    /**
      Store the selected credential in state.

      @method _setCredential
      @param {String} credential The selected credential.
    */
    _setCredential: function(credential) {
      this.setState({credential: credential});
    },

    /**
      Store the selected region in state.

      @method _setRegion
      @param {String} region The selected region.
    */
    _setRegion: function(region) {
      this.setState({region: region});
    },

    /**
      Store the selected budget in state.

      @method _setBudget
      @param {String} budget The selected budget.
    */
    _setBudget: function(budget) {
      this.setState({budget: budget});
    },

    /**
      Toggle the visibility of the changelogs.

      @method _toggleChangelogs
    */
    _toggleChangelogs: function() {
      this.setState({showChangelogs: !this.state.showChangelogs});
    },

    /**
      Validate the form fields.

      @method _validateForm
      @param {Array} fields A list of field ref names.
      @param {Object} refs The refs for a component.
      @returns {Boolean} Whether the form is valid.
    */
    _validateForm: function(fields, refs) {
      var formValid = true;
      fields.forEach(field => {
        var valid = refs[field].validate();
        // If there is an error then mark that. We don't want to exit the loop
        // at this point so that each field gets validated.
        if (!valid) {
          formValid = false;
        }
      });
      return formValid;
    },

    /**
      Handle closing the panel when the close button is clicked.

      @method _handleClose
    */
    _handleClose: function() {
      this.props.changeState({
        sectionC: {
          component: null,
          metadata: {}
        }
      });
    },

    /**
      Handle clearing the chosen cloud.

      @method _clearCloud
    */
    _clearCloud: function() {
      this._setCloud(null);
      // Also reset the chose credential.
      this._setCredential(null);
    },

    /**
      Handle deploying the model.

      @method _handleDeploy
    */
    _handleDeploy: function() {
      this.props.deploy(
        this._handleClose, true, this.refs.modelName.getValue(),
        this.state.credential, this.state.cloud.id, this.state.region);
    },

    /**
      Generate a change cloud action if a cloud has been selected.

      @method _generateCloudAction
      @returns {Array} The list of actions.
    */
    _generateCloudAction: function() {
      if (!this.state.cloud || this.props.modelCommitted) {
        return;
      }
      return [{
        action: this._clearCloud,
        disabled: this.props.acl.isReadOnly(),
        title: 'Change cloud',
        type: 'neutral'
      }];
    },

    /**
      Generate a button to toggle the visibility of the changelogs.

      @method _generateChangelogTitle
      @returns {Array} The action.
    */
    _generateChangelogTitle: function() {
      return (
        <span className="deployment-flow__service-title">
          Services to be deployed
          <juju.components.GenericButton
            action={this._toggleChangelogs}
            type="base"
            title={this.state.showChangelogs ?
              'Hide changelog' : 'Show changelog'} />
        </span>);
    },

    /**
      Generate the appropriate cloud title based on the state.

      @method _generateCloudTitle
      @returns {String} The cloud title.
    */
    _generateCloudTitle: function() {
      var cloud = this.state.cloud;
      if (!cloud) {
        return 'Choose cloud to deploy to';
      } else if (cloud.id === 'local') {
        return 'Local cloud';
      } else {
        return 'Public cloud';
      }
    },

    /**
      Generate the cloud section.

      @method _generateCloudSection
      @returns {Object} The markup.
    */
    _generateCloudSection: function() {
      var status = this._getSectionStatus('cloud');
      if (!status.visible) {
        return;
      }
      var cloud = this.state.cloud;
      return (
        <juju.components.DeploymentSection
          buttons={this._generateCloudAction()}
          completed={status.completed}
          disabled={status.disabled}
          instance="deployment-cloud"
          showCheck={true}
          title={this._generateCloudTitle()}>
          <juju.components.DeploymentCloud
            acl={this.props.acl}
            cloud={cloud}
            clouds={this.CLOUDS}
            listClouds={this.props.listClouds}
            setCloud={this._setCloud} />
        </juju.components.DeploymentSection>);
    },

    /**
      Generate the credentials section.

      @method _generateCredentialSection
      @returns {Object} The markup.
    */
    _generateCredentialSection: function() {
      var status = this._getSectionStatus('credential');
      if (!status.visible) {
        return;
      }
      var cloud = this.state.cloud;
      return (
        <juju.components.DeploymentSection
          completed={status.completed}
          disabled={status.disabled}
          instance="deployment-credential"
          showCheck={false}>
          <juju.components.DeploymentCredential
            acl={this.props.acl}
            credential={this.state.credential}
            cloud={cloud}
            clouds={this.CLOUDS}
            editable={!this.props.modelCommitted}
            generateCloudCredentialTag={this.props.generateCloudCredentialTag}
            getCloudCredentials={this.props.getCloudCredentials}
            getTagsForCloudCredentials={this.props.getTagsForCloudCredentials}
            region={this.state.region}
            setCredential={this._setCredential}
            setRegion={this._setRegion}
            updateCloudCredential={this.props.updateCloudCredential}
            user={this.props.user}
            validateForm={this._validateForm} />
        </juju.components.DeploymentSection>);
    },

    /**
      Generate the machines section.

      @method _generateMachinesSection
      @returns {Object} The markup.
    */
    _generateMachinesSection: function() {
      var status = this._getSectionStatus('machines');
      if (!status.visible) {
        return;
      }
      var cloud = this.state.cloud;
      return (
        <juju.components.DeploymentSection
          completed={status.completed}
          disabled={status.disabled}
          instance="deployment-machines"
          showCheck={false}
          title="Machines to be deployed">
          <juju.components.DeploymentMachines
            acl={this.props.acl}
            cloud={cloud}
            machines={this.props.groupedChanges._addMachines} />
        </juju.components.DeploymentSection>);
    },

    /**
      Generate the services section.

      @method _generateServicesSection
      @returns {Object} The markup.
    */
    _generateServicesSection: function() {
      var status = this._getSectionStatus('services');
      if (!status.visible) {
        return;
      }
      return (
        <juju.components.DeploymentSection
          completed={status.completed}
          disabled={status.disabled}
          instance="deployment-services"
          showCheck={true}
          title={this._generateChangelogTitle()}>
          <juju.components.DeploymentServices
            acl={this.props.acl}
            changesFilterByParent={this.props.changesFilterByParent}
            generateAllChangeDescriptions={
              this.props.generateAllChangeDescriptions}
            groupedChanges={this.props.groupedChanges}
            listPlansForCharm={this.props.listPlansForCharm}
            servicesGetById={this.props.servicesGetById}
            showChangelogs={this.state.showChangelogs}
            withPlans={this.props.withPlans} />
        </juju.components.DeploymentSection>);
    },

    /**
      Generate the budget section.

      @method _generateBudgetSection
      @returns {Object} The markup.
    */
    _generateBudgetSection: function() {
      var status = this._getSectionStatus('budget');
      if (!status.visible) {
        return;
      }
      return (
        <juju.components.DeploymentSection
          completed={status.completed}
          disabled={status.disabled}
          instance="deployment-budget"
          showCheck={true}
          title="Confirm budget">
          <juju.components.DeploymentBudget
            acl={this.props.acl}
            listBudgets={this.props.listBudgets}
            setBudget={this._setBudget}
            user={this.props.user} />
        </juju.components.DeploymentSection>);
    },

    /**
      Generate the changes section.

      @method _generateChangeSection
      @returns {Object} The markup.
    */
    _generateChangeSection: function() {
      var status = this._getSectionStatus('changes');
      if (!status.visible) {
        return;
      }
      return (
        <juju.components.DeploymentSection
          completed={status.completed}
          disabled={status.disabled}
          instance="deployment-changes"
          showCheck={false}
          title="Model changes">
          <juju.components.DeploymentChanges
          changes={this.props.changes}
          generateAllChangeDescriptions={
            this.props.generateAllChangeDescriptions} />
        </juju.components.DeploymentSection>);
    },

    /**
      Generate the agreements section.

      @method _generateAgreementsSection
      @returns {Object} The markup.
    */
    _generateAgreementsSection: function() {
      var status = this._getSectionStatus('agreements');
      if (!status.visible) {
        return;
      }
      var disabled = this.props.acl.isReadOnly();
      return (
        <div>
          <div className="deployment-flow__deploy-option">
            <input className="deployment-flow__deploy-checkbox"
              disabled={disabled}
              id="emails"
              type="checkbox" />
            <label className="deployment-flow__deploy-label"
              htmlFor="emails">
              Please email me updates regarding feature
              announcements, performance suggestions, feedback
              surveys and special offers.
            </label>
          </div>
          <div className="deployment-flow__deploy-option">
            <input className="deployment-flow__deploy-checkbox"
              disabled={disabled}
              id="terms"
              type="checkbox" />
            <label className="deployment-flow__deploy-label"
              htmlFor="terms">
              I agree that my use of any services and related APIs
              is subject to my compliance with the applicable&nbsp;
              <a href="" target="_blank">Terms of service</a>.
            </label>
          </div>
        </div>);
    },

    render: function() {
      var disabled = this.props.acl.isReadOnly();
      return (
        <juju.components.Panel
          instanceName="deployment-flow-panel"
          visible={true}>
          <div className="deployment-flow">
            <div className="deployment-flow__header">
              <div className="deployment-flow__close">
                <juju.components.GenericButton
                  action={this._handleClose}
                  type="neutral"
                  title="Back to canvas" />
              </div>
              <div className="deployment-flow__header-name">
                {this.props.modelName}
              </div>
            </div>
            <div className="deployment-flow__content">
              <div className="twelve-col">
                <div className="inner-wrapper">
                  <juju.components.DeploymentSection
                    instance="deployment-model-name"
                    showCheck={false}
                    title="Model name">
                    <div className="six-col">
                      <juju.components.GenericInput
                        disabled={disabled || this.props.modelCommitted}
                        key="modelName"
                        label="Model name"
                        required={true}
                        ref="modelName"
                        validate={[{
                          regex: /\S+/,
                          error: 'This field is required.'
                        }]}
                        value={this.props.modelName} />
                    </div>
                  </juju.components.DeploymentSection>
                  {this._generateCloudSection()}
                  {this._generateCredentialSection()}
                  {this._generateMachinesSection()}
                  {this._generateServicesSection()}
                  {this._generateBudgetSection()}
                  {this._generateChangeSection()}
                  <div className="twelve-col">
                    <div className="deployment-flow__deploy">
                      {this._generateAgreementsSection()}
                      <div className="deployment-flow__deploy-action">
                        <juju.components.GenericButton
                          action={this._handleDeploy}
                          disabled={disabled || !this.state.cloud}
                          type="positive"
                          title="Deploy" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </juju.components.Panel>
      );
    }

  });

}, '0.1.0', {
  requires: [
    'deployment-budget',
    'deployment-changes',
    'deployment-cloud',
    'deployment-credential',
    'deployment-machines',
    'deployment-section',
    'deployment-services',
    'generic-button',
    'generic-input',
    'panel-component'
  ]
});
