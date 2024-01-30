/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { RenderInfo as BaseRenderInfo } from '../common/info.js';
import * as deprecation from '../../utils/deprecation.js';
/**
 * An object containing all sizing information needed to draw this block.
 *
 * This measure pass does not propagate changes to the block (although fields
 * may choose to rerender when getSize() is called).  However, calling it
 * repeatedly may be expensive.
 *
 * @deprecated Use Blockly.blockRendering.RenderInfo instead. To be removed
 *     in v11.
 */
export class RenderInfo extends BaseRenderInfo {
    /**
     * @param renderer The renderer in use.
     * @param block The block to measure.
     * @deprecated Use Blockly.blockRendering.RenderInfo instead. To be removed
     *     in v11.
     */
    constructor(renderer, block) {
        super(renderer, block);
        deprecation.warn('Blockly.minimalist.RenderInfo', 'v10', 'v11', 'Blockly.blockRendering.RenderInfo');
    }
    /**
     * Get the block renderer in use.
     *
     * @returns The block renderer in use.
     */
    getRenderer() {
        return this.renderer_;
    }
}
//# sourceMappingURL=info.js.map