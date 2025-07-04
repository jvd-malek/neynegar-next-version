"use client"
import { useState } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import SearchableAuthorSelect from './SearchableAuthorSelect';
import { Modal } from '@mui/material';

const GET_AUTHORS = `
  query GetAuthors {
    authors {
      _id
      firstname
      lastname
      fullName
    }
  }
`;

const CREATE_AUTHOR = `
  mutation CreateAuthor($input: AuthorInput!) {
    createAuthor(input: $input) {
      _id
      firstname
      lastname
      fullName
    }
  }
`;

const UPDATE_AUTHOR = `
  mutation UpdateAuthor($id: ID!, $input: AuthorInput!) {
    updateAuthor(id: $id, input: $input) {
      _id
      firstname
      lastname
      fullName
    }
  }
`;

const DELETE_AUTHOR = `
  mutation DeleteAuthor($id: ID!) {
    deleteAuthor(id: $id)
  }
`;

function CMSAddAuthor({ type }: { type: string }) {
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [selectedAuthor, setSelectedAuthor] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const { data: authorsData, error: authorsError, mutate: mutateAuthors } = useSWR(
        GET_AUTHORS,
        fetcher
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (type === 'edit' && selectedAuthor) {
                await fetcher(UPDATE_AUTHOR, {
                    id: selectedAuthor._id,
                    input: { firstname, lastname }
                });
            } else {
                await fetcher(CREATE_AUTHOR, {
                    input: { firstname, lastname }
                });
            }
            setFirstname('');
            setLastname('');
            setSelectedAuthor(null);
            mutateAuthors(); // Refresh the authors list
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (authorId: string) => {
        const author = authorsData.authors.find((a: any) => a._id === authorId);
        if (author) {
            setSelectedAuthor(author);
            setFirstname(author.firstname);
            setLastname(author.lastname);
        }
    };

    const handleDelete = async () => {
        if (!selectedAuthor) return;
        setIsLoading(true);
        try {
            await fetcher(DELETE_AUTHOR, {
                id: selectedAuthor._id
            });
            setFirstname('');
            setLastname('');
            setSelectedAuthor(null);
            setDeleteModalOpen(false);
            mutateAuthors(); // Refresh the authors list
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (authorsError) return <div>خطا در بارگذاری داده‌ها</div>;

    return (
        <div className="p-4 relative mb-8">
            <h2 className="absolute top-4 -right-6 text-lg rounded-r-lg rounded-l-xl pr-6 pl-4 py-2 bg-black text-white">
                {type === 'edit' ? 'ویرایش نویسنده' : 'افزودن نویسنده جدید'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 mt-18 grid grid-cols-2 gap-x-8">
                <div className='flex flex-col gap-1 w-full'>
                    <label className="text-xs sm:text-sm text-gray-700 text-shadow">نام</label>
                    <input
                        type="text"
                        value={firstname}
                        onChange={(e) => setFirstname(e.target.value)}
                        className="rounded-lg p-1.5 sm:p-2 border bg-slate-50 text-xs sm:text-sm focus:outline-none w-full h-8.5 sm:h-10 border-gray-300"
                        required
                    />
                </div>
                <div className='flex flex-col gap-1 w-full'>
                    <label className="text-xs sm:text-sm text-gray-700 text-shadow">نام خانوادگی</label>
                    <input
                        type="text"
                        value={lastname}
                        onChange={(e) => setLastname(e.target.value)}
                        className="rounded-lg p-1.5 sm:p-2 border bg-slate-50 text-xs sm:text-sm focus:outline-none w-full h-8.5 sm:h-10 border-gray-300"
                        required
                    />
                </div>
                {type === 'edit' && selectedAuthor && (
                    <button
                        type="button"
                        onClick={() => {
                            setDeleteModalOpen(true);
                        }}
                        disabled={isLoading}
                        className="bg-red-600 cursor-pointer text-white px-4 py-1.5 rounded-md hover:bg-red-700 w-full col-start-1 disabled:opacity-50  h-fit disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        حذف نویسنده
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-black cursor-pointer text-white px-4 py-1.5 rounded-md hover:bg-slate-800 w-full col-start-2 disabled:opacity-50 h-fit disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        type === 'edit' ? 'ویرایش' : 'افزودن'
                    )}
                </button>
            </form>

            {type === 'edit' && (
                <div className="mt-12 relative">
                    <h3 className="absolute top-0 -right-6 text-lg rounded-r-lg rounded-l-xl pr-6 pl-4 py-2 bg-black text-white">لیست نویسندگان</h3>
                    {!authorsData ? (
                        <p>در حال بارگذاری...</p>
                    ) : (
                        <div className="pt-18">
                            <SearchableAuthorSelect
                                value={selectedAuthor?._id || ''}
                                onChange={handleEdit}
                                authors={authorsData.authors}
                                form={true}
                            />
                        </div>
                    )}
                </div>
            )}
            
            {/* Delete Confirmation Modal */}
            <Modal
                open={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setSelectedAuthor(null);
                }}
            >
                <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white border rounded-lg shadow-lg px-6 py-8 max-w-md mx-auto absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 font-[Vazir]">
                    <h3 className="text-lg font-bold mb-4">حذف نویسنده</h3>
                    <p className="mb-6">
                        آیا از حذف نویسنده "{selectedAuthor?.firstname} {selectedAuthor?.lastname}" اطمینان دارید؟
                        این عملیات غیرقابل بازگشت است.
                    </p>
                    <div className="flex justify-end gap-4">
                        <button
                            onClick={handleDelete}
                            disabled={isLoading}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                        >
                            {isLoading ? 'در حال حذف...' : 'حذف'}
                        </button>
                        <button
                            onClick={() => {
                                setDeleteModalOpen(false);
                                setSelectedAuthor(null);
                            }}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                            انصراف
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default CMSAddAuthor;