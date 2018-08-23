const {CompositeDisposable, Disposable, Emitter} = require('via');
const etch = require('etch');
const $ = etch.dom;

module.exports = class OrdersStatusView {
    constructor({status}){
        this.status = status;
        this.disposables = new CompositeDisposable();
        this.message = null;
        this.timeout = null;

        etch.initialize(this);

        this.statusBarTile = this.status.addRightTile({item: this});

        this.disposables.add(via.orders.onDidCreateOrder(this.update.bind(this)));
        this.disposables.add(via.orders.onDidUpdateOrder(this.update.bind(this)));
        this.disposables.add(via.orders.onDidDestroyOrder(this.update.bind(this)));
    }

    render(){
        return $.div({classList: `orders-status toolbar-button`, onClick: this.open},
            $.div({class: 'orders-status-icon'}),
            $.div({classList: 'orders-status-message'}, via.orders.open().length)
        );
    }

    open(){
        via.workspace.getElement().dispatchEvent(new CustomEvent('orders:create-orders', {bubbles: true, cancelable: true}));
    }

    update(){
        etch.update(this);
    }

    destroy(){
        this.statusBarTile.destroy();
        this.disposables.dispose();
    }
}