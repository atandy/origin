import contracts from '../../contracts'
import get from 'lodash/get'

async function verifyPhoneCode(
  _,
  { identity, prefix, phone, code }
) {
  const bridgeServer = contracts.config.bridge
  if (!bridgeServer) {
    return { success: false }
  }
  const url = `${bridgeServer}/api/attestations/phone/verify`

  const response = await fetch(url, {
    headers: { 'content-type': 'application/json' },
    credentials: 'include',
    method: 'POST',
    body: JSON.stringify({
      country_calling_code: prefix,
      code,
      identity,
      phone
    })
  })

  const data = await response.json()

  if (!response.ok) {
    const reason = get(data, 'errors.code[0]', get(data, 'errors[0]'))
    return { success: false, reason }
  }

  return {
    success: true,
    claimType: data['claim-type'],
    data: contracts.web3.utils.soliditySha3(data.data),
    signature: data.signature
  }
}

export default verifyPhoneCode
