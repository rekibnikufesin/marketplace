import React, { Component }     from 'react'
import PropTypes                from 'prop-types'
import { connect }              from 'react-redux'
import { bindActionCreators}    from 'redux'
import { withRouter }           from 'react-router-dom'

import Avatar                   from '@material-ui/core/Avatar'
import Button                   from '@material-ui/core/Button'
import Chip                     from '@material-ui/core/Chip'
import Grid                     from '@material-ui/core/Grid'
import Snackbar                 from '@material-ui/core/Snackbar'
import TextField                from '@material-ui/core/TextField'
import Typography               from '@material-ui/core/Typography'

import StoreFront               from 'components/StoreFronts'

import * as storeCreators       from '../../core/actions/actions-store'

class StoreOwner extends Component {
    constructor(props) {
        super(props)
        this.isStoreOwner = this.isStoreOwner.bind(this)
        this.getStoreFronts = this.getStoreFronts.bind(this)
        this.state = {
            isOwner: false,
            storeFrontName: '',
            storeFrontDesc: '',
            open: false,
            message: '',
            storeFronts: [
                {
                    id: '',
                    name: '',
                    description: '',
                    online: ''
                }
            ],
        }
    }

    componentDidMount() {
        if (this.props.marketplaceStatus === false) {
            this.setState({
                open: true,
                message: 'The Marketplace is currently offline. You can still transfer funds.'
            })
        }
    }
    
    componentWillReceiveProps(nextProps) {
        if (this.props.marketplaceStatus !== nextProps.marketplaceStatus) {
            if (nextProps.marketplaceStatus === false) {
                this.setState({
                    open: true,
                    message: 'The Marketplace is currently offline. You can still manage your store fronts, but shoppers are unable to purchase goods.'
                })
            }
        }
        if (this.props.marketplaceStatus){

            if (this.props.provider.web3Provider !== nextProps.provider.web3Provider) {
                this.isStoreOwner()
            }
            if (this.props.store.storeFrontId !== nextProps.store.storeFrontId) {
                this.setState({
                    message: `New store added with ID: ${nextProps.store.storeFrontId}`,
                    open: true,
                })
                this.getStoreFronts()
            }
            if (this.props.store.isOwner !== nextProps.store.isOwner) {
                this.setState({isOwner: nextProps.store.isOwner})
                this.getStoreFronts()
            }
            if (this.props.store.storeFronts !== nextProps.store.storeFronts) {
                this.setState({storeFronts: nextProps.store.storeFronts})
            }
            if (this.props.store.tx !== nextProps.store.tx) {
                this.setState({
                    message: `Funds transferred. Transaction id ${nextProps.store.tx}`,
                    open: true,
                })
                this.isStoreOwner()
            }
        }

    }

    isStoreOwner() {
        const { actions } = this.props
        actions.store.isStoreOwner()
    }

    handleStoreFrontChange = name => event => {
        this.setState({
            [name]: event.target.value,
        })
    }

    handleNewStoreSubmit = () => {
        const { actions } = this.props
        actions.store.addStoreFront(this.state.storeFrontName, this.state.storeFrontDesc)
        this.setState({
            storeFrontName: '',
            storeFrontDesc: '',
        })
    }

    handleClose = () => {
        this.setState({ open: false })
    }

    getStoreFronts = () => {
        const { actions } = this.props
        actions.store.getStoreFronts()
    }

    withdrawFunds = () => {
        const { actions } = this.props
        actions.store.withdrawFunds()
    }

    render() {
        if (this.props.store.isOwner) {
            return (
                <div style={{ padding: 20 }}>
                    <Grid container spacing={24} style={{ padding: 10, margin: 10 }}>
                        <Grid item xs={6}>
                            <Typography variant="headline" component="h2">
                                Add a new store front
                            </Typography>
                            <form noValidate autoComplete="off">
                                <TextField
                                    id="storeFrontName"
                                    label="Store Front Name"
                                    value={this.state.storeFrontName}
                                    onChange={this.handleStoreFrontChange('storeFrontName')}
                                />
                                <TextField
                                    id="storeFrontDesc"
                                    label="Store Front Desc"
                                    value={this.state.storeFrontDesc}
                                    onChange={this.handleStoreFrontChange('storeFrontDesc')}
                                />
                                <Button color="primary" onClick={this.handleNewStoreSubmit}>Add Store Front</Button>
                            </form>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption">
                                Funds earned. Click to transfer.
                            </Typography>
                            <Chip
                                avatar={<Avatar>Ξ</Avatar>}
                                label={this.props.store.balance}
                                clickable
                                color="primary"
                                onClick={this.withdrawFunds}
                            />
                        </Grid>
                    </Grid>
                    <Grid container spacing={24} style={{ padding: 10, margin: 10 }}>
                        {this.props.store.storeFronts.map((store) =>
                            <Grid item xs={6} key={store.id}>
                                <StoreFront key={store.id} storefront={store} />
                            </Grid>
                        )}
                    </Grid>
                    <Snackbar
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        open={this.state.open}
                        message={this.state.message}
                        onClose={this.handleClose}
                    />
                </div>
            )
        } else {
            return (
                <div style={{ padding: 20 }}>Sorry, this section is reserved for Store Owners.</div>
            )
        }
    }
}

StoreOwner.propTypes = {
    history: PropTypes.object,
    provider: PropTypes.object,
    store: PropTypes.object
}

function mapStateToProps(state) {
    return {
        provider: state.provider,
        store: state.store
    }
}

function mapDispatchToProps(dispatch) {
    return  {
        actions: {
            store: bindActionCreators(storeCreators, dispatch)
        }
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(StoreOwner))
