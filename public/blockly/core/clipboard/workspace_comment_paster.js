/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { WorkspaceCommentSvg } from '../workspace_comment_svg.js';
import * as registry from './registry.js';
export class WorkspaceCommentPaster {
    paste(copyData, workspace, coordinate) {
        const state = copyData.commentState;
        if (coordinate) {
            state.setAttribute('x', `${coordinate.x}`);
            state.setAttribute('y', `${coordinate.y}`);
        }
        else {
            const x = parseInt(state.getAttribute('x') ?? '0') + 50;
            const y = parseInt(state.getAttribute('y') ?? '0') + 50;
            state.setAttribute('x', `${x}`);
            state.setAttribute('y', `${y}`);
        }
        return WorkspaceCommentSvg.fromXmlRendered(copyData.commentState, workspace);
    }
}
WorkspaceCommentPaster.TYPE = 'workspace-comment';
registry.register(WorkspaceCommentPaster.TYPE, new WorkspaceCommentPaster());
//# sourceMappingURL=workspace_comment_paster.js.map