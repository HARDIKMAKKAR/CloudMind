import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 200,
  duration: '5m',
};

export default function () {
  http.get('http://localhost:44927');
  sleep(1);
}