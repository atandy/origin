import gql from 'graphql-tag'

export default gql`
  query Reviews($id: ID!) {
    marketplace {
      user(id: $id) {
        id
        reviews {
          totalCount
          nodes {
            id
            review
            rating
            reviewer {
              id
              account {
                id
                identity {
                  profile {
                    id
                    fullName
                    avatar
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`
