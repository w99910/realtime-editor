import EditorJS from '@editorjs/editorjs';
import Header from 'editorjs-header-with-alignment';
import List from '@editorjs/list';
import Delimiter from '@editorjs/delimiter';
import Quote from '@editorjs/quote';
import Warning from '@editorjs/warning';
import CheckList from '@editorjs/checklist';
import Link from '@editorjs/link';
import Code from '@editorjs/code';
import InlineCode from '@editorjs/inline-code';
import client from './client';
import { io } from 'socket.io-client'

let data = {
    "time": 1591362820044,
    "blocks": [
        {
            "type": "header",
            "data": {
                "text": "Editor.js",
                "level": 2
            }
        },
        {
            "type": "paragraph",
            "data": {
                "text": "Hey. Meet the new Editor. On this page you can see it in action — try to edit this text."
            }
        },
        {
            "type": "header",
            "data": {
                "text": "Key features",
                "level": 3
            }
        },
        {
            "type": "list",
            "data": {
                "style": "unordered",
                "items": [
                    "It is a block-styled editor",
                    "It returns clean data output in JSON",
                    "Designed to be extendable and pluggable with a simple API",
                    "In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document or a typeface without relying on meaningful content. Lorem ipsum may be used as a placeholder before the final copy is available."
                ]
            }
        },
        {
            "type": "header",
            "data": {
                "text": "What does it mean «block-styled editor»",
                "level": 3
            }
        },
        {
            "type": "paragraph",
            "data": {
                "text": "Workspace in classic editors is made of a single contenteditable element, used to create different HTML markups. Editor.js <mark class=\"cdx-marker\">workspace consists of separate Blocks: paragraphs, headings, images, lists, quotes, etc</mark>. Each of them is an independent contenteditable element (or more complex structure) provided by Plugin and united by Editor's Core."
            }
        },
        {
            "type": "paragraph",
            "data": {
                "text": "There are dozens of <a href=\"https://github.com/editor-js\">ready-to-use Blocks</a> and the <a href=\"https://editorjs.io/creating-a-block-tool\">simple API</a> for creation any Block you need. For example, you can implement Blocks for Tweets, Instagram posts, surveys and polls, CTA-buttons and even games."
            }
        },
        {
            "type": "header",
            "data": {
                "text": "What does it mean clean data output",
                "level": 3
            }
        },
        {
            "type": "paragraph",
            "data": {
                "text": "Classic WYSIWYG-editors produce raw HTML-markup with both content data and content appearance. On the contrary, Editor.js outputs JSON object with data of each Block. You can see an example below"
            }
        },
        {
            "type": "paragraph",
            "data": {
                "text": "Given data can be used as you want: render with HTML for <code class=\"inline-code\">Web clients</code>, render natively for <code class=\"inline-code\">mobile apps</code>, create markup for <code class=\"inline-code\">Facebook Instant Articles</code> or <code class=\"inline-code\">Google AMP</code>, generate an <code class=\"inline-code\">audio version</code> and so on."
            }
        },
        {
            "type": "paragraph",
            "data": {
                "text": "Clean data is useful to sanitize, validate and process on the backend."
            }
        },
        {
            "type": "delimiter",
            "data": {}
        },
        {
            "type": "paragraph",
            "data": {
                "text": "We have been working on this project more than three years. Several large media projects help us to test and debug the Editor, to make it's core more stable. At the same time we significantly improved the API. Now, it can be used to create any plugin for any task. Hope you enjoy. 😏"
            }
        },
    ]
}

const firstNames = [
    "John", "Jane", "Michael", "Emily", "Chris", "Sarah", "David", "Jessica",
    "Daniel", "Ashley", "James", "Amanda", "Robert", "Jennifer", "Mary",
    "William", "Patricia", "Linda", "Barbara", "Elizabeth"
];

const colors = [
    "blue", 'red', '#1A1A19', 'orange', '#31511E', '#9B7EBD', '#604CC3'
];

let name = firstNames[Math.floor(Math.random() * firstNames.length)];
let color = colors[Math.floor(Math.random() * colors.length)];

const socket = io('http://localhost:3000');

let socketClient = null;

var editor = new EditorJS({
    holder: 'editor',
    data: data,
    tools: {
        header: Header,
        list: List,
        delimiter: Delimiter,
        quote: Quote,
        warning: Warning,
        checklist: CheckList,
        link: Link,
        code: Code,
        inlineCode: InlineCode
    },
    onChange: async (api, event) => {
        if (socketClient.shouldPreventChange) {
            socketClient.shouldPreventChange = false;
            return;
        }

        switch (event.type) {
            case 'block-changed':
                editor.save().then((updatedData) => {
                    let newBlock = updatedData.blocks[event.detail.index];
                    let currentBlock = data.blocks[event.detail.index];
                    data.blocks[event.detail.index] = newBlock;
                    if (!currentBlock) {
                        return socket.emit('block-added', event.detail.index, name, newBlock);
                    }
                    if (newBlock.type === currentBlock.type && newBlock.data === currentBlock.data) {
                        return;
                    }
                    socket.emit('block-changed', event.detail.index, name, updatedData.blocks[event.detail.index]);
                });
                break;
            case 'block-added':
                let newBlock = {
                    type: "paragraph",
                    data: {
                        text: ''
                    }
                };
                data.blocks[event.detail.index] = newBlock;
                socket.emit('block-added', event.detail.index, name, newBlock);
                break;
            case 'block-removed':
                editor.save().then((updatedData) => {
                    data.blocks = updatedData.blocks;
                    socket.emit('block-removed', event.detail.index, name);
                });
                break;
        }
    },
    onReady: async () => {
        socketClient = client(
            editor,
            name,
            name,
            color
        )
    }
});

