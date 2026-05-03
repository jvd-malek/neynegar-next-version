'use client'

// react
import { useState, useCallback } from 'react';

// utils
import { fetcher, imageUploader } from '@/public/utils/fetcher';
import { notify } from '@/public/utils/notify';
import useSWR from 'swr';

// mui components
import Modal from '@mui/material/Modal';

// components
import PaginationBox from '@/public/components/pagination/PaginationBox'
import SearchBox from '@/public/components/CMS/SearchBox';
import CMSProductCart from '@/public/components/CMS/CMSProductCart';

// types and queries
import { DELETE_PRODUCT, GET_PRODUCTS, UPDATE_PRODUCT, UPDATE_PRODUCT_IMAGES } from '@/public/graphql/productQueries';
import { Product } from '@/public/types/product';
import { linksType } from '@/public/types/links';


interface CMSProductBoxProps {
    type: string;
    page: { page: number; count: number; search: string; };
    links: linksType[];
    authors: any[];
}


function CMSProductBox({ type, page, links, authors }: CMSProductBoxProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const { data, error, isLoading, mutate } = useSWR(
        [GET_PRODUCTS, { page: page.page, limit: page.count, search: page.search }],
        ([query, variables]) => fetcher(query, variables),
        { revalidateOnFocus: false, dedupingInterval: 2000, keepPreviousData: true }
    );

    const handleSave = useCallback(async (productId: string, input: any) => {
        try {
            setIsSaving(true);
            await fetcher(UPDATE_PRODUCT, { id: productId, input });
            mutate();
            notify("تغییرات ذخیره شد", "success");
        } catch (error) {
            console.error(error);
            notify("خطا در ذخیره‌سازی", "error");
        } finally {
            setIsSaving(false);
        }
    }, [mutate]);

    // Image modal handlers (unchanged from original, omitted for brevity)
    const handleImageClick = useCallback((product: Product) => {
        setSelectedProduct(product);
        setImageModalOpen(true);
        setPreviewUrls([]);
        setImageFiles([]);
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setImageFiles(prev => [...prev, ...files]);

            // Create preview URLs for new files
            const newPreviewUrls = files.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
        }
    };

    const handleImageSave = async () => {
        if (!selectedProduct) return;

        try {
            setIsSaving(true);

            // upload and add cover
            let cover = ""
            let images: string[] = []

            const fileFormData = new FormData();

            // Add cover image
            if (imageFiles[0]) {
                fileFormData.append('cover', imageFiles[0]);
            }

            // Add additional images
            if (imageFiles.length > 1) {
                for (let i = 1; i < imageFiles.length; i++) {
                    fileFormData.append('images', imageFiles[i]);
                }
            }

            const fileResult = await imageUploader(fileFormData);

            if (fileResult && typeof fileResult === 'object') {
                cover = fileResult.cover || '';
                images = Array.isArray(fileResult.images) ? fileResult.images : [];
            }

            // Update product with new images using GraphQL mutation
            await fetcher(UPDATE_PRODUCT_IMAGES, {
                id: selectedProduct._id,
                input: {
                    cover: cover || selectedProduct.cover,
                    images: images || selectedProduct.images || []
                }
            });

            await mutate();
            setImageModalOpen(false);
            setImageFiles([]);
            setPreviewUrls([]);
            setSelectedProduct(null);

        } catch (error) {
            console.error('Error updating images:', error);
            alert('خطا در بروزرسانی تصاویر: ' + (error instanceof Error ? error.message : 'خطای ناشناخته'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        try {
            setIsSaving(true);
            await fetcher(DELETE_PRODUCT, {
                id: productId
            });

            await mutate();
            setDeleteModalOpen(false);
            console.log('Product deleted successfully');
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('خطا در حذف محصول: ' + (error instanceof Error ? error.message : 'خطای ناشناخته'));
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

    const products = data?.products;

    return (
        <>
            <div className={`bg-slate-200 relative rounded-xl p-4 lg:col-start-2 col-end-5 col-start-1 lg:row-start-2 row-start-3 pt-20`}>
                <h3 className="absolute top-4 -right-6 text-lg rounded-r-lg rounded-l-xl pr-6 pl-4 py-2 bg-black text-white">{type}</h3>
                <div className="flex justify-center absolute top-4 left-3 items-center gap-2 pl-2 text-white bg-black w-40 rounded-lg shadow-md overflow-hidden">
                    <SearchBox search={page.search} />
                </div>

                {products && products.products.length > 0 ? products.products.map((product: Product) => (
                    <CMSProductCart
                        key={product._id}
                        product={product}
                        links={links}
                        authors={authors}
                        onSave={handleSave}
                        onDelete={(id) => {
                            setSelectedProduct(product);
                            setDeleteModalOpen(true);
                        }}
                        onImageClick={handleImageClick}
                    />
                )) : (
                    <p className="mt-5 bg-white shadow-cs py-2 px-4 rounded-xl text-center">محصولی یافت نشد 😥</p>
                )}

                {products && products.totalPages > 1 && (
                    <div className="mt-4">
                        <PaginationBox count={products.totalPages} currentPage={products.currentPage} />
                    </div>
                )}
            </div>

            {/* Image Edit Modal */}
            <Modal
                open={imageModalOpen}
                onClose={() => {
                    setImageModalOpen(false);
                    setImageFiles([]);
                    setPreviewUrls([]);
                    setSelectedProduct(null);
                }}
            >
                <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white border rounded-lg shadow-lg px-6 py-8 max-w-md mx-auto absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 font-[Vazir] w-[95vw] h-[80vh] overflow-y-scroll scroll-smooth scrollbar-hidden flex flex-col justify-between" dir="rtl">
                    <div>
                        <h3 className="text-lg font-bold mb-4">ویرایش تصاویر محصول</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                تصاویر محصول
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
                                            alt={`Product image ${index + 1}`}
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
                                setSelectedProduct(null);
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
                    setSelectedProduct(null);
                }}
            >
                <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white border rounded-lg shadow-lg px-6 py-8 max-w-md mx-auto absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 font-[Vazir]">
                    <h3 className="text-lg font-bold mb-4">حذف محصول</h3>
                    <p className="mb-6">
                        آیا از حذف محصول "{selectedProduct?.title}" اطمینان دارید؟
                        این عملیات غیرقابل بازگشت است.
                    </p>
                    <div className="flex justify-end gap-4">
                        <button
                            onClick={() => handleDeleteProduct(selectedProduct?._id || '')}
                            disabled={isSaving}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                        >
                            {isSaving ? 'در حال حذف...' : 'حذف'}
                        </button>
                        <button
                            onClick={() => {
                                setDeleteModalOpen(false);
                                setSelectedProduct(null);
                            }}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                            انصراف
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}

export default CMSProductBox;