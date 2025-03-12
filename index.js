import { fontSplit } from "cn-font-split";
import fs from "fs/promises";

async function splitFonts(textSrc, options = {}) {
  const {
    srcDir = "./src/",
    outputDir = "./font-dist/"
  } = options;

  console.log("根据下列文件生成字符集：");
  console.log(textSrc);

  // 读取源文件
  let text = "";
  for (const src of textSrc) {
    text += await fs.readFile(src, "utf-8");
  }

  console.log(`文本长度: ${text.length}`);

  // 生成字符集
  const charset = [...new Set(text)].map((char) => char.charCodeAt(0));
  console.log(`唯一字符数: ${charset.length}`);

  // 获取字体文件列表
  const fontList = await fs.readdir(srcDir);
  console.log(`字体文件: ${fontList.join(", ")}`);

  // 清空输出目录并忽略错误
  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });

  // 处理每个字体文件
  let resultCss = "";
  for (const font of fontList) {
    const fontName = font.replace(".ttf", "");
    await fontSplit({
      FontPath: srcDir + font,
      destFold: outputDir + fontName,
      subsets: [charset],
      autoChunk: false,
      targetType: "woff2",
      reporter: false,
      testHTML: false,
    });
    resultCss += `@import "${outputDir}${fontName}/result.css";\n`;
    console.log(`处理完成: ${font}`);
  }
  // 写入 fonts.css
  await fs.writeFile(outputDir + "fonts.css", resultCss, "utf-8");
}

export default splitFonts;
