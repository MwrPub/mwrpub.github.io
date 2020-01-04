'use strict';
(function () {
    class MwrTable extends HTMLElement {

        get caption() {
            return this.getAttribute('caption');
        }

        set caption(val) {
            this.setAttribute('caption', val);
        }

        get list() {
            return this.datas || this._parse(this.getAttribute('list'));
        }

        set list(val) {
            this._parse(val);
            if (this.shadowRoot) {
                let table = this.shadowRoot.querySelector('table');
                this._render(table);
            }
        }

        static get observedAttributes() {
            return ['caption', 'list'];
        }

        attributeChangedCallback(name, oldVal, newVal) {
            if (this.shadowRoot) {
                let table = this.shadowRoot.querySelector('table');
                switch (name) {
                    case 'caption':
                        let caption = this.shadowRoot.querySelector('caption');
                        if (!caption) {
                            caption = document.createElement('caption');
                            table.prepend(caption);
                        }
                        caption.innerHTML = newVal;
                        break;
                    case 'list':
                        let tmp = this._parse(newVal);
                        this._render(table);
                        break;
                }
            }
        }

        connectedCallback() {
            this._init();
        }

        _init() {
            const style = document.createElement('style');
            const table = document.createElement('table');
            const shadowRoot = this.attachShadow({mode: 'open'});
            style.innerHTML=`
table {
  font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
  border-collapse: collapse;
  width: 100%;
}

table td, table th {
  border: 1px solid #ddd;
  padding: 8px;
}

table tr:nth-child(even){background-color: #f2f2f2;}

table tr:hover {background-color: #ddd;}

table th {
  padding-top: 12px;
  padding-bottom: 12px;
  text-align: left;
  background-color: #4CAF50;
  color: white;
}
            `;
            this._render(table);
            shadowRoot.appendChild(style);
            shadowRoot.appendChild(table);
        }

        _parse(val) {
            if (Array.isArray(val)) {
                this.datas = val;
            } else if (typeof val === 'string') {
                try {
                    let tmp = JSON.parse(val);
                    if (Array.isArray(tmp)) {
                        this.datas = tmp;
                    } else {
                        this.datas = [];
                    }
                } catch (e) {
                    this.datas = [];
                }
            }
            return this.datas;
        }

        _render(table) {
            const caption = this.caption ? `<caption>${this.caption}</caption>` : '';
            let column = [];
            let head = '<tr>';
            let body = '';
            let data = this.list || '';
            for (let i = 0; i < data.length; i++) {
                for (let k in data[i]) {
                    if (data[i].hasOwnProperty(k) && column.indexOf(k) === -1) {
                        column.push(k);
                        head += `<th>${k}</th>`;
                    }
                }
            }
            for (let i = 0; i < data.length; i++) {
                let row = '<tr>';
                for (let k of column) {
                    let v = data[i][k] || '';
                    row += `<td>${v}</td>`
                }
                row += '</tr>';
                body += row;
            }
            head += '</tr>';
            table.innerHTML = `${caption}<thead>${head}</thead><tbody>${body}</tbody>`;
        }
    }

    window.customElements.define('mwr-table', MwrTable);
})();
