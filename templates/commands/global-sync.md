---
name: /global-sync
id: global-sync
category: 工作流
description: 技术方案转功能概述 → 提交到全局 Rules/Skills → 同步规范到 openspec/specs
---
> **「配置根」**：当前 agent 对应的 AI 工具配置目录（`flow2spec init` 写入，常见 **`.cursor/`**、**`.claude/`**、**`.codex/`**）。下文 **`配置根/...`** 指该目录下的相对路径。

# global-sync（方案→概述→全局 Rules/Skills→同步规范）

将**技术方案**转为《终稿模版》规范格式，**提交到全局 Rules、Skills 与文档索引**，并在传入变更名时执行 **opsx-sync**，把该变更中的 delta 规范同步到主规范（`openspec/specs/`）。适用于开发过程中产生的**全局型或公共型**设计，既沉淀到 Cursor 上下文（Rules/Skills），又同步到项目官方能力规范（openspec/specs）。

**输入（兼容两种用法）**：

- **方式 A：传技术方案路径**  
  第一个参数为**技术方案文档路径**（如 **`.cursor/req-docs/xxx技术方案.md`**、`配置根/stock-docs/xxx.md`）。  
  可选第二个参数为**变更名**（如 `add-auth`）；若提供，则在提交到全局 Rules/Skills 后对该变更执行 **opsx-sync**（将变更内 delta spec 同步到 `openspec/specs/`）。
- **方式 B：传变更名**  
  第一个参数为**变更名**（如 `add-auth`），且不包含路径分隔符或 `.md`。  
  则从该变更目录中取技术方案来源（见下文「变更名 → 技术方案来源」），再执行转换、提交到全局 Rules/Skills，最后对该变更执行 **opsx-sync**。

**若未提供任何参数**：请向用户说明本命令需传入「技术方案路径」或「变更名」，并简要说明：作用为**将方案转概述、提交到全局 Rules/Skills，并可选将变更内规范同步到 openspec/specs**。

---

## 一、如何区分「技术方案路径」与「变更名」

- 若参数中**包含** `/`、`\`、`.md`、`docs`、`配置根`（如 `.cursor`、`.claude`、`.codex`）等路径特征，或明显为文件路径 → 视为**技术方案路径**。
- 若参数为**单一标识**（如 `add-auth`、`ticket-stub`），且**不**像路径 → 视为**变更名**。此时必须检查 `openspec/changes/<name>/` 是否存在；若不存在，提示用户「未找到该变更目录，请确认变更名或改为传入技术方案路径」。

---

## 二、变更名 → 技术方案来源（仅当用户传的是变更名时执行）

当用户传入的是**变更名**时，从该变更目录中确定作为「技术方案」的输入文件，按下列优先级：

1. **`openspec/changes/<name>/design.md`**  
   若存在，优先将其作为技术方案输入（设计文档即技术方案）。
2. **`openspec/changes/<name>/specs/<capability>/spec.md`**  
   若存在多个 capability，取第一个或合并多份 spec 作为输入（由你根据内容量决定：若仅一份则用该份；若多份且较短可合并为一份再转换）。
3. **`openspec/changes/<name>/proposal.md`**  
   若 design 与 specs 均不存在，则用 proposal 作为输入。

若以上均不存在，回复用户「该变更下未找到可用的技术方案文档（design.md / specs/*/spec.md / proposal.md），请直接传入技术方案路径，或先在变更中创建 design.md / specs 后再执行本命令。」

---

## 三、执行步骤（按顺序）

### 步骤 1：确定「技术方案」输入路径与是否同步规范

- **若用户传的是技术方案路径**：  
  - 输入路径 = 用户传入的路径（相对于配置根的父目录）。  
  - 是否同步规范：若用户同时传了第二个参数（变更名），则对该变更执行 **opsx-sync**；否则不同步，在结束时提示「若需将变更内规范同步到 openspec/specs，请提供变更名并再次执行本命令（或传入两参：技术方案路径 变更名）」。
- **若用户传的是变更名**：  
  - 按「二、变更名 → 技术方案来源」确定输入文件路径。  
  - 同步规范 = 是，同步对象即该变更名。

### 步骤 2：用 /spec2context-md 转为《终稿模版》

- 读取并执行 `配置根/commands/spec2context-md.md` 中的逻辑（或项目内等价命令说明）。
- **输入**：步骤 1 确定的**技术方案路径**（可能是 **`配置根/req-docs/xxx.md`** 或 `openspec/changes/<name>/design.md` 等）。
- **输出**：得到符合《终稿模版》的文档，默认写入 **`配置根/stock-docs/<方案名>.md`**（方案名由一级标题或文件名推断，做合法文件名处理）。
- 若输入为 PDF，按 spec2context-md 的「流程二」处理：先产出初稿并提示用户确认后再转模板格式；本命令可在用户确认后再次执行并传入初稿路径，或在本轮仅完成「PDF → 初稿」并说明下一步。

### 步骤 3：用 /generateProjectContext 提交到全局 Rules、Skills、索引

- 读取并执行 `配置根/commands/generateProjectContext.md` 中的逻辑。
- **输入**：步骤 2 产出的 **`配置根/stock-docs/<方案名>.md`**。
- **输出**：更新/生成 `配置根/rules/`、`配置根/skills/`、`配置根/docs-index.md` 及 main 等，即**提交到全局 Rules、Skills 与文档索引**（本命令的核心作用之一）。

### 步骤 4：若需要同步规范，执行 /opsx-sync

- **仅当**步骤 1 确定「同步规范 = 是」时执行。
- 读取并执行 `配置根/commands/opsx-sync.md` 中的逻辑。
- **输入**：变更名（用户传入的变更名，或用户作为第二参数传入的变更名）。
- **行为**：将 `openspec/changes/<name>/specs/` 下的 delta spec 同步到主 spec（`openspec/specs/<capability>/spec.md`），即把变更中的**全局型/公共型**规范沉淀到项目官方能力规范目录。

---

## 四、回复与总结

- 每步完成后可简要说明该步结果（如：已生成 `配置根/stock-docs/<方案名>.md`；**已提交到全局 Rules、Skills、索引**；若执行了同步规范则说明更新了哪些 capability）。
- **若未执行同步规范**：在结尾明确提示「若需将变更内规范同步到 openspec/specs，请提供变更名并再次执行本命令，或传入两参：技术方案路径 变更名」。
- **若已执行同步规范**：按 opsx-sync 的约定输出摘要（变更名、已更新的 capability、requirement 新增/修改/删除等）。

---

## 五、约束与注意

- 路径均相对于**配置根的父目录**；顺序为：转功能概述 → **提交到全局 Rules/Skills** → 可选**同步规范**，不可颠倒。
- 本命令融合「方案转概述 + generateProjectContext + opsx-sync」：前两步沉淀到 Cursor 全局上下文，第三步将变更内 delta spec 同步到 `openspec/specs/`，适合**全局型/公共型**设计的一次性落地。
- 传入变更名时，必须先能从变更目录中找到技术方案来源，否则提示用户改传路径或补全 design/specs/proposal。
- 同步规范步骤完全遵循 opsx-sync 的规则（读取 delta 与主 spec、智能合并、幂等等），不跳过或简化其逻辑。
