export const GET_TICKETS_BY_USER = `
    query TicketsByUser($page: Int, $limit: Int) {
        ticketsByUser(page: $page, limit: $limit) {
            tickets {
                _id
                response
                status
                title
                txt
                userId {
                    _id
                    name
                    status
                    phone    
                }
                createdAt
                updatedAt
            }
            totalPages
            currentPage
            total
        }
    }
    `