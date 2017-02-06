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

YUI.add('empty-user-profile', function() {

  juju.components.EmptyUserProfile = React.createClass({
    propTypes: {
      changeState: React.PropTypes.func.isRequired,
      staticURL: React.PropTypes.string,
      switchModel: React.PropTypes.func.isRequired
    },

    getDefaultProps: function() {
      return {
        staticURL: ''
      };
    },

    /**

      A simply wrapper around the passed-in switchModel function; all the
      wrapper does in pass an empty modelList into the provied switchModel.
      After all, this is an EmptyUserProfile component; by definition we know
      the modelList is empty.

      @method switchModel
      @param {String} uuid The model UUID.
      @param {String} name The model name.
    */
    switchModel: function(uuid, name) {
      this.props.switchModel(uuid, name);
    },


    render: function() {
      var props = this.props;
      var basePath = `${props.staticURL}/static/gui/build/app`;
      return (
        <div className="user-profile__empty twelve-col no-margin-bottom">
          <img alt="Empty profile"
            className="user-profile__empty-image"
            src=
              {`${basePath}/assets/images/non-sprites/empty_profile.png`} />
          <h2 className="user-profile__empty-title">
            Your profile is currently empty
          </h2>
          <p className="user-profile__empty-text">
            Your models, bundles, and charms will
            appear here when you create them.
          </p>
          <juju.components.CreateModelButton
            changeState={props.changeState}
            switchModel={this.switchModel}
            title="Start building"
            type="inline-positive" />
        </div>);
    }

  });

}, '', {
  requires: []
});
