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

class UserProfileAgreementList extends React.Component {
  constructor() {
    super();
    this.xhrs = [];
    this.state = {
      agreementList: [],
      loadingAgreements: false
    };
  }

  componentWillMount() {
    this._getAgreements();
  }

  componentWillUnmount() {
    this.xhrs.forEach((xhr) => {
      xhr && xhr.abort && xhr.abort();
    });
  }

  componentWillReceiveProps(nextProps) {
    // If the user has changed then update the data.
    const props = this.props;
    const currentUser = props.user && props.user.user;
    const nextUser = nextProps.user && nextProps.user.user;
    if (nextUser !== currentUser) {
      this._getAgreements();
    }
  }

  /**
    Get the agreements for the authenticated user.

    @method _getAgreements
  */
  _getAgreements() {
    this.props.broadcastStatus('starting');
    // Delay the call until after the state change to prevent race
    // conditions.
    this.setState({loadingAgreements: true}, () => {
      const xhr = this.props.getAgreements(
        this._getAgreementsCallback.bind(this));
      this.xhrs.push(xhr);
    });
  }

  /**
    Callback for the terms API call to get agreements.

    @method _getAgreementsCallback
    @param {String} error The error from the request, or null.
    @param {Object} data The data from the request.
  */
  _getAgreementsCallback(error, data) {
    this.setState({loadingAgreements: false}, () => {
      const broadcastStatus = this.props.broadcastStatus;
      if (error) {
        broadcastStatus('error');
        // TODO frankban: notify the user with the error.
        console.error('cannot retrieve terms:', error);
        return;
      }
      if (!data || !data.length || data.length === 0) {
        broadcastStatus('empty');
      } else {
        broadcastStatus('ok');
      }
      this.setState({agreementList: data});
    });
  }

  /**
    Generate the details for the provided agreement.

    @method _generateRow
    @param {Object} agreement A agreement object.
    @returns {Array} The markup for the row.
  */
  _generateRow(agreement) {
    const term = agreement.term;
    return (
      <li className="user-profile__list-row twelve-col"
        key={term + agreement.revision}>
        <span className="user-profile__list-col eight-col">
          {term}
        </span>
        <span className="user-profile__list-col four-col last-col">
          <juju.components.DateDisplay
            date={agreement.createdAt}
            relative={true} />
        </span>
      </li>);
  }

  /**
    Generate the header for the agreements.

    @method _generateHeader
    @returns {Array} The markup for the header.
  */
  _generateHeader() {
    return (
      <li className="user-profile__list-header twelve-col">
        <span className="user-profile__list-col eight-col">
          Name
        </span>
        <span className="user-profile__list-col four-col last-col">
          Date signed
        </span>
      </li>);
  }

  render() {
    if (this.state.loadingAgreements) {
      return (
        <div className="user-profile__agreement-list twelve-col">
          <juju.components.Spinner />
        </div>
      );
    }
    const list = this.state.agreementList;
    if (!list || list.length === 0) {
      return null;
    }
    const rows = list.map(this._generateRow.bind(this));
    return (
      <div className="user-profile__agreement-list">
        <div className="user-profile__header twelve-col no-margin-bottom">
          Terms &amp; conditions
          <span className="user-profile__size">
            ({list.length})
          </span>
        </div>
        <ul className="user-profile__list twelve-col">
          {this._generateHeader()}
          {rows}
        </ul>
      </div>
    );
  }
};

// broadcastStatus is necessary for communicating loading status back to
// the parent SectionLoadWatcher.
UserProfileAgreementList.propTypes = {
  broadcastStatus: React.PropTypes.func,
  getAgreements: React.PropTypes.func.isRequired,
  user: React.PropTypes.object
};

// Just in case broadcastStatus isn't passed in (e.g., in tests), calls
// to it should not fail, so default to an empty function.
UserProfileAgreementList.defaultProps = {
  broadcastStatus: function() {}
};

YUI.add('user-profile-agreement-list', function() {
  juju.components.UserProfileAgreementList = UserProfileAgreementList;
}, '', {
  requires: [
    'date-display',
    'loading-spinner'
  ]
});
