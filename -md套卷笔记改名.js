// renameToTitle.js
async function renameToTitle(params) {
    const { app } = params;
    const file = app.workspace.getActiveFile();
    if (!file) {
        new Notice("请先打开一个笔记");
        return;
    }

    let content = await app.vault.read(file);
    
    // 提取 frontmatter 中的 title
    const frontmatterMatch = content.match(/^---\n(.*?)\n---/s);
    if (!frontmatterMatch) {
        new Notice("❌ 未找到 frontmatter，请先添加 frontmatter");
        return;
    }
    
    const frontmatter = frontmatterMatch[1];
    const titleMatch = frontmatter.match(/^title:\s*(.*)$/m);
    if (!titleMatch) {
        new Notice("❌ frontmatter 中缺少 title 字段");
        return;
    }
    
    let title = titleMatch[1].trim();
    // 去除可能的引号
    if (title.startsWith('"') && title.endsWith('"')) {
        title = title.slice(1, -1);
    }
    
    if (!title) {
        new Notice("❌ title 字段为空");
        return;
    }
    
    const newName = `${title}_套卷.md`;
    if (file.name === newName) {
        new Notice("文件名已经是目标名称，无需修改");
        return;
    }
    
    // 获取文件所在路径
    const folderPath = file.parent ? file.parent.path : "/";
    const newPath = `${folderPath}/${newName}`;
    
    // 检查是否已存在同名文件
    const existingFile = app.vault.getAbstractFileByPath(newPath);
    if (existingFile) {
        new Notice(`⚠️ 文件 ${newName} 已存在，重命名失败`);
        return;
    }
    
    await app.vault.rename(file, newPath);
    new Notice(`✅ 已重命名为：${newName}`);
}

module.exports = renameToTitle;