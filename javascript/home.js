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

let scrollTimeout;
let isDragging;

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

function handleScroll() {
    showScroll();
    updateThumb();
}

function startDrag() {
    isDragging = true;
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchmove', onDrag);
    document.addEventListener('touchend', stopDrag);
}

function onDrag(e) {
    if (!isDragging) return;

    const mouseY = e.clientY || e.touches[0].clientY;
    const {top, height: containerHeight} = scrollContainer.getBoundingClientRect();
    const thumbHeight = customThumb.offsetHeight;
    const maxThumbTop = containerHeight - thumbHeight;
    const newTop = Math.min(Math.max(mouseY - top - thumbHeight / 2, 0), maxThumbTop);
    const maxScrollTop = mainContent.scrollHeight - containerHeight;
    scrollContainer.scrollTo({
        top: (newTop / maxThumbTop) * maxScrollTop,
        behavior: "instant"
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
const hostPath = window.location.origin;
const parts = currentPagePath.split('/').filter(Boolean);
const rootPath = '/' + (parts.length > 0 ? parts[0] + '/' : '');
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
    // Gitee Pages 已下线
// } else if (hostPath.includes('gitee.io')) {
//     console.log("当前运行在Gitee");
//     // 禁用右键菜单
//     document.addEventListener('contextmenu', function (event) {
//         event.preventDefault();
//     });
//     // 禁用长按菜单
//     document.addEventListener('touchstart', function (event) {
//         event.preventDefault();
//     });
} else {
    console.log("当前运行在" + hostPath);
}
if (rootPath.includes('test')) {
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
    if (localStorage.getItem(`(${rootPath})neverShowCompatibilityModalAgain`) !== '1') {
        const overlay = document.getElementById("overlay_compatibility_modal");
        const modal = document.getElementById("compatibility_modal");
        overlay.style.display = "block";
        modal.style.display = "block";
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
    localStorage.setItem(`(${rootPath})neverShowCompatibilityModalAgain`, '1');
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
    if (button.classList.contains("normal_btn") || button.classList.contains("red_btn")) {
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

function toRepo() {
    setTimeout(function () {
        window.open("https://github.com/Spectrollay/minecraft_repository/issues/new");
    }, 600);
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

// 自定义按钮
class CustomButton extends HTMLElement {
    constructor() {
        super();
        this.render();
    }

    render() {
        const data = this.getAttribute('data') || '';
        const [type, status, size, id, isTip, tip, icon] = data.split('|').map(item => item.trim());
        this.status = status || 'normal';
        this.icon = icon || '';
        const ctype = type || 'default';
        const csize = size || 'middle';
        const cid = id || '';
        const cisTip = isTip === true;
        const ctip = tip || '';
        const js = this.getAttribute('js') || 'false';
        const text = this.getAttribute('text') || '';

        if (ctype === "default") {
            if (cisTip === true) {
                this.innerHTML = `
                        <div class="btn_with_tooltip_cont">
                            <button class="btn ${csize}_btn ${status}_btn" id="${cid}">${text}</button>
                            <div class="btn_tooltip">${ctip}</div>
                            <img alt="" class="tip_icon" src="${rootPath}images/${icon}.png"/>
                        </div>
                    `;
            } else {
                this.innerHTML = `
                        <button class="btn ${csize}_btn ${status}_btn" id="${cid}">${text}</button>
                    `;
            }
        } else {
            this.classList.add(ctype + "_custom_btn");
            this.innerHTML = `
                    <button class="btn ${status}_btn ${ctype}_btn" id="${cid}">${text}</button>
                `;
        }

        const button = this.querySelector('button');
        if (button) {
            button.addEventListener('click', () => {
                playSound(button);
            });
            if (this.status !== 'disabled') {
                if (js !== "false") {
                    button.addEventListener('click', () => {
                        eval(js);
                    });
                }
            }
        }
    }
}

customElements.define('custom-button', CustomButton);

// Modal弹窗
setTimeout(function () {
    const modals = document.querySelectorAll('modal');
    if (modals) {
        modals.forEach((modal) => {
            const focusableElementsString = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
            let focusableElements = modal.querySelectorAll(focusableElementsString);
            focusableElements = Array.prototype.slice.call(focusableElements);

            const firstTabStop = focusableElements[0];
            const lastTabStop = focusableElements[focusableElements.length - 1];

            modal.addEventListener('keydown', function (e) {
                if (e.key === 'Tab') {
                    if (e.shiftKey) {
                        // Shift + Tab
                        if (document.activeElement === firstTabStop) {
                            e.preventDefault();
                            lastTabStop.focus();
                        }
                    } else {
                        // Tab
                        if (document.activeElement === lastTabStop) {
                            e.preventDefault();
                            firstTabStop.focus();
                        }
                    }
                }
            });
            // 聚焦模态框内的第一个可聚焦元素
            modal.addEventListener('shown.modal', function () {
                firstTabStop.focus();
            });
        });
    }
}, 100);

const modalCloseBtns = document.querySelectorAll('modal_close_btn');
if (modalCloseBtns) {
    modalCloseBtns.forEach((modalCloseBtn) => {
        modalCloseBtn.setAttribute('tabindex', '0');
        modalCloseBtn.addEventListener('keyup', function (event) {
            if (event.key === 'Enter') {
                modalCloseBtn.click();
            }
        });
    });
}

function showModal(modal) {
    const overlay = document.getElementById("overlay_" + modal);
    const frame = document.getElementById(modal);
    overlay.style.display = "block";
    frame.style.display = "block";
}

function hideModal(button) {
    let frameId;
    let currentElement = button.parentElement;

    while (currentElement) {
        if (currentElement.tagName.toLowerCase() === 'modal_area') {
            frameId = currentElement.id;
            break;
        }
        currentElement = currentElement.parentElement;
    }

    const overlay = document.getElementById("overlay_" + frameId);
    const frame = document.getElementById(frameId);
    playSound(button);
    overlay.style.display = "none";
    frame.style.display = "none";
}
