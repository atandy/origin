import React, { Component } from 'react'
import pick from 'lodash/pick'
import get from 'lodash/get'

import unpublishedProfileStrength from 'utils/unpublishedProfileStrength'

import withWallet from 'hoc/withWallet'
import withIdentity from 'hoc/withIdentity'

import ProfileStrength from 'components/ProfileStrength'
import Avatar from 'components/Avatar'
import Wallet from 'components/Wallet'

import PhoneAttestation from 'pages/identity/PhoneAttestation'
import EmailAttestation from 'pages/identity/EmailAttestation'
import FacebookAttestation from 'pages/identity/FacebookAttestation'
import TwitterAttestation from 'pages/identity/TwitterAttestation'
import AirbnbAttestation from 'pages/identity/AirbnbAttestation'
import DeployIdentity from 'pages/identity/mutations/DeployIdentity'

import EditProfile from './_EditModal'

const AttestationComponents = {
  phone: PhoneAttestation,
  email: EmailAttestation,
  facebook: FacebookAttestation,
  twitter: TwitterAttestation,
  airbnb: AirbnbAttestation
}

const ProfileFields = [
  'firstName',
  'lastName',
  'description',
  'avatar',
  'facebookVerified',
  'twitterVerified',
  'airbnbVerified',
  'phoneVerified',
  'emailVerified'
]

class UserProfile extends Component {
  constructor(props) {
    super(props)
    const profile = get(props, 'identity.profile')
    this.state = {
      firstName: '',
      lastName: '',
      description: '',
      ...pick(profile, ProfileFields)
    }
  }

  componentDidUpdate(prevProps) {
    const profile = get(this.props, 'identity.profile')
    if (profile && !prevProps.identity) {
      this.setState(pick(profile, ProfileFields))
    }
  }

  render() {
    const attestations = Object.keys(AttestationComponents).reduce((m, key) => {
      if (this.state[`${key}Attestation`])
        m.push(this.state[`${key}Attestation`])
      return m
    }, [])

    const name = []
    if (this.state.firstName) name.push(this.state.firstName)
    if (this.state.lastName) name.push(this.state.lastName)

    return (
      <div className="container profile-edit">
        <div className="row">
          <div className="col-md-8">
            <div className="profile d-flex">
              <Avatar avatar={this.state.avatar} size="10rem" />
              <div className="info">
                <h1>{name.length ? name.join(' ') : 'Unnamed User'}</h1>
                <div className="description">
                  {this.state.description ||
                    'An Origin user without a description'}
                </div>
              </div>
              <a
                className="edit"
                href="#"
                onClick={e => {
                  e.preventDefault()
                  this.setState({ editProfile: true })
                }}
              />
            </div>
            <h3>Verify yourself on Origin</h3>
            <div className="gray-box">
              <label className="mb-3">
                Please connect your accounts below to strengthen your identity
                on Origin.
              </label>
              <div className="profile-attestations">
                {this.renderAtt('phone', 'Phone Number')}
                {this.renderAtt('email', 'Email')}
                {this.renderAtt('airbnb', 'Airbnb')}
                {this.renderAtt('facebook', 'Facebook')}
                {this.renderAtt('twitter', 'Twitter')}
                {this.renderAtt('google', 'Google', true)}
              </div>
            </div>

            <ProfileStrength
              large={true}
              published={get(this.props, 'identity.profile.strength', 0)}
              unpublished={unpublishedProfileStrength(this)}
            />

            <div className="actions">
              <DeployIdentity
                className="btn btn-primary btn-rounded btn-lg"
                identity={get(this.props, 'identity.id')}
                profile={pick(this.state, [
                  'firstName',
                  'lastName',
                  'description',
                  'avatar'
                ])}
                attestations={attestations}
                validate={() => this.validate()}
                children="Publish Now"
              />
            </div>
          </div>
          <div className="col-md-4">
            <Wallet />
            <div className="gray-box profile-help">
              <b>Verifying your profile</b> allows other users to know that you
              are a real person and increases the chances of successful
              transactions on Origin.
            </div>
          </div>
        </div>

        {!this.state.editProfile ? null : (
          <EditProfile
            {...pick(this.state, [
              'firstName',
              'lastName',
              'description',
              'avatar'
            ])}
            onClose={() => this.setState({ editProfile: false })}
            onChange={newState => this.setState(newState)}
          />
        )}
      </div>
    )
  }

  renderAtt(type, text, soon) {
    const { wallet } = this.props
    const profile = get(this.props, 'identity.profile', {})

    let status = ''
    if (profile[`${type}Verified`]) {
      status = ' published'
    } else if (this.state[`${type}Attestation`]) {
      status = ' provisional'
    }
    if (soon) {
      status = ' soon'
    } else {
      status += ' interactive'
    }

    let AttestationComponent = AttestationComponents[type]
    if (AttestationComponent) {
      AttestationComponent = (
        <AttestationComponent
          wallet={wallet}
          open={this.state[type]}
          onClose={() => this.setState({ [type]: false })}
          onComplete={att => this.setState({ [`${type}Attestation`]: att })}
        />
      )
    }

    return (
      <>
        <div
          className={`profile-attestation ${type}${status}`}
          onClick={() => this.setState({ [type]: true })}
        >
          <i />
          {text}
        </div>
        {AttestationComponent}
      </>
    )
  }

  validate() {
    const newState = {}

    if (!this.state.firstName) {
      newState.firstNameError = 'First Name is required'
    }

    newState.valid = Object.keys(newState).every(f => f.indexOf('Error') < 0)

    if (!newState.valid) {
      window.scrollTo(0, 0)
    }
    this.setState(newState)
    return newState.valid
  }
}

export default withWallet(withIdentity(UserProfile))

require('react-styl')(`
  .profile-edit
    margin-top: 3rem
    .gray-box
      border: 1px solid var(--light)
      border-radius: 5px
      padding: 1rem
      margin-bottom: 2rem
    .avatar
      margin-right: 2rem
      border-radius: 1rem
    .actions
      text-align: center
    .profile
      position: relative
      h1
        margin: 0
      margin-bottom: 2rem
      a.edit
        background: url(images/edit-icon.svg) no-repeat center
        background-size: cover
        width: 2rem
        height: 2rem
        display: block
        position: absolute
        top: 0
        right: 0
    .profile-help
      font-size: 14px;
      background: url(images/identity/identity.svg) no-repeat center 1.5rem;
      background-size: 5rem;
      padding-top: 8rem;


`)
