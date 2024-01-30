/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { Bubble } from './bubble.js';
import * as dom from '../utils/dom.js';
import { Size } from '../utils/size.js';
import { Svg } from '../utils/svg.js';
/**
 * A bubble that displays non-editable text. Used by the warning icon.
 */
export class TextBubble extends Bubble {
    constructor(text, workspace, anchor, ownerRect) {
        super(workspace, anchor, ownerRect);
        this.text = text;
        this.workspace = workspace;
        this.anchor = anchor;
        this.ownerRect = ownerRect;
        this.paragraph = this.stringToSvg(text, this.contentContainer);
        this.updateBubbleSize();
    }
    /** @returns the current text of this text bubble. */
    getText() {
        return this.text;
    }
    /** Sets the current text of this text bubble, and updates the display. */
    setText(text) {
        this.text = text;
        dom.removeNode(this.paragraph);
        this.paragraph = this.stringToSvg(text, this.contentContainer);
        this.updateBubbleSize();
    }
    /**
     * Converts the given string into an svg containing that string,
     * broken up by newlines.
     */
    stringToSvg(text, container) {
        const paragraph = this.createParagraph(container);
        const spans = this.createSpans(paragraph, text);
        if (this.workspace.RTL)
            this.rightAlignSpans(paragraph.getBBox().width, spans);
        return paragraph;
    }
    /** Creates the paragraph container for this bubble's view's spans. */
    createParagraph(container) {
        return dom.createSvgElement(Svg.TEXT, {
            'class': 'blocklyText blocklyBubbleText blocklyNoPointerEvents',
            'y': Bubble.BORDER_WIDTH,
        }, container);
    }
    /** Creates the spans visualizing the text of this bubble. */
    createSpans(parent, text) {
        return text.split('\n').map((line) => {
            const tspan = dom.createSvgElement(Svg.TSPAN, { 'dy': '1em', 'x': Bubble.BORDER_WIDTH }, parent);
            const textNode = document.createTextNode(line);
            tspan.appendChild(textNode);
            return tspan;
        });
    }
    /** Right aligns the given spans. */
    rightAlignSpans(maxWidth, spans) {
        for (const span of spans) {
            span.setAttribute('text-anchor', 'end');
            span.setAttribute('x', `${maxWidth + Bubble.BORDER_WIDTH}`);
        }
    }
    /** Updates the size of this bubble to account for the size of the text. */
    updateBubbleSize() {
        const bbox = this.paragraph.getBBox();
        this.setSize(new Size(bbox.width + Bubble.BORDER_WIDTH * 2, bbox.height + Bubble.BORDER_WIDTH * 2), true);
    }
}
//# sourceMappingURL=text_bubble.js.map