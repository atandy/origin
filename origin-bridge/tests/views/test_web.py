from views import web_views  # noqa
import mock
import responses

from flask import session
from config import settings
from logic.attestation_service import twitter_access_token_url
from logic.attestation_service import twitter_request_token_url
from tests.helpers.rest_utils import post_json, json_of_response
from tests.helpers.eth_utils import sample_eth_address, str_eth

SIGNATURE_LENGTH = 132


def validate_issuer(issuer):
    assert issuer['name'] == 'Origin Protocol'
    assert issuer['url'] == 'https://www.originprotocol.com'
    assert issuer['ethAddress'] == settings.ATTESTATION_ACCOUNT


def test_index(client):
    resp = client.get('/')
    assert resp.status_code == 200


def test_request_phone_verify(client):
    with responses.RequestsMock() as rsps:
        rsps.add(
            responses.POST,
            'https://api.authy.com/protected/json/phones/verification/start',
            status=200
        )

        args = {
            'country_calling_code': '1',
            'phone': '12341234',
            'method': 'sms'
        }
        response = post_json(client, '/api/attestations/phone/generate-code',
                             args)

        assert response.status_code == 200
        assert json_of_response(response) == {}


@responses.activate
def test_verify_phone(client):
    with responses.RequestsMock() as rsps:
        rsps.add(
            responses.GET,
            'https://api.authy.com/protected/json/phones/verification/check',
            json={
                'message': 'Verification code is correct.',
                'success': True
            }
        )

        args = {
            'country_calling_code': '1',
            'phone': '12341234',
            'code': '123456',
            'identity': str_eth(sample_eth_address)
        }
        with mock.patch('logic.attestation_service.session', dict()) as session:
            session['phone_verification_method'] = 'sms'
            response = post_json(client, '/api/attestations/phone/verify', args)

        assert response.status_code == 200
        response_json = json_of_response(response)
        assert len(response_json['signature']['bytes']) == SIGNATURE_LENGTH
        assert response_json['schemaId'] == \
            'https://schema.originprotocol.com/attestation_1.0.0.json'
        validate_issuer(response_json['data']['issuer'])

        assert response_json['data']['issueDate']
        assert response_json['data']['attestation']['verificationMethod']['sms']
        assert response_json['data']['attestation']['phone']['verified']


@mock.patch('logic.attestation_service._send_email_using_sendgrid')
def test_email_verify(mock_send_email_using_sendgrid, client):
    mock_send_email_using_sendgrid.return_value = True

    data = {
        'email': 'origin@protocol.foo'
    }

    response = post_json(client, '/api/attestations/email/generate-code', data)

    assert response.status_code == 200
    assert 'email_attestation' in session

    verification_code = session['email_attestation']['code']

    data['identity'] = str_eth(sample_eth_address)
    data['code'] = verification_code

    response = post_json(client, '/api/attestations/email/verify', data)

    assert response.status_code == 200
    response_json = json_of_response(response)
    assert len(response_json['signature']['bytes']) == SIGNATURE_LENGTH
    assert response_json['schemaId'] == 'https://schema.originprotocol.com/attestation_1.0.0.json'
    validate_issuer(response_json['data']['issuer'])
    assert response_json['data']['issueDate']
    assert response_json['data']['attestation']['verificationMethod']['email']
    assert response_json['data']['attestation']['email']['verified']


def test_facebook_verify(client):
    response = client.get("/api/attestations/facebook/auth-url")
    expected_url = (
        "?client_id=facebook-client-id&redirect_uri"
        "=https://testhost.com/redirects/facebook/"
    )
    assert response.status_code == 200
    assert expected_url in json_of_response(response)['url']

    with responses.RequestsMock() as rsps:
        auth_url = 'https://graph.facebook.com/v2.12/oauth/access_token' + \
            '?client_id=facebook-client-id' + \
            '&client_secret=facebook-client-secret' + \
            '&redirect_uri=https%3A%2F%2Ftesthost.com%2Fredirects%2Ffacebook%2F' + \
            '&code=abcde12345'
        verify_url = 'https://graph.facebook.com/me?access_token=12345'

        rsps.add(
            responses.GET,
            auth_url,
            json={'access_token': '1234abc'},
        )

        rsps.add(
            responses.GET,
            verify_url,
            json={'name': 'Origin Protocol'},
            status=200
        )

        response = post_json(
            client,
            "/api/attestations/facebook/verify",
            {
                "identity": str_eth(sample_eth_address),
                "code": "abcde12345"
            }
        )
        response_json = json_of_response(response)
        assert response.status_code == 200
        assert len(response_json['signature']['bytes']) == SIGNATURE_LENGTH
        assert response_json['schemaId'] == \
            'https://schema.originprotocol.com/attestation_1.0.0.json'
        validate_issuer(response_json['data']['issuer'])
        assert response_json['data']['issueDate']
        assert response_json['data']['attestation']['verificationMethod']['oAuth']
        assert response_json['data']['attestation']['site']['siteName'] == 'facebook.com'


def test_twitter_verify(client):
    response_content = b'oauth_token=peaches&oauth_token_secret=pears'

    with responses.RequestsMock() as rsps:
        rsps.add(
            responses.POST,
            twitter_request_token_url,
            body=response_content,
            status=200
        )

        rsps.add(
            responses.POST,
            twitter_access_token_url,
            body=b'screen_name=originprotocol',
            status=200
        )

        response = client.get("/api/attestations/twitter/auth-url")
        assert response.status_code == 200
        assert "oauth_token=peaches" in json_of_response(response)['url']

        response = post_json(
            client,
            "/api/attestations/twitter/verify",
            {
                "identity": str_eth(sample_eth_address),
                "oauth-verifier": "abcde12345"
            }
        )
        response_json = json_of_response(response)
        assert response.status_code == 200
        assert len(response_json['signature']['bytes']) == SIGNATURE_LENGTH
        assert response_json['schemaId'] == \
            'https://schema.originprotocol.com/attestation_1.0.0.json'
        validate_issuer(response_json['data']['issuer'])
        assert response_json['data']['issueDate']
        assert response_json['data']['attestation']['verificationMethod']['oAuth']
        assert response_json['data']['attestation']['site']['siteName'] == 'twitter.com'
        assert response_json['data']['attestation']['site']['userId']['raw'] == 'originprotocol'
