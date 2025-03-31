// ==UserScript==
// @name              番茄小说优化
// @namespace         https://github.com/helloplhm-qwq
// @version           1
// @description       番茄小说免费网页阅读 不用客户端 可下载小说
// @description:zh-cn 番茄小说免费网页阅读 不用客户端 可下载小说
// @description:en    Fanqie Novel Reading, No Need for a Client, Novels Available for Download
// @author            ibxff & Naiy_
// @license           MIT License
// @match             https://fanqienovel.com/*
// @require           https://cdn.bootcdn.net/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js
// @icon              data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDQ4IDQ4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0zNS40Mjg2IDQuODg0MzVDMzkuNjQ2MyA0Ljg4NDM1IDQzLjA4MTYgOC4zMTk3MyA0My4wODE2IDEyLjUzNzRWMzUuNDI4NkM0My4wODE2IDM5LjY0NjMgMzkuNjQ2MyA0My4wODE2IDM1LjQyODYgNDMuMDgxNkgxMi41Mzc0QzguMzE5NzMgNDMuMDgxNiA0Ljg4NDM1IDM5LjY0NjMgNC44ODQzNSAzNS40Mjg2VjEyLjUzNzRDNC44ODQzNSA4LjMxOTczIDguMzE5NzMgNC44ODQzNSAxMi41Mzc0IDQuODg0MzVIMzUuNDI4NlpNMzUuNDI4NiA0SDEyLjUzNzRDNy44MDk1MiA0IDQgNy44MDk1MiA0IDEyLjUzNzRWMzUuNDI4NkM0IDQwLjE1NjUgNy44MDk1MiA0My45NjYgMTIuNTM3NCA0My45NjZIMzUuNDI4NkM0MC4xNTY1IDQzLjk2NiA0My45NjYgNDAuMTU2NSA0My45NjYgMzUuNDI4NlYxMi41Mzc0QzQ0IDcuODA5NTIgNDAuMTU2NSA0IDM1LjQyODYgNFoiIGZpbGw9IiMzMzMiLz48cGF0aCBkPSJNMjkuMTAxNiA0VjEyLjQwMTRMMzIuMzMyOSAxMC41NjQ2TDM1LjU2NDEgMTIuNDAxNFY0SDI5LjEwMTZaIiBmaWxsPSIjMzMzIi8+PHBhdGggZD0iTTI0LjAzNCAxOC4yODU4QzE1LjgzNjcgMTguMjg1OCA4LjU1NzgyIDIxLjg1NzIgNCAyNy4zNjc0VjM1LjQyODZDNCA0MC4xNTY1IDcuODA5NTIgNDMuOTY2IDEyLjUzNzQgNDMuOTY2SDM1LjQyODZDNDAuMTU2NSA0My45NjYgNDMuOTY2IDQwLjE1NjUgNDMuOTY2IDM1LjQyODZWMjcuMjY1NEMzOS40MDgyIDIxLjc4OTIgMzIuMTk3MyAxOC4yODU4IDI0LjAzNCAxOC4yODU4Wk0xNC42MTIyIDM3LjY3MzVDMTMuMTE1NiAzNy42NzM1IDEyLjQwMTQgMzcuMTI5MyAxMi40MDE0IDM2LjQxNUMxMi40MDE0IDM1LjcwMDcgMTMuMDgxNiAzNS4xMjI1IDE0LjU3ODIgMzUuMTIyNUMxNi4wNzQ4IDM1LjEyMjUgMTcuODc3NiAzNi4zODEgMTcuODc3NiAzNi4zODFDMTcuODc3NiAzNi4zODEgMTYuMTA4OCAzNy42NzM1IDE0LjYxMjIgMzcuNjczNVpNMTUuODM2NyAzMS4yMTA5QzE0Ljc0ODMgMzAuMTU2NSAxNC42NDYzIDI5LjI3MjIgMTUuMTU2NSAyOC43NjJDMTUuNjY2NyAyOC4yNTE4IDE2LjU1MSAyOC4zMTk4IDE3LjYzOTUgMjkuNDA4MkMxOC43Mjc5IDMwLjQ2MjYgMTkuMDY4IDMyLjYwNTUgMTkuMDY4IDMyLjYwNTVDMTkuMDY4IDMyLjYwNTUgMTYuODkxMiAzMi4yNjU0IDE1LjgzNjcgMzEuMjEwOVpNMjQuMDM0IDMwLjQ2MjZDMjQuMDM0IDMwLjQ2MjYgMjIuNzQxNSAyOC43Mjc5IDIyLjcwNzUgMjcuMTk3M0MyMi43MDc1IDI1LjcwMDcgMjMuMjUxNyAyNC45ODY0IDIzLjk2NiAyNC45ODY0QzI0LjY4MDMgMjQuOTg2NCAyNS4yNTg1IDI1LjY2NjcgMjUuMjU4NSAyNy4xNjMzQzI1LjI5MjUgMjguNjkzOSAyNC4wMzQgMzAuNDYyNiAyNC4wMzQgMzAuNDYyNlpNMzAuMzYwNSAyOS4zNzQyQzMxLjQ0OSAyOC4zMTk4IDMyLjMzMzMgMjguMjUxOCAzMi44NDM1IDI4LjcyNzlDMzMuMzUzNyAyOS4yMzgxIDMzLjI1MTcgMzAuMTIyNSAzMi4xNjMzIDMxLjE3NjlDMzEuMDc0OCAzMi4yMzEzIDI4LjkzMiAzMi41Mzc1IDI4LjkzMiAzMi41Mzc1QzI4LjkzMiAzMi41Mzc1IDI5LjI3MjEgMzAuNDI4NiAzMC4zNjA1IDI5LjM3NDJaTTMzLjM1MzcgMzcuNjczNUMzMS44NTcxIDM3LjY3MzUgMzAuMDg4NCAzNi4zNDcgMzAuMDg4NCAzNi4zNDdDMzAuMDg4NCAzNi4zNDcgMzEuODU3MSAzNS4wODg1IDMzLjM4NzggMzUuMDg4NUMzNC44ODQ0IDM1LjA4ODUgMzUuNTk4NiAzNS43MDA3IDM1LjU2NDYgMzYuMzgxQzM1LjU2NDYgMzcuMTI5MyAzNC44NTAzIDM3LjY3MzUgMzMuMzUzNyAzNy42NzM1WiIgZmlsbD0iIzMzMyIvPjwvc3ZnPg==
// @grant             GM_xmlhttpRequest
// ==/UserScript==

/*
 * 原脚本: https://greasyfork.org/zh-CN/scripts/476688
 * 原作者ibxff，由雨萘（Naiy_）进行深度重构
 * 补充了大量注释
*/

// 请在这里配置你的后端API地址
const apiNode = ''
const styleElement = document.createElement("style");
const cssRule = `
    @keyframes hideAnimation {
      0% {
        opacity: 1;
      }
      50% {
        opacity: 0.75;
      }
      100% {
        opacity: 0;
        display: none;
      }
    }

    option:checked {
        background-color: #ffb144;
        color: white;
    }
    `;

styleElement.innerHTML = cssRule;
document.head.appendChild(styleElement);

// 检查一下是否配置了后端API
if (!apiNode) throw new Error('Refused to load userscript because backend API is not provided.')

/**
 * 隐藏元素
 * @param {Element} ele 要隐藏的元素
 * @returns
 */
function hideElement(ele) {
  ele.style.animation = "hideAnimation 1.5s ease";
  ele.addEventListener("animationend", function () {
    ele.style.display = "none";
  });
}

/**
 * Promise等待时间
 * @param {number} ms 等待时间长度（毫秒）
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 标记一个HTML元素
 * @param {Element} ele 
 * @returns 
 */
const mark = (ele) => ele.style.boxShadow = "0px 0px 50px rgba(0, 0, 0, 0.2)";

/**
 * 检查后端是否支持多章节获取
 * @returns {Promise<boolean>}
 */
const checkMultiContent = async () => {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "GET",
      url: apiNode + '/multi-content',
      // 发一个不带参数的请求，404为不支持，其他如果为json返回则支持
      // {"code": -1, "msg": "需要book_id!"，"data": []}
      onload: (response) => {
        console.log(response)
        if (response.status === 404) {
          console.log('Backend API does not support multi-content feature.');
          resolve(false);
        } else {
          try {
            var _ = JSON.parse(response.responseText);
            console.log('Backend API supports multi-content feature.')
            resolve(true);
          } catch (e) {
            console.error('Backend API response is not a valid JSON.');
            resolve(false);
          }
        }
      },
      onerror: (error) => {
        console.error('Backend API request failed:', error);
        reject(error);
      }
    })
  })
}

/**
 * 分割数组
 * @param {Array} arr 被分割的数组
 * @param {number} size 每个分割数组的大小
 * @returns {Array<Array>}
 */
const chunkArray = (arr, size) => {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

/**
 * 合并Object[]为一个Object
 * @param {Array<Object>} obj_arr 要合并的Object数组
 * @returns {Object}
 */
const mergeObject = (obj_arr) => {
  const result = {};
  for (const obj of obj_arr) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = obj[key];
      }
    }
  }
  return result;
}

const getAllTextElements = (element, textArray) => {
  // 获取当前元素的所有子节点
  const childNodes = element.childNodes;

  // 遍历每一个子节点
  childNodes.forEach(node => {
    // 如果是文本节点，将其内容加入到数组中
    if (node.nodeType === Node.TEXT_NODE) {
      textArray.push(node.textContent.trim());
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // 如果是元素节点，递归调用该函数处理其子元素
      getAllTextElements(node, textArray);
    }
  });
}

/**
 * 获取一段html的纯文本内容
 * @param {string} html html字符串
 * @returns {Array<string>}
 */
const htmlToTextArray = (html) => {
  // 创建一个div，用于存放html内容
  const div = document.createElement('div');

  // 修改div的内容为给定的html
  div.innerHTML = html;

  // 获取div中的所有文本内容
  let textArray = [];
  getAllTextElements(div, textArray);

  return textArray;
}

/**
 * 获取并替换当前章节内容
 * @param {number} retry 重试次数
 * @returns 
 */
function fetchContent(retry = 0) {
  const div = document.querySelector("#app > div > div > div > div.reader-toolbar > div > div.reader-toolbar-item.reader-toolbar-item-download")
  const text = div.querySelector('div:nth-child(2)')
  mark(div)

  // div.querySelector('div:nth-child(2)').innerHTML = '处理中'

  // document.title = document.title.replace(/在线免费阅读_番茄小说官网$/, '')

  const cdiv = document.getElementsByClassName('muye-reader-content')[0]
  cdiv.classList = cdiv.classList[0]
  if (retry > 3) {
    div.style.backgroundColor = 'pink'
    cdiv.innerHTML = '<h3 align="center">加载失败</h3>'
    text.innerHTML = '失败'
    hideElement(div)
    console.error(`Retry limit exceeded: ${retry}`);
    return
  }

  const url = window.location.href;
  const regex = /\/(\d+)/;
  const match = url.match(regex);
  const extractedId = match[1];
  const apiURL = apiNode + `/content?item_id=${extractedId}&text_mode=false&image_mode=true`
  cdiv.innerHTML = '<h3 align="center">加载中...</h3>'

  GM_xmlhttpRequest({
    method: "GET",
    url: apiURL,
    onload: (response) => {
      if (response.status === 200) {
        const data = JSON.parse(response.responseText);
        //const content = data.content;
        let content = typeof data.data.data == 'object' ? data.data.data.content : data.data.content;
        // 把css文件插入到head
        var content_css_tags = content.match(/<link[^>]*href=["']([^"']+)["'][^>]*>/gi);
        if (content_css_tags) {
          for (const tag of content_css_tags) {
            const href = tag.match(/href=["']([^"']+)["']/)[1];
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = href;
            var firstStyle = document.head.querySelector('style');
            content = content.replace(tag, '');
            if (firstStyle) {
              document.head.insertBefore(link, firstStyle);
            } else {
              document.head.appendChild(link);
            }
          }
        }
        console.log('FQWeb backend response: ', data);

        // 这个写法会导致Vue app在切换网页付费时因为找不到这个banner崩掉（表现为#app是一个空的div），所以换成display=none
        // document.getElementsByClassName('muye-to-fanqie')[0]?.remove()
        var tofanqie = document.getElementsByClassName('muye-to-fanqie')[0]
        if (tofanqie) {
          tofanqie.style.display = 'none'
        }

        // 给标题换个更优雅的显示
        document.title = data.data.novel_data.title + ' ' + data.data.novel_data.book_name + ' - 番茄小说_在线免费阅读'

        try { // 普通书籍会有章节头部信息，再插入content会出现重复标题，这里处理一下
          // 在头部补充卷名信息，出版书籍没有章节头部信息，可以由此区分出版书籍
          document.querySelector("#app > div > div > div > div.muye-reader-box > div.muye-reader-box-header > div > span:nth-child(1)").
            insertAdjacentHTML('beforebegin', '<span class="desc-item">' + data.data.novel_data.volume_name.replace('：默认', '') + '</span>');
          // 上一句没报错，这就说明了该书籍不是出版书籍，在content中移除标题信息
          cdiv.innerHTML = content.replace(data.data.novel_data.title, '')
        } catch (e) {
          // console.log(e)
          // 上一句报错，说明这是出版书籍，整个替换内容
          cdiv.innerHTML = content
        }
        div.style.backgroundColor = '#B0E57C'
        text.innerHTML = '成功'
        hideElement(div)
        console.log('内容修改成功')
      } else {
        console.error(`Fetch error: ${response.status}, `, response.responseText ? JSON.parse(response.responseText) : response);
        retry++
        console.log(`Retrying ${retry}...`);
        fetchContent(retry)
      }
    },
    onerror: function (error) {
      retry++
      div.style.backgroundColor = 'pink'
      cdiv.innerHTML = `<h3 align="center">加载失败，开始第${retry}次重试...</h3>`
      text.innerHTML = '失败'
      hideElement(div)
      console.error(`Fetch error: ${error}`);
      console.log(`Retrying ${retry}...`);
      fetchContent(retry)
    }
  }
  )
}

/**
 * 获取单章节内容(object)
 * @param {number | string} item_id 章节id
 * @param {boolean} text_mode 是否返回纯文本内容
 * @param {boolean} image_mode 是否返回图片内容
 * @param {number} retry 重试次数
 * @returns {Promise<object>}
 */
const singleContent = (item_id, text_mode = false, image_mode = true, retry = 0) => {
  const apiURL = apiNode + `/content?item_id=${item_id}&text_mode=${text_mode}&image_mode=${image_mode}`
  if (retry > 3) {
    console.error(`Retry limit exceeded: ${retry}`);
    return new Promise((reject) => {
      reject(new Error('Retry limit exceeded.'))
    })
  }
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "GET",
      url: apiURL,
      onload: (response) => {
        const data = JSON.parse(response.responseText);
        if (data.code === 0) {
          console.log('FQWeb backend response: ', data);
          resolve(data)
        } else {
          console.error(`Fetch error: ${response.status}, `, response.responseText ? JSON.parse(response.responseText) : response);
          retry++
          console.log(`Retrying ${retry}...`);
          singleContent(item_id, text_mode, image_mode, retry).then(resolve, reject)
        }
      },
      onerror: function (error) {
        retry++
        console.error(`Fetch error: ${error}`);
        console.log(`Retrying ${retry}...`);
        singleContent(item_id, text_mode, image_mode, retry).then(resolve, reject)
      }
    }
    )
  })
}


(/**
 * 用户脚本初始化
 * @returns {void}
 */
  async function () {
    'use strict';
    switch (window.location.href.match(/\/([^/]+)\/\d/)[1]) {
      case 'reader':
        const div = document.querySelector("#app > div > div > div > div.reader-toolbar > div > div.reader-toolbar-item.reader-toolbar-item-download")
        const text = div.querySelector('div:nth-child(2)')
        mark(div)
        // div.querySelector('div:nth-child(2)').innerHTML = '处理中'

        // document.title = document.title.replace(/在线免费阅读_番茄小说官网$/, '')

        // url是无缝修改的，不会重新运行脚本，所以加个切换章节的监听
        var currentURL = window.location.href
        var isReloading = false
        setInterval(() => {
          if (window.location.href !== currentURL) {
            console.log('章节url改变，刷新内容')
            try { // 部分出版书籍不带头部信息
              currentURL = window.location.href
              fetchContent()
              document.querySelector("#app > div > div > div > div.muye-reader-box > div.muye-reader-box-header > div > span:nth-child(1)").remove()
            } catch (e) { }
          }
          // 远古版本旧bug（错误移除banner崩Vue） #L169看详细信息
          // 为空触发重载
          if (document.querySelector("#app").innerHTML == '' && !isReloading) {
            // 不然会多次刷新，卡住
            isReloading = true
            window.location.reload()
          }
        }, 500);

        // 添加加载中标识
        const cdiv = document.getElementsByClassName('muye-reader-content noselect')[0]
        cdiv.classList = cdiv.classList[0]
        cdiv.innerHTML = '<h3 align="center">加载中...</h3>'

        // 开始获取内容
        fetchContent()
        break;
      case 'page':
        // 书籍详情页下载
        const title = document.querySelector("#app > div > div.muye.muye-page > div > div.page-wrap > div > div.page-header-info > div.info > div.info-name > h1").innerHTML
        var content = '' +
          +document.querySelector("#app > div > div.muye.muye-page > div > div.page-wrap > div > div.page-header-info > div.info > div.info-name > h1").innerHTML + '\n'
          + document.getElementsByClassName('page-header-info')[0].textContent
            .replace('继续阅读').replace('下载番茄小说').replace('开始阅读').replace('*下载全本')
          + '\n' + document.querySelector("#app > div > div.muye.muye-page > div > div.page-body-wrap > div > div.page-abstract-content > p").innerHTML
        content = content.replace(/undefined|null|NaN/g, '')
        console.log(content)
        const multiContentPromise = checkMultiContent()
        let multiContentSupport = false
        let multiContentChecked = false
        sleep(100).then(async () => {
          var suc = false
          while (!suc) { // 等待页面加载完成（同时检查后端是否支持多章节起飞式下载）
            console.log('waiting')
            try {
              if (!multiContentChecked) {
                multiContentPromise.then(support => {
                  multiContentSupport = support
                  console.log('multiContentSupport', multiContentSupport)
                  multiContentChecked = true
                }, e => {
                  console.error(e)
                  multiContentSupport = true
                })
              }
              document.querySelector("#app > div > div.muye.muye-page > div > div.page-wrap > div > div.page-header-info > div.info > div.download-icon.muyeicon-tomato").remove()
              suc = true
              console.log('page loaded')
            } catch (e) {
              // sleep 1s
              await sleep(1000)
            }
          }

          // 下载按钮
          const download = document.querySelector("#app > div > div.muye.muye-page > div > div.page-wrap > div > div.page-header-info > div.info > a")
          download.querySelector('button > span').innerHTML = '*下载全本'
          download.href = 'javascript:void 0'
          let arr_ = window.location.href.split("/")
          let book_id = arr_[arr_.length - 1].split("?")[0]

          // 编码选择
          const parentElement = document.querySelector("#app > div > div.muye.muye-page > div > div.page-wrap > div > div.page-header-info > div.info");
          const selectElement = document.createElement("select");
          selectElement.className = "byte-btn byte-btn-primary byte-btn-size-large byte-btn-shape-square muye-button";
          const options = [
            { text: "UTF-8" },
            { text: "GBK" },
            { text: "UNICODE" },
            { text: 'UTF-16' },
            { text: 'ASCII' }
          ];
          options.forEach(function (optionData) {
            var option = document.createElement("option");
            option.text = optionData.text;
            option.value = optionData.text
            selectElement.appendChild(option);
          });
          selectElement.style.position = "absolute";
          selectElement.style.left = "320px";
          selectElement.style.bottom = "0px";
          selectElement.style.height = "32px";
          selectElement.style.width = "80px";
          selectElement.style.fontSize = "15px";
          parentElement.appendChild(selectElement);

          // 章节列表
          const chapters = Array.from(document.getElementsByClassName('chapter-item'))

          /**
           * 下载下一章节（单章节下载）
           * @returns {void}
           */
          function next() {
            const ele = chapters[0].querySelector('a')
            ele.style.border = "3px solid navajowhite"
            ele.style.borderRadius = "5px"
            ele.style.backgroundColor = "navajowhite"
            const url = ele.href;
            // console.log(url)
            const regex = /\/(\d+)/;
            const match = url.match(regex);
            const extractedId = match[1];
            const apiURL = apiNode + `/content?item_id=${extractedId}&text_mode=true&image_mode=true`;
            const charset = selectElement.value

            content += '\n\n' + ele.innerHTML + '\n'
            GM_xmlhttpRequest({
              method: "GET",
              url: apiURL,
              'Content-Type': "application/json; charset=" + charset,
              onload: function (response) {
                if (response.status === 200) {

                  try {
                    const data = JSON.parse(response.responseText);
                    // console.log(data)
                    let temp_content = typeof data.data.data == 'object' ? data.data.data.content : data.data.content;
                    console.log(temp_content)
                    var lowercase = temp_content.toLowerCase()
                    if (lowercase.includes('<!doctype') || lowercase.includes('<article')) {
                      // 服务器不支持纯文本响应，这里处理一下html为plaintext
                      var arr = htmlToTextArray(temp_content)
                      content += '\n\n' + arr.join('\n\u3000\u3000') + '\n'
                    } else {
                      // 纯文本响应
                      content += '\n\n' + temp_content + '\n'
                    }

                    ele.style.backgroundColor = '#D2F9D1'
                    ele.style.border = "2px solid #D2F9D1"

                    chapters.shift()
                    console.log('剩余章节数: ' + chapters.length)
                    if (!chapters.length) {
                      console.log('执行完成 开始保存')
                      console.log(charset)
                      const blob = new Blob([new TextEncoder(charset).encode(content)], { type: `text/plain;charset=` + charset });
                      saveAs(blob, title + ".txt");
                      document.getElementById('downloading-tip').innerHTML = '<span id="downloading-tip">  下载完成！</span>'
                      return
                    }
                    else {
                      next()
                    }
                  }
                  catch (e) {
                    ele.style.backgroundColor = 'pink'

                    ele.style.border = "2px solid pink"

                    next()
                  }

                }
              },
              onerror: function (error) {
                hideElement(div)
                console.error(`Fetch error: ${error}`);
                ele.style.backgroundColor = 'pink'
                ele.style.border = "2px solid pink"
                //index+=1
                next()
              }
              ,
              ontimeout: function (error) {
                hideElement(div)
                console.error(`Fetch error: ${error}`);
                ele.style.backgroundColor = 'pink'
                ele.style.border = "2px solid pink"
                //index+=1
                next()
              }
            });
          }
          /**
           * 多章节下载（Promise函数）
           * @param {Array<Element>} chapsElements 章节元素数组
           * @param {number} retry 重试次数
           * @returns {Promise<object>}
           */
          const multiDownloadHandler = (chapsElements, retry = 0) => {
            if (retry > 5) {
              for (const chap of chapsElements) {
                chap.style.backgroundColor = 'pink'
              }
              console.error(`Retry limit exceeded: ${retry}`);
              return new Promise((_, reject) => {
                reject(new Error('Retry limit exceeded'))
              })
            }
            // console.log(chapsElements)
            let basePath = '/multi-content?book_id=' + book_id + '&text_mode=true&image_mode=true&item_ids='
            const item_ids = chapsElements.map(chap => chap.firstElementChild.href.match(/\/(\d+)/)[1]).join(',')
            console.log(item_ids)
            const apiURL = apiNode + basePath + item_ids
            return new Promise((resolve, reject) => {
              GM_xmlhttpRequest({
                method: "GET",
                url: apiURL,
                onload: async (resp) => {
                  // console.log(resp)
                  if (resp.status === 200) {
                    const data = JSON.parse(resp.responseText);
                    if (data.code === 0) {
                      for (const chap of chapsElements) {
                        chap.style.backgroundColor = '#D2F9D1'
                        chap.style.border = "2px solid #D2F9D1"
                      }
                      console.log(data.data.length, data.data)
                      resolve(data.data)
                    } else {
                      retry++
                      console.log("API Request Failed: ", data)
                      console.log(`Retrying ${retry}...`)
                      multiDownloadHandler(chapsElements, retry).then(resolve, reject)
                    }
                  } else {
                    retry++
                    console.error(`Fetch error: ${resp.status}, `, resp.responseText ? JSON.parse(resp.responseText) : resp);
                    console.log(`Retrying ${retry}...`);
                    multiDownloadHandler(chapsElements, retry).then(resolve, reject)
                  }
                },
                onerror: async (error) => {
                  retry++
                  console.error(`Fetch error: ${error}`);
                  console.log(`Retrying ${retry}...`);
                  multiDownloadHandler(chapsElements, retry).then(resolve, reject)
                }
              })
            })
          }

          /**
           * 多章节下载（执行函数）
           * @returns {void}
          */
          const multiDownload = async () => {
            const charset = selectElement.value
            const splitedChaps = chunkArray(chapters, 20)
            let chapResults = []
            for (let i = 0; i < splitedChaps.length; i++) {
              chapResults.push(
                await multiDownloadHandler(splitedChaps[i])
              )
            }
            console.log(chapResults)
            let res = mergeObject(chapResults)
            console.log(Object.keys(res).length, res)
            let remapped_res = {}
            const allItemIds = chapters.map(chap => chap.firstElementChild.href.match(/\/(\d+)/)[1])
            for (const itemId of allItemIds) {
              remapped_res[itemId] = res[itemId]
            }
            for (const r in remapped_res) {
              // console.log(r, remapped_res[r])
              if (typeof remapped_res[r] == 'undefined') {
                console.log(res[r])
                remapped_res[r] = await singleContent(r, true, true)
                console.log(r, remapped_res[r])
              }
              // content += '\n\n' + (remapped_res[r].novel_data ? remapped_res[r].novel_data.title : '') + '\n' + (remapped_res[r].content ? remapped_res[r].content : '') + '\n'
              let temp_content = remapped_res[r].content ? remapped_res[r].content : ''
              if (temp_content.toLowerCase().includes('<header>')) temp_content = htmlToTextArray(temp_content).join('\n\u3000\u3000')
              if (!temp_content.includes(remapped_res[r].novel_data.title)) temp_content = remapped_res[r].novel_data.title + '\n' + temp_content
              content += '\n\n' + temp_content + '\n'
            }

            console.log('执行完成 开始保存')
            const blob = new Blob([new TextEncoder(charset).encode(content)], { type: `text/plain;charset=${charset}` });
            saveAs(blob, title + ".txt");

            document.getElementById('downloading-tip').innerHTML = '<span id="downloading-tip">  下载完成！</span>'
          }

          // 注册事件监听
          download.addEventListener('click', () => {
            if (multiContentSupport) {
              multiDownload()
            } else {
              next()
            }
          })
          download.addEventListener('click', () => {
            download.style.display = 'none';
            selectElement.style.display = 'none';
            var lasttime = document.querySelector("#app > div > div.muye.muye-page > div > div.page-wrap > div > div.page-header-info > div.info > div.info-last > span")
            lasttime.innerHTML = lasttime.innerHTML + '<span id="downloading-tip">  正在下载，请稍后...</span>'
          })

        })
        break;
    }
  }
)();
