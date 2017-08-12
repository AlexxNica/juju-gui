/* Copyright (C) 2017 Canonical Ltd. */

'use strict';

/**
  Charm list React component used to display a list of the users charms in
  their profile.
*/
class ProfileCharmList extends React.Component {
  constructor() {
    super();
    this.xhrs = [];
    this.state = {
      data: []
    };
  }

  componentWillMount() {
    const user = this.props.user;
    if (user) {
      this._fetchCharms(user);
    }
  }

  componentWillUnmount() {
    this.xhrs.forEach((xhr) => {
      xhr && xhr.abort && xhr.abort();
    });
  }

  componentWillReceiveProps(nextProps) {
    const props = this.props;
    if (props.user !== nextProps.user) {
      this._fetchCharms(nextProps.user);
    }
  }

  /**
    Fetch the users charms from the charmstore.
    @param {String} user The external user name in the format "user@external".
  */
  _fetchCharms(user) {
    const props = this.props;
    this.xhrs.push(
      props.charmstore.list(
        user,
        (error, data) => {
          if (error) {
            const message = 'Unable to retrieve charms';
            console.error(message, error);
            this.props.addNotification({
              title: message,
              message: `${message}: ${error}`,
              level: 'error'
            });
            return;
          }
          this.setState({data});
        },
        'charm'));
  }

  /**
    Process the data required for the charm table.
    @param {Object} charm The charm data.
    @param {String} key The key that stores the data in the charm object.
    @return {String} THe string value to display in the table.
  */
  procesData(charm, key) {
    switch(key) {
      case 'series':
        return charm[key].reduce((list, val) => `${list} ${val}`, '');
        break;
      case 'owner':
        return charm[key] || this.props.user;
      case 'perm':
        const perms = charm[key];
        if (perms && perms.read.includes('everyone')) {
          return 'public';
        }
        return 'private';
      default:
        return charm[key];
    }
    return '';
  }

  render() {
    const labels = ['Name', 'Series', 'Owner', 'Visibility'];
    const charmKeys = ['name', 'series', 'owner', 'perm'];
    return (
      <div className="profile-charm-list">
        <ul>
          <li className="profile-charm-list__table-header">
            {labels.map(label => <span key={label}>{label}</span>)}
          </li>
          {this.state.data
            .map((charm, idx) =>
              <li className="profile-charm-list__row" key={idx}>
                {charmKeys.map(key => <span key={key}>{this.procesData(charm, key)}</span>)}
              </li>
            )}
        </ul>
      </div>);
  }
};

ProfileCharmList.propTypes = {
  addNotification: PropTypes.func.isRequired,
  charmstore: shapeup.shape({
    list: PropTypes.func.isRequired
  }).isRequired,
  user: PropTypes.string
};

YUI.add('profile-charm-list', function() {
  juju.components.ProfileCharmList = ProfileCharmList;
}, '', {
  requires: []
});
