import graphqlFields from 'graphql-fields'
import sortBy from 'lodash/sortBy'

import contracts from '../contracts'
import { listingsBySeller } from './marketplace/listings'
import { getIdsForPage, getConnection } from './_pagination'
import { transactions } from './web3/transactions'

const ec = () => contracts.marketplace.eventCache

async function resultsFromIds({ after, allIds, first, fields }) {
  let nodes = []
  const totalCount = allIds.length
  const { ids, start } = getIdsForPage({ after, ids: allIds, first })

  if (fields.nodes) {
    nodes = await Promise.all(
      ids.map(id => {
        const [listingId, offerId] = id.split('-')
        return contracts.eventSource.getOffer(listingId, offerId)
      })
    )
  }

  return getConnection({ start, first, nodes, ids, totalCount })
}

async function offers(buyer, { first = 10, after }, _, info) {
  const fields = graphqlFields(info)
  const events = await ec().allEvents('OfferCreated', buyer.id)

  const allIds = events
    .map(e => `${e.returnValues.listingID}-${e.returnValues.offerID}`)
    .reverse()

  return await resultsFromIds({ after, allIds, first, fields })
}

async function sales(seller, { first = 10, after }, _, info) {
  const fields = graphqlFields(info)

  const listings = await ec().allEvents('ListingCreated', seller.id)
  const listingIds = listings.map(e => Number(e.returnValues.listingID))
  const events = await ec().offers(listingIds, null, 'OfferCreated')

  const allIds = events
    .map(e => `${e.returnValues.listingID}-${e.returnValues.offerID}`)
    .reverse()

  return await resultsFromIds({ after, allIds, first, fields })
}

async function reviews(user) {
  const listings = await ec().allEvents('ListingCreated', user.id)
  const listingIds = listings.map(e => Number(e.returnValues.listingID))
  const events = await ec().offers(listingIds, null, 'OfferFinalized')

  let nodes = await Promise.all(
    events.map(event =>
      contracts.eventSource.getReview(
        event.returnValues.listingID,
        event.returnValues.offerID,
        event.returnValues.party,
        event.returnValues.ipfsHash
      )
    )
  )

  nodes = nodes.filter(n => n.rating)

  return {
    totalCount: nodes.length,
    nodes,
    pageInfo: {
      endCursor: '',
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: ''
    }
  }
}

// Sourced from offer events where user is alternate party
async function notifications(user, { first = 10, after }, _, info) {
  const fields = graphqlFields(info)

  const sellerListings = await ec().allEvents('ListingCreated', user.id)

  const sellerListingIds = sellerListings.map(e =>
    Number(e.returnValues.listingID)
  )

  const sellerEvents = await ec().offers(
    sellerListingIds,
    null,
    [
      'OfferCreated',
      'OfferFinalized',
      'OfferWithdrawn',
      'OfferFundsAdded',
      'OfferDisputed',
      'OfferRuling'
    ],
    user.id
  )

  const buyerListings = await ec().allEvents('OfferCreated', user.id)

  const buyerListingIds = buyerListings.map(e =>
    Number(e.returnValues.listingID)
  )

  const buyerEvents = await ec().offers(
    buyerListingIds,
    null,
    ['OfferAccepted', 'OfferRuling'],
    user.id
  )

  const allEvents = sortBy(
    [...sellerEvents, ...buyerEvents],
    e => -e.blockNumber
  )

  const totalCount = allEvents.length,
    allIds = allEvents.map(e => e.id)

  const { ids, start } = getIdsForPage({ after, ids: allIds, first })
  const filteredEvents = allEvents.filter(e => ids.indexOf(e.id) >= 0)

  let offers = [],
    nodes = []

  if (fields.nodes) {
    offers = await Promise.all(
      filteredEvents.map(event =>
        contracts.eventSource.getOffer(
          event.returnValues.listingID,
          event.returnValues.offerID,
          event.blockNumber
        )
      )
    )
    nodes = filteredEvents.map((event, idx) => {
      const party = event.returnValues.party
      return {
        id: event.id,
        offer: offers[idx],
        party: { id: party, account: { id: party } },
        event,
        read: false
      }
    })
  }

  return getConnection({ start, first, nodes, ids, totalCount })
}

export default {
  offers,
  sales,
  reviews,
  notifications,
  transactions,
  listings: listingsBySeller,
  firstEvent: async user => {
    if (user.firstEvent) return user.firstEvent
    const events = await ec().allEvents(undefined, user.id)
    return events[0]
  },
  lastEvent: async user => {
    if (user.lastEvent) return user.lastEvent
    const events = await ec().allEvents(undefined, user.id)
    return events[events.length - 1]
  }
}
