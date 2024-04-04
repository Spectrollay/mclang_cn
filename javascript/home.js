const startTime = new Date().getTime();
const audioInstances = [];
const main = document.getElementById("main");

// 检测浏览器是否处于夜间模式
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    // 覆盖夜间模式下的样式
    document.body.classList.add('no-dark-mode');
}

const currentURL = window.location.href;
const currentPagePath = window.location.pathname;
const hostPath = window.location.origin;
const parts = currentPagePath.split('/').filter(Boolean);
const rootPath = '/' + (parts.length > 0 ? parts[0] + '/' : '');
const slashCount = (currentPagePath.match(/\//g) || []).length;

const soundClickPath = rootPath + 'Website/sounds/click.ogg';
const soundButtonPath = rootPath + 'Website/sounds/button.ogg';
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
} else if (hostPath.includes('gitee.io')) {
    console.log("当前运行在Gitee");
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
        <div id="compatibility_modal" class="modal_area">
            <div class="modal">
                <div class="modal_title">兼容性提示</div>
                <div class="modal_content">
                    <p>不同浏览器之间存在些许差异,为确保你的使用体验,我们推荐通过以下浏览器或内核的最新发行版访问本站以获得完全的特性支持:
                        Edge / Chrome / Firefox / Safari / WebView Android</p>
                </div>
                <div class="modal_btn_area">
                    <button class="btn red_btn modal_btn" onclick="neverShowCompatibilityModalAgain(this);">不再显示</button>
                    <button class="btn green_btn modal_btn" onclick="hideCompatibilityModal(this);">我知道了</button>
                </div>
            </div>
        </div>`;
document.addEventListener("DOMContentLoaded", function () {
    if (!localStorage.getItem('neverShowCompatibilityModalAgain') || localStorage.getItem('neverShowCompatibilityModalAgain') !== '1') {
        const overlay = document.getElementById("overlay");
        const modal = document.getElementById("compatibility_modal");
        overlay.style.display = "block";
        modal.style.display = "block";
        console.log("显示兼容性提示弹窗");
    }
});

function hideCompatibilityModal(button) {
    const overlay = document.getElementById("overlay");
    const modal = document.getElementById("compatibility_modal");
    playSound(button);
    overlay.style.display = "none";
    modal.style.display = "none";
    console.log("关闭兼容性提示弹窗");
}

function neverShowCompatibilityModalAgain(button) {
    hideCompatibilityModal(button);
    localStorage.setItem('neverShowCompatibilityModalAgain', '1');
    console.log("关闭兼容性提示弹窗且不再提示");
}

document.body.insertAdjacentHTML('afterbegin', compatibilityModal);

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

// 回到网页顶部
function scrollToTop() {
    main.scrollTo({
        top: 0,
        behavior: "smooth"
    });
    console.log("成功执行回到顶部操作");
}

const loading_mask = document.getElementById('loading_mask');

// 监听页面加载完成事件
window.addEventListener('load', function () {

    // 延时600ms后隐藏蒙版
    loading_mask.style.opacity = '0';
    setTimeout(function () {
        loading_mask.style.display = 'none';
    }, 600);
});

const secondElement = document.getElementById('second');
if (secondElement) {
    let count = parseInt(secondElement.textContent);

    const secondInterval = setInterval(function () {
        count--;
        secondElement.textContent = count.toString();
        if (count <= 0) {
            clearInterval(secondInterval);
        }
    }, 1000);
}