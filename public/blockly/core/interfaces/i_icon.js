/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/** Type guard that checks whether the given object is an IIcon. */
export function isIcon(obj) {
    return (obj.getType !== undefined &&
        obj.initView !== undefined &&
        obj.dispose !== undefined &&
        obj.getWeight !== undefined &&
        obj.getSize !== undefined &&
        obj.applyColour !== undefined &&
        obj.hideForInsertionMarker !== undefined &&
        obj.updateEditable !== undefined &&
        obj.updateCollapsed !== undefined &&
        obj.isShownWhenCollapsed !== undefined &&
        obj.setOffsetInBlock !== undefined &&
        obj.onLocationChange !== undefined &&
        obj.onClick !== undefined);
}
//# sourceMappingURL=i_icon.js.map