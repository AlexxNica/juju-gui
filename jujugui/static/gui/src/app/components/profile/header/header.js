/* Copyright (C) 2017 Canonical Ltd. */
'use strict';

const PropTypes = require('prop-types');
const React = require('react');

const SvgIcon = require('../../svg-icon/svg-icon');

/** Header React component for use in the Profile component. */
class ProfileHeader extends React.Component {
  /**
    Handle closing the profile.
  */
  _handleClose() {
    this.props.changeState({
      hash: null,
      profile: null
    });
  }

  render() {
    return (
      <div className="profile-header twelve-col">
        <div className="profile-header__close link"
          onClick={this._handleClose.bind(this)}
          role="button"
          tabIndex="0">
          <SvgIcon
            name="close_16"
            size="20" />
        </div>
        <div className="inner-wrapper">
          <div className="profile-header__wrapper">
            <div className="profile-header__left">
              <span className={
                'profile-header__avatar profile-header__avatar--default'}>
                <span className="profile-header__avatar-overlay"></span>
              </span>
            </div>
            <div className="profile-header__right">
              <h1 className="profile-header__username">
                {this.props.username}
              </h1>
              <ul className="profile-header__userinfo">
                <li className="profile-header__userinfo-item">
                  <strong>Firstname surname</strong>
                </li>
                <li className="profile-header__userinfo-item">
                  firstname.surname@company.com
                </li>
                <li className="profile-header__userinfo-item">Company Ltd</li>
              </ul>
              <div className="profile-header__nav">
                <h3 className="profile-header__subheading">Jaas</h3>
                <ul className="profile-header__userinfo">
                  <li className="profile-header__userinfo-item"><a href="/">Home</a></li>
                  <li className="profile-header__userinfo-item"><a href="/">About JAAS</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>);
  }

};

ProfileHeader.propTypes = {
  changeState: PropTypes.func.isRequired,
  username: PropTypes.string.isRequired
};

module.exports = ProfileHeader;
