import React, { Component }     from 'react'
import PropTypes                from 'prop-types'
import { connect }              from 'react-redux'
import { bindActionCreators }   from 'redux'
import { withRouter }           from 'react-router-dom'

import Avatar                   from '@material-ui/core/Avatar'
import Button                   from '@material-ui/core/Button'
import Card                     from '@material-ui/core/Card'
import CardContent              from '@material-ui/core/CardContent'
import CardHeader               from '@material-ui/core/CardHeader'
import Chip                     from '@material-ui/core/Chip'
import Dialog                   from '@material-ui/core/Dialog'
import DialogActions            from '@material-ui/core/DialogActions'
import DialogContent            from '@material-ui/core/DialogContent'
import DialogContentText        from '@material-ui/core/DialogContentText'
import DialogTitle              from '@material-ui/core/DialogTitle'
import Snackbar                 from '@material-ui/core/Snackbar'
import TextField                from '@material-ui/core/TextField'
import Typography               from '@material-ui/core/Typography'

import * as shopperCreators     from '../../core/actions/actions-shopper'

class ShopItem extends Component {
    constructor(props) {
        super(props)
        this.state = {
            buyLabel: 'Buy',
            message: '',
            snackbar: false,
            quantity: '',
            confirm: false,
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.shopper.product !== nextProps.shopper.product) {
            this.setState({
                buyLabel: 'Buy',
                message: `Purchase complete. Transaction ${nextProps.shopper.product}`,
                snackbar: true
            })
        }
    }

    handleBuy = () => {
        const { actions } = this.props
        actions.shopper.buyItem(this.props.product.productId, this.state.quantity, this.props.product.price)
        this.setState({
            buyLabel: 'Pending...',
            confirm: false,
        })
    }

    handleSnackbar = () => {
        this.setState({snackbar: false})
    }

    handleDialog = () => {
        this.setState({confirm: !this.state.confirm})
    }

    handleUpdate = name => event => {
        this.setState({
            [name]: event.target.value,
        })
    }

    render() {
        return (
            <div>
                <Card>
                    <CardHeader
                        avatar={
                            <Avatar
                                style={{ backgroundColor: "white", color: "#ffd600" }}
                            >
                            {this.props.product.name[0]}</Avatar>
                        }
                        title={this.props.product.name}
                        style={{ backgroundColor: "#ffd600" }}
                    />
                    <CardContent>
                        <Chip label={`${this.props.product.price} Eth`} color="secondary" />
                        <Typography variant="caption">
                            {this.props.product.description}
                        </Typography>
                        <Button onClick={this.handleDialog} color="secondary">
                            {this.state.buyLabel}
                        </Button>
                    </CardContent>
                </Card>
                <Dialog
                    open={this.state.confirm}
                    onClose={this.handleDialog}
                >
                    <DialogTitle id="purchase-dialog-title">Confirm Purchase</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Please enter the quantity to purchase:
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="quantity"
                            label="Quantity"
                            type="number"
                            onChange={this.handleUpdate('quantity')}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleDialog} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={this.handleBuy} color="primary">
                            Buy
                        </Button>
                    </DialogActions>
                </Dialog>
                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    open={this.state.snackbar}
                    message={this.state.message}
                    onClose={this.handleSnackbar}
                />
            </div>
        )
    }
}

ShopItem.propTypes = {
    history: PropTypes.object,
    provider: PropTypes.object,
    store: PropTypes.object
}

function mapStateToProps(state) {
    return {
        provider: state.provider,
        shopper: state.shopper,
    }
}
function mapDispatchToProps(dispatch) {
    return {
        actions: {
            shopper: bindActionCreators(shopperCreators, dispatch)
        }
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ShopItem))
