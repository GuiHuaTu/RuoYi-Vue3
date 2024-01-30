/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as registry from './registry.js';
import { append } from '../serialization/blocks.js';
import { Coordinate } from '../utils/coordinate.js';
import * as eventUtils from '../events/utils.js';
import { config } from '../config.js';
export class BlockPaster {
    paste(copyData, workspace, coordinate) {
        if (!workspace.isCapacityAvailable(copyData.typeCounts))
            return null;
        if (coordinate) {
            copyData.blockState['x'] = coordinate.x;
            copyData.blockState['y'] = coordinate.y;
        }
        eventUtils.disable();
        let block;
        try {
            block = append(copyData.blockState, workspace);
            moveBlockToNotConflict(block);
        }
        finally {
            eventUtils.enable();
        }
        if (!block)
            return block;
        if (eventUtils.isEnabled() && !block.isShadow()) {
            eventUtils.fire(new (eventUtils.get(eventUtils.BLOCK_CREATE))(block));
        }
        block.select();
        return block;
    }
}
BlockPaster.TYPE = 'block';
/**
 * Moves the given block to a location where it does not: (1) overlap exactly
 * with any other blocks, or (2) look like it is connected to any other blocks.
 *
 * Exported for testing.
 *
 * @param block The block to move to an unambiguous location.
 * @internal
 */
export function moveBlockToNotConflict(block) {
    const workspace = block.workspace;
    const snapRadius = config.snapRadius;
    const coord = block.getRelativeToSurfaceXY();
    const offset = new Coordinate(0, 0);
    // getRelativeToSurfaceXY is really expensive, so we want to cache this.
    const otherCoords = workspace
        .getAllBlocks(false)
        .filter((otherBlock) => otherBlock.id != block.id)
        .map((b) => b.getRelativeToSurfaceXY());
    while (blockOverlapsOtherExactly(Coordinate.sum(coord, offset), otherCoords) ||
        blockIsInSnapRadius(block, offset, snapRadius)) {
        if (workspace.RTL) {
            offset.translate(-snapRadius, snapRadius * 2);
        }
        else {
            offset.translate(snapRadius, snapRadius * 2);
        }
    }
    block.moveTo(Coordinate.sum(coord, offset));
}
/**
 * @returns true if the given block coordinates are less than a delta of 1 from
 *     any of the other coordinates.
 */
function blockOverlapsOtherExactly(coord, otherCoords) {
    return otherCoords.some((otherCoord) => Math.abs(otherCoord.x - coord.x) <= 1 &&
        Math.abs(otherCoord.y - coord.y) <= 1);
}
/**
 * @returns true if the given block (when offset by the given amount) is close
 *     enough to any other connections (within the snap radius) that it looks
 *     like they could connect.
 */
function blockIsInSnapRadius(block, offset, snapRadius) {
    return block
        .getConnections_(false)
        .some((connection) => !!connection.closest(snapRadius, offset).connection);
}
registry.register(BlockPaster.TYPE, new BlockPaster());
//# sourceMappingURL=block_paster.js.map