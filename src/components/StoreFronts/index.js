import React, { Component }     from 'react'
import PropTypes                from 'prop-types'
import { connect }              from 'react-redux'
import { bindActionCreators }   from 'redux'
import { withRouter }           from 'react-router-dom'

import AppBar                   from '@material-ui/core/AppBar'
import Avatar                   from '@material-ui/core/Avatar'
import Button                   from '@material-ui/core/Button'
import Card                     from '@material-ui/core/Card'
import CardContent              from '@material-ui/core/CardContent'
import Collapse                 from '@material-ui/core/Collapse'
import CloseIcon                from '@material-ui/icons/Close'
import Dialog                   from '@material-ui/core/Dialog'
import Divider                  from '@material-ui/core/Divider'
import EditIcon                 from '@material-ui/icons/CreateTwoTone'
import ExpandMoreIcon           from '@material-ui/icons/ExpandMore'
import FormControlLabel         from '@material-ui/core/FormControlLabel'
import Grid                     from '@material-ui/core/Grid'
import IconButton               from '@material-ui/core/IconButton'
import Paper                    from '@material-ui/core/Paper'
import Snackbar                 from '@material-ui/core/Snackbar'
import Switch                   from '@material-ui/core/Switch'
import TextField                from '@material-ui/core/TextField'
import Toolbar                  from '@material-ui/core/Toolbar'
import Typography               from '@material-ui/core/Typography'

import Product                  from '../../components/Products'

import * as storeCreators       from '../../core/actions/actions-store'

class StoreFront extends Component {
    constructor(props) {
        super(props)
        this.state = {
            open: false,
            id: '',
            name: '',
            desc: '',
            online: '',
            message: '',
            snackbar: false,
            newProduct: '',
            productDesc: '',
            productPrice: '',
            productInv: '',
            expanded: true,
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.store.storeFrontUpdate !== nextProps.store.storeFrontUpdate) {
            this.setState({
                message: `Store successfully updated with transaction id ${nextProps.store.storeFrontUpdate}. Please refresh your page.`,
                snackbar: true
            })
        }
        if (this.props.store.products !== nextProps.store.products) {
            this.setState({
                message: `Product ${nextProps.store.products} confirmed!`,
                snackbar: true
            })
        }
    }

    handleClick = (storeId, name, desc, online) => event => {
        this.setState({ 
            open: true,
            id: storeId,
            name: name,
            desc: desc,
            online: online
        })
    }

    handleClose = () => {
        this.setState({ open: false })
    }

    handleSave = () => {
        const { actions } = this.props
        actions.store.updateStoreFront(this.state.id, this.state.name, this.state.desc, this.state.online)
        this.setState({ open: false })
    }

    handleUpdate = name => event => {
        this.setState({
            [name]: event.target.value,
        })
    }

    handleOnline = () => event => {
        this.setState({online: event.target.checked })
    }

    handleSnackbar = () => {
        this.setState({snackbar: false})
    }

    handleNewProduct = () => {
        const { actions } = this.props
        actions.store.addProduct(
            this.state.id, this.state.newProduct, this.state.productDesc, this.state.productPrice, this.state.productInv
        )
        this.setState({
            newProduct: '',
            productDesc: '',
            productPrice: '',
            productInv: '',
        })
    }

    handleExpandClick = () =>{
        this.setState(state => ({ expanded: !state.expanded }))
    }

    render() {
        return (
            <div>
                <Paper style={{ padding: 5 }}>
                    <Typography variant="headline" component="h2">
                        {this.props.storefront.name}
                    </Typography>
                    <Typography variant="subheading">
                        {this.props.storefront.description}
                    </Typography>
                    <IconButton aria-label="Edit Icon" 
                        onClick={this.handleClick(
                            this.props.storefront.id, 
                            this.props.storefront.name, 
                            this.props.storefront.description, 
                            this.props.storefront.online
                        )}
                    >
                        <EditIcon />
                    </IconButton>
                </Paper>
                <Dialog
                    fullScreen
                    open={this.state.open}
                    onClose={this.handleClose}
                    scroll="body"
                >
                    <div>
                        <AppBar>
                            <Toolbar>
                                <IconButton onClick={this.handleClose} aria-label="Close">
                                    <CloseIcon />
                                </IconButton>
                                <Typography variant="title">
                                    Store Front Editor
                                </Typography>
                                <Button onClick={this.handleSave}>
                                    Save
                                </Button>
                            </Toolbar>

                        </AppBar>
                            <Card style={{ padding: 10, margin: 10 }}>
                                <Avatar>{this.state.id}</Avatar>
                                <TextField
                                    id="name"
                                    label="Name"
                                    value={this.state.name}
                                    onChange={this.handleUpdate('name')}
                                    margin="normal"
                                />
                                <TextField
                                    id="desc"
                                    label="Description"
                                    multiline
                                    value={this.state.desc}
                                    onChange={this.handleUpdate('desc')}
                                    margin="normal"
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={this.state.online}
                                            onChange={this.handleOnline()}
                                            value="online"
                                        />
                                    }
                                    label="Online"
                                />
                                <IconButton
                                    onClick={this.handleExpandClick}
                                >
                                    <ExpandMoreIcon />
                                </IconButton>
                                <Collapse in={this.state.expanded} unmountOnExit>
                                    <CardContent>
                                        <Typography variant="body1">
                                            Add a new product
                                        </Typography>
                                        <TextField
                                            id="newProduct"
                                            label="Name"
                                            value={this.state.newProduct}
                                            onChange={this.handleUpdate('newProduct')}
                                            margin="normal"
                                        />
                                        <TextField
                                            id="productDesc"
                                            label="Description"
                                            value={this.state.productDesc}
                                            onChange={this.handleUpdate('productDesc')}
                                            margin="normal"
                                        />
                                        <TextField
                                            id="productPrice"
                                            label="Price"
                                            value={this.state.productPrice}
                                            onChange={this.handleUpdate('productPrice')}
                                            margin="normal"
                                        />
                                        <TextField
                                            id="productInv"
                                            label="Inventory"
                                            value={this.state.productInv}
                                            onChange={this.handleUpdate('productInv')}
                                            margin="normal"
                                        />
                                        <Button onClick={this.handleNewProduct}>
                                            Add
                                        </Button>
                                    </CardContent>
                                    <CardContent>
                                        <Grid container spacing={8} >
                                            {this.props.storefront.products.map((product) =>
                                                <Grid item xs={3} key={product.productId}>
                                                    <Product product={product} />
                                                </Grid>
                                            )}
                                        </Grid>
                                    </CardContent>
                                </Collapse>
                            </Card>
                        <Divider />
                    </div>
                </Dialog>
                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    variant="success"
                    open={this.state.snackbar}
                    message={this.state.message}
                    onClose={this.handleSnackbar}
                />
            </div>
        )
    }
}

StoreFront.propTypes = {
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(StoreFront))