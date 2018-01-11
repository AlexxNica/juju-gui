var juju_config = {
    "baseUrl": "{{.base}}",
    "staticURL": "{{.staticURL}}",
    "jujuCoreVersion": "{{.version}}",
    "jujuEnvUUID": "{{.uuid}}",
    "apiAddress": "wss://{{.host}}",
    "controllerSocketTemplate": "{{.controllerSocket}}",
    "socketTemplate": "{{.socket}}",
    "socket_protocol": "wss",
    "charmstoreAPIPath": "v4",
    "charmstoreURL": "https://api.jujucharms.com/charmstore/",
    "bundleServiceURL": "https://api.jujucharms.com/bundleservice/",
    "plansURL": "https://api.jujucharms.com/omnibus/",
    "paymentURL": "https://api.jujucharms.com/payment/",
    "termsURL": "https://api.jujucharms.com/terms/",
    "interactiveLogin": true,
    "html5": true,
    "container": "#main",
    "viewContainer": "#main",
    "consoleEnabled": true,
    "serverRouting": false,
};
