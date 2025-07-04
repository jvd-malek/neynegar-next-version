export interface Author {
    _id: string;
    firstname: string;
    lastname: string;
    fullName?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Article {
    _id: string;
    authorId: Author;
    title: string;
    minorCat: string;
    majorCat: string;
    desc: string;
    content: string;
    subtitles: string[];
    views: number;
    cover: string;
    images: string[];
    popularity: number;
    comments?: Comment[];
    createdAt?: string;
    updatedAt?: string;
}

export interface Comment {
    _id: string;
    txt: string;
    status: string;
    star: number;
    like: number;
    userId: {
        _id: string;
        name: string;
    };
    replies?: Reply[];
    createdAt?: string;
    updatedAt?: string;
}

export interface Reply {
    txt: string;
    userId: {
        _id: string;
        name: string;
    };
    like: number;
}

export interface PaginatedArticles {
    articles: Article[];
    totalPages: number;
    currentPage: number;
    total: number;
} 