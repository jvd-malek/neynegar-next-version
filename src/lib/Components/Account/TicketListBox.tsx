import { paginatedTicketsType, ticketType } from "@/lib/Types/ticket";
import CommentBox from "../Comment/CommentBox";
import PaginationBox from "../Pagination/PaginationBox";

interface TicketListBoxProps {
    tickets: paginatedTicketsType;
    user?: {
        name: string;
        address: string;
    };
    demo?: boolean;
}

function TicketListBox({ tickets, user, demo = false }: TicketListBoxProps) {
    // محدود کردن تیکت‌ها در حالت demo
    const displayTickets = demo ? tickets.tickets.slice(0, 2) : tickets.tickets;

    return (
        <div className="w-full">
            {/* Header - فقط در حالت غیر demo */}
            {!demo && (
                <div className="flex mt-12 justify-between items-center border-solid border-b border-slate-400 pb-3 mb-6">
                    <p className="text-lg">تیکت‌های من</p>
                    <span className="text-sm text-gray-600">
                        {tickets?.total || 0} تیکت
                    </span>
                </div>
            )}
            
            {displayTickets && displayTickets.length > 0 ? (
                <div className="space-y-4">
                    {displayTickets.map((ticket: ticketType) => (
                        <div key={ticket._id} className="">
                            <CommentBox ticket={true} {...ticket} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white shadow-cs py-8 px-6 rounded-xl w-full text-center">
                    <p className="text-gray-600 mb-2">
                        هنوز تیکتی ثبت نکرده‌اید.
                    </p>
                    <p className="text-sm text-gray-500">
                        می‌توانید سوالات یا مشکلات خود را از این بخش پیگیری کنید.
                    </p>
                </div>
            )}
            
            {/* Pagination - فقط در حالت غیر demo */}
            {!demo && tickets && tickets.totalPages > 1 && (
                <PaginationBox 
                    count={tickets.totalPages}
                    currentPage={tickets.currentPage}
                />
            )}
        </div>
    );
}

export default TicketListBox;