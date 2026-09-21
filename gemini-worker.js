export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const body = await request.text();
      // جوجل وقفت "gemini-2.5-flash-lite" عن المستخدمين الجدد (رجعت الخطأ ده بالظبط
      // لما جربناه)، وقالت صراحة في رسالة الخطأ نفسها نستخدم "gemini-3.5-flash-lite"
      // بدالها. ده إصدار "lite" برضو يعني حده المجاني في الطلبات المفروض يفضل واسع،
      // مناسب لمنصة بتستخدم الذكاء الاصطناعي بكثرة (بناء محتوى + شات المدرب الذكي).
      const model = 'gemini-3.5-flash-lite';
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': env.GEMINI_API_KEY,
          },
          body,
        }
      );
      const text = await resp.text();
      return new Response(text, {
        status: resp.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: { message: String(err) } }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
  },
};
