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
      // "gemini-flash-latest" بقى بيوجّه لأحدث إصدار (gemini-3.8-flash)، وده لسه جديد
      // وحد الطلبات المجاني بتاعه ضيق جدًا (20 طلب بس في اليوم). "gemini-2.5-flash-lite"
      // إصدار مستقر وحده المجاني أوسع بكتير (تقريبًا 1000 طلب في اليوم)، فهو أنسب لمنصة
      // بتستخدم الذكاء الاصطناعي بكثرة (بناء محتوى + شات المدرب الذكي مع المتدربين).
      const model = 'gemini-2.5-flash-lite';
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
