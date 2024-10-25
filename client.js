import CaretSelection from 'editorjs-caret-selection';
import { io } from 'socket.io-client'

/**
 * 
 * @param {*} data Initial Block data
 * @param {*} editor EditorJs Instance
 * @param {*} currentUniqueId 
 * @param {*} display 
 * @param {*} color
 */
export default function (editor, currentUniqueId, display, color) {
    let t = {
        shouldPreventChange: false,
        checkIfChangesShouldBeUpdated: function () {
            return this.shouldPreventChange
        }
    };

    let carets = [];

    const socket = io('http://localhost:3000');

    let caretSelection = new CaretSelection(editor, currentUniqueId, display, {
        background: color,
    }, {
        background: color,
    });

    caretSelection.onChange((caret) => {
        // listen for current user's cursor change
        socket.emit('selection', caret)
    })

    // listen on other user's cursor change
    socket.on('selection', (caret) => {
        carets = carets.filter((_caret) => caret.id !== caret.id);
        carets.push(caret)
        caretSelection.showSelection(caret);
    })

    socket.on('block-changed', async (index, uniqueId, block) => {
        if (uniqueId === currentUniqueId) return;

        t.shouldPreventChange = true;

        await editor.blocks.update(editor.blocks.getBlockByIndex(index).id, block.data, block.tunes)
        // search carets at the block
        let caretsAtBlock = carets.filter((caret) => caret.blockIndex === index)
        caretsAtBlock.forEach((caret) => {
            caretSelection.showSelection(caret);
        })
    })

    socket.on('block-added', async (index, uniqueId, block) => {
        if (uniqueId === currentUniqueId) return;

        t.shouldPreventChange = true;

        await editor.blocks.insert(block.type, block.data, block.config, index)

        // search carets at the block
        let caretsAtBlock = carets.filter((caret) => caret.blockIndex === index)
        caretsAtBlock.forEach((caret) => {
            caretSelection.showSelection(caret);
        })
    })

    socket.on('block-removed', async (index, uniqueId) => {
        if (uniqueId === currentUniqueId) return;

        t.shouldPreventChange = true;

        await editor.blocks.delete(index)

        // search carets at the block
        carets = carets.filter((caret) => caret.blockIndex !== index)
        carets.forEach((caret) => {
            caretSelection.showSelection(caret);
        })
    });

    return t;
}