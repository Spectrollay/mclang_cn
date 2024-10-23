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

const site_version = "2.0"; // NOTE 版本号
const update_count = "2024-10-23-01"; // NOTE 发布编号
const server_version = "4.0";
const version_info = "<span>Version: " + site_version + "<br>Server Version: " + server_version + "<br>Updated: " + update_count + "</span>";

const version_area = document.getElementById('version_info');
if (version_area) {
    version_area.innerHTML = version_info;
}

const startTime = new Date().getTime();
const main = document.getElementById("main");

window.logManager = {
    log: function (message, level = 'info') {
        const isLocalEnv = hostPath.includes('localhost') || rootPath.includes('_test');

        // 根据环境输出不同日志
        if (level === 'error') {
            console.error(`[ERROR]: ${message}`);
        } else if (isLocalEnv) {
            // 在本地环境或测试环境中输出所有日志
            if (level === 'info') {
                console.log(`[INFO]: ${message}`);
            } else if (level === 'warn') {
                console.warn(`[WARN]: ${message}`);
            }
        }
    }
};

// 检测浏览器是否处于夜间模式
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    // 覆盖夜间模式下的样式
    document.body.classList.add('no-dark-mode');
}

// 禁止拖动元素
const images = document.querySelectorAll("img");
const links = document.querySelectorAll("a");
images.forEach(function (image) {
    image.draggable = false;
});

links.forEach(function (link) {
    link.draggable = false;
});


// 节流函数,防止事件频繁触发
function throttle(func, delay) {
    let lastCall = 0;
    return function (...args) {
        const now = new Date().getTime();
        if (now - lastCall < delay) return;
        lastCall = now;
        return func(...args);
    };
}

// 处理滚动条显示的逻辑
function showScroll(customScrollbar, scrollTimeout) {
    clearTimeout(scrollTimeout); // 清除之前的隐藏定时器
    customScrollbar.style.opacity = "1"; // 显示滚动条
    return setTimeout(() => {
        customScrollbar.style.opacity = "0"; // 3秒后隐藏滚动条
    }, 3000);
}

// 更新滚动条滑块位置和尺寸
function updateThumb(thumb, container, content, customScrollbar) {
    const scrollHeight = content.scrollHeight;
    const containerHeight = container.getBoundingClientRect().height;
    if (content.classList.contains('main_with_tab_bar')) customScrollbar.style.top = '100px';
    const thumbHeight = Math.max((containerHeight / scrollHeight) * containerHeight, 20);
    const maxScrollTop = scrollHeight - containerHeight;
    const currentScrollTop = Math.round(container.scrollTop);
    let thumbPosition = (currentScrollTop / maxScrollTop) * (containerHeight - (thumbHeight + 4));
    if (content.classList.contains('sidebar_content')) thumbPosition = (currentScrollTop / maxScrollTop) * (containerHeight - thumbHeight);

    thumb.style.height = `${thumbHeight}px`;
    thumb.style.top = `${thumbPosition}px`;
    customScrollbar.style.height = `${containerHeight}px`;

    customScrollbar.style.display = thumbHeight >= containerHeight ? 'none' : 'block';
}

// 处理滚动条点击跳转
function handleScrollbarClick(e, isDragging, customScrollbar, thumb, container, content) {
    if (isDragging || content.classList.contains('sidebar_content')) return;

    const {top, height: scrollbarHeight} = customScrollbar.getBoundingClientRect();
    const clickPosition = e.clientY - top;
    const thumbHeight = thumb.offsetHeight;
    const containerHeight = container.clientHeight;
    const maxScrollTop = content.scrollHeight - containerHeight;

    if (clickPosition < thumb.offsetTop || clickPosition > (thumb.offsetTop + thumbHeight)) {
        container.scrollTop = (clickPosition / (scrollbarHeight - thumbHeight)) * maxScrollTop;
        updateThumb(thumb, container, content, customScrollbar);
    }
}

// 处理滚动事件
function handleScroll(customScrollbar, customThumb, container, content, scrollTimeout) {
    if (!customScrollbar || !customThumb) return scrollTimeout;

    scrollTimeout = showScroll(customScrollbar, scrollTimeout);
    requestAnimationFrame(() => { // 动画优化
        updateThumb(customThumb, container, content, customScrollbar);
    });

    return scrollTimeout;
}

// 处理拖动滚动条的逻辑
function handlePointerMove(e, dragState, thumb, container, content) {
    if (!dragState.isDragging || content.classList.contains('sidebar_content')) return;

    const currentY = e.clientY || e.touches[0].clientY;
    const deltaY = currentY - dragState.startY;
    const containerHeight = container.getBoundingClientRect().height; // 根据初始位置和移动距离计算新的滑块位置
    const thumbHeight = thumb.offsetHeight;
    const maxThumbTop = containerHeight - thumbHeight;
    const newTop = Math.min(Math.max(dragState.initialThumbTop + deltaY, 0), maxThumbTop); // 计算滑块的新位置,确保在可滑动范围内
    const maxScrollTop = content.scrollHeight - containerHeight; // 计算页面内容的滚动位置

    container.scrollTo({
        top: (newTop / maxThumbTop) * maxScrollTop, behavior: "instant" // 确保滚动时不产生动画
    });

    updateThumb(thumb, container, content, container.closest('scroll-view').querySelector('custom-scrollbar'));
}

function handlePointerDown(e, customThumb, container, content, dragState) {
    dragState.isDragging = true;
    dragState.startY = e.clientY || e.touches[0].clientY;
    dragState.initialThumbTop = customThumb.getBoundingClientRect().top - container.getBoundingClientRect().top;
    const handlePointerMoveBound = (e) => handlePointerMove(e, dragState, customThumb, container, content);

    document.addEventListener('pointermove', handlePointerMoveBound);
    document.addEventListener('touchmove', handlePointerMoveBound);
    const handlePointerUp = () => {
        dragState.isDragging = false;
        document.removeEventListener('pointermove', handlePointerMoveBound);
        document.removeEventListener('touchmove', handlePointerMoveBound);
    };
    document.addEventListener('pointerup', handlePointerUp, {once: true});
    document.addEventListener('touchend', handlePointerUp, {once: true});
}

// 绑定滚动事件的通用函数,使用节流处理滚动事件
function bindScrollEvents(container, content, customScrollbar, customThumb) {
    let scrollTimeout;
    const dragState = {isDragging: false, startY: 0, initialThumbTop: 0}; // 使用对象管理拖动状态

    const throttledScroll = throttle(() => {
        scrollTimeout = handleScroll(customScrollbar, customThumb, container, content, scrollTimeout);
    }, 1);

    container.addEventListener('scroll', throttledScroll);
    window.addEventListener('resize', throttledScroll);
    document.addEventListener('mousemove', throttledScroll);
    document.addEventListener('touchmove', throttledScroll);

    customThumb.addEventListener('pointerdown', (e) => handlePointerDown(e, customThumb, container, content, dragState));
    customThumb.addEventListener('touchstart', (e) => handlePointerDown(e, customThumb, container, content, dragState));
    customScrollbar.addEventListener('click', (e) => handleScrollbarClick(e, dragState.isDragging, customScrollbar, customThumb, container, content));
    window.addEventListener('load', () => setTimeout(throttledScroll, 10));
}

// 获取并处理所有滚动容器
function initializeScrollContainers() {
    const containers = document.querySelectorAll('.main_scroll_container, .sidebar_scroll_container');

    containers.forEach((container) => {
        const content = container.querySelector('.scroll_container, .sidebar_content');
        const customScrollbar = content.closest('scroll-view').querySelector('custom-scrollbar');
        const customThumb = customScrollbar.querySelector('custom-scrollbar-thumb');
        bindScrollEvents(container, content, customScrollbar, customThumb);
    });
}

// 初始化滚动容器
initializeScrollContainers();

// 使用闭包的简化函数
function createHandleScroll(customScrollbar, customThumb, container, content) {
    let scrollTimeout;
    return function () {
        scrollTimeout = handleScroll(customScrollbar, customThumb, container, content, scrollTimeout);
    };
}

// 自定义高度变化检测
const mainScrollContainer = document.querySelector('.main_scroll_container');
const mainHandleScroll = throttle(createHandleScroll( // NOTE 在有涉及到自定义高度变化的地方要调用这个代码
    document.querySelector('.scroll_container').closest('scroll-view').querySelector('custom-scrollbar'), document.querySelector('.scroll_container').closest('scroll-view').querySelector('custom-scrollbar-thumb'), mainScrollContainer, document.querySelector('.scroll_container')
), 1);

let lastScrollHeight = mainScrollContainer.scrollHeight;

function watchHeightChange() { // 检查高度变化 NOTE 在有容器高度平滑变化的地方要调用这个代码
    const currentScrollHeight = mainScrollContainer.scrollHeight;
    if (lastScrollHeight !== currentScrollHeight) {
        mainHandleScroll(); // 联动自定义网页滚动条
        lastScrollHeight = currentScrollHeight;
    }
    requestAnimationFrame(watchHeightChange); // 在下一帧再次检查
}

// 路径检测
const currentURL = window.location.href;
const currentPagePath = window.location.pathname;
let hostPath = window.location.origin;
const parts = currentPagePath.split('/').filter(Boolean);
let rootPath = '/' + (parts.length > 0 ? parts[0] + '/' : '');
const slashCount = (currentPagePath.match(/\//g) || []).length;
const pageLevel = (slashCount - 1) + "级页面";

logManager.log("浏览器UA: " + navigator.userAgent)
logManager.log("完整路径: " + currentURL);
logManager.log("来源: " + hostPath);
logManager.log("根路径: " + rootPath);
logManager.log("当前路径: " + currentPagePath);

if (hostPath.includes('file:///')) {
    logManager.log('当前运行在本地文件');
} else if (hostPath.includes('localhost')) {
    logManager.log("当前运行在本地服务器");
} else if (hostPath.includes('github.io')) {
    logManager.log("当前运行在Github");
    // 禁用右键菜单
    document.addEventListener('contextmenu', function (event) {
        event.preventDefault();
    });
    // 禁用长按菜单
    document.addEventListener('touchstart', function (event) {
        event.preventDefault();
    });
} else {
    logManager.log("当前运行在" + hostPath);
}
if (rootPath.includes('_test')) {
    logManager.log("环境为测试环境");
} else {
    logManager.log("环境为标准环境");
}

logManager.log("当前位于" + pageLevel);

// 输出错误日志
window.addEventListener("error", function (event) {
    logManager.log("错误: " + event.message, 'error');
});

document.addEventListener("DOMContentLoaded", function () {
    logManager.log("页面加载完成!");
});

window.addEventListener("load", function () {
    const endTime = new Date().getTime();
    let loadTime = endTime - startTime;
    logManager.log("页面加载耗时: " + loadTime + "ms");
});

// 页面加载时缓存音效文件
const cacheName = 'audio-cache';
window.onload = async function () {
    if ('caches' in window) {
        try {
            const cache = await caches.open(cacheName);
            await cache.addAll([soundClickPath, soundButtonPath]);
            logManager.log('音效文件已缓存!');
        } catch (error) {
            logManager.log('音效文件缓存失败: ' + error, 'error');
        }
    }
};

async function getCachedAudio(filePath) {
    if ('caches' in window) {
        try {
            const cache = await caches.open(cacheName);
            const response = await cache.match(filePath);
            if (response) {
                const blob = await response.blob();
                const audioURL = URL.createObjectURL(blob);
                logManager.log('从缓存获取音效文件');
                return new Audio(audioURL); // 返回缓存中的音效
            }
        } catch (error) {
            logManager.log('从缓存获取音效文件失败: ' + error, 'error');
        }
    } else {
        return new Audio(filePath); // 缓存不存在或失败时直接返回网络资源
    }
}

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
                    <p>浏览器: Edge / Chrome / Safari / Firefox<br/>内核: Chromium / Android WebView / Apple WebKit</p>
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

window.addEventListener('load', () => setTimeout(function () {
    if (localStorage.getItem('(/mclang_cn/)neverShowCompatibilityModalAgain') !== '1') {
        const overlay = document.getElementById("overlay_compatibility_modal");
        const modal = document.getElementById("compatibility_modal");
        overlay.style.display = "block";
        modal.style.display = "block";
        modal.focus();
        logManager.log("显示兼容性提示弹窗");
    }
}, 20));

function hideCompatibilityModal(button) {
    const overlay = document.getElementById("overlay_compatibility_modal");
    const modal = document.getElementById("compatibility_modal");
    playSound(button);
    overlay.style.display = "none";
    modal.style.display = "none";
    logManager.log("关闭兼容性提示弹窗");
}

function neverShowCompatibilityModalAgain(button) {
    hideCompatibilityModal(button);
    localStorage.setItem('(/mclang_cn/)neverShowCompatibilityModalAgain', '1');
    logManager.log("关闭兼容性提示弹窗且不再提示");
}

const soundClickPath = rootPath + 'sounds/click.ogg';
const soundButtonPath = rootPath + 'sounds/button.ogg';
const soundPopPath = rootPath + 'sounds/pop.ogg';
const soundHidePath = rootPath + 'sounds/hide.ogg';
const soundOpenPath = rootPath + 'sounds/open.wav';
const soundClosePath = rootPath + 'sounds/close.wav';

function playClickSound() {
    getCachedAudio(soundClickPath).then(audio => {
        audio.play().then(() => {
            logManager.log("点击音效播放成功!");
        }).catch(error => {
            logManager.log('点击音效播放失败: ' + error, 'error');
        });
    }).catch(error => {
        logManager.log('获取点击音效失败: ' + error, 'error');
    });
}

function playButtonSound() {
    getCachedAudio(soundButtonPath).then(audio => {
        audio.play().then(() => {
            logManager.log("按钮音效播放成功!");
        }).catch(error => {
            logManager.log('获取按钮音效失败: ' + error, 'error');
        });
    }).catch(error => {
        logManager.log('获取按钮音效失败: ' + error, 'error');
    });
}

function playPopSound(){
    getCachedAudio(soundPopPath).then(audio => {
        audio.play().then(() => {
            logManager.log("弹出音效播放成功!");
        }).catch(error => {
            logManager.log('获取弹出音效失败: ' + error, 'error');
        });
    }).catch(error => {
        logManager.log('获取弹出音效失败: ' + error, 'error');
    });
}

function playHideSound(){
    getCachedAudio(soundHidePath).then(audio => {
        audio.play().then(() => {
            logManager.log("隐藏音效播放成功!");
        }).catch(error => {
            logManager.log('获取隐藏音效失败: ' + error, 'error');
        });
    }).catch(error => {
        logManager.log('获取隐藏音效失败: ' + error, 'error');
    });
}

function playOpenSound(){
    getCachedAudio(soundOpenPath).then(audio => {
        audio.play().then(() => {
            logManager.log("打开音效播放成功!");
        }).catch(error => {
            logManager.log('获取打开音效失败: ' + error, 'error');
        });
    }).catch(error => {
        logManager.log('获取打开音效失败: ' + error, 'error');
    });
}

function playCloseSound(){
    getCachedAudio(soundClosePath).then(audio => {
        audio.play().then(() => {
            logManager.log("关闭音效播放成功!");
        }).catch(error => {
            logManager.log('获取关闭音效失败: ' + error, 'error');
        });
    }).catch(error => {
        logManager.log('获取关闭音效失败: ' + error, 'error');
    });
}

// 按键音效
function playSound(button) {
    if (button.classList.contains("normal_btn") || button.classList.contains("red_btn") || button.classList.contains("sidebar_btn") || (button.classList.contains("tab_bar_btn") && button.classList.contains("no_active")) || button.classList.contains("close_btn")) {
        playClickSound();
    } else if (button.classList.contains("green_btn")) {
        playButtonSound();
    }
}

// 点击返回按钮事件
function clickedBack() {
    logManager.log("点击返回");
    playClickSound();
    if (window.history.length <= 1) {
        logManager.log("关闭窗口");
        setTimeout(function () {
            window.close();
        }, 600);
    } else {
        logManager.log("返回上一级页面");
        setTimeout(function () {
            window.history.back();
        }, 600);
    }
}

// 跳转链接
function jumpToPage(link) {
    playClickSound();
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
    mainScrollContainer.scrollTo({
        top: 0, behavior: "smooth"
    });
    console.log("成功执行回到顶部操作");
}

function toTop() {
    mainScrollContainer.scrollTo({
        top: 0, behavior: "instant"
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
            logManager.log('复制成功: ', tempTextarea.value);
        })
        .catch(error => {
            logManager.log('复制失败: ' + error, 'error');
        });
}
