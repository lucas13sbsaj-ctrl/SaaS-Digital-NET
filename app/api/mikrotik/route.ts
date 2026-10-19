import { NextResponse } from 'next/server';

// Credenciais e IP do MikroTik (idealmente configuradas no .env.local)
const MIKROTIK_HOST = process.env.MIKROTIK_HOST || '192.168.88.1';
const MIKROTIK_USER = process.env.MIKROTIK_USER || 'admin';
const MIKROTIK_PASS = process.env.MIKROTIK_PASS || '';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pppoeLogin = searchParams.get('login');
  const days = searchParams.get('days') || '10';

  if (!pppoeLogin) {
    return NextResponse.json({ error: 'Login PPPoE não informado' }, { status: 400 });
  }

  try {
    // Exemplo de integração real com a API REST do MikroTik (RouterOS v7+)
    // Certifique-se de ativar o serviço WWW-SSL / API REST na sua Routerboard
    /*
    const response = await fetch(`https://${MIKROTIK_HOST}/rest/ppp/active?name=${pppoeLogin}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${MIKROTIK_USER}:${MIKROTIK_PASS}`).toString('base64'),
      },
      // Desativar verificação de certificado se usar auto-assinado
      // agent: new https.Agent({ rejectUnauthorized: false })
    });
    const data = await response.json();
    */

    // Como fallback estruturado para o teu ambiente de testes / produção inicial:
    // Retornamos a estrutura pronta para consumir a RouterOS
    const mockMikrotikResponse = {
      success: true,
      login: pppoeLogin,
      isOnline: true,
      ipAddress: '10.50.15.42',
      macAddress: 'CC:2D:E0:1A:B2:C3',
      uptime: '5 dias, 14 horas',
      routerModel: 'ONU Huawei / MikroTik CCR',
      periodDays: parseInt(days),
      dropsCount: 1,
      history: [
        `[${new Date().toLocaleDateString()}] Sessão PPPoE estabelecida com sucesso. IP: 10.50.15.42`,
        `[Queda Registada] LCP echo timeout detectado no concentrador nos últimos ${days} dias.`
      ]
    };

    return NextResponse.json(mockMikrotikResponse);
  } catch (error: any) {
    console.error('Erro ao comunicar com o MikroTik:', error.message);
    return NextResponse.json({ error: 'Falha ao conectar com o MikroTik' }, { status: 500 });
  }
}