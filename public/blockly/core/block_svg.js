/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Methods for graphically rendering a block as SVG.
 *
 * @class
 */
// Former goog.module ID: Blockly.BlockSvg
// Unused import preserved for side-effects. Remove if unneeded.
import './events/events_selected.js';
import { Block } from './block.js';
import * as blockAnimations from './block_animations.js';
import * as browserEvents from './browser_events.js';
import { CommentIcon } from './icons/comment_icon.js';
import * as common from './common.js';
import { config } from './config.js';
import { ConnectionType } from './connection_type.js';
import * as constants from './constants.js';
import * as ContextMenu from './contextmenu.js';
import { ContextMenuRegistry, } from './contextmenu_registry.js';
import * as eventUtils from './events/utils.js';
import { FieldLabel } from './field_label.js';
import * as internalConstants from './internal_constants.js';
import { ASTNode } from './keyboard_nav/ast_node.js';
import { TabNavigateCursor } from './keyboard_nav/tab_navigate_cursor.js';
import { MarkerManager } from './marker_manager.js';
import { Msg } from './msg.js';
import { MutatorIcon } from './icons/mutator_icon.js';
import { RenderedConnection } from './rendered_connection.js';
import * as blocks from './serialization/blocks.js';
import * as Tooltip from './tooltip.js';
import { Coordinate } from './utils/coordinate.js';
import * as dom from './utils/dom.js';
import { Rect } from './utils/rect.js';
import { Svg } from './utils/svg.js';
import * as svgMath from './utils/svg_math.js';
import { WarningIcon } from './icons/warning_icon.js';
import * as renderManagement from './render_management.js';
import * as deprecation from './utils/deprecation.js';
import { BlockPaster } from './clipboard/block_paster.js';
/**
 * Class for a block's SVG representation.
 * Not normally called directly, workspace.newBlock() is preferred.
 */
export class BlockSvg extends Block {
    /**
     * @param workspace The block's workspace.
     * @param prototypeName Name of the language object containing type-specific
     *     functions for this block.
     * @param opt_id Optional ID.  Use this ID if provided, otherwise create a new
     *     ID.
     */
    constructor(workspace, prototypeName, opt_id) {
        super(workspace, prototypeName, opt_id);
        /**
         * Height of this block, not including any statement blocks above or below.
         * Height is in workspace units.
         */
        this.height = 0;
        /**
         * Width of this block, including any connected value blocks.
         * Width is in workspace units.
         */
        this.width = 0;
        /**
         * Map from IDs for warnings text to PIDs of functions to apply them.
         * Used to be able to maintain multiple warnings.
         */
        this.warningTextDb = new Map();
        /** Block's mutator icon (if any). */
        this.mutator = null;
        /**
         * Block's warning icon (if any).
         *
         * @deprecated Use `setWarningText` to modify warnings on this block.
         */
        this.warning = null;
        this.rendered = false;
        this.visuallyDisabled = false;
        /**
         * Is this block currently rendering? Used to stop recursive render calls
         * from actually triggering a re-render.
         */
        this.renderIsInProgress_ = false;
        /** Whether mousedown events have been bound yet. */
        this.eventsInit_ = false;
        this.translation = '';
        /**
         * The ID of the setTimeout callback for bumping neighbours, or 0 if no bump
         * is currently scheduled.
         */
        this.bumpNeighboursPid = 0;
        /** Whether this block is currently being dragged. */
        this.dragging = false;
        /**
         * The location of the top left of this block (in workspace coordinates)
         * relative to either its parent block, or the workspace origin if it has no
         * parent.
         *
         * @internal
         */
        this.relativeCoords = new Coordinate(0, 0);
        this.workspace = workspace;
        this.svgGroup_ = dom.createSvgElement(Svg.G, {});
        /** A block style object. */
        this.style = workspace.getRenderer().getConstants().getBlockStyle(null);
        /** The renderer's path object. */
        this.pathObject = workspace
            .getRenderer()
            .makePathObject(this.svgGroup_, this.style);
        const svgPath = this.pathObject.svgPath;
        svgPath.tooltip = this;
        Tooltip.bindMouseEvents(svgPath);
        // Expose this block's ID on its top-level SVG group.
        this.svgGroup_.setAttribute('data-id', this.id);
        this.doInit_();
    }
    /**
     * Create and initialize the SVG representation of the block.
     * May be called more than once.
     */
    initSvg() {
        if (!this.workspace.rendered) {
            throw TypeError('Workspace is headless.');
        }
        for (let i = 0, input; (input = this.inputList[i]); i++) {
            input.init();
        }
        for (const icon of this.getIcons()) {
            icon.initView(this.createIconPointerDownListener(icon));
            icon.updateEditable();
        }
        this.applyColour();
        this.pathObject.updateMovable(this.isMovable());
        const svg = this.getSvgRoot();
        if (!this.workspace.options.readOnly && !this.eventsInit_ && svg) {
            browserEvents.conditionalBind(svg, 'pointerdown', this, this.onMouseDown_);
        }
        this.eventsInit_ = true;
        if (!svg.parentNode) {
            this.workspace.getCanvas().appendChild(svg);
        }
    }
    /**
     * Get the secondary colour of a block.
     *
     * @returns #RRGGBB string.
     */
    getColourSecondary() {
        return this.style.colourSecondary;
    }
    /**
     * Get the tertiary colour of a block.
     *
     * @returns #RRGGBB string.
     */
    getColourTertiary() {
        return this.style.colourTertiary;
    }
    /**
     * Selects this block. Highlights the block visually and fires a select event
     * if the block is not already selected.
     */
    select() {
        if (this.isShadow() && this.getParent()) {
            // Shadow blocks should not be selected.
            this.getParent().select();
            return;
        }
        if (common.getSelected() === this) {
            return;
        }
        let oldId = null;
        if (common.getSelected()) {
            oldId = common.getSelected().id;
            // Unselect any previously selected block.
            eventUtils.disable();
            try {
                common.getSelected().unselect();
            }
            finally {
                eventUtils.enable();
            }
        }
        const event = new (eventUtils.get(eventUtils.SELECTED))(oldId, this.id, this.workspace.id);
        eventUtils.fire(event);
        common.setSelected(this);
        this.addSelect();
    }
    /**
     * Unselects this block. Unhighlights the block and fires a select (false)
     * event if the block is currently selected.
     */
    unselect() {
        if (common.getSelected() !== this) {
            return;
        }
        const event = new (eventUtils.get(eventUtils.SELECTED))(this.id, null, this.workspace.id);
        event.workspaceId = this.workspace.id;
        eventUtils.fire(event);
        common.setSelected(null);
        this.removeSelect();
    }
    /**
     * Sets the parent of this block to be a new block or null.
     *
     * @param newParent New parent block.
     * @internal
     */
    setParent(newParent) {
        const oldParent = this.parentBlock_;
        if (newParent === oldParent) {
            return;
        }
        dom.startTextWidthCache();
        super.setParent(newParent);
        dom.stopTextWidthCache();
        const svgRoot = this.getSvgRoot();
        // Bail early if workspace is clearing, or we aren't rendered.
        // We won't need to reattach ourselves anywhere.
        if (this.workspace.isClearing || !svgRoot) {
            return;
        }
        const oldXY = this.getRelativeToSurfaceXY();
        if (newParent) {
            newParent.getSvgRoot().appendChild(svgRoot);
        }
        else if (oldParent) {
            // If we are losing a parent, we want to move our DOM element to the
            // root of the workspace.
            const draggingBlock = this.workspace
                .getCanvas()
                .querySelector('.blocklyDragging');
            if (draggingBlock) {
                this.workspace.getCanvas().insertBefore(svgRoot, draggingBlock);
            }
            else {
                this.workspace.getCanvas().appendChild(svgRoot);
            }
            this.translate(oldXY.x, oldXY.y);
        }
        this.applyColour();
    }
    /**
     * Return the coordinates of the top-left corner of this block relative to the
     * drawing surface's origin (0,0), in workspace units.
     * If the block is on the workspace, (0, 0) is the origin of the workspace
     * coordinate system.
     * This does not change with workspace scale.
     *
     * @returns Object with .x and .y properties in workspace coordinates.
     */
    getRelativeToSurfaceXY() {
        const layerManger = this.workspace.getLayerManager();
        if (!layerManger) {
            throw new Error('Cannot calculate position because the workspace has not been appended');
        }
        let x = 0;
        let y = 0;
        let element = this.getSvgRoot();
        if (element) {
            do {
                // Loop through this block and every parent.
                const xy = svgMath.getRelativeXY(element);
                x += xy.x;
                y += xy.y;
                element = element.parentNode;
            } while (element && !layerManger.hasLayer(element));
        }
        return new Coordinate(x, y);
    }
    /**
     * Move a block by a relative offset.
     *
     * @param dx Horizontal offset in workspace units.
     * @param dy Vertical offset in workspace units.
     * @param reason Why is this move happening?  'drag', 'bump', 'snap', ...
     */
    moveBy(dx, dy, reason) {
        if (this.parentBlock_) {
            throw Error('Block has parent');
        }
        const eventsEnabled = eventUtils.isEnabled();
        let event = null;
        if (eventsEnabled) {
            event = new (eventUtils.get(eventUtils.BLOCK_MOVE))(this);
            reason && event.setReason(reason);
        }
        const delta = new Coordinate(dx, dy);
        const currLoc = this.getRelativeToSurfaceXY();
        const newLoc = Coordinate.sum(currLoc, delta);
        this.translate(newLoc.x, newLoc.y);
        this.updateComponentLocations(newLoc);
        if (eventsEnabled && event) {
            event.recordNew();
            eventUtils.fire(event);
        }
        this.workspace.resizeContents();
    }
    /**
     * Transforms a block by setting the translation on the transform attribute
     * of the block's SVG.
     *
     * @param x The x coordinate of the translation in workspace units.
     * @param y The y coordinate of the translation in workspace units.
     */
    translate(x, y) {
        this.translation = `translate(${x}, ${y})`;
        this.relativeCoords = new Coordinate(x, y);
        this.getSvgRoot().setAttribute('transform', this.getTranslation());
    }
    /**
     * Returns the SVG translation of this block.
     *
     * @internal
     */
    getTranslation() {
        return this.translation;
    }
    /**
     * Move a block to a position.
     *
     * @param xy The position to move to in workspace units.
     * @param reason Why is this move happening?  'drag', 'bump', 'snap', ...
     */
    moveTo(xy, reason) {
        const curXY = this.getRelativeToSurfaceXY();
        this.moveBy(xy.x - curXY.x, xy.y - curXY.y, reason);
    }
    /**
     * Move this block during a drag.
     * This block must be a top-level block.
     *
     * @param newLoc The location to translate to, in workspace coordinates.
     * @internal
     */
    moveDuringDrag(newLoc) {
        this.translate(newLoc.x, newLoc.y);
        this.getSvgRoot().setAttribute('transform', this.getTranslation());
        this.updateComponentLocations(newLoc);
    }
    /** Snap this block to the nearest grid point. */
    snapToGrid() {
        if (this.isDeadOrDying()) {
            return; // Deleted block.
        }
        if (this.workspace.isDragging()) {
            return; // Don't bump blocks during a drag.
        }
        if (this.getParent()) {
            return; // Only snap top-level blocks.
        }
        if (this.isInFlyout) {
            return; // Don't move blocks around in a flyout.
        }
        const grid = this.workspace.getGrid();
        if (!grid || !grid.shouldSnap()) {
            return; // Config says no snapping.
        }
        const spacing = grid.getSpacing();
        const half = spacing / 2;
        const xy = this.getRelativeToSurfaceXY();
        const dx = Math.round(Math.round((xy.x - half) / spacing) * spacing + half - xy.x);
        const dy = Math.round(Math.round((xy.y - half) / spacing) * spacing + half - xy.y);
        if (dx || dy) {
            this.moveBy(dx, dy, ['snap']);
        }
    }
    /**
     * Returns the coordinates of a bounding box describing the dimensions of this
     * block and any blocks stacked below it.
     * Coordinate system: workspace coordinates.
     *
     * @returns Object with coordinates of the bounding box.
     */
    getBoundingRectangle() {
        const blockXY = this.getRelativeToSurfaceXY();
        const blockBounds = this.getHeightWidth();
        let left;
        let right;
        if (this.RTL) {
            left = blockXY.x - blockBounds.width;
            right = blockXY.x;
        }
        else {
            left = blockXY.x;
            right = blockXY.x + blockBounds.width;
        }
        return new Rect(blockXY.y, blockXY.y + blockBounds.height, left, right);
    }
    /**
     * Notify every input on this block to mark its fields as dirty.
     * A dirty field is a field that needs to be re-rendered.
     */
    markDirty() {
        this.pathObject.constants = this.workspace.getRenderer().getConstants();
        for (let i = 0, input; (input = this.inputList[i]); i++) {
            input.markDirty();
        }
    }
    /**
     * Set whether the block is collapsed or not.
     *
     * @param collapsed True if collapsed.
     */
    setCollapsed(collapsed) {
        if (this.collapsed_ === collapsed) {
            return;
        }
        super.setCollapsed(collapsed);
        this.updateCollapsed_();
    }
    /**
     * Makes sure that when the block is collapsed, it is rendered correctly
     * for that state.
     */
    updateCollapsed_() {
        const collapsed = this.isCollapsed();
        const collapsedInputName = constants.COLLAPSED_INPUT_NAME;
        const collapsedFieldName = constants.COLLAPSED_FIELD_NAME;
        for (let i = 0, input; (input = this.inputList[i]); i++) {
            if (input.name !== collapsedInputName) {
                input.setVisible(!collapsed);
            }
        }
        for (const icon of this.getIcons()) {
            icon.updateCollapsed();
        }
        if (!collapsed) {
            this.updateDisabled();
            this.removeInput(collapsedInputName);
            return;
        }
        const text = this.toString(internalConstants.COLLAPSE_CHARS);
        const field = this.getField(collapsedFieldName);
        if (field) {
            field.setValue(text);
            return;
        }
        const input = this.getInput(collapsedInputName) ||
            this.appendDummyInput(collapsedInputName);
        input.appendField(new FieldLabel(text), collapsedFieldName);
    }
    /**
     * Open the next (or previous) FieldTextInput.
     *
     * @param start Current field.
     * @param forward If true go forward, otherwise backward.
     */
    tab(start, forward) {
        const tabCursor = new TabNavigateCursor();
        tabCursor.setCurNode(ASTNode.createFieldNode(start));
        const currentNode = tabCursor.getCurNode();
        if (forward) {
            tabCursor.next();
        }
        else {
            tabCursor.prev();
        }
        const nextNode = tabCursor.getCurNode();
        if (nextNode && nextNode !== currentNode) {
            const nextField = nextNode.getLocation();
            nextField.showEditor();
            // Also move the cursor if we're in keyboard nav mode.
            if (this.workspace.keyboardAccessibilityMode) {
                this.workspace.getCursor().setCurNode(nextNode);
            }
        }
    }
    /**
     * Handle a pointerdown on an SVG block.
     *
     * @param e Pointer down event.
     */
    onMouseDown_(e) {
        const gesture = this.workspace.getGesture(e);
        if (gesture) {
            gesture.handleBlockStart(e, this);
        }
    }
    /**
     * Load the block's help page in a new window.
     *
     * @internal
     */
    showHelp() {
        const url = typeof this.helpUrl === 'function' ? this.helpUrl() : this.helpUrl;
        if (url) {
            window.open(url);
        }
    }
    /**
     * Generate the context menu for this block.
     *
     * @returns Context menu options or null if no menu.
     */
    generateContextMenu() {
        if (this.workspace.options.readOnly || !this.contextMenu) {
            return null;
        }
        const menuOptions = ContextMenuRegistry.registry.getContextMenuOptions(ContextMenuRegistry.ScopeType.BLOCK, { block: this });
        // Allow the block to add or modify menuOptions.
        if (this.customContextMenu) {
            this.customContextMenu(menuOptions);
        }
        return menuOptions;
    }
    /**
     * Show the context menu for this block.
     *
     * @param e Mouse event.
     * @internal
     */
    showContextMenu(e) {
        const menuOptions = this.generateContextMenu();
        if (menuOptions && menuOptions.length) {
            ContextMenu.show(e, menuOptions, this.RTL);
            ContextMenu.setCurrentBlock(this);
        }
    }
    /**
     * Updates the locations of any parts of the block that need to know where
     * they are (e.g. connections, icons).
     *
     * @param blockOrigin The top-left of this block in workspace coordinates.
     * @internal
     */
    updateComponentLocations(blockOrigin) {
        if (!this.rendered) {
            // Rendering is required to lay out the blocks.
            // This is probably an invisible block attached to a collapsed block.
            return;
        }
        if (!this.dragging)
            this.updateConnectionLocations(blockOrigin);
        this.updateIconLocations(blockOrigin);
        this.updateFieldLocations(blockOrigin);
        for (const child of this.getChildren(false)) {
            child.updateComponentLocations(Coordinate.sum(blockOrigin, child.relativeCoords));
        }
    }
    updateConnectionLocations(blockOrigin) {
        for (const conn of this.getConnections_(false)) {
            conn.moveToOffset(blockOrigin);
        }
    }
    updateIconLocations(blockOrigin) {
        for (const icon of this.getIcons()) {
            icon.onLocationChange(blockOrigin);
        }
    }
    updateFieldLocations(blockOrigin) {
        for (const input of this.inputList) {
            for (const field of input.fieldRow) {
                field.onLocationChange(blockOrigin);
            }
        }
    }
    /**
     * Recursively adds or removes the dragging class to this node and its
     * children.
     *
     * @param adding True if adding, false if removing.
     * @internal
     */
    setDragging(adding) {
        this.dragging = adding;
        if (adding) {
            this.translation = '';
            common.draggingConnections.push(...this.getConnections_(true));
            dom.addClass(this.svgGroup_, 'blocklyDragging');
        }
        else {
            common.draggingConnections.length = 0;
            dom.removeClass(this.svgGroup_, 'blocklyDragging');
        }
        // Recurse through all blocks attached under this one.
        for (let i = 0; i < this.childBlocks_.length; i++) {
            this.childBlocks_[i].setDragging(adding);
        }
    }
    /**
     * Set whether this block is movable or not.
     *
     * @param movable True if movable.
     */
    setMovable(movable) {
        super.setMovable(movable);
        this.pathObject.updateMovable(movable);
    }
    /**
     * Set whether this block is editable or not.
     *
     * @param editable True if editable.
     */
    setEditable(editable) {
        super.setEditable(editable);
        const icons = this.getIcons();
        for (let i = 0; i < icons.length; i++) {
            icons[i].updateEditable();
        }
    }
    /**
     * Sets whether this block is a shadow block or not.
     * This method is internal and should not be called by users of Blockly. To
     * create shadow blocks programmatically call connection.setShadowState
     *
     * @param shadow True if a shadow.
     * @internal
     */
    setShadow(shadow) {
        super.setShadow(shadow);
        this.applyColour();
    }
    /**
     * Set whether this block is an insertion marker block or not.
     * Once set this cannot be unset.
     *
     * @param insertionMarker True if an insertion marker.
     * @internal
     */
    setInsertionMarker(insertionMarker) {
        if (this.isInsertionMarker_ === insertionMarker) {
            return; // No change.
        }
        this.isInsertionMarker_ = insertionMarker;
        if (this.isInsertionMarker_) {
            this.setColour(this.workspace.getRenderer().getConstants().INSERTION_MARKER_COLOUR);
            this.pathObject.updateInsertionMarker(true);
        }
    }
    /**
     * Return the root node of the SVG or null if none exists.
     *
     * @returns The root SVG node (probably a group).
     */
    getSvgRoot() {
        return this.svgGroup_;
    }
    /**
     * Dispose of this block.
     *
     * @param healStack If true, then try to heal any gap by connecting the next
     *     statement with the previous statement.  Otherwise, dispose of all
     *     children of this block.
     * @param animate If true, show a disposal animation and sound.
     */
    dispose(healStack, animate) {
        if (this.isDeadOrDying())
            return;
        Tooltip.dispose();
        ContextMenu.hide();
        if (animate && this.rendered) {
            this.unplug(healStack);
            blockAnimations.disposeUiEffect(this);
        }
        super.dispose(!!healStack);
        dom.removeNode(this.svgGroup_);
    }
    /**
     * Disposes of this block without doing things required by the top block.
     * E.g. does trigger UI effects, remove nodes, etc.
     */
    disposeInternal() {
        if (this.isDeadOrDying())
            return;
        super.disposeInternal();
        this.rendered = false;
        if (common.getSelected() === this) {
            this.unselect();
            this.workspace.cancelCurrentGesture();
        }
        [...this.warningTextDb.values()].forEach((n) => clearTimeout(n));
        this.warningTextDb.clear();
        this.getIcons().forEach((i) => i.dispose());
    }
    /**
     * Delete a block and hide chaff when doing so. The block will not be deleted
     * if it's in a flyout. This is called from the context menu and keyboard
     * shortcuts as the full delete action. If you are disposing of a block from
     * the workspace and don't need to perform flyout checks, handle event
     * grouping, or hide chaff, then use `block.dispose()` directly.
     */
    checkAndDelete() {
        if (this.workspace.isFlyout) {
            return;
        }
        eventUtils.setGroup(true);
        this.workspace.hideChaff();
        if (this.outputConnection) {
            // Do not attempt to heal rows
            // (https://github.com/google/blockly/issues/4832)
            this.dispose(false, true);
        }
        else {
            this.dispose(/* heal */ true, true);
        }
        eventUtils.setGroup(false);
    }
    /**
     * Encode a block for copying.
     *
     * @returns Copy metadata, or null if the block is an insertion marker.
     */
    toCopyData() {
        if (this.isInsertionMarker_) {
            return null;
        }
        return {
            paster: BlockPaster.TYPE,
            blockState: blocks.save(this, {
                addCoordinates: true,
                addNextBlocks: false,
            }),
            typeCounts: common.getBlockTypeCounts(this, true),
        };
    }
    /**
     * Updates the colour of the block to match the block's state.
     *
     * @internal
     */
    applyColour() {
        this.pathObject.applyColour(this);
        const icons = this.getIcons();
        for (let i = 0; i < icons.length; i++) {
            icons[i].applyColour();
        }
        for (let x = 0, input; (input = this.inputList[x]); x++) {
            for (let y = 0, field; (field = input.fieldRow[y]); y++) {
                field.applyColour();
            }
        }
    }
    /**
     * Updates the colour of the block (and children) to match the current
     * disabled state.
     *
     * @internal
     */
    updateDisabled() {
        const disabled = !this.isEnabled() || this.getInheritedDisabled();
        if (this.visuallyDisabled === disabled) {
            this.getNextBlock()?.updateDisabled();
            return;
        }
        this.applyColour();
        this.visuallyDisabled = disabled;
        for (const child of this.getChildren(false)) {
            child.updateDisabled();
        }
    }
    /**
     * Get the comment icon attached to this block, or null if the block has no
     * comment.
     *
     * @returns The comment icon attached to this block, or null.
     * @deprecated Use getIcon. To be remove in v11.
     */
    getCommentIcon() {
        deprecation.warn('getCommentIcon', 'v10', 'v11', 'getIcon');
        return (this.getIcon(CommentIcon.TYPE) ?? null);
    }
    /**
     * Set this block's warning text.
     *
     * @param text The text, or null to delete.
     * @param id An optional ID for the warning text to be able to maintain
     *     multiple warnings.
     */
    setWarningText(text, id = '') {
        if (!id) {
            // Kill all previous pending processes, this edit supersedes them all.
            for (const timeout of this.warningTextDb.values()) {
                clearTimeout(timeout);
            }
            this.warningTextDb.clear();
        }
        else if (this.warningTextDb.has(id)) {
            // Only queue up the latest change.  Kill any earlier pending process.
            clearTimeout(this.warningTextDb.get(id));
            this.warningTextDb.delete(id);
        }
        if (this.workspace.isDragging()) {
            // Don't change the warning text during a drag.
            // Wait until the drag finishes.
            this.warningTextDb.set(id, setTimeout(() => {
                if (!this.isDeadOrDying()) {
                    this.warningTextDb.delete(id);
                    this.setWarningText(text, id);
                }
            }, 100));
            return;
        }
        if (this.isInFlyout) {
            text = null;
        }
        const icon = this.getIcon(WarningIcon.TYPE);
        if (text) {
            // Bubble up to add a warning on top-most collapsed block.
            // TODO(#6020): This warning is never removed.
            let parent = this.getSurroundParent();
            let collapsedParent = null;
            while (parent) {
                if (parent.isCollapsed()) {
                    collapsedParent = parent;
                }
                parent = parent.getSurroundParent();
            }
            if (collapsedParent) {
                collapsedParent.setWarningText(Msg['COLLAPSED_WARNINGS_WARNING'], BlockSvg.COLLAPSED_WARNING_ID);
            }
            if (icon) {
                icon.addMessage(text, id);
            }
            else {
                this.addIcon(new WarningIcon(this).addMessage(text, id));
            }
        }
        else if (icon) {
            // Dispose all warnings if no ID is given.
            if (!id) {
                this.removeIcon(WarningIcon.TYPE);
            }
            else {
                // Remove just this warning id's message.
                icon.addMessage('', id);
                // Then remove the entire icon if there is no longer any text.
                if (!icon.getText())
                    this.removeIcon(WarningIcon.TYPE);
            }
        }
    }
    /**
     * Give this block a mutator dialog.
     *
     * @param mutator A mutator dialog instance or null to remove.
     */
    setMutator(mutator) {
        this.removeIcon(MutatorIcon.TYPE);
        if (mutator)
            this.addIcon(mutator);
    }
    addIcon(icon) {
        super.addIcon(icon);
        if (icon instanceof WarningIcon)
            this.warning = icon;
        if (icon instanceof MutatorIcon)
            this.mutator = icon;
        if (this.rendered) {
            icon.initView(this.createIconPointerDownListener(icon));
            icon.applyColour();
            icon.updateEditable();
            this.queueRender();
            renderManagement.triggerQueuedRenders();
            this.bumpNeighbours();
        }
        return icon;
    }
    /**
     * Creates a pointer down event listener for the icon to append to its
     * root svg.
     */
    createIconPointerDownListener(icon) {
        return (e) => {
            if (this.isDeadOrDying())
                return;
            const gesture = this.workspace.getGesture(e);
            if (gesture) {
                gesture.setStartIcon(icon);
            }
        };
    }
    removeIcon(type) {
        const removed = super.removeIcon(type);
        if (type.equals(WarningIcon.TYPE))
            this.warning = null;
        if (type.equals(MutatorIcon.TYPE))
            this.mutator = null;
        if (this.rendered) {
            this.queueRender();
            renderManagement.triggerQueuedRenders();
            this.bumpNeighbours();
        }
        return removed;
    }
    /**
     * Set whether the block is enabled or not.
     *
     * @param enabled True if enabled.
     */
    setEnabled(enabled) {
        if (this.isEnabled() !== enabled) {
            super.setEnabled(enabled);
            if (this.rendered && !this.getInheritedDisabled()) {
                this.updateDisabled();
            }
        }
    }
    /**
     * Set whether the block is highlighted or not.  Block highlighting is
     * often used to visually mark blocks currently being executed.
     *
     * @param highlighted True if highlighted.
     */
    setHighlighted(highlighted) {
        if (!this.rendered) {
            return;
        }
        this.pathObject.updateHighlighted(highlighted);
    }
    /**
     * Adds the visual "select" effect to the block, but does not actually select
     * it or fire an event.
     *
     * @see BlockSvg#select
     */
    addSelect() {
        this.pathObject.updateSelected(true);
    }
    /**
     * Removes the visual "select" effect from the block, but does not actually
     * unselect it or fire an event.
     *
     * @see BlockSvg#unselect
     */
    removeSelect() {
        this.pathObject.updateSelected(false);
    }
    /**
     * Update the cursor over this block by adding or removing a class.
     *
     * @param enable True if the delete cursor should be shown, false otherwise.
     * @internal
     */
    setDeleteStyle(enable) {
        this.pathObject.updateDraggingDelete(enable);
    }
    // Overrides of functions on Blockly.Block that take into account whether the
    // block has been rendered.
    /**
     * Get the colour of a block.
     *
     * @returns #RRGGBB string.
     */
    getColour() {
        return this.style.colourPrimary;
    }
    /**
     * Change the colour of a block.
     *
     * @param colour HSV hue value, or #RRGGBB string.
     */
    setColour(colour) {
        super.setColour(colour);
        const styleObj = this.workspace
            .getRenderer()
            .getConstants()
            .getBlockStyleForColour(this.colour_);
        this.pathObject.setStyle(styleObj.style);
        this.style = styleObj.style;
        this.styleName_ = styleObj.name;
        this.applyColour();
    }
    /**
     * Set the style and colour values of a block.
     *
     * @param blockStyleName Name of the block style.
     * @throws {Error} if the block style does not exist.
     */
    setStyle(blockStyleName) {
        const blockStyle = this.workspace
            .getRenderer()
            .getConstants()
            .getBlockStyle(blockStyleName);
        this.styleName_ = blockStyleName;
        if (blockStyle) {
            this.hat = blockStyle.hat;
            this.pathObject.setStyle(blockStyle);
            // Set colour to match Block.
            this.colour_ = blockStyle.colourPrimary;
            this.style = blockStyle;
            this.applyColour();
        }
        else {
            throw Error('Invalid style name: ' + blockStyleName);
        }
    }
    /**
     * Move this block to the front of the visible workspace.
     * <g> tags do not respect z-index so SVG renders them in the
     * order that they are in the DOM.  By placing this block first within the
     * block group's <g>, it will render on top of any other blocks.
     *
     * @param blockOnly: True to only move this block to the front without
     *     adjusting its parents.
     * @internal
     */
    bringToFront(blockOnly = false) {
        /* eslint-disable-next-line @typescript-eslint/no-this-alias */
        let block = this;
        if (block.isDeadOrDying()) {
            return;
        }
        do {
            const root = block.getSvgRoot();
            const parent = root.parentNode;
            const childNodes = parent.childNodes;
            // Avoid moving the block if it's already at the bottom.
            if (childNodes[childNodes.length - 1] !== root) {
                parent.appendChild(root);
            }
            if (blockOnly)
                break;
            block = block.getParent();
        } while (block);
    }
    /**
     * Set whether this block can chain onto the bottom of another block.
     *
     * @param newBoolean True if there can be a previous statement.
     * @param opt_check Statement type or list of statement types.  Null/undefined
     *     if any type could be connected.
     */
    setPreviousStatement(newBoolean, opt_check) {
        super.setPreviousStatement(newBoolean, opt_check);
        if (this.rendered) {
            this.queueRender();
            this.bumpNeighbours();
        }
    }
    /**
     * Set whether another block can chain onto the bottom of this block.
     *
     * @param newBoolean True if there can be a next statement.
     * @param opt_check Statement type or list of statement types.  Null/undefined
     *     if any type could be connected.
     */
    setNextStatement(newBoolean, opt_check) {
        super.setNextStatement(newBoolean, opt_check);
        if (this.rendered) {
            this.queueRender();
            this.bumpNeighbours();
        }
    }
    /**
     * Set whether this block returns a value.
     *
     * @param newBoolean True if there is an output.
     * @param opt_check Returned type or list of returned types.  Null or
     *     undefined if any type could be returned (e.g. variable get).
     */
    setOutput(newBoolean, opt_check) {
        super.setOutput(newBoolean, opt_check);
        if (this.rendered) {
            this.queueRender();
            this.bumpNeighbours();
        }
    }
    /**
     * Set whether value inputs are arranged horizontally or vertically.
     *
     * @param newBoolean True if inputs are horizontal.
     */
    setInputsInline(newBoolean) {
        super.setInputsInline(newBoolean);
        if (this.rendered) {
            this.queueRender();
            this.bumpNeighbours();
        }
    }
    /**
     * Remove an input from this block.
     *
     * @param name The name of the input.
     * @param opt_quiet True to prevent error if input is not present.
     * @returns True if operation succeeds, false if input is not present and
     *     opt_quiet is true
     * @throws {Error} if the input is not present and opt_quiet is not true.
     */
    removeInput(name, opt_quiet) {
        const removed = super.removeInput(name, opt_quiet);
        if (this.rendered) {
            this.queueRender();
            // Removing an input will cause the block to change shape.
            this.bumpNeighbours();
        }
        return removed;
    }
    /**
     * Move a numbered input to a different location on this block.
     *
     * @param inputIndex Index of the input to move.
     * @param refIndex Index of input that should be after the moved input.
     */
    moveNumberedInputBefore(inputIndex, refIndex) {
        super.moveNumberedInputBefore(inputIndex, refIndex);
        if (this.rendered) {
            this.queueRender();
            // Moving an input will cause the block to change shape.
            this.bumpNeighbours();
        }
    }
    /** @override */
    appendInput(input) {
        super.appendInput(input);
        if (this.rendered) {
            this.queueRender();
            // Adding an input will cause the block to change shape.
            this.bumpNeighbours();
        }
        return input;
    }
    /**
     * Sets whether this block's connections are tracked in the database or not.
     *
     * Used by the deserializer to be more efficient. Setting a connection's
     * tracked_ value to false keeps it from adding itself to the db when it
     * gets its first moveTo call, saving expensive ops for later.
     *
     * @param track If true, start tracking. If false, stop tracking.
     * @internal
     */
    setConnectionTracking(track) {
        if (this.previousConnection) {
            this.previousConnection.setTracking(track);
        }
        if (this.outputConnection) {
            this.outputConnection.setTracking(track);
        }
        if (this.nextConnection) {
            this.nextConnection.setTracking(track);
            const child = this.nextConnection.targetBlock();
            if (child) {
                child.setConnectionTracking(track);
            }
        }
        if (this.collapsed_) {
            // When track is true, we don't want to start tracking collapsed
            // connections. When track is false, we're already not tracking
            // collapsed connections, so no need to update.
            return;
        }
        for (let i = 0; i < this.inputList.length; i++) {
            const conn = this.inputList[i].connection;
            if (conn) {
                conn.setTracking(track);
                // Pass tracking on down the chain.
                const block = conn.targetBlock();
                if (block) {
                    block.setConnectionTracking(track);
                }
            }
        }
    }
    /**
     * Returns connections originating from this block.
     *
     * @param all If true, return all connections even hidden ones.
     *     Otherwise, for a non-rendered block return an empty list, and for a
     *     collapsed block don't return inputs connections.
     * @returns Array of connections.
     * @internal
     */
    getConnections_(all) {
        const myConnections = [];
        if (all || this.rendered) {
            if (this.outputConnection) {
                myConnections.push(this.outputConnection);
            }
            if (this.previousConnection) {
                myConnections.push(this.previousConnection);
            }
            if (this.nextConnection) {
                myConnections.push(this.nextConnection);
            }
            if (all || !this.collapsed_) {
                for (let i = 0, input; (input = this.inputList[i]); i++) {
                    if (input.connection) {
                        myConnections.push(input.connection);
                    }
                }
            }
        }
        return myConnections;
    }
    /**
     * Walks down a stack of blocks and finds the last next connection on the
     * stack.
     *
     * @param ignoreShadows If true,the last connection on a non-shadow block will
     *     be returned. If false, this will follow shadows to find the last
     *     connection.
     * @returns The last next connection on the stack, or null.
     * @internal
     */
    lastConnectionInStack(ignoreShadows) {
        return super.lastConnectionInStack(ignoreShadows);
    }
    /**
     * Find the connection on this block that corresponds to the given connection
     * on the other block.
     * Used to match connections between a block and its insertion marker.
     *
     * @param otherBlock The other block to match against.
     * @param conn The other connection to match.
     * @returns The matching connection on this block, or null.
     * @internal
     */
    getMatchingConnection(otherBlock, conn) {
        return super.getMatchingConnection(otherBlock, conn);
    }
    /**
     * Create a connection of the specified type.
     *
     * @param type The type of the connection to create.
     * @returns A new connection of the specified type.
     * @internal
     */
    makeConnection_(type) {
        return new RenderedConnection(this, type);
    }
    /**
     * Return the next statement block directly connected to this block.
     *
     * @returns The next statement block or null.
     */
    getNextBlock() {
        return super.getNextBlock();
    }
    /**
     * Returns the block connected to the previous connection.
     *
     * @returns The previous statement block or null.
     */
    getPreviousBlock() {
        return super.getPreviousBlock();
    }
    /**
     * Bumps unconnected blocks out of alignment.
     *
     * Two blocks which aren't actually connected should not coincidentally line
     * up on screen, because that creates confusion for end-users.
     */
    bumpNeighbours() {
        if (this.bumpNeighboursPid)
            return;
        const group = eventUtils.getGroup();
        this.bumpNeighboursPid = setTimeout(() => {
            const oldGroup = eventUtils.getGroup();
            eventUtils.setGroup(group);
            this.getRootBlock().bumpNeighboursInternal();
            eventUtils.setGroup(oldGroup);
            this.bumpNeighboursPid = 0;
        }, config.bumpDelay);
    }
    /**
     * Bumps unconnected blocks out of alignment.
     */
    bumpNeighboursInternal() {
        const root = this.getRootBlock();
        if (this.isDeadOrDying() ||
            this.workspace.isDragging() ||
            root.isInFlyout) {
            return;
        }
        function neighbourIsInStack(neighbour) {
            return neighbour.getSourceBlock().getRootBlock() === root;
        }
        for (const conn of this.getConnections_(false)) {
            if (conn.isSuperior()) {
                // Recurse down the block stack.
                conn.targetBlock()?.bumpNeighboursInternal();
            }
            for (const neighbour of conn.neighbours(config.snapRadius)) {
                // Don't bump away from things that are in our stack.
                if (neighbourIsInStack(neighbour))
                    continue;
                // If both connections are connected, that's fine.
                if (conn.isConnected() && neighbour.isConnected())
                    continue;
                // Always bump the inferior connection.
                if (conn.isSuperior()) {
                    neighbour.bumpAwayFrom(conn);
                }
                else {
                    conn.bumpAwayFrom(neighbour);
                }
            }
        }
    }
    /**
     * Schedule snapping to grid and bumping neighbours to occur after a brief
     * delay.
     *
     * @internal
     */
    scheduleSnapAndBump() {
        // Ensure that any snap and bump are part of this move's event group.
        const group = eventUtils.getGroup();
        setTimeout(() => {
            eventUtils.setGroup(group);
            this.snapToGrid();
            eventUtils.setGroup(false);
        }, config.bumpDelay / 2);
        this.bumpNeighbours();
    }
    /**
     * Position a block so that it doesn't move the target block when connected.
     * The block to position is usually either the first block in a dragged stack
     * or an insertion marker.
     *
     * @param sourceConnection The connection on the moving block's stack.
     * @param originalOffsetToTarget The connection original offset to the target connection
     * @param originalOffsetInBlock The connection original offset in its block
     * @internal
     */
    positionNearConnection(sourceConnection, originalOffsetToTarget, originalOffsetInBlock) {
        // We only need to position the new block if it's before the existing one,
        // otherwise its position is set by the previous block.
        if (sourceConnection.type === ConnectionType.NEXT_STATEMENT ||
            sourceConnection.type === ConnectionType.INPUT_VALUE) {
            // First move the block to match the orginal target connection position
            let dx = originalOffsetToTarget.x;
            let dy = originalOffsetToTarget.y;
            // Then adjust its position according to the connection resize
            dx += originalOffsetInBlock.x - sourceConnection.getOffsetInBlock().x;
            dy += originalOffsetInBlock.y - sourceConnection.getOffsetInBlock().y;
            this.moveBy(dx, dy);
        }
    }
    /**
     * Find all the blocks that are directly nested inside this one.
     * Includes value and statement inputs, as well as any following statement.
     * Excludes any connection on an output tab or any preceding statement.
     * Blocks are optionally sorted by position; top to bottom.
     *
     * @param ordered Sort the list if true.
     * @returns Array of blocks.
     */
    getChildren(ordered) {
        return super.getChildren(ordered);
    }
    /**
     * Triggers a rerender after a delay to allow for batching.
     *
     * @returns A promise that resolves after the currently queued renders have
     *     been completed. Used for triggering other behavior that relies on
     *     updated size/position location for the block.
     * @internal
     */
    queueRender() {
        return renderManagement.queueRender(this);
    }
    /**
     * Immediately lays out and reflows a block based on its contents and
     * settings.
     */
    render() {
        this.queueRender();
        renderManagement.triggerQueuedRenders();
    }
    /**
     * Renders this block in a way that's compatible with the more efficient
     * render management system.
     *
     * @internal
     */
    renderEfficiently() {
        this.rendered = true;
        dom.startTextWidthCache();
        if (this.isCollapsed()) {
            this.updateCollapsed_();
        }
        if (!this.isEnabled()) {
            this.updateDisabled();
        }
        this.workspace.getRenderer().render(this);
        this.tightenChildrenEfficiently();
        dom.stopTextWidthCache();
        this.updateMarkers_();
    }
    /**
     * Tightens all children of this block so they are snuggly rendered against
     * their parent connections.
     *
     * Does not update connection locations, so that they can be updated more
     * efficiently by the render management system.
     *
     * @internal
     */
    tightenChildrenEfficiently() {
        for (const input of this.inputList) {
            const conn = input.connection;
            if (conn)
                conn.tightenEfficiently();
        }
        if (this.nextConnection)
            this.nextConnection.tightenEfficiently();
    }
    /** Redraw any attached marker or cursor svgs if needed. */
    updateMarkers_() {
        if (this.workspace.keyboardAccessibilityMode && this.pathObject.cursorSvg) {
            this.workspace.getCursor().draw();
        }
        if (this.workspace.keyboardAccessibilityMode && this.pathObject.markerSvg) {
            // TODO(#4592): Update all markers on the block.
            this.workspace.getMarker(MarkerManager.LOCAL_MARKER).draw();
        }
        for (const input of this.inputList) {
            for (const field of input.fieldRow) {
                field.updateMarkers_();
            }
        }
    }
    /**
     * Add the cursor SVG to this block's SVG group.
     *
     * @param cursorSvg The SVG root of the cursor to be added to the block SVG
     *     group.
     * @internal
     */
    setCursorSvg(cursorSvg) {
        this.pathObject.setCursorSvg(cursorSvg);
    }
    /**
     * Add the marker SVG to this block's SVG group.
     *
     * @param markerSvg The SVG root of the marker to be added to the block SVG
     *     group.
     * @internal
     */
    setMarkerSvg(markerSvg) {
        this.pathObject.setMarkerSvg(markerSvg);
    }
    /**
     * Returns a bounding box describing the dimensions of this block
     * and any blocks stacked below it.
     *
     * @returns Object with height and width properties in workspace units.
     * @internal
     */
    getHeightWidth() {
        let height = this.height;
        let width = this.width;
        // Recursively add size of subsequent blocks.
        const nextBlock = this.getNextBlock();
        if (nextBlock) {
            const nextHeightWidth = nextBlock.getHeightWidth();
            const tabHeight = this.workspace
                .getRenderer()
                .getConstants().NOTCH_HEIGHT;
            height += nextHeightWidth.height - tabHeight;
            width = Math.max(width, nextHeightWidth.width);
        }
        return { height, width };
    }
    /**
     * Visual effect to show that if the dragging block is dropped, this block
     * will be replaced.  If a shadow block, it will disappear.  Otherwise it will
     * bump.
     *
     * @param add True if highlighting should be added.
     * @internal
     */
    fadeForReplacement(add) {
        this.pathObject.updateReplacementFade(add);
    }
    /**
     * Visual effect to show that if the dragging block is dropped it will connect
     * to this input.
     *
     * @param conn The connection on the input to highlight.
     * @param add True if highlighting should be added.
     * @internal
     */
    highlightShapeForInput(conn, add) {
        this.pathObject.updateShapeForInputHighlight(conn, add);
    }
}
/**
 * Constant for identifying rows that are to be rendered inline.
 * Don't collide with Blockly.inputTypes.
 */
BlockSvg.INLINE = -1;
/**
 * ID to give the "collapsed warnings" warning. Allows us to remove the
 * "collapsed warnings" warning without removing any warnings that belong to
 * the block.
 */
BlockSvg.COLLAPSED_WARNING_ID = 'TEMP_COLLAPSED_WARNING_';
//# sourceMappingURL=block_svg.js.map