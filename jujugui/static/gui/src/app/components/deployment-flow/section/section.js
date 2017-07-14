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

class DeploymentSection extends React.Component {
  /**
    Generate the actions.

    @method _generateCheck
    @returns {Object} The actions markup.
  */
  _generateActions() {
    if (!this.props.buttons && !this.props.extra) {
      return;
    }
    return (
      <div className="deployment-section__actions">
        {this._generateExtra()}
        {this._generateButtons()}
      </div>);
  }

  /**
    Generate the buttons.

    @method _generateButtons
    @returns {Object} The buttons component.
  */
  _generateButtons() {
    var buttons = this.props.buttons;
    if (!buttons) {
      return;
    }
    return (
      <juju.components.ButtonRow
        buttons={this.props.buttons} />);
  }

  /**
    Generate the extra info.

    @method _generateExtra
    @returns {Object} The actions markup.
  */
  _generateExtra() {
    var extra = this.props.extra;
    if (!extra) {
      return;
    }
    return (
      <div className="deployment-section__extra">
        {extra}
      </div>);
  }

  /**
    Generate the check icon if it should be displayed.

    @method _generateCheck
    @returns {Object} The check markup.
  */
  _generateCheck() {
    if (!this.props.showCheck) {
      return;
    }
    return (
      <juju.components.SvgIcon
        className="deployment-section__title-checkmark"
        name="complete"
        size="24" />);
  }

  render() {
    var instance = this.props.instance;
    var extra = {
      'deployment-section--active': !this.props.disabled,
      'deployment-section--completed': this.props.completed
    };
    extra[instance] = !!instance;
    var classes = classNames(
      'deployment-section',
      'twelve-col',
      extra);
    return (
      <div className={classes}>
        <div className="inner-wrapper">
          <div className="twelve-col deployment-section__content">
            {this._generateActions()}
            <h3 className="deployment-section__title">
              {this._generateCheck()}
              {this.props.title}
            </h3>
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
};

DeploymentSection.propTypes = {
  buttons: React.PropTypes.array,
  children: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object
  ]),
  completed: React.PropTypes.bool,
  disabled: React.PropTypes.bool,
  extra: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ]),
  instance: React.PropTypes.string,
  showCheck: React.PropTypes.bool,
  title: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ])
};

YUI.add('deployment-section', function() {
  juju.components.DeploymentSection = DeploymentSection;
}, '0.1.0', { requires: [
  'button-row',
  'svg-icon'
]});
