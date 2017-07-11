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

class DeploymentBar extends React.Component {
  constructor() {
    super();
    this.previousNotifications = [];
    this.state = {
      latestChangeDescription: null
    };
  }

  componentWillReceiveProps(nextProps) {
    this._updateLatestChange(nextProps.currentChangeSet);
  }

  /**
    Update the state with the latest change if it has changed.

    @method _updateLatestChange
    @param {Object} changeSet The collection of ecs changes.
  */
  _updateLatestChange(changeSet) {
    var keys = Object.keys(changeSet);
    var latestChange = keys[keys.length - 1];
    var previousIndex = this.previousNotifications.indexOf(latestChange);
    if (latestChange && previousIndex === -1) {
      var change = changeSet[latestChange];
      this.previousNotifications.push(latestChange);
      this.setState({
        latestChangeDescription: this.props.generateChangeDescription(change)
      });
    }
  }

  /**
    Get the label for the deploy button.

    @method _getDeployButtonLabel
    @returns {String} the label for the deploy button
  */
  _getDeployButtonLabel() {
    var label = this.props.modelCommitted ? 'Commit changes'
      : 'Deploy changes';
    return label + ' (' +
      Object.keys(this.props.currentChangeSet).length + ')';
  }

  /**
    Display the deployment summary when the deploy button is clicked.

    @method _deployAction
  */
  _deployAction() {
    this.props.sendAnalytics(
      'Deployment Flow',
      'Button click',
      'deploy'
    );
    this.props.changeState({
      gui: {
        deploy: ''
      }
    });
  }

  /**
    Generate the deploy button or read-only notice.

    @method _generateButton
  */
  _generateButton() {
    var changeCount = Object.keys(this.props.currentChangeSet).length;
    if (this.props.acl.isReadOnly()) {
      return (
        <div className="deployment-bar__read-only">
          Read only
        </div>);
    }
    return (
      <div className="deployment-bar__deploy">
        <juju.components.GenericButton
          action={this._deployAction.bind(this)}
          type="inline-deployment"
          disabled={changeCount === 0}>
          {this._getDeployButtonLabel()}
        </juju.components.GenericButton>
      </div>);
  }

  render() {
    return (
      <juju.components.Panel
        instanceName="deployment-bar-panel"
        visible={true}>
        <div className="deployment-bar">
          <juju.components.DeploymentBarNotification
            change={this.state.latestChangeDescription} />
          {this._generateButton()}
        </div>
      </juju.components.Panel>
    );
  }
};

DeploymentBar.propTypes = {
  acl: React.PropTypes.object.isRequired,
  changeState: React.PropTypes.func.isRequired,
  currentChangeSet: React.PropTypes.object.isRequired,
  generateChangeDescription: React.PropTypes.func.isRequired,
  hasEntities: React.PropTypes.bool.isRequired,
  modelCommitted: React.PropTypes.bool.isRequired,
  sendAnalytics: React.PropTypes.func.isRequired
};

YUI.add('deployment-bar', function() {
  juju.components.DeploymentBar = DeploymentBar;
}, '0.1.0', { requires: [
  'deployment-bar-notification',
  'generic-button',
  'panel-component'
]});
