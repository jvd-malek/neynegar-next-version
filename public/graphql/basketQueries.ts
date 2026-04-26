export const GET_USER_FULL_BASKET = `
    query GetUserFullBasket {
        userFullBasket {
            user {
                _id
                status
                name
                phone
                address
                postCode
                totalBuy
                discount {
                    code
                    date
                    discount
                    status
                }                                
            }
            basket {
                count
                productId {
                    _id
                    title
                    price
                    discount
                    weight
                    cover
                    showCount
                }
                packageId {
                    _id
                    title
                    price
                    discount
                    weight
                    cover
                    showCount
                }
                currentPrice
                currentDiscount
                itemTotal
                itemDiscount
                itemWeight
            }
            subtotal
            totalDiscount
            total
            totalWeight
            shippingCost
            grandTotal
            state
        }
    }
`

export const GET_LOCAL_BASKET = `
    query GetLocalBasket($basket: [BasketInput!]!) {
        localBasket(basket: $basket) {
            basket {
                count
                productId {
                    _id
                    title
                    price
                    discount
                    weight
                    cover
                    showCount
                }
                packageId {
                    _id
                    title
                    price
                    discount
                    weight
                    cover
                    showCount
                }
                currentPrice
                currentDiscount
                itemTotal
                itemDiscount
                itemWeight
            }
            subtotal
            totalDiscount
            total
            totalWeight
            shippingCost
            grandTotal
            state
        }
    }
`

export const PUSH_PRODUCT_TO_BASKET = `
    mutation PushToBasket($productId: ID!, $count: Int!) {
        pushProductToBasket(productId: $productId, count: $count) {
            _id
            bascket {
                productId { _id }
                packageId { _id }
                count
            }
        }
    }
`

export const PUSH_PACKAGE_TO_BASKET = `
    mutation PushToBasket($packageId: ID!, $count: Int!) {
        pushPackageToBasket(packageId: $packageId, count: $count) {
            _id
            bascket {
                productId { _id }
                packageId { _id }
                count
            }
        }
    }
`

export const PULL_PRODUCT_FROM_BASKET = `
    mutation PullFromBasket($productId: ID!, $count: Int!) {
        pullProductFromBasket(productId: $productId, count: $count) {
            _id
            bascket {
                productId { _id }
                packageId { _id }
                count
            }
        }
    }
`

export const PULL_PACKAGE_FROM_BASKET = `
    mutation PullFromBasket($packageId: ID!, $count: Int!) {
        pullPackageFromBasket(packageId: $packageId, count: $count) {
            _id
            bascket {
                productId { _id }
                packageId { _id }
                count
            }
        }
    }
`
