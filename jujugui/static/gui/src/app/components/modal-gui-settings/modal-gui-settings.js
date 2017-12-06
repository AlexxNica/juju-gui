/* Copyright (C) 2017 Canonical Ltd. */
'use strict';

const PropTypes = require('prop-types');
const React = require('react');

const SvgIcon = require('../svg-icon/svg-icon');

// Handle global GUI settings to be saved on a storage like the local storage.
class ModalGUISettings extends React.Component {

  constructor(props) {
    super(props);
    const localStorage = this.props.localStorage;
    const getString = key => {
      return localStorage.getItem(key) || '';
    };
    const getBool = key => {
      // As localStorage only handles strings, check for the 'true' string.
      return getString(key) === 'true';
    };
    this.state = {
      'disable-auto-place': getBool('disable-auto-place'),
      'disable-cookie': getBool('disable-cookie'),
      'force-containers': getBool('force-containers'),
      'jujushell-url': getString('jujushell-url')
    };
  }

  /**
    Update the state when an input is changed.

    @param {Object} evt the change event.
  */
  _handleChange(evt) {
    const target = evt.target;
    let value;
    switch (target.type) {
      case 'checkbox':
        value = target.checked;
        break;
      case 'text':
        value = target.value;
        break;
      default:
        console.error('ModalGUISettings: invalid target type', target.type);
        return;
    }
    this.setState({[target.name]: value});
  }

  /**
    When the save button is pressed, commit to localStorage.
  */
  _handleSave() {
    const props = this.props;
    Object.keys(this.state).forEach(key => {
      const value = this.state[key];
      if (value) {
        props.localStorage.setItem(key, value);
      } else {
        props.localStorage.removeItem(key);
      }
    });
    props.closeModal();
  }

  render() {
    const props = this.props;
    const state = this.state;
    const handleChange = this._handleChange.bind(this);
    let jujushellNode = null;
    if (props.flags.terminal) {
      jujushellNode = (<p>
        <label htmlFor="jujushell-url">
          <input type="text" name="jujushell-url"
            id="jujushell-url"
            onChange={handleChange}
            value={state['jujushell-url']} />&nbsp;
          DNS name for the Juju Shell.
        </label>
      </p>);
    }
    return (
      <div className="modal modal--narrow">
        <div className="twelve-col no-margin-bottom">
          <h2 className="bordered">Custom GUI Settings</h2>
          <span className="close" tabIndex="0" role="button"
            onClick={props.closeModal}>
            <SvgIcon name="close_16" size="16" />
          </span>
        </div>
        <div className="content">
          <p>
            <label htmlFor="disable-cookie">
              <input type="checkbox" name="disable-cookie"
                id="disable-cookie"
                onChange={handleChange}
                defaultChecked={state['disable-cookie']} />&nbsp;
              Disable the EU cookie warning.
            </label>
          </p>
          <p>
            <label htmlFor="force-containers">
              <input type="checkbox" name="force-containers"
                id="force-containers"
                onChange={handleChange}
                defaultChecked={state['force-containers']} />&nbsp;
              Enable container control for this provider.
            </label>
          </p>
          <p>
            <label htmlFor="disable-auto-place">
              <input type="checkbox" name="disable-auto-place"
                id="disable-auto-place"
                onChange={handleChange}
                defaultChecked={state['disable-auto-place']} />&nbsp;
              Default to not automatically place units on commit.
            </label>
          </p>
          {jujushellNode}
          <p>
            <small>
              NOTE: You will need to reload for changes to take effect.
            </small>
          </p>
          <input type="button" className="button--positive"
            name="save-settings" onClick={this._handleSave.bind(this)}
            id="save-settings" value="Save" />
        </div>
      </div>
    );
  }
};

ModalGUISettings.propTypes = {
  closeModal: PropTypes.func.isRequired,
  flags: PropTypes.object.isRequired,
  localStorage: PropTypes.object.isRequired
};

module.exports = ModalGUISettings;
