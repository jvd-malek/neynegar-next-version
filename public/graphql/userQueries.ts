export const GET_USER_BY_TOKEN = `
    query {
        userByToken {
            _id
            name
            phone
            status
            postCode
            address
            discount { discount date code }
            readingList {
              articleId {
                _id
                title
                desc
                cover
                popularity
                views
                majorCat
                minorCat
                authorId{
                  _id
                  fullName
                  firstname
                  lastname
                }
              }
            }
            favorite { 
              productId {
                _id
                title
                desc
                price { price date }
                discount { discount date }
                popularity
                cover
                brand
                showCount
                majorCat
                minorCat
                state
              }
            }
            bascket {
              productId {
                  _id
              }
              count
            }
            courseProgress { 
              courseId {_id title desc cover entry sections { title } popularity}
              progress 
            }
        }
    }
`

export const GET_USER_BY_PHONE = `
  query UserByPhone($phone: String!) {
    userByPhone(phone: $phone) {
      _id
      name
      phone
    }
  }
`;

export const GET_USER_ALERTS = `
  query GetUserAlerts($page: Int, $limit: Int) {
    userAlerts(page: $page, limit: $limit) {
      alerts {
        _id
        title
        body
        target
        status
        source
        sourceId
        readBy {
          userId {
            _id
          }
          readAt
        }
        createdAt
      }
      totalPages
      currentPage
      total
    }
  }
`;

export const GET_UNREAD_ALERT_COUNT = `
  query GetUnreadAlertCount {
    unreadAlertCount
  }
`;

// mutation

export const SEND_VERIFICATION_CODE = `
  mutation SendCode($phone: String!, $name: String!) {
    sendVerificationCode(phone: $phone, name: $name)
  }
`;

export const VERIFY_CODE = `
  mutation VerifyCode($phone: String!, $code: String!, $name: String!, $basket: [BasketInput]) {
    verifyCode(phone: $phone, code: $code, name: $name, basket: $basket) {
      token
      user {
        _id
        name
        phone
      }
    }
  }
`;

export const MARK_ALERT_AS_READ = `
  mutation MarkAlertAsRead($alertId: ID!) {
    markAlertAsRead(alertId: $alertId) {
      _id
    }
  }
`;

export const MARK_ALL_ALERTS_AS_READ = `
  mutation MarkAllAlertsAsRead {
    markAllAlertsAsRead
  }
`;