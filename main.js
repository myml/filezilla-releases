import puppeteer from "puppeteer";
import { writeFile } from "fs/promises";
async function main() {
  //   const browser = await puppeteer.launch({
  //     executablePath: "/opt/apps/cn.google.chrome-pre/files/google/chrome/chrome",
  //     headless: false,
  //   });

  const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
    headless: true,
  });

  const page = await browser.newPage();
  await page.goto("https://filezilla-project.org/download.php?type=client", {
    waitUntil: "networkidle2",
  });
  const href = await page.evaluate(() => {
    const link = document.querySelector("#quickdownloadbuttonlink");
    return link ? link.href.trim() : null;
  });
  console.log({ href });
  if (href) {
    const info = parseURL(href);
    const outputFile = process.env.GITHUB_OUTPUT || "info.env";
    console.log({ outputFile });
    await writeFile(
      outputFile,
      `download_url="${href}"
version="${info.version}"
filename="${info.filename}"
`
    );
  }
  await page.screenshot({
    path: "screenshot.png", // 保存路径
    fullPage: true, // 是否截取完整页面
  });
  await browser.close();
}

function parseURL(href) {
  const url = new URL(href);
  console.log(url.pathname);
  const filename = url.pathname.split("/").slice(-1)[0];
  const version = filename.split("_")[1];
  const info = { href, version, filename };
  return info;
}

main();
