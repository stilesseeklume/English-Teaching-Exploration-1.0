---
type: {{VALUE:type}}
year: {{VALUE:year}}
exam: {{VALUE:exam}}
question_type: 阅读理解
question_id: B篇
---
# {{VALUE:exam}} - 阅读理解 B篇

<%*
let examName = tp.frontmatter.exam;
let sourceFileName = "[[题库/" + examName + "_套卷.md]]";
let sourceContent = await tp.file.include(sourceFileName);
let anchorId = "reading-b";
let startTag = `<a id="${anchorId}"></a>`;
let startIndex = sourceContent.indexOf(startTag);
if (startIndex !== -1) {
    let startPos = startIndex + startTag.length;
    let nextAnchorIndex = sourceContent.indexOf('<a id=', startPos);
    let endIndex = nextAnchorIndex !== -1 ? nextAnchorIndex : sourceContent.length;
    let extracted = sourceContent.substring(startPos, endIndex).trim();
    tR += extracted;
} else {
    tR += "（未找到对应内容，请检查锚点 ID 或原套卷笔记名称）";
}
%>