/*
This file is part of the Juju GUI, which lets users view and manage Juju
environments within a graphical interface (https://launchpad.net/juju-gui).
Copyright (C) 2017 Canonical Ltd.

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

class AccountPaymentDetailsAddress extends React.Component {
  constructor() {
    super();
    this.xhrs = [];
  }

  componentWillUnmount() {
    this.xhrs.forEach((xhr) => {
      xhr && xhr.abort && xhr.abort();
    });
  }

  /**
    Update an address.

    @method _updateAddress
  */
  _updateAddress() {
    const valid = this.props.validateForm(['addressForm'], this.refs);
    if (!valid) {
      return;
    }
    const address = this.refs.addressForm.getValue();
    const username = this.props.username;
    const xhr = this.props.updateAddress(
      username, this.props.address.id, address, error => {
        if (error) {
          const message = 'Could not update address';
          this.props.addNotification({
            title: message,
            message: `${message}: ${error}`,
            level: 'error'
          });
          console.error(message, error);
          return;
        }
        this.props.updated();
        this.props.close();
      });
    this.xhrs.push(xhr);
  }

  render() {
    const disabled = this.props.acl.isReadOnly();
    return (
      <juju.components.ExpandingRow
        classes={{
          'account-payment-details-address': true,
          'twelve-col': true
        }}
        clickable={false}
        expanded={this.props.showEdit}>
        <juju.components.AddressForm
          disabled={true}
          address={this.props.address}
          getCountries={this.props.getCountries} />
        <div className="twelve-col account-payment-details-address__edit">
          <juju.components.AddressForm
            addNotification={this.props.addNotification}
            address={this.props.address}
            disabled={disabled}
            getCountries={this.props.getCountries}
            ref="addressForm"
            validateForm={this.props.validateForm} />
          <div className={
            'twelve-col account-payment-details-address__buttons'}>
            <juju.components.GenericButton
              action={this.props.close}
              disabled={disabled}
              type="inline-neutral"
              title="Cancel" />
            <juju.components.GenericButton
              action={this._updateAddress.bind(this)}
              disabled={disabled}
              type="inline-positive"
              title="Update" />
          </div>
        </div>
      </juju.components.ExpandingRow>
    );
  }
};

AccountPaymentDetailsAddress.propTypes = {
  acl: React.PropTypes.object.isRequired,
  addAddress: React.PropTypes.func.isRequired,
  addNotification: React.PropTypes.func.isRequired,
  address: React.PropTypes.object.isRequired,
  close: React.PropTypes.func.isRequired,
  getCountries: React.PropTypes.func.isRequired,
  removeAddress: React.PropTypes.func.isRequired,
  showEdit: React.PropTypes.bool,
  updateAddress: React.PropTypes.func.isRequired,
  updated: React.PropTypes.func.isRequired,
  username: React.PropTypes.string.isRequired,
  validateForm: React.PropTypes.func.isRequired
};

YUI.add('account-payment-details-address', function() {
  juju.components.AccountPaymentDetailsAddress = AccountPaymentDetailsAddress;
}, '', {
  requires: [
    'address-form',
    'expanding-row',
    'generic-button'
  ]
});
