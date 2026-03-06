/**
 * @license
 * SPDX-License-Identifier: MIT
 */

/**
 * @file render/modalBuilders.ts
 * @description Helpers puros para construcao de elementos de modal.
 */

import { sanitizeHtmlToFragment } from './dom';

export type FrequencyTypeOption = 'daily' | 'specific_days_of_week' | 'interval';

export function replaceWithHtmlFragment(target: HTMLElement, html: string) {
    target.replaceChildren(sanitizeHtmlToFragment(html));
}

export function buildManageActionButton(className: string, ariaLabel: string, iconHtml: string): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.className = className;
    btn.setAttribute('aria-label', ariaLabel);
    replaceWithHtmlFragment(btn, iconHtml);
    return btn;
}

export function buildIconPickerItem(svg: string): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'icon-picker-item';
    btn.dataset.iconSvg = svg;
    replaceWithHtmlFragment(btn, svg);
    return btn;
}

export function buildColorSwatch(color: string, selected: boolean): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `color-swatch${selected ? ' selected' : ''}`;
    btn.style.backgroundColor = color;
    btn.dataset.color = color;
    return btn;
}

export function buildFrequencyTypeLabel(type: FrequencyTypeOption, checked: boolean, label: string): HTMLLabelElement {
    const wrap = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'frequency-type';
    input.value = type;
    input.checked = checked;
    wrap.append(input, label);
    return wrap;
}
