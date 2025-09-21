export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface GenerateRequestBody {
    topic?: string;
}

interface SectionSuggestion {
    subtitle: string;
    content: string;
}

interface GenerateResponseBody {
    desc: string;
    sections: SectionSuggestion[];
}

export async function POST(req: Request): Promise<Response> {
    try {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            console.error("[generate-article] Missing OPENROUTER_API_KEY env");
            return new Response(
                JSON.stringify({ error: "Missing OPENROUTER_API_KEY on server" }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        let body: GenerateRequestBody | null = null;
        try {
            body = await req.json();
        } catch (e) {
            console.error("[generate-article] Failed to parse request JSON:", e);
            return new Response(
                JSON.stringify({ error: "Invalid JSON body" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const { topic }: GenerateRequestBody = body || {};
        if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
            return new Response(
                JSON.stringify({ error: "Topic is required" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        console.log("[generate-article] Incoming topic:", topic);
        console.log("[generate-article] Using referer:", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000/");

        const systemPrompt =
            "شما یک نویسنده حرفه‌ای و پژوهشگر هستید که در تولید محتوای فارسی با سبک ادبی و شاعرانه تخصص دارید.";

        const userPrompt = `لطفاً درباره «${topic}» یک مقاله کامل، خواندنی و معتبر بنویس.\n\n` +
            "راهنماها: \n" +
            "1) مقاله به فارسی. \n" +
            "2) مقدمه‌ای کوتاه و شاعرانه که خواننده را جذب کند. \n" +
            "3) حداقل ۷ تا ۸ سرتیتر اصلی و در ابتدای هر سرتیتر یک اموجی مرتبط. \n" +
            "4) در هر بخش توضیحات کامل، تاریخی، فرهنگی و آموزنده. \n" +
            "5) سبک شاعرانه و روان، مناسب وب و سئو. \n" +
            "6) جمع‌بندی پایانی الهام‌بخش. \n" +
            "7) ۱۲۰۰ تا ۱۵۰۰ کلمه. \n" +
            "8) از منابع معتبر الهام بگیر (بازنویسی و خلاصه‌سازی). \n" +
            "9) لحن شبیه نویسندگان ایرانی، جمله‌ها آهنگین. \n" +
            "10) ساختار تمیز با پاراگراف‌های کوتاه و لیست‌ها. \n\n" +
            "فقط و فقط JSON معتبر خروجی بده با ساختار زیر و هیچ متن اضافی ننویس: " +
            "{\n  \"desc\": \"خلاصه/مقدمه شاعرانه 2-3 پاراگراف\",\n  \"sections\": [\n    { \"subtitle\": \"اموجی + تیتر اول\", \"content\": \"متن کامل بخش\" },\n    { \"subtitle\": \"اموجی + تیتر دوم\", \"content\": \"متن کامل بخش\" }\n  ]\n}\n" +
            "تعداد sections را 7 تا 8 قرار بده.";

        async function callOpenRouterWithRetry(maxRetries: number = 2): Promise<Response> {
            let attempt = 0;
            let lastErr: any = null;
            const url = "https://openrouter.ai/api/v1/chat/completions";
            while (attempt <= maxRetries) {
                const startedAt = Date.now();
                try {
                    const controller = new AbortController();
                    const timeoutMs = 30000;
                    const timeout = setTimeout(() => controller.abort(), timeoutMs);
                    const resp = await fetch(url, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${apiKey}`,
                            "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://neynegar1.ir",
                            "X-Title": "NeyNegar CMS Article Generator"
                        },
                        body: JSON.stringify({
                            model: "meta-llama/llama-3.1-70b-instruct",
                            messages: [
                                { role: "system", content: systemPrompt },
                                { role: "user", content: userPrompt }
                            ],
                            temperature: 0.8,
                            response_format: { type: "json_object" }
                        }),
                        signal: controller.signal
                    });
                    clearTimeout(timeout);
                    console.log("[generate-article] OpenRouter status:", resp.status, "attempt:", attempt + 1, "duration(ms):", Date.now() - startedAt);
                    return resp;
                } catch (e: any) {
                    lastErr = e;
                    console.error("[generate-article] OpenRouter fetch error attempt", attempt + 1, e?.message || e);
                    if (attempt === maxRetries) break;
                    const backoff = 500 * Math.pow(2, attempt);
                    await new Promise(r => setTimeout(r, backoff));
                    attempt++;
                }
            }
            throw lastErr;
        }

        const response = await callOpenRouterWithRetry(2);

        if (!response.ok) {
            const text = await response.text();
            console.error("[generate-article] OpenRouter non-OK:", response.status, text);
            return new Response(
                JSON.stringify({ error: "OpenRouter request failed", detail: text }),
                { status: 502, headers: { "Content-Type": "application/json" } }
            );
        }

        let data: any = null;
        try {
            data = await response.json();
        } catch (e) {
            console.error("[generate-article] Failed to parse OpenRouter JSON:", e);
            const raw = await response.text().catch(() => "");
            return new Response(
                JSON.stringify({ error: "Invalid JSON from OpenRouter", detail: raw }),
                { status: 502, headers: { "Content-Type": "application/json" } }
            );
        }
        const content = data?.choices?.[0]?.message?.content;
        if (!content || typeof content !== "string") {
            return new Response(
                JSON.stringify({ error: "Invalid response from model" }),
                { status: 502, headers: { "Content-Type": "application/json" } }
            );
        }

        let parsed: GenerateResponseBody;
        try {
            parsed = JSON.parse(content);
        } catch (e) {
            console.error("[generate-article] JSON parse error:", e, content);
            return new Response(
                JSON.stringify({ error: "Failed to parse JSON from model" }),
                { status: 502, headers: { "Content-Type": "application/json" } }
            );
        }

        // Basic normalization
        const desc = typeof parsed.desc === "string" ? parsed.desc : "";
        const sections = Array.isArray(parsed.sections) ? parsed.sections : [];

        const normalized: GenerateResponseBody = {
            desc,
            sections: sections
                .filter(s => s && typeof s.subtitle === "string" && typeof s.content === "string")
                .slice(0, 8)
        };

        console.log("[generate-article] Success. sections:", normalized.sections.length);
        return new Response(JSON.stringify(normalized), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error: any) {
        console.error("[generate-article] Internal error:", error);
        return new Response(
            JSON.stringify({ error: "Internal Server Error", detail: String(error?.message || error) }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}


