// addFrontmatter.js - 自动定位真正的标题行
async function addFrontmatter(params) {
    const { app } = params;
    const file = app.workspace.getActiveFile();
    if (!file) {
        new Notice("请先打开一个笔记");
        return;
    }

    let content = await app.vault.read(file);
    
    if (/^---\s*\n\s*type:/m.test(content)) {
        new Notice("⚠️ 笔记已有 frontmatter，跳过");
        return;
    }
    
    const frontmatter = generateFrontmatter(content, file.name);
    if (!frontmatter) {
        new Notice("❌ 无法生成 frontmatter，请检查标题格式");
        return;
    }
    
    const newContent = frontmatter + "\n" + content;
    await app.vault.modify(file, newContent);
    new Notice("✅ frontmatter 添加完成");
}

function generateFrontmatter(content, fileName) {
    // 1. 智能定位真正的标题行（跳过明显不是标题的行）
    const lines = content.split("\n");
    let rawTitle = "";
    for (let line of lines) {
        line = line.trim();
        if (!line) continue;
        // 跳过包含“启用前”、“试卷类型”、“注意事项”等关键词的行
        if (/启用前|试卷类型|注意事项|答卷前|考生|选择题|非选择题/i.test(line)) continue;
        // 跳过纯符号或过短的行
        if (line.length < 10) continue;
        // 找到包含年份或“综合测试”、“模拟”等关键词的行
        if (/(20\d{2}|19\d{2})|综合测试|模拟|一模|二模|三模|质检|调研/i.test(line)) {
            rawTitle = line;
            break;
        }
    }
    
    // 如果没找到，回退到第一行或文件名
    if (!rawTitle) {
        rawTitle = lines[0]?.trim() || fileName.replace(/\.md$/, "");
    }
    
    // 清理 rawTitle：去除多余的 ** 和空格，保留核心内容
    // 例如 "**2025年广州市普通高中毕业班综合测试(二)** **英** **语**" -> 提取第一个加粗块
    let titleMatch = rawTitle.match(/\*\*([^*]+)\*\*/);
    if (titleMatch) {
        rawTitle = titleMatch[1];
    } else {
        // 去除首尾的 ** 如果存在
        rawTitle = rawTitle.replace(/^\*\*|\*\*$/g, '');
    }
    // 去除多余的空格和英文单词（如“英语”）
    rawTitle = rawTitle.replace(/\s+[A-Za-z]+$/, '').trim();
    
    // 2. 提取年份
    let year = "";
    const yearMatch = rawTitle.match(/(20\d{2}|19\d{2})/);
    if (yearMatch) year = yearMatch[0];
    
    const isNational = rawTitle.includes("全国");
    let type = isNational ? "真题" : "模拟卷";
    let region = "全国";
    let exam = "";
    let title = "";
    
    if (isNational) {
        let volume = "";
        if (rawTitle.includes("二卷")) volume = "二卷";
        else if (rawTitle.includes("一卷")) volume = "一卷";
        else if (rawTitle.includes("三卷")) volume = "三卷";
        else volume = "卷";
        exam = `${year}全国${volume}`;
        title = exam;
        region = "全国";
    } else {
        // 提取城市
        let place = "";
        const cityKeywords = [ "北京","上海","天津","重庆","广州","深圳","珠海","汕头","佛山","韶关","湛江","肇庆","江门","茂名","惠州","梅州","汕尾","河源","阳江","清远","东莞","中山","潮州","揭阳","云浮","南京","苏州","无锡","常州","镇江","南通","扬州","盐城","徐州","淮安","连云港","泰州","宿迁","杭州","宁波","温州","嘉兴","湖州","绍兴","金华","衢州","舟山","台州","丽水","济南","青岛","淄博","枣庄","东营","烟台","潍坊","济宁","泰安","威海","日照","临沂","德州","聊城","滨州","菏泽","福州","厦门","莆田","三明","泉州","漳州","南平","龙岩","宁德","合肥","芜湖","蚌埠","淮南","马鞍山","淮北","铜陵","安庆","黄山","滁州","阜阳","宿州","六安","亳州","池州","宣城","南昌","九江","景德镇","萍乡","新余","鹰潭","赣州","吉安","宜春","抚州","上饶","郑州","开封","洛阳","平顶山","安阳","鹤壁","新乡","焦作","濮阳","许昌","漯河","三门峡","南阳","商丘","信阳","周口","驻马店","武汉","黄石","十堰","宜昌","襄阳","鄂州","荆门","孝感","荆州","黄冈","咸宁","随州","长沙","株洲","湘潭","衡阳","邵阳","岳阳","常德","张家界","益阳","郴州","永州","怀化","娄底","南宁","柳州","桂林","梧州","北海","防城港","钦州","贵港","玉林","百色","贺州","河池","来宾","崇左","海口","三亚","儋州","成都","自贡","攀枝花","泸州","德阳","绵阳","广元","遂宁","内江","乐山","南充","眉山","宜宾","广安","达州","雅安","巴中","资阳","贵阳","六盘水","遵义","安顺","毕节","铜仁","昆明","曲靖","玉溪","保山","昭通","丽江","普洱","临沧","拉萨","日喀则","昌都","林芝","山南","那曲","西安","铜川","宝鸡","咸阳","渭南","延安","汉中","榆林","安康","商洛","兰州","嘉峪关","金昌","白银","天水","武威","张掖","平凉","酒泉","庆阳","定西","陇南","西宁","海东","银川","石嘴山","吴忠","固原","中卫","乌鲁木齐","克拉玛依","吐鲁番","哈密","石家庄","唐山","秦皇岛","邯郸","邢台","保定","张家口","承德","沧州","廊坊","衡水","太原","大同","阳泉","长治","晋城","朔州","晋中","运城","忻州","临汾","吕梁","呼和浩特","包头","乌海","赤峰","通辽","鄂尔多斯","呼伦贝尔","巴彦淖尔","乌兰察布","沈阳","大连","鞍山","抚顺","本溪","丹东","锦州","营口","阜新","辽阳","盘锦","铁岭","朝阳","葫芦岛","长春","吉林","四平","辽源","通化","白山","松原","白城","哈尔滨","齐齐哈尔","鸡西","鹤岗","双鸭山","大庆","伊春","佳木斯","七台河","牡丹江","黑河","绥化" ];
        for (let city of cityKeywords) {
            if (new RegExp(`${city}市?`).test(rawTitle)) {
                place = city;
                break;
            }
        }
        if (!place) {
            const fallbackMatch = rawTitle.match(/([京津沪渝冀豫辽吉黑苏浙皖闽赣鲁鄂湘粤琼川贵云藏陕甘青宁新]+\s*市?)/);
            if (fallbackMatch) place = fallbackMatch[1].replace(/市$/, "");
        }
        
        // 智能识别模拟次数
        let mock = "";
        const bracketMatch = rawTitle.match(/[（(](\s*[一二三四]\s*)[）)]/);
        if (bracketMatch) {
            const num = bracketMatch[1].trim();
            if (num === "一") mock = "一模";
            else if (num === "二") mock = "二模";
            else if (num === "三") mock = "三模";
            else if (num === "四") mock = "四模";
            else mock = "模拟";
        }
        if (!mock) {
            const mockMatch = rawTitle.match(/(一模|二模|三模|四模|综合测试|模拟|质检|调研)/);
            if (mockMatch) {
                let m = mockMatch[1];
                if (m === "综合测试") mock = "二模";
                else mock = m;
            } else {
                mock = "模拟";
            }
        }
        
        region = place || "未知";
        exam = `${year}${region}${mock}`;
        title = exam;
    }
    
    if (!year) year = "未知";
    if (!exam) exam = "未知";
    if (!title) title = "未知";
    if (!region) region = "未知";
    
    let tags = [exam, "套卷"];
    if (isNational) tags.push("高考真题");
    else tags.push("模拟题");
    tags = [...new Set(tags)];
    
    let safeTitle = title;
    if (/[*:#`>{}[\]|\\]/g.test(safeTitle)) {
        safeTitle = `"${safeTitle.replace(/"/g, '\\"')}"`;
    }
    
    return `---
type: ${type}
year: ${year}
exam: ${exam}
title: ${safeTitle}
grade: 高三
region: ${region}
tags:
  - ${tags.join("\n  - ")}
---`;
}

module.exports = addFrontmatter;