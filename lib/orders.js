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
        this.columns = ['id', 'symbol', 'exchange', 'status', 'date', 'options'];
        this.orders = [];

        this.columns = [
            {accessor: o => o.symbol && o.symbol.identifier},
            'side',
            'size',
            'filled',
            'price',
            'fee',
            {accessor: o => moment(o.created).format('YYYY-MM-DD HH:mm:ss')},
            'status',
            {
                element: o => {
                    if(o.status === 'done'){
                        return (<div className='td'></div>);
                    }

                    return (
                        <div className='td'>
                            <div class='option kill' onclick={() => this.kill(o)}>Kill Order</div>
                        </div>
                    );
                }
            }
        ];

        etch.initialize(this);

        this.disposables.add(via.orders.onDidAddOrder(this.add.bind(this)));
        this.disposables.add(via.orders.onDidRemoveOrder(this.remove.bind(this)));
    }

    add(order){
        this.orders.push(order);
        this.disposables.add(order.onDidUpdate(this.update.bind(this)));
        this.update();
    }

    remove(order){
        this.orders.splice(this.orders.indexOf(order), 1);
        this.update();
    }

    modify(){
        this.update();
    }

    destroy(){
        this.disposables.dispose();
        etch.destroy(this);
    }

    update(){
        etch.update(this);
    }

    kill(order){
        order.kill();
    }

    render(){
        return (
            <div className='orders panel-body padded'>
                <div className='thead toolbar'>
                    <div className='td'>Symbol</div>
                    <div className='td'>Side</div>
                    <div className='td'>Size</div>
                    <div className='td'>Filled</div>
                    <div className='td'>Price</div>
                    <div className='td'>Fees</div>
                    <div className='td'>Created</div>
                    <div className='td'>Status</div>
                    <div className='td'>Options</div>
                </div>
                <div className='orders-list'>
                    <ViaTable columns={this.columns} data={this.orders}></ViaTable>
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
