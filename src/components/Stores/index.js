import React, { Component }     from 'react'
import PropTypes                from 'prop-types'
import { connect }              from 'react-redux'
import { bindActionCreators }   from 'redux'
import { withRouter }           from 'react-router-dom'

import Avatar                   from '@material-ui/core/Avatar'
import Card                     from '@material-ui/core/Card'
import CardContent              from '@material-ui/core/CardContent'
import Grid                     from '@material-ui/core/Grid'

import ShopItem                 from '../ShopItem'

import * as shopperCreators     from '../../core/actions/actions-shopper'
import { CardHeader } from '../../../node_modules/@material-ui/core';

class Stores extends Component {
    constructor(props) {
        super(props)
        this.state = {
            snackbar: false,
            message: '',
        }
    }

    render() {
        return (
            <div>
                <Card style={{ padding: 5, margin: 5 }}>
                    <CardHeader
                        avatar={
                            <Avatar style={{ backgroundColor: "#ffca28" }}>{this.props.storefront.name[0]}</Avatar>
                        }
                        title={this.props.storefront.name}
                        subheader={this.props.storefront.description}
                    >
                    </CardHeader>
                </Card>
                <CardContent>
                    <Grid container spacing={8} >
                        {this.props.storefront.products.map((product) =>
                            <Grid item xs={6} key={product.productId}>
                                <ShopItem product={product} />
                            </Grid>
                        )}
                    </Grid>
                </CardContent>
            </div>
        )
    }
}

Stores.propTypes = {
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Stores))
