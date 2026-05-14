<%*
// 1. 获取当前笔记的文件对象（即运行脚本的笔记）
const currentFile = tp.file.find_tfile(tp.file.path(true));
if (!currentFile) {
    new Notice("无法获取当前文件");
    return;
}

// 2. 获取 Dataview API
const dv = app.plugins.plugins.dataview.api;

// 3. 执行查询（你的原始查询）
const query = `
TABLE 
  year AS "年份",
  exam AS "考试名称",
  region AS "地区",
  grade AS "年级"
FROM #套卷 
SORT year DESC, exam ASC
`;
const result = await dv.queryMarkdown(query);

// 4. 处理查询结果
if (result.successful) {
    const content = result.value;  // 这是生成的 markdown 表格
    // 将内容写入当前文件
    await app.vault.modify(currentFile, content);
    new Notice("表格已生成，内容已写入当前笔记！");
} else {
    new Notice("查询失败：" + result.error);
}
%>