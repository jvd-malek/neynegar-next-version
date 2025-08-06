export const GET_PRODUCTS = `
    query GetProducts($page: Int, $limit: Int, $search: String) {
    products(page: $page, limit: $limit, search: $search) {
      products {
        _id
        title
        desc
        price {
          price
          date
        }
        cost {
          cost
          date
        }
        discount {
          discount
          date
        }
        count
        showCount
        totalSell
        popularity
        authorId {
          _id
          firstname
          lastname
          fullName
        }
        authorArticleId {
          _id
        }
        publisherArticleId {
          _id
        }
        productArticleId {
          _id
        }
        publisher
        publishDate
        brand
        status
        size
        weight
        majorCat
        minorCat
        cover
        images
        comments {
          _id
        }
        createdAt
        updatedAt
      }
      totalPages
      currentPage
      total
    }
  }
`;

export const UPDATE_PRODUCT = `
    mutation UpdateProduct($id: ID!, $input: UpdateProductInput!) {
        updateProduct(id: $id, input: $input) {
            _id
            title
            desc
            price {
                price
                date
            }
            cost {
                cost
                date
            }
            count
            discount {
                discount
                date
            }
            showCount
            popularity
            authorId {
                _id
                fullName
            }
            publisher
            publishDate
            brand
            status
            size
            weight
            majorCat
            minorCat
            cover
            images
            totalSell
        }
    }
`; 