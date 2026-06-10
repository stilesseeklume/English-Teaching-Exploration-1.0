# 主域迁移：教学系统接管 seeklume.work Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把英语教学系统从 `englishteaching.seeklume.work` 迁到 apex `seeklume.work`，并弃用旧子域；个人官网释放 apex 后暂留 github.io 默认地址，等用户另购新域名。

**Architecture:** GitHub Pages 同一自定义域名只能绑一个仓库。迁移=「个人官网仓库释放 apex」→「教学系统仓库认领 apex」两步串行，顺序不可颠倒。apex 的 DNS A 记录本就指向 GitHub Pages，仓库间换绑无需改 registrar DNS。

**Tech Stack:** GitHub Pages（legacy 分支部署）、gh CLI（已登录 stilesseeklume）、两个仓库：`English-Teaching-Exploration-1.0`（教学，main/docs）、`Seeklume-homepage`（官网，gh-pages/）。

---

## ⚠️ 关键顺序与风险

1. **必须先释放后认领**：Task 1（官网释放 apex）完成并生效后，才能做 Task 2（教学认领）。否则 GitHub 报 "domain already taken"。
2. **HTTPS 证书重签窗口**：教学仓库认领 apex 后，GitHub 需为 `seeklume.work` 重新签发 Let's Encrypt 证书，约几分钟~1 小时；期间 https 可能闪断。建议低峰执行。`https_enforced=true` 只能在证书 approved 后再设，过早设会 422。
3. **官网暂态**：释放 apex 后，官网仅在 `stilesseeklume.github.io/Seeklume-homepage` 可访问（公开但无外链），直到用户给它指新域名。
4. **部署落点**：教学站 Pages 源是 `main` 分支 `/docs`。`docs/CNAME` 与文档改动必须最终落到 `main` 才会部署（按既定 feature→main→push 流程；push 需解除沙箱）。

---

## Task 1: 个人官网仓库释放 apex（前置，必须先做）

**Files / Targets:**
- API: `repos/stilesseeklume/Seeklume-homepage/pages`（清 cname）
- Remove: `Seeklume-homepage` 仓库 `gh-pages` 分支根的 `CNAME`（线上源，必删）
- Remove: `Seeklume-homepage` 仓库默认分支的 `public/CNAME`（防下次 build 重新写回）

- [ ] **Step 1: 删除 gh-pages 分支上的 CNAME 文件（取 sha 再删）**

```bash
SHA=$(gh api repos/stilesseeklume/Seeklume-homepage/contents/CNAME?ref=gh-pages --jq .sha)
gh api --method DELETE repos/stilesseeklume/Seeklume-homepage/contents/CNAME \
  -f message="chore: release seeklume.work apex (移交英语教学系统)" \
  -f sha="$SHA" -f branch="gh-pages"
```

- [ ] **Step 2: 清掉 Pages 设置里的自定义域名**

```bash
echo '{"cname":null}' | gh api --method PUT repos/stilesseeklume/Seeklume-homepage/pages --input -
```

- [ ] **Step 3: 删除默认分支的 public/CNAME，避免重建时复活（在本地克隆操作）**

```bash
cd ~/Desktop/Seeklume/seeklume-home
DEFBR=$(gh repo view stilesseeklume/Seeklume-homepage --json defaultBranchRef --jq .defaultBranchRef.name)
git checkout "$DEFBR" && git pull
git rm public/CNAME dist/CNAME 2>/dev/null || git rm public/CNAME
git commit -m "chore: 停止认领 seeklume.work apex（移交教学系统）"
git push
```

- [ ] **Step 4: 验证 apex 已被官网释放**

```bash
gh api repos/stilesseeklume/Seeklume-homepage/pages --jq '.cname'   # 期望: null
```
Expected: 输出 `null`（或空）。若仍是 `seeklume.work`，等 30s 重试，确认 Step 1/2 生效后再进 Task 2。

---

## Task 2: 教学系统仓库认领 apex

**Files:**
- Modify: `docs/CNAME`（`englishteaching.seeklume.work` → `seeklume.work`）
- API: `repos/stilesseeklume/English-Teaching-Exploration-1.0/pages`

- [ ] **Step 1: 改 docs/CNAME**

`docs/CNAME` 全文改为：
```
seeklume.work
```

- [ ] **Step 2: 提交并使其落到 main（部署源）**

按既定流程把本改动合到 `main` 并 push（push 需解除沙箱）。仅提交本次相关文件，勿做无关 git 手术。

- [ ] **Step 3: 在 Pages 设置认领 apex（先只设 cname，暂不强制 https）**

```bash
echo '{"cname":"seeklume.work"}' | gh api --method PUT repos/stilesseeklume/English-Teaching-Exploration-1.0/pages --input -
```
Expected: 返回 JSON，`cname` 为 `seeklume.work`。若报 "already taken"，回 Task 1 Step 4 确认释放。

- [ ] **Step 4: 等证书 approved 后强制 https**

```bash
gh api repos/stilesseeklume/English-Teaching-Exploration-1.0/pages --jq '.https_certificate.state'  # 等到 approved
echo '{"cname":"seeklume.work","https_enforced":true}' | gh api --method PUT repos/stilesseeklume/English-Teaching-Exploration-1.0/pages --input -
```
Expected: `state` 变为 `approved` 后再执行第二条；过早执行会 422，等待重试即可。

---

## Task 3: 更新文档中的旧域名引用

**Files（全部 `englishteaching.seeklume.work` → `seeklume.work`）:**
- Modify: `README.md:8`
- Modify: `PROJECT_CHARTER.md:76`
- Modify: `PROJECT_CHARTER.md:123`
- Modify: `docs/planning/release-runbook.md:48`
- Modify: `docs/help/new-user-manual.md:29`

- [ ] **Step 1: 逐处替换域名**

把上述各行内的 `englishteaching.seeklume.work` 改为 `seeklume.work`。`PROJECT_CHARTER.md:123` 那行架构描述同样更新为 `seeklume.work（GitHub Pages · docs/）`。

- [ ] **Step 2: 确认无残留**

```bash
grep -rn "englishteaching" --include="*.md" --include="*.html" --include="*.js" . | grep -v node_modules
```
Expected: 无输出（计划文件本身的提及可忽略）。

- [ ] **Step 3: 随 Task 2 一起提交到 main**

文档改动与 `docs/CNAME` 同批次提交、push。

---

## Task 4: 端到端验证（DNS/证书生效后）

- [ ] **Step 1: apex 服务教学系统**

```bash
curl -sI https://seeklume.work/ | head -5
curl -s https://seeklume.work/ | grep -i "English Teaching"
```
Expected: 头部 `HTTP/2 200` + `server: GitHub.com`；正文含 `Seeklume · English Teaching`。

- [ ] **Step 2: 旧子域已弃用**

```bash
curl -sI https://englishteaching.seeklume.work/ | head -3
```
Expected: `404`（无仓库认领该子域 = 弃用成功）。

- [ ] **Step 3: 官网暂态可访问**

```bash
curl -sI https://stilesseeklume.github.io/Seeklume-homepage/ | head -3
```
Expected: `200`（官网在默认地址存活，等用户指新域名）。

---

## 可选清理（用户在域名服务商侧操作，我无法代点）

- `englishteaching` 的 DNS CNAME 记录可删可留：留着只会 404，删掉更干净。
- apex `seeklume.work` 的 A 记录（→ GitHub Pages IP）**保持不动**。

## Rollback（如需回退）

1. 教学仓库：`docs/CNAME` 改回 `englishteaching.seeklume.work`，Pages cname 同步改回。
2. 官网仓库：gh-pages 根恢复 `CNAME=seeklume.work`，Pages cname 设回 `seeklume.work`。
3. 等证书各自重签。
