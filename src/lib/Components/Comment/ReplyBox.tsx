import AccountCircleTwoToneIcon from '@mui/icons-material/AccountCircleTwoTone';
import Image from 'next/image';
import { repliesType } from '@/lib/Types/replies';

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
        <div className="bg-slate-100 p-4 rounded-xl">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-400">
                {userId.img ? (
                    <Image
                        src={`https://api.neynegar1.ir/imgs/${userId.img}`}
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
                        {new Date(createdAt).toLocaleString('fa-IR')}
                    </p>
                </div>
            </div>
            
            <p className="mt-4 whitespace-pre-line">{txt}</p>
        </div>
    );
}

export default ReplyBox;