export const GET_HOME_PAGE_PRODUCTS = `
  query {
    homePageBooks {
      paintBooks {
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
        finalPrice
      }
      
      gallery {
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
        finalPrice
      }
      
      traditionalBooks {
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
        finalPrice
      }
      
      tools {
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
        finalPrice
      }
    }
  }
`;

export const GET_HERO_DATA = `
  query {
    homePageHero {
      caliBooks {
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
        finalPrice
      }
      discountProducts {
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
        finalPrice
      }
      groupDiscounts {
        _id
        title
        majorCat
        minorCat
        brand
        endDate
        isActive
      }
    }
  }
`

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
          count
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
        state
        size
        weight
        majorCat
        minorCat
        cover
        images
        finalPrice
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

export const GET_OFFER_PRODUCTS = `
  query OfferProducts($page: Int, $limit: Int) {
    offer(page: $page, limit: $limit) {
      products {
        _id
        title
        desc
        price { price date }
        discount { discount date }
        popularity
        cover
        brand
        showCount
        majorCat
        minorCat
        finalPrice
        state
      }
      totalPages
      currentPage
      total
    }
  }
`

export const GET_SEARCH_PRODUCTS = `
  query SearchProducts($query: String!, $page: Int, $limit: Int) {
    searchProducts(query: $query, page: $page, limit: $limit) {
      products {
        _id
        title
        desc
        price {price}
        discount {discount date}
        popularity
        cover
        brand
        showCount
        majorCat
        minorCat
        state
        finalPrice
      }
      totalPages
      currentPage
      total
    }
  }
`

export const GET_PRODUCTS_BY_CATEGORY = `
  query ProductsByCategory($majorCat: String!, $minorCat: String, $page: Int, $limit: Int, $search: String, $sort: String, $cat: String) {
    productsByCategory(
      majorCat: $majorCat, 
      minorCat: $minorCat, 
      page: $page, 
      limit: $limit,
      search: $search,
      sort: $sort,
      cat: $cat
      ) {
      products {
        _id
        title
        desc
        price {price}
        discount {discount date}
        popularity
        cover
        brand
        showCount
        majorCat
        minorCat
        state
        finalPrice
      }
      totalPages
      currentPage
      total
    }
  }
`

export const GET_SUGGESTED_PRODUCTS = `
  query GetSuggestedProducts($majorCat: String!, $minorCat: String, $cat: String) {
    suggestedProducts(majorCat: $majorCat, minorCat: $minorCat, cat: $cat) {
      _id
      title
      desc
      price {
        price
      }
      discount {
        discount
        date
      }
      popularity
      cover
      finalPrice
      majorCat
      minorCat
      showCount
      state
    }
  }
`

export const GET_PRODUCT_BY_ID = `
  query GetProduct($id: ID!) {
    product(id: $id) {
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
      }
      authorArticleId {
        _id
        title
        desc
      }
      publisherArticleId {
        _id
        title
        desc
      }
      productArticleId {
        _id
        title
        desc
      }
      publisher
      publishDate
      brand
      status
      state
      size
      weight
      majorCat
      minorCat
      currentPrice
      currentDiscount
      finalPrice
      cover
      images
      createdAt
      updatedAt
    }
  }
`

// mutation

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

export const CREATE_PRODUCT = `
  mutation CreateProduct ($input: ProductInput!) {
    createProduct (input: $input) {
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
    }
  }
`;

export const DELETE_PRODUCT = `
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`

export const UPDATE_PRODUCT_IMAGES = `
  mutation UpdateProductImages($id: ID!, $input: ProductImageInput!) {
    updateProductImages(id: $id, input: $input) {
      _id
      cover
      images
    }
  }
`