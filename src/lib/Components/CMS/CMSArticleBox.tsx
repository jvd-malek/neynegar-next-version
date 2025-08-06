'use client';

import PaginationBox from '@/lib/Components/Pagination/PaginationBox'
import SearchBox from './SearchBox';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { getCookie } from 'cookies-next';
import { Article } from '@/types/article';
import { Modal } from '@mui/material';
import SearchableAuthorSelect from './SearchableAuthorSelect';
import { fetcher } from '@/lib/fetcher';
import ProductInput from './ProductInput';
import InternalLinkSelector from './InternalLinkSelector';
import LinkPreview from './LinkPreview';

interface CMSArticleBoxProps {
    type: string;
    page: {
        page: number;
        count: number;
        search: string;
    };
    links: any[]
    authors: any
}

const GET_ARTICLES = `
    query GetArticles($page: Int, $limit: Int, $search: String) {
        articles(page: $page, limit: $limit, search: $search) {
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
`;

const UPDATE_ARTICLE = `
    mutation UpdateArticle($id: ID!, $input: ArticleInput!) {
        updateArticle(id: $id, input: $input) {
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
                fullName
            }
            majorCat
            minorCat
        }
    }
`;

const DELETE_ARTICLE = `
    mutation DeleteArticle($id: ID!) {
        deleteArticle(id: $id)
    }
`;

function CMSArticleBox({ type, page, links, authors }: CMSArticleBoxProps) {
    const [editingArticles, setEditingArticles] = useState<Record<string, any>>({});
    const [initialValues, setInitialValues] = useState<Record<string, any>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const variables = {
        page: page.page,
        limit: page.count,
        search: page.search,
    };

    const { data, error, isLoading, mutate } = useSWR(
        [GET_ARTICLES, variables],
        ([query, variables]) => fetcher(query, variables),
        {
            revalidateOnFocus: false,
            dedupingInterval: 2000,
            keepPreviousData: true
        }
    );

    useEffect(() => {
        if (data?.articles?.articles) {
            const newInitialValues: Record<string, any> = {};
            data.articles.articles.forEach((article: Article) => {
                newInitialValues[article._id] = {
                    title: article.title,
                    desc: article.desc,
                    content: article.content,
                    subtitles: article.subtitles,
                    popularity: article.popularity,
                    authorId: article.authorId ? article.authorId._id : "",
                    majorCat: article.majorCat,
                    minorCat: article.minorCat
                };
            });
            setInitialValues(newInitialValues);
        }
    }, [data]);

    const handleAddLinkToDescription = (articleId: string, link: string) => {
        const currentDesc = editingArticles[articleId]?.desc ?? initialValues[articleId]?.desc ?? '';
        const newDesc = currentDesc + ' ' + link;
        handleFieldChange(articleId, 'desc', newDesc);
    };

    const handleAddLinkToContent = (articleId: string, contentIndex: number, link: string) => {
        const currentContent = editingArticles[articleId]?.content ?? initialValues[articleId]?.content ?? [];
        const newContent = [...currentContent];
        
        // Ensure the content array has enough elements
        while (newContent.length <= contentIndex) {
            newContent.push('');
        }
        
        // Add the link to the specific section
        const currentSectionContent = newContent[contentIndex] || '';
        newContent[contentIndex] = currentSectionContent + ' ' + link;
        
        handleFieldChange(articleId, 'content', newContent);
    };

    // Function to add a new subtitle section
    const handleAddNewSubtitle = (articleId: string) => {
        const currentSubtitles = editingArticles[articleId]?.subtitles ?? initialValues[articleId]?.subtitles ?? [];
        const newSubtitles = [...currentSubtitles, ''];
        
        setEditingArticles(prev => ({
            ...prev,
            [articleId]: {
                ...prev[articleId],
                subtitles: newSubtitles
            }
        }));
    };

    // Function to add a new content section
    const handleAddNewContent = (articleId: string) => {
        const currentContent = editingArticles[articleId]?.content ?? initialValues[articleId]?.content ?? [];
        const newContent = [...currentContent, ''];
        
        setEditingArticles(prev => ({
            ...prev,
            [articleId]: {
                ...prev[articleId],
                content: newContent
            }
        }));
    };

    const handleFieldChange = (articleId: string, field: string, value: any, index?: number) => {
        setErrors(prev => ({
            ...prev,
            [articleId]: {
                ...prev[articleId],
                [field]: ''
            }
        }));

        setEditingArticles(prev => {
            const currentArticle = prev[articleId] || {};
            const currentValue = currentArticle[field] || initialValues[articleId]?.[field];

            if (index !== undefined && Array.isArray(currentValue)) {
                // Handle array fields (subtitles and content)
                const newArray = [...currentValue];
                // Ensure the value is always a string and only update the specific index
                newArray[index] = String(value || '');
                return {
                    ...prev,
                    [articleId]: {
                        ...currentArticle,
                        [field]: newArray
                    }
                };
            } else if (Array.isArray(value)) {
                // Handle when the entire array is passed (like in handleAddLinkToContent)
                return {
                    ...prev,
                    [articleId]: {
                        ...currentArticle,
                        [field]: value
                    }
                };
            }

            return {
                ...prev,
                [articleId]: {
                    ...currentArticle,
                    [field]: value
                }
            };
        });
    };

    const handleFieldFocus = (articleId: string, field: string, value: any) => {
        setErrors(prev => ({
            ...prev,
            [articleId]: {
                ...prev[articleId],
                [field]: ''
            }
        }));
    };

    const handleSaveChanges = async (articleId: string) => {
        try {
            setIsSaving(true);
            const currentArticle = data?.articles?.articles?.find((a: Article) => a._id === articleId);
            const editedArticle = editingArticles[articleId];

            if (!currentArticle || !editedArticle) {
                console.log('Article not found');
                return;
            }

            const input = {
                title: editedArticle.title ?? currentArticle.title,
                desc: editedArticle.desc ?? currentArticle.desc,
                content: editedArticle.content ?? currentArticle.content,
                subtitles: editedArticle.subtitles ?? currentArticle.subtitles,
                popularity: Number(editedArticle.popularity ?? currentArticle.popularity),
                authorId: currentArticle.authorId._id,
                majorCat: editedArticle.majorCat ?? currentArticle.majorCat,
                minorCat: editedArticle.minorCat ?? currentArticle.minorCat,
                cover: currentArticle.cover,
                images: currentArticle.images
            };

            await fetcher(UPDATE_ARTICLE, {
                id: articleId,
                input
            });

            setEditingArticles(prev => {
                const newState = { ...prev };
                delete newState[articleId];
                return newState;
            });

            setErrors(prev => {
                const newState = { ...prev };
                delete newState[articleId];
                return newState;
            });

            await mutate();

            console.log('Article updated successfully');
        } catch (error) {
            console.error('Error updating article:', error);
            alert('خطا در ذخیره اطلاعات: ' + (error instanceof Error ? error.message : 'خطای ناشناخته'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageClick = (article: Article) => {
        setSelectedArticle(article);
        setImageModalOpen(true);
        setPreviewUrls([]);
        setImageFiles([]);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setImageFiles(prev => [...prev, ...files]);

            const newPreviewUrls = files.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
        }
    };

    const handleImageSave = async () => {
        if (!selectedArticle) return;

        try {
            setIsSaving(true);
            const fileFormData = new FormData();

            if (imageFiles[0]) {
                fileFormData.append('cover', imageFiles[0]);
            }

            if (imageFiles.length > 1) {
                for (let i = 1; i < imageFiles.length; i++) {
                    fileFormData.append('images', imageFiles[i]);
                }
            }

            const jwt = getCookie("jwt") as string;
            if (!jwt) {
                throw new Error('No authentication token found');
            }

            const fileResponse = await fetch('https://api.neynegar1.ir/upload', {
                method: 'POST',
                headers: {
                    'authorization': jwt,
                    'Accept': 'application/json'
                },
                body: fileFormData
            });

            if (!fileResponse.ok) {
                throw new Error('Failed to upload files');
            }

            const fileResult = await fileResponse.json();

            const response = await fetch('https://api.neynegar1.ir/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': jwt
                },
                body: JSON.stringify({
                    query: `
                        mutation UpdateArticleImages($id: ID!, $input: ArticleImageInput!) {
                            updateArticleImages(id: $id, input: $input) {
                                _id
                                cover
                                images
                            }
                        }
                    `,
                    variables: {
                        id: selectedArticle._id,
                        input: {
                            cover: fileResult.cover || selectedArticle.cover,
                            images: fileResult.images || []
                        }
                    }
                })
            });

            const result = await response.json();
            if (result.errors) {
                throw new Error(result.errors[0].message);
            }

            await mutate();
            setImageModalOpen(false);
            setImageFiles([]);
            setPreviewUrls([]);
            setSelectedArticle(null);

        } catch (error) {
            console.error('Error updating images:', error);
            alert('خطا در بروزرسانی تصاویر: ' + (error instanceof Error ? error.message : 'خطای ناشناخته'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteArticle = async (articleId: string) => {
        try {
            setIsSaving(true);
            await fetcher(DELETE_ARTICLE, {
                id: articleId
            });

            await mutate();
            setDeleteModalOpen(false);
            console.log('Article deleted successfully');
        } catch (error) {
            console.error('Error deleting article:', error);
            alert('خطا در حذف مقاله: ' + (error instanceof Error ? error.message : 'خطای ناشناخته'));
        } finally {
            setIsSaving(false);
        }
    };

    if (error) {
        return (
            <div className="bg-slate-200 relative rounded-xl p-4 lg:col-start-2 col-end-5 col-start-1 lg:row-start-1 row-start-2 pt-20">
                <div className="flex justify-center items-center h-40">
                    <p className="text-red-500">خطا در دریافت اطلاعات</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="bg-slate-200 relative rounded-xl p-4 lg:col-start-2 col-end-5 col-start-1 lg:row-start-1 row-start-2 pt-20">
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
                </div>
            </div>
        );
    }

    const articles = data?.articles;

    return (
        <>
            <div className={`bg-slate-200 relative rounded-xl p-4 lg:col-start-2 col-end-5 col-start-1 lg:row-start-1 row-start-2 pt-20`}>
                <h3 className="absolute top-4 -right-6 text-lg rounded-r-lg rounded-l-xl pr-6 pl-4 py-2 bg-black text-white">
                    {type}
                </h3>

                <div className="flex justify-center absolute top-4 left-3 items-center gap-2 pl-2 text-white bg-black w-40 rounded-lg shadow-md overflow-hidden">
                    <SearchBox search={page.search} />
                </div>

                {(articles && articles.articles.length > 0) ? articles.articles.map((article: Article) => {
                    const isEditing = !!editingArticles[article._id];
                    const articleErrors = errors[article._id] || {};
                    const initialArticleValues = initialValues[article._id];

                    return (
                        <div className="mt-5 bg-white shadow-cs py-2 px-4 rounded-xl flex flex-col gap-3" key={article._id}>
                            <div className="flex justify-between items-center gap-2">
                                <img
                                    src={`https://api.neynegar1.ir/uploads/${article.cover}`}
                                    alt={article.title}
                                    className='w-20 rounded-lg h-20 object-cover cursor-pointer hover:opacity-80 transition-opacity'
                                    onClick={() => handleImageClick(article)}
                                />
                                <h2 className="md:text-lg text-shadow">{article.title}</h2>
                            </div>
                            <div className="overflow-x-auto scrollable-section relative">
                                <div className="flex gap-4 pb-4 w-max">
                                    <ProductInput
                                        label="عنوان"
                                        value={editingArticles[article._id]?.title ?? initialArticleValues?.title}
                                        onChange={(value) => handleFieldChange(article._id, 'title', value)}
                                        onFocus={() => handleFieldFocus(article._id, 'title', editingArticles[article._id]?.title ?? initialArticleValues?.title)}
                                        error={articleErrors.title}
                                    />

                                    <div className="flex flex-col gap-1 w-20 sm:w-46">
                                        <label className="text-xs sm:text-sm text-gray-700 text-shadow">توضیحات</label>
                                        <div className="text-xs text-blue-600 mb-2">
                                            💡 برای لینک خارجی: [متن نمایشی](https://example.com)<br/>
                                            💡 برای لینک داخلی: [متن نمایشی](/article/ARTICLE_ID) یا [متن نمایشی](/product/PRODUCT_ID)
                                        </div>
                                        
                                        {/* Internal Link Selectors */}
                                        <div className="flex gap-2 mb-2">
                                            <div className="flex-1">
                                                <InternalLinkSelector
                                                    type="article"
                                                    placeholder="جستجوی مقاله..."
                                                    onSelect={(link) => {
                                                        handleAddLinkToDescription(article._id, link);
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <InternalLinkSelector
                                                    type="product"
                                                    placeholder="جستجوی محصول..."
                                                    onSelect={(link) => {
                                                        handleAddLinkToDescription(article._id, link);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        
                                        <ProductInput
                                            label=""
                                            value={editingArticles[article._id]?.desc ?? initialArticleValues?.desc}
                                            type="textarea"
                                            onChange={(value) => handleFieldChange(article._id, 'desc', value)}
                                            onFocus={() => handleFieldFocus(article._id, 'desc', editingArticles[article._id]?.desc ?? initialArticleValues?.desc)}
                                            error={articleErrors.desc}
                                        />
                                        
                                        {/* Link Preview for Description */}
                                        <LinkPreview 
                                            content={(editingArticles[article._id]?.desc ?? initialArticleValues?.desc ?? '') || ''} 
                                            title="پیش‌نمایش لینک‌های توضیحات"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1 w-20 sm:w-46">
                                        <label className="text-xs sm:text-sm text-gray-700 text-shadow">عناوین فرعی</label>
                                        <div className="flex flex-col gap-2">
                                            {(editingArticles[article._id]?.subtitles ?? initialArticleValues?.subtitles ?? []).map((subtitle: string, index: number) => (
                                                <ProductInput
                                                    key={index}
                                                    label={`عنوان فرعی ${index + 1}`}
                                                    value={subtitle}
                                                    onChange={(value) => handleFieldChange(article._id, 'subtitles', value, index)}
                                                    onFocus={() => handleFieldFocus(article._id, 'subtitles', subtitle)}
                                                    error={articleErrors.subtitles}
                                                    form={true}
                                                />
                                            ))}
                                            <button
                                                onClick={() => handleAddNewSubtitle(article._id)}
                                                className="text-sm text-blue-500 hover:text-blue-600"
                                            >
                                                + افزودن عنوان فرعی
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1 w-20 sm:w-46">
                                        <label className="text-xs sm:text-sm text-gray-700 text-shadow">محتوا</label>
                                        <div className="text-xs text-blue-600 mb-2">
                                            💡 برای لینک خارجی: [متن نمایشی](https://example.com)<br/>
                                            💡 برای لینک داخلی: [متن نمایشی](/article/ARTICLE_ID) یا [متن نمایشی](/product/PRODUCT_ID)
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            {(editingArticles[article._id]?.content ?? initialArticleValues?.content ?? []).map((content: string, index: number) => (
                                                <div key={index} className="border border-gray-200 rounded-lg p-3">
                                                    <div className="text-xs text-gray-600 mb-2">بخش {index + 1}</div>
                                                    
                                                    {/* Internal Link Selectors for this content section */}
                                                    <div className="flex gap-2 mb-2">
                                                        <div className="flex-1">
                                                            <InternalLinkSelector
                                                                type="article"
                                                                placeholder="جستجوی مقاله..."
                                                                onSelect={(link) => {
                                                                    handleAddLinkToContent(article._id, index, link);
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <InternalLinkSelector
                                                                type="product"
                                                                placeholder="جستجوی محصول..."
                                                                onSelect={(link) => {
                                                                    handleAddLinkToContent(article._id, index, link);
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    
                                                    <ProductInput
                                                        label=""
                                                        value={content || ''}
                                                        type="textarea"
                                                        onChange={(value) => handleFieldChange(article._id, 'content', value, index)}
                                                        onFocus={() => handleFieldFocus(article._id, 'content', content)}
                                                        error={articleErrors.content}
                                                        form={true}
                                                    />
                                                    
                                                    {/* Link Preview for Content */}
                                                    <LinkPreview 
                                                        content={content || ''} 
                                                        title={`پیش‌نمایش لینک‌های بخش ${index + 1}`}
                                                    />
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => handleAddNewContent(article._id)}
                                                className="text-sm text-blue-500 hover:text-blue-600"
                                            >
                                                + افزودن بخش جدید
                                            </button>
                                        </div>
                                    </div>

                                    <ProductInput
                                        label="محبوبیت"
                                        value={editingArticles[article._id]?.popularity ?? initialArticleValues?.popularity}
                                        type="number"
                                        onChange={(value) => handleFieldChange(article._id, 'popularity', value)}
                                        onFocus={() => handleFieldFocus(article._id, 'popularity', editingArticles[article._id]?.popularity ?? initialArticleValues?.popularity)}
                                        error={articleErrors.popularity}
                                    />

                                    <SearchableAuthorSelect
                                        value={editingArticles[article._id]?.authorId ?? (article.authorId ? article.authorId._id : '')}
                                        onChange={(value) => handleFieldChange(article._id, 'authorId', value)}
                                        onFocus={() => handleFieldFocus(article._id, 'authorId', editingArticles[article._id]?.authorId ?? article.authorId?._id)}
                                        error={articleErrors.authorId}
                                        authors={authors}
                                    />

                                    <ProductInput
                                        label="دسته‌بندی اصلی"
                                        value={editingArticles[article._id]?.majorCat ?? initialArticleValues?.majorCat}
                                        type="select"
                                        options={links.map(link => ({ value: link.txt, label: link.txt }))}
                                        onChange={(value) => handleFieldChange(article._id, 'majorCat', value)}
                                        onFocus={() => handleFieldFocus(article._id, 'majorCat', editingArticles[article._id]?.majorCat ?? initialArticleValues?.majorCat)}
                                        error={articleErrors.majorCat}
                                    />

                                    <ProductInput
                                        label="دسته‌بندی فرعی"
                                        value={editingArticles[article._id]?.minorCat ?? initialArticleValues?.minorCat}
                                        type="select"
                                        options={links.find(l => l.txt === (editingArticles[article._id]?.majorCat ?? initialArticleValues?.majorCat))?.subLinks?.map((sl: any) => ({
                                            value: sl.link,
                                            label: sl.link
                                        })) ?? []}
                                        onChange={(value) => handleFieldChange(article._id, 'minorCat', value)}
                                        onFocus={() => handleFieldFocus(article._id, 'minorCat', editingArticles[article._id]?.minorCat ?? initialArticleValues?.minorCat)}
                                        error={articleErrors.minorCat}
                                    />

                                    <div className="flex flex-col gap-1 w-20 sm:w-46">
                                        <label className="text-xs sm:text-sm text-gray-700 text-shadow">بازدید</label>
                                        <div className="rounded-lg p-1.5 sm:p-2 border bg-slate-50 text-xs sm:text-sm focus:outline-none w-full h-8.5 sm:h-10 border-gray-300">
                                            {article.views}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex md:justify-end justify-center gap-2 mt-4">
                                {isEditing && (
                                    <button
                                        className="px-4 py-2 rounded text-white bg-green-500 hover:bg-green-600"
                                        onClick={() => handleSaveChanges(article._id)}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                                    </button>
                                )}
                                <button
                                    className="bg-red-500 cursor-pointer text-white px-4 py-1.5 rounded hover:bg-red-600"
                                    onClick={() => {
                                        setSelectedArticle(article);
                                        setDeleteModalOpen(true);
                                    }}
                                    disabled={isSaving}
                                >
                                    حذف مقاله
                                </button>
                            </div>
                        </div>
                    );
                }) :
                    <p className="mt-5 bg-white shadow-cs py-2 px-4 rounded-xl text-center">مقاله‌ای یافت نشد 😥</p>
                }

                {/* Pagination */}
                {articles && articles.totalPages > 1 && (
                    <div className="mt-4">
                        <PaginationBox
                            count={articles.totalPages}
                            currentPage={articles.currentPage}
                        />
                    </div>
                )}

                {/* Image Edit Modal */}
                <Modal
                    open={imageModalOpen}
                    onClose={() => {
                        setImageModalOpen(false);
                        setImageFiles([]);
                        setPreviewUrls([]);
                        setSelectedArticle(null);
                    }}
                >
                    <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white border rounded-lg shadow-lg px-6 py-8 max-w-md mx-auto absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 font-[Vazir] w-[95vw] h-[80vh] overflow-y-scroll scroll-smooth scrollbar-hidden flex flex-col justify-between" dir="rtl">
                        <div>
                            <h3 className="text-lg font-bold mb-4">ویرایش تصاویر مقاله</h3>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    تصاویر مقاله
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="block w-full text-sm text-gray-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-full file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-black file:text-white
                                        hover:file:bg-gray-800"
                                />
                            </div>
                            {previewUrls.length > 0 && (
                                <div className="mt-4 grid grid-cols-4 gap-4">
                                    {previewUrls.map((image: string, index: number) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={image}
                                                alt={`Article image ${index + 1}`}
                                                className={`w-full h-24 object-cover rounded-lg ${index === 0 ? 'ring-2 ring-blue-500' : ''}`}
                                            />
                                            {index === 0 && (
                                                <div className="absolute top-0 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-tl-lg rounded-br-lg">
                                                    کاور
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newFiles = [...imageFiles];
                                                    const newPreviews = [...previewUrls];
                                                    newFiles.splice(index, 1);
                                                    newPreviews.splice(index, 1);
                                                    setImageFiles(newFiles);
                                                    setPreviewUrls(newPreviews);
                                                }}
                                                className="absolute cursor-pointer -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 w-6 h-6 flex justify-center items-center"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-4 mt-4">
                            <button
                                onClick={handleImageSave}
                                disabled={isSaving}
                                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                            >
                                {isSaving ? 'در حال ذخیره...' : 'ذخیره تصاویر'}
                            </button>
                            <button
                                onClick={() => {
                                    setImageModalOpen(false);
                                    setImageFiles([]);
                                    setPreviewUrls([]);
                                    setSelectedArticle(null);
                                }}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                            >
                                انصراف
                            </button>
                        </div>
                    </div>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal
                    open={deleteModalOpen}
                    onClose={() => {
                        setDeleteModalOpen(false);
                        setSelectedArticle(null);
                    }}
                >
                    <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white border rounded-lg shadow-lg px-6 py-8 max-w-md mx-auto absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 font-[Vazir]">
                        <h3 className="text-lg font-bold mb-4">حذف مقاله</h3>
                        <p className="mb-6">
                            آیا از حذف مقاله "{selectedArticle?.title}" اطمینان دارید؟
                            این عملیات غیرقابل بازگشت است.
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => handleDeleteArticle(selectedArticle?._id || '')}
                                disabled={isSaving}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                            >
                                {isSaving ? 'در حال حذف...' : 'حذف'}
                            </button>
                            <button
                                onClick={() => {
                                    setDeleteModalOpen(false);
                                    setSelectedArticle(null);
                                }}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                            >
                                انصراف
                            </button>
                        </div>
                    </div>
                </Modal>
            </div>
        </>
    );
}

export default CMSArticleBox;