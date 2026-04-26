export const GET_ORDERS_BY_USER = `
    query OrdersByUser( $page: Int, $limit: Int) {
        ordersByUser( page: $page, limit: $limit) {
            orders {
                _id
                products {
                    productId {
                        _id
                        title
                        cover
                    }
                    packageId {
                        _id
                        title
                        cover
                    }
                    count
                    price
                    discount
                }
                totalPrice
                totalWeight
                shippingCost
                discount
                discountCode
                status
                paymentId
                authority
                postVerify
                createdAt
                submition
            }
            totalPages
            currentPage
            total
        }
    }
`

export const GET_ORDERS = `
    query GetOrders($page: Int!, $limit: Int!, $search: String) {
        orders(page: $page, limit: $limit, search: $search) {
            orders {
                _id
                products {
                    productId {
                        _id
                        title
                        cover
                    }
                    packageId {
                        _id
                        title
                        cover
                    }
                    price
                    discount
                    count
                }
                submition
                totalPrice
                totalWeight
                shippingCost
                discount
                discountCode
                status
                paymentId
                authority
                postVerify
                userId {
                    _id
                    name
                    phone
                    address
                    postCode
                }
                createdAt
            }
            totalPages
            currentPage
            total
        }
    }
`