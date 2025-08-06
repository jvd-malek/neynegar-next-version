"use client"
import { useState } from 'react';
import { linksType } from '@/lib/Types/links';
import { fetcher } from '@/lib/fetcher';

const CREATE_GROUP_DISCOUNT = `
  mutation CreateGroupDiscount($input: GroupDiscountInput!) {
    createGroupDiscount(input: $input) {
      _id
      title
      majorCat
      minorCat
      brand
      discount
      startDate
      endDate
      isActive
    }
  }
`;

function CMSAddDiscount({ links = [] }: { links: linksType[] }) {
  const [form, setForm] = useState({
    title: '',
    majorCat: '',
    minorCat: '',
    brand: '',
    discount: '',
    endDate: '' // تعداد روز
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // داینامیک minorCat و brand
  const minorCatOptions = form.majorCat
    ? links.find(l => l.txt === form.majorCat)?.subLinks || []
    : [];
  const brandOptions = form.majorCat && form.minorCat
    ? minorCatOptions.find((sl: any) => sl.link === form.minorCat)?.brand?.filter((b: string) => b !== 'همه') || []
    : [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // اگر majorCat تغییر کرد، minorCat و brand را ریست کن
    if (e.target.name === 'majorCat') {
      setForm(prev => ({ ...prev, majorCat: e.target.value, minorCat: '', brand: '' }));
    }
    // اگر minorCat تغییر کرد، brand را ریست کن
    if (e.target.name === 'minorCat') {
      setForm(prev => ({ ...prev, minorCat: e.target.value, brand: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const input = {
        ...form,
        discount: parseInt(form.discount),
        endDate: form.endDate // تعداد روز
      };
      const res = await fetcher(CREATE_GROUP_DISCOUNT, { input });
      if (res.errors) throw new Error(res.errors[0].message);
      setSuccess('تخفیف با موفقیت ثبت شد');
      setForm({ title: '', majorCat: '', minorCat: '', brand: '', discount: '', endDate: '' });
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت تخفیف');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 relative mb-8">
      <h2 className="absolute top-4 -right-6 text-lg rounded-r-lg rounded-l-xl pr-6 pl-4 py-2 bg-black text-white">
        افزودن تخفیف گروهی جدید
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4 mt-18 grid grid-cols-2 gap-x-8">
        <div className='flex flex-col gap-1 w-full'>
          <label className="text-xs sm:text-sm text-gray-700 text-shadow">عنوان بنر</label>
          <input name="title" value={form.title} onChange={handleChange} className="rounded-lg p-2 border bg-slate-50 text-xs sm:text-sm focus:outline-none w-full h-10 border-gray-300" required />
        </div>
        <div className='flex flex-col gap-1 w-full'>
          <label className="text-xs sm:text-sm text-gray-700 text-shadow">دسته‌بندی اصلی</label>
          <select name="majorCat" value={form.majorCat} onChange={handleChange} className="rounded-lg p-2 border bg-slate-50 text-xs sm:text-sm focus:outline-none w-full h-10 border-gray-300" required>
            <option value="">__ انتخاب کنید __</option>
            {links.map(l => (
              <option key={l.txt} value={l.txt}>{l.txt}</option>
            ))}
          </select>
        </div>
        <div className='flex flex-col gap-1 w-full'>
          <label className="text-xs sm:text-sm text-gray-700 text-shadow">دسته‌بندی فرعی</label>
          <select name="minorCat" value={form.minorCat} onChange={handleChange} className="rounded-lg p-2 border bg-slate-50 text-xs sm:text-sm focus:outline-none w-full h-10 border-gray-300" disabled={!form.majorCat}>
            <option value="">{form.majorCat ? 'انتخاب کنید' : 'دسته‌بندی اصلی را انتخاب کنید'}</option>
            {minorCatOptions.map((sl: any) => (
              <option key={sl.link} value={sl.link}>{sl.link}</option>
            ))}
          </select>
        </div>
        <div className='flex flex-col gap-1 w-full'>
          <label className="text-xs sm:text-sm text-gray-700 text-shadow">برند</label>
          <select name="brand" value={form.brand} onChange={handleChange} className="rounded-lg p-2 border bg-slate-50 text-xs sm:text-sm focus:outline-none w-full h-10 border-gray-300" disabled={!form.majorCat || !form.minorCat}>
            <option value="">{form.minorCat ? 'انتخاب کنید' : 'دسته‌بندی فرعی را انتخاب کنید'}</option>
            {brandOptions.map((b: string) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
        <div className='flex flex-col gap-1 w-full'>
          <label className="text-xs sm:text-sm text-gray-700 text-shadow">درصد تخفیف</label>
          <input name="discount" type="number" min="1" max="100" value={form.discount} onChange={handleChange} className="rounded-lg p-2 border bg-slate-50 text-xs sm:text-sm focus:outline-none w-full h-10 border-gray-300" required />
        </div>
        <div className='flex flex-col gap-1 w-full'>
          <label className="text-xs sm:text-sm text-gray-700 text-shadow">مدت (روز)</label>
          <input name="endDate" type="number" min="1" value={form.endDate} onChange={handleChange} className="rounded-lg p-2 border bg-slate-50 text-xs sm:text-sm focus:outline-none w-full h-10 border-gray-300" required />
        </div>
        <button type="submit" disabled={isLoading} className="bg-black text-white px-4 py-2 rounded-md hover:bg-slate-800 col-span-2">
          {isLoading ? 'در حال ثبت...' : 'ثبت تخفیف'}
        </button>
        {error && <div className="col-span-2 text-red-600">{error}</div>}
        {success && <div className="col-span-2 text-green-600">{success}</div>}
      </form>
    </div>
  );
}

export default CMSAddDiscount;
