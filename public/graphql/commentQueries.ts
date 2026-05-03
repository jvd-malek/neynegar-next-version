export const GET_COMMENTS_BY_USER = `
    query CommentsByUser($page: Int, $limit: Int) {
        commentsByUser(page: $page, limit: $limit) {
            comments {
                _id
                txt
                star
                status
                like
                userId {
                    _id
                    name
                    status
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
                    data {
                        _id
                        title
                        cover
                    }
                }
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
                    status
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
                    data {
                        _id
                        title
                        cover
                    }
                }
            }
            totalPages
            currentPage
            total
        }
    }

`

// mutation

export const CREATE_COMMENT = `
    mutation CreateComment($input: CommentInput!) {
        createComment(input: $input) {
            _id
        }
    }
`

export const ADD_REPLY = `
    mutation AddReply($commentId: ID!, $input: ReplyInput!) {
        addReply(commentId: $commentId, input: $input) {
            _id
        }
    }
`

export const CREATE_TICKET = `
    mutation CreateTicket($input: TicketInput!) {
        createTicket(input: $input) {
            _id
        }
    }
`