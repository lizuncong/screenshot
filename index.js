const express = require("express");
const puppeteer = require("puppeteer");
const fs = require('fs');
const { resolvablePromise, mkdir2, renderHtml, fakeAuth } = require("./util");
const app = express();
const publicPath = "imgs";
app.use(express.static(publicPath));

//设置跨域访问
app.all("*", function (req, res, next) {
  res.header(
    "Access-Control-Allow-Origin",
    "https://mars-tch-local.test.bytello.com"
  );
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-c", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("X-Powered-By", " 3.2.1");
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
});

app.get("/export", async (req, res) => {
  let courseInfo = decodeURIComponent(req.query.courseInfo);
  try {
    courseInfo = JSON.parse(courseInfo);
  } catch (e) {
    console.log("e..", e);
  }
  const exportPageUrl = `https://mars-tch-local.test.bytello.com/export?coursewareInfo=${encodeURIComponent(
    JSON.stringify(courseInfo)
  )}`;
  console.log(process.memoryUsage());

  const browser = await puppeteer.launch({ headless: false });
  let page = await browser.newPage();
  await page.setViewport({
    width: courseInfo.extraData.width,
    height: courseInfo.extraData.height,
  });
  await fakeAuth(page);

  let elementHandle;
  const imgsPromise = [];
  for (let i = 0; i < courseInfo.totalPage; i++) {
    imgsPromise[i] = resolvablePromise();
  }
  const temp = `${courseInfo.id}_${courseInfo.requestUid}_${Date.now()}`;
  const dir = await mkdir2(publicPath, temp);
  // 在教师端通过调用window.__puppeteer__screenshot触发puppeteer截图
  const screenshot = async ({ pageNo }) => {
    if (!elementHandle) {
      elementHandle = await page.$("#__export__screenshot__");
    }
    try {
      await elementHandle.screenshot({
        path: `${dir}/p_${pageNo}.png`,
      });
    } catch (e) {}

    imgsPromise[pageNo].resolve();
  };
  // 往window上挂载__puppeteer__screenshot方法，供教师端页面使用
  await page.exposeFunction("__puppeteer__screenshot", screenshot);

  await page.goto(exportPageUrl);

  // 等待全部页面截取完成
  await Promise.all(imgsPromise);
  let imgStr = "";
  for (let i = 0; i < imgsPromise.length; i++) {
    imgStr = imgStr + `<img src="http://localhost:7007/${temp}/p_${i}.png">`;
  }
  const html = renderHtml(imgStr);
  await page.setContent(html, { waitUntil: "networkidle0" });

  await page.pdf({ path: "output.pdf", format: "A4" });
  // 删除目录
  fs.rmdirSync(dir, { recursive: true });
  console.log(process.memoryUsage());
  res.send("Hello World");
});

app.listen(7007);
