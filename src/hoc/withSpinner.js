import React from 'react';
import {CircularProgress} from 'material-ui';

type propsType = {
    isFetching: boolean
}

const withSpinner = (Component) => {
    class Wrapped extends React.Component {
        props: propsType;
        render() {
            const {isFetching, ...restProps} = this.props;
            return isFetching
                ? (<div>
                    <CircularProgress style={{position: 'absolute', top: '50%',  left: '50%', transform: 'translateY(-50%) translateX(-50%)'}}/>
                    <Component {...restProps} />
                </div>)
                // ? (<div style={{textAlign: 'center', height: '100vh', position: 'relative'}}>
                //     <CircularProgress style={{position: 'relative', top: '50%', transform: 'translateY(-50%)'}}/>
                // </div>)
                : <Component {...restProps} />;
        }
    }
    return Wrapped;
};

export default withSpinner;