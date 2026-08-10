// Vercel Serverless Function
// 브라우저는 이 엔드포인트(/api/notion-sync)만 호출하고,
// 이 함수가 서버에서 대신 Notion API를 호출합니다. (CORS 우회)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, dbId, properties } = req.body || {};

  if (!token || !dbId || !properties) {
    return res.status(400).json({ error: 'token, dbId, properties가 모두 필요합니다.' });
  }

  try {
    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        parent: { database_id: dbId },
        properties
      })
    });

    const data = await notionRes.json();

    if (!notionRes.ok) {
      return res.status(notionRes.status).json({
        error: data.message || 'Notion API 오류',
        details: data
      });
    }

    return res.status(200).json({ success: true, id: data.id, url: data.url });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
