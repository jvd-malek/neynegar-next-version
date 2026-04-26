export const SEARCH = `
    query SearchProductsAndArticles($query: String!, $page: Int, $limit: Int) {
        searchProducts(query: $query, page: $page, limit: $limit) {
            products {
                _id
                title
                desc
                cover
                majorCat
                minorCat
            }
            totalPages
            currentPage
            total
        }
        searchArticles(query: $query, page: $page, limit: $limit) {
            articles {
                _id
                title
                desc
                cover
                majorCat
                minorCat
                authorId {
                    fullName
                }
            }
            totalPages
            currentPage
            total
        }
    }
`

export const COUNT_TICKET_BY_STATUS = `
    query {
        ticketsByStatus(status: ["در انتظار بررسی", "در حال بررسی", "در انتظار پاسخ شما"]) {
            _id
        }
    }
`;

export const COUNT_ORDER_BY_STATUS = `
        query {
            ordersByStatus(status: ["در حال آماده‌سازی", "در انتظار تایید"]) {
                _id
            }
        }
`;