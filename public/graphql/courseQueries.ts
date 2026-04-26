export const GET_HOME_PAGE_COURSES = `
    query {
        homePageCourses {
            courses {
                _id
                title
                desc
                category
                articleId { _id title desc }
                relatedProducts {
                    _id
                    title
                    desc
                    price {
                        price
                        date
                    }
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
            }
        }
    }`;

export const GET_RELATED_PRODUCTS_COURSE_BY_CATEGORY = `
    query CoursesByCategory($category: String!) {
        coursesByCategory(category: $category) {
            relatedProducts {
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
                state
            }
        }
    }`;