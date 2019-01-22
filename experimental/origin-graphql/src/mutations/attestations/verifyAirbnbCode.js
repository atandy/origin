import contracts from '../../contracts'
import get from 'lodash/get'

async function verifyAirbnbCode(_, { identity, airbnbUserId }) {
  const bridgeServer = contracts.config.bridge
  if (!bridgeServer) {
    return { success: false }
  }
  const match = airbnbUserId.match(/([0-9]+)/)
  if (!match) {
    throw 'No Airbnb UserID found'
  }

  const url = `${bridgeServer}/api/attestations/airbnb/verify`

  const response = await fetch(url, {
    headers: { 'content-type': 'application/json' },
    credentials: 'include',
    method: 'POST',
    body: JSON.stringify({ identity, airbnbUserId: match[1] })
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

export default verifyAirbnbCode
