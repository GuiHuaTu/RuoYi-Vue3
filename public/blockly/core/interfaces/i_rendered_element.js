/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * @returns True if the given object is an IRenderedElement.
 *
 * @internal
 */
export function isRenderedElement(obj) {
    return obj['getSvgRoot'] !== undefined;
}
//# sourceMappingURL=i_rendered_element.js.map