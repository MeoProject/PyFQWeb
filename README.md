# PyFQWeb - 番茄Web 模块 Python 实现

本项目受 [番茄Web模块](https://github.com/fengyuecanzhu/FQWeb)（已删库） 的启发，使用 Python 实现了本模块的所有功能，并在此基础上进行了扩展。  
**由于受到不可抗力影响，本项目已停止开源，此处仅做非必要文件的保留。**

## 部署方案
1. 本项目支持 Poetry 环境部署。
2. 使用 pip 安装依赖，直接获取环境。
3. 本项目支持使用 pm2 作为运行管理器，并支持使用 npm 作为启动器（但仍需 Python 环境及依赖完整）
4. 可以直接运行 main.py 启动

## API 接口 

### 搜索
```
/search?query=搜索词&offset=偏移量（(page-1)*10）
```

### 详情
```
/info?book_id=书籍id
/detail?book_id=书籍id
```

### 目录
```
/catalog?book_id=书籍id
/directory/all_items?book_id=书籍id
```

### 正文
```
/content?item_id=章节id
```

### 批量正文
```
/multi-content?book_id=书籍id&item_ids=用逗号分割的多个item_id
```

### 批量详情
```
/multi-detail?book_id=用逗号分隔的多个book_id
```

### 正文预览
```
/item-summary?book_id=书籍id&item_ids=用逗号分隔的多个item_id
```

### 分类列表
```
/category-front?tab_type=
```

### 分类书籍
```
/category-landing?category_id=用逗号分隔的多个item_id&tone_id=音色id
```

### 听书
```
/audio?item_ids=
```

### 其他
```
对于未在此处列出的API，可以通过番茄官方的请求PATH、参数、请求体等进行请求
```

## 协议
### 开头语
本项目基于 GPLv3 协议发行，以下内容为对该协议的补充，如有冲突，以下方内容为准。

----

### 词语约定
 1.  本协议中的“本项目”指 PyFQWeb 项目
 2.  “使用者”指签署本协议的项目使用者
 3.  “版权内容”为字节跳动旗下平台或其他平台授权字节跳动公司使用，包括但不限于：
   - 正文
   - 封面
   - 姓名
  等他人拥有版权的所有数据

----

### 协议正文
#### 一、数据来源
 1.1 本项目从番茄小说、今日头条等 APP 的公开服务器中拉取处理内容后返回，故不对此类数据的准确性、安全性、合法性等负责。
 1.2 本项目使用中可能会产生本地内容，本项目不对此类数据的准确性、安全性、合法性等负责

#### 二、版权数据
 2.1 本项目在使用中可能会产生版权数据。对于这些版权数据，本项目不拥有其所有权。为了避免侵权，使用者务必在**24小时内**清除使用本项目的过程中所产生的版权数据。

#### 三、本地资源
 3.1 本项目中的部分本地内容（包括但不限于 图片、文字 等）来自互联网搜集。如出现侵权请联系删除。

#### 四、免责声明
 4.1 由于使用本项目产生的包括由于本协议或由于使用或无法使用本项目而引起的任何性质的任何直接、间接、特殊、偶然或结果性损害（包括但不限于因商誉损失、停工、计算机故障或故障引起的损害赔偿，或任何及所有其他商业损害或损失）由使用者负责。

#### 五、使用限制
 5.1 **禁止在违反当地法律法规的情况下使用本项目。** 对于使用者在明知或不知当地法律法规不允许的情况下使用本项目所造成的任何违法违规行为由使用者承担，本项目不承担由此造成的任何直接、间接、特殊、偶然或结果性责任。

#### 六、版权保护
 6.1 平台不易，建议支持正版

#### 七、非商业性质
 7.1 本项目开发旨在对于技术可行性的探究，不接受任何商业性行为，使用者也不得使用本项目进行任何商业性行为。

#### 八、协议生效
 8.1 如您使用本项目，即代表您接受本协议。  
 8.2 因违反协议而造成的任何损失，本项目开发者不承担任何包括但不限于道德、法律责任。  
 8.3 本协议可能会发生变更，恕不另行通知，可自行前往查看。协议变更后，如您继续使用本项目，**即默认您接受变更后的新协议内容**
