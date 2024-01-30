/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { BlockPaster } from './clipboard/block_paster.js';
import * as globalRegistry from './registry.js';
import * as registry from './clipboard/registry.js';
import * as deprecation from './utils/deprecation.js';
/** Metadata about the object that is currently on the clipboard. */
let stashedCopyData = null;
let stashedWorkspace = null;
/**
 * Copy a copyable element onto the local clipboard.
 *
 * @param toCopy The copyable element to be copied.
 * @deprecated v11. Use `myCopyable.toCopyData()` instead. To be removed v12.
 * @internal
 */
export function copy(toCopy) {
    deprecation.warn('Blockly.clipboard.copy', 'v11', 'v12', 'myCopyable.toCopyData()');
    return TEST_ONLY.copyInternal(toCopy);
}
/**
 * Private version of copy for stubbing in tests.
 */
function copyInternal(toCopy) {
    const data = toCopy.toCopyData();
    stashedCopyData = data;
    stashedWorkspace = toCopy.workspace ?? null;
    return data;
}
/**
 * Pastes the given data into the workspace, or the last copied ICopyable if
 * no data is passed.
 *
 * @param copyData The data to paste into the workspace.
 * @param workspace The workspace to paste the data into.
 * @param coordinate The location to paste the thing at.
 * @returns The pasted thing if the paste was successful, null otherwise.
 */
export function paste(copyData, workspace, coordinate) {
    if (!copyData || !workspace) {
        if (!stashedCopyData || !stashedWorkspace)
            return null;
        return pasteFromData(stashedCopyData, stashedWorkspace);
    }
    return pasteFromData(copyData, workspace, coordinate);
}
/**
 * Paste a pasteable element into the workspace.
 *
 * @param copyData The data to paste into the workspace.
 * @param workspace The workspace to paste the data into.
 * @param coordinate The location to paste the thing at.
 * @returns The pasted thing if the paste was successful, null otherwise.
 */
function pasteFromData(copyData, workspace, coordinate) {
    workspace = workspace.getRootWorkspace() ?? workspace;
    return (globalRegistry
        .getObject(globalRegistry.Type.PASTER, copyData.paster, false)
        ?.paste(copyData, workspace, coordinate) ?? null);
}
/**
 * Duplicate this copy-paste-able element.
 *
 * @param toDuplicate The element to be duplicated.
 * @returns The element that was duplicated, or null if the duplication failed.
 * @deprecated v11. Use
 *     `Blockly.clipboard.paste(myCopyable.toCopyData(), myWorkspace)` instead.
 *     To be removed v12.
 * @internal
 */
export function duplicate(toDuplicate) {
    deprecation.warn('Blockly.clipboard.duplicate', 'v11', 'v12', 'Blockly.clipboard.paste(myCopyable.toCopyData(), myWorkspace)');
    return TEST_ONLY.duplicateInternal(toDuplicate);
}
/**
 * Private version of duplicate for stubbing in tests.
 */
function duplicateInternal(toDuplicate) {
    const data = toDuplicate.toCopyData();
    if (!data)
        return null;
    return paste(data, toDuplicate.workspace);
}
export const TEST_ONLY = {
    duplicateInternal,
    copyInternal,
};
export { BlockPaster, registry };
//# sourceMappingURL=clipboard.js.map