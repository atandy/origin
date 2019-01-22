import React, { Component } from 'react'
import { Query } from 'react-apollo'
import dayjs from 'dayjs'

import withWallet from 'hoc/withWallet'

import QueryError from 'components/QueryError'
import TokenPrice from 'components/TokenPrice'
import Link from 'components/Link'
import BottomScrollListener from 'components/BottomScrollListener'
import NavLink from 'components/NavLink'

import nextPageFactory from 'utils/nextPageFactory'
import query from 'queries/UserListings'

const nextPage = nextPageFactory('marketplace.user.listings')

class Listings extends Component {
  render() {
    const vars = { first: 15, id: this.props.wallet }
    if (!this.props.wallet) return null

    return (
      <div className="container purchases">
        <Query
          query={query}
          variables={vars}
          notifyOnNetworkStatusChange={true}
        >
          {({ error, data, fetchMore, networkStatus }) => {
            if (networkStatus === 1 || !this.props.wallet) {
              return <div>Loading...</div>
            } else if (error) {
              return <QueryError error={error} query={query} vars={vars} />
            } else if (!data || !data.marketplace) {
              return <p className="p-3">No marketplace contract?</p>
            }

            const {
              nodes,
              pageInfo,
              totalCount
            } = data.marketplace.user.listings
            const { hasNextPage, endCursor: after } = pageInfo

            if (totalCount === 0) {
              return <NoListings />
            }

            return (
              <>
                <h1>My Listings</h1>
                <div className="row">
                  <div className="col-md-3">
                    <ul className="nav nav-pills flex-column">
                      <li className="nav-item">
                        <NavLink className="nav-link" to="/my-listings" exact>
                          All
                        </NavLink>
                      </li>
                      <li className="nav-item">
                        <NavLink className="nav-link" to="/my-listings/active">
                          Active
                        </NavLink>
                      </li>
                      <li className="nav-item">
                        <NavLink
                          className="nav-link"
                          to="/my-listings/inactive"
                        >
                          Inactive
                        </NavLink>
                      </li>
                    </ul>
                  </div>
                  <div className="col-md-9">
                    <BottomScrollListener
                      ready={networkStatus === 7}
                      hasMore={hasNextPage}
                      onBottom={() => nextPage(fetchMore, { ...vars, after })}
                    >
                      <>
                        {nodes.map(listing => (
                          <div className="purchase" key={`${listing.id}`}>
                            {listing.media && listing.media.length ? (
                              <div
                                className="main-pic"
                                style={{
                                  backgroundImage: `url(${
                                    listing.media[0].urlExpanded
                                  })`
                                }}
                              />
                            ) : null}
                            <div className="details">
                              <div className="top">
                                <div className="category">
                                  {listing.categoryStr}
                                </div>
                                <div className="status">{listing.status}</div>
                              </div>
                              <div className="title">
                                <Link to={`/listings/${listing.id}`}>
                                  {listing.title}
                                </Link>
                              </div>
                              <div className="date">{`Listed on ${dayjs
                                .unix(listing.createdEvent.timestamp)
                                .format('MMMM D, YYYY')}`}</div>
                              <div className="price">
                                <TokenPrice {...listing.price} />
                              </div>
                            </div>
                          </div>
                        ))}
                        {!hasNextPage ? null : (
                          <button
                            text={
                              networkStatus === 3 ? 'Loading' : 'Load more...'
                            }
                            className="mt-3"
                            onClick={() =>
                              nextPage(fetchMore, { ...vars, after })
                            }
                          />
                        )}
                      </>
                    </BottomScrollListener>
                  </div>
                </div>
              </>
            )
          }}
        </Query>
      </div>
    )
  }
}

const NoListings = () => (
  <div className="row">
    <div className="col-12 text-center">
      <img src="images/empty-listings-graphic.svg" />
      <h1>You don&apos;t have any listings yet.</h1>
      <p>Follow the steps below to create your first listing!</p>
      <br />
      <Link to="/create" className="btn btn-lg btn-primary btn-rounded">
        Create Your First Listing
      </Link>
    </div>
  </div>
)

export default withWallet(Listings)

require('react-styl')(`
`)
