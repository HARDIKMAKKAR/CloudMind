import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 10 },   // normal load
    { duration: '5s', target: 1000 }, // sudden spike
    { duration: '20s', target: 1000 }, // hold
    { duration: '5s', target: 10 },   // scale down
  ],
};

export default function () {
  http.get('http://localhost:44927');
  sleep(1);
}