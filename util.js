const { mkdir } = require("fs");
const { join } = require('path');

const resolvablePromise = () => {
  let resolve;
  let reject;
  const promise = new Promise((_resolve, _reject) => {
    resolve = (...args) => {
      promise.fullfilled = true;
      promise.pending = false;
      // @ts-ignore
      _resolve(...args);
    };
    reject = (...args) => {
      promise.rejected = true;
      promise.pending = false;
      // @ts-ignore
      _reject(...args);
    };
  });
  promise.resolve = resolve;
  promise.reject = reject;
  promise.pending = true;
  return promise;
};

const fakeAuth = async (page) => {
  // DEMO：先写死cookie以实现接口鉴权
  await page.setCookie({
    name: "x-token",
    value: "0362c9f999ed8468cbe30e177a6db2051",
    domain: ".test.bytello.com",
  });
  await page.setCookie({
    name: "x-auth-brand",
    value: "bytello",
    domain: ".test.bytello.com",
  });
  await page.setCookie({
    name: "x-auth-app",
    value: "bytello-class-pro",
    domain: ".test.bytello.com",
  });
  await page.setCookie({
    name: "ifp_user_language",
    value: "en-US",
    domain: ".test.bytello.com",
  });
};

const renderHtml = (content) => {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />·
      <title>Document</title>
      <style>
      html {
          line-height: 1.15;
          -webkit-print-color-adjust: exact;
        }
        body {
          margin: 0;
          font-family: "Times New Roman",'宋体';
          font-weight: 400;
        }
      </style>
    </head>
    <body>
      ${content}
    </body>
  </html>`;
};
const mkdir2 = async (publicPath, tmp) => {
  const projectFolder = join(__dirname, publicPath, tmp);
  return new Promise((resolve) => {
    mkdir(projectFolder, { recursive: true }, (err, p) => {
      resolve(p)
    });
  })

};
module.exports = {
  resolvablePromise,
  fakeAuth,
  renderHtml,
  mkdir2
};
