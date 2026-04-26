export const GET_LINKS = `
    query {
      links {
        _id
        txt
        path
        sort
        subLinks {
          link
          path
          brand
        }
      }
    }
`