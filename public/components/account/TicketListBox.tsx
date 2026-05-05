import { paginatedTicketsType, ticketType } from "@/public/types/ticket";
import CommentBox from "@/public/components/comment/CommentBox";
import PaginationBox from "@/public/components/pagination/PaginationBox";

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
        <>

            {displayTickets.map((ticket: ticketType) => (
                <div key={ticket._id} className="">
                    <CommentBox
                        ticket={true}
                        {...ticket}
                    />
                </div>
            ))}

            {/* Pagination - فقط در حالت غیر demo */}
            {!demo && tickets && tickets.totalPages > 1 && (
                <PaginationBox
                    count={tickets.totalPages}
                    currentPage={tickets.currentPage}
                />
            )}
        </>
    );
}

export default TicketListBox;