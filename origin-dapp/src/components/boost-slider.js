import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'
import Slider from 'rc-slider'
import Tooltip from './tooltip'

// TODO:John - pass a third arg of 'OGN' into getFiatPrice() once OGN prices are available in cryptonator API
// import { getFiatPrice } from 'utils/priceUtils'
import {
  boostLevels,
  getBoostLevel,
  minBoostValue,
  maxBoostValue
} from 'utils/boostUtils'

class BoostSlider extends Component {
  constructor(props) {
    super(props)

    this.onChange = this.onChange.bind(this)
  }

  componentDidMount() {
    this.onChange(this.props.selectedBoostAmount)
  }

  async onChange(value) {
    const disableNextBtn = value > this.props.ognBalance
    this.props.onChange(value, getBoostLevel(value), disableNextBtn)
  }

  render() {
    const { ognBalance, isMultiUnitListing } = this.props
    const boostLevel = getBoostLevel(this.props.selectedBoostAmount)

    return (
      <div className="boost-slider">
        <p>
          {
            isMultiUnitListing ?
              <FormattedMessage
                id={'boost-slider.boost-level-multi-unit'}
                defaultMessage={'Boost Level (per unit)'}
              />
            :
              <FormattedMessage
                id={'boost-slider.boost-level'}
                defaultMessage={'Boost Level'}
              />
          }
        </p>
        <Tooltip
          placement="top"
          trigger="click"
          triggerClass="info-icon"
          content={
            <div className="boost-tooltip">
              <p>
                Your boost is a bit like a commission. It’s not required, but we
                recommend a boost level of 50 OGN for listings like yours.
              </p>
            </div>
          }
        >
          <img
            src="images/info-icon-inactive.svg"
            role="presentation"
          />
        </Tooltip>
        <div className="level-container">
          <span className={`boosted badge ${boostLevel.toLowerCase()}`}>
            <img src="images/boost-icon-arrow.svg" role="presentation" />
          </span>
          {boostLevel}
          {boostLevel.match(/medium/i) && ' (recommended)'}
          <div className="amount-container">
            <p>
              <img src="images/ogn-icon.svg" role="presentation" />
              {this.props.selectedBoostAmount}&nbsp;
              <Link
                to="/about-tokens"
                target="_blank"
                rel="noopener noreferrer"
              >
                OGN
              </Link>
              {/* <span className="help-block"> | { this.state.selectedBoostAmountUsd } USD</span> */}
            </p>
          </div>
        </div>
        <Slider
          className={`boost-level-${boostLevel}`}
          onChange={this.onChange}
          defaultValue={this.props.selectedBoostAmount}
          min={minBoostValue}
          disabled={!ognBalance}
          max={maxBoostValue}
        />
        <p className="text-italics">{boostLevels[boostLevel].desc}</p>
        {ognBalance === 0 && (
          <div className="info-box">
            <p>
              <FormattedMessage
                id={'boost-slider.no-ogn'}
                defaultMessage={
                  'You have 0 OGN in your wallet and cannot boost.'
                }
              />
            </p>
          </div>
        )}
        {ognBalance > 0 && ognBalance < this.props.selectedBoostAmount && (
          <div className="info-box warn">
            <p>
              <FormattedMessage
                id={'boost-slider.insufficient-ogn'}
                defaultMessage={`You don't have enough OGN in your wallet.`}
              />
            </p>
          </div>
        )}
        <p className="help-block bottom-explainer">
          <FormattedMessage
            id={'boost-slider.denomination'}
            defaultMessage={'Boosts are always calculated and charged in OGN.'}
          />
          &nbsp;
          <Link to="/about-tokens" target="_blank" rel="noopener noreferrer">
            <FormattedMessage
              id={'boost-slider.learn-more'}
              defaultMessage={'Learn More'}
            />
            &nbsp;&#x25b8;
          </Link>
        </p>
      </div>
    )
  }
}

export default BoostSlider
