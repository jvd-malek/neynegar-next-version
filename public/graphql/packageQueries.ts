export const GET_HOME_PAGE_PACKAGES = `
    query {
        packages(page: 1, limit: 10) {
            packages {
                _id
                title
                desc
                showCount
                popularity
                category
                cover
                state
                discount {
                    discount
                    date
                }
                totalPrice
                finalPrice
                totalProducts
            }
            totalPages
            currentPage
            total
        }
    }
`

export const GET_PACKAGES = `
    query {
        packages($page: Int, $limit: Int) {
            packages(page: $page, limit: $limit) {
                _id
                title
                desc
                showCount
                totalSell
                popularity
                category
                cover
                tags
                state
                products {
                    product {
                        _id
                        title
                        desc
                        price {price}
                        discount {
                            discount
                            date
                        }
                        popularity
                        cover
                        brand
                        showCount
                        majorCat
                        minorCat
                        state
                    }
                    quantity
                }
                discount {
                    discount
                    date
                }
                totalPrice
                finalPrice
                totalProducts
                totalWeight
                discount{discount date}
            }
            totalPages
            currentPage
            total
        }
    }
`

export const GET_PACKAGE_BY_ID = `
    query GetPackage($id: ID!) {
        package(id: $id) {
            _id
            title
            desc
            totalWeight
            finalPrice  
            totalPrice
            totalProducts
            discount {
                discount
                date
            }
            showCount
            totalSell
            popularity
            category
            status
            state
            cover
            products { 
                product {
                    _id
                    title
                    cover
                }
                quantity
            }
        }
    }
`

// mutation

export const CREATE_PACKAGE = `
    mutation CreatePackage ($input: PackageInput!) {
        createPackage (input: $input) {
            _id
            title
            desc
            totalWeight
            finalPrice  
            totalPrice
            totalProducts
            discount {
                discount
                date
            }
            showCount
            totalSell
            popularity
            category
            status
            state
            cover
            products { 
                product {
                    _id
                    title
                }
                quantity
            }
        }
    }
`