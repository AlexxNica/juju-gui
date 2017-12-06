/* Copyright (C) 2017 Canonical Ltd. */
'use strict';

const PropTypes = require('prop-types');
const React = require('react');
const shapeup = require('shapeup');


const BasicTable = require('../../basic-table/basic-table');
const Spinner = require('../../spinner/spinner');

/**
  Charm list React component used to display a list of the users charms in
  their profile.
*/
class ProfileCharmList extends React.Component {
  constructor() {
    super();
    this.xhrs = [];
    this.state = {
      data: [],
      loading: false
    };
  }

  componentWillMount() {
    const user = this.props.user;
    if (user) {
      this._fetchCharms(user);
    }
  }

  componentWillUnmount() {
    this.xhrs.forEach(xhr => {
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
    this.setState({loading: true}, () => {
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
            this.setState({loading: false, data});
          },
          'charm'));
    });
  }

  /**
    Prevents the default actions on the link and navigates to the charmstore
    for the supplied id via changeState.
    @param {String} path The GUI charm path to navigate to.
    @param {Object} e The click event.
  */
  _navigateToCharm(path, e) {
    e.preventDefault();
    e.stopPropagation();
    this.props.changeState({profile: null, store: path, hash: null});
  }

  render() {
    let content;
    if (this.state.loading) {
      content = (<Spinner />);
    } else {
      const rows = this.state.data.map(charm => {
        const id = charm.id;
        const src = `${this.props.charmstore.url}/${id.replace('cs:', '')}/icon.svg`;
        const path = window.jujulib.URL.fromLegacyString(id).path();
        return ({
          columns: [{
            content: (
              <div>
                <img className="profile-charm-list__icon"
                  key="img"
                  src={src}
                  title={charm.name} />
                <a href={`${this.props.baseURL}${path}`}
                  key="link"
                  onClick={this._navigateToCharm.bind(this, path)}>
                  {charm.name}
                </a>
              </div>),
            columnSize: 6
          }, {
            content: charm.series.join(', '),
            columnSize: 3
          }, {
            content: `#${id.slice(-1)[0]}`,
            columnSize: 3
          }],
          key: charm.id
        });
      });
      content = (
        <BasicTable
          headers={[{
            content: 'Name',
            columnSize: 6
          }, {
            content: 'Series',
            columnSize: 3
          }, {
            content: 'Release',
            columnSize: 3
          }]}
          rows={rows} />);
    }
    return (
      <div className="profile-charm-list">
        {content}
      </div>);
  }
};

ProfileCharmList.propTypes = {
  addNotification: PropTypes.func.isRequired,
  baseURL: PropTypes.string.isRequired,
  changeState: PropTypes.func.isRequired,
  charmstore: shapeup.shape({
    list: PropTypes.func.isRequired,
    url: PropTypes.string.isRequired
  }).isRequired,
  user: PropTypes.string
};

module.exports = ProfileCharmList;
