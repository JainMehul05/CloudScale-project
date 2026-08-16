const BASE_URL = 'http://localhost:3000';
const DEPLOYMENT_ID = '17b36423-aa31-4d8e-862f-3384b8aca6cc';

async function login() {
  const response = await fetch(`${BASE_URL}/api/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@cloudscale.dev',
      password: 'testpassword',
    }),
    redirect: 'manual',
  });
  
  const cookies = [];
  const setCookieHeader = response.headers.get('set-cookie');
  if (setCookieHeader) {
    cookies.push(setCookieHeader);
  }
  console.log('Login response status:', response.status);
  console.log('Set-Cookie header:', response.headers.get('set-cookie'));
  console.log('All cookies:', cookies);
  return cookies;
}

async function testStatusAPI(cookies) {
  const cookieHeader = cookies.join('; ');
  const response = await fetch(`${BASE_URL}/api/deployments/${DEPLOYMENT_ID}/status`, {
    headers: { 'Cookie': cookieHeader },
  });
  const data = await response.json();
  console.log('Status API response:', JSON.stringify(data, null, 2));
}

async function testLogsAPI(cookies) {
  const cookieHeader = cookies.join('; ');
  const response = await fetch(`${BASE_URL}/api/deployments/${DEPLOYMENT_ID}/logs`, {
    headers: { 'Cookie': cookieHeader },
  });
  console.log('Logs API response status:', response.status);
  const text = await response.text();
  console.log('Logs API response (first 500 chars):', text.substring(0, 500));
}

async function main() {
  const cookies = await login();
  await testStatusAPI(cookies);
  await testLogsAPI(cookies);
}

main().catch(console.error);