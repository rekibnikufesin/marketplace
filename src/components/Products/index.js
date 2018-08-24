import React, { Component }     from 'react'
import PropTypes                from 'prop-types'
import { connect }              from 'react-redux'
import { bindActionCreators }   from 'redux'
import { withRouter }           from 'react-router-dom'

import Avatar                   from '@material-ui/core/Avatar'
import Button                   from '@material-ui/core/Button'
import Card                     from '@material-ui/core/Card'
import CardHeader               from '@material-ui/core/CardHeader'
import CardContent              from '@material-ui/core/CardContent'
import Chip                     from '@material-ui/core/Chip'
import CloseIcon                from '@material-ui/icons/Close'
import EditIcon                 from '@material-ui/icons/CreateTwoTone'
import Grid                     from '@material-ui/core/Grid'
import IconButton               from '@material-ui/core/IconButton'
import Input                    from '@material-ui/core/Input'
import InputAdornment           from '@material-ui/core/InputAdornment'
import InputLabel               from '@material-ui/core/InputLabel'
import Snackbar                 from '@material-ui/core/Snackbar'
import Typography               from '@material-ui/core/Typography'

import * as storeCreators       from '../../core/actions/actions-store'
import { TextField } from '../../../node_modules/@material-ui/core';

const hidden = {
    display: 'none'
}

const shown = {
    display: 'block'
}

class Product extends Component {
    constructor(props) {
        super(props)
        this.state = {
            edit: hidden,
            show: shown,
            productName: this.props.product.name,
            productDesc: this.props.product.desc,
            productPrice: this.props.product.price,
            productInv: this.props.product.inventory,
            snackbar: false,
            message: '',
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.store.updatedProduct !== nextProps.store.updatedProduct) {
            this.setState({
                message: `Product ${nextProps.store.updatedProduct} updated!`,
                snackbar: true
            })
        }
    }

    handleClick = () => {
        this.setState({
            edit: this.state.edit === hidden ? shown : hidden,
            show: this.state.show ===hidden ? shown : hidden,
        })
    }

    handleUpdate = name => event => {
        this.setState({
            [name]: event.target.value,
        })
    }

    handleUpdateProduct = () => {
        const { actions } = this.props
        actions.store.updateProduct(
            this.props.product.productId,
            this.state.productName,
            this.state.productDesc,
            this.state.productInv,
            this.state.productPrice,
        )
        this.setState({
            productName: '',
            productDesc: '',
            productInv: '',
            productPrice: '',
            snackbar: true,
            message: 'Updating product on network...'
        })
        this.handleClick()
    }

    handleSnackbar = () => {
        this.setState({snackbar: false})
    }

    render() {
        return (
            <Grid item xs={10} key={this.props.product.productId}>
                <Card style={{ padding: 5, margin: 5 }}>
                    <CardHeader
                        avatar={
                            <Avatar>{this.props.product.name[0]}</Avatar>
                        }
                        title={this.props.product.name}
                        subheader={`${this.props.product.inventory} in stock`}
                        style={this.state.show}
                    >
                    </CardHeader>
                    <CardContent style={this.state.show}>
                        <Chip label={` ${this.props.product.price} Eth`} color="secondary" />
                        <IconButton
                            onClick={this.handleClick}
                            aria-label="Edit Product"
                        >
                            <EditIcon />
                        </IconButton>
                        <Typography component="p" style={this.state.show} >
                            {this.props.product.desc}
                        </Typography>
                    </CardContent>
                    <CardContent style={this.state.edit}>
                        <TextField
                            id="productName"
                            label="Name"
                            value={this.state.productName}
                            onChange={this.handleUpdate('productName')}
                            margin="normal"
                        />
                        <TextField
                            id="productDesc"
                            label="Description"
                            multiline
                            value={this.state.productDesc}
                            onChange={this.handleUpdate('productDesc')}
                            margin="normal"
                        />
                        <InputLabel htmlFor="productPrice">Price</InputLabel>
                        <Input
                            id="productPrice"
                            value={this.state.productPrice}
                            onChange={this.handleUpdate('productPrice')}
                            startAdornment={<InputAdornment position="start">ETH Ξ</InputAdornment>}
                        />
                        <InputLabel htmlFor="product">Inventory</InputLabel>
                        <Input
                            id="productInv"
                            value={this.state.productInv}
                            onChange={this.handleUpdate('productInv')}
                        />
                        <IconButton
                            onClick={this.handleClick}
                            aria-label="Cancel Edit"
                        >
                            <CloseIcon />
                        </IconButton>
                        <Button onClick={this.handleUpdateProduct} color="primary">
                            Save
                        </Button>
                    </CardContent>
                    <Snackbar
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left'
                        }}
                        open={this.state.snackbar}
                        message={this.state.message}
                        onClose={this.handleSnackbar}
                    />
                </Card>
            </Grid>
        )
    }
}

Product.propTypes = {
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
    return {
        actions: {
            store: bindActionCreators(storeCreators, dispatch)
        }
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Product))