export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface GenerateRequestBody {
    title?: string;
}

interface GenerateResponseBody {
    desc: string;
}

export async function POST(req: Request): Promise<Response> {
    try {
        console.log("[generate-product-desc] Incoming request");
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            console.error("[generate-product-desc] Missing OPENROUTER_API_KEY env");
            return new Response(
                JSON.stringify({ error: "Missing OPENROUTER_API_KEY on server" }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        let body: GenerateRequestBody | null = null;
        try {
            body = await req.json();
            console.log("[generate-product-desc] Parsed body:", body);
        } catch (e) {
            console.error("[generate-product-desc] Failed to parse request JSON:", e);
            return new Response(
                JSON.stringify({ error: "Invalid JSON body" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const { title }: GenerateRequestBody = body || {};
        if (!title || typeof title !== "string" || title.trim().length === 0) {
            console.warn("[generate-product-desc] Missing title in request");
            return new Response(
                JSON.stringify({ error: "Title is required" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }
        console.log("[generate-product-desc] Title:", title);

        const systemPrompt =
            "شما یک کارشناس فروشگاه تخصصی هنر و ادبیات هستید.";

        const userPrompt = `لطفاً برای محصول «${title}» توضیحات کامل و دقیق بنویس.\n\n` +
            "🔹 ساختار خروجی:\n" +
            "1. **معرفی محصول**: توضیحی ادبی و جذاب درباره محصول، شامل کاربردها و ویژگی‌های اصلی.\n" +
            "2. **مشخصات فنی**:\n" +
            "   - اگر کتاب است:\n" +
            "     • قطع یا سایز کتاب\n" +
            "     • تعداد صفحات\n" +
            "     • نام نویسنده یا گردآورنده\n" +
            "     • نوبت چاپ\n" +
            "   - اگر کتاب نیست:\n" +
            "     • اندازه، جنس یا ابعاد محصول\n" +
            "3. **کاربرد هنری**: بنویس که این محصول برای چه نوع هنر یا چه گروهی از هنرمندان مناسب است (مثلاً خوشنویسی نستعلیق، نقاشی سیاه‌قلم، طراحی، آموزش خوشنویسی و …).\n" +
            "4. **جمع‌بندی کوتاه**: در یک جمله بگو چرا این محصول برای هنرمندان ارزشمند است.\n\n" +
            "🔹 الزامات:\n" +
            "- متن باید به زبان فارسی باشد.\n" +
            "- لحن توضیحات باید رسمی، روان و برای وب‌سایت فروشگاهی مناسب باشد.\n" +
            "- متن نه خیلی طولانی و نه خیلی کوتاه باشد (حدود 150 تا 200 کلمه و حداکثر 600 کاراکتر باشد).\n" +
            "- از منابع معتبر آنلاین (مثل سایت یساولی https://yassavoli.com/ و یا قلم تراش https://ghalamtarash.ir/ ) برای استخراج اطلاعات دقیق الهام بگیر اما کپی مستقیم نکن.\n\n" +
            "فقط و فقط JSON معتبر خروجی بده با ساختار زیر و هیچ متن اضافی ننویس: {\n  \"desc\": \"متن توضیحات مطابق دستور بالا\"\n}";

        async function callOpenRouterWithRetry(maxRetries: number = 3): Promise<Response> {
            let attempt = 0;
            let lastErr: any = null;
            const url = "https://openrouter.ai/api/v1/chat/completions";
            while (attempt <= maxRetries) {
                try {
                    const controller = new AbortController();
                    const timeoutMs = 60000;
                    const timeout = setTimeout(() => controller.abort(), timeoutMs);
                    const resp = await fetch(url, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${apiKey}`,
                            "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://neynegar1.ir",
                            "X-Title": "NeyNegar CMS Product Description Generator"
                        },
                        body: JSON.stringify({
                            model: "meta-llama/llama-3.1-70b-instruct",
                            messages: [
                                { role: "system", content: systemPrompt },
                                { role: "user", content: userPrompt }
                            ],
                            temperature: 0.7,
                            response_format: { type: "json_object" }
                        }),
                        signal: controller.signal
                    });
                    clearTimeout(timeout);
                    console.log("[generate-product-desc] OpenRouter status:", resp.status, "attempt:", attempt + 1);
                    return resp;
                } catch (e: any) {
                    lastErr = e;
                    console.error("[generate-product-desc] OpenRouter fetch error attempt", attempt + 1, e?.message || e);
                    if (attempt === maxRetries) break;
                    const jitter = Math.floor(Math.random() * 300);
                    const backoff = 1000 * Math.pow(2, attempt) + jitter; // 1s, 2s, 4s + jitter
                    await new Promise(r => setTimeout(r, backoff));
                    attempt++;
                }
            }
            throw lastErr;
        }

        const response = await callOpenRouterWithRetry(2);
        if (!response.ok) {
            const text = await response.text();
            console.error("[generate-product-desc] OpenRouter non-OK:", response.status, text);
            return new Response(
                JSON.stringify({ error: "OpenRouter request failed", detail: text }),
                { status: 502, headers: { "Content-Type": "application/json" } }
            );
        }

        let data: any = null;
        try {
            data = await response.json();
            console.log("[generate-product-desc] OpenRouter JSON received");
        } catch (e) {
            console.error("[generate-product-desc] Failed to parse OpenRouter JSON:", e);
            const raw = await response.text().catch(() => "");
            return new Response(
                JSON.stringify({ error: "Invalid JSON from OpenRouter", detail: raw }),
                { status: 502, headers: { "Content-Type": "application/json" } }
            );
        }

        const content = data?.choices?.[0]?.message?.content;
        if (!content || typeof content !== "string") {
            console.error("[generate-product-desc] Missing content in OpenRouter response");
            return new Response(
                JSON.stringify({ error: "Invalid response from model" }),
                { status: 502, headers: { "Content-Type": "application/json" } }
            );
        }

        let parsed: GenerateResponseBody;
        try {
            parsed = JSON.parse(content);
            console.log("[generate-product-desc] Parsed model content successfully");
        } catch (e) {
            console.error("[generate-product-desc] JSON parse error:", e, content);
            return new Response(
                JSON.stringify({ error: "Failed to parse JSON from model" }),
                { status: 502, headers: { "Content-Type": "application/json" } }
            );
        }

        const desc = typeof parsed.desc === "string" ? parsed.desc : "";
        console.log("[generate-product-desc] Final desc length:", desc?.length || 0);
        return new Response(JSON.stringify({ desc }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error: any) {
        console.error("[generate-product-desc] Internal error:", error);
        const isTimeout = String(error?.code || "").includes("UND_ERR_CONNECT_TIMEOUT") || /timeout/i.test(String(error?.message || ""));
        const status = isTimeout ? 504 : 500;
        return new Response(
            JSON.stringify({ error: isTimeout ? "Gateway Timeout while contacting model" : "Internal Server Error", detail: String(error?.message || error) }),
            { status, headers: { "Content-Type": "application/json" } }
        );
    }
}


