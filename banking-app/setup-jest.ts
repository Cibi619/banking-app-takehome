import 'jest-preset-angular/setup-jest';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

if (globalThis.fetch) {
  global.fetch = globalThis.fetch;
  global.Response = globalThis.Response;
  global.Request = globalThis.Request;
  global.Headers = globalThis.Headers;
}