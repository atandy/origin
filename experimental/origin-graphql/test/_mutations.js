import gql from 'graphql-tag'

const DeployToken = gql`
  mutation DeployToken(
    $name: String
    $symbol: String
    $decimals: String
    $supply: String
    $type: String
    $from: String
  ) {
    deployToken(
      name: $name
      symbol: $symbol
      decimals: $decimals
      supply: $supply
      type: $type
      from: $from
    ) {
      id
    }
  }
`

const DeployMarketplace = gql`
  mutation DeployMarketplace(
    $from: String
    $token: String
    $version: String
    $autoWhitelist: Boolean
  ) {
    deployMarketplace(
      from: $from
      token: $token
      version: $version
      autoWhitelist: $autoWhitelist
    ) {
      id
    }
  }
`

const CreateListing = gql`
  mutation CreateListing(
    $deposit: String
    $depositManager: String
    $from: String
    $data: NewListingInput
    $autoApprove: Boolean
  ) {
    createListing(
      deposit: $deposit
      depositManager: $depositManager
      from: $from
      data: $data
      autoApprove: $autoApprove
    ) {
      id
    }
  }
`

const MakeOffer = gql`
  mutation MakeOffer(
    $listingID: String
    $finalizes: Int
    $affiliate: String
    $commission: String
    $value: String
    $currency: String
    $arbitrator: String
    $data: MakeOfferInput
    $from: String
    $withdraw: String
    $quantity: Int
  ) {
    makeOffer(
      listingID: $listingID
      finalizes: $finalizes
      affiliate: $affiliate
      commission: $commission
      value: $value
      currency: $currency
      arbitrator: $arbitrator
      data: $data
      from: $from
      withdraw: $withdraw
      quantity: $quantity
    ) {
      id
    }
  }
`

const AcceptOffer = gql`
  mutation AcceptOffer($offerID: String!, $from: String) {
    acceptOffer(offerID: $offerID, from: $from) {
      id
    }
  }
`

const FinalizeOffer = gql`
  mutation FinalizeOffer($offerID: String!, $from: String) {
    finalizeOffer(offerID: $offerID, from: $from) {
      id
    }
  }
`

export default {
  DeployToken,
  DeployMarketplace,
  CreateListing,
  MakeOffer,
  AcceptOffer,
  FinalizeOffer
}
