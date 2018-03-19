const {CompositeDisposable, Disposable} = require('via');
const Orders = require('./orders');

class OrdersPackage {
    activate(state){
        this.disposables = new CompositeDisposable();
        this.orders = new Orders(state);

        this.disposables.add(via.commands.add('via-workspace', {
            'orders:toggle': () => this.toggle(),
            'orders:focus': () => document.querySelector('.orders').focus()
        }));

        via.workspace.open(this.orders, {activateItem: false, activatePane: false})
        .then(() => {
            const paneContainer = via.workspace.paneContainerForURI(this.orders.getURI());

            if(paneContainer){
                paneContainer.show();
            }
        });
    }

    toggle(){

    }

    deactivate(){
        this.disposables.dispose();

        if(this.orders){
            this.orders.destroy();
        }
    }
}

module.exports = new OrdersPackage();
