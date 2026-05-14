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
  年份 AS "年份",
  卷别 AS "卷别",
  主题 AS "主题",
  难度 AS "难度",
  主线 AS "主线"
FROM #七选五 
SORT 年份 DESC, 卷别 ASC
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