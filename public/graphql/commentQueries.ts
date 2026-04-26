export const GET_COMMENT_BY_PRODUCT_ID = `
    query CommentsByProduct($id: ID!, $page: Int, $limit: Int) {
        commentsByProduct(productId: $id, page: $page, limit: $limit) {
            comments {
                _id
                txt
                star
                status
                like
                productId { _id }
                articleId { _id }
                userId {
                    _id
                    name
                    phone
                }
                createdAt
                updatedAt
                replies {
                    txt
                    userId {
                        _id
                        status
                        name
                        phone
                    }
                    createdAt
                    like
                }
            }
            totalPages
            currentPage
            total
        }
    }
`

export const GET_COMMENT_BY_ARTICLE_ID = `
    query CommentsByArticle($id: ID!, $page: Int, $limit: Int) {
        commentsByArticle(articleId: $id, page: $page, limit: $limit) {
            comments {
                _id
                txt
                star
                status
                like
                articleId { _id }
                userId {
                    _id
                    name
                    phone
                }
                createdAt
                updatedAt
                replies {
                    txt
                    userId {
                        _id
                        status
                        name
                        phone
                    }
                    createdAt
                    like
                }
            }
            totalPages
            currentPage
            total
        }
    }
`

export const GET_COMMENTS_BY_USER = `
    query CommentsByUser($page: Int, $limit: Int) {
        commentsByUser(page: $page, limit: $limit) {
            comments {
                _id
                txt
                status
                star
                like
                userId {
                    _id
                }
                productId {
                    _id
                    title
                    cover
                }
                replies {
                    txt
                    userId {
                        _id
                        name
                    }
                    like
                    createdAt
                }
                createdAt
            }
            totalPages
            currentPage
            total
        }
    }
`

export const GET_COMMENTS_BY_ID = `
    query CommentsById($type:String!, $id:ID!, $page: Int, $limit: Int) {
        commentsById(type:$type, id:$id ,page: $page, limit: $limit) {
            comments {
                _id
                txt
                star
                status
                like
                userId {
                    _id
                    name
                }
                createdAt
                updatedAt
                replies {
                    txt
                    userId {
                        _id
                        status
                        name
                        phone
                    }
                    createdAt
                    like
                }
              target { 
                type
                refId 
              }
            }
            totalPages
            currentPage
            total
        }
    }

`