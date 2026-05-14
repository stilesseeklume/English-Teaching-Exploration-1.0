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
TABLE date
FROM "套卷解析"
WHERE publish = true
SORT date DESC
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