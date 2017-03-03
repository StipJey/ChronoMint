import AppDAO from '../../dao/AppDAO';
import {watchUpdateCBE, watchRevokeCBE} from './settings/cbe';
import {watchUpdateToken} from './settings/tokens';
import {handleNewLOC} from './locs/data';
import {handleConfirmOperation, handleRevokeOperation} from './pendings/data';

export const watcher = (account: string) => (dispatch) => {
    // Important! Only CBE can watch events below
    AppDAO.isCBE(account).then(isCBE => {
        if (!isCBE) {
            return;
        }
        AppDAO.watchUpdateCBE(
            (cbe, ts) => dispatch(watchUpdateCBE(cbe, ts)),
            (cbe, ts) => dispatch(watchRevokeCBE(cbe, ts))
        );
        AppDAO.watchUpdateToken(
            (token, ts) => dispatch(watchUpdateToken(token, ts))
        );
        AppDAO.newLOCWatch(
            (e, r) => dispatch(handleNewLOC(r.args._LOC)) // TODO e defined but not used
        );
        AppDAO.confirmationWatch(
            (e, r) => dispatch(handleConfirmOperation(r.args.operation, account)) // TODO e defined but not used
        );
        AppDAO.revokeWatch(
            (e, r) => dispatch(handleRevokeOperation(r.args.operation, account)) // TODO e defined but not used
        );

        // ^ Free string above is for your watchers ^
    });
};