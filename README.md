# Seeklume · 英语教学系统 1.0

> 面向高中英语教学的模块化工作台原型。公开站当前只发布语法填空讲评；涉及学生成绩隐私的成绩分析不部署到 GitHub Pages。

## 快速开始

用浏览器打开 `docs/index.html`，或部署到 GitHub Pages 后直接访问。

```
docs/
├── index.html           # 系统总入口
├── grammar-fill/        # 语法填空讲评模块
└── data/
    └── grammar_bank.js  # 题库（20 套真题，2023-2026）
```

## 功能

| 模块 | 说明 |
|------|------|
| **按套卷练习** | 20 套真题/模拟卷，按年份折叠，全文内嵌空格 |
| **按考点练习** | 11 个考点分类训练，点击空格弹解析 |
| **错题本** | 独立存储，支持逐题添加 + JSON 批量导入 + 文件拖拽上传 |
| **备课资料** | 导入完整语法填空篇章，像套卷一样讲题，迁移训练自动关联主题库 |
| **考点速查** | 赢在微点方法论，按考点展开解题理论 |

### 隐私边界

- 成绩分析涉及学生姓名、班级、分数和画像，不进入 `docs/`，不公开部署。
- 本地测试副本放在 `private/score-analysis-local/`，该目录已加入 `.gitignore`。
- 公开站只保留语法填空讲评和非敏感题库数据。

### 讲题功能

- **抽屉解析** ⬅ 点击空格弹出，含答案、句子分析、解题技巧、考点理论
- **迁移训练** ⬅ 同考点跨卷关联，每套卷取 1 题，点击展开答案
- **空格导航** ⬅ 抽屉内 ◀ ▶ 按钮 / 键盘 ← → 跳转，Esc 关闭
- **答案切换** ⬅ 一键显示/隐藏原文所有答案
- **考点统计** ⬅ 进入套卷后显示考点分布标签，点击跳转
- **线索高亮** ⬅ 选中空格后原文段落高亮

## 数据存储

| 数据 | 位置 |
|------|------|
| 主题库 | `data/grammar_bank.js`（只读） |
| 错题本 | `localStorage.grammar-error-book` |
| 备课资料 | `localStorage.grammar-lesson-prep` |
| 抽屉高度 | `localStorage.grammar-fill-drawer-height` |

迁移训练始终从主题库关联，不会混入错题或备课数据。

## 导入备课资料

在备课页面点击「批量导入 JSON」，粘贴 JSON 或拖拽文件：

```json
[
  {
    "title": "雅礼中学期末 - 建水紫陶",
    "passage": "Jianshui Purple Pottery, ___36___(shape) by...",
    "blanks": [
      {"no": 36, "answer": "has been shaped", "category": "predicate", "analysis": "现在完成时被动语态…"},
      {"no": 37, "answer": "The", "category": "article", "analysis": "特指用定冠词…"}
    ]
  }
]
```

## 部署

直接编辑 `docs/grammar-fill/index.html` 与 `docs/shared/*.js`，提交后 GitHub Pages 自动发布。

```bash
git add docs/ && git commit -m "更新部署"
git push
```

GitHub Pages 设置：Settings → Pages → Source: Deploy from a branch → `main` / `/docs`

## 项目结构

```
├── docs/                 # GitHub Pages 发布目录（也是开发源）
│   ├── index.html        #   系统总入口
│   ├── config.js         #   Supabase 公开配置
│   ├── grammar-fill/     #   语法填空讲评模块（主应用）
│   ├── shared/           #   抽出来的共享模块（auth/admin/word-import/…）
│   └── data/             #   题库 + 知识图谱（grammar_bank 含 fine_category）
├── data/                 # 原始题库素材
│   ├── grammar_bank.json #   题库 JSON 源
│   ├── exams/            #   真题 markdown（20 套）
│   └── 语法填空库/        #   语法填空原始数据
├── scripts/              # 构建脚本
│   ├── build_grammar_bank.py  # 从 markdown 生成 grammar_bank.js
│   └── deploy.sh              # 同步 data/grammar_knowledge*.js → docs/data/
├── methodology/          # 方法论与研究资料
├── classroom-materials/  # 课堂模板（提纲、自检清单）
└── CLAUDE.md             # AI 协作指南
```
