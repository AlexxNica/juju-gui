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

YUI.add('account-payment-method', function() {

  juju.components.AccountPaymentMethod = React.createClass({
    displayName: 'AccountPaymentMethod',

    propTypes: {
      acl: React.PropTypes.object.isRequired,
      addNotification: React.PropTypes.func.isRequired,
      createCardElement: React.PropTypes.func.isRequired,
      createPaymentMethod: React.PropTypes.func.isRequired,
      createToken: React.PropTypes.func.isRequired,
      getCountries: React.PropTypes.func.isRequired,
      paymentUser: React.PropTypes.object.isRequired,
      removePaymentMethod: React.PropTypes.func.isRequired,
      updateUser: React.PropTypes.func.isRequired,
      username: React.PropTypes.string.isRequired,
      validateForm: React.PropTypes.func.isRequired
    },

    getInitialState: function() {
      this.xhrs = [];
      return {
        cardAddressSame: true,
        showAdd: false
      };
    },

    componentWillUnmount: function() {
      this.xhrs.forEach((xhr) => {
        xhr && xhr.abort && xhr.abort();
      });
    },

    /**
      Generate a list of payment method details.

      @method _generatePaymentMethods
    */
    _generatePaymentMethods: function() {
      const user = this.props.paymentUser;
      if (!user.paymentMethods.length) {
        return (
          <div className="account__payment-no-methods">
            You do not have a payment method.
            <juju.components.GenericButton
              action={this._toggleAdd}
              type="inline-neutral"
              title="Add payment method" />
          </div>);
      }
      const classes = {
        'user-profile__list-row': true,
        'twelve-col': true
      };
      const methods = user.paymentMethods.map(method => {
        return (
          <juju.components.ExpandingRow
            classes={classes}
            clickable={false}
            expanded={true}
            key={method.name}>
            <div>
              {method.name}
            </div>
            <div className="account__payment-details">
              <juju.components.AccountPaymentMethodCard
                addNotification={this.props.addNotification}
                card={method}
                onPaymentMethodRemoved={this.props.updateUser}
                removePaymentMethod={this.props.removePaymentMethod}
                username={this.props.username} />
            </div>
          </juju.components.ExpandingRow>);
      });
      return (
        <ul className="user-profile__list twelve-col">
          {methods}
        </ul>);
    },

    /**
      Handle creating the card and user.

      @method _createToken
    */
    _createToken: function() {
      let fields = ['cardForm'];
      if (!this.state.cardAddressSame) {
        fields.push('cardAddress');
      }
      const valid = this.props.validateForm(fields, this.refs);;
      if (!valid) {
        return;
      }
      const card = this.refs.cardForm.getValue();
      const paymentUser = this.props.paymentUser;
      const address = this.state.cardAddressSame ?
        paymentUser.addresses.length && paymentUser.addresses[0] :
        this.refs.cardAddress.getValue();
      const extra = {
        addressLine1: address.line1 || '',
        addressLine2: address.line2 || '',
        addressCity: address.city || '',
        addressState: address.county || '',
        addressZip: address.postcode || '',
        addressCountry: address.country || '',
        name: card.name
      };
      const xhr = this.props.createToken(card.card, extra, (error, token) => {
        if (error) {
          const message = 'Could not create Stripe token';
          this.props.addNotification({
            title: message,
            message: `${message}: ${error}`,
            level: 'error'
          });
          console.error(message, error);
          return;
        }
        this._createPaymentMethod(token.id);
      });
      this.xhrs.push(xhr);
    },

    /**
      Create the payment method using the card token.

      @method _createPaymentMethod
      @param token {String} A Stripe token.
    */
    _createPaymentMethod: function(token) {
      const xhr = this.props.createPaymentMethod(
        this.props.username, token, null, (error, method) => {
          if (error) {
            const message = 'Could not create the payment method';
            this.props.addNotification({
              title: message,
              message: `${message}: ${error}`,
              level: 'error'
            });
            console.error(message, error);
            return;
          }
          this._toggleAdd();
          // Reload the user to get the new payment method.
          this.props.updateUser();
        });
      this.xhrs.push(xhr);
    },

    /**
      Show or hide the add payment method form.

      @method _toggleAdd
    */
    _toggleAdd: function() {
      this.setState({showAdd: !this.state.showAdd});
    },

    /**
      Update the state when the card checkbox changes.

      @method _handleCardSameChange
      @param evt {Object} The change event from the checkbox.
    */
    _handleCardSameChange: function(evt) {
      this.setState({cardAddressSame: evt.currentTarget.checked});
    },

    /**
      Generate the fields for the card address.

      @method _generateCardAddressFields
    */
    _generateCardAddressFields: function() {
      if (this.state.cardAddressSame) {
        return null;
      }
      return (
        <juju.components.AddressForm
          disabled={this.props.acl.isReadOnly()}
          addNotification={this.props.addNotification}
          getCountries={this.props.getCountries}
          ref="cardAddress"
          showName={false}
          showPhone={false}
          validateForm={this.props.validateForm} />);
    },

    /**
      Generate a form to add a payment method.

      @method _generateAddPaymentMethod
    */
    _generateAddPaymentMethod: function() {
      if (!this.state.showAdd) {
        return null;
      }
      return (
        <juju.components.ExpandingRow
          classes={{'twelve-col': true}}
          clickable={false}
          expanded={true}>
          <div></div>
          <div className="account__payment-form">
            <div className="account__payment-form-fields">
              <juju.components.CardForm
                acl={this.props.acl}
                createCardElement={this.props.createCardElement}
                ref="cardForm"
                validateForm={this.props.validateForm} />
              <label htmlFor="cardAddressSame">
                <input checked={this.state.cardAddressSame}
                  id="cardAddressSame"
                  name="cardAddressSame"
                  onChange={this._handleCardSameChange}
                  ref="cardAddressSame"
                  type="checkbox" />
                Credit or debit card address is the same as default address.
              </label>
              {this._generateCardAddressFields()}
            </div>
            <div className="twelve-col account__payment-form-buttons">
              <juju.components.GenericButton
                action={this._toggleAdd}
                type="inline-neutral"
                title="Cancel" />
              <juju.components.GenericButton
                action={this._createToken}
                type="inline-positive"
                title="Add" />
            </div>
          </div>
        </juju.components.ExpandingRow>);
    },

    render: function() {
      const content = this.state.showAdd ?
        this._generateAddPaymentMethod() : this._generatePaymentMethods();
      return (
        <div className="account__section">
          <h2 className="account__title twelve-col">
            Payment details
          </h2>
          {content}
        </div>
      );
    }

  });

}, '', {
  requires: [
    'account-payment-method-card',
    'address-form',
    'card-form',
    'expanding-row',
    'generic-button'
  ]
});
