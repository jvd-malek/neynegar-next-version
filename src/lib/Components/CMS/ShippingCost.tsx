"use client";
import { useState } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

const GET_SHIPPING_COSTS = `
  query ShippingCosts {
    shippingCosts {
      _id
      type
      cost
      costPerKg
      createdAt
      updatedAt
    }
  }
`;

const CREATE_SHIPPING_COST = `
  mutation CreateShippingCost($input: ShippingCostInput!) {
    createShippingCost(input: $input) {
      _id
      type
      cost
      costPerKg
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_SHIPPING_COST = `
  mutation UpdateShippingCost($id: ID!, $input: ShippingCostInput!) {
    updateShippingCost(id: $id, input: $input) {
      _id
      type
      cost
      costPerKg
      createdAt
      updatedAt
    }
  }
`;

const DELETE_SHIPPING_COST = `
  mutation DeleteShippingCost($id: ID!) {
    deleteShippingCost(id: $id)
  }
`;

function ShippingCost() {
  // فرم افزودن
  const [form, setForm] = useState({ type: '', cost: '', costPerKg: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // لیست و ویرایش
  const { data, error: fetchError, mutate } = useSWR(GET_SHIPPING_COSTS, fetcher);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ type: string; cost: string; costPerKg: string }>({ type: '', cost: '', costPerKg: '' });
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // افزودن هزینه ارسال
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const input = { type: form.type, cost: parseFloat(form.cost), costPerKg: form.costPerKg ? parseFloat(form.costPerKg) : 0 };
      const res = await fetcher(CREATE_SHIPPING_COST, { input });
      if (res.errors) throw new Error(res.errors[0].message);
      setSuccess('هزینه ارسال با موفقیت ثبت شد');
      setForm({ type: '', cost: '' , costPerKg: ''});
      await mutate();
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت هزینه ارسال');
    } finally {
      setIsLoading(false);
    }
  };

  // ویرایش هزینه ارسال
  const handleEdit = (item: any) => {
    setEditing(item._id);
    setEditValues({ type: item.type, cost: item.cost.toString(), costPerKg: item.costPerKg?.toString() || '' });
    setEditError('');
  };
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValues({ ...editValues, [e.target.name]: e.target.value });
  };
  const handleEditSave = async (id: string) => {
    setEditLoading(true);
    setEditError('');
    try {
      const input = { type: editValues.type, cost: parseFloat(editValues.cost), costPerKg: editValues.costPerKg ? parseFloat(editValues.costPerKg) : 0 };
      const res = await fetcher(UPDATE_SHIPPING_COST, { id, input });
      if (res.errors) throw new Error(res.errors[0].message);
      setEditing(null);
      setEditValues({ type: '', cost: '', costPerKg: '' });
      await mutate();
    } catch (err: any) {
      setEditError(err.message || 'خطا در ویرایش هزینه ارسال');
    } finally {
      setEditLoading(false);
    }
  };
  const handleEditCancel = () => {
    setEditing(null);
    setEditValues({ type: '', cost: '', costPerKg: '' });
    setEditError('');
  };

  // حذف هزینه ارسال
  const handleDelete = async (id: string) => {
    if (!window.confirm('آیا از حذف این هزینه ارسال مطمئن هستید؟')) return;
    setEditLoading(true);
    setEditError('');
    try {
      const res = await fetcher(DELETE_SHIPPING_COST, { id });
      if (res.errors) throw new Error(res.errors[0].message);
      await mutate();
    } catch (err: any) {
      setEditError(err.message || 'خطا در حذف هزینه ارسال');
    } finally {
      setEditLoading(false);
    }
  };

  if (fetchError) return <div className="text-red-600">خطا در دریافت لیست هزینه‌های ارسال</div>;
  if (!data) return <div>در حال بارگذاری...</div>;
  const shippingCosts = data.shippingCosts || [];

  return (
    <div className="p-4 relative mb-8">
      <h2 className="absolute top-4 -right-6 text-lg rounded-r-lg rounded-l-xl pr-6 pl-4 py-2 bg-black text-white">
        مدیریت هزینه‌های ارسال
      </h2>
      {/* فرم افزودن */}
      <form onSubmit={handleSubmit} className="space-y-4 mt-18 grid grid-cols-2 gap-x-8 mb-8">
        <div className='flex flex-col gap-1 w-full'>
          <label className="text-xs sm:text-sm text-gray-700 text-shadow">نوع ارسال</label>
          <input name="type" value={form.type} onChange={handleChange} className="rounded-lg p-2 border bg-slate-50 text-xs sm:text-sm focus:outline-none w-full h-10 border-gray-300" required />
        </div>
        <div className='flex flex-col gap-1 w-full'>
          <label className="text-xs sm:text-sm text-gray-700 text-shadow">هزینه (تومان)</label>
          <input name="cost" type="number" min="0" value={form.cost} onChange={handleChange} className="rounded-lg p-2 border bg-slate-50 text-xs sm:text-sm focus:outline-none w-full h-10 border-gray-300" required />
        </div>
        <div className='flex flex-col gap-1 w-full'>
          <label className="text-xs sm:text-sm text-gray-700 text-shadow">هزینه هر کیلو (تومان)</label>
          <input name="costPerKg" type="number" min="0" value={form.costPerKg ?? ''} onChange={handleChange} className="rounded-lg p-2 border bg-slate-50 text-xs sm:text-sm focus:outline-none w-full h-10 border-gray-300" />
        </div>
        <button type="submit" disabled={isLoading} className="bg-black text-white px-4 py-2 rounded-md hover:bg-slate-800 col-span-2">
          {isLoading ? 'در حال ثبت...' : 'ثبت هزینه ارسال'}
        </button>
        {error && <div className="col-span-2 text-red-600">{error}</div>}
        {success && <div className="col-span-2 text-green-600">{success}</div>}
      </form>
      {/* جدول لیست */}
      {editError && <div className="text-red-600 mb-2">{editError}</div>}
      <div className="overflow-x-auto mt-8">
        <table className="min-w-full bg-white border rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-1.5 text-right">نوع ارسال</th>
              <th className="px-3 py-1.5 text-right">هزینه (تومان)</th>
              <th className="px-3 py-1.5 text-right">هزینه هر کیلو (تومان)</th>
              <th className="px-3 py-1.5 text-right">تاریخ ایجاد</th>
              <th className="px-3 py-1.5 text-right">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {shippingCosts.map((item: any) => (
              <tr key={item._id} className="border-t">
                <td className="px-3 py-1.5">
                  {editing === item._id ? (
                    <input name="type" value={editValues.type} onChange={handleEditChange} className="rounded-lg p-1 border w-32" />
                  ) : (
                    item.type
                  )}
                </td>
                <td className="px-3 py-1.5">
                  {editing === item._id ? (
                    <input name="cost" type="number" min="0" value={editValues.cost} onChange={handleEditChange} className="rounded-lg p-1 border w-24" />
                  ) : (
                    item.cost.toLocaleString()
                  )}
                </td>
                <td className="px-3 py-1.5">
                  {editing === item._id ? (
                    <input name="costPerKg" type="number" min="0" value={editValues.costPerKg ?? ''} onChange={handleEditChange} className="rounded-lg p-1 border w-24" />
                  ) : (
                    item.costPerKg?.toLocaleString() || '-'
                  )}
                </td>
                <td className="px-3 py-1.5">{new Date(item.createdAt).toLocaleDateString('fa-IR')}</td>
                <td className="px-3 py-1.5">
                  {editing === item._id ? (
                    <>
                      <button onClick={() => handleEditSave(item._id)} className="bg-green-500 text-white px-2 py-1 rounded ml-2" disabled={editLoading}>ذخیره</button>
                      <button onClick={handleEditCancel} className="bg-gray-400 text-white px-2 py-1 rounded">انصراف</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(item)} className="bg-blue-500 text-white px-2 py-1 rounded ml-2">ویرایش</button>
                      <button onClick={() => handleDelete(item._id)} className="bg-red-500 text-white px-2 py-1 rounded">حذف</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {shippingCosts.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-gray-500 py-4">هزینه ارسالی ثبت نشده است</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ShippingCost;
