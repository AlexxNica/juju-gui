# Copyright 2015 Canonical Ltd.  This software is licensed under the
# GNU Affero General Public License version 3 (see the file LICENSE).

from copy import deepcopy
import unittest

from jujugui import options


class TestUpdate(unittest.TestCase):

    default_settings = {
        'jujugui.auth': None,
        'jujugui.base_url': '',
        'jujugui.charmstore_url': options.DEFAULT_CHARMSTORE_URL,
        'jujugui.combine': True,
        'jujugui.GTM_enabled': False,
        'jujugui.gzip': True,
        'jujugui.interactive_login': False,
        'jujugui.jem_url': None,
        'jujugui.password': None,
        'jujugui.raw': False,
        'jujugui.sandbox': False,
        'jujugui.socketTemplate': '/model/$uuid/api',
        'jujugui.user': None,
        'jujugui.insecure': False,
        'jujugui.gisf': False,
    }

    def test_default_values(self):
        settings = {}
        options.update(settings)
        defaults = deepcopy(self.default_settings)
        self.assertEqual(defaults, settings)

    def test_customized_values(self):
        expected_settings = {
            'jujugui.auth': 'blob',
            'jujugui.base_url': '/another/url',
            'jujugui.charmstore_url': 'https://1.2.3.4/api/',
            'jujugui.combine': True,
            'jujugui.GTM_enabled': True,
            'jujugui.gzip': False,
            'jujugui.interactive_login': False,
            'jujugui.jem_url': 'http://1.2.3.4:8082',
            'jujugui.password': 'Secret!',
            'jujugui.raw': False,
            'jujugui.sandbox': True,
            'jujugui.socketTemplate': '/juju/api/$host/$port/$uuid',
            'jujugui.user': 'who',
            'jujugui.insecure': True,
            'jujugui.gisf': True,
        }
        settings = {
            'jujugui.auth': 'blob',
            'jujugui.base_url': '/another/url',
            'jujugui.charmstore_url': 'https://1.2.3.4/api/',
            'jujugui.combine': 'true',
            'jujugui.GTM_enabled': True,
            'jujugui.gzip': 'false',
            'jujugui.interactive_login': 'false',
            'jujugui.jem_url': 'http://1.2.3.4:8082',
            'jujugui.password': 'Secret!',
            'jujugui.raw': 'off',
            'jujugui.sandbox': 'on',
            'jujugui.socketTemplate': '/juju/api/$host/$port/$uuid',
            'jujugui.user': 'who',
            'jujugui.insecure': True,
            'jujugui.gisf': True,
        }
        options.update(settings)
        self.assertEqual(expected_settings, settings)

    def test_empty_values(self):
        settings = dict((k, '') for k in self.default_settings)
        options.update(settings)
        defaults = deepcopy(self.default_settings)
        self.assertEqual(defaults, settings)

    def test_none_returned(self):
        self.assertIsNone(options.update({}))

    def test_false_non_defaults(self):
        settings = {'jujugui.gzip': False}
        options.update(settings)
        self.assertFalse(settings['jujugui.gzip'])
