import React, { Component } from 'react'
import PropTypes                from 'prop-types'
import { connect }              from 'react-redux'
import { bindActionCreators }   from 'redux'
import { withRouter }           from 'react-router-dom'

import Card                     from '@material-ui/core/Card'
import Grid                     from '@material-ui/core/Grid'
import Paper                    from '@material-ui/core/Paper'
import Typography               from '@material-ui/core/Typography'

import Stores                   from '../../components/Stores'

import * as shopperCreators     from '../../core/actions/actions-shopper'

class ShoppingPage extends Component {
    constructor(props) {
        super(props)
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.provider.web3Provider !== nextProps.provider.web3Provider) {
            this.getAllStoreFronts()
        }
    }

    getAllStoreFronts = () => {
        const { actions } = this.props
        actions.shopper.getAllStoreFronts()
    }

    render() {
        if (this.props.marketplaceStatus) {
            return (
                <div>
                    <Paper style={{ padding: 5 }}>
                        <Typography variant="headline" component="h2">
                            Marketplace
                        </Typography>
                    </Paper>
                    <Card>
                        <Grid container spacing={0} style={{ padding: 5, margin: 5 }}>
                            {this.props.shopper.stores.map((store) =>
                                <Grid item xs={6} key={store.id}>
                                    <Stores key={store.id} storefront={store} />
                                </Grid>
                            )}
                        </Grid>
                    </Card>
                </div>
            )
        } else {
            return (
                <div>
                    The Marketplace is currently offline, please check back later.
                </div>
            )
        }
    }
}

ShoppingPage.propTypes = {
    history: PropTypes.object,
    providers: PropTypes.object,
    store: PropTypes.object
}

function mapStateToProps(state) {
    return {
        provider: state.provider,
        shopper: state.shopper
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            shopper: bindActionCreators(shopperCreators, dispatch)
        }
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ShoppingPage))