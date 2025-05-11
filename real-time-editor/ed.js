let timeout;

// Debounced live update
function updateDebounced() {
    clearTimeout(timeout);
    timeout = setTimeout(update, 300);
}

// Live preview update
function update() {
    const html = document.getElementById("htmlCode").value;
    const css = document.getElementById("cssCode").value;
    const js = document.getElementById("javascriptCode").value;

    const safeJS = `
        try {
            ${js}
        } catch (e) {
            document.body.innerHTML += '<pre style="color:red;">' + e + '</pre>';
        }
    `.replace(/<\/script>/gi, "<\\/script>");

    const doc = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>${css}</style>
        </head>
        <body>
            ${html}
            <script>${safeJS}<\/script>
        </body>
        </html>
    `;

    const iframe = document.getElementById("viewer");
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(doc);
    iframeDoc.close();
}

// Save content to localStorage
function saveToStorage() {
    localStorage.setItem("htmlCode", document.getElementById("htmlCode").value);
    localStorage.setItem("cssCode", document.getElementById("cssCode").value);
    localStorage.setItem("jsCode", document.getElementById("javascriptCode").value);
}

// Load saved content on refresh
function loadFromStorage() {
    const html = localStorage.getItem("htmlCode");
    const css = localStorage.getItem("cssCode");
    const js = localStorage.getItem("jsCode");

    if (html) document.getElementById("htmlCode").value = html;
    if (css) document.getElementById("cssCode").value = css;
    if (js) document.getElementById("javascriptCode").value = js;
}

document.addEventListener("DOMContentLoaded", () => {
    const editors = ["htmlCode", "cssCode", "javascriptCode"];

    editors.forEach(id => {
        const el = document.getElementById(id);

        // Live preview on input
        el.addEventListener("input", () => {
            updateDebounced();
            saveToStorage();
        });

        // Tab indent support
        el.addEventListener("keydown", function (e) {
            if (e.key === "Tab") {
                e.preventDefault();
                const start = this.selectionStart;
                const end = this.selectionEnd;
                this.value = this.value.substring(0, start) + "\t" + this.value.substring(end);
                this.selectionStart = this.selectionEnd = start + 1;
            }
        });
    });

    // Ctrl + Enter to manually refresh
    document.addEventListener("keydown", e => {
        if (e.ctrlKey && e.key === "Enter") {
            update();
        }
    });

    // Load saved code and update preview
    loadFromStorage();
    update();

    // Split.js panel resizing
    if (typeof Split === "function") {
        Split(['.container', '.iframe-container'], {
            sizes: [50, 50],
            minSize: 100,
            gutterSize: 8,
            cursor: 'col-resize'
        });
    }
});