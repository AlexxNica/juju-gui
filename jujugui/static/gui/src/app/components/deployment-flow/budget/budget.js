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

class DeploymentBudget extends React.Component {
  constructor() {
    super();
    this.xhrs = [];
    this.state = {
      budgets: null,
      increaseExpanded: false,
      loadingBudgets: false
    };
  }

  componentWillMount() {
    if (this.props.user) {
      this._getBudgets();
    }
  }

  componentWillUnmount() {
    this.xhrs.forEach((xhr) => {
      xhr && xhr.abort && xhr.abort();
    });
  }

  componentWillReceiveProps(nextProps) {
    // If the user has changed then update the data.
    var props = this.props;
    var currentUser = props.user;
    var nextUser = nextProps.user;
    if (nextUser !== currentUser) {
      this._getBudgets();
    }
  }

  /**
    Get the budgets for the authenticated user.

    @method _getBudgets
  */
  _getBudgets() {
    // Delay the call until after the state change to prevent race
    // conditions.
    this.setState({loadingBudgets: true}, () => {
      var xhr = this.props.listBudgets(this._getBudgetsCallback.bind(this));
      this.xhrs.push(xhr);
    });
  }

  /**
    Callback for the plans API call to get budgets.

    @method _getBudgetsCallback
    @param {String} error The error from the request, or null.
    @param {Object} data The data from the request.
  */
  _getBudgetsCallback(error, data) {
    this.setState({loadingBudgets: false}, () => {
      if (error) {
        if (error.indexOf('not found') === -1) {
          // A "profile not found" error is expected, and it means the user
          // does not have a credit limit yet. Notify any other errors.
          const message = 'cannot retrieve budgets';
          this.props.addNotification({
            title: message,
            message: `${message}: ${error}`,
            level: 'error'
          });
          console.error(message, error);
        }
        return;
      }
      this.setState({budgets: data});
      if (data && data.budgets && data.budgets.length > 0) {
        this.props.setBudget(data.budgets[0].budget);
      }
    });
  }

  /**
    Generate select options for the available budgets.

    @method _generateBudgetOptions
  */
  _generateBudgetOptions() {
    var budgets = this.state.budgets;
    if (!budgets) {
      return [];
    }
    return budgets.budgets.map(budget => {
      return {
        label: `${budget.budget} ($${budget.limit})`,
        value: budget.budget
      };
    });
  }

  /**
    Set the budget value.

    @method _handleBudgetChange
    @param {String} The select value.
  */
  _handleBudgetChange(value) {
    this.props.setBudget(value);
  }

  /**
   Toggle the increase form expanded state.

   @method _toggleIncrease
  */
  _toggleIncrease() {
    this.setState({increaseExpanded: !this.state.increaseExpanded});
  }

  render() {
    if (this.state.loadingBudgets) {
      return (
        <div className="deployment-budget__loading">
          <juju.components.Spinner />
        </div>);
    }
    var disabled = this.props.acl.isReadOnly();
    var classes = {
      'deployment-budget__form': true,
      'twelve-col': true
    };
    return (
      <juju.components.ExpandingRow
        classes={classes}
        clickable={false}
        expanded={this.state.increaseExpanded}>
        <div>
          <div className="four-col">
            <juju.components.InsetSelect
              disabled={disabled}
              label="Budget"
              onChange={this._handleBudgetChange.bind(this)}
              options={this._generateBudgetOptions()} />
          </div>
          <div className="three-col">
            <span className="deployment-budget__increase-button">
              <juju.components.GenericButton
                action={this._toggleIncrease.bind(this)}
                disabled={disabled}
                type="base">
                Increase budget
              </juju.components.GenericButton>
            </span>
          </div>
          <juju.components.BudgetChart
            budgets={this.state.budgets} />
        </div>
        <div>
          <div className="deployment-budget__increase-form">
            <h4>Increase budget</h4>
            <div className="two-col">
              Credit limit: $100
            </div>
            <div className="ten-col last-col">
              Available credit: $500
            </div>
            <div className="one-col">
              Increase
            </div>
            <div className="three-col">
              <juju.components.GenericInput
                disabled={true}
                label="Budget"
                placeholder="Personal ($100)"
                required={false} />
            </div>
            <div className="one-col">
              to
            </div>
            <div className="three-col last-col">
              <juju.components.GenericInput
                disabled={true}
                label="New budget amount"
                required={false} />
            </div>
            <div>
              <div className="eight-col">
                <span className="link">Manage all budgets</span>
              </div>
              <div className="two-col">
                <juju.components.GenericButton
                  action={this._toggleIncrease.bind(this)}
                  disabled={disabled}
                  type="base">
                  Cancel
                </juju.components.GenericButton>
              </div>
              <div className="two-col last-col">
                <juju.components.GenericButton
                  action={this._toggleIncrease.bind(this)}
                  disabled={disabled}
                  type="neutral">
                  Confirm
                </juju.components.GenericButton>
              </div>
            </div>
          </div>
        </div>
      </juju.components.ExpandingRow>
    );
  }
};

DeploymentBudget.propTypes = {
  acl: PropTypes.object.isRequired,
  addNotification: PropTypes.func.isRequired,
  listBudgets: PropTypes.func.isRequired,
  setBudget: PropTypes.func.isRequired,
  user: PropTypes.string
};

YUI.add('deployment-budget', function() {
  juju.components.DeploymentBudget = DeploymentBudget;
}, '0.1.0', {
  requires: [
    'budget-chart',
    'expanding-row',
    'generic-button',
    'generic-input',
    'inset-select',
    'loading-spinner'
  ]
});
