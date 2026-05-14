---
type: {{VALUE:type}}
year: {{VALUE:year}}
exam: {{VALUE:exam}}
question_type: 阅读理解
question_id: A篇
---
# {{VALUE:exam}} - 阅读理解 A篇

<%*
// 获取全局变量
let examName = tp.frontmatter.exam;
// 源文件完整路径（假设原套卷笔记在“题库”文件夹下，文件名为“套卷名称_套卷.md”）
let sourceFileName = "[[题库/" + examName + "_套卷.md]]";
// 读取源文件内容
let sourceContent = await tp.file.include(sourceFileName);
// 定义要提取的锚点ID
let anchorId = "reading-a";
let startTag = `<a id="${anchorId}"></a>`;
let startIndex = sourceContent.indexOf(startTag);
if (startIndex !== -1) {
    let startPos = startIndex + startTag.length;
    // 查找下一个锚点标签的位置
    let nextAnchorIndex = sourceContent.indexOf('<a id=', startPos);
    let endIndex = nextAnchorIndex !== -1 ? nextAnchorIndex : sourceContent.length;
    let extracted = sourceContent.substring(startPos, endIndex).trim();
    tR += extracted;
} else {
    tR += "（未找到对应内容，请检查锚点 ID 或原套卷笔记名称）";
}
%>