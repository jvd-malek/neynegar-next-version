"use client";
import { useState } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

const GET_GROUP_DISCOUNTS = `
  query GroupDiscounts {
    groupDiscounts {
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

const UPDATE_GROUP_DISCOUNT = `
  mutation UpdateGroupDiscount($id: ID!, $input: GroupDiscountInput!) {
    updateGroupDiscount(id: $id, input: $input) {
      _id
      discount
      endDate
    }
  }
`;

const DELETE_GROUP_DISCOUNT = `
  mutation DeleteGroupDiscount($id: ID!) {
    deleteGroupDiscount(id: $id)
  }
`;

function CMSDiscountBox() {
  const { data, error, mutate } = useSWR(GET_GROUP_DISCOUNTS, fetcher);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ discount: string; endDate: string }>({ discount: '', endDate: '' });
  const [extending, setExtending] = useState<string | null>(null);
  const [extendDays, setExtendDays] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (error) return <div className="text-red-600">خطا در دریافت لیست تخفیف‌ها</div>;
  if (!data) return <div>در حال بارگذاری...</div>;

  const discounts = data.groupDiscounts || [];

  // Check if discount is expired
  const isExpired = (endDate: number) => {
    return Date.now() > endDate;
  };

  const handleEdit = (d: any) => {
    setEditing(d._id);
    setEditValues({ discount: d.discount.toString(), endDate: '' });
  };

  const handleCancel = () => {
    setEditing(null);
    setEditValues({ discount: '', endDate: '' });
    setErrorMsg('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValues({ ...editValues, [e.target.name]: e.target.value });
  };

  const handleSave = async (id: string) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const input: any = { discount: parseInt(editValues.discount) };
      if (editValues.endDate) input.endDate = editValues.endDate;
      const res = await fetcher(UPDATE_GROUP_DISCOUNT, { id, input });
      if (res.errors) throw new Error(res.errors[0].message);
      setEditing(null);
      setEditValues({ discount: '', endDate: '' });
      await mutate();
    } catch (err: any) {
      setErrorMsg(err.message || 'خطا در ویرایش تخفیف');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('آیا از حذف این تخفیف مطمئن هستید؟')) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetcher(DELETE_GROUP_DISCOUNT, { id });
      if (res.errors) throw new Error(res.errors[0].message);
      await mutate();
    } catch (err: any) {
      setErrorMsg(err.message || 'خطا در حذف تخفیف');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtend = (d: any) => {
    setExtending(d._id);
    setExtendDays('');
  };

  const handleCancelExtend = () => {
    setExtending(null);
    setExtendDays('');
    setErrorMsg('');
  };

  const handleSaveExtend = async (id: string, discount: number, title: string, majorCat: string) => {
    if (!extendDays || parseInt(extendDays) <= 0) {
      setErrorMsg('لطفا تعداد روز معتبر وارد کنید');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {

      const input = { 
        discount,
        title,
        majorCat,
        endDate: extendDays 
      };
      
      console.log(input);
      
      const res = await fetcher(UPDATE_GROUP_DISCOUNT, { id, input });
      if (res.errors) throw new Error(res.errors[0].message);
      
      setExtending(null);
      setExtendDays('');
      await mutate();
    } catch (err: any) {
      setErrorMsg(err.message || 'خطا در تمدید تخفیف');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 relative mb-8">
      <h2 className="absolute top-4 -right-6 text-lg rounded-r-lg rounded-l-xl pr-6 pl-4 py-2 bg-black text-white">
        لیست تخفیف‌های گروهی
      </h2>
      {errorMsg && <div className="text-red-600 mb-2">{errorMsg}</div>}
      <div className="overflow-x-auto mt-16">
        <table className="min-w-full bg-white border rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-1.5 text-right">عنوان</th>
              <th className="px-3 py-1.5 text-right">دسته‌بندی اصلی</th>
              <th className="px-3 py-1.5 text-right">دسته‌بندی فرعی</th>
              <th className="px-3 py-1.5 text-right">برند</th>
              <th className="px-3 py-1.5 text-right">درصد تخفیف</th>
              <th className="px-3 py-1.5 text-right">تاریخ شروع</th>
              <th className="px-3 py-1.5 text-right">تاریخ پایان</th>
              <th className="px-3 py-1.5 text-right">وضعیت</th>
              <th className="px-3 py-1.5 text-right">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {discounts.map((d: any) => {
              const expired = isExpired(d.endDate);
              return (
                <tr key={d._id} className={`border-t ${expired ? 'bg-red-50' : ''}`}>
                  <td className="px-3 py-1.5">{d.title}</td>
                  <td className="px-3 py-1.5">{d.majorCat}</td>
                  <td className="px-3 py-1.5">{d.minorCat}</td>
                  <td className="px-3 py-1.5">{d.brand}</td>
                  <td className="px-3 py-1.5">
                    {editing === d._id ? (
                      <input name="discount" type="number" min="1" max="100" value={editValues.discount} onChange={handleChange} className="rounded-lg p-1 border w-16" />
                    ) : (
                      d.discount + '%'
                    )}
                  </td>
                  <td className="px-3 py-1.5">{new Date(Number(d.startDate)).toLocaleDateString('fa-IR')}</td>
                  <td className="px-3 py-1.5">
                    {editing === d._id ? (
                      <input name="endDate" type="number" min="1" value={editValues.endDate} onChange={handleChange} className="rounded-lg p-1 border w-20" placeholder="روز جدید" />
                    ) : (
                      new Date(Number(d.endDate)).toLocaleDateString('fa-IR')
                    )}
                  </td>
                  <td className="px-3 py-1.5">
                    {expired ? (
                      <span className="text-red-600 font-bold">منقضی شده</span>
                    ) : (
                      <span className="text-green-600">فعال</span>
                    )}
                  </td>
                  <td className="px-3 py-1.5">
                    {editing === d._id ? (
                      <>
                        <button onClick={() => handleSave(d._id)} className="bg-green-500 text-white px-2 py-1 rounded ml-2" disabled={isLoading}>ذخیره</button>
                        <button onClick={handleCancel} className="bg-gray-400 text-white px-2 py-1 rounded">انصراف</button>
                      </>
                    ) : extending === d._id ? (
                      <>
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            min="1" 
                            value={extendDays} 
                            onChange={(e) => setExtendDays(e.target.value)} 
                            className="rounded-lg p-1 border w-16" 
                            placeholder="روز"
                          />
                          <button 
                            onClick={() => handleSaveExtend(d._id, d.discount , d.title , d.majorCat)} 
                            className="bg-green-500 text-white px-2 py-1 rounded" 
                            disabled={isLoading}
                          >
                            تمدید
                          </button>
                          <button onClick={handleCancelExtend} className="bg-gray-400 text-white px-2 py-1 rounded">انصراف</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(d)} className="bg-blue-500 text-white px-2 py-1 rounded ml-2">ویرایش</button>
                        {expired && (
                          <button onClick={() => handleExtend(d)} className="bg-orange-500 text-white px-2 py-1 rounded ml-2">تمدید</button>
                        )}
                        <button onClick={() => handleDelete(d._id)} className="bg-red-500 text-white px-2 py-1 rounded">حذف</button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
            {discounts.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center text-gray-500 py-4">تخفیفی وجود ندارد</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CMSDiscountBox;
