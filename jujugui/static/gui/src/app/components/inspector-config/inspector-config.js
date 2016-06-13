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

YUI.add('inspector-config', function() {

  juju.components.Configuration = React.createClass({
    propTypes: {
      addNotification: React.PropTypes.func.isRequired,
      changeState: React.PropTypes.func.isRequired,
      charm: React.PropTypes.object.isRequired,
      getServiceByName: React.PropTypes.func.isRequired,
      getYAMLConfig: React.PropTypes.func.isRequired,
      linkify: React.PropTypes.func.isRequired,
      service: React.PropTypes.object.isRequired,
      setConfig: React.PropTypes.func.isRequired,
      updateServiceUnitsDisplayname: React.PropTypes.func.isRequired
    },

    /**
      Set the intial state.

      @method getInitialState
      @returns {String} The current state.
    */
    getInitialState: function() {
      return {
        // Have to clone the config so we don't update it via reference.
        serviceConfig: this._clone(this.props.service.get('config')),
        forceUpdate: false
      };
    },

    shouldComponentUpdate: function(nextProps, nextState) {
      // If the service has changed then the component should update with the
      // new props.
      var forceUpdate = this.state.forceUpdate;
      if (forceUpdate) {
        // Reset the force update flag so it only happens once.
        this.setState({forceUpdate: false});
      }
      return forceUpdate ||
        nextProps.service.get('id') !== this.props.service.get('id');
    },

    componentWillReceiveProps: function(nextProps) {
      this.setState({
        // Have to clone the config so we don't update it via reference.
        serviceConfig: this._clone(nextProps.service.get('config'))
      });
    },

    /**
      Clone an object.

      @method _clone
      @param {Object} obj The object to clone.
      @returns {Object} the cloned object.
    */
    _clone: function(obj) {
      return JSON.parse(JSON.stringify(obj));
    },

    /**
      Handle applying the uploaded config.

      @method _applyConfig
      @param {Object} config The config to apply.
    */
    _applyConfig: function(config) {
      var charmName = this.props.charm.get('name');
      // The provided YAML must be for the current charm.
      var newConfig = config[charmName];
      if (!newConfig) {
        return;
      }
      var serviceConfig = this.state.serviceConfig;
      Object.keys(newConfig).forEach((key) => {
        if (serviceConfig[key]) {
          serviceConfig[key] = newConfig[key];
        }
      });
      this.setState({forceUpdate: true});
      this.setState({serviceConfig: serviceConfig});
    },

    /**
      Handle uploading the config file.

      @method _openFileDialog
    */
    _importConfig: function() {
      this.props.getYAMLConfig(this.refs.file.files[0], this._applyConfig);
      // Reset the form so the file can be uploaded again
      this.refs['file-form'].reset();
    },

    /**
      Handle opening the file dialog from the hidden file input.

      @method _openFileDialog
    */
    _openFileDialog: function() {
      this.refs.file.click();
    },

    /**
      Return to the inspector overview.

      @method _showInspectorIndex
    */
    _showInspectorIndex: function() {
      this.props.changeState({
        sectionA: {
          component: 'inspector',
          metadata: {
            id: this.props.service.get('id'),
            activeComponent: undefined
          }}});
    },

    /**
      Callback handler for clicking the Save config button.

      @method _saveConfig
    */
    _saveConfig: function() {
      var refs = this.refs;
      var configValues = {};
      Object.keys(refs).forEach((ref) => {
        var activeRef = refs[ref];
        // Just in case we ever have any sub components which have refs
        // and aren't a configuration component.
        if (ref.split('-')[0] === 'Config') {
          configValues[activeRef.props.option.key] = activeRef.state.value;
        }
      });
      // The service name component is only shown if it's a ghost service.
      var serviceName = this.refs.ServiceName;
      var props = this.props;
      if (serviceName) {
        var service = props.service;
        var nameValue = serviceName.state.value;
        var serviceExists = props.getServiceByName(nameValue);
        // We want to allow them to set it to itself.
        if (service.get('name') !== nameValue && serviceExists !== null) {
          // The service already exists so bail out.
          props.addNotification({
            title: 'Invalid application name',
            message: `An application with the name "${nameValue}" already ` +
              'exists.',
            level: 'error'
          });
          return;
        }
        service.set('name', nameValue);
        props.updateServiceUnitsDisplayname(service.get('id'));
      }
      var changedConfig = this._getChangedValues(configValues);
      // If there are no changed values then don't set the config.
      if (Object.keys(changedConfig).length > 0) {
        props.setConfig(props.service.get('id'),
          changedConfig,
          this._setConfigCallback
        );
      }
      this._showInspectorIndex();
    },

    /**
      Given an object of key/value pairs for the configuration values
      this returns a new object with the values which are different from the
      service model.

      @method _getChangedValues
      @param {Object} configValues The values from the configuration UI.
      @returns {Object} The configuration values with new data.
    */
    _getChangedValues: function(configValues) {
      var serviceConfig = this.props.service.get('config');
      var changedValues = {};
      Object.keys(serviceConfig).forEach((key) => {
        if (serviceConfig[key] !== configValues[key]) {
          changedValues[key] = configValues[key];
        }
      });
      return changedValues;
    },

    /**
      Callback for the set config environment call.

      @method _setConfigCallback
    */
    _setConfigCallback: function() {
      // TODO
    },

    /**
      Generates the list of elements to render for the config UI.

      @method _generateConfigElements
      @returns {Array} An array of React components.
    */
    _generateConfigElements: function() {
      var serviceConfig = this.state.serviceConfig;
      var charmOptions = this.props.charm.get('options');
      // Some charms don't have any options, in this case, just return.
      if (!charmOptions) {
        return (
          <div className="inspector-config--no-config">
            No configuration options.
          </div>);
      }
      var configElements = [];

      Object.keys(charmOptions).forEach((key) => {
        var option = charmOptions[key];
        option.key = key;
        option.description = this.props.linkify(option.description);
        var ref = 'Config-' + key;
        // We use one component for numeric and string values and
        // another for boolean values.
        if (option.type === 'boolean') {
          var label = option.key + ':';
          configElements.push(
              <juju.components.BooleanConfig
                key={ref}
                ref={ref}
                option={option}
                label={label}
                config={serviceConfig[key]} />);
        } else {
          configElements.push(
              <juju.components.StringConfig
                key={ref}
                ref={ref}
                option={option}
                config={serviceConfig[key]} />);
        }
      });
      return configElements;
    },

    /**
      If this is a ghost service then show the ability to customize the
      service name.

      @method _customizeServiceName
      @return {Object} The input to render or not.
    */
    _customizeServiceName: function() {
      var id = this.props.service.get('id');
      // If it contains a $ at the end it's a ghost service so we allow them
      // to change the name.
      if (id.match(/\$$/)) {
        return (<juju.components.StringConfig
          ref="ServiceName"
          option={{
            key: 'Application name',
            description: 'Specify a custom application name. The application' +
              ' name cannot be changed once it has been deployed.'
          }}
          config={this.props.service.get('name')}/>);
      }
      return;
    },

    render: function() {
      var importButton = [{
        title: 'Import config file',
        action: this._openFileDialog
      }];
      var actionButtons = [{
        title: 'Cancel',
        type: 'base',
        action: this._showInspectorIndex
      }, {
        title: 'Save changes',
        type: 'neutral',
        action: this._saveConfig
      }];

      return (
        <div className="inspector-config">
          <div className="inspector-config__fields">
            {this._customizeServiceName()}
            <form ref="file-form">
              <input type="file" ref="file" className="hidden"
                onChange={this._importConfig} />
            </form>
            <div className="inspector-config__config-file">
              <juju.components.ButtonRow buttons={importButton} />
            </div>
            {this._generateConfigElements()}
          </div>
          <juju.components.ButtonRow buttons={actionButtons} />
        </div>
      );
    }
  });

}, '0.1.0', { requires: [
  'button-row',
  'string-config',
  'boolean-config'
]});
