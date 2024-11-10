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

switchValues = JSON.parse(localStorage.getItem('(/mclang_cn/)switch_value')) || {};
expAccessibilityState = switchValues['experimental_accessibility'] || 'on';

// 焦点事件
// 选择多个元素
// 移除焦点列表
const exclusionSelectors = [
    'button',
    '.overlay',
    'modal_area',
    'modal_content',
    'modal_checkbox_area .custom-checkbox',
    'textarea'
];
// 新增焦点列表
const inclusionSelectors = [
    '.header_item:not(.header_right_blank)',
    '#banner_tip',
    'modal_close_btn',
    '.edition_block',
    '.btn:not(.disabled_btn)',
    '.tab_bar_btn',
    '.expandable_card',
    '.plan_block',
    '.custom-checkbox:not(.disabled)',
    '.switch:not(.disabled_switch) .switch_slider',
    '.slider_slider:not(.disabled_slider)',
    '.dropdown_label:not(.disabled_dropdown)',
    '.dropdown_option',
    'text-field:not(.disabled_text_field) textarea'
];

// 生成选择器字符串
const exclusionSelectorString = exclusionSelectors.join(', ');
const inclusionSelectorString = inclusionSelectors.join(', ');
let exclusionElements, inclusionElements;

function chooseModalElementsTabindex(modal) {
    exclusionElements = modal.querySelectorAll(exclusionSelectorString);
    inclusionElements = modal.querySelectorAll(inclusionSelectorString);
    setElementsTabindex();

    const modalFocusableElements = Array.from(inclusionElements);
    const firstTabStop = modalFocusableElements[0];
    const lastTabStop = modalFocusableElements[modalFocusableElements.length - 1];

    return {firstTabStop, lastTabStop};
}

function setElementsTabindex() { // 为每个选中的元素设置tabindex属性
    exclusionElements.forEach(exclusionElement => {
        exclusionElement.setAttribute('tabindex', '-1');
    });

    inclusionElements.forEach(inclusionElement => {
        inclusionElement.setAttribute('tabindex', '0');
        inclusionElement.removeEventListener('keyup', handleEnterPress);
        inclusionElement.addEventListener('keyup', handleEnterPress);
    });
}

function handleEnterPress(e) {
    if (e.key === 'Enter') {
        e.target.click();
    }
}

function updateFocusableElements() { // NOTE 在有涉及到元素状态变化的地方要调用这个函数
    exclusionElements = document.querySelectorAll(exclusionSelectorString);
    inclusionElements = document.querySelectorAll(inclusionSelectorString);
    setElementsTabindex();
}

function handleTabNavigation(e, modal) {
    const {firstTabStop, lastTabStop} = chooseModalElementsTabindex(modal);

    if (e.shiftKey) { // Shift + Tab
        if (document.activeElement === firstTabStop) {
            e.preventDefault();
            lastTabStop.focus();
        }
    } else { // Tab
        if (document.activeElement === lastTabStop) {
            e.preventDefault();
            firstTabStop.focus();
        }
    }
}

// 弹窗焦点陷阱
const modals = document.querySelectorAll('modal');
modals.forEach((modal) => {
    modal.removeEventListener('keydown', handleTabNavigation); // 移除旧的事件监听器
    const {firstTabStop} = chooseModalElementsTabindex(modal); // 弹窗元素选择器

    modal.addEventListener('keydown', (e) => handleTabNavigation(e, modal));
    modal.addEventListener('shown.modal', () => {
        if (firstTabStop) {
            firstTabStop.focus(); // 聚焦弹窗内的第一个可聚焦元素
        }
    });
});

updateFocusableElements(); // 初始化元素焦点

if (expAccessibilityState === 'on') {

    // TTS文本转语音
    let enable_tts;
    enable_tts = false;
    if (enable_tts) {
        useTTS();
    }

    function useTTS() {
        if ('speechSynthesis' in window) {
            // 支持TTS
            let currentUtterance = null;
            let lastText = '';

            function speakText(text) {
                if (text === lastText) return; // 如果目标文本没有改变
                lastText = text;

                if (currentUtterance) {
                    window.speechSynthesis.cancel();
                }

                currentUtterance = new SpeechSynthesisUtterance(text);
                window.speechSynthesis.speak(currentUtterance);
            }

            function handleEvent(event) {
                const text = event.target.innerText.trim();
                if (text) {
                    speakText(text);
                }
            }

            document.addEventListener('mouseover', handleEvent);
            document.addEventListener('touchstart', handleEvent, {passive: true});

            window.addEventListener('unload', () => {
                window.speechSynthesis.cancel(); // 页面卸载时取消未完成的语音任务
            });
        } else {
            // 不支持TTS
            logManager.log("当前浏览器不支持TTS文本转语音", 'warn');
        }
    }

    // Screen Reader屏幕阅读器
    let element;
    if (element) {
        element.setAttribute('role', 'main');
        element.setAttribute('aria-hidden', true);
    }

}