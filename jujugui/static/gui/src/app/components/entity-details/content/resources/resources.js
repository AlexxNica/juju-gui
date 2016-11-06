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

YUI.add('entity-resources', function() {

  juju.components.EntityResources = React.createClass({

    propTypes: {
      apiUrl: React.PropTypes.string.isRequired,
      charmId: React.PropTypes.string.isRequired,
      pluralize: React.PropTypes.func.isRequired,
      resources: React.PropTypes.object
    },

    /**
      Generate a list of resources to display.

      @returns {Object} The resource list markup.
    */
    _generateResources: function() {
      const resources = this.props.resources;
      if (!resources || Object.keys(resources).length === 0) {
        return;
      }
      const resourceList = Object.keys(resources).map((key, i) => {
        const resource = resources[key];
        // Construct the full path to the resource.
        const URL = `${this.props.apiUrl}/` +
          `${this.props.charmId.replace('cs:', '')}/resource/${resource.name}`;
        // Get the file extension.
        const parts = resource.path.split('.');
        let extension;
        if (parts.length > 1) {
          extension = `(.${parts.pop()})`;
        }
        return (
          <li className="entity-files__file"
            key={resource.name + i}>
            <a href={URL} target="_blank">
              {resource.name} {extension}
            </a>
          </li>);
      });
      return (
        <div className="entity-resources section" id="files">
          <h3 className="section__title">
            {resourceList.length}&nbsp;
            {this.props.pluralize('resource', resourceList.length)}
          </h3>
          <ul className="section__list entity-files__listing">
            {resourceList}
          </ul>
        </div>);
    },

    render: function() {
      return (
        <div>
            {this._generateResources()}
        </div>
      );
    }

  });

}, '0.1.0', { requires: [
]});
