import dbConnect from "@/lib/DB/db";
import { authBasketMiddleware } from "@/lib/middleware/authMiddleware";

export async function GET(req: Request) {
    try {
        await dbConnect();
        const token = req.headers.get('authorization')

        const authResult = await authBasketMiddleware(token as string);

        if (authResult.status !== 200) {
            return Response.json(authResult.response, { status: authResult.status });
        }
        
        return Response.json(authResult.response, { status: 200 });
    } catch (error) {
        console.error("Error:", error);
        return Response.json({ msg: "Database error", error, state: false }, { status: 500 });
    }
}