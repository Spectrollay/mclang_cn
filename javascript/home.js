/*
 * Copyright © 2020. Spectrollay
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const startTime = new Date().getTime();
const audioInstances = [];
const main = document.getElementById("main");

// 检测浏览器是否处于夜间模式
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    // 覆盖夜间模式下的样式
    document.body.classList.add('no-dark-mode');
}

// 页面滚动条
const scrollContainer = document.querySelector('scroll-container');
const mainContent = document.querySelector('.main_scroll_container');
const customScrollbar = document.querySelector('custom-scrollbar');
const customThumb = document.querySelector('custom-scrollbar-thumb');
const sidebar = document.querySelector('#sidebar');
let sidebarContainer;
let sidebarContent;
let sidebarCustomScrollbar;
let sidebarThumb;
if (sidebar) {
    sidebarContainer = document.querySelector('#sidebar_scroll_container');
    sidebarContent = sidebarContainer.querySelector('.sidebar_content');
    sidebarCustomScrollbar = sidebar.querySelector('custom-scrollbar');
    sidebarThumb = sidebar.querySelector('custom-scrollbar-thumb');
}

let scrollTimeout;  // 记录滚动结束后滚动条的消失事件
let isDragging; // 用于标识是否正在拖动
let startY; // 记录初始的点击位置
let initialThumbTop; // 记录滑块初始的位置

function updateThumb() {
    const scrollHeight = mainContent.scrollHeight;
    const containerHeight = scrollContainer.getBoundingClientRect().height;
    customScrollbar.style.height = containerHeight + 'px';
    if (mainContent.classList.contains('main_with_tab_bar')) {
        customScrollbar.style.top = '100px';
    }
    let thumbHeight = Math.max((containerHeight / scrollHeight) * containerHeight, 20);
    customThumb.style.height = `${thumbHeight}px`;
    let maxScrollTop = scrollHeight - containerHeight;
    const currentScrollTop = Math.round(scrollContainer.scrollTop);
    const thumbPosition = (currentScrollTop / maxScrollTop) * (containerHeight - (thumbHeight + 4));
    customThumb.style.top = `${thumbPosition}px`;
    if (thumbHeight + 0.5 >= containerHeight) {
        customScrollbar.style.display = 'none';
    } else {
        customScrollbar.style.display = 'block';
    }
}

function updateSidebarThumb() {
    const scrollHeight = sidebarContent.scrollHeight;
    const containerHeight = Math.floor(sidebarContainer.getBoundingClientRect().height);
    const thumbHeight = Math.max((containerHeight / scrollHeight) * containerHeight, 20);
    const maxScrollTop = scrollHeight - containerHeight;
    const currentScrollTop = Math.round(sidebarContainer.scrollTop);
    const thumbPosition = (currentScrollTop / maxScrollTop) * (containerHeight - (thumbHeight + 4));

    if (thumbHeight >= containerHeight) {
        sidebarCustomScrollbar.style.display = 'none';
    } else {
        sidebarCustomScrollbar.style.display = 'block';
    }

    sidebarThumb.style.height = `${thumbHeight}px`;
    sidebarThumb.style.top = `${thumbPosition}px`;
}

function showScroll() {
    clearTimeout(scrollTimeout);
    customScrollbar.style.opacity = "1";
    scrollTimeout = setTimeout(() => {
        customScrollbar.style.opacity = "0";
    }, 3000);
}

function showSidebarScroll() {
    clearTimeout(scrollTimeout);
    sidebarCustomScrollbar.style.opacity = "1";
    scrollTimeout = setTimeout(() => {
        sidebarCustomScrollbar.style.opacity = "0";
    }, 3000);
}

function handleScroll() { // NOTE 在有涉及到自定义高度变化的地方要调用这个代码
    showScroll();
    updateThumb();
}

function startDrag(e) {
    isDragging = true;
    startY = e.clientY || e.touches[0].clientY; // 记录初始点击位置
    initialThumbTop = customThumb.getBoundingClientRect().top - scrollContainer.getBoundingClientRect().top; // 记录滑块的当前位置

    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchmove', onDrag);
    document.addEventListener('touchend', stopDrag);
}

function onDrag(e) {
    if (!isDragging) return;

    const currentY = e.clientY || e.touches[0].clientY; // 获取当前鼠标的位置
    const deltaY = currentY - startY; // 计算鼠标的移动距离
    const {height: containerHeight} = scrollContainer.getBoundingClientRect(); // 根据初始位置和移动距离计算新的滑块位置
    const thumbHeight = customThumb.offsetHeight;
    const maxThumbTop = containerHeight - thumbHeight;
    const newTop = Math.min(Math.max(initialThumbTop + deltaY, 0), maxThumbTop); // 计算滑块的新位置，确保在可滑动范围内
    const maxScrollTop = mainContent.scrollHeight - containerHeight; // 计算页面内容的滚动位置

    scrollContainer.scrollTo({
        top: (newTop / maxThumbTop) * maxScrollTop,
        behavior: "instant" // 确保滚动时不产生动画
    });

    updateThumb();
}

function stopDrag() {
    setTimeout(() => {
        isDragging = false;
    }, 0);
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('touchend', stopDrag);
}

function handleScrollbarClick(e) {
    if (isDragging) return;

    const {top, height: scrollbarHeight} = customScrollbar.getBoundingClientRect();
    const clickPosition = e.clientY - top;
    const thumbHeight = customThumb.offsetHeight;
    const containerHeight = scrollContainer.clientHeight;
    const maxScrollTop = mainContent.scrollHeight - containerHeight;
    scrollContainer.scrollTop = (clickPosition / (scrollbarHeight - thumbHeight)) * maxScrollTop;
    updateThumb();
}

if (scrollContainer) {
    scrollContainer.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    scrollContainer.addEventListener('touchmove', handleScroll);
    scrollContainer.addEventListener('mousemove', handleScroll);

    window.addEventListener('load', function () {
        setTimeout(function () {
            handleScroll();
        }, 10);
    });

    // 添加鼠标和触摸事件
    customThumb.addEventListener('mousedown', startDrag);
    customThumb.addEventListener('touchstart', startDrag);

    // 添加点击滚动条事件
    customScrollbar.addEventListener('click', handleScrollbarClick);
}

if (sidebarContainer) {
    sidebarContainer.addEventListener('scroll', () => {
        showSidebarScroll();
        updateSidebarThumb();
    });

    window.addEventListener('load', function () {
        setTimeout(function () {
            showSidebarScroll();
            updateSidebarThumb();
        }, 10);
    });

    window.addEventListener('resize', function () {
        showSidebarScroll();
        updateSidebarThumb();
    });
    sidebarContainer.addEventListener('touchmove', showSidebarScroll);
    sidebarContainer.addEventListener('mousemove', showSidebarScroll);
}

// 路径检测
const currentURL = window.location.href;
const currentPagePath = window.location.pathname;
let hostPath = window.location.origin;
const parts = currentPagePath.split('/').filter(Boolean);
let rootPath = '/' + (parts.length > 0 ? parts[0] + '/' : '');
const slashCount = (currentPagePath.match(/\//g) || []).length;

const soundClickPath = rootPath + 'sounds/click.ogg';
const soundButtonPath = rootPath + 'sounds/button.ogg';
const pageLevel = (slashCount - 1) + "级页面";

console.log("浏览器UA: ", navigator.userAgent)
console.log("完整路径: ", currentURL);
console.log("来源: ", hostPath);
console.log("根路径: ", rootPath);
console.log("当前路径: ", currentPagePath);

if (hostPath.includes('file:///')) {
    console.log('当前运行在本地文件');
} else if (hostPath.includes('localhost')) {
    console.log("当前运行在本地服务器");
} else if (hostPath.includes('github.io')) {
    console.log("当前运行在Github");
    // 禁用右键菜单
    document.addEventListener('contextmenu', function (event) {
        event.preventDefault();
    });
    // 禁用长按菜单
    document.addEventListener('touchstart', function (event) {
        event.preventDefault();
    });
} else {
    console.log("当前运行在" + hostPath);
}
if (rootPath.includes('_test')) {
    console.log("环境为测试环境");
} else {
    console.log("环境为标准环境");
}

console.log("当前位于" + pageLevel);

// 禁止拖动元素
const images = document.querySelectorAll("img");
const links = document.querySelectorAll("a");
images.forEach(function (image) {
    image.draggable = false;
});

links.forEach(function (link) {
    link.draggable = false;
});

// 兼容性检测
const compatibilityModal = `
    <div class="overlay" id="overlay_compatibility_modal" tabindex="-1"></div>
    <modal_area id="compatibility_modal" tabindex="-1">
        <modal>
            <modal_title_area>
                <modal_title>兼容性提示</modal_title>
            </modal_title_area>
            <modal_content>
                    <p>由于不同平台的代码支持存在些许差异, 为确保你的使用体验, 我们推荐通过以下浏览器及内核的最新发行版访问本站以获得完全的特性支持</p>
                    <p>浏览器: Edge / Chrome / Safari / Firefox<br>内核: Chromium / Android WebView / Apple WebKit</p>
                    <p>在不支持或过旧的浏览器及内核上访问本站可能会出现错乱甚至崩溃问题</p>
            </modal_content>
            <modal_button_area>
                <modal_button_group>
                    <modal_button_list>
                        <custom-button data="modal|red|||false||" js="neverShowCompatibilityModalAgain(this);" text="不再显示"></custom-button>
                        <custom-button data="modal|green|||false||" js="hideCompatibilityModal(this);" text="我知道了"></custom-button>
                    </modal_button_list>
                </modal_button_group>
            </modal_button_area>
        </modal>
    </modal_area>`;

document.body.insertAdjacentHTML('afterbegin', compatibilityModal);

setTimeout(function () {
    if (localStorage.getItem('(/mclang_cn/)neverShowCompatibilityModalAgain') !== '1') {
        const overlay = document.getElementById("overlay_compatibility_modal");
        const modal = document.getElementById("compatibility_modal");
        overlay.style.display = "block";
        modal.style.display = "block";
        modal.focus();
        console.log("显示兼容性提示弹窗");
    }
}, 100);

function hideCompatibilityModal(button) {
    const overlay = document.getElementById("overlay_compatibility_modal");
    const modal = document.getElementById("compatibility_modal");
    playSound(button);
    overlay.style.display = "none";
    modal.style.display = "none";
    console.log("关闭兼容性提示弹窗");
}

function neverShowCompatibilityModalAgain(button) {
    hideCompatibilityModal(button);
    localStorage.setItem('(/mclang_cn/)neverShowCompatibilityModalAgain', '1');
    console.log("关闭兼容性提示弹窗且不再提示");
}

// 输出错误日志
window.addEventListener("error", function (event) {
    console.error("错误: ", event.message);
});

document.addEventListener("DOMContentLoaded", function () {
    const click = new Audio(soundClickPath);
    const button = new Audio(soundButtonPath);
    click.volume = 0;
    button.volume = 0;
    audioInstances.push(click);
    audioInstances.push(button);
    click.play().then(() => {
        console.log("音频预加载成功!");
    }).catch((error) => {
        console.warn("音频预加载失败: ", error);
    });
    button.play().then(() => {
        console.log("音频预加载成功!");
    }).catch((error) => {
        console.warn("音频预加载失败: ", error);
    });

    console.log("页面加载完成!");
});

window.addEventListener("load", function () {
    const endTime = new Date().getTime();
    let loadTime = endTime - startTime;
    console.log("页面加载耗时: " + loadTime + "ms");
});

function playSound1() {
    const audio = new Audio(soundClickPath);
    audioInstances.push(audio);
    audio.play().then(() => {
        console.log("音效播放成功!");
    }).catch((error) => {
        console.error("音效播放失败: ", error);
    });
}

function playSound2() {
    const audio = new Audio(soundButtonPath);
    audioInstances.push(audio);
    audio.play().then(() => {
        console.log("音效播放成功!");
    }).catch((error) => {
        console.error("音效播放失败: ", error);
    });
}

// 按键音效
function playSound(button) {
    if (button.classList.contains("normal_btn") || button.classList.contains("red_btn") || button.classList.contains("sidebar_btn") || (button.classList.contains("tab_bar_btn") && button.classList.contains("no_active")) || button.classList.contains("close_btn")) {
        console.log("选择播放点击音效");
        playSound1();
    } else if (button.classList.contains("green_btn")) {
        console.log("选择播放按钮音效");
        playSound2();
    }
}

// 点击返回按钮事件
function clickedBack() {
    console.log("点击返回");
    playSound1();
    if (window.history.length <= 1) {
        console.log("关闭窗口");
        setTimeout(function () {
            window.close();
        }, 600);
    } else {
        console.log("返回上一级页面");
        setTimeout(function () {
            window.history.back();
        }, 600);
    }
}

// 跳转链接
function jumpToPage(link) {
    playSound1();
    setTimeout(function () {
        window.location.href = link;
    }, 320);
}

// 打开网页
function openLink(url) {
    window.open(url);
}

function delayedOpenLink(url) {
    setTimeout(function () {
        window.open(url);
    }, 1500);
}

function toRepo() {
    window.open("https://github.com/Spectrollay" + rootPath + "issues/new");
}

// 回到网页顶部
function scrollToTop() {
    scrollContainer.scrollTo({
        top: 0,
        behavior: "smooth"
    });
    console.log("成功执行回到顶部操作");
}

function toTop() {
    scrollContainer.scrollTo({
        top: 0,
        behavior: "instant"
    });
}

// 复制文本
function copyText(text) {
    let textToCopy = text;
    let tempTextarea = document.createElement("textarea");

    tempTextarea.value = textToCopy;
    document.body.appendChild(tempTextarea);

    tempTextarea.select();
    tempTextarea.setSelectionRange(0, 999999); // 兼容移动设备

    navigator.clipboard.writeText(tempTextarea.value)
        .then(() => {
            console.log('复制成功: ', tempTextarea.value);
        })
        .catch(err => {
            console.log('复制失败: ', err);
        });
}
