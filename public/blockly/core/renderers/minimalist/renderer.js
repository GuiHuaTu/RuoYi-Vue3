/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as blockRendering from '../common/block_rendering.js';
import { Renderer as BaseRenderer } from '../common/renderer.js';
import * as deprecation from '../../utils/deprecation.js';
import { ConstantProvider } from './constants.js';
import { Drawer } from './drawer.js';
import { RenderInfo } from './info.js';
/**
 * The minimalist renderer.
 *
 * @deprecated Use Blockly.blockRendering.Renderer instead. To be removed
 *     in v11.
 */
export class Renderer extends BaseRenderer {
    /**
     * @param name The renderer name.
     * @deprecated Use Blockly.blockRendering.Renderer instead. To be removed
     *     in v11.
     */
    constructor(name) {
        super(name);
        deprecation.warn('Blockly.minimalist.Renderer', 'v10', 'v11', 'Blockly.blockRendering.Renderer');
    }
    /**
     * Create a new instance of the renderer's constant provider.
     *
     * @returns The constant provider.
     */
    makeConstants_() {
        return new ConstantProvider();
    }
    /**
     * Create a new instance of the renderer's render info object.
     *
     * @param block The block to measure.
     * @returns The render info object.
     */
    makeRenderInfo_(block) {
        return new RenderInfo(this, block);
    }
    /**
     * Create a new instance of the renderer's drawer.
     *
     * @param block The block to render.
     * @param info An object containing all information needed to render this
     *     block.
     * @returns The drawer.
     */
    makeDrawer_(block, info) {
        return new Drawer(block, info);
    }
}
blockRendering.register('minimalist', Renderer);
//# sourceMappingURL=renderer.js.map