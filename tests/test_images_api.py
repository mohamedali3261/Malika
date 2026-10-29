"""Opt-in local Worker image integration test (never use against production).

Start Wrangler with an isolated --persist-to directory and a temporary admin,
then set MALIKA_IMAGE_TEST_CREDENTIALS to that admin's JSON file and optionally
MALIKA_IMAGE_TEST_ORIGIN. A new test product is created in that local database.
"""
import json
import os
import unittest
import urllib.error
import urllib.request
import uuid

ORIGIN = os.environ.get('MALIKA_IMAGE_TEST_ORIGIN', 'http://127.0.0.1:8790')
CREDENTIALS = os.environ.get('MALIKA_IMAGE_TEST_CREDENTIALS')

@unittest.skipUnless(CREDENTIALS, 'requires an isolated local Worker and temporary admin')
class ImageApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with open(CREDENTIALS) as f:
            credentials = json.load(f)
        status, _, headers = cls.request('/api/login', 'POST', credentials)
        assert status == 200
        cls.cookie = headers['Set-Cookie'].split(';')[0]

    @classmethod
    def request(cls, path, method='GET', body=None, cookie=None, content_type='application/json'):
        headers = {'Origin': ORIGIN}
        if cookie:
            headers['Cookie'] = cookie
        if body is not None:
            headers['Content-Type'] = content_type
            if content_type == 'application/json':
                body = json.dumps(body).encode()
        request = urllib.request.Request(ORIGIN + path, data=body, headers=headers, method=method)
        try:
            response = urllib.request.urlopen(request, timeout=30)
        except urllib.error.HTTPError as error:
            response = error
        return response.status, response.read(), response.headers

    @classmethod
    def upload(cls, data, cookie=None, path='/api/admin/images'):
        boundary = 'malika-integration-boundary'
        body = (f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="test.png"\r\nContent-Type: image/png\r\n\r\n').encode() + data + (f'\r\n--{boundary}--\r\n').encode()
        return cls.request(path, 'POST', body, cookie, 'multipart/form-data; boundary=' + boundary)

    def test_image_lifecycle_and_limits(self):
        data = bytes.fromhex('89504e470d0a1a0a') + b'\0' * 20
        self.assertEqual(self.upload(data)[0], 401)
        self.assertEqual(self.upload(data, path='/api/images')[0], 401)

        # Staff with role='orders' must be forbidden from image upload/delete
        staff_name = 'staff-' + uuid.uuid4().hex[:8]
        staff_pass = 'staff-password-12345678'
        self.assertEqual(self.request('/api/admin/accounts', 'POST', {'username': staff_name, 'password': staff_pass, 'role': 'orders'}, self.cookie)[0], 201)
        _, _, staff_headers = self.request('/api/login', 'POST', {'username': staff_name, 'password': staff_pass})
        staff_cookie = staff_headers['Set-Cookie'].split(';')[0]
        self.assertEqual(self.upload(data, staff_cookie)[0], 403)
        self.assertEqual(self.upload(data, staff_cookie, path='/api/images')[0], 403)

        self.assertEqual(self.upload(b'not an image', self.cookie)[0], 400)
        self.assertEqual(self.upload(data + b'\0' * 1_000_001, self.cookie)[0], 413)
        self.assertEqual(self.upload(data + b'\0' * 1_100_000, self.cookie)[0], 413)

        status, raw, _ = self.upload(data, self.cookie)
        self.assertEqual(status, 201)
        image = json.loads(raw)
        self.assertEqual(image['url'], '/api/images/' + image['id'])
        status, body, headers = self.request(image['url'])
        self.assertEqual((status, body, headers['Content-Type']), (200, data, 'image/png'))
        self.assertIn('immutable', headers['Cache-Control'])
        self.assertNotIn('no-store', headers['Cache-Control'])
        listing = json.loads(self.request('/api/admin/images', cookie=self.cookie)[1])
        self.assertTrue(any(row['key'] == image['id'] for row in listing['images']))

        local = {'en': 'Test', 'ar': 'اختبار'}
        product_id = 'image-test-' + uuid.uuid4().hex
        product = {'id':product_id,'slug':product_id,'name':local,'tagline':local,'description':local,'story':local,'price':100,'sizes':[{'ml':50,'price':100}],'category':'woody','gender':'unisex','moods':['warm'],'notes':{'top':[],'heart':[],'base':[]},'images':[image['url']],'accent':'#fff','rating':4,'reviews':0,'longevity':'long','sillage':local,'createdAt':'2026-01-01'}
        path = '/api/admin/products/' + product_id
        self.assertEqual(self.request(path, 'PUT', product, self.cookie)[0], 200)
        self.assertEqual(self.request('/api/admin/images/' + image['id'], 'DELETE', cookie=self.cookie)[0], 409)
        product['images'] = ['/other.png']
        self.assertEqual(self.request(path, 'PUT', product, self.cookie)[0], 200)
        self.assertEqual(self.request('/api/admin/images/' + image['id'], 'DELETE', cookie=self.cookie)[0], 200)
        self.assertEqual(self.request(image['url'])[0], 404)
        product['images'] = [image['url']]
        self.assertEqual(self.request(path, 'PUT', product, self.cookie)[0], 409)

        # The stated maximum (1,000,000 bytes) is inclusive, and round-tripping must not corrupt bytes.
        # Also verify the /api/images alias for authenticated upload and delete.
        large = bytes.fromhex('89504e470d0a1a0a') + bytes((i % 251 for i in range(1_000_000 - 8)))
        status, raw, _ = self.upload(large, self.cookie, path='/api/images')
        self.assertEqual(status, 201)
        large_image = json.loads(raw)
        self.assertEqual(self.request(large_image['url'])[1], large)
        self.assertEqual(self.request('/api/images/' + large_image['id'], 'DELETE', cookie=self.cookie)[0], 200)
        self.assertEqual(self.request(large_image['url'])[0], 404)
        self.assertEqual(self.upload(large + b'\0', self.cookie)[0], 413)

if __name__ == '__main__':
    unittest.main()
