export interface ValidationRule {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    patternMessage?: string;
    message?: string;
}

export interface Price {
    price: number;
    date: string;
}

export interface Cost {
    cost: number;
    date: string;
    count: number;
}

export interface Discount {
    discount: number;
    date: number;
}

export interface Author {
    _id: string;
    fullName: string;
}

export interface ProductInput {
    title: string;
    desc: string;
    price: Price;
    cost: Cost;
    count: number;
    discount: Discount;
    showCount: number;
    popularity: number;
    authorId: string;
    publisher: string;
    publishDate: string;
    brand: string;
    status: string;
    state: string;
    size: string;
    weight: number;
    majorCat: string;
    minorCat: string;
    cover: string;
    images: string[];
}

export interface Product {
    _id: string;
    authorId: Author;
    totalSell: number;
    title: string;
    desc: string;
    price: Price[];
    cost: Cost[];
    count: number;
    discount: Discount[];
    showCount: number;
    popularity: number;
    publisher: string;
    publishDate: string;
    brand: string;
    status: string;
    state?: string;
    size: string;
    weight: number;
    majorCat: string;
    minorCat: string;
    cover: string;
    images: string[];
}

export interface ProductsData {
    products: Product[];
    totalPages: number;
    currentPage: number;
}

export interface ProductsResponse {
    data: {
        products: ProductsData;
    };
}

// برای استفاده در فرم ویرایش
export interface ProductFormData {
    title: string;
    desc: string;
    price: number;
    cost: number;
    costCount: number;
    count: number;
    discount: number;
    showCount: number;
    popularity: number;
    authorId: string;
    publisher: string;
    publishDate: string;
    brand: string;
    status: string;
    state: string;
    size: string;
    weight: number;
    majorCat: string;
    minorCat: string;
} 