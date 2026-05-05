'use client';

import PaginationBox from '@/public/components/pagination/PaginationBox'
import SearchBox from '@/public/components/CMS/SearchBox';
import { useState } from 'react';
import useSWR from 'swr';
import { Modal } from '@mui/material';
import { fetcher } from '@/public/utils/fetcher';
import { formatDateTime } from '@/public/utils/dateFormatter';

interface CMSTicketBoxProps {
    type: string;
    page: {
        page: number;
        count: number;
        search: string;
    };
}

// GraphQL Queries and Mutations
const GET_TICKETS = `
    query GetTickets($page: Int!, $limit: Int!, $search: String) {
        tickets(page: $page, limit: $limit, search: $search) {
            tickets {
                _id
                status
                title
                txt
                response
                userId {
                    _id
                    name
                    phone
                    status
                }
                createdAt
                updatedAt
            }
            totalPages
            currentPage
            total
        }
    }
`;

const UPDATE_TICKET_STATUS = `
    mutation UpdateTicketStatus($id: ID!, $status: String!) {
        updateTicketStatus(id: $id, status: $status) {
            _id
            status
        }
    }
`;

const ADD_TICKET_RESPONSE = `
    mutation AddTicketResponse($id: ID!, $response: String!) {
        addTicketResponse(id: $id, response: $response) {
            _id
            response
            status
        }
    }
`;

const DELETE_TICKET = `
    mutation DeleteTicket($id: ID!) {
        deleteTicket(id: $id)
    }
`;

function CMSTicketBox({ type, page }: CMSTicketBoxProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [responseText, setResponseText] = useState('');
    const [ticketVisibility, setTicketVisibility] = useState<Record<string, boolean>>({});

    const toggleTicketResponse = (ticketId: string) => {
        setTicketVisibility(prev => ({
            ...prev,
            [ticketId]: !prev[ticketId]
        }));
    };

    const variables = {
        page: page.page,
        limit: page.count,
        search: page.search,
    };

    const { data, error, isLoading, mutate } = useSWR(
        [GET_TICKETS, variables],
        ([query, variables]) => fetcher(query, variables),
        {
            revalidateOnFocus: false,
            dedupingInterval: 2000,
            keepPreviousData: true
        }
    );

    const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
        try {
            setIsSaving(true);
            await fetcher(UPDATE_TICKET_STATUS, {
                id: ticketId,
                status: newStatus
            });
            await mutate();
        } catch (error) {
            console.error('Error updating ticket status:', error);
            alert('خطا در بروزرسانی وضعیت تیکت');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddResponse = async (ticketId: string) => {
        try {
            if (!responseText.trim()) {
                alert('لطفا پاسخ تیکت را وارد کنید');
                return;
            }

            setIsSaving(true);
            await fetcher(ADD_TICKET_RESPONSE, {
                id: ticketId,
                response: responseText
            });
            setResponseText('');
            setTicketVisibility(prev => ({ ...prev, [ticketId]: false }));
            await mutate();
        } catch (error) {
            console.error('Error adding ticket response:', error);
            alert('خطا در ثبت پاسخ تیکت');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteTicket = async (ticketId: string) => {
        try {
            setIsSaving(true);
            await fetcher(DELETE_TICKET, { id: ticketId });
            await mutate();
            setDeleteModalOpen(false);
        } catch (error) {
            console.error('Error deleting ticket:', error);
            alert('خطا در حذف تیکت');
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

    const tickets = data?.tickets;

    return (
        <>
            <div className="bg-slate-200 relative rounded-xl p-4 lg:col-start-2 col-end-5 col-start-1 lg:row-start-1 row-start-2 pt-20 text-xs sm:text-sm">
                <h3 className="absolute top-4 -right-6 text-lg rounded-r-lg rounded-l-xl pr-6 pl-4 py-2 bg-black text-white">
                    {type}
                </h3>

                <div className="flex justify-center absolute top-4 left-3 items-center gap-2 pl-2 text-white bg-black w-40 rounded-lg shadow-md overflow-hidden">
                    <SearchBox search={page.search} />
                </div>

                {(tickets && tickets.tickets.length > 0) ? tickets.tickets.map((ticket: any) => (
                    <div className="mt-5 bg-white shadow-cs py-2 px-4 rounded-xl flex flex-col gap-3" key={ticket._id}>
                        <div className="flex justify-between items-center gap-2">
                            <h2 className="md:text-lg text-shadow">{ticket.title}</h2>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                    {formatDateTime(Number(ticket.createdAt))}
                                </span>
                                <select
                                    value={ticket.status}
                                    onChange={(e) => handleUpdateStatus(ticket._id, e.target.value)}
                                    className="px-2 py-1 border rounded-lg text-xs"
                                    disabled={isSaving}
                                >
                                    <option value="در انتظار بررسی">در انتظار بررسی</option>
                                    <option value="در حال بررسی">در حال بررسی</option>
                                    <option value="پاسخ داده شده">پاسخ داده شده</option>
                                    <option value="بسته شد">بسته شد</option>
                                    <option value="در انتظار پاسخ شما">در انتظار پاسخ شما</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">کاربر:</span>
                                <span>{ticket.userId.name}</span>
                                <span className="text-gray-500">({ticket.userId.phone})</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="font-semibold">متن تیکت:</span>
                                <p className="text-gray-700 bg-gray-50 p-2 rounded-lg">{ticket.txt}</p>
                            </div>
                            {ticket.response && (
                                <div className="flex flex-col gap-1">
                                    <span className="font-semibold">پاسخ:</span>
                                    <p className="text-gray-700 bg-gray-50 p-2 rounded-lg">{ticket.response}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={() => toggleTicketResponse(ticket._id)}
                                className={`px-3 py-1.5 rounded text-white ${ticketVisibility[ticket._id] ? 'bg-blue-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                            >
                                {ticketVisibility[ticket._id] ? 'بستن پاسخ' : 'پاسخ به تیکت'}
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedTicket(ticket);
                                    setDeleteModalOpen(true);
                                }}
                                className="px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600"
                                disabled={isSaving}
                            >
                                حذف تیکت
                            </button>
                        </div>

                        {ticketVisibility[ticket._id] && (
                            <div className="mt-2">
                                <textarea
                                    value={responseText}
                                    onChange={(e) => setResponseText(e.target.value)}
                                    placeholder="پاسخ خود را وارد کنید..."
                                    className="w-full p-2 border rounded-lg text-sm"
                                    rows={4}
                                />
                                <button
                                    onClick={() => handleAddResponse(ticket._id)}
                                    className="mt-2 px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600"
                                    disabled={isSaving}
                                >
                                    {isSaving ? 'در حال ثبت...' : 'ثبت پاسخ'}
                                </button>
                            </div>
                        )}
                    </div>
                )) : (
                    <p className="mt-5 bg-white shadow-cs py-1.5 px-3 rounded-xl text-center text-xs md:text-sm">تیکتی یافت نشد 😥</p>
                )}

                {/* Pagination */}
                {tickets && tickets.totalPages > 1 && (
                    <div className="mt-4">
                        <PaginationBox
                            count={tickets.totalPages}
                            currentPage={tickets.currentPage}
                        />
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                <Modal
                    open={deleteModalOpen}
                    onClose={() => {
                        setDeleteModalOpen(false);
                        setSelectedTicket(null);
                    }}
                >
                    <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white border rounded-lg shadow-lg px-6 py-8 max-w-md mx-auto absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
                        <h3 className="text-lg font-bold mb-4">حذف تیکت</h3>
                        <p className="mb-6">
                            آیا از حذف تیکت "{selectedTicket?.title}" اطمینان دارید؟
                            این عملیات غیرقابل بازگشت است.
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => handleDeleteTicket(selectedTicket?._id || '')}
                                disabled={isSaving}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                            >
                                {isSaving ? 'در حال حذف...' : 'حذف'}
                            </button>
                            <button
                                onClick={() => {
                                    setDeleteModalOpen(false);
                                    setSelectedTicket(null);
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

export default CMSTicketBox;

