import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '20s', target: 500 },
    { duration: '20s', target: 1000 },
    { duration: '20s', target: 2000 },
    { duration: '20s', target: 5000 },
    { duration: '20s', target: 10000 },
  ],
};

export default function () {
  http.get('http://localhost:44927');
  sleep(1);
}