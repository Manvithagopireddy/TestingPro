import http from 'k6/http';
import { check, sleep } from 'k6';

const baseUrl = __ENV.API_BASE_URL || 'http://127.0.0.1:3000';

export const options = {
  vus: 2,
  duration: '10s',
  thresholds: {
    http_req_failed: ['rate<0.02'],
    http_req_duration: ['p(95)<1000'],
  },
};

export default function () {
  const health = http.get(`${baseUrl}/health`);
  check(health, { 'health returns 200': (r) => r.status === 200 });

  const login = http.post(
    `${baseUrl}/auth/login`,
    JSON.stringify({ username: 'testuser', password: 'password123' }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  check(login, { 'demo login returns 200': (r) => r.status === 200 });
  sleep(0.25);
}
