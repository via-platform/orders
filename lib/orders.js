"use babel";
/** @jsx etch.dom */

const {Disposable, CompositeDisposable} = require('via');
const etch = require('etch');
const ViaTable = require('via-table');
const OrdersURI = 'via://orders';
const moment = require('moment');

module.exports = class Orders {
    constructor(state){
        this.disposables = new CompositeDisposable();

        this.columns = [
            {name: 'market', title: 'Market', default: true, accessor: o => o.market.title()},
            {name: 'side', title: 'Side', default: true, accessor: o => o.side},
            {name: 'type', title: 'Type', default: true, accessor: o => o.type},
            {name: 'amount', title: 'Amount', default: true, accessor: o => o.amount},
            {name: 'filled', title: 'Filled', default: true, accessor: o => o.status === 'filled' ? 'Yes' : 'No'}, //TODO this should show total filled amount instead
            {name: 'price', title: 'Price', default: true, accessor: o => o.limit ? o.limit.toFixed(o.market.precision.price) : '-'},
            {name: 'stop', title: 'Stop', default: true, accessor: o => (o.type.indexOf('stop-') === 0 && o.stop) ? o.stop.toFixed(o.market.precision.price) : '-'},
            {name: 'fees', title: 'Fees', default: true, accessor: o => o.fee ? o.fee.cost : '-'},
            {name: 'created', title: 'Created', default: true, accessor: o => o.date ? moment(o.date).format('YYYY-MM-DD HH:mm:ss') : '-'},
            {name: 'status', title: 'Order Status', default: true, accessor: o => o.status ? o.status : '-'},
            {
                name: 'options',
                title: 'Options',
                default: true,
                element: o => {
                    if(['closed', 'canceled'].includes(o.status)){
                        return (<div className='td'></div>);
                    }

                    if(['transmitting', 'canceling'].includes(o.status)){
                        return (
                            <div className='td'>
                                <div class='option'>Working...</div>
                            </div>
                        );
                    }

                    if(['open'].includes(o.status)){
                        return (
                            <div className='td'>
                                <div class='option kill' onclick={() => o.cancel()}>Cancel Order</div>
                            </div>
                        );
                    }

                    if(['pending'].includes(o.status)){
                        return (
                            <div className='td'>
                                <div class='option kill' onclick={() => o.transmit()}>Transmit Order</div>
                            </div>
                        );
                    }

                    return (<div className='td'></div>);
                }
            }
        ];

        etch.initialize(this);

        this.disposables.add(via.orders.onDidCreateOrder(this.update.bind(this)));
        this.disposables.add(via.orders.onDidUpdateOrder(this.update.bind(this)));
        this.disposables.add(via.orders.onDidDestroyOrder(this.update.bind(this)));
    }

    destroy(){
        this.disposables.dispose();
        etch.destroy(this);
    }

    update(){
        etch.update(this);
    }

    render(){
        const orders = via.orders.valid();

        return (
            <div className='orders panel-body padded'>
                <ViaTable columns={this.columns} data={orders} classes="orders-list"></ViaTable>
            </div>
        );
    }

    getDefaultLocation(){
        return 'bottom';
    }

    getPreferredLocation(){
        return this.getDefaultLocation();
    }

    isPermanentDockItem(){
        return false;
    }

    getTitle(){
        return 'Orders';
    }

    getURI(){
        return OrdersURI;
    }
}
