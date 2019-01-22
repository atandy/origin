import React, { Component } from 'react'
import Redirect from 'components/Redirect'
import Price from 'components/Price'
import ListingBadge from 'components/ListingBadge'

class Listings extends Component {
  state = {}
  render() {
    const { listings } = this.props
    if (!listings) return null

    return (
      <div className="row">
        {this.state.redirect && <Redirect to={this.state.redirect} />}
        {listings.map(a => (
          <div
            key={a.id}
            onClick={() => this.setState({ redirect: `/listings/${a.id}` })}
            className="col-md-4 listing-card"
          >
            {a.media && a.media.length ? (
              <div
                className="main-pic"
                style={{
                  backgroundImage: `url(${a.media[0].urlExpanded})`
                }}
              />
            ) : (
              <div className="main-pic empty" />
            )}
            <div className="header">
              <div className="category">{a.categoryStr}</div>
              <ListingBadge status={a.status} featured={a.featured} />
            </div>
            <h5>{a.title}</h5>
            <div className="price">
              <div className="eth">{`${a.price.amount} ETH`}</div>
              <div className="usd">
                <Price amount={a.price.amount} />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }
}

export default Listings

require('react-styl')(`
  .listing-card
    position: relative
    overflow: hidden
    display: flex
    flex-direction: column
    justify-content: center
    margin-bottom: 2rem
    margin-top: 1rem
    cursor: pointer

    .main-pic
      padding-top: 66.6%
      background-size: cover
      background-repeat: no-repeat
      background-position: center
      &.empty
        background: var(--light) url(images/default-image.svg)
        background-repeat: no-repeat
        background-position: center

    .header
      display: flex
      align-items: center
      justify-content: space-between

    .category
      font-family: Lato
      font-size: 14px
      color: var(--dusk)
      font-weight: normal
      text-transform: uppercase
      margin-top: 0.75rem

    .badge
      margin-top: 0.75rem

    h5
      font-family: Poppins
      font-size: 24px
      font-weight: 300
      color: var(--dark)
      white-space: nowrap
      overflow: hidden
      text-overflow: ellipsis
      margin-top: 0.5rem

    .price
      background: url(images/eth-icon.svg) no-repeat
      padding-left: 2rem
      line-height: 1.25rem
      font-family: Lato

      .eth
        font-size: 18px
        font-weight: normal
        color: var(--bluish-purple)

      .usd
        font-size: 10px
        font-weight: normal
        letter-spacing: 0.8px
        color: var(--steel)
`)
