import {Map} from 'immutable';
import DAOFactory from './DAOFactory';
import AbstractContractDAO from './AbstractContractDAO';
import TokenContractModel from '../models/contracts/TokenContractModel';

class TokenContractsDAO extends AbstractContractDAO {
    /** @return {Promise.<Map[string,TokenContractModel]>} associated with token asset address */
    getList() {
        return new Promise(resolve => {
            this.contract.then(deployed => {
                deployed.getContracts.call().then(contracts => {
                    let map = new Map();
                    const callback = (proxyAddress) => {
                        let contract = new TokenContractModel({proxy: proxyAddress});
                        contract.proxy().then(proxy => {
                            proxy.getLatestVersion().then(address => {
                                proxy.getName().then(name => {
                                    proxy.getSymbol().then(symbol => {
                                        contract = contract.set('address', address);
                                        contract = contract.set('name', name);
                                        contract = contract.set('symbol', symbol);
                                        map = map.set(contract.address(), contract);
                                        if (map.size === contracts.length) {
                                            resolve(map);
                                        }
                                    });
                                });
                            });
                        });
                    };
                    for (let j in contracts) {
                        if (contracts.hasOwnProperty(j)) {
                            callback(contracts[j]);
                        }
                    }
                    if (!contracts.length) {
                        resolve(map);
                    }
                });
            });
        });
    };

    getBalances(symbol, offset, length) {
        offset++;
        return new Promise(resolve => {
            this.contract.then(deployed => {
                deployed.getAssetBalances.call(symbol, offset, length).then(result => {
                    let addresses = result[0];
                    let balances = result[1];
                    let map = new Map();
                    for (let key in addresses) {
                        if (addresses.hasOwnProperty(key) && balances.hasOwnProperty(key)
                            && !this._isEmptyAddress(addresses[key])) {
                            map = map.set(addresses[key], balances[key].toNumber());
                        }
                    }
                    resolve(map);
                });
            });
        });

    };

    /**
     * @param proxyAddress
     * @return {Promise.<bool>}
     * @private
     */
    _isAdded(proxyAddress) {
        return new Promise(resolve => {
            this.contract.then(deployed => {
                deployed.getContracts.call().then(contracts => {
                    for (let key in contracts) {
                        if (contracts.hasOwnProperty(key)) {
                            if (contracts[key] === proxyAddress) {
                                resolve(true);
                                return;
                            }
                        }
                    }
                    resolve(false);
                });
            });
        });
    };

    /**
     * @param current will be removed from list
     * @param newAddress proxy or asset
     * @param account from
     * @return {Promise.<bool>}
     */
    treat(current: TokenContractModel, newAddress: string, account: string) {
        return new Promise(resolve => {
            if (current.address() === newAddress || current.proxyAddress() === newAddress) {
                resolve(false);
            }
            const callback = (proxyAddress) => {
                this._isAdded(proxyAddress).then(isTokenAdded => {
                    if (isTokenAdded) { // to prevent overriding of already added addresses
                        resolve(false);
                        return;
                    }
                    DAOFactory.initProxyDAO(proxyAddress).then(() => {
                        this.contract.then(deployed => {
                            const params = {from: account, gas: 3000000};
                            if (current.address()) {
                                deployed.changeAddress(current.proxyAddress(), proxyAddress, params).then(() => resolve(true));
                            } else {
                                deployed.setAddress(proxyAddress, params).then(() => resolve(true));
                            }
                        });
                    }).catch(() => resolve(false));
                });
            };
            // we need to know whether the newAddress is proxy or asset
            DAOFactory.initAssetDAO(newAddress).then(asset => {
                asset.getProxyAddress()
                    .then(proxyAddress => callback(proxyAddress))
                    .catch(() => callback(newAddress));
            }).catch(() => resolve(false));
        });
    };

    /**
     * @param token
     * @param account
     * @return {Promise.<bool>}
     */
    remove(token: TokenContractModel, account: string) {
        return new Promise(resolve => {
            this.contract.then(deployed => {
                deployed.removeAddress(token.proxyAddress(), {from: account, gas: 3000000}).then(() => resolve(true));
            });
        });
    };

    /**
     * @param callback will receive TokenContractModel, timestamp and revoke flag
     * @see TokenContractModel
     */
    watch(callback) {
        this.contract.then(deployed => {
            this._watch(deployed.updateContract, (result, block, ts) => {
                const proxyAddress = result.args.contractAddress;
                DAOFactory.initProxyDAO(proxyAddress, block).then(proxy => {
                    proxy.getLatestVersion().then(address => {
                        proxy.getName().then(name => {
                            proxy.getSymbol().then(symbol => {
                                this._isAdded(proxyAddress).then(isAdded => {
                                    callback(new TokenContractModel({
                                        address: address,
                                        proxy: proxyAddress,
                                        name,
                                        symbol
                                    }), ts, !isAdded);
                                });
                            });
                        });
                    });
                });
            });
        });
    };
}

export default new TokenContractsDAO(require('../contracts/ContractsManager.json'));