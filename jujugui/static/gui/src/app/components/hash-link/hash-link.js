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

YUI.add('hash-link', function() {

  juju.components.HashLink = React.createClass({
    displayName: 'HashLink',

    propTypes: {
      changeState: React.PropTypes.func.isRequired,
      hash: React.PropTypes.string.isRequired
    },

    /**
      Update the hash state.
    */
    _handlClick: function() {
      this.props.changeState({hash: this.props.hash});
    },

    render: function() {
      return (
        <div className="hash-link"
          onClick={this._handlClick}>
          <juju.components.SvgIcon
            name="get-link-url_16"
            size="16" />
        </div>
      );
    }
  });

}, '0.1.0', {
  requires: [
    'svg-icon'
  ]
});
