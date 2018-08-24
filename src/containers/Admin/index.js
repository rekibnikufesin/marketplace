import React, { Component }     from 'react'
import PropTypes                from 'prop-types'
import { connect }              from 'react-redux'
import { bindActionCreators }   from 'redux'
import { withRouter }           from 'react-router-dom'

import Avatar                   from '@material-ui/core/Avatar'
import Button                   from '@material-ui/core/Button'
import Card                     from '@material-ui/core/Card'
import Chip                     from '@material-ui/core/Chip'
import Dialog                   from '@material-ui/core/Dialog'
import DialogActions            from '@material-ui/core/DialogActions'
import DialogContent            from '@material-ui/core/DialogContent'
import DialogContentText        from '@material-ui/core/DialogContentText'
import DialogTitle              from '@material-ui/core/DialogTitle'
import Grid                     from '@material-ui/core/Grid'
import Snackbar                 from '@material-ui/core/Snackbar'
import Switch                   from '@material-ui/core/Switch'
import TextField                from '@material-ui/core/TextField'
import Typography               from '@material-ui/core/Typography'

import * as adminCreators       from '../../core/actions/actions-admin'

class Admin extends Component {
    constructor(props) {
        super(props)
        this.getAdmins = this.getAdmins.bind(this)
        this.state = {
            address: '',
            storeOwnerAddress: '',
            open: false,
            message: '',
            withdraw: '',
            confirm: false
        }
    }

    componentDidMount() {
        if (this.state.provider) {
            this.getAdmins()
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.provider.web3Provider !== nextProps.provider.web3Provider) {
            this.getAdmins()
        }
        if (this.props.admin.adminTx !== nextProps.admin.adminTx) {
            this.setState({
                message: `Admin added: ${nextProps.admin.adminTx}`,
                open: true
            })
        }
        if (this.props.admin.storeOwnerTx !== nextProps.admin.storeOwnerTx) {
            this.setState({
                message: `New store owner added: ${nextProps.admin.storeOwnerTx}`,
                open: true
            })
        }
        if (this.props.admin.tx !== nextProps.admin.tx) {
            this.setState({
                message: `Withdraw successful. Transaction ID ${nextProps.admin.tx}`,
                open: true
            })
        }
        if (this.props.admin.marketplaceStatus !== nextProps.admin.marketplaceStatus) {
            if (nextProps.admin.caller) {
                this.setState({
                    message: `Marketplace has been set to ${nextProps.admin.marketplaceStatus} by ${nextProps.admin.caller}`,
                    open: true
                })
            }
        }
    }

    getAdmins() {
        const { actions } = this.props
        actions.admin.isAdmin()

    }

    handleChange = name => event => {
        this.setState({
            [name]: event.target.value,
        })
    }

    handleSubmit = () => {
        const { actions } = this.props
        actions.admin.addAdmin('', this.state.address)
        this.setState({
            name: '',
            address: ''
        })
    }

    handleAddStoreOwner = () => {
        const { actions } = this.props
        actions.admin.addStoreOwner(this.state.storeOwnerAddress)
        this.setState({storeOwnerAddress: ''})
    }

    handleClose = () => {
        this.setState({ open: false})
    }

    withdrawFunds = () => {
        const { actions } = this.props
        actions.admin.withdrawFunds(this.state.withdraw)
        this.setState({
            withdraw: '',
            message: 'Transfer in progress...',
            open: true,
            confirm: false,
        })
    }

    handleDialog = () => {
        this.setState({confirm: !this.state.confirm})
    }

    toggleMarketplace = () => {
        const { actions } = this.props
        actions.admin.toggleMarketplace()
    }

    render() {
        if (this.props.admin.isAdmin) {
            return (
                <div style={{ padding: 20 }}>
                    <Grid container spacing={24} style={{ padding: 10, margin: 10 }}>
                        <Grid item xs={4}>
                            <Typography variant="headline" component="h2">
                                Add an admin
                            </Typography>
                            <form noValidate autoComplete="off">
                                <TextField
                                    id="address"
                                    label="Address"
                                    value={this.state.address}
                                    onChange={this.handleChange('address')}
                                />
                                <Button color="primary" onClick={this.handleSubmit}>Add Admin</Button>
                            </form>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="headline" component="h2">
                                Add a new Store Owner
                            </Typography>
                            <form noValidate autoComplete="off">
                                <TextField
                                    id="storeOwnerAddress"
                                    label="Address"
                                    value={this.state.storeOwnerAddress}
                                    onChange={this.handleChange('storeOwnerAddress')}
                                />
                                <Button color="primary" onClick={this.handleAddStoreOwner}>Add Store Owner</Button>
                            </form>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="caption">
                                Funds earned. Click to transfer
                            </Typography>
                            <Chip
                                avatar={<Avatar>Ξ</Avatar>}
                                label={this.props.admin.balance}
                                clickable
                                color="primary"
                                onClick={this.handleDialog}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="caption">
                                Toggle Marketplace status (this will take the Marketplace offline)
                            </Typography>
                            <Switch
                                checked={this.props.admin.marketplaceStatus}
                                onChange={this.toggleMarketplace}
                                value="marketplaceStatus"
                                color="primary"
                            />
                        </Grid>
                    </Grid>
                    <Dialog
                        open={this.state.confirm}
                        onClose={this.handleDialog}
                    >
                        <DialogTitle id="purchase-dialog-title">Amount to withdraw:</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Please enter the amount to withdraw (up to {this.props.admin.balance}:
                            </DialogContentText>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="withdraw"
                                label="Withdraw Amount"
                                type="number"
                                onChange={this.handleChange('withdraw')}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.handleDialog} color="primary">
                                Cancel
                            </Button>
                            <Button onClick={this.withdrawFunds} color="primary">
                                Buy
                            </Button>
                        </DialogActions>
                    </Dialog>
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
                <div style={{ padding: 20 }}>
                    <Card>
                        <Typography>Sorry, this page reserved for admins only.</Typography>
                    </Card>
                </div>
            )
        }
    }
}

Admin.propTypes = {
    history: PropTypes.object,
    provider: PropTypes.object,
    admin: PropTypes.object
}

function mapStateToProps(state) {
    return {
        provider: state.provider,
        admin: state.admin
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            admin: bindActionCreators(adminCreators, dispatch)
        }
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Admin))