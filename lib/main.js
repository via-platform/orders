const {CompositeDisposable, Disposable} = require('via');
const Orders = require('./orders');
const base = 'via://orders';

const InterfaceConfiguration = {
    name: 'Orders',
    description: 'View all a list of open fills.',
    command: 'orders:create-orders',
    uri: base
};

class OrdersPackage {
    activate(state){
        this.disposables = new CompositeDisposable();
        this.orders = [];

        //TODO View orders for a particular market
        this.disposables.add(via.commands.add('via-workspace', 'orders:create-orders', () => via.workspace.open(base)));

        this.disposables.add(via.workspace.addOpener((uri, options) => {
            if(uri === base || uri.startsWith(base + '/')){
                const orders = new Orders({uri});

                this.orders.push(orders);

                return orders;
            }
        }, InterfaceConfiguration));
    }

    deactivate(){
        for(const order of orders){
            order.destroy();
        }

        this.disposables.dispose();
        this.disposables = null;
    }
}

module.exports = new OrdersPackage();
