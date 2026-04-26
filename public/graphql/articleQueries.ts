export const GET_HOME_PAGE_ARTICLES = `
    query {
        homePageArticles {
            articles {
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
    }
`

export const GET_SEARCH_ARTICLES = `
    query SearchArticles($query: String!, $page: Int, $limit: Int) {
        searchArticles(query: $query, page: $page, limit: $limit) {
            articles {
                _id
                title
                desc
                content
                subtitles
                views
                cover
                images
                popularity
                authorId {
                    _id
                    firstname
                    lastname
                    fullName
                }
                majorCat
                minorCat
                createdAt
                updatedAt
            }
            totalPages
            currentPage
            total
        }
    }
`

export const GET_ARTICLES_BY_CATEGORY = `
     query ArticlesByCategory($majorCat: String!, $minorCat: String, $page: Int, $limit: Int, $search: String, $sort: String, $cat: String) {
        articlesByCategory(
            majorCat: $majorCat, 
            minorCat: $minorCat, 
            page: $page, 
            limit: $limit,
            search: $search,
            sort: $sort,
            cat: $cat
        ) {
            articles {
                _id
                title
                desc
                content
                subtitles
                views
                cover
                images
                popularity
                authorId {
                    _id
                    firstname
                    lastname
                    fullName
                }
                majorCat
                minorCat
                createdAt
                updatedAt
            }
            totalPages
            currentPage
            total
        }
    }
`

export const GET_ARTICLE_BY_ID = `
    query GetArticle($id: ID!) {
        article(id: $id) {
            _id
            title
            desc
            content
            majorCat
            minorCat
            subtitles
            images
            popularity
            views
            authorId {
                _id
                firstname
                lastname
                fullName
            }
            cover
            createdAt
            updatedAt
        }
    }
`

// mutation

export const INCREASE_ARTICLE_VIEW = `
    mutation IncrementArticleViews($id: ID!) {
        incrementArticleViews(id: $id) {
            _id
            views
        }
    }
`