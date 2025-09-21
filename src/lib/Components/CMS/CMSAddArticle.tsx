'use client';

import { useState } from 'react';
import { getCookie } from 'cookies-next';
import SearchableAuthorSelect from './SearchableAuthorSelect';
import ProductInput from './ProductInput';
import { linksType } from '@/lib/Types/links';
import InternalLinkSelector from './InternalLinkSelector';
import LinkPreview from './LinkPreview';

const ADD_ARTICLE = `
    mutation CreateArticle($input: ArticleInput!) {
        createArticle(input: $input) {
            _id
            title
            desc
            content
            subtitles
            cover
            images
            majorCat
            minorCat
            authorId {
                _id
                fullName
            }
        }
    }
`;

interface ContentSection {
    content: string;
    subtitle: string;
    image: string;
}

function CMSAddArticle({ links = [], authors = [] }: { links: linksType[], authors: any }) {
    const [formData, setFormData] = useState<Record<string, any>>({
        title: '',
        desc: '',
        majorCat: '',
        minorCat: '',
        authorId: '',
        contentSections: [{ content: '', subtitle: '', image: '' }]
    });

    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [showErrorBox, setShowErrorBox] = useState(false);
    const [aiTopic, setAiTopic] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState<boolean>(false);

    const handleFieldChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleContentSectionChange = (index: number, field: string, value: string) => {
        const newSections = [...formData.contentSections];
        newSections[index] = {
            ...newSections[index],
            [field]: value
        };
        setFormData(prev => ({
            ...prev,
            contentSections: newSections
        }));
    };

    const addContentSection = () => {
        setFormData(prev => ({
            ...prev,
            contentSections: [...prev.contentSections, { content: '', subtitle: '', image: '' }]
        }));
    };

    const removeContentSection = (index: number) => {
        const newSections = formData.contentSections.filter((_: ContentSection, i: number) => i !== index);
        setFormData(prev => ({
            ...prev,
            contentSections: newSections
        }));
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        let isValid = true;

        if (!formData.title) {
            newErrors.title = 'عنوان مقاله الزامی است';
            isValid = false;
        }
        if (!formData.desc) {
            newErrors.desc = 'توضیحات مقاله الزامی است';
            isValid = false;
        }
        if (!formData.majorCat) {
            newErrors.majorCat = 'دسته‌بندی اصلی الزامی است';
            isValid = false;
        }
        if (!formData.minorCat) {
            newErrors.minorCat = 'دسته‌بندی فرعی الزامی است';
            isValid = false;
        }
        if (!formData.authorId) {
            newErrors.authorId = 'نویسنده الزامی است';
            isValid = false;
        }

        formData.contentSections.forEach((section: ContentSection, index: number) => {
            if (!section.content) {
                newErrors[`content_${index}`] = 'محتوا الزامی است';
                isValid = false;
            }
            if (!section.subtitle) {
                newErrors[`subtitle_${index}`] = 'عنوان زیرمجموعه الزامی است';
                isValid = false;
            }
        });

        if (imageFiles.length === 0) {
            newErrors.imageFiles = 'حداقل یک تصویر برای مقاله الزامی است';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleGenerate = async () => {
        if (!aiTopic || aiTopic.trim().length === 0) {
            setShowErrorBox(true);
            setErrors(prev => ({ ...prev, aiTopic: 'موضوع برای تولید خودکار الزامی است' }));
            return;
        }
        try {
            setIsGenerating(true);
            setShowErrorBox(false);
            setErrors(prev => ({ ...prev, aiTopic: '' }));

            const res = await fetch('/api/generate-article', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: aiTopic })
            });
            if (!res.ok) {
                const detail = await res.json().catch(() => ({}));
                throw new Error(detail?.error || 'خطا در تولید محتوا');
            }
            const data: { desc: string; sections: { subtitle: string; content: string }[] } = await res.json();

            setFormData(prev => ({
                ...prev,
                desc: data.desc || prev.desc,
                contentSections: (Array.isArray(data.sections) && data.sections.length > 0)
                    ? data.sections.map(s => ({ content: s.content || '', subtitle: s.subtitle || '', image: '' }))
                    : prev.contentSections
            }));
        } catch (e: any) {
            setShowErrorBox(true);
            setErrors(prev => ({ ...prev, ai: e?.message || 'خطای ناشناخته در تولید محتوا' }));
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = async () => {
        try {
            if (!validateForm()) {
                setShowErrorBox(true);
                return;
            }

            setIsSaving(true);

            // Handle file uploads
            const uploadedFiles = {
                cover: '',
                images: [] as string[]
            };

            if (imageFiles && imageFiles.length > 0) {
                const fileFormData = new FormData();

                // Add cover image
                if (imageFiles[0]) {
                    fileFormData.append('cover', imageFiles[0]);
                }

                // Add additional images
                if (imageFiles.length > 1) {
                    for (let i = 1; i < imageFiles.length; i++) {
                        if (imageFiles[i]) {
                            fileFormData.append('images', imageFiles[i]);
                        }
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
                uploadedFiles.cover = fileResult.cover || '';
                uploadedFiles.images = Array.isArray(fileResult.images) ? fileResult.images : [];
            }

            // Prepare article data
            const articleData = {
                title: formData.title,
                desc: formData.desc,
                majorCat: formData.majorCat,
                minorCat: formData.minorCat,
                authorId: formData.authorId,
                cover: uploadedFiles.cover,
                images: uploadedFiles.images,
                content: formData.contentSections.map((section: ContentSection) => section.content),
                subtitles: formData.contentSections.map((section: ContentSection) => section.subtitle)
            };

            const jwt = getCookie("jwt") as string;
            if (!jwt) {
                throw new Error('No authentication token found');
            }

            const response = await fetch('https://api.neynegar1.ir/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': jwt
                },
                body: JSON.stringify({
                    query: ADD_ARTICLE,
                    variables: {
                        input: articleData
                    }
                })
            });

            const result = await response.json();

            if (result.errors) {
                throw new Error(result.errors[0].message);
            }

            alert('مقاله با موفقیت اضافه شد');

            // Reset form
            setFormData({
                title: '',
                desc: '',
                majorCat: '',
                minorCat: '',
                authorId: '',
                contentSections: [{ content: '', subtitle: '', image: '' }]
            });
            setImageFiles([]);
            setPreviewUrls([]);
            setErrors({});

        } catch (error: any) {
            console.error('Error in handleSubmit:', error);
            alert('خطا در افزودن مقاله: ' + (error instanceof Error ? error.message : 'خطای ناشناخته'));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-slate-200 relative rounded-xl p-4 lg:col-start-2 col-end-5 col-start-1 lg:row-start-1 row-start-2 pt-20">
            {showErrorBox && Object.keys(errors).length > 0 && (
                <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50 max-w-md">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold mb-2">لطفاً خطاهای زیر را برطرف کنید:</h3>
                            <ul className="list-disc list-inside">
                                {Object.entries(errors)
                                    .filter(([_, message]) => message)
                                    .map(([field, message]) => (
                                        <li key={field} className="mb-1">
                                            {message}
                                        </li>
                                    ))}
                            </ul>
                        </div>
                        <button
                            onClick={() => setShowErrorBox(false)}
                            className="text-red-700 hover:text-red-900 font-bold"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
            <h3 className="absolute top-4 -right-6 text-lg rounded-r-lg rounded-l-xl pr-6 pl-4 py-2 bg-black text-white">
                افزودن مقاله جدید
            </h3>

            <div className="mt-5 py-4 px-8 rounded-xl">
                <div className="grid md:grid-cols-2 grid-cols-1 justify-between items-start gap-x-8 gap-y-4 pb-4 w-full mx-auto">
                    <div className="col-span-2 grid md:grid-cols-3 grid-cols-1 gap-3 items-end">
                        <ProductInput
                            form
                            label="موضوع مقاله (تولید خودکار با هوش مصنوعی)"
                            value={aiTopic}
                            onChange={(value) => setAiTopic(String(value))}
                            error={errors.aiTopic}
                        />
                        <div className="md:col-span-1 col-span-1 flex gap-2">
                            <button
                                type="button"
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="w-full py-2 px-4 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
                            >
                                {isGenerating ? 'در حال تولید...' : 'تولید با AI'}
                            </button>
                        </div>
                    </div>

                    <ProductInput
                        form
                        label="عنوان"
                        value={formData.title}
                        onChange={(value) => handleFieldChange('title', value)}
                        error={errors.title}
                    />

                    <ProductInput
                        form
                        label="توضیحات"
                        value={formData.desc}
                        type="textarea"
                        onChange={(value) => handleFieldChange('desc', value)}
                        error={errors.desc}
                    />

                    {/* Internal Link Selectors for Description */}
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            افزودن لینک داخلی به توضیحات
                        </label>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <InternalLinkSelector
                                    type="article"
                                    placeholder="جستجوی مقاله..."
                                    onSelect={(link) => {
                                        handleFieldChange('desc', formData.desc + ' ' + link);
                                    }}
                                />
                            </div>
                            <div className="flex-1">
                                <InternalLinkSelector
                                    type="product"
                                    placeholder="جستجوی محصول..."
                                    onSelect={(link) => {
                                        handleFieldChange('desc', formData.desc + ' ' + link);
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Link Preview for Description */}
                    <div className="col-span-2">
                        <LinkPreview 
                            content={formData.desc || ''} 
                            title="پیش‌نمایش لینک‌های توضیحات"
                        />
                    </div>

                    <ProductInput
                        form
                        label="دسته‌بندی اصلی"
                        value={formData.majorCat}
                        type="select"
                        options={[
                            { value: "", label: "انتخاب کنید" },
                            ...links.map(l => ({ value: l.txt, label: l.txt }))
                        ]}
                        onChange={(value) => handleFieldChange('majorCat', value)}
                        error={errors.majorCat}
                    />

                    <ProductInput
                        form
                        label="دسته‌بندی فرعی"
                        value={formData.minorCat}
                        type="select"
                        disabled={!formData.majorCat}
                        options={[
                            { value: "", label: "انتخاب کنید" },
                            ...links.find(l => l.txt === formData.majorCat)?.subLinks?.map(sl => ({
                                value: sl.link,
                                label: sl.link
                            })) || []
                        ]}
                        onChange={(value) => handleFieldChange('minorCat', value)}
                        error={errors.minorCat}
                    />

                    <SearchableAuthorSelect
                        value={formData.authorId}
                        onChange={(value) => handleFieldChange('authorId', value)}
                        authors={authors}
                        error={errors.authorId}
                        form
                    />

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            تصاویر مقاله
                        </label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => {
                                const files = Array.from(e.target.files || []);
                                setImageFiles(prev => [...prev, ...files]);
                                const newPreviewUrls = files.map(file => URL.createObjectURL(file));
                                setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
                            }}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-black file:text-white
                                hover:file:bg-gray-800"
                        />
                        {errors.imageFiles && (
                            <p className="mt-1 text-sm text-red-600">{errors.imageFiles}</p>
                        )}
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

                    {formData.contentSections.map((section: ContentSection, index: number) => (
                        <div key={index} className="col-span-2 border border-gray-300 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-lg font-medium">بخش {index + 1}</h4>
                                {index > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => removeContentSection(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        حذف بخش
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4">
                                <ProductInput
                                    form
                                    label="عنوان زیرمجموعه"
                                    value={section.subtitle}
                                    onChange={(value) => handleContentSectionChange(index, 'subtitle', String(value))}
                                    error={errors[`subtitle_${index}`]}
                                />

                                <ProductInput
                                    form
                                    label="محتوا"
                                    value={section.content}
                                    type="textarea"
                                    onChange={(value) => handleContentSectionChange(index, 'content', String(value))}
                                    error={errors[`content_${index}`]}
                                />
                                
                                {/* Internal Link Selectors for Content */}
                                <div className="mt-2">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        افزودن لینک داخلی
                                    </label>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <InternalLinkSelector
                                                type="article"
                                                placeholder="جستجوی مقاله..."
                                                onSelect={(link) => {
                                                    const newContent = section.content + ' ' + link;
                                                    handleContentSectionChange(index, 'content', newContent);
                                                }}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <InternalLinkSelector
                                                type="product"
                                                placeholder="جستجوی محصول..."
                                                onSelect={(link) => {
                                                    const newContent = section.content + ' ' + link;
                                                    handleContentSectionChange(index, 'content', newContent);
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="text-xs text-blue-600 mb-2 -mt-2">
                                    💡 برای لینک خارجی: [متن نمایشی](https://example.com)<br/>
                                    💡 برای لینک داخلی: [متن نمایشی](/article/ARTICLE_ID) یا [متن نمایشی](/product/PRODUCT_ID)
                                </div>
                                
                                {/* Link Preview for Content */}
                                <LinkPreview 
                                    content={section.content || ''} 
                                    title={`پیش‌نمایش لینک‌های بخش ${index + 1}`}
                                />
                            </div>
                        </div>
                    ))}

                    <div className="col-span-2">
                        <button
                            type="button"
                            onClick={addContentSection}
                            className="w-full py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black"
                        >
                            افزودن بخش جدید
                        </button>
                    </div>
                </div>

                <div className="flex justify-end mt-4">
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving}
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                    >
                        {isSaving ? 'در حال ذخیره...' : 'ذخیره مقاله'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CMSAddArticle;