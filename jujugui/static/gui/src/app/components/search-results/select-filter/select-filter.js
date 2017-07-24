/*
This file is part of the Juju GUI, which lets users view and manage Juju
environments within a graphical interface (https://launchpad.net/juju-gui).
Copyright (C) 2012-2013 Canonical Ltd.

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

class SearchResultsSelectFilter extends React.Component {
  /**
    Generate a list of items.

    @method _generateItems
    @returns {Object} The components.
  */
  _generateItems() {
    var components = [];
    this.props.items.forEach(function(item) {
      components.push(
        <option value={item.value}
          key={item.value}>
          {item.label}
        </option>);
    }, this);
    return components;
  }

  /**
    Change the state when the value changes.

    @method _handleChange
    @param {Object} e The change event.
  */
  _handleChange(e) {
    const search = {};
    search[this.props.filter] = e.currentTarget.value;
    this.props.changeState({
      search: search
    });
  }

  render() {
    var className = 'list-block__' + this.props.filter;
    return (
      <div className={className}>
        {this.props.label}:
        <select onChange={this._handleChange.bind(this)}
          defaultValue={this.props.currentValue}>
          {this._generateItems()}
        </select>
      </div>
    );
  }
};

SearchResultsSelectFilter.propTypes = {
  changeState: PropTypes.func.isRequired,
  currentValue: PropTypes.string,
  filter: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired,
  label: PropTypes.string.isRequired
};

YUI.add('search-results-select-filter', function(Y) {
  juju.components.SearchResultsSelectFilter = SearchResultsSelectFilter;
}, '0.1.0', {requires: []});
