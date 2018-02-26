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
            {accessor: o => o.market.title()},
            'side',
            'type',
            'amount',
            'filled',
            {accessor: o => o.limit ? o.limit.toFixed(o.market.precision.price) : '-'},
            {accessor: o => (o.type === 'stop' && o.stop) ? o.stop.toFixed(o.market.precision.price) : '-'},
            {accessor: o => o.fee ? o.fee.cost : '-'},
            {accessor: o => o.date ? moment(o.date).format('YYYY-MM-DD HH:mm:ss') : '-'},
            'status',
            {
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
                <div className='thead toolbar'>
                    <div className='td'>Market</div>
                    <div className='td'>Side</div>
                    <div className='td'>Type</div>
                    <div className='td'>Amount</div>
                    <div className='td'>Filled</div>
                    <div className='td'>Price</div>
                    <div className='td'>Stop</div>
                    <div className='td'>Fees</div>
                    <div className='td'>Created</div>
                    <div className='td'>Status</div>
                    <div className='td'>Options</div>
                </div>
                <div className='orders-list'>
                    <ViaTable columns={this.columns} data={orders}></ViaTable>
                </div>
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
