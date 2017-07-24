/*
This file is part of the Juju GUI, which lets users view and manage Juju
environments within a graphical interface (https://launchpad.net/juju-gui).
Copyright (C) 2015 Canonical Ltd.

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

class StringConfigInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.config
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.value !== this.refs.editableInput.innerText;
  }

  /**
    When the value is updated in the input element then update the state
    with its innerText.

    @param {Object} evt The input or blur event objects.
  */
  _updateValue(evt) {
    const value = evt.currentTarget.innerText;
    this.props.setValue(value);
    this.setState({value:  value});
  }

  render() {
    return (
      <div className="string-config-input"
        contentEditable={!this.props.disabled}
        dangerouslySetInnerHTML={{__html: this.state.value}}
        onBlur={this._updateValue.bind(this)}
        onInput={this._updateValue.bind(this)}
        ref="editableInput">
      </div>
    );
  }
};

StringConfigInput.propTypes = {
  config: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  disabled: PropTypes.bool,
  setValue: PropTypes.func.isRequired
};

YUI.add('string-config-input', function() {
  juju.components.StringConfigInput = StringConfigInput;
}, '0.1.0', { requires: [] });
