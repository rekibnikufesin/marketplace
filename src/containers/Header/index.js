import React, { Component } from 'react'
import { withRouter }       from 'react-router-dom'
import AppBar               from '@material-ui/core/AppBar'
import Tabs                 from '@material-ui/core/Tabs'
import Tab                  from '@material-ui/core/Tab'

class Header extends Component {
    constructor(props) {
        super(props)
        this.handleChange = this.handleChange.bind(this)
        this.state = {
            currentRoute: '/home'
        }
    }

    componentDidMount() {
        const { pathname } = this.props.location
        this.handleChange(pathname, false)
    }

    componentWillReceiveProps(nextProps) {
        const { pathname } = nextProps.location
        this.handleChange(pathname, false)
    }

    handleChange(pathname, updateURL) {
        const { history } = this.props
        this.setState({currentRoute: updateURL})
        if (updateURL !== false) { 
            history.push(updateURL) 
        }
    }

    render() {
        return (
            <div>
                <AppBar position="static">
                    <Tabs value={this.state.currentRoute} onChange={this.handleChange}>
                        <Tab label="Marketplace" value={'/home'} />
                        <Tab label="Store Owner" value={'/store'} />
                        <Tab label="Admin" value={'/admin'} />
                    </Tabs>
                </AppBar>
            </div>
        )
    }
}

export default withRouter(Header)