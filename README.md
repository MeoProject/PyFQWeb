# PyFQWeb - 番茄小说 Web 模块 Python 实现

[![Project Status: Archived - 项目因不可抗力因素已停止开源维护](https://img.shields.io/badge/status-archived-red.svg)](https://example.com)

> ⚠️ **项目状态通告**  
> 因不可抗力因素影响，本项目自即日起停止开源维护，仓库仅保留基础框架文件及非核心衍生项目源码供技术研究参考。

## 项目背景
本项目为 [番茄Web模块](https://github.com/fengyuecanzhu/FQWeb)（原项目已删除）的 Python 重构实现，在完整保留原有功能和接口的基础上进行扩展。

## 部署指南

### 环境配置
```bash
# 方案一：使用 Poetry 管理
poetry install --no-dev

# 方案二：使用 pip 直接安装
pip install -r requirements.txt
```

### 启动方式
```bash
# 标准启动
python main.py

# 使用 PM2 进程管理
pm2 start npm --name "pyfqweb" -- start
```

## API 接口规范

### 核心端点

| 功能分类 | 端点路径                                 | HTTP 方法 | 参数说明                                                                 |
|----------|------------------------------------------|-----------|--------------------------------------------------------------------------|
| 搜索     | `/search`                                | GET       | `query`: 关键词<br>`offset=0`: 分页偏移量（计算式：(page-1)*10）<br>`tab_type=3`: 搜索类型（默认书籍）           |
| 书籍元数据 | `/info`<br>`/detail`                   | GET       | `book_id`: 书籍唯一标识符                                                |
| 目录结构 | `/catalog`<br>`/directory/all_items`    | GET       | `book_id`: 书籍唯一标识符                                                |
| 内容获取 | `/content`                              | GET       | `item_id`: 章节ID<br>`text_mode=false`: [bool]纯文本模式<br>`image_mode=true`: [bool]图片包含 |
| 批量操作 | `/multi-content`<br>`/multi-detail`     | GET       | `book_id`: 书籍ID（必须）<br>`item_ids`: 逗号分隔的ID列表（仅multi-content）                        |
| 正文预览 | `/item-summary`                         | GET       | `book_id`: 书籍ID<br>`item_ids`: 逗号分隔的章节ID列表                   |
| 听书服务 | `/audio`                                | GET       | `item_ids`: 音频ID列表                                                   |
| 短剧服务 | `/video`                                | GET       | `item_ids`: 视频ID列表                                                   |
| 接口信息 | `/self-info`                            | GET       | 无                                       |

### 扩展接口
```markdown
对于未明确列出的API端点，支持通过以下方式调用：
- 请求路径：保持与官方API一致
- 参数规范：遵循原始请求参数
- 请求体格式：保持与官方API一致
```

## 协议条款

### 授权声明
本项目依照 [GPLv3](https://www.gnu.org/licenses/gpl-3.0.html) 协议分发，附加条款与GPLv3冲突时，以下条款优先适用。

---

### 术语定义
1. **"本项目"** 指 PyFQWeb 及其衍生版本
2. **"使用者"** 指运行、修改或分发本软件的任何个人或实体
3. **"版权内容"** 包括但不限于：
   - 文字作品（正文、摘要等）
   - 视觉元素（封面、插图等）
   - 元数据（作者信息、分类标签等）

---

### 核心条款

#### 数据合规性
1. 内容获取途径：
   - 数据源：番茄小说、今日头条等平台的公开接口
   - 免责声明：不保证数据的完整性、时效性及合法性

#### 版权管理
2. 内容处置要求：
   - 缓存数据须在 **24小时（自然日）** 内清除
   - 禁止对版权内容进行逆向工程或商业利用

#### 责任豁免
3. 开发者不承担因以下情况导致的任何责任：
   - 违反当地法律法规的使用行为
   - 数据泄露或滥用造成的损失
   - 服务中断引发的商业影响

#### 使用限制
4. 严格禁止：
   - 将本项目用于商业盈利场景
   - 规避平台版权保护机制
   - 实施自动化爬虫等滥用行为

#### 协议变更
5. 修订条款自发布之日起自动生效，继续使用视为接受修订内容

---

> 📘 **版权倡议**  
> 本项目仅供技术研究用途，建议通过正规渠道支持内容创作者。文学创作不易，请尊重知识产权。
