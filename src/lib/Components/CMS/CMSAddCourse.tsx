'use client'
import { useState } from 'react';
import ProductInput from './ProductInput';
import { fetcher } from '@/lib/fetcher';
import { getCookie } from 'cookies-next';
import InternalLinkSelector from './InternalLinkSelector';
import LinkPreview from './LinkPreview';
import useSWR from 'swr';

const ADD_COURSE = `
  mutation CreateCourse($input: CourseInput!) {
    createCourse(input: $input) {
      _id
      title
      desc
      cover
      images
      popularity
      articleId { _id title }
      sections { title txt images }
      prerequisites { _id title }
    }
  }
`;

const ADD_SECTION = `
  mutation AddSectionToCourse($courseId: ID!, $section: SectionsInput!) {
    addSectionToCourse(courseId: $courseId, section: $section) {
      _id
      sections { title txt images }
    }
  }
`;

const GET_COURSES = `
  query Courses {
    courses {
      courses {
        _id
        title
      }
      totalPages
      currentPage
      total
    }
  }
`;

function CMSAddCourse() {
  // --- State برای افزودن دوره جدید ---
  const [courseData, setCourseData] = useState<{
    title: string;
    desc: string;
    cover: string;
    images: string[];
    popularity: number;
    articleId: string;
    sections: { title: string; txt: string[]; images: any[] }[];
    prerequisites: string[];
    category: string;
    relatedProducts: string[];
  }>({
    title: '',
    desc: '',
    cover: '',
    images: [],
    popularity: 5,
    articleId: '',
    sections: [{ title: '', txt: [''], images: [] }],
    prerequisites: [],
    category: '',
    relatedProducts: []
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  // --- State برای افزودن سکشن به دوره موجود ---
  const [courseIdForSection, setCourseIdForSection] = useState<string>('');
  const [sectionData, setSectionData] = useState<{ title: string; txt: string; images: any[] }>({ title: '', txt: '', images: [] });
  const [sectionAddResult, setSectionAddResult] = useState<string | null>(null);
  const [sectionError, setSectionError] = useState<string>('');
  const [isAddingSection, setIsAddingSection] = useState(false);

  // دریافت لیست دوره‌ها برای prerequisites
  const { data: coursesData } = useSWR(GET_COURSES, fetcher);
  const courses = coursesData?.courses?.courses || [];

  // --- هندلرهای فرم افزودن دوره جدید ---
  const handleCourseFieldChange = (field: string, value: any) => {
    setCourseData(prev => ({ ...prev, [field]: value }));
  };
  const handleSectionChange = (index: number, field: string, value: string | number | number[]) => {
    const newSections = [...courseData.sections];
    if (field === 'txt' && typeof value === 'string') {
      newSections[index][field] = value.split('\n');
    } else {
      (newSections[index] as any)[field] = value;
    }
    setCourseData(prev => ({ ...prev, sections: newSections }));
  };
  const addCourseSection = () => {
    setCourseData(prev => ({
      ...prev,
      sections: [...prev.sections, { title: '', txt: [''], images: [] }]
    }));
  };
  const removeCourseSection = (index: number) => {
    setCourseData(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
  };

  // --- ارسال دوره جدید ---
  const handleAddCourse = async () => {
    setIsSaving(true);
    setErrors({});
    try {
      // اعتبارسنجی ساده
      const newErrors: { [key: string]: string } = {};
      if (!courseData.title) newErrors.title = 'عنوان دوره الزامی است';
      if (!courseData.desc) newErrors.desc = 'توضیحات دوره الزامی است';
      if (!coverFile) newErrors.cover = 'کاور دوره الزامی است';
      courseData.sections.forEach((section, idx) => {
        if (!section.title) newErrors[`section_title_${idx}`] = 'عنوان سکشن الزامی است';
        if (!section.txt || section.txt.length === 0 || !section.txt[0]) newErrors[`section_txt_${idx}`] = 'متن سکشن الزامی است';
      });
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsSaving(false);
        return;
      }
      // آپلود عکس‌ها (cover و images)
      let uploadedCover = '';
      let uploadedImages: string[] = [];
      if (coverFile || imageFiles.length > 0) {
        const fileFormData = new FormData();
        if (coverFile) fileFormData.append('cover', coverFile);
        imageFiles.forEach(f => fileFormData.append('images', f));
        const jwt = getCookie('jwt') as string;
        const fileRes = await fetch('https://api.neynegar1.ir/upload', {
          method: 'POST',
          headers: { 'authorization': jwt },
          body: fileFormData
        });
        if (!fileRes.ok) throw new Error('آپلود عکس ناموفق بود');
        const fileResult = await fileRes.json();
        uploadedCover = fileResult.cover || '';
        uploadedImages = Array.isArray(fileResult.images) ? fileResult.images : [];
      }
      // آماده‌سازی داده‌ها
      const input = {
        ...courseData,
        popularity: 5, // مقدار ثابت
        cover: uploadedCover,
        images: uploadedImages,
        sections: courseData.sections.map(s => ({
          title: s.title,
          txt: Array.isArray(s.txt) ? s.txt : [s.txt],
          images: s.images
        })),
        prerequisites: courseData.prerequisites
      };
      await fetcher(ADD_COURSE, { input });
      alert('دوره با موفقیت اضافه شد');
      setCourseData({
        title: '', desc: '', cover: '', images: [], popularity: 5, articleId: '',
        sections: [{ title: '', txt: [''], images: [] }], prerequisites: [],
        category: '',
        relatedProducts: []
      });
      setImageFiles([]); setCoverFile(null);
    } catch (e: any) {
      setErrors({ general: e.message });
    } finally {
      setIsSaving(false);
    }
  };

  // --- هندلرهای فرم افزودن سکشن به دوره موجود ---
  const handleSectionFieldChange = (field: string, value: any) => {
    setSectionData(prev => ({ ...prev, [field]: value }));
  };
  const handleAddSection = async () => {
    setIsAddingSection(true);
    setSectionError('');
    setSectionAddResult(null);
    try {
      if (!courseIdForSection) throw new Error('آیدی دوره الزامی است');
      if (!sectionData.title || !sectionData.txt) throw new Error('عنوان و متن سکشن الزامی است');
      // آماده‌سازی داده سکشن
      const section = {
        title: sectionData.title,
        txt: Array.isArray(sectionData.txt) ? sectionData.txt : sectionData.txt.split('\n'),
        images: sectionData.images
      };
      await fetcher(ADD_SECTION, { courseId: courseIdForSection, section });
      setSectionAddResult('سکشن با موفقیت اضافه شد');
      setSectionData({ title: '', txt: '', images: [] });
    } catch (e: any) {
      setSectionError(e.message);
    } finally {
      setIsAddingSection(false);
    }
  };

  return (
    <div className="bg-slate-200 rounded-xl p-4 pt-20">
      <h3 className="absolute top-4 -right-6 text-lg rounded-r-lg rounded-l-xl pr-6 pl-4 py-2 bg-black text-white">
        افزودن دوره جدید
      </h3>
      {/* فرم افزودن دوره جدید */}
      <div className="mt-5 py-4 px-8 rounded-xl w-full">
        <div className="flex items-center justify-center flex-col gap-x-8 gap-y-4 pb-4 w-full">
          <div className="flex md:flex-row flex-col justify-between items-center w-full gap-x-8 gap-y-4">
            <ProductInput
              form
              label="عنوان دوره"
              value={courseData.title}
              onChange={(value: string | number) => handleCourseFieldChange('title', String(value))}
              error={errors.title}
            />
            <ProductInput
              form
              label="توضیحات دوره"
              value={courseData.desc}
              type="textarea"
              onChange={(value: string | number) => handleCourseFieldChange('desc', String(value))}
              error={errors.desc}
            />
          </div>
          {/* Internal Link Selectors for Description */}
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">افزودن لینک داخلی به توضیحات</label>
            <div className="flex gap-x-8 gap-y-4 md:flex-row flex-col w-full">
              <div className="flex-1">
                <InternalLinkSelector
                  type="article"
                  placeholder="جستجوی مقاله..."
                  onSelect={(link) => handleCourseFieldChange('desc', courseData.desc + ' ' + link)}
                />
              </div>
              <div className="flex-1">
                <InternalLinkSelector
                  type="product"
                  placeholder="جستجوی محصول..."
                  onSelect={(link) => handleCourseFieldChange('desc', courseData.desc + ' ' + link)}
                />
              </div>
            </div>
            <div className="text-xs text-blue-600 mb-2 mt-2">
              💡 برای لینک خارجی: [متن نمایشی](https://example.com)<br />
              💡 برای لینک داخلی: [متن نمایشی](/article/ARTICLE_ID) یا [متن نمایشی](/product/PRODUCT_ID)
            </div>
            <LinkPreview content={courseData.desc || ''} title="پیش‌نمایش لینک‌های توضیحات" />
          </div>

          <div className="flex md:flex-row flex-col justify-between items-center w-full gap-x-8 gap-y-4">
            <ProductInput
              form
              label="دسته‌بندی دوره"
              value={courseData.category}
              onChange={(value: string | number) => handleCourseFieldChange('category', String(value))}
              error={errors.category}
            />
            <ProductInput
              form
              label="آیدی مقاله مرتبط (اختیاری)"
              value={courseData.articleId}
              onChange={(value: string | number) => handleCourseFieldChange('articleId', String(value))}
            />
          </div>

          <div className="flex md:flex-row flex-col justify-between items-center w-full gap-x-8 gap-y-4">
            {/* انتخاب prerequisites */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">دوره‌های پیش‌نیاز</label>
              <InternalLinkSelector
                type="course"
                placeholder="جستجوی دوره..."
                onSelect={link => {
                  // استخراج آیدی دوره از لینک
                  const match = link.match(/\(\/course\/(.*?)\)/);
                  const id = match?.[1];
                  if (id && !courseData.prerequisites.includes(id)) {
                    handleCourseFieldChange('prerequisites', [...courseData.prerequisites, id]);
                  }
                }}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {courseData.prerequisites.map((id) => {
                  const course = courses.find((c: any) => c._id === id);
                  return course ? (
                    <span key={id} className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {course.title}
                      <button
                        type="button"
                        className="ml-1 text-red-500 hover:text-red-700"
                        onClick={() => handleCourseFieldChange('prerequisites', courseData.prerequisites.filter(pid => pid !== id))}
                      >
                        ×
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            </div>
            {/* انتخاب محصولات مرتبط */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">محصولات مرتبط با دوره</label>
              <InternalLinkSelector
                type="product"
                placeholder="جستجوی محصول..."
                onSelect={link => {
                  // استخراج آیدی محصول از لینک
                  const match = link.match(/\(\/product\/(.*?)\)/);
                  const id = match?.[1];
                  if (id && !courseData.relatedProducts.includes(id)) {
                    handleCourseFieldChange('relatedProducts', [...courseData.relatedProducts, id]);
                  }
                }}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {courseData.relatedProducts.map((id) => (
                  <span key={id} className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                    {id}
                    <button
                      type="button"
                      className="ml-1 text-red-500 hover:text-red-700"
                      onClick={() => handleCourseFieldChange('relatedProducts', courseData.relatedProducts.filter(pid => pid !== id))}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex md:flex-row flex-col justify-between items-center w-full gap-x-8 gap-y-4">
            {/* آپلود عکس کاور */}
            <div className='w-full mx-auto'>
              <label className="block text-sm font-medium text-gray-700 mb-2">کاور دوره</label>
              <input type="file" accept="image/*" onChange={e => {
                if (e.target.files && e.target.files.length > 0) setCoverFile(e.target.files[0]);
              }} />
              {errors.cover && <span className="text-red-500 text-xs">{errors.cover}</span>}
            </div>
            {/* آپلود عکس‌های دیگر */}
            <div className='w-full mx-auto'>
              <label className="block text-sm font-medium text-gray-700 mb-2">تصاویر دیگر</label>
              <input type="file" accept="image/*" multiple onChange={e => {
                if (e.target.files) setImageFiles(Array.from(e.target.files));
                else setImageFiles([]);
              }} />
            </div>
          </div>

        </div>
        {/* سکشن‌های دوره */}
        <div className="mt-4">
          <h4>سکشن‌های دوره</h4>
          {courseData.sections.map((section, idx) => (
            <div key={idx} className="border rounded p-2 mb-2">
              <ProductInput
                form
                label={`عنوان سکشن ${idx + 1}`}
                value={String(section.title)}
                onChange={(value: string | number) => handleSectionChange(idx, 'title', String(value))}
                error={errors[`section_title_${idx}`]}
              />
              <ProductInput
                form
                label={`متن سکشن ${idx + 1} (هر خط یک پاراگراف)`}
                value={Array.isArray(section.txt) ? section.txt.join('\n') : String(section.txt)}
                type="textarea"
                onChange={(value: string | number) => handleSectionChange(idx, 'txt', String(value))}
                error={errors[`section_txt_${idx}`]}
              />
              {/* Internal Link Selectors for Section Content */}
              <div className="mt-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">افزودن لینک داخلی</label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <InternalLinkSelector
                      type="article"
                      placeholder="جستجوی مقاله..."
                      onSelect={(link) => {
                        const newContent = (Array.isArray(section.txt) ? section.txt.join(' ') : section.txt) + ' ' + link;
                        handleSectionChange(idx, 'txt', newContent);
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <InternalLinkSelector
                      type="product"
                      placeholder="جستجوی محصول..."
                      onSelect={(link) => {
                        const newContent = (Array.isArray(section.txt) ? section.txt.join(' ') : section.txt) + ' ' + link;
                        handleSectionChange(idx, 'txt', newContent);
                      }}
                    />
                  </div>
                </div>
                <div className="text-xs text-blue-600 mb-2 mt-2">
                  💡 برای لینک خارجی: [متن نمایشی](https://example.com)<br />
                  💡 برای لینک داخلی: [متن نمایشی](/article/ARTICLE_ID) یا [متن نمایشی](/product/PRODUCT_ID)
                </div>
                <LinkPreview content={Array.isArray(section.txt) ? section.txt.join(' ') : section.txt || ''} title={`پیش‌نمایش لینک‌های بخش ${idx + 1}`} />
              </div>
              {/* انتخاب عکس برای سکشن */}
              <div className="mt-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">انتخاب عکس‌های این سکشن (ایندکس عکس‌ها)</label>
                <div className="flex flex-wrap gap-2">
                  {imageFiles.map((img, i) => {
                    const isSelected = Array.isArray(section.images) && section.images.includes(i);
                    const url = URL.createObjectURL(img);
                    return (
                      <label key={i} className={`flex flex-col items-center border rounded p-1 cursor-pointer ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                        style={{ width: 80 }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={e => {
                            let newImages = Array.isArray(section.images) ? [...section.images] : [];
                            if (e.target.checked) {
                              if (!newImages.includes(i)) newImages.push(i);
                            } else {
                              newImages = newImages.filter(idx => idx !== i);
                            }
                            handleSectionChange(idx, 'images', newImages);
                          }}
                          className="mb-1"
                        />
                        <img src={url} alt={`img${i + 1}`} className="w-12 h-12 object-cover rounded mb-1" />
                        <span className="text-xs">عکس {i + 1}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <button className="text-red-500 mt-2" type="button" onClick={() => removeCourseSection(idx)}>حذف سکشن</button>
            </div>
          ))}
          <button className="w-full py-2 border rounded mt-2" type="button" onClick={addCourseSection}>افزودن سکشن جدید</button>
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={handleAddCourse} disabled={isSaving} className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50">
            {isSaving ? 'در حال ذخیره...' : 'ذخیره دوره'}
          </button>
        </div>
        {errors.general && <div className="text-red-500 mt-2">{errors.general}</div>}
      </div>
      <hr className="my-8" />
      {/* فرم افزودن سکشن به دوره موجود */}
      <div className="mt-8 py-4 px-8 rounded-xl bg-white">
        <h3 className="text-lg mb-4">افزودن سکشن به دوره موجود</h3>
        <ProductInput
          form
          label="آیدی دوره"
          value={String(courseIdForSection)}
          onChange={(value: string | number) => setCourseIdForSection(String(value))}
        />
        <ProductInput
          form
          label="عنوان سکشن"
          value={String(sectionData.title)}
          onChange={(value: string | number) => handleSectionFieldChange('title', String(value))}
        />
        <ProductInput
          form
          label="متن سکشن (هر خط یک پاراگراف)"
          value={String(sectionData.txt)}
          type="textarea"
          onChange={(value: string | number) => handleSectionFieldChange('txt', String(value))}
        />
        {/* اگر نیاز به آپلود عکس برای سکشن دارید، اینجا اضافه کنید */}
        <button onClick={handleAddSection} disabled={isAddingSection} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 w-full mt-2">
          {isAddingSection ? 'در حال افزودن...' : 'افزودن سکشن'}
        </button>
        {sectionAddResult && <div className="text-green-600 mt-2">{sectionAddResult}</div>}
        {sectionError && <div className="text-red-500 mt-2">{sectionError}</div>}
      </div>
    </div>
  );
}

export default CMSAddCourse;
