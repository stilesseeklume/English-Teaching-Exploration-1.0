// addAnchors.js - 基于核心关键词匹配，忽略标点、空格、加粗、括号格式
async function addAnchors(params) {
    const { app } = params;
    const activeFile = app.workspace.getActiveFile();
    if (!activeFile) {
        new Notice("请先打开一个套卷笔记");
        return;
    }

    let content = await app.vault.read(activeFile);
    let lines = content.split("\n");
    let newLines = [];
    
    // 阅读篇章：匹配 **A**、A、**A** 等形式
    const readingPattern = /^\s*(\*\*)?\s*([A-D])\s*(\*\*)?\s*$/;
    
    // 其他题型：每个规则包含一个“核心词数组”，行中必须包含所有这些词（忽略标点、空格、括号、加粗）
    const otherRules = [
        {
            // 七选五：必须包含 “第二节” “共5小题” “每小题2.5分” “满分12.5分”
            coreWords: ["第二节", "共5小题", "每小题2.5分", "满分12.5分"],
            anchor: "cloze-7",
            offset: 1
        },
        {
            // 完形填空：必须包含 “第三部分” “满分30分” （“语言运用”可有可无）
            coreWords: ["第三部分", "满分30分"],
            anchor: "cloze",
            offset: 1
        },
        {
            // 语法填空：必须包含 “第二节” “共10小题” “每小题1.5分” “满分15分”
            coreWords: ["第二节", "共10小题", "每小题1.5分", "满分15分"],
            anchor: "grammar",
            offset: 1
        },
        {
            // 写作第二节：必须包含 “第二节” “满分25分”
            coreWords: ["第二节", "满分25分"],
            anchor: "writing2",
            offset: 1
        },
        {
            // 写作第一节：必须包含 “第四部分” “写作” “满分40分”
            coreWords: ["第四部分", "写作", "满分40分"],
            anchor: "writing1",
            offset: 2
        }
    ];
    
    function hasAnchor(line, anchorId) {
        return line && line.includes(`<a id="${anchorId}"></a>`);
    }
    
    function ensureBlankLines(count) {
        for (let i = 0; i < count; i++) {
            if (newLines.length > 0 && newLines[newLines.length - 1] === "") {
                newLines.push("");
            } else {
                newLines.push("");
            }
        }
    }
    
    // 规范化：移除所有标点符号、空格、加粗标记、括号，只保留汉字、数字、字母和小数点
    function normalize(str) {
        // 保留汉字、数字、字母、小数点（用于 2.5 等），去掉其他所有符号
        return str.replace(/[^\u4e00-\u9fa5a-zA-Z0-9.]/g, '');
    }
    
    // 检查一行是否包含所有核心词（规范化后比较）
    function matchesCoreWords(line, coreWords) {
        const normLine = normalize(line);
        for (let word of coreWords) {
            const normWord = normalize(word);
            if (!normLine.includes(normWord)) {
                return false;
            }
        }
        return true;
    }
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        let matched = false;
        
        // 阅读篇章
        let readingMatch = line.match(readingPattern);
        if (readingMatch) {
            matched = true;
            let letter = readingMatch[2].toLowerCase();
            let anchorId = `reading-${letter}`;
            if (i === 0 || !hasAnchor(lines[i-1], anchorId)) {
                newLines.push(`<a id="${anchorId}"></a>`);
            }
            newLines.push(line);
            continue;
        }
        
        // 其他题型
        for (let rule of otherRules) {
            if (matchesCoreWords(line, rule.coreWords)) {
                matched = true;
                let anchorId = rule.anchor;
                let offset = rule.offset;
                let alreadyExists = false;
                for (let j = 1; j <= offset; j++) {
                    if (i - j >= 0 && hasAnchor(lines[i - j], anchorId)) {
                        alreadyExists = true;
                        break;
                    }
                }
                if (!alreadyExists) {
                    const blankCount = offset - 1;
                    ensureBlankLines(blankCount);
                    newLines.push(`<a id="${anchorId}"></a>`);
                }
                newLines.push(line);
                break;
            }
        }
        
        if (!matched) {
            newLines.push(line);
        }
    }
    
    const newContent = newLines.join("\n");
    if (newContent !== content) {
        await app.vault.modify(activeFile, newContent);
        new Notice("✅ 锚点插入完成（核心关键词匹配）");
    } else {
        new Notice("⚠️ 未发现需要插入的锚点，请检查笔记中的标题是否包含核心关键词");
    }
}

module.exports = addAnchors;