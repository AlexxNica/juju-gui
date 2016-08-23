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
        'jujugui.gisf': False,
        'jujugui.GTM_enabled': False,
        'jujugui.gzip': True,
        'jujugui.insecure': False,
        'jujugui.interactive_login': False,
        'jujugui.jem_url': None,
        'jujugui.jimm_url': None,
        'jujugui.password': None,
        'jujugui.plans_url': options.DEFAULT_PLANS_URL,
        'jujugui.raw': False,
        'jujugui.sandbox': False,
        'jujugui.socketTemplate': '/model/$uuid/api',
        'jujugui.terms_url': options.DEFAULT_TERMS_URL,
        'jujugui.user': None,
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
            'jujugui.gisf': True,
            'jujugui.GTM_enabled': True,
            'jujugui.gzip': False,
            'jujugui.insecure': True,
            'jujugui.interactive_login': False,
            'jujugui.jem_url': 'http://1.2.3.4:8082',
            'jujugui.jimm_url': 'http://1.2.3.4:8082',
            'jujugui.password': 'Secret!',
            'jujugui.plans_url': 'https://1.2.3.4/plans-api/',
            'jujugui.raw': False,
            'jujugui.sandbox': True,
            'jujugui.socketTemplate': '/juju/api/$host/$port/$uuid',
            'jujugui.terms_url': 'https://1.2.3.4/terms-api/',
            'jujugui.user': 'who',
        }
        settings = {
            'jujugui.auth': 'blob',
            'jujugui.base_url': '/another/url',
            'jujugui.charmstore_url': 'https://1.2.3.4/api/',
            'jujugui.combine': 'true',
            'jujugui.gisf': True,
            'jujugui.GTM_enabled': True,
            'jujugui.gzip': 'false',
            'jujugui.insecure': True,
            'jujugui.interactive_login': 'false',
            'jujugui.jem_url': 'http://1.2.3.4:8082',
            'jujugui.jimm_url': 'http://1.2.3.4:8082',
            'jujugui.password': 'Secret!',
            'jujugui.plans_url': 'https://1.2.3.4/plans-api/',
            'jujugui.raw': 'off',
            'jujugui.sandbox': 'on',
            'jujugui.socketTemplate': '/juju/api/$host/$port/$uuid',
            'jujugui.terms_url': 'https://1.2.3.4/terms-api/',
            'jujugui.user': 'who',
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
