// next
import Image from 'next/image';

// components
import { repliesType } from '@/public/types/replies';

// icons and images
import AccountCircleTwoToneIcon from '@mui/icons-material/AccountCircleTwoTone';
import Logo from '@/public/images/Logo.webp';

const getReplyStatus = (status: string): string => {
    switch (status) {
        case "owner": return "مدیر";
        case "admin": return "ادمین";
        default: return "کاربر";
    }
};

function ReplyBox({ txt, userId, createdAt }: repliesType) {
    const status = getReplyStatus(userId.status);

    return (
        <div className="bg-slate-200 p-4 rounded-xl">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-400">
                {status == "مدیر" || status === "ادمین" ? (
                    <Image
                        src={Logo}
                        alt={userId.name}
                        width={64}
                        height={64}
                        className="rounded-full"
                    />
                ) : (
                    <AccountCircleTwoToneIcon className="text-slate-500" sx={{ fontSize: '4rem' }} />
                )}

                <div>
                    <p>
                        {userId.name} <span className="font-bold">| {status}</span>
                    </p>
                    <p className="text-sm text-slate-500">
                        {new Date(Number(createdAt)).toLocaleString('fa-IR')}
                    </p>
                </div>
            </div>

            <p className="mt-4 whitespace-pre-line">{txt}</p>
        </div>
    );
}

export default ReplyBox;