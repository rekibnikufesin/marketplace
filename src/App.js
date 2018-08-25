import React, { Component }   from 'react'
import PropTypes              from 'prop-types'
import { connect }            from 'react-redux'
import { bindActionCreators}  from 'redux'
import { HashRouter,
        Route,
        Redirect,
        Switch }              from 'react-router-dom'
import Web3                   from 'web3'

import { MuiThemeProvider, createMuiTheme }     from '@material-ui/core/styles'

/* actions */
import * as providerActionCreators from './core/actions/actions-provider'
import * as adminCreators       from './core/actions/actions-admin'
import * as storeCreators       from './core/actions/actions-store'
import * as shopperCreators     from './core/actions/actions-shopper'

/* application containers and components */
import Header                 from 'containers/Header'
import ShoppingPage           from 'containers/ShoppingPage'
import StoreOwner             from 'containers/StoreOwner'
import Admin                  from 'containers/Admin'

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#ffca28'
    },
    secondary: {
      main: '#232f3d'
    }
  }
})

class App extends Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.setProvider()
    if (this.props.provider.web3Provider) {
      this.getMarketplaceStatus()
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.provider.web3Provider !== nextProps.provider.web3Provider) {
      this.getMarketplaceStatus()
      this.getAdmins()
      this.isStoreOwner()
      this.getAllStoreFronts()
  }
    if (this.props.provider.account !== nextProps.provider.account) {
      // account changed, reload provider to set defaultAccount
      this.setProvider()
      this.getAdmins()
      this.isStoreOwner()
      if (this.props.admin.marketplaceStatus) {
        this.getAllStoreFronts()
      }
    }
  }

  setProvider = () => {
    const { actions } = this.props

    // Set the Web3 provider
    if (typeof window.web3 !== 'undefined') {
      const currentProvider = window.web3.currentProvider
      const web3Provider = new Web3(currentProvider)
      actions.provider.setProvider(web3Provider)
      currentProvider.publicConfigStore.on('update', this.changeAddress)
    } else {
      console.log('No web3 provider found...')
    }
  }

  getMarketplaceStatus = () => {
    const { actions } = this.props
    actions.admin.getMarketplaceStatus()
  }

  changeAddress = (change) => {
    if (this.props.provider.account && change.selectedAddress.toLowerCase() !== this.props.provider.account.toLowerCase()) {
      const { actions } = this.props
      actions.provider.updateAddress(change.selectedAddress)
      this.getAdmins()
      this.isStoreOwner()
    }
  }

  getAdmins() {
    const { actions } = this.props
    actions.admin.isAdmin()

}

  isStoreOwner() {
    const { actions } = this.props
    actions.store.isStoreOwner()
}

getAllStoreFronts = () => {
  const { actions } = this.props
  actions.shopper.getAllStoreFronts()
}

  render() {
    return (
      <div style={{ padding: 20 }}>
        <MuiThemeProvider theme={theme}>
          <HashRouter>
            <div>
              <Header />
              <div className="container">
                <div id="main">
                  <Switch>
                    <Route path="/home" 
                      render={(props) => <ShoppingPage {...props} marketplaceStatus={this.props.admin.marketplaceStatus} />}
                    />
                    <Route path="/store" 
                      render={(props) => <StoreOwner {...props} marketplaceStatus={this.props.admin.marketplaceStatus} />}
                    />
                    <Route path="/admin" 
                      render={(props) => <Admin {...props} />}
                    />
                    <Redirect from="/" to="/home" />
                  </Switch>
                </div>
              </div>
            </div>
          </HashRouter>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500" />
        </MuiThemeProvider>
      </div>
    )
  }
}

App.propTypes = {
  actions: PropTypes.object
}

function mapStateToProps(state) {
  return {
    provider: state.provider,
    admin: state.admin,
    store: state.store,
    shopper: state.shopper
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      provider: bindActionCreators(providerActionCreators, dispatch),
      admin: bindActionCreators(adminCreators, dispatch),
      store: bindActionCreators(storeCreators, dispatch),
      shopper: bindActionCreators(shopperCreators, dispatch)
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
