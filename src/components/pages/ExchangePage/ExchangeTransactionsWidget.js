import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
    Paper,
    Divider,
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHeaderColumn,
    TableRowColumn,
    TableFooter,
    RaisedButton,
    CircularProgress
} from 'material-ui';

import {getTransactions} from '../../../redux/ducks/exchange/transactions';

import globalStyles from '../../../styles';

const styles = {
    columns: {
        id: {
            width: '10%'
        },
        hash: {
            width: '55%'
        },
        status: {
            time: '20%'
        },
        value: {
            time: '20%'
        }
    }
};

const mapStateToProps = (state) => ({
    transactions: state.get('exchangeTransactions').transactions,
    isFetching: state.get('exchangeTransactions').isFetching
});

const mapDispatchToProps = (dispatch) => ({
    getTransactions: (address, count, endBlock) => dispatch(getTransactions(address, count, endBlock))
});

@connect(mapStateToProps, mapDispatchToProps)
class ExchangeTransactionsWidget extends Component {

    componentWillMount() {
        this.props.getTransactions(localStorage.getItem('chronoBankAccount'), 100);
    }

    render() {
        return (
            <Paper style={globalStyles.paper} zDepth={1} rounded={false}>
                <h3 style={globalStyles.title}>Transactions</h3>
                <Divider style={{backgroundColor: globalStyles.title.color}}/>

                <Table selectable={false}>
                    <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
                        <TableRow>
                            <TableHeaderColumn style={styles.columns.id}>Block Number</TableHeaderColumn>
                            <TableHeaderColumn style={styles.columns.hash}>Hash</TableHeaderColumn>
                            <TableHeaderColumn style={styles.columns.time}>Time</TableHeaderColumn>
                            <TableHeaderColumn style={styles.columns.value}>Value</TableHeaderColumn>
                        </TableRow>
                    </TableHeader>
                    <TableBody displayRowCheckbox={false}>
                        {
                            this.props.transactions.sortBy(x => x.blockNumber)
                                .reverse()
                                .valueSeq()
                                .map(tx => (
                                    <TableRow key={tx.blockNumber}>
                                        <TableRowColumn style={styles.columns.id}>{tx.blockNumber}</TableRowColumn>
                                        <TableRowColumn style={styles.columns.hash}>{tx.txHash}</TableRowColumn>
                                        <TableRowColumn
                                            style={styles.columns.time}>{tx.getTransactionTime()}</TableRowColumn>
                                        <TableRowColumn style={styles.columns.value}>
                                            {tx.getTransactionSign() + tx.getValue() + ' ' + tx.symbol}
                                        </TableRowColumn>
                                    </TableRow>
                                ))
                        }
                        {
                            this.props.isFetching ?
                                (
                                    <TableRow key="loader">
                                        <TableRowColumn style={{width: '100%', textAlign: 'center'}} colSpan={4}>
                                            <CircularProgress style={{margin: '0 auto'}} size={24} thickness={1.5}/>
                                        </TableRowColumn>
                                    </TableRow>
                                ) : null
                        }
                    </TableBody>
                    <TableFooter adjustForCheckbox={false}>
                        <TableRow>
                            <TableRowColumn>
                                <RaisedButton label="Load More"
                                              onTouchTap={this.handleTouchTap}
                                              fullWidth={true}
                                              primary={true}/>
                            </TableRowColumn>
                        </TableRow>
                    </TableFooter>
                </Table>
            </Paper>
        );
    }
}

export default ExchangeTransactionsWidget;