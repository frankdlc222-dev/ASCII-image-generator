/// <reference types="vite/client" />

declare module 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.4.1/dist/transformers.min.js' {
  const transformers: any;
  export default transformers;
  export const env: any;
  export const pipeline: any;
}
