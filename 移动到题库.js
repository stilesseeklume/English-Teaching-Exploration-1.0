// moveToFolder.js
async function moveToFolder(params) {
    const { app } = params;
    const file = app.workspace.getActiveFile();
    if (!file) {
        new Notice("请先打开一个笔记");
        return;
    }

    const TARGET_FOLDER = "题库";  // 改为您的目标文件夹

    let folderPath = TARGET_FOLDER;
    if (folderPath.startsWith("/")) folderPath = folderPath.slice(1);
    
    let targetFolder = app.vault.getAbstractFileByPath(folderPath);
    if (!targetFolder) {
        await app.vault.createFolder(folderPath);
        targetFolder = app.vault.getAbstractFileByPath(folderPath);
        new Notice(`📁 已创建文件夹：${folderPath}`);
    }
    
    const newPath = `${folderPath}/${file.name}`;
    if (app.vault.getAbstractFileByPath(newPath)) {
        new Notice(`⚠️ 目标位置已有同名文件：${file.name}，移动失败`);
        return;
    }
    
    await app.vault.rename(file, newPath);
    new Notice(`✅ 已移动到：${folderPath}/${file.name}`);
}

module.exports = moveToFolder;